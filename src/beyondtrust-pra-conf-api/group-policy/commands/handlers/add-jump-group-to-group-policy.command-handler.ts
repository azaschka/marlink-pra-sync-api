import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { AddJumpGroupToGroupPolicyDtoInput } from '../../dtos/inputs';
import { JumpGroupAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddJumpGroupToGroupPolicyCommand } from '../add-jump-group-to-group-policy.command';

@CommandHandler(AddJumpGroupToGroupPolicyCommand)
export class AddJumpGroupToGroupPolicyCommandHandler implements ICommandHandler<AddJumpGroupToGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: AddJumpGroupToGroupPolicyCommand): Promise<JumpGroupAddedToGroupPolicyDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.jumpGroup.path,
        );

        return await this.httpClientService.post<
            JumpGroupAddedToGroupPolicyDtoOutput,
            JumpGroupAddedToGroupPolicyDtoOutput
        >(
            JumpGroupAddedToGroupPolicyDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            AddJumpGroupToGroupPolicyDtoInput.create(command.jumpGroupId, command.jumpItemRoleId, command.jumpPolicyId),
        );
    }
}
