import { JumpGroupEntity } from './jump-group.entity';

describe('JumpGroupEntity', () => {
    describe('create', () => {
        it.each([
            [123, 'JumpGroup 1', undefined, undefined],
            [456, 'JumpGroup 2', 'jump-group-code-2', 'jump group comments 2'],
        ])(
            'should create the entity with the provided parameters (id: %s, name: %s)',
            (id, name, codeName, comments) => {
                const jumpGroupEntity = JumpGroupEntity.create(id, name, codeName, comments);

                expect(jumpGroupEntity).toBeInstanceOf(JumpGroupEntity);
                expect(jumpGroupEntity.id).toBe(id);
                expect(jumpGroupEntity.name).toBe(name);
                expect(jumpGroupEntity.codeName).toBe(codeName);
                expect(jumpGroupEntity.comments).toBe(comments);
            },
        );
    });
});
