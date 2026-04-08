import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpClientInstaller } from '../../models';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { RetrieveJumpClientInstallerByIdQuery } from '../retrieve-jump-client-installer-by-id.query';

@QueryHandler(RetrieveJumpClientInstallerByIdQuery)
export class RetrieveJumpClientInstallerByIdQueryHandler implements IQueryHandler<RetrieveJumpClientInstallerByIdQuery> {
    constructor(private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService) {}

    public async execute(query: RetrieveJumpClientInstallerByIdQuery): Promise<JumpClientInstaller> {
        const jumpClientInstaller = await this.jumpClientInstallerRepositoryService.findOneById(
            query.tenantId,
            query.id,
        );

        if (!jumpClientInstaller) {
            throw new NotFoundException(`Jump client installer with ID ${query.id} not found.`);
        }

        return jumpClientInstaller;
    }
}
