import { QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { GroupPolicyJumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyJumpointsQuery } from '../retrieve-all-group-policy-jumpoints.query';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';
import { RetrieveAllGroupPolicyJumpointsQueryHandler } from './retrieve-all-group-policy-jumpoints.query-handler';

describe('RetrieveAllGroupPolicyJumpointsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let handler: RetrieveAllGroupPolicyJumpointsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        handler = new RetrieveAllGroupPolicyJumpointsQueryHandler(appConfigService, queryBus);
    });

    describe('execute', () => {
        it('should call query bus with correct parameters and get the result (pagination is not repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ jumpointId: 1 }, { jumpointId: 2 }] as GroupPolicyJumpointRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ jumpointId: 3 }] as GroupPolicyJumpointRetrievedDtoOutput[], // Simulating the second batch
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyJumpointsQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 123,
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyJumpointsQuery('transaction-1', 123, appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyJumpointsQuery('transaction-1', 123, appConfigService.sync.maxBatchSize, 2, 1),
            );

            expect(result).toStrictEqual([
                { jumpointId: 1 },
                { jumpointId: 2 },
                { jumpointId: 3 },
            ] as GroupPolicyJumpointRetrievedDtoOutput[]);
        });

        it('should call query bus with correct parameters and get the result (pagination is repeated)', async () => {
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce(
                    [{ jumpointId: 1 }, { jumpointId: 2 }] as GroupPolicyJumpointRetrievedDtoOutput[], // Simulating the first batch
                )
                .mockResolvedValueOnce(
                    [{ jumpointId: 3 }, { jumpointId: 4 }] as GroupPolicyJumpointRetrievedDtoOutput[], // Simulating the second batch
                )
                .mockResolvedValueOnce(
                    [{ jumpointId: 3 }, { jumpointId: 4 }] as GroupPolicyJumpointRetrievedDtoOutput[], // Simulating the third batch (repeated ids)
                );

            const result = await handler.execute(<RetrieveAllGroupPolicyJumpointsQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 123,
                id: 1,
            });

            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                1,
                new RetrieveGroupPolicyJumpointsQuery('transaction-1', 123, appConfigService.sync.maxBatchSize, 1, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                2,
                new RetrieveGroupPolicyJumpointsQuery('transaction-1', 123, appConfigService.sync.maxBatchSize, 2, 1),
            );
            expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                3,
                new RetrieveGroupPolicyJumpointsQuery('transaction-1', 123, appConfigService.sync.maxBatchSize, 3, 1),
            );

            expect(result).toStrictEqual([
                { jumpointId: 1 },
                { jumpointId: 2 },
                { jumpointId: 3 },
                { jumpointId: 4 },
            ] as GroupPolicyJumpointRetrievedDtoOutput[]);
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
