import { DataSource } from 'typeorm';

export class BaseRepositoryService<T> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly entity: new () => T,
    ) {}

    public async create(entity: T): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const createdEntity = queryRunner.manager.create(this.entity, entity);
            await queryRunner.manager.save(entity);
            await queryRunner.commitTransaction();

            return createdEntity;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
