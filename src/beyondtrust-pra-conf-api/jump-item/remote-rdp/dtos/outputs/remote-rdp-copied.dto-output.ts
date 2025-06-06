import { Expose } from 'class-transformer';

export class RemoteRdpCopiedDtoOutput {
    @Expose({ name: 'action' })
    public action!: string;

    @Expose({ name: 'success' })
    public success!: string;

    @Expose({ name: 'destId' })
    public destId!: number;
}
