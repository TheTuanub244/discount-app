import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountModule } from './discount-code/discount.module';
import { DiscountServiceService } from './discount-service/discount-service.service';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    DiscountModule,
    ProductModule,
  ],
  providers: [DiscountServiceService],
})
export class AppModule {}
