import { QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { GroupPolicyTeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyTeamsQuery } from '../retrieve-all-group-policy-teams.query';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';
import { RetrieveAllGroupPolicyTeamsQueryHandler } from './retrieve-all-group-policy-teams.query-handler';

describe('RetrieveAllGroupPolicyTeamsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let handler: RetrieveAllGroupPolicyTeamsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        handler = new RetrieveAllGroupPolicyTeamsQueryHandler(appConfigService, queryBus);
    });

    describe('execute', () => {
        it('should call query bus with correct parameters and get the result (pagination is not repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ teamId: 1 }, { teamId: 2 }] as GroupPolicyTeamRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ teamId: 3 }] as GroupPolicyTeamRetrievedDtoOutput[], // Simulating the second batch
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyTeamsQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyTeamsQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyTeamsQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );

            expect(result).toStrictEqual([
                { teamId: 1 },
                { teamId: 2 },
                { teamId: 3 },
            ] as GroupPolicyTeamRetrievedDtoOutput[]);
        });

        it('should call query bus with correct parameters and get the result (pagination is repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ teamId: 1 }, { teamId: 2 }] as GroupPolicyTeamRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ teamId: 3 }, { teamId: 4 }] as GroupPolicyTeamRetrievedDtoOutput[], // Simulating the second batch
                )
                .mockResolvedValueOnce(
                    [{ teamId: 3 }, { teamId: 4 }] as GroupPolicyTeamRetrievedDtoOutput[], // Simulating the third batch (repeated ids)
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyTeamsQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyTeamsQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyTeamsQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                3,
                new RetrieveGroupPolicyTeamsQuery('transaction-1', appConfigService.sync.maxBatchSize, 3, 1),
            );

            expect(result).toStrictEqual([
                { teamId: 1 },
                { teamId: 2 },
                { teamId: 3 },
                { teamId: 4 },
            ] as GroupPolicyTeamRetrievedDtoOutput[]);
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
