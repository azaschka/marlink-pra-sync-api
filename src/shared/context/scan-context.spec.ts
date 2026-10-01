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
