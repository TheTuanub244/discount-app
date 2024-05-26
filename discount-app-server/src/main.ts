import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-04';
import '@shopify/shopify-api/adapters/node';
import { ValidationPipe } from '@nestjs/common';
require('dotenv').config();
export const shopify = shopifyApi({
  apiSecretKey: process.env.APISECRETKEY,
  apiKey: process.env.APIKEY,
  adminApiAccessToken: process.env.SHOPACCESSTOKEN,
  scopes: [
    'write_products',
    'read_products',
    'read_products',
    'write_discounts',
    'read_discounts',
    'read_product_listings',
  ],
  hostName: 'https://quickstart-4e21dcd1.myshopify.com',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  isCustomStoreApp: true,
  restResources,
});
export const session = shopify.session.customAppSession(
  'quickstart-4e21dcd1.myshopify.com',
);
export const client = new shopify.clients.Graphql({ session });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(8000);
}
bootstrap();
