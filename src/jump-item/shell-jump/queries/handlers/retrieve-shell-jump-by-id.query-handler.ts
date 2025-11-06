import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ShellJump } from '../../models';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { RetrieveShellJumpByIdQuery } from '../retrieve-shell-jump-by-id.query';

@QueryHandler(RetrieveShellJumpByIdQuery)
export class RetrieveShellJumpByIdQueryHandler implements IQueryHandler<RetrieveShellJumpByIdQuery> {
    constructor(private readonly shellJumpRepositoryService: ShellJumpRepositoryService) {}

    public async execute(query: RetrieveShellJumpByIdQuery): Promise<ShellJump> {
        const shellJump = await this.shellJumpRepositoryService.findOneById(query.tenantId, query.id);

        if (!shellJump) {
            throw new NotFoundException(`Shell jump with ID ${query.id} not found.`);
        }

        return shellJump;
    }
}
