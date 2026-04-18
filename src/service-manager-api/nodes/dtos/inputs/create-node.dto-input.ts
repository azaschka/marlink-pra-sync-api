import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BusinessUnit, HypervisorType } from '../../enums';

export class CreateNodeDtoInput {
    @Expose({ name: 'site_id' })
    @IsString()
    @IsNotEmpty()
    public siteId!: string;

    @Expose({ name: 'business_unit' })
    @IsEnum(BusinessUnit)
    @IsNotEmpty()
    public businessUnit!: BusinessUnit;

    @Expose({ name: 'hypervisor_id' })
    @IsString()
    @IsOptional()
    public hypervisorId?: string;

    @Expose({ name: 'hypervisor_type' })
    @IsEnum(HypervisorType)
    @IsOptional()
    public hypervisorType?: HypervisorType;

    @Expose({ name: 'vm_id' })
    @IsNumber()
    @IsOptional()
    public vmId?: number;

    public static create(
        siteId: string,
        businessUnit: BusinessUnit,
        hypervisorId?: string,
        hypervisorType?: HypervisorType,
        vmId?: number,
    ): CreateNodeDtoInput {
        const dto = new CreateNodeDtoInput();
        dto.siteId = siteId;
        dto.businessUnit = businessUnit;
        dto.hypervisorId = hypervisorId;
        dto.hypervisorType = hypervisorType;
        dto.vmId = vmId;

        return dto;
    }
}
