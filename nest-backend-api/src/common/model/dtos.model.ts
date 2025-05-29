import { ApiProperty } from '@nestjs/swagger';

export class PageDto {
  @ApiProperty({
    default: 1,
  })
  page: number;
}

export class LimitDto {
  @ApiProperty({
    default: 9,
  })
  limit: number;
}
