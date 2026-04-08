import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BeyondtrustInstance } from '../../models';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../retrieve-beyondtrust-instance-by-id.query';

@QueryHandler(RetrieveBeyondtrustInstanceByIdQuery)
export class RetrieveBeyondtrustInstanceByIdQueryHandler implements IQueryHandler<RetrieveBeyondtrustInstanceByIdQuery> {
    constructor(private readonly beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService) {}

    public async execute(query: RetrieveBeyondtrustInstanceByIdQuery): Promise<BeyondtrustInstance> {
        const beyondtrustInstance = await this.beyondtrustInstanceRepositoryService.findOneById(query.id);

        if (!beyondtrustInstance) {
            throw new NotFoundException(`Beyondtrust instance with ID ${query.id} not found.`);
        }

        return beyondtrustInstance;
    }
}
