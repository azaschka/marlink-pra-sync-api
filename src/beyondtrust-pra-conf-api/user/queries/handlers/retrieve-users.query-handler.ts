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
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.user.path,
        );

        return await this.httpClientService.get<UserRetrievedDtoOutput, UserRetrievedDtoOutput[]>(
            UserRetrievedDtoOutput,
            url,
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
