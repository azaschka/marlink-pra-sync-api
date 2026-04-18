import { Expose } from 'class-transformer';
import { NodeServiceType } from '../../enums';

export class NodeServiceCreatedDtoOutput {
    @Expose({ name: 'service_type' })
    public serviceType!: NodeServiceType;
}
