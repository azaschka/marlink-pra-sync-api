import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { BeyondtrustInstance } from '../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../beyondtrust-instance/queries';
import { GroupPolicyJumpGroupModule } from '../group-policy-jump-group/group-policy-jump-group.module';
import { GroupPolicyJumpointModule } from '../group-policy-jumpoint/group-policy-jumpoint.module';
import { GroupPolicyMemberModule } from '../group-policy-member/group-policy-member.module';
import { GroupPolicyTeamModule } from '../group-policy-team/group-policy-team.module';
import { GroupPolicyModule } from '../group-policy/group-policy.module';
import { JumpClientModule } from '../jump-client/jump-client.module';
import { JumpGroupModule } from '../jump-group/jump-group.module';
import { ProtocolTunnelJumpModule } from '../jump-item/protocol-tunnel-jump/protocol-tunnel-jump.module';
import { RemoteRdpModule } from '../jump-item/remote-rdp/remote-rdp.module';
import { RemoteVncModule } from '../jump-item/remote-vnc/remote-vnc.module';
import { ShellJumpModule } from '../jump-item/shell-jump/shell-jump.module';
import { WebJumpModule } from '../jump-item/web-jump/web-jump.module';
import { JumpPolicyModule } from '../jump-policy/jump-policy.module';
import { JumpointModule } from '../jumpoint/jumpoint.module';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../shared/utilities';
import { TeamUserModule } from '../team-user/team-user.module';
import { TeamModule } from '../team/team.module';
import { UserGroupPolicyModule } from '../user-group-policy/user-group-policy.module';
import { UserModule } from '../user/user.module';
import { CommandHandlers } from './commands/handlers';
import { DiscrepancyScannerJobController } from './controllers/discrepancy-scanner-job.controller';
import { DiscrepancyScannerController } from './controllers/discrepancy-scanner.controller';
import { DiscrepancySyncController } from './controllers/discrepancy-sync.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { DiscrepancyEntity } from './repositories/entities';
import { DiscrepancyRepositoryService } from './repositories/services/discrepancy-repository.service';
import { Sagas } from './sagas';
import { DiscrepancyScannerService } from './services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from './services/discrepancy-strategy-provider.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([DiscrepancyEntity]),
        AppConfigModule,
        GroupPolicyModule,
        GroupPolicyJumpGroupModule,
        GroupPolicyJumpointModule,
        GroupPolicyMemberModule,
        GroupPolicyTeamModule,
        JumpClientModule,
        JumpGroupModule,
        JumpPolicyModule,
        JumpointModule,
        ProtocolTunnelJumpModule,
        RemoteRdpModule,
        RemoteVncModule,
        ShellJumpModule,
        WebJumpModule,
        TeamUserModule,
        TeamModule,
        UserModule,
        UserGroupPolicyModule,
    ],
    controllers: [DiscrepancyScannerController, DiscrepancyScannerJobController, DiscrepancySyncController],
    providers: [
        DiscrepancyScannerController,
        DiscrepancyRepositoryService,
        DiscrepancyStrategyProviderService,
        DiscrepancyScannerService,
        ...CommandHandlers,
        ...QueryHandlers,
        ...EventHandlers,
        ...Sagas,
    ],
})
export class DiscrepancyModule implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
    ) {}

    public async onApplicationBootstrap() {
        try {
            const btInstances = await PaginationUtility.queryUntilLastPage((pageNumber) => {
                return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                    new RetrieveBeyondtrustInstancesQuery(
                        UuidUtility.generate(),
                        DiscrepancyModule.MAX_PAGE_SIZE,
                        pageNumber,
                    ),
                );
            });

            for (const btInstance of btInstances) {
                try {
                    const { tableName } = await this.discrepancyRepositoryService.createAndConnectTable(btInstance.id);
                    console.log(`[DB_TABLE][BT_ID][CONNECTION]: ${tableName} | ${btInstance.id} | SUCCESS`);
                } catch (error) {
                    console.error(
                        `[DB_TABLE][BT_ID][CONNECTION]: (Discrepancy) | ${btInstance.id} | FAILED (${ErrorProcessorUtility.stringify(error)})`,
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to retrieve BeyondTrust instances: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
