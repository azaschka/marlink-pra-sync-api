import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { JumpointNodeIsoContent } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodeIsoByIdQuery } from '../retrieve-jumpoint-node-iso-by-id.query';

@QueryHandler(RetrieveJumpointNodeIsoByIdQuery)
export class RetrieveJumpointNodeIsoByIdQueryHandler implements IQueryHandler<RetrieveJumpointNodeIsoByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly jumpointRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(query: RetrieveJumpointNodeIsoByIdQuery): Promise<JumpointNodeIsoContent> {
        const jumpointNode = await this.jumpointRepositoryService.findOneById(query.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${query.id} not found.`);
        }

        if (!jumpointNode.isoFilePath) {
            throw new NotFoundException(`Jumpoint Node with ID ${query.id} does not have an ISO file path.`);
        }

        const absoluteFilePath = UrlUtility.join(this.appConfigService.storage.rootPath, jumpointNode.isoFilePath);

        if (!this.doesIsoFileExist(absoluteFilePath)) {
            throw new NotFoundException(`ISO file not found at path ${absoluteFilePath}.`);
        }

        const fileBuffer = await this.readIsoFile(absoluteFilePath);

        return {
            filename: path.basename(absoluteFilePath),
            buffer: fileBuffer,
        };
    }

    private doesIsoFileExist(absoluteFilePath: string): boolean {
        return fs.existsSync(absoluteFilePath);
    }

    private readIsoFile(absoluteFilePath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(absoluteFilePath, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
