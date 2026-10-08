import { getEventListeners } from 'events';
import { ScanAbortedError, ScanContext } from './scan-context';

describe('ScanContext', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('is empty outside a scan', () => {
        expect(ScanContext.current()).toBeUndefined();
        expect(ScanContext.isAborted()).toBe(false);
        expect(() => ScanContext.throwIfAborted()).not.toThrow();
    });

    it('carries the scan through asynchronous steps and aborts it when the budget expires', async () => {
        jest.useFakeTimers();
        let resolveStep: () => void = () => undefined;

        const scan = ScanContext.runWithBudget({ scanId: 'scan-1', tenantId: 4, budgetInMs: 1000 }, async () => {
            await new Promise<void>((resolve) => (resolveStep = resolve));

            return ScanContext.current();
        });

        jest.advanceTimersByTime(1000);
        resolveStep();
        const context = await scan;

        expect(context?.scanId).toBe('scan-1');
        expect(context?.tenantId).toBe(4);
        expect(context?.signal.aborted).toBe(true);
        expect(context?.signal.reason).toBeInstanceOf(ScanAbortedError);
    });

    it('lets a nested scan join the surrounding budget', async () => {
        const ids = await ScanContext.runWithBudget({ scanId: 'outer', tenantId: 1, budgetInMs: 60000 }, () =>
            ScanContext.runWithBudget({ scanId: 'inner', tenantId: 1, budgetInMs: 60000 }, () =>
                Promise.resolve(ScanContext.current()?.scanId),
            ),
        );

        expect(ids).toBe('outer');
    });

    it('also bounds background work that keeps running after the scan returned', async () => {
        // Real timers: the fake timer implementation does not propagate AsyncLocalStorage into callbacks.
        let background: Promise<boolean> | undefined;

        await ScanContext.runWithBudget({ scanId: 'scan-2', tenantId: 1, budgetInMs: 20 }, () => {
            background = new Promise<boolean>((resolve) => setTimeout(() => resolve(ScanContext.isAborted()), 60));

            return Promise.resolve();
        });

        await expect(background).resolves.toBe(true);
    });

    it('starts aborted when the additional signal (shutdown) has already fired', async () => {
        const shutdown = new AbortController();
        shutdown.abort();

        const aborted = await ScanContext.runWithBudget(
            { scanId: 'late', tenantId: 1, budgetInMs: 60000, signal: shutdown.signal },
            () => Promise.resolve(ScanContext.isAborted()),
        );

        expect(aborted).toBe(true);
        expect(getEventListeners(shutdown.signal, 'abort')).toHaveLength(0);
    });

    it('aborts a running scan when the additional signal fires', async () => {
        const shutdown = new AbortController();

        const reason = await ScanContext.runWithBudget(
            { scanId: 'running', tenantId: 1, budgetInMs: 60000, signal: shutdown.signal },
            async () => {
                const signal = ScanContext.current()?.signal;
                shutdown.abort();
                await Promise.resolve();

                return signal?.reason as unknown;
            },
        );

        expect(reason).toBeInstanceOf(ScanAbortedError);
        expect(getEventListeners(shutdown.signal, 'abort')).toHaveLength(0);
    });

    it('does not leave one listener per scan on the long-lived shutdown signal', async () => {
        const shutdown = new AbortController();

        for (let cycle = 0; cycle < 12; cycle++) {
            await ScanContext.runWithBudget(
                { scanId: `cycle-${cycle}`, tenantId: 1, budgetInMs: 20, signal: shutdown.signal },
                () => Promise.resolve(),
            );
        }
        // Background work may still be running until the deadline, so the listener stays until then.
        expect(getEventListeners(shutdown.signal, 'abort').length).toBeLessThanOrEqual(12);
        await new Promise((resolve) => setTimeout(resolve, 60));

        expect(getEventListeners(shutdown.signal, 'abort')).toHaveLength(0);
    });

    it('throws ScanAbortedError from throwIfAborted after the deadline', async () => {
        jest.useFakeTimers();

        const scan = ScanContext.runWithBudget({ scanId: 'scan-3', tenantId: 1, budgetInMs: 10 }, async () => {
            await new Promise<void>((resolve) => setTimeout(resolve, 20));
            ScanContext.throwIfAborted();
        });
        jest.advanceTimersByTime(20);

        await expect(scan).rejects.toBeInstanceOf(ScanAbortedError);
    });
});
