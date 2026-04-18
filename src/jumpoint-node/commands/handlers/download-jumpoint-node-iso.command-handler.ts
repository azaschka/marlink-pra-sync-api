import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { DownloadNodeIsoCommand } from '../../../service-manager-api/nodes/commands';
import { ErrorProcessorUtility, UrlUtility } from '../../../shared/utilities';
import { JumpointNodeIsoDownloadedEvent, JumpointNodeIsoDownloadFailedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DownloadJumpointNodeIsoCommand } from '../download-jumpoint-node-iso.command';

@CommandHandler(DownloadJumpointNodeIsoCommand)
export class DownloadJumpointNodeIsoCommandHandler implements ICommandHandler<DownloadJumpointNodeIsoCommand> {
    private static readonly ISO_FILE_EXTENSION = '.iso';

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: DownloadJumpointNodeIsoCommand): Promise<JumpointNode> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneById(command.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${command.id} not found.`);
        }

        try {
            const relativeFilePath = await this.downloadIsoFile(command.transactionId, jumpointNode.certname);
            jumpointNode.isoFilePath = relativeFilePath;

            await this.jumpointNodeRepositoryService.createOrUpdateById(jumpointNode);

            this.eventBus.publish(
                new JumpointNodeIsoDownloadedEvent(command.transactionId, { jumpointNode: jumpointNode }),
            );

            return jumpointNode;
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodeIsoDownloadFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }

    private async downloadIsoFile(transactionId: string, certname: string): Promise<string> {
        const relativeFilePath = UrlUtility.join(
            this.appConfigService.storage.jumpointNodeIsoPath,
            `${certname}${DownloadJumpointNodeIsoCommandHandler.ISO_FILE_EXTENSION}`,
        );
        const absoluteFilePath = UrlUtility.join(this.appConfigService.storage.rootPath, relativeFilePath);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });

        const buffer = await this.commandBus.execute<DownloadNodeIsoCommand, Buffer>(
            new DownloadNodeIsoCommand(transactionId, certname),
        );

        return new Promise((resolve, reject) => {
            fs.writeFile(absoluteFilePath, buffer, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(relativeFilePath);
                }
            });
        });
    }
}
