import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodeIsoByIdQuery } from '../retrieve-jumpoint-node-iso-by-id.query';
import { RetrieveJumpointNodeIsoByIdQueryHandler } from './retrieve-jumpoint-node-iso-by-id.query-handler';

describe('RetrieveJumpointNodeIsoByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: RetrieveJumpointNodeIsoByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new RetrieveJumpointNodeIsoByIdQueryHandler(appConfigService, jumpointNodeRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException if the iso does not exist', async () => {
            // Arrange
            jumpointNodeRepositoryService.findOneById = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(new RetrieveJumpointNodeIsoByIdQuery('transaction-1', 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException if the iso file does not exist', async () => {
            // Arrange
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            // Act & Assert
            await expect(handler.execute(new RetrieveJumpointNodeIsoByIdQuery('transaction-1', 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return as expected', async () => {
            // Arrange
            const expectedBuffer = Buffer.from('iso content');
            const expectedFilename = 'file.nsb';
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            jest.spyOn(fs, 'readFile').mockImplementation((_path, callback) => {
                callback(null, expectedBuffer);
            });
            jest.spyOn(path, 'basename').mockReturnValue(expectedFilename);

            // Act
            const result = await handler.execute(new RetrieveJumpointNodeIsoByIdQuery('transaction-1', 123));

            // Assert
            expect(result).toStrictEqual({
                filename: expectedFilename,
                buffer: expectedBuffer,
            });
        });
    });
});

function mockUrlUtility() {
    return {
        join: jest.fn((...args: string[]) => args.join('/')),
    };
}

function mockAppConfigService() {
    return {
        storage: {
            rootPath: '/root/path',
            jumpointNodeIsoPath: '/jumpoint-node/iso/path',
        },
    } as AppConfigService;
}

function mockJumpointNodeRepositoryService() {
    const service = {} as JumpointNodeRepositoryService;
    service.findOneById = jest.fn().mockResolvedValue({
        isoFilePath: '/jumpoint-node/iso/path/file.iso',
    });

    return service;
}
