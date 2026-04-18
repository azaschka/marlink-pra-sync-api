import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { NodeServiceType } from '../../enums';

export class CreateNodeServiceDtoInput {
    @Expose({ name: 'service_type' })
    @IsEnum(NodeServiceType)
    @IsNotEmpty()
    public serviceType!: NodeServiceType;

    public static create(serviceType: NodeServiceType): CreateNodeServiceDtoInput {
        const dto = new CreateNodeServiceDtoInput();
        dto.serviceType = serviceType;
        return dto;
    }
}
