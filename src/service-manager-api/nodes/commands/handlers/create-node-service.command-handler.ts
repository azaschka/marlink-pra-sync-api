import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateNodeServiceDtoInput } from '../../dtos/inputs';
import { NodeServiceCreatedDtoOutput } from '../../dtos/outputs';
import { CreateNodeServiceCommand } from '../create-node-service.command';

@CommandHandler(CreateNodeServiceCommand)
export class CreateNodeServiceCommandHandler implements ICommandHandler<CreateNodeServiceCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateNodeServiceCommand): Promise<NodeServiceCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.serviceManager.api.baseUrl,
            this.appConfigService.serviceManager.api.version.path,
            this.appConfigService.serviceManager.api.node.path,
            command.certname,
            this.appConfigService.serviceManager.api.node.service.path,
        );

        return await this.httpClientService.post<NodeServiceCreatedDtoOutput, NodeServiceCreatedDtoOutput>(
            NodeServiceCreatedDtoOutput,
            url,
            CreateNodeServiceDtoInput.create(command.serviceType),
        );
    }
}
