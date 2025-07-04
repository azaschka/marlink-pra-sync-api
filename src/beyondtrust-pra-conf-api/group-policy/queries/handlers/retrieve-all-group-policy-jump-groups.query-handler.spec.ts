import { QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { GroupPolicyJumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyJumpGroupsQuery } from '../retrieve-all-group-policy-jump-groups.query';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';
import { RetrieveAllGroupPolicyJumpGroupsQueryHandler } from './retrieve-all-group-policy-jump-groups.query-handler';

describe('RetrieveAllGroupPolicyJumpGroupsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let handler: RetrieveAllGroupPolicyJumpGroupsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        handler = new RetrieveAllGroupPolicyJumpGroupsQueryHandler(appConfigService, queryBus);
    });

    describe('execute', () => {
        it('should call query bus with correct parameters and get the result (pagination is not repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ jumpGroupId: 1 }, { jumpGroupId: 2 }] as GroupPolicyJumpGroupRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ jumpGroupId: 3 }] as GroupPolicyJumpGroupRetrievedDtoOutput[], // Simulating the second batch
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyJumpGroupsQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );

            expect(result).toStrictEqual([
                { jumpGroupId: 1 },
                { jumpGroupId: 2 },
                { jumpGroupId: 3 },
            ] as GroupPolicyJumpGroupRetrievedDtoOutput[]);
        });

        it('should call query bus with correct parameters and get the result (pagination is repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ jumpGroupId: 1 }, { jumpGroupId: 2 }] as GroupPolicyJumpGroupRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ jumpGroupId: 3 }, { jumpGroupId: 4 }] as GroupPolicyJumpGroupRetrievedDtoOutput[], // Simulating the second batch
                )
                .mockResolvedValueOnce(
                    [{ jumpGroupId: 3 }, { jumpGroupId: 4 }] as GroupPolicyJumpGroupRetrievedDtoOutput[], // Simulating the third batch (repeated ids)
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyJumpGroupsQuery>{
                transactionId: 'transaction-1',
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-1', appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-1', appConfigService.sync.maxBatchSize, 2, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                3,
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-1', appConfigService.sync.maxBatchSize, 3, 1),
            );

            expect(result).toStrictEqual([
                { jumpGroupId: 1 },
                { jumpGroupId: 2 },
                { jumpGroupId: 3 },
                { jumpGroupId: 4 },
            ] as GroupPolicyJumpGroupRetrievedDtoOutput[]);
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
