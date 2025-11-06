import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, In } from 'typeorm';
import { ShellJump } from '../../models';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { RetrieveShellJumpsQuery } from '../retrieve-shell-jumps.query';

@QueryHandler(RetrieveShellJumpsQuery)
export class RetrieveShellJumpsQueryHandler implements IQueryHandler<RetrieveShellJumpsQuery> {
    constructor(private readonly shellJumpRepositoryService: ShellJumpRepositoryService) {}

    public async execute(query: RetrieveShellJumpsQuery): Promise<ShellJump[]> {
        const shellJumpsFindByQuery: FindOptionsWhere<ShellJumpEntity> = {};

        if (query.name) {
            shellJumpsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            shellJumpsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupIds !== undefined && query.jumpGroupIds.length > 0) {
            shellJumpsFindByQuery.jumpGroupId = In(query.jumpGroupIds);
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
            query.tenantId,
            shellJumpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return shellJumps;
    }
}
