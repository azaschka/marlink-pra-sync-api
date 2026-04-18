import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JumpointNodeBusinessUnit, JumpointNodeHypervisorType, JumpointNodeServiceType } from '../../enums';
import { JumpointNode } from '../../models';

@Entity({ name: 'jumpoint_nodes' })
export class JumpointNodeEntity implements JumpointNode {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    public id!: number;

    @Column({ name: 'certname', type: 'varchar' })
    public certname!: string;

    @Column({ name: 'business_unit', type: 'enum', enum: JumpointNodeBusinessUnit, nullable: true })
    public businessUnit!: JumpointNodeBusinessUnit;

    @Column({ name: 'site_key', type: 'varchar' })
    public siteKey!: string;

    @Column({ name: 'status', type: 'varchar' })
    public status!: string;

    @Column({ name: 'puppet_server_domain', type: 'varchar' })
    public puppetServerDomain!: string;

    @Column({ name: 'hypervisor_id', type: 'varchar', nullable: true })
    public hypervisorId?: string;

    @Column({ name: 'hypervisor_type', type: 'enum', enum: JumpointNodeHypervisorType, nullable: true })
    public hypervisorType?: JumpointNodeHypervisorType;

    @Column({ name: 'customer_name', type: 'varchar', nullable: true })
    public customerName?: string | null;

    @Column({ name: 'vm_id', type: 'int', nullable: true })
    public vmId?: number;

    @Column({ name: 'service_type', type: 'enum', enum: JumpointNodeServiceType, nullable: true })
    public serviceType?: JumpointNodeServiceType;

    @Column({ name: 'has_approval', type: 'boolean', nullable: true })
    public hasApproval?: boolean;

    @Column({ name: 'iso_file_path', type: 'varchar', nullable: true })
    public isoFilePath?: string;

    @CreateDateColumn({ name: 'creation_date', type: 'timestamp' })
    public creationDate!: Date;

    @UpdateDateColumn({ name: 'last_modification_date', type: 'timestamp', nullable: true })
    public lastModificationDate?: Date;

    public static createWithoutId(
        certname: string,
        businessUnit: JumpointNodeBusinessUnit,
        siteKey: string,
        status: string,
        puppetServerDomain: string,
        hypervisorId?: string,
        hypervisorType?: JumpointNodeHypervisorType,
        customerName?: string | null,
        vmId?: number,
        serviceType?: JumpointNodeServiceType,
        hasApproval?: boolean,
        isoFilePath?: string,
    ): JumpointNodeEntity {
        const entity = new JumpointNodeEntity();
        entity.certname = certname;
        entity.businessUnit = businessUnit;
        entity.siteKey = siteKey;
        entity.status = status;
        entity.puppetServerDomain = puppetServerDomain;
        entity.isoFilePath = isoFilePath;
        entity.serviceType = serviceType;
        entity.hasApproval = hasApproval;
        entity.hypervisorId = hypervisorId;
        entity.hypervisorType = hypervisorType;
        entity.customerName = customerName;
        entity.vmId = vmId;

        return entity;
    }
}
