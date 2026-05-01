import { In } from 'typeorm';
import { JumpointNodeBusinessUnit, JumpointNodeHypervisorType } from '../../enums';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DeploymentRetrieveJumpointNodesQuery } from '../deployment-retrieve-jumpoint-nodes.query';
import { RetrieveJumpointNodesQueryHandler } from './retrieve-jumpoint-nodes.query-handler';

describe('RetrieveJumpointNodesQueryHandler', () => {
    let handler: RetrieveJumpointNodesQueryHandler;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;

    beforeEach(() => {
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new RetrieveJumpointNodesQueryHandler(jumpointNodeRepositoryService);
    });

    it('should query with expected parameters and return expected value', async () => {
        const expectedResult = [{ id: 1 }] as JumpointNodeEntity[];
        const findByMethod = jest.spyOn(jumpointNodeRepositoryService, 'findBy').mockResolvedValue(expectedResult);

        const query = new DeploymentRetrieveJumpointNodesQuery(
            'transaction-id',
            10,
            1,
            'cert-1',
            [JumpointNodeBusinessUnit.EG],
            'site-1',
            'cust-1',
            'puppet-domain',
            'hypervisor-1',
            JumpointNodeHypervisorType.OneEdge,
            123,
        );

        const result = await handler.execute(query);

        expect(findByMethod).toHaveBeenCalledWith(
            {
                businessUnit: In([JumpointNodeBusinessUnit.EG]),
                certname: 'cert-1',
                customerName: 'cust-1',
                hypervisorId: 'hypervisor-1',
                hypervisorType: JumpointNodeHypervisorType.OneEdge,
                puppetServerDomain: 'puppet-domain',
                siteKey: 'site-1',
                vmId: 123,
            },
            1,
            10,
        );
        expect(result).toEqual(expectedResult);
    });
});

function mockJumpointNodeRepositoryService() {
    const service = {} as JumpointNodeRepositoryService;
    service.findBy = jest.fn();

    return service;
}
