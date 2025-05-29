import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class TokenBlacklist extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty()
  token: string;

  @Prop({ required: true })
  @ApiProperty()
  userId: string;

  @Prop({ required: true })
  @ApiProperty()
  expiresAt: Date;
}

export const TokenBlacklistSchema =
  SchemaFactory.createForClass(TokenBlacklist);

// Tạo index TTL để tự động xóa token hết hạn
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
