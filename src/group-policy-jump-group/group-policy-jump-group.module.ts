import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AppConfigModule } from '../app-config/app-config.module';
import { BeyondtrustInstance } from '../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyJumpGroupController } from './controllers/group-policy-jump-group.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyJumpGroupRepositoryService } from './repositories/services/group-policy-jump-group-repository.service';
import { GroupPolicyJumpGroupsSaga } from './sagas';

@Module({
    imports: [AppConfigModule],
    controllers: [GroupPolicyJumpGroupController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ...EventHandlers,
        GroupPolicyJumpGroupRepositoryService,
        GroupPolicyJumpGroupsSaga,
    ],
})
export class GroupPolicyJumpGroupModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        GroupPolicyJumpGroupModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.groupPolicyJumpGroupRepositoryService.createAndConnectTable(
                        btInstance.id,
                    );
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Group Policy Jump Group) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
