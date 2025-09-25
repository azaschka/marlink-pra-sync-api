import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RetrieveShellJumpsDtoInput } from '../../dtos/inputs';
import { ShellJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveShellJumpsQuery } from '../retrieve-shell-jumps.query';

@QueryHandler(RetrieveShellJumpsQuery)
export class RetrieveShellJumpsQueryHandler implements IQueryHandler<RetrieveShellJumpsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveShellJumpsQuery): Promise<ShellJumpRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.shellJump.path,
        );

        return await this.httpClientService.get<ShellJumpRetrievedDtoOutput, ShellJumpRetrievedDtoOutput[]>(
            ShellJumpRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveShellJumpsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.jumpGroupId,
                query.jumpGroupType,
                query.jumpointId,
                query.tag,
            ),
        );
    }
}
