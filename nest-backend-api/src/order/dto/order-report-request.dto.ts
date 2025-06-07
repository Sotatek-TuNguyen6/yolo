import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class OrderReportRequestDto {
  @ApiProperty({
    description: 'Start date for the report (YYYY-MM-DD)',
    example: '2023-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report (YYYY-MM-DD)',
    example: '2023-12-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Include detailed order data in the response',
    example: false,
    required: false,
  })
  @IsOptional()
  includeDetails?: boolean;
}
