import { GroupPolicyJumpointEntity } from '../../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';
import { RetrieveGroupPolicyJumpointsQueryHandler } from './retrieve-group-policy-jumpoints.query-handler';

describe('RetrieveGroupPolicyJumpointsQueryHandler', () => {
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;
    let handler: RetrieveGroupPolicyJumpointsQueryHandler;

    beforeEach(() => {
        groupPolicyJumpointRepositoryService = mockGroupPolicyJumpointRepositoryService();
        handler = new RetrieveGroupPolicyJumpointsQueryHandler(groupPolicyJumpointRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedGroupPolicyJumpointEntities = [
                {
                    groupPolicyId: 123,
                    jumpointId: 1,
                    jumpoint: {
                        id: 1,
                        name: 'Jumpoint 1',
                    },
                },
                {
                    groupPolicyId: 123,
                    jumpointId: 2,
                    jumpoint: {
                        id: 2,
                        name: 'Jumpoint 2',
                    },
                },
            ] as GroupPolicyJumpointEntity[];
            const groupPolicyJumpointRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicyJumpointEntities);

            const result = await handler.execute(new RetrieveGroupPolicyJumpointsQuery('transaction-2', 10, 1, 123));

            expect(result).toBe(expectedGroupPolicyJumpointEntities);
            expect(groupPolicyJumpointRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                { groupPolicyId: 123 },
                1,
                10,
            );
        });
    });
});

function mockGroupPolicyJumpointRepositoryService() {
    const service = {} as GroupPolicyJumpointRepositoryService;
    service.findBy = jest.fn();

    return service;
}
