/* eslint-disable @typescript-eslint/naming-convention -- HTTP header names */
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'fs';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';
import { BtApiError } from '../errors/bt-api-error';
import { HttpClientService } from './http-client.service';

/**
 * Before STAB-12 the backup went through the generic JSON path: 2,097,152 bytes sent, 3,801,757 bytes stored, a
 * different SHA-256. Now the body is streamed to disk byte-for-byte.
 */
describe('HttpClientService.postToFile (BeyondTrust backup download)', () => {
    const body = randomBytes(50 * 1024 * 1024);
    let server: Server;
    let handler: (req: IncomingMessage, res: ServerResponse) => void;
    let directory: string;
    let client: HttpClientService;

    const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');

    beforeAll(async () => {
        server = createServer((req, res) => handler(req, res));
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    });

    afterAll(async () => {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    /** The stall test needs a short idle timeout; transfers under full-suite load need a generous one. */
    const createClient = (bodyIdleTimeoutInMs: number) => {
        const port = (server.address() as AddressInfo).port;

        return new HttpClientService(
            {
                beyondTrust: {
                    api: {
                        communication: {
                            retryAttempts: 3,
                            retryDelayInMs: 1,
                            maxRetryAfterInMs: 30000,
                            readTimeoutInMs: 60000,
                            bodyIdleTimeoutInMs,
                        },
                    },
                },
            } as never,
            new HttpService(axios.create({ proxy: false })),
            {
                getAuthToken: jest.fn().mockResolvedValue({ accessToken: 'token', expirationDate: new Date(9e15) }),
                invalidateAuthToken: jest.fn(),
            } as never,
            { execute: jest.fn().mockResolvedValue({ id: 1, apiBaseUrl: `http://127.0.0.1:${port}/api` }) } as never,
        );
    };

    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        directory = mkdtempSync(join(tmpdir(), 'post-to-file-'));
        client = createClient(10000);
    });

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    // heapUsed catches a body that is decoded into a string (the old JSON path); Buffers live outside the heap,
    // so collecting the body in memory is caught by the next test.
    it('stores a 50 MB binary body byte-for-byte without decoding it into the heap', async () => {
        handler = (_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': body.length });
            res.end(body);
        };
        const target = join(directory, 'backup.nsb');
        global.gc?.();
        const heapBefore = process.memoryUsage().heapUsed;

        const result = await client.postToFile('tx', 1, '/backup', {}, target);

        const heapGrowthMb = (process.memoryUsage().heapUsed - heapBefore) / 1024 / 1024;
        expect(result.bytes).toBe(body.length);
        expect(sha256(readFileSync(target))).toBe(sha256(body));
        expect(heapGrowthMb).toBeLessThan(10);
        expect(readdirSync(directory)).toEqual(['backup.nsb']);
    }, 60000);

    it('writes the body to disk while it arrives instead of collecting it in memory first', async () => {
        let writtenBeforeEnd = 0;
        handler = (_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': body.length });
            res.write(body.subarray(0, 8 * 1024 * 1024));
            // Only send the rest once part of the body has reached the temporary file.
            const startedAt = Date.now();
            const poll = setInterval(() => {
                const partFile = readdirSync(directory).find((file) => file.endsWith('.part'));
                writtenBeforeEnd = partFile ? statSync(join(directory, partFile)).size : 0;

                if (writtenBeforeEnd > 0 || Date.now() - startedAt > 5000) {
                    clearInterval(poll);
                    res.end(body.subarray(8 * 1024 * 1024));
                }
            }, 20);
        };
        const target = join(directory, 'backup.nsb');

        const result = await client.postToFile('tx', 1, '/backup', {}, target);

        expect(writtenBeforeEnd).toBeGreaterThan(0);
        expect(result.bytes).toBe(body.length);
        expect(sha256(readFileSync(target))).toBe(sha256(body));
    }, 60000);

    it('leaves no file behind when the connection breaks during the body', async () => {
        handler = (_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': body.length });
            res.write(body.subarray(0, 1024 * 1024));
            setTimeout(() => res.destroy(), 50);
        };
        const target = join(directory, 'backup.nsb');

        const error = await client.postToFile('tx', 1, '/backup', {}, target).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(BtApiError);
        expect((error as BtApiError).ambiguousWriteOutcome).toBe(true);
        expect(existsSync(target)).toBe(false);
        expect(readdirSync(directory)).toEqual([]);
    }, 60000);

    it('fails a body that stalls instead of waiting forever, and leaves no file behind', async () => {
        client = createClient(300);
        let socketClosed = false;
        handler = (req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': body.length });
            res.write(body.subarray(0, 64 * 1024)); // then nothing; the test client has no axios timeout at all
            req.socket.on('close', () => (socketClosed = true));
        };
        const target = join(directory, 'backup.nsb');
        const startedAt = Date.now();

        const error = await client.postToFile('tx', 1, '/backup', {}, target).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(BtApiError);
        expect((error as BtApiError).describe()).toMatch(/Transient.*no data for 300 ms/);
        expect((error as BtApiError).ambiguousWriteOutcome).toBe(true);
        expect(Date.now() - startedAt).toBeLessThan(5000);
        expect(readdirSync(directory)).toEqual([]);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(socketClosed).toBe(true);
    }, 60000);

    it('does not repeat the backup request after a gateway timeout', async () => {
        let requests = 0;
        handler = (_req, res) => {
            requests++;
            res.writeHead(504, { 'Content-Type': 'application/json' });
            res.end('{"message":"Gateway Timeout"}');
        };

        const error = await client
            .postToFile('tx', 1, '/backup', {}, join(directory, 'backup.nsb'))
            .catch((e: unknown) => e);

        expect(requests).toBe(1);
        expect((error as BtApiError).getStatus()).toBe(504);
        expect(readdirSync(directory)).toEqual([]);
    }, 60000);
});
