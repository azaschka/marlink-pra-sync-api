import { BtApiError, BtApiErrorKind } from '../errors/bt-api-error';
import { BtRetryPolicy, BtRetryState } from './bt-retry-policy';

function error(
    kind: BtApiErrorKind,
    method = 'GET',
    extra: { httpStatus?: number; retryAfterInMs?: number; notSent?: boolean } = {},
): BtApiError {
    return new BtApiError({
        kind,
        method,
        path: '/config/v1/user',
        beyondtrustInstanceId: 1,
        attempts: 1,
        snippet: '',
        notSent: extra.notSent ?? false,
        httpStatus: extra.httpStatus,
        retryAfterInMs: extra.retryAfterInMs,
    });
}

/** Runs the policy for a request that fails with the same error on every attempt. */
function simulate(policy: BtRetryPolicy, create: () => BtApiError): { attempts: number; delays: number[] } {
    const state: BtRetryState = BtRetryPolicy.initialState();
    const delays: number[] = [];

    for (let attempt = 1; ; attempt++) {
        const decision = policy.decide(create(), state);

        if (!decision.retry) {
            return { attempts: attempt, delays };
        }

        delays.push(decision.delayInMs);
    }
}

describe('BtRetryPolicy', () => {
    const noJitter = () => 0;
    const policy = new BtRetryPolicy({ maxRetries: 3, baseDelayInMs: 1000, maxRetryAfterInMs: 30000 }, noJitter);

    it.each([BtApiErrorKind.Transient, BtApiErrorKind.ProxyConnectFailure])(
        'retries a GET failing with %s at most 3 times with 1 s, 2 s, 4 s backoff',
        (kind) => {
            expect(simulate(policy, () => error(kind))).toEqual({ attempts: 4, delays: [1000, 2000, 4000] });
        },
    );

    it('retries an HTML 503 for reads (at most 7 s of waiting without jitter)', () => {
        const result = simulate(policy, () => error(BtApiErrorKind.UnexpectedResponse, 'GET', { httpStatus: 503 }));

        expect(result.attempts).toBe(4);
        expect(result.delays.reduce((sum, delay) => sum + delay, 0)).toBe(7000);
    });

    it('adds at most 20 % jitter', () => {
        const maxJitter = new BtRetryPolicy({ maxRetries: 3, baseDelayInMs: 1000, maxRetryAfterInMs: 30000 }, () => 1);

        expect(simulate(maxJitter, () => error(BtApiErrorKind.Transient)).delays).toEqual([1200, 2400, 4800]);
    });

    it.each([
        { kind: BtApiErrorKind.NotFound, httpStatus: 404 },
        { kind: BtApiErrorKind.ClientError, httpStatus: 400 },
        { kind: BtApiErrorKind.Cancelled, httpStatus: undefined },
        { kind: BtApiErrorKind.UnexpectedResponse, httpStatus: 404 },
        { kind: BtApiErrorKind.UnexpectedResponse, httpStatus: undefined },
    ])('does not retry $kind (status $httpStatus)', ({ kind, httpStatus }) => {
        expect(simulate(policy, () => error(kind, 'GET', { httpStatus })).attempts).toBe(1);
    });

    it('retries a server error once', () => {
        expect(simulate(policy, () => error(BtApiErrorKind.ServerError, 'GET', { httpStatus: 500 })).attempts).toBe(2);
    });

    it('refreshes the token once on 401 and retries immediately', () => {
        const state = BtRetryPolicy.initialState();

        expect(policy.decide(error(BtApiErrorKind.Unauthorized), state)).toEqual({
            retry: true,
            delayInMs: 0,
            refreshToken: true,
        });
        expect(policy.decide(error(BtApiErrorKind.Unauthorized), state).retry).toBe(false);
    });

    it('waits for Retry-After on 429', () => {
        const decision = policy.decide(
            error(BtApiErrorKind.RateLimited, 'GET', { retryAfterInMs: 5000 }),
            BtRetryPolicy.initialState(),
        );

        expect(decision).toEqual({ retry: true, delayInMs: 5000, refreshToken: false });
    });

    it('does not wait for a Retry-After beyond the limit', () => {
        const decision = policy.decide(
            error(BtApiErrorKind.RateLimited, 'GET', { retryAfterInMs: 120000 }),
            BtRetryPolicy.initialState(),
        );

        expect(decision.retry).toBe(false);
    });

    it('keeps the total of 4 attempts across mixed failures', () => {
        const state = BtRetryPolicy.initialState();
        const sequence = [
            error(BtApiErrorKind.Unauthorized),
            error(BtApiErrorKind.Transient),
            error(BtApiErrorKind.ServerError, 'GET', { httpStatus: 500 }),
            error(BtApiErrorKind.Transient),
        ];

        expect(sequence.map((failure) => policy.decide(failure, state).retry)).toEqual([true, true, true, false]);
    });

    describe('writes', () => {
        it.each(['POST', 'PATCH'])(
            'does not repeat a %s answered with 504 and marks the outcome ambiguous',
            (method) => {
                const failure = error(BtApiErrorKind.Transient, method, { httpStatus: 504 });

                expect(policy.decide(failure, BtRetryPolicy.initialState()).retry).toBe(false);
                expect(failure.ambiguousWriteOutcome).toBe(true);
            },
        );

        it.each([
            { name: 'a timeout', failure: () => error(BtApiErrorKind.Transient, 'POST') },
            {
                name: 'an HTML 503',
                failure: () => error(BtApiErrorKind.UnexpectedResponse, 'POST', { httpStatus: 503 }),
            },
            { name: 'a server error', failure: () => error(BtApiErrorKind.ServerError, 'POST', { httpStatus: 500 }) },
        ])('does not repeat a POST after $name', ({ failure }) => {
            expect(simulate(policy, failure).attempts).toBe(1);
        });

        it.each([
            {
                name: 'proxy connect failure',
                failure: () => error(BtApiErrorKind.ProxyConnectFailure, 'POST', { notSent: true }),
            },
            { name: 'connection refused', failure: () => error(BtApiErrorKind.Transient, 'POST', { notSent: true }) },
            { name: 'rate limit', failure: () => error(BtApiErrorKind.RateLimited, 'POST', { notSent: true }) },
        ])('retries a POST after a $name, which BeyondTrust did not process', ({ failure }) => {
            const created = failure();

            expect(simulate(policy, failure).attempts).toBe(4);
            expect(policy.decide(created, BtRetryPolicy.initialState()).retry).toBe(true);
            expect(created.ambiguousWriteOutcome).toBe(false);
        });

        it.each([
            {
                name: 'an HTML 503',
                failure: () => error(BtApiErrorKind.UnexpectedResponse, 'POST', { httpStatus: 503, notSent: true }),
                attempts: 4,
            },
            {
                name: 'a server error',
                failure: () => error(BtApiErrorKind.ServerError, 'POST', { httpStatus: 500, notSent: true }),
                attempts: 2,
            },
        ])('retries a write whose token request failed with $name like a read', ({ failure, attempts }) => {
            const created = failure();

            expect(simulate(policy, failure).attempts).toBe(attempts);
            expect(policy.decide(created, BtRetryPolicy.initialState()).retry).toBe(true);
            expect(created.ambiguousWriteOutcome).toBe(false);
        });

        it('does not mark a rejected write as ambiguous', () => {
            const failure = error(BtApiErrorKind.ClientError, 'POST', { httpStatus: 422 });

            policy.decide(failure, BtRetryPolicy.initialState());

            expect(failure.ambiguousWriteOutcome).toBe(false);
        });
    });
});
