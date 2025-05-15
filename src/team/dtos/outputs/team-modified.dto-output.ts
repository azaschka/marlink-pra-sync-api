import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../../models';

export class TeamModifiedDtoOutput implements Team {
    @ApiProperty({ required: true, type: Number })
    public id!: number;

    @ApiProperty({ required: true, type: String })
    public name!: string;

    @ApiProperty({ required: false, type: String })
    public codeName?: string;

    @ApiProperty({ required: false, type: String, nullable: true })
    public comments?: string | null;
}
