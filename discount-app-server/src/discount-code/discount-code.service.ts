import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscountCodeApp } from '../schemas/DiscountCodeApp.schema';
import { DiscountCodeBasic } from '../schemas/DiscountCodeBasic.schema';
import { DiscountCodeBxGy } from '../schemas/DiscountCodeBxGy.schema';
import { DiscountCodeFreeShipping } from '../schemas/DiscountCodeFreeShipping.schema';
import { DiscountCodeAppDto } from './dto/level-2/create-discountCodeApp.dto';
import { Metafield } from '../schemas/Metafield.schema';
import { BasicDetail } from '../schemas/BasicDetails.schema';
import { DiscountBasicService } from './discountBasic.service';
import { DiscountCodebBasicDto } from './dto/level-2/create-discountCodeBasic.dto';
import { DiscountCodeFreeShippingDto } from './dto/level-2/create-discountCodeFreeShipping.dto';
import { client } from '../main';
import {
  CREATEDISCOUNTCODEBUYXGETY,
  createDiscountCodeBasic,
  createDiscountCodeFreeShipping,
} from './graphql/codeDiscount';
import { CombinesWith } from '../schemas/CombinesWith.schema';
import { DiscountCustomerGets } from 'src/schemas/DiscountCustomerGets.schema';
import { DiscountCustomerBuys } from 'src/schemas/DiscountCustomerBuys.schema';
import { log } from '@shopify/shopify-api/lib/logger/log';

@Injectable()
export class DiscountCodeService {
  constructor(
    @InjectModel(DiscountCodeApp.name)
    private discountCodeAppModel: Model<DiscountCodeApp>,
    @InjectModel(DiscountCodeBasic.name)
    private discountCodeBasicModel: Model<DiscountCodeBasic>,
    @InjectModel(DiscountCodeBxGy.name)
    private discountCodeBxGyModel: Model<DiscountCodeBxGy>,
    @InjectModel(DiscountCodeFreeShipping.name)
    private discountCodeFreeShippingModel: Model<DiscountCodeFreeShipping>,
    @InjectModel(Metafield.name)
    private metafieldModel: Model<Metafield>,
    @InjectModel(CombinesWith.name)
    private combinesWithModel: Model<CombinesWith>,
    @InjectModel(BasicDetail.name)
    private basicDetailModel: Model<BasicDetail>,
    private readonly discountBasicService: DiscountBasicService,
  ) {}
  async createDiscountCodeApp({
    metafield,
    basicDetail,
    ...DiscountCodeAppDto
  }: DiscountCodeAppDto) {
    if (metafield && basicDetail) {
      const newMetafield = new this.metafieldModel(metafield);
      const savedMetafield = await newMetafield.save();
      const savedBasicDetail =
        await this.discountBasicService.createBasicDetail(basicDetail);
      const newDiscountCodeApp = new this.discountCodeAppModel({
        ...DiscountCodeApp,
        metafield: savedMetafield._id,
        basicDetail: savedBasicDetail._id,
      });
      return newDiscountCodeApp.save();
    }
    const newDiscountCodeApp = new this.discountCodeAppModel(
      DiscountCodeAppDto,
    );
    return newDiscountCodeApp.save();
  }
  async createDiscountCodeBxGy({
    basicDetail,
    discountCustomerBuys,
    discountCustomerGets,
    ...discountCodeBxGy
  }) {
    if (basicDetail && discountCustomerBuys && discountCustomerGets) {
      try {
        const savedBasicDetail =
          await this.discountBasicService.createBasicDetail(basicDetail);
        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              type: 'Code',
              method: 'Product Discount',
              status: 'ACTIVE',
            },
          },
          { new: true },
        );
        const savedDiscountCustomerBuys =
          await this.discountBasicService.createDiscountCustomerBuys(
            discountCustomerBuys,
          );

        const savedDiscountCustomerGets =
          await this.discountBasicService.createDiscountCustomerGets(
            discountCustomerGets,
          );

