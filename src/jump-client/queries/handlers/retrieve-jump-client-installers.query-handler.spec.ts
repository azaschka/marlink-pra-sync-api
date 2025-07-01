import { QueryBus } from '@nestjs/cqrs';
import { JumpClientInstallerRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    JumpClientConnectionType as BTJumpClientConnectionType,
    JumpClientGroupType as BTJumpClientGroupType,
} from '../../../beyondtrust-pra-conf-api/jump-client/enums';
import { RetrieveJumpClientInstallersQuery as BTRetrieveJumpClientInstallersQuery } from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { JumpClientConnectionType, JumpClientGroupType, JumpClientInstallerPlatformType } from '../../enums';
import { JumpClientInstallerKeyInfo } from '../../models';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { RetrieveJumpClientInstallersQuery } from '../retrieve-jump-client-installers.query';
import { RetrieveJumpClientInstallersQueryHandler } from './retrieve-jump-client-installers.query-handler';

describe('RetrieveJumpClientInstallersQueryHandler', () => {
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let queryBus: QueryBus;
    let handler: RetrieveJumpClientInstallersQueryHandler;

    beforeEach(() => {
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        queryBus = mockQueryBus();
        handler = new RetrieveJumpClientInstallersQueryHandler(jumpClientInstallerRepositoryService, queryBus);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpClients = [] as JumpClientInstallerEntity[];
            const jumpClientRepositoryServiceFindByMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpClients);

            const result = await handler.execute(new RetrieveJumpClientInstallersQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedJumpClients);
            expect(jumpClientRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedJumpClients = [] as JumpClientInstallerEntity[];
            const jumpClientRepositoryServiceFindByMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpClients);

            const result = await handler.execute(
                new RetrieveJumpClientInstallersQuery(
                    'transaction-2',
                    10,
                    1,
                    'jump-client-1',
                    undefined,
                    undefined,
                    'tag-1',
                    123,
                    JumpClientGroupType.Personal,
                    JumpClientConnectionType.Active,
                ),
            );

            expect(result).toBe(expectedJumpClients);
            expect(jumpClientRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                {
                    name: 'jump-client-1',
                    tag: 'tag-1',
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    connectionType: JumpClientConnectionType.Active,
                },
                1,
                10,
            );
        });

        it('should return result from BT instance', async () => {
            const expectedJumpClientInstallerKeyInfo: JumpClientInstallerKeyInfo[] = [
                {
                    platformType: JumpClientInstallerPlatformType.Linux64Headless,
                    encodedInfo: 'linux-64-headless-encoded-info',
                    filename: 'linux-64-headless-filename',
                    installerPath: '/path/to/linux-64-headless-installer',
                },
            ];
            jest.mock('../../mappers', () => ({
                mapFromBTJumpClientInstallerKeyInfo: jest.fn().mockReturnValue(expectedJumpClientInstallerKeyInfo),
            }));
            const expectedBTJumpClients = [
                {
                    id: 1,
                    jumpGroupId: 2,
                    jumpGroupType: JumpClientGroupType.Personal,
                    name: 'jump-client-1',
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 3,
                    sessionPolicyId: 4,
                    keyInfo: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'linux-64-headless': {
                            encodedInfo: 'linux-64-headless-encoded-info',
                            filename: 'linux-64-headless-filename',
                            installerPath: '/path/to/linux-64-headless-installer',
                        },
                    },
                },
            ] as JumpClientInstallerRetrievedDtoOutput[];
            const expectedJumpClient = { id: 1, jumpGroupId: 2 } as JumpClientInstallerEntity;
            const jumpClientRepositoryServiceFindByMethod = jest.spyOn(jumpClientInstallerRepositoryService, 'findBy');
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedBTJumpClients);
            const jumpClientEntityCreateMethod = jest
                .spyOn(JumpClientInstallerEntity, 'create')
                .mockReturnValue(expectedJumpClient);

            const result = await handler.execute(
                new RetrieveJumpClientInstallersQuery(
                    'transaction-2',
                    10,
                    1,
                    'jump-client-1',
                    'hostname-1',
                    'fqdn-1',
                    'tag-1',
                    123,
                    JumpClientGroupType.Personal,
                    JumpClientConnectionType.Active,
                ),
            );

            expect(jumpClientEntityCreateMethod).toHaveBeenCalledWith(
                1,
                2,
                JumpClientGroupType.Personal,
                'jump-client-1',
                'tag-1',
                'comments-1',
                3,
                4,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                expectedJumpClientInstallerKeyInfo,
                undefined,
            );
            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveJumpClientInstallersQuery(
                    'transaction-2',
                    10,
                    1,
                    'jump-client-1',
                    'hostname-1',
                    'fqdn-1',
                    'tag-1',
                    123,
                    BTJumpClientGroupType.Personal,
                    BTJumpClientConnectionType.Active,
                ),
            );
            expect(result).toStrictEqual([expectedJumpClient]);
            expect(jumpClientRepositoryServiceFindByMethod).not.toHaveBeenCalled();
        });
    });
});

function mockJumpClientInstallerRepositoryService() {
    const service = {} as JumpClientInstallerRepositoryService;
    service.findBy = jest.fn();

    return service;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}
