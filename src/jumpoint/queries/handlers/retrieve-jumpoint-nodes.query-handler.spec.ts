import { NotFoundException } from '@nestjs/common';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';
import { RetrieveJumpointNodesQueryHandler } from './retrieve-jumpoint-nodes.query-handler';

describe('RetrieveJumpointNodeQueryHandler', () => {
    let handler: RetrieveJumpointNodesQueryHandler;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;

    beforeEach(() => {
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new RetrieveJumpointNodesQueryHandler(jumpointNodeRepositoryService);
    });

    it('should throw NotFoundException when jumpoint node is not found', async () => {
        const query = new RetrieveJumpointNodesQuery('transaction-id', 1);
        jest.spyOn(jumpointNodeRepositoryService, 'findBy').mockResolvedValue([]);

        await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('should return a jumpoint node when found', async () => {
        const expectedResult = [{ id: 1 }] as JumpointNodeEntity[];
        jest.spyOn(jumpointNodeRepositoryService, 'findBy').mockResolvedValue(expectedResult);

        const query = new RetrieveJumpointNodesQuery('transaction-id', 1);

        const result = await handler.execute(query);

        expect(result).toEqual(expectedResult);
    });
});

function mockJumpointNodeRepositoryService() {
    const service = {} as JumpointNodeRepositoryService;
    service.findBy = jest.fn();

    return service;
}
