import { TeamEntity } from './team.entity';

describe('TeamEntity', () => {
    describe('create', () => {
        it.each([
            [123, 'Team 1', undefined, undefined],
            [456, 'Team 2', 'team-code-2', 'team comments 2'],
        ])(
            'should create the entity with the provided parameters (id: %s, name: %s)',
            (id, name, codeName, comments) => {
                const teamEntity = TeamEntity.create(id, name, codeName, comments);

                expect(teamEntity).toBeInstanceOf(TeamEntity);
                expect(teamEntity.id).toBe(id);
                expect(teamEntity.name).toBe(name);
                expect(teamEntity.codeName).toBe(codeName);
                expect(teamEntity.comments).toBe(comments);
            },
        );
    });
});
