import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateNodeDtoInput } from '../../dtos/inputs';
import { NodeCreatedDtoOutput } from '../../dtos/outputs';
import { CreateNodeCommand } from '../create-node.command';

@CommandHandler(CreateNodeCommand)
export class CreateNodeCommandHandler implements ICommandHandler<CreateNodeCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateNodeCommand): Promise<NodeCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.serviceManager.api.baseUrl,
            this.appConfigService.serviceManager.api.version.path,
            this.appConfigService.serviceManager.api.node.path,
        );

        return await this.httpClientService.post<NodeCreatedDtoOutput, NodeCreatedDtoOutput>(
            NodeCreatedDtoOutput,
            url,
            CreateNodeDtoInput.create(
                command.siteId,
                command.businessUnit,
                command.hypervisorId,
                command.hypervisorType,
                command.vmId,
            ),
        );
    }
}
