import { NotFoundException } from '@nestjs/common';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { RetrieveWebJumpByIdQuery } from '../retrieve-web-jump-by-id.query';
import { RetrieveWebJumpByIdQueryHandler } from './retrieve-web-jump-by-id.query-handler';

describe('RetrieveWebJumpByIdQueryHandler', () => {
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: RetrieveWebJumpByIdQueryHandler;

    beforeEach(() => {
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new RetrieveWebJumpByIdQueryHandler(webJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(webJumpRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveWebJumpByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedWebJump = { id: 123 } as WebJumpEntity;
            const webJumpRepositoryServiceFindOneByIdMethod = jest
                .spyOn(webJumpRepositoryService, 'findOneById')
                .mockResolvedValue(expectedWebJump);

            const result = await handler.execute(new RetrieveWebJumpByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedWebJump);
            expect(webJumpRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockWebJumpRepositoryService() {
    const service = {} as WebJumpRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
