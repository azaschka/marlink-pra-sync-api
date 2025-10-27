import { QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { GroupPolicyMemberRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyMembersQuery } from '../retrieve-all-group-policy-members.query';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';
import { RetrieveAllGroupPolicyMembersQueryHandler } from './retrieve-all-group-policy-members.query-handler';

describe('RetrieveAllGroupPolicyMembersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let handler: RetrieveAllGroupPolicyMembersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        handler = new RetrieveAllGroupPolicyMembersQueryHandler(appConfigService, queryBus);
    });

    describe('execute', () => {
        it('should call query bus with correct parameters and get the result (pagination is not repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ userId: 1 }, { userId: 2 }] as GroupPolicyMemberRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }] as GroupPolicyMemberRetrievedDtoOutput[], // Simulating the second batch
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyMembersQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 123,
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyMembersQuery(
                    'transaction-1',
                    123,
                    appConfigService.discrepancy.maxBatchSize,
                    1,
                    1,
                ),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyMembersQuery(
                    'transaction-1',
                    123,
                    appConfigService.discrepancy.maxBatchSize,
                    2,
                    1,
                ),
            );

            expect(result).toStrictEqual([
                { userId: 1 },
                { userId: 2 },
                { userId: 3 },
            ] as GroupPolicyMemberRetrievedDtoOutput[]);
        });

        it('should call query bus with correct parameters and get the result (pagination is repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ userId: 1 }, { userId: 2 }] as GroupPolicyMemberRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }, { userId: 4 }] as GroupPolicyMemberRetrievedDtoOutput[], // Simulating the second batch
                )
                .mockResolvedValueOnce(
                    [{ userId: 3 }, { userId: 4 }] as GroupPolicyMemberRetrievedDtoOutput[], // Simulating the third batch (repeated ids)
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyMembersQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 123,
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyMembersQuery(
                    'transaction-1',
                    123,
                    appConfigService.discrepancy.maxBatchSize,
                    1,
                    1,
                ),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyMembersQuery(
                    'transaction-1',
                    123,
                    appConfigService.discrepancy.maxBatchSize,
                    2,
                    1,
                ),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                3,
                new RetrieveGroupPolicyMembersQuery(
                    'transaction-1',
                    123,
                    appConfigService.discrepancy.maxBatchSize,
                    3,
                    1,
                ),
            );

            expect(result).toStrictEqual([
                { userId: 1 },
                { userId: 2 },
                { userId: 3 },
                { userId: 4 },
            ] as GroupPolicyMemberRetrievedDtoOutput[]);
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
        discrepancy: {
            maxBatchSize: 2,
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
