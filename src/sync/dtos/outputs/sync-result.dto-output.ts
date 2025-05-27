import { ApiProperty } from '@nestjs/swagger';

export class SyncResultDtoOutput {
    @ApiProperty({ required: true, type: [Number] })
    public readonly createdIds!: number[];

    @ApiProperty({ required: true, type: [Number] })
    public readonly updatedIds!: number[];

    @ApiProperty({ required: true, type: [Number] })
    public readonly deletedIds!: number[];
}