        const newDiscountCodeBxGy = new this.discountCodeBxGyModel({
          ...discountCodeBxGy,
          basicDetail: savedBasicDetail._id,
          discountCustomerBuys: savedDiscountCustomerBuys._id,
          discountCustomerGets: savedDiscountCustomerGets._id,
        });
        const savedDiscountCodeBxGy = await newDiscountCodeBxGy.save();
        if (discountCustomerGets.value.discountOnQuantity) {
          if (
            discountCustomerGets.value.discountOnQuantity.effect.discountAmount
          ) {
            if (discountCustomerBuys.value.amount) {
              const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
                variables: {
                  bxgyCodeDiscount: {
                    code: 'SUMMERSALE',
                    customerBuys: {
                      items: {
                        products: {
                          productsToAdd: [
                            'gid://shopify/Product/9361345511697',
                          ],
                        },
                      },
                      value: {
                        quantity: '3',
                      },
                    },
                    customerGets: {
                      items: {
                        products: {
                          productsToAdd: [
                            'gid://shopify/Product/9361345511697',
                          ],
                        },
                      },
                      value: {
                        discountOnQuantity: {
                          effect: {
                            percentage: 0.2,
                          },
                          quantity: '2',
                        },
                      },
                    },
                    customerSelection: {
                      all: true,
                    },
                    endsAt: '2022-09-21T00:00:00Z',
                    startsAt: '2022-06-21T00:00:00Z',
                    title:
                      '20% off up to two snowboards that are on sale for every three featured snowboards you buy.',
                    usesPerOrderLimit: 3,
                  },
                },
              });

              await this.basicDetailModel.findByIdAndUpdate(
                { _id: savedBasicDetail._id },
                {
                  $set: {
                    summary:
                      data.data.discountCodeBxgyCreate.codeDiscountNode
                        .codeDiscount.summary,
                    id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                  },
                },
                { new: true },
              );
              return data;
            } else if (discountCustomerBuys.value.quantity) {
              const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
                variables: {
                  bxgyCodeDiscount: {
                    combinesWith: {
                      orderDiscounts:
                        savedBasicDetail.combinesWith.orderDiscounts,
                      productDiscounts:
                        savedBasicDetail.combinesWith.productDiscounts,
                      shippingDiscounts:
                        savedBasicDetail.combinesWith.shippingDiscounts,
                    },
                    customerBuys: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerBuys.item.products
                              .productsToAdd,
                        },
                      },
                      value: {
                        quantity:
                          discountCustomerBuys.value.quantity.toString(),
                      },
                    },
                    customerGets: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerGets.item.productsToAdd,
                        },
                      },
                      value: {
                        discountOnQuantity: {
                          quantity:
                            savedDiscountCustomerGets.value.discountOnQuantity.quantity.toString(),

                          effect: {
                            amount:
                              savedDiscountCustomerGets.value.discountOnQuantity
                                .effect.discountAmount.amount,
                          },
                        },
                      },
                    },
                    endsAt: savedBasicDetail.endsAt,
                    startsAt: savedBasicDetail.startsAt,
                    title: savedBasicDetail.title,
                    usesPerOrderLimit: savedBasicDetail.usePerOrderLimit,
                  },
                },
              });
              await this.basicDetailModel.findByIdAndUpdate(
                { _id: savedBasicDetail._id },
                {
                  $set: {
                    summary:
                      data.data.discountCodeBxgyCreate.codeDiscountNode
                        .codeDiscount.summary,
                    id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                  },
                },
                { new: true },
              );
              return data;
            }
          }
          if (discountCustomerGets.value.discountOnQuantity.effect.percentage) {
            const percentage = Number(
              savedDiscountCustomerGets.value.discountOnQuantity.effect
                .percentage,
            );
            if (discountCustomerBuys.value.quantity) {
              const Number: number = savedBasicDetail.usePerOrderLimit;
              const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
                variables: {
                  bxgyCodeDiscount: {
                    usesPerOrderLimit: Number,
                    startsAt: savedBasicDetail.startsAt,
                    code: savedBasicDetail.code,
                    title: savedBasicDetail.title,
                    combinesWith: {
                      orderDiscounts:
                        savedBasicDetail.combinesWith.orderDiscounts,
                      shippingDiscounts:
                        savedBasicDetail.combinesWith.shippingDiscounts,
                      productDiscounts:
                        savedBasicDetail.combinesWith.productDiscounts,
                    },
                    customerSelection: {
                      all: true,
                    },
                    customerGets: {
                      value: {
                        discountOnQuantity: {
                          quantity: '2',
                          effect: {
                            percentage: 0.2,
                          },
                        },
                      },
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerGets.item.productsToAdd,
                        },
                      },
                    },
                    customerBuys: {
                      value: {
                        quantity: '2',
                      },
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerBuys.item.products
                              .productsToAdd,
                        },
                      },
                    },
                  },
                },
              });
              console.log(data.data.discountCodeBxgyCreate);

              await this.basicDetailModel.findByIdAndUpdate(
                { _id: savedBasicDetail._id },
                {
                  $set: {
                    summary:
                      data.data.discountCodeBxgyCreate.codeDiscountNode
                        .codeDiscount.summary,
                    id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                  },
                },
                { new: true },
              );
              return data;
            } else if (discountCustomerBuys.value.amount) {
              const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
                variables: {
                  bxgyCodeDiscount: {
                    code: savedBasicDetail.code,
                    customerBuys: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerBuys.item.products
                              .productsToAdd,
                        },
                      },
                      value: {
                        amount: savedDiscountCustomerBuys.value.amount,
                      },
                    },
                    customerGets: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerGets.item.productsToAdd,
                        },
                      },
                      value: {
                        discountOnQuantity: {
                          effect: {
                            percentage:
                              savedDiscountCustomerGets.value.discountOnQuantity
                                .effect.percentage,
                          },
                          quantity:
                            savedDiscountCustomerGets.value.discountOnQuantity.quantity.toString(),
                        },
                      },
                    },
                    customerSelection: {
                      all: true,
                    },
                    startsAt: savedBasicDetail.startsAt,
                    title: savedBasicDetail.title,
                    usesPerOrderLimit: savedBasicDetail.usePerOrderLimit,
                  },
                },
              });

              await this.basicDetailModel.findByIdAndUpdate(
                { _id: savedBasicDetail._id },
                {
                  $set: {
                    summary:
                      data.data.discountCodeBxgyCreate.codeDiscountNode
                        .codeDiscount.summary,
                    id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                  },
                },
                { new: true },
              );
              return data;
            }
          }
        }
        if (discountCustomerGets.value.discountAmount) {
          if (discountCustomerBuys.value.amount) {
            const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
              variables: {
                bxgyCodeDiscount: {
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                  },
                  customerBuys: {
                    items: {
                      products: {
                        productsToAdd:
                          savedDiscountCustomerBuys.item.products.productsToAdd,
                      },
                    },
                    value: {
                      amount: discountCustomerBuys.value.amount,
                    },
                  },
                  customerGets: {
                    value: {
                      discountAmount: {
                        amount:
                          savedDiscountCustomerGets.value.discountAmount.amount,
                        appliesOnEachItem:
                          savedDiscountCustomerGets.value.discountAmount
                            .appliesOnEachItem,
                      },
                    },
                    items: {
                      products: {
                        productsToAdd:
                          savedDiscountCustomerGets.item.productsToAdd,
                      },
                    },
                  },
                  endsAt: savedBasicDetail.endsAt,
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit: discountCodeBxGy.usePerOrderLimit,
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .codeDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          } else if (discountCustomerBuys.value.quantity) {
            const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
              variables: {
                bxgyCodeDiscount: {
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                  },
                  customerBuys: {
                    items: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerBuys.item.products
                              .productsToAdd,
                        },
                      },
                    },
                    value: {
                      quantity: discountCustomerBuys.value.quantity.toString(),
                    },
                  },
                  customerGets: {
                    value: {
                      discountAmount: {
                        amount:
                          savedDiscountCustomerGets.value.discountAmount.amount,
                        appliesOnEachItem:
                          savedDiscountCustomerGets.value.discountAmount
                            .appliesOnEachItem,
                      },
                    },
                    items: {
                      products: {
                        productsToAdd:
                          savedDiscountCustomerGets.item.productsToAdd,
                      },
                    },
                  },
                  endsAt: savedBasicDetail.endsAt,
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit: discountCodeBxGy.usePerOrderLimit,
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .codeDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          }
        }
        if (discountCustomerGets.value.percentage) {
          if (discountCustomerBuys.value.amount) {
            const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
              variables: {
                bxgyCodeDiscount: {
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                  },
                  customerBuys: {
                    items: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerBuys.item.products
                              .productsToAdd,
                        },
                      },
                    },
                    value: {
                      amount: discountCustomerBuys.value.amount,
                    },
                  },
                  customerGets: {
                    value: {
                      percentage: savedDiscountCustomerGets.value.percentage,
                    },
                    items: {
                      items: {
                        products: {
                          productsToAdd:
                            savedDiscountCustomerGets.item.productsToAdd,
                        },
                      },
                    },
                  },
                  endsAt: savedBasicDetail.endsAt,
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit: discountCodeBxGy.usePerOrderLimit,
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .codeDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          } else if (discountCustomerBuys.value.quantity) {
            const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
              variables: {
                bxgyCodeDiscount: {
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                  },
                  customerBuys: {
                    items: {
                      products: {
                        productsToAdd:
                          savedDiscountCustomerBuys.item.products.productsToAdd,
                      },
                    },
                    value: {
                      quantity: discountCustomerBuys.value.quantity.toString(),
                    },
                  },
                  customerGets: {
                    value: {
                      percentage: savedDiscountCustomerGets.value.percentage,
                    },
                    items: {
                      products: {
                        productsToAdd:
                          savedDiscountCustomerGets.item.productsToAdd,
                      },
                    },
                  },
                  endsAt: savedBasicDetail.endsAt,
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit: discountCodeBxGy.usePerOrderLimit,
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .codeDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          }
        }
      } catch (e) {
        return e;
      }
    }
  }
  async createDiscountCodeBasic({
    basicDetail,
    discountCustomerGets,
    ...discountCodeBasicDto
  }: DiscountCodebBasicDto) {
    if (basicDetail || discountCustomerGets) {
      try {
        const savedBasicDetail =
          await this.discountBasicService.createBasicDetail(basicDetail);

        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              type: 'Code',
              method: 'Order Discount',
              status: 'ACTIVE',
            },
          },
          { new: true },
        );

        const savedDiscountCustomerGets =
          await this.discountBasicService.createDiscountCustomerGets({
            appliesOnOneTimePurchase:
              discountCustomerGets.appliesOnOneTimePurchase,
            appliesOnSubscription: discountCustomerGets.appliesOnSubscription,
            item: discountCustomerGets.item,
            value: discountCustomerGets.value,
          });

        const newDiscount = new this.discountCodeBasicModel({
          ...discountCodeBasicDto,
          basicDetail: savedBasicDetail._id,
          discountCustomerGets: savedDiscountCustomerGets._id,
        });

        const savedDiscount = await newDiscount.save();

        if (discountCustomerGets.value.percentage) {
          const data = await client.request(createDiscountCodeBasic, {
            variables: {
              basicCodeDiscount: {
                code: savedBasicDetail.title,
                title: savedBasicDetail.title,
                customerGets: {
                  value: {
                    percentage: savedDiscountCustomerGets.value.percentage,
                  },
                  items: {
                    all: true,
                  },
                },
                customerSelection: {
                  all: true,
                },
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                startsAt: savedBasicDetail.startsAt,
                endsAt: null,
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountCodeBasicCreate.codeDiscountNode
                    .codeDiscount.summary,
                id: data.data.discountCodeBasicCreate.codeDiscountNode.id,
              },
            },
            { new: true },
          );
          return data;
        } else {
          const data = await client.request(createDiscountCodeBasic, {
            variables: {
              basicCodeDiscount: {
                code: savedBasicDetail.title,
                title: savedBasicDetail.title,
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: parseInt(
                        savedDiscountCustomerGets.value.discountAmount.amount,
                      ),
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    all: true,
                  },
                },
                customerSelection: {
                  all: true,
                },
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                startsAt: basicDetail.startsAt,
                endsAt: null,
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountCodeBasicCreate.codeDiscountNode
                    .codeDiscount.summary,
                id: data.data.discountCodeBasicCreate.codeDiscountNode.id,
              },
            },
            { new: true },
          );
          return data;
        }
      } catch (e) {
        return e;
      }
    }
  }
  async createDiscountCodeFreeShipping({
    destination,
    discountMinimumRequirement,
    basicDetail,
    ...discountCodeFreeShippingDto
  }: DiscountCodeFreeShippingDto) {
    if (destination) {
      try {
        const savedDestination =
          await this.discountBasicService.createDestination(destination);
        const savedDiscountMinimumRequirement =
          await this.discountBasicService.createDiscountMinimumRequirement(
            discountMinimumRequirement,
          );
        const savedBasicDetail =
          await this.discountBasicService.createBasicDetail(basicDetail);
        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              type: 'Code',
              method: 'Shipping Discount',
              status: 'ACTIVE',
            },
          },
          { new: true },
        );

        await this.combinesWithModel.findByIdAndUpdate(
          { _id: savedBasicDetail.combinesWith._id },
          {
            $set: {
              shippingDiscounts: false,
            },
          },
          { new: true },
        );
        const newDiscount = new this.discountCodeFreeShippingModel({
          discountMinimumRequirement: savedDiscountMinimumRequirement._id,
          discountShippingDestinationSelection: savedDestination._id,
          basicDetail: savedBasicDetail._id,
          ...discountCodeFreeShippingDto,
        });
        const savedDiscount = await newDiscount.save();

        if (discountMinimumRequirement.quantity) {
          const data = await client.request(createDiscountCodeFreeShipping, {
            variables: {
              freeShippingCodeDiscount: {
                startsAt: savedBasicDetail.startsAt,
                appliesOncePerCustomer: savedBasicDetail.appliesOncePerCustomer,
                appliesOnSubscription:
                  discountCodeFreeShippingDto.appliesOnSubscription,
                title: savedBasicDetail.title,
                code: savedBasicDetail.code,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscount:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity:
                      savedDiscountMinimumRequirement.quantity,
                  },
                },
                customerSelection: {
                  all: true,
                },
                destination: {
                  all: savedDestination.all,
                },
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountCodeFreeShippingCreate.codeDiscountNode
                    .codeDiscount.summary,
                id: data.data.discountCodeFreeShippingCreate.codeDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        } else {
          const data = await client.request(createDiscountCodeFreeShipping, {
            variables: {
              freeShippingCodeDiscount: {
                startsAt: savedBasicDetail.startsAt,
                appliesOncePerCustomer: savedBasicDetail.appliesOncePerCustomer,
                appliesOnSubscription:
                  discountCodeFreeShippingDto.appliesOnSubscription,
                title: savedBasicDetail.title,
                code: savedBasicDetail.code,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscount:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                minimumRequirement: {
                  subtotal: {
                    greaterThanOrEqualToSubtotal:
                      savedDiscountMinimumRequirement.subtotal,
                  },
                },
                customerSelection: {
                  all: true,
                },
                destination: {
                  all: savedDestination.all,
                },
              },
            },
          });

          if (data) {
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeFreeShippingCreate.codeDiscountNode
                      .codeDiscount.summary,
                  id: data.data.discountCodeFreeShippingCreate.codeDiscountNode
                    .id,
                },
              },
              { new: true },
            );
          }
          return data;
        }
      } catch (e) {
        return e;
      }
    }
  }

  async getAllDiscountCodes() {
    const codeNodes = {
      edges: [],
    };
    const basics = await this.discountCodeBasicModel
      .find()
      .populate({
        path: 'basicDetail',
        populate: { path: 'combinesWith' },
      })
      .populate({ path: 'discountCustomerGets', populate: { path: 'item' } })
      .populate({ path: 'discountCustomerGets', populate: { path: 'value' } });
    basics.map((basic) => {
      codeNodes.edges.push(basic);
    });
    const bxgys = await this.discountCodeBxGyModel
      .find()
      .populate({
        path: 'basicDetail',
        populate: { path: 'combinesWith' },
      })
      .populate({
        path: 'discountCustomerBuys',
        populate: { path: 'item' },
      })
      .populate({
        path: 'discountCustomerBuys',
        populate: { path: 'value' },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: { path: 'item' },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: { path: 'value' },
      });
    bxgys.map((bxgy) => {
      codeNodes.edges.push(bxgy);
    });
    const freeShippings = await this.discountCodeFreeShippingModel
      .find()
      .populate({
        path: 'basicDetail',
        populate: { path: 'combinesWith' },
      })
      .populate({ path: 'discountMinimumRequirement' })
      .populate({ path: 'destination' });
    freeShippings.map((freeShipping) => {
      codeNodes.edges.push(freeShipping);
    });
    return {
      codeNodes,
    };
  }
}
