import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { SyncDiscrepancyByEntityIdFailedEvent } from '../../events';
import { Discrepancy } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { SyncDiscrepancyByEntityIdCommand } from '../sync-discrepancy-by-entity-id.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';
import { SyncDiscrepancyByEntityIdCommandHandler } from './sync-discrepancy-by-entity-id.command-handler';

const TENANT_ID = 1;

describe('SyncDiscrepancyByEntityIdCommandHandler', () => {
    let records: Discrepancy[];
    let findByEntityId: jest.Mock;
    let findByParentAndChild: jest.Mock;
    let execute: jest.Mock;
    let publish: jest.Mock;
    let handler: SyncDiscrepancyByEntityIdCommandHandler;

    beforeEach(() => {
        records = [];
        // In-memory lookups with the semantics of the repository (first match, like findOneBy).
        findByEntityId = jest.fn((_tenantId: number, entityType: DiscrepancyEntityType, entityId: number) =>
            Promise.resolve(records.find((r) => r.entityType === entityType && r.entityId === entityId) ?? null),
        );
        findByParentAndChild = jest.fn(
            (_tenantId: number, entityType: DiscrepancyEntityType, entityId: number, foreignEntityId: number) =>
                Promise.resolve(
                    records.find(
                        (r) =>
                            r.entityType === entityType &&
                            r.entityId === entityId &&
                            r.foreignEntityId === foreignEntityId,
                    ) ?? null,
                ),
        );
        execute = jest.fn().mockResolvedValue(undefined);
        publish = jest.fn();
        handler = new SyncDiscrepancyByEntityIdCommandHandler(
            {
                findOneByEntityTypeAndEntityId: findByEntityId,
                findOneByEntityTypeEntityIdAndForeignEntityId: findByParentAndChild,
            } as unknown as DiscrepancyRepositoryService,
            { execute } as unknown as CommandBus,
            { publish } as unknown as EventBus,
        );
    });

    describe('main entity types', () => {
        it('finds the record by entity type and entity id and syncs it by its record id', async () => {
            records.push(record(11, DiscrepancyEntityType.User, 27));

            const result = await handler.execute(command(DiscrepancyEntityType.User, 27));

            expect(result).toEqual({ synced: true });
            expect(findByEntityId).toHaveBeenCalledWith(TENANT_ID, DiscrepancyEntityType.User, 27);
            expect(findByParentAndChild).not.toHaveBeenCalled();
            expect(execute).toHaveBeenCalledWith(
                new SyncDiscrepancyCommand('transaction-1', TENANT_ID, 11, DiscrepancySyncType.ExternalToInternal),
            );
        });

        it('reports a missing record as not synced and publishes the failure', async () => {
            const result = await handler.execute(command(DiscrepancyEntityType.User, 27));

            expect(result).toEqual({ synced: false, failureKind: 'Internal' });
            expect(execute).not.toHaveBeenCalled();
            expect(publish).toHaveBeenCalledWith(expect.any(SyncDiscrepancyByEntityIdFailedEvent));
        });
    });

    describe('relation entity types (MARLINKPRA-80)', () => {
        it('finds the record by parent and child', async () => {
            records.push(record(21, DiscrepancyEntityType.UserGroupPolicy, 27, 3));
            records.push(record(22, DiscrepancyEntityType.UserGroupPolicy, 27, 5));

            const result = await handler.execute(command(DiscrepancyEntityType.UserGroupPolicy, 27, 5));

            expect(result).toEqual({ synced: true });
            expect(findByParentAndChild).toHaveBeenCalledWith(TENANT_ID, DiscrepancyEntityType.UserGroupPolicy, 27, 5);
            expect(findByEntityId).not.toHaveBeenCalled();
            expect(execute).toHaveBeenCalledWith(
                new SyncDiscrepancyCommand('transaction-1', TENANT_ID, 22, DiscrepancySyncType.ExternalToInternal),
            );
        });

        it('never syncs the record of another parent whose id equals the child id', async () => {
            // User 3 has a discrepancy for group policy 9; user 27 has one for group policy 3.
            records.push(record(31, DiscrepancyEntityType.UserGroupPolicy, 3, 9));
            records.push(record(32, DiscrepancyEntityType.UserGroupPolicy, 27, 3));

            await handler.execute(command(DiscrepancyEntityType.UserGroupPolicy, 27, 3));

            expect(execute).toHaveBeenCalledTimes(1);
            expect(execute).toHaveBeenCalledWith(
                new SyncDiscrepancyCommand('transaction-1', TENANT_ID, 32, DiscrepancySyncType.ExternalToInternal),
            );
        });

        it('reports a missing relation record as not synced', async () => {
            records.push(record(41, DiscrepancyEntityType.GroupPolicyMember, 27, 3));

            const result = await handler.execute(command(DiscrepancyEntityType.GroupPolicyMember, 27, 4));

            expect(result).toEqual({ synced: false, failureKind: 'Internal' });
            expect(execute).not.toHaveBeenCalled();
            expect(publish).toHaveBeenCalledWith(expect.any(SyncDiscrepancyByEntityIdFailedEvent));
        });

        it('does not fall back to the parent alone when the child id is missing', async () => {
            records.push(record(51, DiscrepancyEntityType.TeamUser, 27, 3));

            const result = await handler.execute(command(DiscrepancyEntityType.TeamUser, 27));

            expect(result).toEqual({ synced: false, failureKind: 'Internal' });
            expect(findByEntityId).not.toHaveBeenCalled();
            expect(findByParentAndChild).not.toHaveBeenCalled();
            expect(execute).not.toHaveBeenCalled();
            expect(publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        errorMessage: expect.stringContaining('cannot be resolved without a child id') as string,
                    }) as object,
                }),
            );
        });

        it('reports a failed sync of the record as not synced', async () => {
            records.push(record(61, DiscrepancyEntityType.GroupPolicyJumpGroup, 7, 8));
            execute.mockRejectedValueOnce(new Error('sync failed'));

            const result = await handler.execute(command(DiscrepancyEntityType.GroupPolicyJumpGroup, 7, 8));

            expect(result).toEqual({ synced: false, failureKind: 'Internal' });
            expect(publish).toHaveBeenCalledWith(expect.any(SyncDiscrepancyByEntityIdFailedEvent));
        });
    });
});

function command(
    entityType: DiscrepancyEntityType,
    entityId: number,
    foreignEntityId?: number,
): SyncDiscrepancyByEntityIdCommand {
    return new SyncDiscrepancyByEntityIdCommand(
        'transaction-1',
        TENANT_ID,
        entityId,
        entityType,
        DiscrepancySyncType.ExternalToInternal,
        foreignEntityId,
    );
}

function record(
    id: number,
    entityType: DiscrepancyEntityType,
    entityId: number,
    foreignEntityId?: number,
): Discrepancy {
    return { id, entityType, entityId, foreignEntityId, creationDate: new Date() } as Discrepancy;
}
