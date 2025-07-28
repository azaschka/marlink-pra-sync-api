import { JumpGroupType } from '../../enums';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { RetrieveShellJumpsQuery } from '../retrieve-shell-jumps.query';
import { RetrieveShellJumpsQueryHandler } from './retrieve-shell-jumps.query-handler';

describe('RetrieveShellJumpsQueryHandler', () => {
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: RetrieveShellJumpsQueryHandler;

    beforeEach(() => {
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new RetrieveShellJumpsQueryHandler(shellJumpRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedShellJumps = [] as ShellJumpEntity[];
            const shellJumpRepositoryServiceFindByMethod = jest
                .spyOn(shellJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedShellJumps);

            const result = await handler.execute(new RetrieveShellJumpsQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedShellJumps);
            expect(shellJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedShellJumps = [] as ShellJumpEntity[];
            const shellJumpRepositoryServiceFindByMethod = jest
                .spyOn(shellJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedShellJumps);

            const result = await handler.execute(
                new RetrieveShellJumpsQuery(
                    'transaction-2',
                    10,
                    1,
                    'shell-jump-1',
                    'host-1',
                    2,
                    JumpGroupType.Personal,
                    3,
                    'tag-1',
                ),
            );

            expect(result).toBe(expectedShellJumps);
            expect(shellJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                {
                    name: 'shell-jump-1',
                    hostname: 'host-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 3,
                    tag: 'tag-1',
                },
                1,
                10,
            );
        });
    });
});

function mockShellJumpRepositoryService() {
    const service = {} as ShellJumpRepositoryService;
    service.findBy = jest.fn();

    return service;
}
