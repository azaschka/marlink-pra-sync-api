import { DataSource } from 'typeorm';

export class BaseRepositoryService<T> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly entity: new () => T,
    ) {}

    public async create(entity: T): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(this.entity, entity);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
