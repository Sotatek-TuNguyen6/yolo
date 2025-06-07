import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UserReportRequestDto {
  @ApiProperty({
    description: 'Start date for the report (YYYY-MM-DD)',
    example: '2023-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date for the report (YYYY-MM-DD)',
    example: '2023-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Include detailed user data in the response',
    example: false,
    required: false,
  })
  @IsOptional()
  includeDetails?: boolean;
}
