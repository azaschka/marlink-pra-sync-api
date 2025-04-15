import { IsString, IsNotEmpty } from 'class-validator';

export class JumpClientInstallerKeyInfoRetrievedDtoOutput {
    @IsString()
    @IsNotEmpty()
    public encodedInfo!: string;

    @IsString()
    @IsNotEmpty()
    public filename!: string;

    @IsString()
    @IsNotEmpty()
    public installerPath!: string;
}
