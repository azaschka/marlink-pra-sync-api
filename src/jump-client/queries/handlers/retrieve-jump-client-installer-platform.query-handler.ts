import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { RetrieveJumpClientInstallerPlatformQuery as BTRetrieveJumpClientInstallerPlatformQuery } from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { RetrieveJumpClientInstallerPlatformQuery } from '../retrieve-jump-client-installer-platform.query';

@QueryHandler(RetrieveJumpClientInstallerPlatformQuery)
export class RetrieveJumpClientInstallerPlatformQueryHandler
    implements IQueryHandler<RetrieveJumpClientInstallerPlatformQuery>
{
    constructor(private readonly queryBus: QueryBus) {}

    public async execute(
        query: RetrieveJumpClientInstallerPlatformQuery,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        return this.queryBus.execute<
            BTRetrieveJumpClientInstallerPlatformQuery,
            Promise<AxiosResponse<NodeJS.ReadableStream>>
        >(
            new BTRetrieveJumpClientInstallerPlatformQuery(
                query.transactionId,
                query.tenantId,
                query.installerId,
                query.platformType,
            ),
        );
    }
}
