import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiParam,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ApiTransactionIdHeader, TransactionIdHeader } from '../../core/decorators';
import { UuidUtility } from '../../shared/utilities';
import { AddJumpGroupToGroupPolicyCommand, RemoveJumpGroupFromGroupPolicyCommand } from '../commands';
import { AddJumpGroupToGroupPolicyDtoInput } from '../dtos/inputs';
import { GroupPolicyJumpGroupAddedDtoOutput } from '../dtos/outputs';
import { GroupPolicyJumpGroup } from '../models';

@ApiTransactionIdHeader()
@ApiTags('Group Policies')
@Controller('group-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupPolicyJumpGroupsController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post(':id/jump-groups')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiCreatedResponse({
        type: GroupPolicyJumpGroupAddedDtoOutput,
        description: 'Indicates that the Jump Group was successfully added.',
    })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async addJumpGroupToGroupPolicy(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @Param('id') id: number,
        @Body() dtoInput: AddJumpGroupToGroupPolicyDtoInput,
    ): Promise<GroupPolicyJumpGroupAddedDtoOutput> {
        const result = await this.commandBus.execute<AddJumpGroupToGroupPolicyCommand, GroupPolicyJumpGroup>(
            new AddJumpGroupToGroupPolicyCommand(
                transactionId,
                id,
                dtoInput.jumpGroupId,
                dtoInput.jumpItemRoleId,
                dtoInput.jumpPolicyId,
            ),
        );

        return result;
    }

    @Delete(':id/jump-groups/:jumpGroupId')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiParam({
        name: 'jumpGroupId',
        type: Number,
        required: true,
        description: 'Unique identifier for the Jump Group.',
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'Indicates the Jump Group was successfully removed.' })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    public async removeJumpGroupFromGroupPolicy(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @Param('id') id: number,
        @Param('jumpGroupId') jumpGroupId: number,
    ): Promise<void> {
        await this.commandBus.execute(new RemoveJumpGroupFromGroupPolicyCommand(transactionId, id, jumpGroupId));
    }
}
