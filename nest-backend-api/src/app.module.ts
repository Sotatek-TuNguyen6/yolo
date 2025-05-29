import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AddressModule } from './address/address.module';
import { ProductsModule } from './products/products.module';
import { ColorsModule } from './colors/colors.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { CommentsModule } from './comments/comments.module';
import { SizeModule } from './size/size.module';
import { CartsModule } from './carts/carts.module';
import { UploadModule } from './upload/upload.module';

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
    AddressModule,
    ProductsModule,
    ColorsModule,
    CategoriesModule,
    SubCategoryModule,
    CommentsModule,
    SizeModule,
    CartsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
