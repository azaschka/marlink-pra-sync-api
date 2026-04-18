import { Expose } from 'class-transformer';
import { BusinessUnitFullName, HypervisorType } from '../../enums';

export class NodeCreatedDtoOutput {
    public certname!: string;

    @Expose({ name: 'hypervisor_id' })
    public hypervisorId?: string;

    @Expose({ name: 'hypervisor_type' })
    public hypervisorType?: HypervisorType;

    @Expose({ name: 'business_unit' })
    public businessUnit!: BusinessUnitFullName;

    @Expose({ name: 'site_id' })
    public siteId!: string;

    @Expose({ name: 'customer_name' })
    public customerName?: string | null;

    @Expose({ name: 'vm_id' })
    public vmId?: number;

    public status!: string;

    @Expose({ name: 'puppet_server_domain' })
    public puppetServerDomain!: string;
}
