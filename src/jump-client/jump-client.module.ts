import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AppConfigModule } from '../app-config/app-config.module';
import { BeyondtrustInstance } from '../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { JumpClientInstallerController } from './controllers/jump-client-installer.controller';
import { JumpClientController } from './controllers/jump-client.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { JumpClientInstallerRepositoryService } from './repositories/services/jump-client-installer-repository.service';
import { JumpClientRepositoryService } from './repositories/services/jump-client-repository.service';

@Module({
    imports: [AppConfigModule],
    controllers: [JumpClientController, JumpClientInstallerController],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
        ...EventHandlers,
        JumpClientRepositoryService,
        JumpClientInstallerRepositoryService,
    ],
})
export class JumpClientModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly jumpClientRepositoryService: JumpClientRepositoryService,
        private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        JumpClientModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.jumpClientRepositoryService.createAndConnectTable(btInstance.id);
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Jump Client) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }

                try {
                    const { tableName } = await this.jumpClientInstallerRepositoryService.createAndConnectTable(
                        btInstance.id,
                    );
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Jump Client Installer) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
