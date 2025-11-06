import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AppConfigModule } from '../../app-config/app-config.module';
import { BeyondtrustInstance } from '../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { ShellJumpController } from './controllers/shell-jump.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { ShellJumpRepositoryService } from './repositories/services/shell-jump-repository.service';
import { ShellJumpService } from './services/shell-jump.service';

@Module({
    imports: [AppConfigModule],
    controllers: [ShellJumpController],
    providers: [...QueryHandlers, ...CommandHandlers, ...EventHandlers, ShellJumpRepositoryService, ShellJumpService],
    exports: [ShellJumpService],
})
export class ShellJumpModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        ShellJumpModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.shellJumpRepositoryService.createAndConnectTable(btInstance.id);
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Shell Jump) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
