import { DataSource } from 'typeorm';

export class BaseRepositoryService<T> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly entity: new () => T,
    ) {}

    public async create(entity: T): Promise<T> {
        const queryRunner = await this.createQueryRunnerAndConnect();
        await queryRunner.startTransaction();

        try {
            const createdEntity = queryRunner.manager.create(this.entity, entity);
            await queryRunner.manager.save(createdEntity);
            await queryRunner.commitTransaction();

            return createdEntity;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async createOrUpdate<K extends Extract<keyof T, string>>(
        entity: Partial<T>,
        conflictPaths: K[],
    ): Promise<void> {
        const queryRunner = await this.createQueryRunnerAndConnect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.upsert(this.entity, entity, {
                conflictPaths,
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async findOneBy<K extends Extract<keyof T, string>>(where: Pick<T, K>): Promise<T | null> {
        const queryRunner = await this.createQueryRunnerAndConnect();

        try {
            const entity = await queryRunner.manager.findOne(this.entity, {
                where: where,
            });

            return entity as T | null;
        } finally {
            await queryRunner.release();
        }
    }

    public async deleteBy<K extends Extract<keyof T, string>>(where: Pick<T, K>): Promise<void> {
        const queryRunner = await this.createQueryRunnerAndConnect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(this.entity, where);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async createQueryRunnerAndConnect() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        return queryRunner;
    }
}
