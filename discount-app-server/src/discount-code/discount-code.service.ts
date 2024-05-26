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

        if (discountCustomerGets.value.discountOnQuantity) {
          if (
            discountCustomerGets.value.discountOnQuantity.effect.discountAmount
          ) {
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
                    discountCodeBxGy.usePerOrderLimit.toString(),
                },
              },
            });
            await this.basicDetailModel.findByIdAndUpdate(
              { _id: savedBasicDetail._id },
              {
                $set: {
                  summary:
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
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
            const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
              variables: {
                automaticBxgyDiscount: {
                  usesPerOrderLimit:
                    discountCodeBxGy.usePerOrderLimit.toString(),
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
                    data.data.discountCodeBxgyCreate.codeDiscountNode
                      .automaticDiscount.summary,
                  id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
                },
              },
              { new: true },
            );
            return data;
          }
        }
        if (discountCustomerGets.value.discountAmount) {
          const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
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
                  data.data.discountCodeBxgyCreate.codeDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
              },
            },
            { new: true },
          );
          return data;
        }
        if (discountCustomerGets.value.percentage) {
          const data = await client.request(CREATEDISCOUNTCODEBUYXGETY, {
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
                  data.data.discountCodeBxgyCreate.codeDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
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
  async createDiscountCodeBasic({
    basicDetail,
    discountCustomerGets,
    ...discountCodeBasicDto
  }: DiscountCodebBasicDto) {
    if (basicDetail && discountCustomerGets) {
      try {
        const savedBasicDetail =
          await this.discountBasicService.createBasicDetail(basicDetail);
        const savedDiscountCustomerGets =
          await this.discountBasicService.createDiscountCustomerGets(
            discountCustomerGets,
          );
        new this.discountCodeBasicModel({
          ...discountCodeBasicDto,
          basicDetail: savedBasicDetail._id,
          discountCustomerGets: savedDiscountCustomerGets._id,
        });
        const data = await client.request(createDiscountCodeBasic, {
          variables: {
            basicCodeDiscount: {
              apppliesOncePerCustomer: savedBasicDetail.appliesOncePerCustomer,
              code: savedBasicDetail.code,
              title: savedBasicDetail.title,
              combinesWith: {
                orderDiscounts: savedBasicDetail.combinesWith.orderDiscounts,
                productDiscounts:
                  savedBasicDetail.combinesWith.productDiscounts,
                shippingDiscounts:
                  savedBasicDetail.combinesWith.shippingDiscounts,
              },
              customerGets: {
                appliesOnSubscription:
                  savedDiscountCustomerGets.appliesOnSubscription,
                item: savedDiscountCustomerGets.item,
                value: savedDiscountCustomerGets.value,
              },
              endsAt: savedBasicDetail.endsAt,
              startsAt: savedBasicDetail.startsAt,
              recurringCycleLimit: discountCodeBasicDto.recurringCycleLimit,
              usageLimit: savedBasicDetail.usageLimit,
            },
          },
        });
        return data;
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
                  data.data.discountCodeBxgyCreate.codeDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
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
          await this.basicDetailModel.findByIdAndUpdate(
            { _id: savedBasicDetail._id },
            {
              $set: {
                summary:
                  data.data.discountCodeBxgyCreate.codeDiscountNode
                    .automaticDiscount.summary,
                id: data.data.discountCodeBxgyCreate.codeDiscountNode.id,
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
  async getAllDiscountCodes() {
    const codeNodes = {
      edges: [],
    };
    const basics = await this.discountCodeBasicModel
      .find()
      .populate({
        path: 'basicDetal',
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