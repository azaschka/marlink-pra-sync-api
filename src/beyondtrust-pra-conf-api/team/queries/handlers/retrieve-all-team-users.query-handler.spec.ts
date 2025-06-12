import { QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { TeamUserRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllTeamUsersQuery } from '../retrieve-all-team-users.query';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';
import { RetrieveAllTeamUsersQueryHandler } from './retrieve-all-team-users.query-handler';

describe('RetrieveAllTeamUsersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let handler: RetrieveAllTeamUsersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        handler = new RetrieveAllTeamUsersQueryHandler(appConfigService, queryBus);
    });

    describe('execute', () => {
        it('should call query bus with correct parameters and get the result (pagination is not repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ userId: 1 }, { userId: 2 }] as TeamUserRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }] as TeamUserRetrievedDtoOutput[], // Simulating the second batch
                );

            const result = await handler.execute(<RetrieveAllTeamUsersQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveTeamUsersQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveTeamUsersQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );

            expect(result).toStrictEqual([{ userId: 1 }, { userId: 2 }, { userId: 3 }] as TeamUserRetrievedDtoOutput[]);
        });

        it('should call query bus with correct parameters and get the result (pagination is repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ userId: 1 }, { userId: 2 }] as TeamUserRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }, { userId: 4 }] as TeamUserRetrievedDtoOutput[], // Simulating the second batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }, { userId: 4 }] as TeamUserRetrievedDtoOutput[], // Simulating the third batch (repeated ids)
                );

            const result = await handler.execute(<RetrieveAllTeamUsersQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveTeamUsersQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveTeamUsersQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                3,
                new RetrieveTeamUsersQuery('transaction-1', appConfigService.sync.maxBatchSize, 3, 1),
            );

            expect(result).toStrictEqual([
                { userId: 1 },
                { userId: 2 },
                { userId: 3 },
                { userId: 4 },
            ] as TeamUserRetrievedDtoOutput[]);
        });
    });
});

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}

function mockAppConfigService() {
    const service = {
        sync: {
            maxBatchSize: 2,
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
