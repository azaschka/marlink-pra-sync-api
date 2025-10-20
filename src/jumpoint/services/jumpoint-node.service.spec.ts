import { JumpointNodeRepositoryService } from '../repositories/services/jumpoint-node-repository.service';
import { JumpointNodeService } from './jumpoint-node.service';

describe('JumpointNodeService', () => {
    let service: JumpointNodeService;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;

    beforeEach(() => {
        jumpointNodeRepositoryService = mockRepositoryService();
        service = new JumpointNodeService(jumpointNodeRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): JumpointNodeRepositoryService {
    const repositoryService = {} as JumpointNodeRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
