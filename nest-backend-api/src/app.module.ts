import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ProductsModule } from './products/products.module';
import { UploadModule } from './upload/upload.module';
import { TagsModule } from './tags/tags.module';
import { ReportModule } from './report/report.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://nguyendinhtu11022002:hzEJ30gfyQ4EsFgz@lumen.vojuhla.mongodb.net/?retryWrites=true&w=majority&appName=Lumen',
    ),
    OrderModule,
    UsersModule,
    AuthModule,
    MailModule,
    ProductsModule,
    UploadModule,
    TagsModule,
    ReportModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
