import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto {
  @IsString({
    message: 'Must be string',
  })
  @IsNotEmpty({
    message: 'Not empty',
  })
  @ApiProperty()
  search: string;
}
