/* eslint-disable @typescript-eslint/naming-convention -- HTTP header and BeyondTrust query parameter names */
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { RetryUtility } from '../../../shared/utilities';
import { AuthTokenService } from '../../auth/services/auth-token.service';
import { BtApiError, BtApiErrorKind } from '../errors/bt-api-error';
import { HttpClientService } from './http-client.service';

const SQUID_PAGE = `<!DOCTYPE html><html><head><title>ERROR: The requested URL could not be retrieved</title></head>
<body><p>The following error was encountered while trying to retrieve the URL</p></body></html>`;

type Handler = (req: IncomingMessage, res: ServerResponse, requestNumber: number) => void;

describe('HttpClientService against a local BeyondTrust stub', () => {
    let server: Server;
    let handler: Handler;
    let requests: { method?: string; url?: string; authorization?: string }[];
    let virtualDelays: number[];
    let logged: string[];
    let authTokenService: { getAuthToken: jest.Mock; invalidateAuthToken: jest.Mock };
    let communication: {
        retryAttempts: number;
        retryDelayInMs: number;
        maxRetryAfterInMs: number;
        readTimeoutInMs: number;
    };
    let client: HttpClientService;

    beforeAll(async () => {
        server = createServer((req, res) => {
            requests.push({ method: req.method, url: req.url, authorization: req.headers.authorization });
            handler(req, res, requests.length);
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    beforeEach(() => {
        requests = [];
        virtualDelays = [];
        logged = [];
        jest.spyOn(RetryUtility, 'delay').mockImplementation((ms: number) => {
            virtualDelays.push(ms);

            return Promise.resolve();
        });
        for (const level of ['warn', 'error', 'debug'] as const) {
            jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => {
                logged.push(String(args[0]));
            });
        }

        let tokenNumber = 0;
        authTokenService = {
            getAuthToken: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ accessToken: `secret-token-${++tokenNumber}`, expirationDate: new Date(9e15) }),
                ),
            invalidateAuthToken: jest.fn(),
        };
        communication = { retryAttempts: 3, retryDelayInMs: 1000, maxRetryAfterInMs: 30000, readTimeoutInMs: 60000 };
        client = createClient(authTokenService);
    });

    /** A client for the stub, with a mocked token service or a real one that fetches tokens from the stub. */
    const createClient = (tokens: unknown) => {
        const port = (server.address() as AddressInfo).port;

        return new HttpClientService(
            { beyondTrust: { api: { communication } } } as never,
            new HttpService(axios.create({ proxy: false })),
            tokens as never,
            {
                execute: jest.fn().mockResolvedValue({
                    id: 3,
                    apiBaseUrl: `http://127.0.0.1:${port}/api/config/v1`,
                    authClientId: 'client',
                    authClientSecret: 'client-secret-value',
                    oauth2TokenUrl: `http://127.0.0.1:${port}/oauth2/token`,
                }),
            } as never,
        );
    };
    const realTokenService = () => new AuthTokenService(new HttpService(axios.create({ proxy: false })));

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const reply = (status: number, body: unknown, headers: Record<string, string> = {}): Handler => {
        return (_req, res) => {
            const isText = typeof body === 'string';
            res.writeHead(status, { 'Content-Type': isText ? 'text/html' : 'application/json', ...headers });
            res.end(isText ? body : JSON.stringify(body));
        };
    };

    const tokenAnswer = reply(200, { access_token: 'token-1', expires_in: 3600, token_type: 'Bearer' });
    const isTokenRequest = (req: IncomingMessage) => req.url?.startsWith('/oauth2/token') ?? false;
    const apiRequests = () => requests.filter((request) => request.url?.startsWith('/api'));

    const failure = (promise: Promise<unknown>) =>
        promise.then(
            () => {
                throw new Error('expected the call to fail');
            },
            (error: unknown) => error as BtApiError,
        );

    it('sends at most 4 requests for an HTML 503 page and waits at most 7 s plus jitter', async () => {
        handler = reply(503, SQUID_PAGE);

        const error = await failure(client.get(Object, 'tx', 3, '/jump-client', { per_page: 100, current_page: 1 }));

        expect(requests).toHaveLength(4);
        expect(error.kind).toBe(BtApiErrorKind.UnexpectedResponse);
        expect(error.getStatus()).toBe(503);
        expect(virtualDelays).toHaveLength(3);
        expect(virtualDelays.reduce((sum, delay) => sum + delay, 0)).toBeLessThanOrEqual(7000 * 1.2);
    });

    it('does not retry a JSON 404 and does not log it as an error', async () => {
        handler = reply(404, { message: 'Document Not Found' });

        const error = await failure(client.get(Object, 'tx', 3, '/user'));

        expect(requests).toHaveLength(1);
        expect(error.kind).toBe(BtApiErrorKind.NotFound);
        expect(error.message).toBe('Document Not Found');
        expect(logged).toHaveLength(1); // the debug line only
    });

    it('refreshes the token exactly once on 401 and retries with the new token', async () => {
        handler = (req, res, requestNumber) =>
            requestNumber === 1
                ? reply(401, { message: 'Access token is expired.', error: 'access_denied' })(req, res, requestNumber)
                : reply(200, { id: 1 })(req, res, requestNumber);

        await client.get(Object, 'tx', 3, '/user/1');

        expect(requests.map((request) => request.authorization)).toEqual([
            'Bearer secret-token-1',
            'Bearer secret-token-2',
        ]);
        expect(authTokenService.invalidateAuthToken).toHaveBeenCalledTimes(1);
        expect(virtualDelays).toEqual([0]);
    });

    it('waits for Retry-After on 429', async () => {
        handler = (req, res, requestNumber) =>
            requestNumber === 1
                ? reply(429, { message: 'Too many requests' }, { 'Retry-After': '5' })(req, res, requestNumber)
                : reply(200, [])(req, res, requestNumber);

        await client.get(Object, 'tx', 3, '/user');

        expect(requests).toHaveLength(2);
        expect(virtualDelays).toEqual([5000]);
    });

    it('sends a POST answered with 504 exactly once and reports the outcome as unknown', async () => {
        handler = reply(504, { message: 'Gateway Timeout' });

        const error = await failure(client.post(Object, 'tx', 3, '/user', { username: 'new-user' }));

        expect(requests).toHaveLength(1);
        expect(error.ambiguousWriteOutcome).toBe(true);
        expect(logged.join('\n')).toContain('outcome unknown, not repeated');
    });

    it('retries a POST when the proxy reports that it could not connect', async () => {
        handler = (req, res, requestNumber) =>
            requestNumber === 1
                ? reply(503, SQUID_PAGE, { 'X-Squid-Error': 'ERR_CONNECT_FAIL 101' })(req, res, requestNumber)
                : reply(201, { id: 9 })(req, res, requestNumber);

        await client.post(Object, 'tx', 3, '/user', { username: 'new-user' });

        expect(requests).toHaveLength(2);
    });

    it('applies the read timeout to GET requests', async () => {
        communication.readTimeoutInMs = 200;
        communication.retryAttempts = 0;
        handler = () => undefined; // never answers

        const error = await failure(client.get(Object, 'tx', 3, '/user'));

        expect(error.kind).toBe(BtApiErrorKind.Transient);
        expect(error.code).toBe('ECONNABORTED');
    });

    it('keeps the log output bounded and free of tokens, secrets and HTML', async () => {
        handler = reply(503, SQUID_PAGE);

        await failure(client.get(Object, 'tx', 3, '/jump-client'));

        const output = logged.join('\n');
        expect(logged).toHaveLength(4); // three retry warnings, one final error
        expect(output).not.toMatch(/Bearer|secret-token|client-secret-value|<html|<title/i);
        expect(Math.max(...logged.map((line) => line.length))).toBeLessThan(400);
    });
    it('refreshes the token once when parallel requests fail with 401 for the same expired token', async () => {
        let issuedTokens = 0;
        let tokenRequests = 0;
        handler = (req, res) => {
            if (req.url?.startsWith('/oauth2/token')) {
                tokenRequests++;
                const accessToken = `token-${++issuedTokens}`;
                // Answer token requests with a short delay so that parallel refreshes would overlap.
                setTimeout(
                    () =>
                        reply(200, { access_token: accessToken, expires_in: 3600, token_type: 'Bearer' })(req, res, 0),
                    20,
                );

                return;
            }

            if (req.headers.authorization === 'Bearer token-1') {
                reply(401, { message: 'Access token is expired.', error: 'access_denied' })(req, res, 0);

                return;
            }

            reply(200, { ok: true })(req, res, 0);
        };
        const realTokenClient = createClient(realTokenService());

        await Promise.all(Array.from({ length: 5 }, () => realTokenClient.get(Object, 'tx', 3, '/user')));

        expect(tokenRequests).toBe(2); // the initial token and exactly one refresh
        expect(apiRequests()).toHaveLength(10);
    });

    describe('failures of the token request', () => {
        it('retries a POST whose token request failed, because the POST itself was not sent', async () => {
            let tokenRequests = 0;
            handler = (req, res, requestNumber) => {
                if (isTokenRequest(req)) {
                    return ++tokenRequests === 1
                        ? reply(503, SQUID_PAGE)(req, res, requestNumber)
                        : tokenAnswer(req, res, requestNumber);
                }

                reply(201, { id: 9 })(req, res, requestNumber);
            };

            await createClient(realTokenService()).post(Object, 'tx', 3, '/user', { username: 'new-user' });

            expect(tokenRequests).toBe(2);
            expect(apiRequests()).toHaveLength(1);
            expect(logged.join('\n')).toContain('BeyondTrust POST OAuth2 token endpoint');
            expect(logged.join('\n')).not.toContain('outcome unknown');
        });

        it('reports a token endpoint that answers 404 as a client error that was not sent', async () => {
            handler = (req, res, requestNumber) =>
                isTokenRequest(req)
                    ? reply(404, { message: 'Not Found' })(req, res, requestNumber)
                    : reply(201, { id: 9 })(req, res, requestNumber);

            const error = await failure(
                createClient(realTokenService()).post(Object, 'tx', 3, '/user', { username: 'new-user' }),
            );

            expect(apiRequests()).toHaveLength(0);
            expect(error.kind).toBe(BtApiErrorKind.ClientError);
            expect(error.notSent).toBe(true);
            expect(error.ambiguousWriteOutcome).toBe(false);
        });
    });
});
