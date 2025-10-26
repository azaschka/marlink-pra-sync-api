import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AppConfigModule } from '../app-config/app-config.module';
import { BeyondtrustInstance } from '../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { TeamUserController } from './controllers/team-user.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { TeamUserRepositoryService } from './repositories/services/team-user-repository.service';
import { TeamUserService } from './services/team-user.service';

@Module({
    imports: [AppConfigModule],
    controllers: [TeamUserController],
    providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers, TeamUserRepositoryService, TeamUserService],
    exports: [TeamUserService],
})
export class TeamUserModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly teamUserRepositoryService: TeamUserRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        TeamUserModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.teamUserRepositoryService.createAndConnectTable(btInstance.id);
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Team User) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
