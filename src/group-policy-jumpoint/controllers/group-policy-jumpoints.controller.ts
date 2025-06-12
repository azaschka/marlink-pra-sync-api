import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { AddJumpointToGroupPolicyCommand, RemoveJumpointFromGroupPolicyCommand } from '../commands';
import { AddJumpointToGroupPolicyDtoInput } from '../dtos/inputs';
import { GroupPolicyJumpointAddedDtoOutput } from '../dtos/outputs';
import { GroupPolicyJumpoint } from '../models';

@ApiBearerAuth()
@ApiTags('Group Policies')
@Controller('group-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupPolicyJumpointsController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post(':id/jumpoints')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: GroupPolicyJumpointAddedDtoOutput })
    public async addJumpointToGroupPolicy(
        @Param('id') id: number,
        @Body() dtoInput: AddJumpointToGroupPolicyDtoInput,
    ): Promise<GroupPolicyJumpointAddedDtoOutput> {
        const result = await this.commandBus.execute<AddJumpointToGroupPolicyCommand, GroupPolicyJumpoint>(
            new AddJumpointToGroupPolicyCommand(UuidUtility.generate(), id, dtoInput.jumpointId),
        );

        return result;
    }

    @Delete(':id/jumpoints/:jumpointId')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiParam({ name: 'jumpointId', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async removeJumpointFromGroupPolicy(
        @Param('id') id: number,
        @Param('jumpointId') jumpointId: number,
    ): Promise<void> {
        await this.commandBus.execute(new RemoveJumpointFromGroupPolicyCommand(UuidUtility.generate(), id, jumpointId));
    }
}
