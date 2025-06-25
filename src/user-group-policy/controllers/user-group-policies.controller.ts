import { Body, Controller, Param, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiParam, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { ApiTransactionIdHeader, TransactionIdHeader } from '../../core/decorators';
import { NonEmptyBodyPipe } from '../../shared/pipes';
import { UuidUtility } from '../../shared/utilities';
import { ModifyUserGroupPoliciesCommand } from '../commands';
import { ModifyUserGroupPoliciesDtoInput } from '../dtos/inputs';
import { UserGroupPoliciesModifiedDtoOutput } from '../dtos/outputs';
import { UserGroupPolicies } from '../models';

@ApiTransactionIdHeader()
@ApiTags('Users')
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserGroupPoliciesController {
    constructor(private readonly commandBus: CommandBus) {}

    @Patch(':id/group-policies')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiOkResponse({
        type: UserGroupPoliciesModifiedDtoOutput,
        description: 'Indicates the user was added or removed successfully from the group policies.',
    })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async modifyUserGroupPolicies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyUserGroupPoliciesDtoInput,
    ): Promise<UserGroupPoliciesModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyUserGroupPoliciesCommand, UserGroupPolicies>(
            new ModifyUserGroupPoliciesCommand(
                transactionId,
                id,
                dtoInput.groupPolicyIdsToAdd,
                dtoInput.groupPolicyIdsToRemove,
            ),
        );

        return result;
    }
}
