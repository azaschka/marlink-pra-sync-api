import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class JumpClientCopiedDtoOutput {
    @IsString()
    @IsNotEmpty()
    public action!: string;

    @IsString()
    @IsNotEmpty()
    public success!: string;

    @IsInt()
    @IsNotEmpty()
    public destId!: number;
}
