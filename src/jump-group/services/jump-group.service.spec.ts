import { JumpGroupRepositoryService } from '../repositories/services/jump-group-repository.service';
import { JumpGroupService } from './jump-group.service';

describe('JumpGroupService', () => {
    let service: JumpGroupService;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;

    beforeEach(() => {
        jumpGroupRepositoryService = mockRepositoryService();
        service = new JumpGroupService(jumpGroupRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(jumpGroupRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(jumpGroupRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): JumpGroupRepositoryService {
    const repositoryService = {} as JumpGroupRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
