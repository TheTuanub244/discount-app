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
  createDiscountAutomaticFreeShipping,
} from './graphql/automaticDiscount';
import { BasicDetail } from '../schemas/BasicDetails.schema';
import { CombinesWith } from '../schemas/CombinesWith.schema';

@Injectable()
export class DiscountAutomaticService {
  constructor(
    @InjectModel(DiscountAutomaticApp.name)
    private readonly discountAutomaticAppModel: Model<DiscountAutomaticApp>,
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
                      appliesOnEachItem:
                        savedDiscountCustomerGets.value.discountAmount
                          .appliesOnEachItem,
                    },
                  },
                  items: {
                    products: savedDiscountCustomerGets.item.products,
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
                      savedDiscountMinimumRequirement.quantity,
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
                    products: savedDiscountCustomerGets.item.products,
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
                      appliesOnEachItem:
                        savedDiscountCustomerGets.value.discountAmount
                          .appliesOnEachItem,
                    },
                  },
                  items: {
                    products: savedDiscountCustomerGets.item.products,
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
                    products: savedDiscountCustomerGets.item.products,
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
                      savedDiscountMinimumRequirement.quantity,
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
                    products: savedDiscountCustomerGets.item.products,
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
                    products: savedDiscountCustomerGets.item.products,
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
                    quantity: discountCustomerBuys.value.amount.toString(),
                  },
                },
                customerGets: {
                  items: {
                    products: savedDiscountCustomerGets.item.products,
                  },
                  value: {
                    discountOnQuantity: {
                      effect: {
                        amount:
                          discountCustomerGets.value.discountOnQuantity.effect.discountAmount.amount.toString(),
                      },
                      quantity:
                        discountCustomerGets.value.discountOnQuantity.quantity.toString(),
                    },
                  },
                },
                endsAt: savedBasicDetail.endsAt,
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
        if (discountCustomerGets.value.discountOnQuantity.effect.percentage) {
          const percentage = Number(
            savedDiscountCustomerGets.value.discountOnQuantity.effect
              .percentage,
          );
          const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
            variables: {
              automaticBxgyDiscount: {
                usesPerOrderLimit:
                  discountAutomaticBxGyDto.usePerOrderLimit.toString(),
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
                    discountOnQuantity: {
                      quantity:
                        savedDiscountCustomerGets.value.discountOnQuantity.quantity.toString(),
                      effect: {
                        percentage: percentage,
                      },
                    },
                  },
                  items: {
                    products: savedDiscountCustomerGets.item.products,
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
                id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                  .id,
              },
            },
            { new: true },
          );
          return data;
        }
      }
      if (discountCustomerGets.value.discountAmount) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
          variables: {
            automaticBxgyDiscount: {
              usesPerOrderLimit: savedBasicDetail.usePerOrderLimit,
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
                    appliesOnEachItem:
                      savedDiscountCustomerGets.value.discountAmount
                        .appliesOnEachItem,
                  },
                },
                items: {
                  products: savedDiscountCustomerGets.item.products,
                },
              },
              customerBuys: {
                value: {
                  quantity: savedDiscountCustomerBuys.value.quantity.toString(),
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
              id: data.data.discountAutomaticBxgyCreate.automaticDiscountNode
                .id,
            },
          },
          { new: true },
        );
        return data;
      }
      if (discountCustomerGets.value.percentage) {
        const data = await client.request(CREATEDISCOUNTAUTOMATICBXGY, {
          variables: {
            automaticBxgyDiscount: {
              usesPerOrderLimit: savedBasicDetail.usePerOrderLimit,
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
                  percentage: savedDiscountCustomerGets.value.percentage,
                },
                items: {
                  products: savedDiscountCustomerGets.item.products,
                },
              },
              customerBuys: {
                value: {
                  quantity: savedDiscountCustomerBuys.value.quantity.toString(),
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
  async createAutomaticDiscountFreeShipping({
    discountMinimumRequirement,
    destination,
    basicDetail,
    ...automaticDiscountFreeShippingDto
  }: AutomaticDiscountFreeShippingDto) {
    console.log(discountMinimumRequirement);

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
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
              },
              recurringCycleLimit: 1,
              minimumRequirement: {
                subtotal: {
                  greaterThanOrEqualToSubtotal:
                    savedDiscountMinimumRequirement.subtotal,
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
      if (savedDiscountMinimumRequirement.quantity) {
        const data = await client.request(createDiscountAutomaticFreeShipping, {
          variables: {
            freeShippingAutomaticDiscount: {
              startsAt: savedBasicDetail.startsAt,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
              },
              recurringCycleLimit: 1,
              minimumRequirement: {
                quantity: {
                  greaterThanOrEqualToQuantity:
                    savedDiscountMinimumRequirement.quantity,
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
      .populate({ path: 'discountCustomerGets', populate: { path: 'item' } })
      .populate({ path: 'discountCustomerGets', populate: { path: 'value' } });
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
  async deleteAllDiscounts(discounts) {
    if (Array.isArray(discounts)) {
      discounts.map((value) => {
        if (value.type == 'Automatic') {
        }
      });
    }
  }
}
