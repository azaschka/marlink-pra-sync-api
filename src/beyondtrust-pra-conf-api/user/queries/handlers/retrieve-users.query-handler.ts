import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveUsersDtoInput } from '../../dtos/inputs';
import { UserRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveUsersQuery } from '../retrieve-users.query';

@QueryHandler(RetrieveUsersQuery)
export class RetrieveUsersQueryHandler implements IQueryHandler<RetrieveUsersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveUsersQuery): Promise<UserRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.user.path,
        );

        return await this.httpClientService.get<UserRetrievedDtoOutput, UserRetrievedDtoOutput[]>(
            UserRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveUsersDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.securityProviderId,
                query.username,
                query.email,
            ),
        );
    }
}
