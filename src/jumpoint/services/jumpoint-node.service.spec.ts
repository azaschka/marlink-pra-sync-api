import { JumpointNodeRepositoryService } from '../repositories/services/jumpoint-node-repository.service';
import { JumpointNodeService } from './jumpoint-node.service';

describe('JumpointNodeService', () => {
    let service: JumpointNodeService;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;

    beforeEach(() => {
        jumpointNodeRepositoryService = mockRepositoryService();
        service = new JumpointNodeService(jumpointNodeRepositoryService);
    });

    describe('createOrUpdateByJumpointIdAndJumpointNodeId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'createOrUpdateByJumpointIdAndJumpointNodeId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByJumpointIdAndJumpointNodeId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByJumpointIdAndJumpointNodeId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'deleteByJumpointIdAndJumpointNodeId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointIdAndJumpointNodeId(123, 1, 2);

            expect(repositoryDeleteMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): JumpointNodeRepositoryService {
    const repositoryService = {} as JumpointNodeRepositoryService;

    repositoryService.createOrUpdateByJumpointIdAndJumpointNodeId = jest.fn();
    repositoryService.deleteByJumpointIdAndJumpointNodeId = jest.fn();

    return repositoryService;
}
