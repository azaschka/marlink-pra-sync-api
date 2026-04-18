import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';

@QueryHandler(RetrieveJumpointNodesQuery)
export class RetrieveJumpointNodesQueryHandler implements IQueryHandler<RetrieveJumpointNodesQuery> {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async execute(query: RetrieveJumpointNodesQuery): Promise<JumpointNode[]> {
        const jumpointNodeFindByQuery = <FindOptionsWhere<JumpointNodeEntity>>{};

        if (query.certname) {
            jumpointNodeFindByQuery.certname = query.certname;
        }

        if (query.businessUnit) {
            jumpointNodeFindByQuery.businessUnit = query.businessUnit;
        }

        if (query.siteKey) {
            jumpointNodeFindByQuery.siteKey = query.siteKey;
        }

        if (query.customerName) {
            jumpointNodeFindByQuery.customerName = query.customerName;
        }

        if (query.customerName === null) {
            jumpointNodeFindByQuery.customerName = IsNull(); // Handle the case where customerName is explicitly set to null
        }

        if (query.puppetServerDomain) {
            jumpointNodeFindByQuery.puppetServerDomain = query.puppetServerDomain;
        }

        if (query.hypervisorId) {
            jumpointNodeFindByQuery.hypervisorId = query.hypervisorId;
        }

        if (query.hypervisorType) {
            jumpointNodeFindByQuery.hypervisorType = query.hypervisorType;
        }

        if (query.vmId) {
            jumpointNodeFindByQuery.vmId = query.vmId;
        }

        const jumpointNodes = await this.jumpointNodeRepositoryService.findBy(
            jumpointNodeFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpointNodes;
    }
}
