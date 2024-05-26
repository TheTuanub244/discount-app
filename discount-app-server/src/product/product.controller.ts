import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('/getAllProduct')
  async handleGetAllProduct() {
    return this.productService.getAllProduct();
  }
  @Post('/getProductById')
  async handleGetProductById(@Body() id: any) {
    const data = await this.productService.getProductById(id);
    return data;
  }
}
