import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveShellJumpByIdQuery } from '../retrieve-shell-jump-by-id.query';

@QueryHandler(RetrieveShellJumpByIdQuery)
export class RetrieveShellJumpByIdQueryHandler implements IQueryHandler<RetrieveShellJumpByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveShellJumpByIdQuery): Promise<ShellJumpRetrievedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.shellJump.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<ShellJumpRetrievedDtoOutput, ShellJumpRetrievedDtoOutput>(
            ShellJumpRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
        );
    }
}
