import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, In, IsNull } from 'typeorm';
import { BeyondtrustInstance } from '../../models';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { RetrieveBeyondtrustInstancesQuery } from '../retrieve-beyondtrust-instances.query';

@QueryHandler(RetrieveBeyondtrustInstancesQuery)
export class RetrieveBeyondtrustInstancesQueryHandler implements IQueryHandler<RetrieveBeyondtrustInstancesQuery> {
    constructor(private readonly beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService) {}

    public async execute(query: RetrieveBeyondtrustInstancesQuery): Promise<BeyondtrustInstance[]> {
        const beyondtrustInstanceFindByQuery = <FindOptionsWhere<BeyondtrustInstance>>{};

        if (query.name) {
            beyondtrustInstanceFindByQuery.name = query.name;
        }

        if (query.oauth2TokenUrl) {
            beyondtrustInstanceFindByQuery.oauth2TokenUrl = query.oauth2TokenUrl;
        }

        if (query.apiBaseUrl) {
            beyondtrustInstanceFindByQuery.apiBaseUrl = query.apiBaseUrl;
        }

        if (query.businessUnits && query.businessUnits.length > 0) {
            const beyondtrustInstances = await this.beyondtrustInstanceRepositoryService.findBy(
                [
                    { ...beyondtrustInstanceFindByQuery, businessUnit: IsNull() },
                    { ...beyondtrustInstanceFindByQuery, businessUnit: In(query.businessUnits) },
                ],
                query.pageNumber,
                query.pageSize,
            );

            return beyondtrustInstances;
        }

        const beyondtrustInstances = await this.beyondtrustInstanceRepositoryService.findBy(
            beyondtrustInstanceFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return beyondtrustInstances;
    }
}
