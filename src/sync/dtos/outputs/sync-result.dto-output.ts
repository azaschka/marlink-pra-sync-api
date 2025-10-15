import { ApiProperty } from '@nestjs/swagger';
import { SyncEntityType } from '../../enums';
import { SyncComparisonOverview } from '../../models';

export class SyncComparisonOverviewDtoOutput implements SyncComparisonOverview {
    @ApiProperty({ required: true, type: Number, description: 'Tenant ID' })
    public tenantId!: number;

    @ApiProperty({ required: true, enum: SyncEntityType, description: 'Sync Entity Type' })
    public syncEntityType!: SyncEntityType;

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
