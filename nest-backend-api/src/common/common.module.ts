import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { CounterService } from './services/counter.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CommonModule {}
