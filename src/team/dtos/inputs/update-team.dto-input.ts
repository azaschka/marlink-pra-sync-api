import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDtoInput {
    @ApiProperty({ required: true, type: String })
    public name!: string;

    @ApiProperty({ required: false, type: String })
    public codeName?: string;

    @ApiProperty({ required: false, type: String, nullable: true })
    public comments?: string | null;
}
