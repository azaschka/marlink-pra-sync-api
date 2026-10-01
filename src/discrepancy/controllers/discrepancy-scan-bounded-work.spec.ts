/* eslint-disable @typescript-eslint/naming-convention -- BeyondTrust query parameter names */
/**
 * Regression tests for the retry cascade and the cycle budget over the real code path:
 * DiscrepancyScannerController -> ScanDiscrepancyCommandHandler -> DiscrepancyScannerService ->
 * HttpClientService (real axios over a real socket). A local HTTP server plays BeyondTrust or the proxy.
 *
 * Before STAB-05 one entity type answered with an HTML 503 caused 270 requests and about 1,533 s of waiting
 * (HTTP 6 x 5 s, page 3 x 10 s, command 3 x 10 s, entity type 5 x 2 s), and nothing aborted a scan.
 */
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { HttpClientService } from '../../beyondtrust-pra-conf-api/http-client/services/http-client.service';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { RetryUtility } from '../../shared/utilities';
import { ScanDiscrepancyCommandHandler } from '../commands/handlers/scan-discrepancy.command-handler';
import { ScanDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyScanCycleService } from '../services/discrepancy-scan-cycle.service';
import { DiscrepancyScannerService } from '../services/discrepancy-scanner.service';
import { ScanCoordinatorService } from '../services/scan-coordinator.service';
import { DiscrepancyScannerController } from './discrepancy-scanner.controller';

const SQUID_PAGE = `<!DOCTYPE html><html><head><title>ERROR: The requested URL could not be retrieved</title></head>
<body><p>Connection to 2001:db8::1 failed.</p></body></html>`;

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

