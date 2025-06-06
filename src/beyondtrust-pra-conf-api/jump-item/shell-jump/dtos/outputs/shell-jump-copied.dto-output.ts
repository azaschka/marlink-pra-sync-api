import { Expose } from 'class-transformer';

export class ShellJumpCopiedDtoOutput {
    @Expose({ name: 'action' })
    public action!: string;

    @Expose({ name: 'success' })
    public success!: string;

    @Expose({ name: 'destId' })
    public destId!: number;
}
