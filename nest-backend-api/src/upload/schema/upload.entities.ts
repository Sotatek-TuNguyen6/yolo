import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Upload {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  public_id: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
