import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { RetrieveJumpointInstallerQuery as BTRetrieveJumpointInstallerQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { RetrieveJumpointInstallerQuery } from '../retrieve-jumpoint-installer.query';

@QueryHandler(RetrieveJumpointInstallerQuery)
export class RetrieveJumpointInstallerQueryHandler implements IQueryHandler<RetrieveJumpointInstallerQuery> {
    constructor(private readonly queryBus: QueryBus) {}

    public async execute(query: RetrieveJumpointInstallerQuery): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        return this.queryBus.execute<BTRetrieveJumpointInstallerQuery, Promise<AxiosResponse<NodeJS.ReadableStream>>>(
            new BTRetrieveJumpointInstallerQuery(query.transactionId, query.jumpointId),
        );
    }
}
