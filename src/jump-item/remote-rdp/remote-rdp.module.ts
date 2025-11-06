import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AppConfigModule } from '../../app-config/app-config.module';
import { BeyondtrustInstance } from '../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { RemoteRdpController } from './controllers/remote-rdp.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { RemoteRdpRepositoryService } from './repositories/services/remote-rdp-repository.service';
import { RemoteRdpService } from './services/remote-rdp.service';

@Module({
    imports: [AppConfigModule],
    controllers: [RemoteRdpController],
    providers: [...QueryHandlers, ...CommandHandlers, ...EventHandlers, RemoteRdpRepositoryService, RemoteRdpService],
    exports: [RemoteRdpService],
})
export class RemoteRdpModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        RemoteRdpModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.remoteRdpRepositoryService.createAndConnectTable(btInstance.id);
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Remote RDP) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
