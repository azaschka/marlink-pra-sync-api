import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiTenantIdHeader, ApiTransactionIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
import { UuidUtility } from '../../shared/utilities';
import { RetrieveSessionPoliciesDtoInput } from '../dtos/inputs';
import { SessionPolicyRetrievedDtoOutput } from '../dtos/outputs';
import { SessionPolicy } from '../models';
import { RetrieveSessionPoliciesQuery } from '../queries';

@ApiTenantIdHeader()
@ApiTransactionIdHeader()
@ApiTags('Session Policies')
@Controller('session-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class SessionPolicyController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    @ApiOkResponse({ type: SessionPolicyRetrievedDtoOutput, isArray: true })
    public async retrieveSessionPolicies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
        @Query() dtoInput: RetrieveSessionPoliciesDtoInput,
    ): Promise<SessionPolicyRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveSessionPoliciesQuery, SessionPolicy[]>(
            new RetrieveSessionPoliciesQuery(
                transactionId,
                tenantId,
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.displayName,
                dtoInput.codeName,
                dtoInput.codeNamePatterns,
            ),
        );

        return result;
    }
}
