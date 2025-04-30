import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { RetrieveGroupPoliciesDtoInput } from '../dtos/inputs';
import { GroupPoliciesRetrievedDtoOutput } from '../dtos/outputs';
import { GroupPoliciesRetrieved } from '../models';
import { RetrieveGroupPoliciesQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Group Policies')
@Controller('group-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupPolicyController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    @ApiOkResponse({ type: GroupPoliciesRetrievedDtoOutput, isArray: true })
    public async getGroupPolicies(
        @Query() dtoInput: RetrieveGroupPoliciesDtoInput,
    ): Promise<GroupPoliciesRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveGroupPoliciesQuery, GroupPoliciesRetrieved[]>(
            new RetrieveGroupPoliciesQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
            ),
        );

        return result;
    }
}
