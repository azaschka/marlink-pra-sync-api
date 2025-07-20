import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BeyondtrustInstanceEntity } from '../../../beyondtrust-instance/repositories/entities';
import { BeyondtrustInstanceBackup } from '../../models';

@Entity({ name: 'beyondtrust_instance_backups' })
export class BeyondtrustInstanceBackupEntity implements BeyondtrustInstanceBackup {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    public id!: number;

    @Column({ name: 'beyondtrust_instance_id', type: 'int' })
    public beyondtrustInstanceId!: number;

    @Column({ name: 'backup_file_path', type: 'varchar' })
    public backupFilePath!: string;

    @CreateDateColumn({ name: 'creation_date', type: 'timestamp' })
    public creationDate!: Date;

    @ManyToOne(
        () => BeyondtrustInstanceEntity,
        (beyondtrustInstance) => beyondtrustInstance.beyondtrustInstanceBackups,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'beyondtrust_instance_id' })
    public beyondtrustInstance!: BeyondtrustInstanceEntity;

    public static createWithoutId(
        beyondtrustInstanceId: number,
        backupFilePath: string,
    ): BeyondtrustInstanceBackupEntity {
        const entity = new BeyondtrustInstanceBackupEntity();
        entity.beyondtrustInstanceId = beyondtrustInstanceId;
        entity.backupFilePath = backupFilePath;

        return entity;
    }
}
