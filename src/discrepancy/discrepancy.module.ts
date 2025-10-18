import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { BeyondtrustInstance } from '../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../beyondtrust-instance/queries';
import { ErrorProcessorUtility, PaginationUtility, UuidUtility } from '../shared/utilities';
import { CommandHandlers } from './commands/handlers';
import { DiscrepancyScannerJobController } from './controllers/discrepancy-scanner-job.controller';
import { DiscrepancyScannerController } from './controllers/discrepancy-scanner.controller';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { DiscrepancyEntity } from './repositories/entities';
import { DiscrepancyRepositoryService } from './repositories/services/discrepancy-repository.service';
import { Sagas } from './sagas';

@Module({
    imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([DiscrepancyEntity]), AppConfigModule],
    controllers: [DiscrepancyScannerController, DiscrepancyScannerJobController],
    providers: [
        DiscrepancyScannerController,
        DiscrepancyRepositoryService,
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
