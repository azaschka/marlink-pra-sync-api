import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere } from 'typeorm';
import { Discrepancy } from '../../models';
import { DiscrepancyEntity } from '../../repositories/entities';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { RetrieveDiscrepanciesQuery } from '../retrieve-discrepancies.query';

@QueryHandler(RetrieveDiscrepanciesQuery)
export class RetrieveDiscrepanciesQueryHandler implements IQueryHandler<RetrieveDiscrepanciesQuery> {
    constructor(private readonly discrepancyRepositoryService: DiscrepancyRepositoryService) {}

    public async execute(query: RetrieveDiscrepanciesQuery): Promise<Discrepancy[]> {
        const discrepancyFindByQuery = <FindOptionsWhere<DiscrepancyEntity>>{};

        if (query.entityId !== undefined) {
            discrepancyFindByQuery.entityId = query.entityId;
        }

        if (query.entityType !== undefined) {
            discrepancyFindByQuery.entityType = query.entityType;
        }

        const discrepancies = await this.discrepancyRepositoryService.findBy(
            query.tenantId,
            discrepancyFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return discrepancies;
    }
}
