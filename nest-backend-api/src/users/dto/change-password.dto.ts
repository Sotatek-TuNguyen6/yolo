import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Old password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
