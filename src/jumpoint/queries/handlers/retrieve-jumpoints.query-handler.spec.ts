import { QueryBus } from '@nestjs/cqrs';
import { Like } from 'typeorm';
import { JumpointRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { JumpointPlatformType as BTJumpointPlatformType } from '../../../beyondtrust-pra-conf-api/jumpoint/enums';
import { RetrieveJumpointsQuery as BTRetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { JumpointPlatformType } from '../../enums';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';
import { RetrieveJumpointsQueryHandler } from './retrieve-jumpoints.query-handler';

describe('RetrieveJumpointsQueryHandler', () => {
    let jumpointRepositoryService: JumpointRepositoryService;
    let queryBus: QueryBus;
    let handler: RetrieveJumpointsQueryHandler;

    beforeEach(() => {
        jumpointRepositoryService = mockJumpointRepositoryService();
        queryBus = mockQueryBus();
        handler = new RetrieveJumpointsQueryHandler(jumpointRepositoryService, queryBus);
    });

    describe('execute', () => {
        it('should call the query bus with correct parameter and return its value', async () => {
            const expectedJumpoints = [
                {
                    id: 1,
                    name: 'Jumpoint 1',
                    platform: BTJumpointPlatformType.LinuxX86,
                },
            ] as JumpointRetrievedDtoOutput[];
            const jumpointRepositoryServiceFindByMethod = jest.spyOn(jumpointRepositoryService, 'findBy');
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedJumpoints);
            jest.spyOn(JumpointEntity, 'create').mockImplementation(
                (id: number, name: string, platformType: JumpointPlatformType) => {
                    return {
                        id,
                        name,
                        platformType: platformType,
                    } as unknown as JumpointEntity;
                },
            );

            const result = await handler.execute(
                new RetrieveJumpointsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'Jumpoint 1',
                    'public-ip-1',
                    'private-ip-1',
                    'hostname-1',
                    'code-name-1',
                ),
            );

            expect(result).toStrictEqual([
                {
                    id: 1,
                    name: 'Jumpoint 1',
                    platformType: JumpointPlatformType.LinuxX86,
                },
            ]);
            expect(jumpointRepositoryServiceFindByMethod).not.toHaveBeenCalled();
            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveJumpointsQuery(
                    'transaction-2',
                    10,
                    1,
                    'Jumpoint 1',
                    'public-ip-1',
                    'private-ip-1',
                    'hostname-1',
                    'code-name-1',
                ),
            );
        });

        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpoints = [] as JumpointEntity[];
            const jumpointRepositoryServiceFindByMethod = jest
                .spyOn(jumpointRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpoints);

            const result = await handler.execute(new RetrieveJumpointsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedJumpoints);
            expect(jumpointRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it.each([
            {
                query: new RetrieveJumpointsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'Jumpoint 1',
                    undefined,
                    undefined,
                    undefined,
                    'code-name-1',
                ),
                expectedFindByQuery: { name: 'Jumpoint 1', codeName: 'code-name-1' },
            },
            {
                query: new RetrieveJumpointsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'Jumpoint 1',
                    undefined,
                    undefined,
                    undefined,
                    'code-name-1',
                    'jumpoint%',
                ),
                expectedFindByQuery: { codeName: 'code-name-1', name: Like('jumpoint%') },
            },
        ])(
            'should call the repo with correct parameter and return its value',
            async ({ query, expectedFindByQuery }) => {
                const expectedJumpoints = [] as JumpointEntity[];
                const jumpointRepositoryServiceFindByMethod = jest
                    .spyOn(jumpointRepositoryService, 'findBy')
                    .mockResolvedValue(expectedJumpoints);
                const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute');

                const result = await handler.execute(query);

                expect(result).toStrictEqual(expectedJumpoints);
                expect(queryBusExecuteMethod).not.toHaveBeenCalled();
                expect(jumpointRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, expectedFindByQuery, 1, 10);
            },
        );
    });
});

function mockJumpointRepositoryService() {
    const service = {} as JumpointRepositoryService;
    service.findBy = jest.fn();

    return service;
}

function mockQueryBus() {
    const bus = {} as QueryBus;
    bus.execute = jest.fn();

    return bus;
}
