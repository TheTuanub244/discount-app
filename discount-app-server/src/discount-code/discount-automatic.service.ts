import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DiscountAutomaticApp } from '../schemas/DiscountAutomaticApp.schema';
import { Model, set } from 'mongoose';
import { DiscountAutomaticBasic } from '../schemas/DiscountAutomaticBasic.schema';
import { DiscountAutomaticBxGy } from '../schemas/DiscountAutomaticBxGy.schema';
import { AutomaticDiscountFreeShipping } from '../schemas/AutomaticDiscountFreeShipping.schema';
import { DiscountAutomaticBasicDto } from './dto/level-2/create-discountAutomaticBasic.dto';
import { DiscountBasicService } from './discountBasic.service';
import { DiscountAutomaticBxGyDto } from './dto/level-2/create-discountAutomaticBxGy.dto';
import { AutomaticDiscountFreeShippingDto } from './dto/level-2/create-automaticDiscountFreeShipping.dto';
import { client } from '../main';
import {
  ACTIVEAUTOMATICDISCOUNTS,
  CREATEDISCOUNTAUTOMATICBASIC,
  CREATEDISCOUNTAUTOMATICBXGY,
  DEACTIVEAUTOMATICDISCOUNTS,
  DELETEDISCOUNTS,
  UPDATEBXGY,
  createDiscountAutomaticFreeShipping,
} from './graphql/automaticDiscount';
import { BasicDetail } from '../schemas/BasicDetails.schema';
import { CombinesWith } from '../schemas/CombinesWith.schema';
import { DiscountCustomerGets } from '../schemas/DiscountCustomerGets.schema';
import { populate } from 'dotenv';
import path from 'path';
import { DiscountCustomerGetsValue } from '../schemas/DiscountCustomerGetsValue.schema';

import { DiscountCustomerBuys } from '../schemas/DiscountCustomerBuys.schema';
import { DiscountCustomerBuysValue } from '../schemas/DiscountCustomerBuysValue.schema';
import { DiscountProductsInput } from '../schemas/DiscountProducsInput.schema';
import { DiscountEffect } from '../schemas/DiscountEffect.schema';
import { DiscountOnQuantity } from '../schemas/DiscountOnQuantity.schema';
import { DiscountAmount } from '../schemas/DiscountAmount.schema';

@Injectable()
export class DiscountAutomaticService {
  constructor(
    @InjectModel(DiscountAutomaticApp.name)
    private readonly discountAutomaticAppModel: Model<DiscountAutomaticApp>,
    @InjectModel(DiscountEffect.name)
    private discountEffectModel: Model<DiscountEffect>,
    @InjectModel(DiscountOnQuantity.name)
    private discountOnQuantityModel: Model<DiscountOnQuantity>,
    @InjectModel(DiscountAutomaticBasic.name)
    private readonly discountAutomaticBasicModel: Model<DiscountAutomaticBasic>,
    @InjectModel(DiscountAutomaticBxGy.name)
    private readonly discountAutomaticBxGyModel: Model<DiscountAutomaticBxGy>,
    @InjectModel(AutomaticDiscountFreeShipping.name)
    private readonly automaticDiscountFreeShippingModel: Model<AutomaticDiscountFreeShipping>,
    private readonly discountBasicService: DiscountBasicService,
    @InjectModel(BasicDetail.name)
    private basicDetailModel: Model<BasicDetail>,
    @InjectModel(CombinesWith.name)
    private combinesWithModel: Model<CombinesWith>,
    @InjectModel(DiscountCustomerGetsValue.name)
    private discountCustomerGetsValueModel: Model<DiscountCustomerGetsValue>,
    @InjectModel(DiscountProductsInput.name)
    private discountProductsInputModel: Model<DiscountProductsInput>,
    @InjectModel(DiscountCustomerBuys.name)
    private discountCustomerBuysModel: Model<DiscountCustomerBuys>,
    @InjectModel(DiscountCustomerBuysValue.name)
    private discountCustomerBuysValueModel: Model<DiscountCustomerBuysValue>,
    @InjectModel(DiscountCustomerGets.name)
    private discountCustomerGetsModel: Model<DiscountCustomerGets>,
    @InjectModel(DiscountAmount.name)
    private discountAmountModel: Model<DiscountAmount>,
  ) {}
  async createDiscountAutomaticBasic({
    basicDetail,
    discountCustomerGets,
    discountMinimumRequirement,
    ...discountAutomaticBasicDto
  }: DiscountAutomaticBasicDto) {
    if (basicDetail && discountCustomerGets && discountMinimumRequirement) {
      const savedBasicDetail =
        await this.discountBasicService.createBasicDetail(basicDetail);
      const savedDiscountCustomerGets =
        await this.discountBasicService.createDiscountCustomerGets(
          discountCustomerGets,
        );

      const savedDiscountMinimumRequirement =
        await this.discountBasicService.createDiscountMinimumRequirement(
          discountMinimumRequirement,
        );

      const newDiscountAutomaticBaisc = new this.discountAutomaticBasicModel({
        basicDetail: savedBasicDetail._id,
        discountCustomerGets: savedDiscountCustomerGets._id,
        discountMinimumRequirement: savedDiscountMinimumRequirement._id,
        ...discountAutomaticBasicDto,
      });
      await this.basicDetailModel.findByIdAndUpdate(
        { _id: savedBasicDetail._id },
        {
          $set: {
            type: 'Automatic',
            method: 'Product Discount',
            status: 'ACTIVE',
          },
        },
        { new: true },
      );
      await newDiscountAutomaticBaisc.save();
      if (discountCustomerGets.value.discountAmount) {
        if (savedDiscountMinimumRequirement.subtotal) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                minimumRequirement: {
                  subtotal: {
                    greaterThanOrEqualToSubtotal:
                      savedDiscountMinimumRequirement.subtotal,
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount:
                        savedDiscountCustomerGets.value.discountAmount.amount,
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    all: true,
                  },
                },
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
        if (savedDiscountMinimumRequirement.quantity) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity:
                      savedDiscountMinimumRequirement.quantity.toString(),
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount:
                        savedDiscountCustomerGets.value.discountAmount.amount,
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    all: true,
                  },
                },
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }

