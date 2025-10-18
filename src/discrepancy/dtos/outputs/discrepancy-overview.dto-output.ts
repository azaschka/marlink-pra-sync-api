import { ApiProperty } from '@nestjs/swagger';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyOverview } from '../../models';

export class DiscrepancyOverviewDtoOutput implements DiscrepancyOverview {
    @ApiProperty({ required: true, enum: DiscrepancyEntityType, description: 'Entity Type' })
    public entityType!: DiscrepancyEntityType;

    @ApiProperty({ required: true, type: Number, description: 'Total BT Data' })
    public totalBtData!: number;

    @ApiProperty({ required: true, type: Number, description: 'Total DB Data' })
    public totalDbData!: number;

    @ApiProperty({ required: true, type: [Number], description: 'Identical Data IDs' })
    public identicalDataIds!: number[];

    @ApiProperty({ required: true, type: [Number], description: 'Only in BT IDs' })
    public onlyInBtIds!: number[];

    @ApiProperty({ required: true, type: [Number], description: 'Only in DB IDs' })
    public onlyInDbIds!: number[];

    @ApiProperty({ required: true, type: [Number], description: 'Different Data IDs' })
    public differentDataIds!: number[];
}
