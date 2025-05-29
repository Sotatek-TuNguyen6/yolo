import { Module } from '@nestjs/common';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import { Size, SizeSchema } from './entities/size.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Size.name, schema: SizeSchema }]),
  ],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
