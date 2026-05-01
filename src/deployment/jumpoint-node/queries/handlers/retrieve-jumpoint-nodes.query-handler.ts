import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, In, IsNull } from 'typeorm';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DeploymentRetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';

@QueryHandler(DeploymentRetrieveJumpointNodesQuery)
export class RetrieveJumpointNodesQueryHandler implements IQueryHandler<DeploymentRetrieveJumpointNodesQuery> {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async execute(query: DeploymentRetrieveJumpointNodesQuery): Promise<JumpointNode[]> {
        const jumpointNodeFindByQuery = <FindOptionsWhere<JumpointNodeEntity>>{};

        if (query.certname) {
            jumpointNodeFindByQuery.certname = query.certname;
        }

        if (query.businessUnits) {
            jumpointNodeFindByQuery.businessUnit = In(query.businessUnits);
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

        try {
            const jumpointNodes = await this.jumpointNodeRepositoryService.findBy(
                jumpointNodeFindByQuery,
                query.pageNumber,
                query.pageSize,
            );

            return jumpointNodes;
        } catch (error) {
            console.error(
                `[${query.transactionId}] RetrieveJumpointNodesQueryHandler: DB query failed.`,
                `\nFilter: ${JSON.stringify(jumpointNodeFindByQuery)}`,
                `\nError: ${ErrorProcessorUtility.stringify(error)}`,
            );
            throw error;
        }
    }
}
