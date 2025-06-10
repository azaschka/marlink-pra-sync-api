import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ShellJump } from '../../models';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { RetrieveShellJumpsQuery } from '../retrieve-shell-jumps.query';

@QueryHandler(RetrieveShellJumpsQuery)
export class RetrieveShellJumpsQueryHandler implements IQueryHandler<RetrieveShellJumpsQuery> {
    constructor(private readonly shellJumpRepositoryService: ShellJumpRepositoryService) {}

    public async execute(query: RetrieveShellJumpsQuery): Promise<ShellJump[]> {
        const shellJumpsFindByQuery = <ShellJump>{};

        if (query.name) {
            shellJumpsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            shellJumpsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupId) {
            shellJumpsFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType) {
            shellJumpsFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.jumpointId) {
            shellJumpsFindByQuery.jumpointId = query.jumpointId;
        }

        if (query.tag) {
            shellJumpsFindByQuery.tag = query.tag;
        }

        const shellJumps = await this.shellJumpRepositoryService.findBy(
            shellJumpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return shellJumps;
    }
}
