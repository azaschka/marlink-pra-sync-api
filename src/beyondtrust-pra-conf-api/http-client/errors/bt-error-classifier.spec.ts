/* eslint-disable @typescript-eslint/naming-convention -- HTTP header and BeyondTrust query parameter names */
import { AxiosError, AxiosHeaders, AxiosResponse, CanceledError, InternalAxiosRequestConfig } from 'axios';
import { BtApiError, BtApiErrorKind } from './bt-api-error';
import { BtErrorClassifier, BtRequestContext } from './bt-error-classifier';

const SQUID_PAGE = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html><head><meta type="copyright" content="Copyright (C) 1996-2020 The Squid Software Foundation and contributors">
<title>ERROR: The requested URL could not be retrieved</title><style type="text/css"><!-- body { color: #000 } --></style>
</head><body><h1>ERROR</h1><p>Connection to 2001:db8::1 failed.</p></body></html>`;

const context: BtRequestContext = { method: 'GET', path: '/config/v1/user', beyondtrustInstanceId: 7, attempts: 1 };

function responseError(status: number, data: unknown, headers: Record<string, string> = {}): AxiosError {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    const response = {
        status,
        statusText: '',
        data,
        headers: new AxiosHeaders(headers),
        config,
    } as AxiosResponse;

    return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, {}, response);
}

function networkError(code: string, message: string): AxiosError {
    return new AxiosError(message, code, { headers: new AxiosHeaders() } as InternalAxiosRequestConfig, {});
}

describe('BtErrorClassifier', () => {
    it.each([
        {
            name: 'JSON 404',
            error: responseError(404, { message: 'Document Not Found' }),
            kind: BtApiErrorKind.NotFound,
        },
        {
            name: 'HTML 404 from an ingress',
            error: responseError(404, '<html><title>404 Not Found</title></html>', { 'content-type': 'text/html' }),
            kind: BtApiErrorKind.UnexpectedResponse,
        },
        {
            name: 'HTML 503 from Squid without error header',
            error: responseError(503, SQUID_PAGE),
            kind: BtApiErrorKind.UnexpectedResponse,
        },
        {
            name: 'HTML 503 from Squid with ERR_CONNECT_FAIL',
            error: responseError(503, SQUID_PAGE, { 'X-Squid-Error': 'ERR_CONNECT_FAIL 101' }),
            kind: BtApiErrorKind.ProxyConnectFailure,
        },
        {
            name: 'HTML 503 from Squid with ERR_DNS_FAIL',
            error: responseError(503, SQUID_PAGE, { 'x-squid-error': 'ERR_DNS_FAIL 0' }),
            kind: BtApiErrorKind.ProxyConnectFailure,
        },
        {
            name: 'HTML 504 from Squid with ERR_READ_TIMEOUT (request was forwarded)',
            error: responseError(504, SQUID_PAGE, { 'x-squid-error': 'ERR_READ_TIMEOUT 0' }),
            kind: BtApiErrorKind.UnexpectedResponse,
        },
        { name: 'JSON 503', error: responseError(503, { message: 'maintenance' }), kind: BtApiErrorKind.Transient },
        { name: 'JSON 502', error: responseError(502, { message: 'bad gateway' }), kind: BtApiErrorKind.Transient },
        { name: 'JSON 500', error: responseError(500, { message: 'boom' }), kind: BtApiErrorKind.ServerError },
        {
            name: '401',
            error: responseError(401, { message: 'Access token is expired.', error: 'access_denied' }),
            kind: BtApiErrorKind.Unauthorized,
        },
        { name: '429', error: responseError(429, { message: 'slow down' }), kind: BtApiErrorKind.RateLimited },
        {
            name: '422',
            error: responseError(422, { message: 'Name already exists' }),
            kind: BtApiErrorKind.ClientError,
        },
        { name: 'ECONNRESET', error: networkError('ECONNRESET', 'socket hang up'), kind: BtApiErrorKind.Transient },
        {
            name: 'axios timeout',
            error: networkError('ECONNABORTED', 'timeout of 60000ms exceeded'),
            kind: BtApiErrorKind.Transient,
        },
        {
            name: 'aborted response stream',
            error: networkError('ERR_BAD_RESPONSE', 'stream has been aborted'),
            kind: BtApiErrorKind.Transient,
        },
        { name: 'cancellation', error: new CanceledError('canceled'), kind: BtApiErrorKind.Cancelled },
        { name: 'non-axios error', error: new TypeError('x is undefined'), kind: BtApiErrorKind.UnexpectedResponse },
    ])('classifies $name as $kind', ({ error, kind }) => {
        expect(BtErrorClassifier.classify(error, context).kind).toBe(kind);
    });

    it('classifies any failure as cancelled once the caller aborted', () => {
        const error = BtErrorClassifier.classify(networkError('ECONNRESET', 'aborted'), { ...context, aborted: true });

        expect(error.kind).toBe(BtApiErrorKind.Cancelled);
    });

    it.each([
        { code: 'ECONNREFUSED', notSent: true },
        { code: 'ENOTFOUND', notSent: true },
        { code: 'EAI_AGAIN', notSent: true },
        { code: 'ECONNRESET', notSent: false },
        { code: 'ECONNABORTED', notSent: false },
    ])('marks $code as notSent=$notSent', ({ code, notSent }) => {
        expect(BtErrorClassifier.classify(networkError(code, code), context).notSent).toBe(notSent);
    });

    it('keeps the BeyondTrust JSON body and status for existing callers', () => {
        const error = BtErrorClassifier.classify(responseError(422, { message: 'Name already exists' }), context);

        expect(error).toBeInstanceOf(BtApiError);
        expect(error.getStatus()).toBe(422);
        expect(error.getResponse()).toEqual({ message: 'Name already exists' });
        expect(error.message).toBe('Name already exists');
    });

    it('keeps the message of a JSON 404 that the relation scan compares against', () => {
        const error = BtErrorClassifier.classify(responseError(404, { message: 'Document Not Found' }), context);

        expect(error.message).toBe('Document Not Found');
        expect(error.getStatus()).toBe(404);
    });

    it('replaces an HTML body by its title, bounded, and never returns the page', () => {
        const error = BtErrorClassifier.classify(
            responseError(503, SQUID_PAGE, { 'x-squid-error': 'ERR_CONNECT_FAIL 101' }),
            context,
        );

        expect(error.snippet).toBe('HTML page "ERROR: The requested URL could not be retrieved"');
        expect(error.squidError).toBe('ERR_CONNECT_FAIL 101');
        expect(JSON.stringify(error.getResponse())).not.toContain('<html');
        expect(error.describe()).not.toContain('<');
        expect(error.describe().length).toBeLessThan(300);
    });

    it('bounds the JSON message to 300 characters', () => {
        const error = BtErrorClassifier.classify(responseError(400, { message: 'x'.repeat(5000) }), context);

        expect(error.snippet.length).toBeLessThanOrEqual(301);
    });

    it('parses Retry-After in seconds and as an HTTP date', () => {
        const seconds = BtErrorClassifier.classify(responseError(429, {}, { 'retry-after': '5' }), context);
        const date = BtErrorClassifier.classify(
            responseError(429, {}, { 'retry-after': new Date(Date.now() + 10000).toUTCString() }),
            context,
        );

        expect(seconds.retryAfterInMs).toBe(5000);
        expect(date.retryAfterInMs).toBeGreaterThan(8000);
        expect(date.retryAfterInMs).toBeLessThanOrEqual(10000);
    });

    it('decodes a binary error body', () => {
        const error = BtErrorClassifier.classify(
            responseError(404, Buffer.from(JSON.stringify({ message: 'Document Not Found' }))),
            context,
        );

        expect(error.kind).toBe(BtApiErrorKind.NotFound);
    });
});