describe('Discrepancy scan: bounded retries and cycle budget', () => {
    let server: Server;
    let handler: Handler;
    let requests: number;
    let abortedRequests: number;
    let virtualDelays: number[];
    let repository: {
        findManyByEntityType: jest.Mock;
        createOrUpdateById: jest.Mock;
        deleteByLastModificationDateBefore: jest.Mock;
    };
    let eventBus: { publish: jest.Mock };
    let controller: DiscrepancyScannerController;

    const createController = (cycleBudgetInMs: number) => {
        const port = (server.address() as AddressInfo).port;
        const appConfigService = {
            beyondTrust: {
                api: {
                    communication: {
                        retryAttempts: 3,
                        retryDelayInMs: 1000,
                        maxRetryAfterInMs: 30000,
                        readTimeoutInMs: 60000,
                    },
                },
            },
            discrepancy: {
                maxBatchSize: 100,
                scan: {
                    cycleBudgetInMs,
                    relationScanConcurrency: 2,
                    autoSyncConcurrency: 3,
                    backgroundQueueCapacity: 5000,
                    distributedLockEnabled: false,
                },
            },
            databaseMaxConnections: 50,
        } as unknown as AppConfigService;
        const httpClientService = new HttpClientService(
            appConfigService,
            new HttpService(axios.create({ proxy: false })),
            {
                getAuthToken: jest.fn().mockResolvedValue({ accessToken: 'token', expirationDate: new Date(9e15) }),
                invalidateAuthToken: jest.fn(),
            } as never,
            { execute: jest.fn().mockResolvedValue({ id: 1, apiBaseUrl: `http://127.0.0.1:${port}/api` }) } as never,
        );
        const strategy = {
            btRetrieveFunc: (transactionId: string, tenantId: number, pageSize: number, pageNumber: number) =>
                httpClientService.get(Object, transactionId, tenantId, '/config/v1/jump-client', {
                    per_page: pageSize,
                    current_page: pageNumber,
                }),
            dbRetrieveFunc: jest.fn().mockResolvedValue([]),
            btOmittedPropsForDuplicateCheck: [],
            trimmedProps: [],
            btToDbEntity: (data: unknown) => data,
        };
        const scanHandler = new ScanDiscrepancyCommandHandler(
            appConfigService,
            { get: () => strategy } as never,
            repository as never,
            new DiscrepancyScannerService(appConfigService),
            eventBus as never,
        );
        const commandBus = { execute: (command: ScanDiscrepancyCommand) => scanHandler.execute(command) };
        const coordinator = new ScanCoordinatorService(
            appConfigService,
            { tryAcquire: () => Promise.resolve({ release: () => Promise.resolve() }) } as never,
            new ResourceReportRegistry(),
        );

        return new DiscrepancyScannerController(
            {} as never,
            new DiscrepancyScanCycleService(commandBus as never, appConfigService, coordinator),
        );
    };

    beforeAll(async () => {
        server = createServer((req, res) => {
            requests++;
            res.on('close', () => {
                if (!res.writableEnded) {
                    abortedRequests++;
                }
            });
            handler(req, res);
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    });

    afterAll(async () => {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    beforeEach(() => {
        requests = 0;
        abortedRequests = 0;
        virtualDelays = [];
        repository = {
            findManyByEntityType: jest.fn().mockResolvedValue([]),
            createOrUpdateById: jest.fn().mockResolvedValue(undefined),
            deleteByLastModificationDateBefore: jest.fn().mockResolvedValue(undefined),
        };
        eventBus = { publish: jest.fn() };
        // Waits are recorded, not slept (virtual time).
        jest.spyOn(RetryUtility, 'delay').mockImplementation((ms: number) => {
            virtualDelays.push(ms);

            return Promise.resolve();
        });
        for (const level of ['log', 'warn', 'error', 'debug'] as const) {
            jest.spyOn(Logger.prototype, level).mockImplementation(() => undefined);
        }
        for (const level of ['log', 'warn', 'error'] as const) {
            jest.spyOn(console, level).mockImplementation(() => undefined);
        }
    });

    afterEach(() => {
        jest.restoreAllMocks();
        server.closeAllConnections();
    });

    it('sends at most 4 requests and waits at most 7 s plus jitter for one entity type behind an HTML 503', async () => {
        handler = (_req, res) => {
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.end(SQUID_PAGE);
        };
        controller = createController(20 * 60 * 1000);

        await controller.scanDiscrepancies('tx', 1, DiscrepancyEntityType.JumpClient);

        const retryDelays = virtualDelays.filter((delay) => delay >= 1000);
        expect(requests).toBe(4);
        expect(retryDelays).toHaveLength(3);
        expect(retryDelays.reduce((sum, delay) => sum + delay, 0)).toBeLessThanOrEqual(7000 * 1.2);
        expect(repository.deleteByLastModificationDateBefore).not.toHaveBeenCalled();
    });

    it('aborts the in-flight request when the cycle budget expires and starts no further requests', async () => {
        handler = () => undefined; // BeyondTrust never answers
        controller = createController(300);
        const startedAt = Date.now();

        const overviews = await controller.scanAllDiscrepancies('tx', 1);

        expect(Date.now() - startedAt).toBeLessThan(5000);
        expect(requests).toBe(1);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(abortedRequests).toBe(1);
        expect(overviews).toHaveLength(14);
        // Incomplete data: no cleanup and no event, so neither relation scans nor auto-sync run.
        expect(repository.deleteByLastModificationDateBefore).not.toHaveBeenCalled();
        expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('does not clean up or publish when the budget expires between fetch and cleanup', async () => {
        handler = (_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
        };
        repository.findManyByEntityType.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve([]), 400)),
        );
        controller = createController(200);

        await controller.scanDiscrepancies('tx', 1, DiscrepancyEntityType.User).catch(() => undefined);

        expect(repository.deleteByLastModificationDateBefore).not.toHaveBeenCalled();
        expect(eventBus.publish).not.toHaveBeenCalled();
    });
    it('stops after 3 types when the instance answers 404 for every list endpoint (PP case)', async () => {
        handler = (_req, res) => {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Document Not Found' }));
        };
        controller = createController(20 * 60 * 1000);

        const overviews = await controller.scanAllDiscrepancies('tx', 1);

        // Before: 45 requests and about 408 s of waiting per entity type, for all 14 types.
        expect(requests).toBe(3);
        expect(
            overviews.filter((o) => o.state === DiscrepancyScanState.Failed && o.failureKind === 'NotFound'),
        ).toHaveLength(3);
        expect(
            overviews.filter(
                (o) => o.state === DiscrepancyScanState.Skipped && o.failureKind === 'InstanceUnavailable',
            ),
        ).toHaveLength(11);
        expect(repository.deleteByLastModificationDateBefore).not.toHaveBeenCalled();
        expect(eventBus.publish).not.toHaveBeenCalled();
    });
});
