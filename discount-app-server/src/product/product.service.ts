import { Injectable } from '@nestjs/common';
import { getAllProduct } from '../discount-code/graphql/product';
import { client } from '../main';

@Injectable()
export class ProductService {
  async getAllProduct() {
    const data = await client.request(getAllProduct);
    return data;
  }
  async getProductById(id: any) {
    const data = await client.request(`
    query {
        product(id: "${id.id}") {
          title
          id
          description
          onlineStoreUrl
          featuredImage{
            url
          }
          compareAtPriceRange{
            maxVariantCompareAtPrice {
              amount
            }
          }
        }
      }
    `);
    return data;
  }
}
