import { QueryBus } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { JumpClientInstallerPlatformType } from '../../enums';
import { RetrieveJumpClientInstallerPlatformQuery } from '../retrieve-jump-client-installer-platform.query';
import { RetrieveJumpClientInstallerPlatformQueryHandler } from './retrieve-jump-client-installer-platform.query-handler';

describe('RetrieveJumpClientInstallerPlatformQueryHandler', () => {
    let handler: RetrieveJumpClientInstallerPlatformQueryHandler;
    let queryBus: QueryBus;

    beforeEach(() => {
        queryBus = mockQueryBus();
        handler = new RetrieveJumpClientInstallerPlatformQueryHandler(queryBus);
    });

    describe('execute', () => {
        it('should call the query bus with the correct parameters and return the result', async () => {
            const transactionId = 'transaction-1';
            const installerId = 'installer-123';
            const platformType = JumpClientInstallerPlatformType.Linux64;
            const expectedResult = {} as AxiosResponse<NodeJS.ReadableStream>;
            jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

            const result = await handler.execute(
                new RetrieveJumpClientInstallerPlatformQuery(transactionId, installerId, platformType),
            );

            expect(result).toBe(expectedResult);
        });
    });
});

function mockQueryBus(): QueryBus {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}