        if (
          !savedDiscountMinimumRequirement.quantity &&
          !savedDiscountMinimumRequirement.subtotal
        ) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount:
                        savedDiscountCustomerGets.value.discountAmount.amount,
                      appliesOnEachItem: false,
                    },
                  },
                  items: {
                    all: true,
                  },
                },
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
      }
      if (discountCustomerGets.value.percentage) {
        if (savedDiscountMinimumRequirement.subtotal) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                minimumRequirement: {
                  subtotal: {
                    greaterThanOrEqualToSubtotal:
                      savedDiscountMinimumRequirement.subtotal,
                  },
                },
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                customerGets: {
                  value: {
                    percentage: discountCustomerGets.value.percentage,
                  },
                  items: {
                    all: true,
                  },
                },
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
        if (savedDiscountMinimumRequirement.quantity) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity:
                      savedDiscountMinimumRequirement.quantity.toString(),
                  },
                },
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                customerGets: {
                  value: {
                    percentage: discountCustomerGets.value.percentage,
                  },
                  items: {
                    all: true,
                  },
                },
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
        if (
          !savedDiscountMinimumRequirement.quantity &&
          !savedDiscountMinimumRequirement.subtotal
        ) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
            variables: {
              automaticBasicDiscount: {
                recurringCycleLimit: 1,
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                },
                customerGets: {
                  value: {
                    percentage: discountCustomerGets.value.percentage,
                  },
                  items: {
                    products: {
                      productsToAdd:
                        savedDiscountCustomerGets.item.productsToAdd,
                    },
                  },
                },
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBasicCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
      }
    }
  }
  async createDiscountAutomaticBxGy({
    basicDetail,
    discountCustomerBuys,
    discountCustomerGets,
    ...discountAutomaticBxGyDto
  }: DiscountAutomaticBxGyDto) {
    if (basicDetail && discountCustomerBuys && discountCustomerGets) {
      const savedBasicDetail =
        await this.discountBasicService.createBasicDetail(basicDetail);
      await this.basicDetailModel.findByIdAndUpdate(
        { _id: savedBasicDetail._id },
        {
          $set: {
            type: 'Automatic',
            method: 'Product Discount',
            status: 'ACTIVE',
          },
        },
        { new: true },
      );
      const savedDiscountCustomerGets =
        await this.discountBasicService.createDiscountCustomerGets(
          discountCustomerGets,
        );

      const savedDiscountCustomerBuys =
        await this.discountBasicService.createDiscountCustomerBuys(
          discountCustomerBuys,
        );

      const newDiscountAutomaticBxGy = new this.discountAutomaticBxGyModel({
        basicDetail: savedBasicDetail._id,
        discountCustomerBuys: savedDiscountCustomerBuys._id,
        discountCustomerGets: savedDiscountCustomerGets._id,
        ...discountAutomaticBxGyDto,
      });
      await newDiscountAutomaticBxGy.save();

      if (discountCustomerGets.value.discountOnQuantity) {
        if (
          discountCustomerGets.value.discountOnQuantity.effect.discountAmount
        ) {
          if (discountCustomerBuys.value.amount) {
            const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
              variables: {
                automaticBxgyDiscount: {
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
                        productsToAdd: savedDiscountCustomerBuys.item.products,
                      },
                    },
                    value: {
                      amount: discountCustomerBuys.value.amount.toString(),
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
                          discountCustomerGets.value.discountOnQuantity
                            .quantity,
                        effect: {
                          amount:
                            discountCustomerGets.value.discountOnQuantity.effect.discountAmount.amount.toString(),
                        },
                      },
                    },
                  },
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit:
                    discountAutomaticBxGyDto.usePerOrderLimit.toString(),
                },
              },
            });

            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountAutomaticBxgyCreate
                    .automaticDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          } else if (discountCustomerBuys.value.quantity) {
            const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
              variables: {
                automaticBxgyDiscount: {
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
                      products: savedDiscountCustomerBuys.item.products,
                    },
                    value: {
                      quantity: discountCustomerBuys.value.amount.toString(),
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
                          discountCustomerGets.value.discountOnQuantity.quantity.toString(),
                      },
                    },
                  },
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  usesPerOrderLimit:
                    discountAutomaticBxGyDto.usePerOrderLimit.toString(),
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountAutomaticBxgyCreate
                    .automaticDiscountNode.id,
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
            const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
              variables: {
                automaticBxgyDiscount: {
                  usesPerOrderLimit:
                    discountAutomaticBxGyDto.usePerOrderLimit.toString(),
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                  },
                  customerGets: {
                    value: {
                      discountOnQuantity: {
                        quantity:
                          savedDiscountCustomerGets.value.discountOnQuantity.quantity.toString(),
                        effect: {
                          percentage: percentage,
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
                      quantity:
                        savedDiscountCustomerBuys.value.quantity.toString(),
                    },
                    items: {
                      products: savedDiscountCustomerBuys.item.products,
                    },
                  },
                },
              },
            });

            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountAutomaticBxgyCreate
                    .automaticDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          } else if (discountCustomerBuys.value.amount) {
            console.log(savedDiscountCustomerGets.item);

            const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
              variables: {
                automaticBxgyDiscount: {
                  usesPerOrderLimit:
                    discountAutomaticBxGyDto.usePerOrderLimit.toString(),
                  startsAt: savedBasicDetail.startsAt,
                  title: savedBasicDetail.title,
                  combinesWith: {
                    orderDiscounts:
                      savedBasicDetail.combinesWith.orderDiscounts,
                    shippingDiscounts:
                      savedBasicDetail.combinesWith.shippingDiscounts,
                    productDiscounts:
                      savedBasicDetail.combinesWith.productDiscounts,
                  },
                  customerGets: {
                    value: {
                      discountOnQuantity: {
                        quantity:
                          savedDiscountCustomerGets.value.discountOnQuantity.quantity.toString(),
                        effect: {
                          percentage: percentage,
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
                      amount: savedDiscountCustomerBuys.value.amount,
                    },
                    items: {
                      products: savedDiscountCustomerBuys.item.products,
                    },
                  },
                },
              },
            });
            console.log(data.data.discountAutomaticBxgyCreate.userErrors);

            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountAutomaticBxgyCreate
                    .automaticDiscountNode.id,
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
          const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: savedDiscountCustomerBuys.item.products,
                  },
                  value: {
                    amount: discountCustomerBuys.value.amount.toString(),
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
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                usesPerOrderLimit:
                  discountAutomaticBxGyDto.usePerOrderLimit.toString(),
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        } else if (discountCustomerBuys.value.quantity) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: savedDiscountCustomerBuys.item.products,
                  },
                  value: {
                    quantity: discountCustomerBuys.value.amount.toString(),
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
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                usesPerOrderLimit:
                  discountAutomaticBxGyDto.usePerOrderLimit.toString(),
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
      }
      if (discountCustomerGets.value.percentage) {
        if (discountCustomerBuys.value.amount) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: savedDiscountCustomerBuys.item.products,
                  },
                  value: {
                    amount: discountCustomerBuys.value.amount.toString(),
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
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                usesPerOrderLimit:
                  discountAutomaticBxGyDto.usePerOrderLimit.toString(),
              },
            },
          });

          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        } else if (discountCustomerBuys.value.quantity) {
          const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                  productDiscounts:
                    savedBasicDetail.combinesWith.productDiscounts,
                  shippingDiscounts:
                    savedBasicDetail.combinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: savedDiscountCustomerBuys.item.products,
                  },
                  value: {
                    quantity: discountCustomerBuys.value.amount.toString(),
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
                startsAt: savedBasicDetail.startsAt,
                title: savedBasicDetail.title,
                usesPerOrderLimit:
                  discountAutomaticBxGyDto.usePerOrderLimit.toString(),
              },
            },
          });
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
      }
    }
  }
  async createAutomaticDiscountFreeShipping({
    discountMinimumRequirement,
    destination,
    basicDetail,

    ...automaticDiscountFreeShippingDto
  }: AutomaticDiscountFreeShippingDto) {
    if (discountMinimumRequirement && destination) {
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
            type: 'Automatic',
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
      const savedDestination =
        await this.discountBasicService.createDestination(destination);
      const newAutomaticDiscountFreeShipping =
        new this.automaticDiscountFreeShippingModel({
          discountMinimumRequirement: savedDiscountMinimumRequirement._id,
          destination: savedDestination._id,
          basicDetail: savedBasicDetail._id,
          ...automaticDiscountFreeShippingDto,
        });
      await newAutomaticDiscountFreeShipping.save();

      if (savedDiscountMinimumRequirement.subtotal) {
        const data = await client.request(createDiscountAutomaticFreeShipping, {
          variables: {
            freeShippingAutomaticDiscount: {
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: true,
                productDiscounts: true,
                shippingDiscounts: false,
              },
              recurringCycleLimit: 1,
              minimumRequirement: {
                subtotal: {
                  greaterThanOrEqualToSubtotal:
                    savedDiscountMinimumRequirement.subtotal.toString(),
                },
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
                data.data.discountAutomaticFreeShippingCreate
                  .automaticDiscountNode.automaticDiscount.summary,
              id: data.data.discountAutomaticFreeShippingCreate
                .automaticDiscountNode.id,
            },
          },
          { new: true },
        );

        return data;
      } else if (savedDiscountMinimumRequirement.quantity) {
        const data = await client.request(createDiscountAutomaticFreeShipping, {
          variables: {
            freeShippingAutomaticDiscount: {
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: true,
                productDiscounts: true,
                shippingDiscounts: false,
              },
              recurringCycleLimit: 1,
              minimumRequirement: {
                quantity: {
                  greaterThanOrEqualToQuantity:
                    savedDiscountMinimumRequirement.quantity.toString(),
                },
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
                data.data.discountAutomaticFreeShippingCreate
                  .automaticDiscountNode.automaticDiscount.summary,
              id: data.data.discountAutomaticFreeShippingCreate
                .automaticDiscountNode.id,
            },
          },
          { new: true },
        );
        return data;
      } else {
        const data = await client.request(createDiscountAutomaticFreeShipping, {
          variables: {
            freeShippingAutomaticDiscount: {
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: true,
                productDiscounts: true,
                shippingDiscounts: false,
              },
              recurringCycleLimit: 1,
              minimumRequirement: {
                quantity: {
                  greaterThanOrEqualToQuantity: '0',
                },
                subtotal: {
                  greaterThanOrEqualToSubtotal: '0',
                },
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
                data.data.discountAutomaticFreeShippingCreate
                  .automaticDiscountNode.automaticDiscount.summary,
              id: data.data.discountAutomaticFreeShippingCreate
                .automaticDiscountNode.id,
            },
          },
          { new: true },
        );
        return data;
      }
    }
  }
  async getAllAutomaticCode() {
    const automaticNodes = {
      edges: [],
    };
    const basics = await this.discountAutomaticBasicModel
      .find()
      .populate({
        path: 'basicDetail',
        populate: { path: 'combinesWith' },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: { path: 'item', populate: { path: 'products' } },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: { path: 'value', populate: { path: 'discountOnQuantity' } },
      });
    basics.map((basic) => {
      automaticNodes.edges.push(basic);
    });
    const bxgys = await this.discountAutomaticBxGyModel
      .find()
      .populate({
        path: 'basicDetail',
        populate: { path: 'combinesWith' },
      })
      .populate({
        path: 'discountCustomerBuys',
        populate: { path: 'item', populate: { path: 'products' } },
      })
      .populate({
        path: 'discountCustomerBuys',
        populate: { path: 'value' },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: { path: 'item', populate: { path: 'products' } },
      })
      .populate({
        path: 'discountCustomerGets',
        populate: {
          path: 'value',
          populate: {
            path: 'discountOnQuantity',
            populate: { path: 'effect' },
          },
        },
      });
    bxgys.map((bxgy) => {
      automaticNodes.edges.push(bxgy);
    });
    const freeShippings = await this.automaticDiscountFreeShippingModel
      .find()
      .populate({ path: 'basicDetail', populate: 'combinesWith' })
      .populate('destination');
    freeShippings.map((freeShipping) => {
      automaticNodes.edges.push(freeShipping);
    });
    return {
      automaticNodes,
    };
  }
  async deactiveAllDiscounts(discounts) {
    const newDiscounts = [];
    if (Array.isArray(discounts)) {
      await Promise.all(
        discounts.map(async (value) => {
          const data = await client.request(DEACTIVEAUTOMATICDISCOUNTS, {
            variables: {
              id: value.basicDetail.id,
            },
          });
          const findBasic = await this.discountAutomaticBasicModel.findById(
            value._id,
          );

          if (findBasic) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findBasic.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticDeactivate
                        .automaticDiscountNode.automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
          const findFreeShipping =
            await this.automaticDiscountFreeShippingModel.findById(value._id);

          if (findFreeShipping) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findFreeShipping.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticDeactivate
                        .automaticDiscountNode.automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
          const findBxGy = await this.discountAutomaticBxGyModel.findById(
            value._id,
          );
          if (findBxGy) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findBxGy.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticDeactivate
                        .automaticDiscountNode.automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
        }),
      );
    } else {
      const newData = await client.request(DEACTIVEAUTOMATICDISCOUNTS, {
        variables: {
          id: discounts.basicDetail.id,
        },
      });
      const findBasic = await this.discountAutomaticBasicModel.findById(
        discounts._id,
      );
      if (findBasic) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findBasic.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticDeactivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
      const findBxGy = await this.discountAutomaticBxGyModel.findById(
        discounts._id,
      );
      if (findBxGy) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findBxGy.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticDeactivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
      const findFreeShipping =
        await this.automaticDiscountFreeShippingModel.findById(discounts._id);
      if (findFreeShipping) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findFreeShipping.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticDeactivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
    }
    return newDiscounts[0];
  }
  async activeAllDiscounts(discounts) {
    const newDiscounts = [];

    if (Array.isArray(discounts)) {
      await Promise.all(
        discounts.map(async (value) => {
          const data = await client.request(ACTIVEAUTOMATICDISCOUNTS, {
            variables: {
              id: value.basicDetail.id,
            },
          });
          const findBasic = await this.discountAutomaticBasicModel.findById(
            value._id,
          );

          if (findBasic) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findBasic.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticActivate.automaticDiscountNode
                        .automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
          const findFreeShipping =
            await this.automaticDiscountFreeShippingModel.findById(value._id);

          if (findFreeShipping) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findFreeShipping.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticActivate.automaticDiscountNode
                        .automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
          const findBxGy = await this.discountAutomaticBxGyModel.findById(
            value._id,
          );
          if (findBxGy) {
            try {
              const updatedData = await this.basicDetailModel.findByIdAndUpdate(
                { _id: findBxGy.basicDetail },
                {
                  $set: {
                    status:
                      data.data.discountAutomaticActivate.automaticDiscountNode
                        .automaticDiscount.status,
                  },
                },
                { new: true },
              );
              if (updatedData) {
                const newData = await this.getAllAutomaticCode();
                newDiscounts[0] = newData.automaticNodes;
              } else {
                console.log('Khong thanh cong');
              }
            } catch (err) {
              console.error('Lỗi khi cập nhật:', err);
            }
          }
        }),
      );
    } else {
      const newData = await client.request(ACTIVEAUTOMATICDISCOUNTS, {
        variables: {
          id: discounts.basicDetail.id,
        },
      });
      const findBasic = await this.discountAutomaticBasicModel.findById(
        discounts._id,
      );
      if (findBasic) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findBasic.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticActivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
      const findBxGy = await this.discountAutomaticBxGyModel.findById(
        discounts._id,
      );
      if (findBxGy) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findBxGy.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticActivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
      const findFreeShipping =
        await this.automaticDiscountFreeShippingModel.findById(discounts._id);
      if (findFreeShipping) {
        try {
          const updatedData = await this.basicDetailModel.findByIdAndUpdate(
            { _id: findFreeShipping.basicDetail },
            {
              $set: {
                status:
                  newData.data.discountAutomaticActivate.automaticDiscountNode
                    .automaticDiscount.status,
              },
            },
            { new: true },
          );
          if (updatedData) {
            const newData = await this.getAllAutomaticCode();
            newDiscounts[0] = newData.automaticNodes;
          } else {
            console.log('Khong thanh cong');
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật:', err);
        }
      }
    }

    return newDiscounts[0];
  }
  async createAmountOffProduct({
    basicDetail,
    discountMinimumRequirement,
    discountCustomerGets,
    ...discountAutomaticBasicDto
  }: DiscountAutomaticBasic) {
    const savedBasicDetail = await this.discountBasicService.createBasicDetail({
      combinesWith: {
        orderDiscounts: basicDetail.combinesWith.orderDiscounts,
        productDiscounts: basicDetail.combinesWith.productDiscounts,
        shippingDiscounts: basicDetail.combinesWith.shippingDiscounts,
      },
      appliesOncePerCustomer: basicDetail.appliesOncePerCustomer,
      code: basicDetail.code,
      usageLimit: basicDetail.usageLimit,
      title: basicDetail.title,
      startsAt: basicDetail.startsAt,
      endsAt: basicDetail.endsAt,
      usePerOrderLimit: basicDetail.usePerOrderLimit,
    });

    const savedDiscountMinimumRequirement =
      await this.discountBasicService.createDiscountMinimumRequirement(
        discountMinimumRequirement,
      );
    const savedDiscountCustomerGets =
      await this.discountBasicService.createDiscountCustomerGets({
        appliesOnOneTimePurchase: discountCustomerGets.appliesOnOnetimePurchase,
        appliesOnSubscription: discountCustomerGets.appliesOnOnetimePurchase,
        item: discountCustomerGets.item,
        value: discountCustomerGets.value,
      });

    const newAmountOffDiscount = new this.discountAutomaticBasicModel({
      basicDetail: savedBasicDetail._id,
      discountCustomerGets: savedDiscountCustomerGets._id,
      discountMinimumRequirement: savedDiscountMinimumRequirement._id,
      ...discountAutomaticBasicDto,
    });
    await this.basicDetailModel.findByIdAndUpdate(
      { _id: savedBasicDetail._id },
      {
        $set: {
          type: 'Automatic',
          method: 'Product Discount',
          status: 'ACTIVE',
        },
      },
      { new: true },
    );

    await newAmountOffDiscount.save();
    if (discountMinimumRequirement.subtotal) {
      if (discountCustomerGets.value.discountAmount) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
          variables: {
            automaticBasicDiscount: {
              recurringCycleLimit: 1,
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
              },
              minimumRequirement: {
                subtotal: {
                  greaterThanOrEqualToSubtotal:
                    savedDiscountMinimumRequirement.subtotal,
                },
              },
              customerGets: {
                value: {
                  discountAmount: {
                    amount:
                      savedDiscountCustomerGets.value.discountAmount.amount,
                    appliesOnEachItem: false,
                  },
                },
                items: {
                  products: {
                    productsToAdd: savedDiscountCustomerGets.item.productsToAdd,
                  },
                },
              },
            },
          },
        });
        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              summary:
                data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .automaticDiscount.summary,
              id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                .id,
            },
          },
          { new: true },
        );
        return data;
      } else if (discountCustomerGets.value.percentage) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
          variables: {
            automaticBasicDiscount: {
              recurringCycleLimit: 1,
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
              },
              minimumRequirement: {
                subtotal: {
                  greaterThanOrEqualToSubtotal:
                    savedDiscountMinimumRequirement.subtotal,
                },
              },
              customerGets: {
                value: {
                  percentage: savedDiscountCustomerGets.value.percentage,
                },
                items: {
                  products: {
                    productsToAdd: savedDiscountCustomerGets.item.productsToAdd,
                  },
                },
              },
            },
          },
        });
        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              summary:
                data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .automaticDiscount.summary,
              id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                .id,
            },
          },
          { new: true },
        );
        return data;
      }
    } else if (discountMinimumRequirement.quantity) {
      if (discountCustomerGets.value.discountAmount) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
          variables: {
            automaticBasicDiscount: {
              recurringCycleLimit: 1,
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
              },
              minimumRequirement: {
                quantity: {
                  greaterThanOrEqualToQuantity:
                    savedDiscountMinimumRequirement.quantity.toString(),
                },
              },
              customerGets: {
                value: {
                  discountAmount: {
                    amount:
                      savedDiscountCustomerGets.value.discountAmount.amount,
                    appliesOnEachItem: false,
                  },
                },
                items: {
                  products: {
                    productsToAdd: savedDiscountCustomerGets.item.productsToAdd,
                  },
                },
              },
            },
          },
        });

        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              summary:
                data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .automaticDiscount.summary,
              id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                .id,
            },
          },
          { new: true },
        );
        return data;
      } else if (discountCustomerGets.value.percentage) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBASIC, {
          variables: {
            automaticBasicDiscount: {
              recurringCycleLimit: 1,
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
              },
              minimumRequirement: {
                quantity: {
                  greaterThanOrEqualToQuantity:
                    savedDiscountMinimumRequirement.quantity.toString(),
                },
              },
              customerGets: {
                value: {
                  percentage: savedDiscountCustomerGets.value.percentage,
                },
                items: {
                  products: {
                    productsToAdd: savedDiscountCustomerGets.item.productsToAdd,
                  },
                },
              },
            },
          },
        });

        await this.basicDetailModel.findByIdAndUpdate(
          { _id: savedBasicDetail._id },
          {
            $set: {
              summary:
                data.data.discountAutomaticBasicCreate.automaticDiscountNode
                  .automaticDiscount.summary,
              id: data.data.discountAutomaticBasicCreate.automaticDiscountNode
                .id,
            },
          },
          { new: true },
        );
        return data;
      }
    }
  }
  async deleteDiscounts(discounts: any) {
    if (!Array.isArray(discounts)) {
      await this.discountBasicService.deleteBasicDetail(discounts.basicDetail);

      if (discounts.basicDetail.method == 'Product Discount') {
        await this.discountAutomaticBasicModel.findOneAndDelete({
          basicDetail: discounts.basicDetail._id,
        });
        await this.discountAutomaticBxGyModel.findOneAndDelete({
          basicDetail: discounts.basicDetail._id,
        });
      } else if (discounts.basicDetail.method == 'Order Discount') {
        await this.discountAutomaticBasicModel.findOneAndDelete({
          basicDetail: discounts.basicDetail._id,
        });
      } else if (discounts.basicDetail.method == 'Shipping Discount') {
        await this.automaticDiscountFreeShippingModel.findOneAndDelete({
          basicDetail: discounts.basicDetail._id,
        });
      }
      const data = await client.request(DELETEDISCOUNTS, {
        variables: {
          id: discounts.basicDetail.id,
        },
      });
      if (data.data) {
        const newData = await this.getAllAutomaticCode();
        return newData.automaticNodes;
      }
    } else {
      discounts.map(async (discount) => {
        await this.discountBasicService.deleteBasicDetail(discount.basicDetail);

        if (discount.basicDetail.method == 'Product Discount') {
          await this.discountAutomaticBasicModel.findOneAndDelete({
            basicDetail: discount.basicDetail._id,
          });
          await this.discountAutomaticBxGyModel.findOneAndDelete({
            basicDetail: discount.basicDetail._id,
          });
        } else if (discount.basicDetail.method == 'Order Discount') {
          await this.discountAutomaticBasicModel.findOneAndDelete({
            basicDetail: discount.basicDetail._id,
          });
        } else if (discount.basicDetail.method == 'Shipping Discount') {
          await this.automaticDiscountFreeShippingModel.findOneAndDelete({
            basicDetail: discount.basicDetail._id,
          });
        }
        await client.request(DELETEDISCOUNTS, {
          variables: {
            id: discount.basicDetail.id,
          },
        });
      });
      const newData = await this.getAllAutomaticCode();
      return newData.automaticNodes;
    }
  }
  async updateBXGY(discount: any, lastData: any) {
    const updateCombinesWith = await this.combinesWithModel.findByIdAndUpdate(
      {
        _id: lastData.basicDetail.combinesWith._id,
      },
      {
        $set: {
          productDiscounts: discount.combinations.product,
          orderDiscounts: discount.combinations.order,
          shippingDiscounts: discount.combinations.shipping,
        },
        $currentDate: {
          lastUpdated: true,
        },
      },
    );
    await updateCombinesWith.save();
    const updateBasicDetail = await this.basicDetailModel.findByIdAndUpdate(
      {
        _id: lastData.basicDetail._id,
      },
      {
        $set: {
          title: discount.title,
          code: discount.title,
          appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
          usePerOrderLimit: discount.usesPerOrder.amount,
        },
        $currentDate: {
          lastUpdated: true,
        },
      },
    );
    await updateBasicDetail.save();
    const discountBuysItem =
      await this.discountProductsInputModel.findByIdAndUpdate(
        {
          _id: lastData.discountCustomerBuys.item.products._id,
        },
        {
          $set: {
            productsToAdd: discount.minimumRequirement.products,
          },
          $currentDate: {
            lastUpdated: true,
          },
        },
      );
    await discountBuysItem.save();

    const discountGetsItem =
      await this.discountProductsInputModel.findByIdAndUpdate(
        {
          _id: lastData.discountCustomerGets.item.products._id,
        },
        {
          $set: {
            productsToAdd: discount.customerGets.products,
          },
        },
      );
    await discountGetsItem.save();
    const updateDiscountGetsItem = discountGetsItem.productsToAdd.map(
      (product) => (product as any).id,
    );
    const updatediscountBuysItem = discountBuysItem.productsToAdd.map(
      (product) => (product as any).id,
    );

    if (discount.minimumRequirement.subtotal.choose) {
      const updateDiscountCustomerBuysValue =
        await this.discountCustomerBuysValueModel.findByIdAndUpdate(
          {
            _id: lastData.discountCustomerBuys.value._id,
          },
          {
            $set: {
              quantity: null,
              amount: discount.minimumRequirement.amount,
            },
            $currentDate: {
              lastUpdated: true,
            },
          },
        );
      await updateDiscountCustomerBuysValue.save();
      if (discount.customerGets.discountValue.percentage.choose) {
        const updateDiscountEffect =
          await this.discountEffectModel.findByIdAndUpdate(
            {
              _id: lastData.discountCustomerGets.value.discountOnQuantity.effect
                ._id,
            },
            {
              $set: {
                percentage:
                  discount.customerGets.discountValue.percentage.amount,
                discountAmount: null,
              },
              $currentDate: {
                lastUpdated: true,
              },
            },
          );
        await updateDiscountEffect.save();
        const data = await client.request(UPDATEBXGY, {
          variables: {
            automaticBxgyDiscount: {
              combinesWith: {
                orderDiscounts: updateCombinesWith.orderDiscounts,
                productDiscounts: updateCombinesWith.productDiscounts,
                shippingDiscounts: updateCombinesWith.shippingDiscounts,
              },
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: updatediscountBuysItem,
                  },
                },
                value: {
                  amount: updateDiscountCustomerBuysValue.amount.toString(),
                },
              },
              customerGets: {
                value: {
                  percentage:
                    parseFloat(updateDiscountEffect.percentage.toString()) /
                    100,
                },
                items: {
                  products: {
                    productsToAdd: updateDiscountGetsItem,
                  },
                },
              },
              usesPerOrderLimit: updateBasicDetail.usePerOrderLimit.toString(),
              startsAt: updateBasicDetail.startsAt,
            },
            id: lastData.basicDetail.id,
          },
        });
        console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
      } else if (discount.customerGets.discountValue.amountOff.choose) {
        if (
          !lastData.discountCustomerGets.value.discountOnQuantity.effect
            .discountAmount
        ) {
          const newDiscountAmount =
            await this.discountBasicService.createDiscountAmount({
              amount: discount.customerGets.discountValue.amountOff.amount,
              appliesOnEachItem: true,
            });
          const data = await client.request(UPDATEBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: updateCombinesWith.orderDiscounts,
                  productDiscounts: updateCombinesWith.productDiscounts,
                  shippingDiscounts: updateCombinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: {
                      productsToAdd: updatediscountBuysItem,
                    },
                  },
                  value: {
                    amount: updateDiscountCustomerBuysValue.amount.toString(),
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: newDiscountAmount.amount,
                      appliesOnEachItem: newDiscountAmount.appliesOnEachItem,
                    },
                  },
                  items: {
                    products: {
                      productsToAdd: updateDiscountGetsItem,
                    },
                  },
                },
                usesPerOrderLimit:
                  updateBasicDetail.usePerOrderLimit.toString(),
                startsAt: updateBasicDetail.startsAt,
              },
              id: lastData.basicDetail.id,
            },
          });
          console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
        } else {
          const updateDiscountAmount =
            await this.discountAmountModel.findByIdAndUpdate(
              {
                _id: lastData.discountCustomerGets.value.discountOnQuantity
                  .effect.discountAmount._id,
              },
              {
                $set: {
                  amount: discount.customerGets.discountValue.amountOff.amount,
                  appliesOnEachItem: true,
                },
                $currentDate: {
                  lastUpdated: true,
                },
              },
            );
          await updateDiscountAmount.save();
          const data = await client.request(UPDATEBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: updateCombinesWith.orderDiscounts,
                  productDiscounts: updateCombinesWith.productDiscounts,
                  shippingDiscounts: updateCombinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: {
                      productsToAdd: updatediscountBuysItem,
                    },
                  },
                  value: {
                    amount: updateDiscountCustomerBuysValue.amount.toString(),
                  },
                },
                customerGets: {
                  value: {
                    discountAMount: {
                      amount: updateDiscountAmount.amount,
                      appliesOnEachItem: updateDiscountAmount.appliesOnEachItem,
                    },
                  },
                  items: {
                    products: {
                      productsToAdd: updateDiscountGetsItem,
                    },
                  },
                  usesPerOrderLimit:
                    updateBasicDetail.usePerOrderLimit.toString(),
                  startsAt: updateBasicDetail.startsAt,
                },
              },
            },
          });
          console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
        }
      }
    } else if (discount.minimumRequirement.quantity.choose) {
      const updateDiscountCustomerBuysValue =
        await this.discountCustomerBuysValueModel.findByIdAndUpdate(
          {
            _id: lastData.discountCustomerBuys.value._id,
          },
          {
            $set: {
              quantity: discount.minimumRequirement.amount,
              amount: null,
            },
            $currentDate: {
              lastUpdated: true,
            },
          },
        );
      await updateDiscountCustomerBuysValue.save();
      if (discount.customerGets.discountValue.percentage.choose) {
        const updateDiscountEffect =
          await this.discountEffectModel.findByIdAndUpdate(
            {
              _id: lastData.discountCustomerGets.value.discountOnQuantity.effect
                ._id,
            },
            {
              $set: {
                percentage:
                  discount.customerGets.discountValue.percentage.amount,
                discountAmount: null,
              },
              $currentDate: {
                lastUpdated: true,
              },
            },
          );
        await updateDiscountEffect.save();
        const data = await client.request(UPDATEBXGY, {
          variables: {
            automaticBxgyDiscount: {
              combinesWith: {
                orderDiscounts: updateCombinesWith.orderDiscounts,
                productDiscounts: updateCombinesWith.productDiscounts,
                shippingDiscounts: updateCombinesWith.shippingDiscounts,
              },
              customerBuys: {
                items: {
                  products: {
                    productsToAdd: updatediscountBuysItem,
                  },
                },
                value: {
                  quantity: updateDiscountCustomerBuysValue.quantity.toString(),
                  amount: null,
                },
              },
              customerGets: {
                value: {
                  percentage:
                    parseFloat(updateDiscountEffect.percentage.toString()) /
                    100,
                },
                items: {
                  products: {
                    productsToAdd: updateDiscountGetsItem,
                  },
                },
              },
              usesPerOrderLimit: updateBasicDetail.usePerOrderLimit.toString(),
              startsAt: updateBasicDetail.startsAt,
            },
            id: lastData.basicDetail.id,
          },
        });

        console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
      } else if (discount.customerGets.discountValue.amountOff.choose) {
        if (
          !lastData.discountCustomerGets.value.discountOnQuantity.effect
            .discountAmount
        ) {
          console.log(updateDiscountCustomerBuysValue);

          const newDiscountAmount =
            await this.discountBasicService.createDiscountAmount({
              amount: discount.customerGets.discountValue.amountOff.amount,
              appliesOnEachItem: true,
            });
          const data = await client.request(UPDATEBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: updateCombinesWith.orderDiscounts,
                  productDiscounts: updateCombinesWith.productDiscounts,
                  shippingDiscounts: updateCombinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: {
                      productsToAdd: updatediscountBuysItem,
                    },
                  },
                  value: {
                    amount: null,
                    quantity:
                      updateDiscountCustomerBuysValue.quantity.toString(),
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: newDiscountAmount.amount,
                      appliesOnEachItem: newDiscountAmount.appliesOnEachItem,
                    },
                  },
                  items: {
                    products: {
                      productsToAdd: updateDiscountGetsItem,
                    },
                  },
                },
                usesPerOrderLimit:
                  updateBasicDetail.usePerOrderLimit.toString(),
                startsAt: updateBasicDetail.startsAt,
              },
              id: lastData.basicDetail.id,
            },
          });
          console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
        } else {
          const updateDiscountAmount =
            await this.discountAmountModel.findByIdAndUpdate(
              {
                _id: lastData.discountCustomerGets.value.discountOnQuantity
                  .effect.discountAmount._id,
              },
              {
                $set: {
                  amount: discount.customerGets.discountValue.amountOff.amount,
                  appliesOnEachItem: true,
                },
                $currentDate: {
                  lastUpdated: true,
                },
              },
            );
          await updateDiscountAmount.save();
          const data = await client.request(UPDATEBXGY, {
            variables: {
              automaticBxgyDiscount: {
                combinesWith: {
                  orderDiscounts: updateCombinesWith.orderDiscounts,
                  productDiscounts: updateCombinesWith.productDiscounts,
                  shippingDiscounts: updateCombinesWith.shippingDiscounts,
                },
                customerBuys: {
                  items: {
                    products: {
                      productsToAdd: updatediscountBuysItem,
                    },
                  },
                  value: {
                    amount: null,
                    quantity:
                      updateDiscountCustomerBuysValue.quantity.toString(),
                  },
                },
                customerGets: {
                  value: {
                    discountAmount: {
                      amount: updateDiscountAmount.amount,
                      appliesOnEachItem: updateDiscountAmount.appliesOnEachItem,
                    },
                  },
                  items: {
                    products: {
                      productsToAdd: updateDiscountGetsItem,
                    },
                  },
                },
                usesPerOrderLimit:
                  updateBasicDetail.usePerOrderLimit.toString(),
                startsAt: updateBasicDetail.startsAt,
              },
              id: lastData.basicDetail.id,
            },
          });
          console.log(data.data.discountAutomaticBxgyUpdate.userErrors);
        }
      }
    }
  }
}
