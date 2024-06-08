import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BasicDetail } from '../schemas/BasicDetails.schema';
import { CombinesWith } from '../schemas/CombinesWith.schema';
import { DiscountCustomerBuys } from '../schemas/DiscountCustomerBuys.schema';
import { DiscountCustomerBuysValue } from '../schemas/DiscountCustomerBuysValue.schema';
import { DiscountItems } from '../schemas/DiscountItems.schema';
import { DiscountMinimumRequirement } from '../schemas/DiscountMinimumRequirement.schema';
import { DiscountShippingDestinationSelection } from '../schemas/DiscountShippingDestinationSelection.schema';
import { BasicDetailDto } from './dto/level-2/create-basicDetail.dto';
import { DiscountCustomerBuysDto } from './dto/level-2/create-discountCustomerBuys.dto';
import { DiscountCustomerGetsDto } from './dto/level-2/create-discountCustomerGets.dto';
import { DiscountCustomerGets } from '../schemas/DiscountCustomerGets.schema';
import { DiscountShippingDestinationSelectionDto } from './dto/level-1/create-discountShippingDestinationSelection.dto';
import { DiscountMinimumRequirementDto } from './dto/level-1/create-discountMinimumRequirement.dto';
import { DiscountEffectDto } from './dto/level-2/create-discountEffect.dto';
import { DiscountEffect } from '../schemas/DiscountEffect.schema';
import { DiscountOnQuantity } from '../schemas/DiscountOnQuantity.schema';
import { DiscountAmount } from '../schemas/DiscountAmount.schema';
import { DiscountCustomerGetsValue } from '../schemas/DiscountCustomerGetsValue.schema';
import { DiscountAmountDto } from './dto/level-1/create-discountAmount.dto';
import { DiscountOnQuantityDto } from './dto/level-2/create-discountOnQuantity.dto';
import { DiscountCustomerGetsValuesDto } from './dto/level-2/create-discountCustomerGetsValue.dto';
import { DiscountProductsInputDto } from './dto/level-1/create-discountProductsInput.schema';
import { DiscountProductsInput } from '../schemas/DiscountProducsInput.schema';
import { DiscountCollectionsInput } from '../schemas/DiscountCollectionsInput.schema';
import { DiscountCustomerBuysValueDto } from './dto/level-1/create-discountCustomerBuysValue.dto';
import { create } from 'domain';
@Injectable()
export class DiscountBasicService {
  constructor(
    @InjectModel(CombinesWith.name)
    private combinesWithModel: Model<CombinesWith>,
    @InjectModel(BasicDetail.name)
    private basicDetailModel: Model<BasicDetail>,
    @InjectModel(DiscountCustomerBuys.name)
    private discountCustomerBuysModel: Model<DiscountCustomerBuys>,
    @InjectModel(DiscountCustomerBuysValue.name)
    private discountCustomerBuysValueModel: Model<DiscountCustomerBuysValue>,
    @InjectModel(DiscountCustomerGets.name)
    private discountCustomerGetsModel: Model<DiscountCustomerGets>,
    @InjectModel(DiscountItems.name)
    private discountItemsModel: Model<DiscountItems>,
    @InjectModel(DiscountMinimumRequirement.name)
    private discountMinimumRequirementModel: Model<DiscountMinimumRequirement>,
    @InjectModel(DiscountShippingDestinationSelection.name)
    private discountShippingDestinationSelectionModel: Model<DiscountShippingDestinationSelection>,
    @InjectModel(DiscountEffect.name)
    private discountEffectModel: Model<DiscountEffect>,
    @InjectModel(DiscountOnQuantity.name)
    private discountOnQuantityModel: Model<DiscountOnQuantity>,
    @InjectModel(DiscountAmount.name)
    private discountAmountModel: Model<DiscountAmount>,
    @InjectModel(DiscountCustomerGetsValue.name)
    private discountCustomerGetsValueModel: Model<DiscountCustomerGetsValue>,
    @InjectModel(DiscountProductsInput.name)
    private discountProductsInputModel: Model<DiscountProductsInput>,
    @InjectModel(DiscountCollectionsInput.name)
    private discountCollectionsInputModel: Model<DiscountCollectionsInput>,
  ) {}
  compareObject<T>(obj1: T, obj2: T): boolean {
    const key1 = Object.keys(obj1) as Array<keyof T>;
    const key2 = Object.keys(obj2) as Array<keyof T>;

    if (key1.length !== key2.length) {
      return false;
    } else {
      for (const key of key1) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }
    return true;
  }
  async createBasicDetail({ combinesWith, ...basicDetailDto }: BasicDetailDto) {
    if (combinesWith) {
      const combinesWiths = await this.combinesWithModel.find();
      const savedCombinesWith = [];
      if (combinesWiths.length == 0) {
        const newCombinesWith = new this.combinesWithModel(combinesWith);
        const savedCombinesWith = await newCombinesWith.save();
        const newBasicDetail = new this.basicDetailModel({
          ...basicDetailDto,
          combinesWith: savedCombinesWith._id,
        });
        const temp1 = await newBasicDetail.save();
        return {
          _id: temp1._id,
          combinesWith: {
            _id: savedCombinesWith._id,
            orderDiscounts: savedCombinesWith.orderDiscounts,
            productDiscounts: savedCombinesWith.productDiscounts,
            shippingDiscounts: savedCombinesWith.shippingDiscounts,
          },
          ...basicDetailDto,
        };
      } else {
        await Promise.all(
          combinesWiths.map((value) => {
            if (
              combinesWith.orderDiscounts == value.orderDiscounts &&
              combinesWith.productDiscounts == value.productDiscounts &&
              combinesWith.shippingDiscounts == value.shippingDiscounts
            ) {
              savedCombinesWith.push(value);
            }
          }),
        );
      }
      if (savedCombinesWith.length == 0) {
        const newCombinesWith = new this.combinesWithModel(combinesWith);
        const savedNewCombinesWith = await newCombinesWith.save();
        const newBasicDetail = new this.basicDetailModel({
          ...basicDetailDto,
          combinesWith: savedNewCombinesWith._id,
        });
        const temp1 = await newBasicDetail.save();
        return {
          _id: temp1._id,
          combinesWith: {
            _id: savedNewCombinesWith._id,
            orderDiscounts: savedNewCombinesWith.orderDiscounts,
            productDiscounts: savedNewCombinesWith.productDiscounts,
            shippingDiscounts: savedNewCombinesWith.shippingDiscounts,
          },
          ...basicDetailDto,
        };
      } else {
        const newBasicDetail = new this.basicDetailModel({
          ...basicDetailDto,
          combinesWith: savedCombinesWith[0]._id,
        });
        const temp1 = await newBasicDetail.save();
        return {
          _id: temp1._id,
          combinesWith: {
            _id: savedCombinesWith[0]._id,
            orderDiscounts: savedCombinesWith[0].orderDiscounts,
            productDiscounts: savedCombinesWith[0].productDiscounts,
            shippingDiscounts: savedCombinesWith[0].shippingDiscounts,
          },
          ...basicDetailDto,
        };
      }
    }
  }
  async createDiscountProductsInput(
    discountProductsInputDto: DiscountProductsInputDto,
  ) {
    const productsToAdds = [];
    const productsToRemoves = [];
    const productVariantsToAdds = [];
    const productVariantsToRemoves = [];
    const discountProductsInputs = await this.discountProductsInputModel.find();
    if (discountProductsInputs.length == 0) {
      const newDiscountProductsInput = new this.discountProductsInputModel(
        discountProductsInputDto,
      );
      const temp = await newDiscountProductsInput.save();
      return temp;
    } else {
      const results = await Promise.all(
        discountProductsInputs.map((index) => {
          const productsToAdd = index.productsToAdd;
          if (productsToAdd.length != 0) {
            for (let i = 0; i < productsToAdd.length; i++) {
              for (
                let j = 0;
                j < discountProductsInputDto.productsToAdd.length;
                j++
              ) {
                if (
                  productsToAdd[i] == discountProductsInputDto.productsToAdd[j]
                ) {
                  productsToAdds.push(productsToAdd[i]);
                }
              }
            }
          } else {
            productsToAdds.push('1');
          }
          const productVariantsToAdd = index.productVariantsToAdd;

          if (productVariantsToAdd.length != 0) {
            for (let i = 0; i < productVariantsToAdd.length; i++) {
              for (
                let j = 0;
                j < discountProductsInputDto.productVariantsToAdd.length;
                j++
              ) {
                if (
                  productVariantsToAdd[i] ==
                  discountProductsInputDto.productVariantsToAdd[j]
                ) {
                  productVariantsToAdds.push(productVariantsToAdd[i]);
                }
              }
            }
          } else {
            productVariantsToAdds.push('1');
          }
          const productsToRemove = index.productsToRemove;

          for (let i = 0; i < productsToRemove.length; i++) {
            for (
              let j = 0;
              j < discountProductsInputDto.productsToRemove.length;
              j++
            ) {
              if (
                productsToRemove[i] ==
                discountProductsInputDto.productsToRemove[j]
              ) {
                productsToRemoves.push(productsToRemove[i]);
              }
            }
          }
          const productVariantsToRemove = index.productVariantsToRemove;

          for (let i = 0; i < productVariantsToRemove.length; i++) {
            for (
              let j = 0;
              j < discountProductsInputDto.productVariantsToRemove.length;
              j++
            ) {
              if (
                productVariantsToRemove[i] ==
                discountProductsInputDto.productVariantsToRemove[j]
              ) {
                productVariantsToRemoves.push(productVariantsToRemove[i]);
              }
            }
          }
          if (productVariantsToAdds.length != 0 && productsToAdds.length != 0) {
            return index;
          }
        }),
      );
      const filteredResults = results.filter((result) => result !== undefined);
      if (productVariantsToAdds.length != 0 && productsToAdds.length != 0) {
        return filteredResults[0];
      } else {
        const newDiscountProductInputs = new this.discountProductsInputModel(
          discountProductsInputDto,
        );
        return newDiscountProductInputs.save();
      }
    }
  }
  async createDiscountCustomerBuysValue(
    discountCustomerBuysValueDto: DiscountCustomerBuysValueDto,
  ) {
    const values = await this.discountCustomerBuysValueModel.find();
    if (values.length == 0) {
      const newValue = new this.discountCustomerBuysModel(
        discountCustomerBuysValueDto,
      );
      return newValue.save();
    } else {
      const results = values.map((index) => {
        if (
          this.compareObject(
            {
              amount: discountCustomerBuysValueDto.amount,
              quantity: discountCustomerBuysValueDto.quantity,
            },
            { amount: index.amount, quantity: index.quantity },
          )
        ) {
          return index;
        }
      });
      const filteredResults = results.filter((result) => result !== undefined);

      if (filteredResults.length == 0) {
        const newValue = new this.discountCustomerBuysValueModel(
          discountCustomerBuysValueDto,
        );
        return newValue.save();
      } else {
        return filteredResults[0];
      }
    }
  }
  async createDiscountCustomerBuys({ item, value }: DiscountCustomerBuysDto) {
    if (item && value) {
      let discountCustomerBuysItem;
      let discountCustomerBuysValue;
      let saveDiscountItems;
      const savedDiscountBuysItem = [];
      const productsToAdds = [];
      const savedDiscountBuysValue = [];
      const items = await this.discountCustomerBuysModel.aggregate([
        {
          $lookup: {
            from: 'discountitems',
            localField: 'item',
            foreignField: '_id',
            as: 'item_info',
          },
        },
      ]);
      const values = await this.discountCustomerBuysModel.aggregate([
        {
          $lookup: {
            from: 'discountcustomerbuysvalues',
            localField: 'value',
            foreignField: '_id',
            as: 'value_info',
          },
        },
      ]);
      if (items.length == 0 && values.length == 0) {
        const savedValue = await this.createDiscountCustomerBuysValue(value);
        const savedProductsInput = await this.createDiscountProductsInput(
          item.products,
        );

        const newItem = new this.discountItemsModel({
          all: item.all,
          products: savedProductsInput._id,
        });
        const savedItem = await newItem.save();
        const newDiscountCustomerBuys = new this.discountCustomerBuysModel({
          item: savedItem._id,
          value: savedValue._id,
        });
        await newDiscountCustomerBuys.save();
        return {
          _id: newDiscountCustomerBuys._id,
          item: {
            all: savedItem.all,
            products: savedItem.products,
          },
          value: {
            amount: value.amount,
            quantity: value.quantity,
          },
        };
      } else {
        await Promise.all(
          items.map(async (index) => {
            const item_info = index.item_info[0];
            saveDiscountItems = item_info;
            const findProducts = await this.discountProductsInputModel.findById(
              item_info.products,
            );
            const toAdd = item.products.productsToAdd;
            const productsToAdd = findProducts.productsToAdd;

            for (let i = 0; i < productsToAdd.length; i++) {
              for (let j = 0; j < toAdd.length; j++) {
                if (toAdd[j] == productsToAdd[i]) {
                  productsToAdds.push(toAdd[j]);
                  discountCustomerBuysItem = index;
                }
              }
            }
          }),
        );
        if (productsToAdds.length == 0) {
          const newProducts = await new this.discountProductsInputModel(
            item.products,
          );
          const savedProducts = await newProducts.save();
          const newDiscountItem = new this.discountItemsModel({
            all: item.all,
            products: savedProducts._id,
          });
          const temp = await newDiscountItem.save();
          savedDiscountBuysItem.push({
            _id: temp._id,
            item: {
              all: item.all,
              products: item.products,
            },
          });
        } else {
          const findProducts = await this.discountProductsInputModel.findById(
            saveDiscountItems.products,
          );
          savedDiscountBuysItem.push({
            _id: saveDiscountItems._id,
            products: {
              productsToAdd: findProducts.productsToAdd,
            },
          });
        }
        await Promise.all(
          values.map((index) => {
            const value_info = index.value_info[0];

            if (
              this.compareObject(
                { amount: value_info.amount, quantity: value_info.quantity },
                value,
              )
            ) {
              savedDiscountBuysValue.push({
                _id: index._id,
                amount: value.amount,
                quantity: value.quantity,
              });
              discountCustomerBuysValue = index;
            }
          }),
        );

        if (
          savedDiscountBuysItem.length == 0 &&
          savedDiscountBuysValue.length == 0
        ) {
          const newDiscountCustomerBuys = new this.discountCustomerBuysModel({
            item: savedDiscountBuysItem[0]._id,
            value: savedDiscountBuysValue[0]._id,
          });
          await newDiscountCustomerBuys.save();
          return {
            _id: newDiscountCustomerBuys._id,
            item: {
              products: savedDiscountBuysItem[0].products,
            },
            value: {
              amount: savedDiscountBuysValue[0].amount,
              quantity: savedDiscountBuysValue[0].quantity,
            },
          };
        } else {
          if (discountCustomerBuysValue != undefined) {
            if (
              discountCustomerBuysValue.item.equals(
                discountCustomerBuysItem.item,
              ) &&
              discountCustomerBuysValue.value.equals(
                discountCustomerBuysItem.value,
              )
            ) {
              return {
                _id: discountCustomerBuysItem._id,
                item: {
                  products: savedDiscountBuysItem[0].products,
                },
                value: {
                  amount: savedDiscountBuysValue[0].amount,
                  quantity: savedDiscountBuysValue[0].quantity,
                },
              };
            } else {
              const newDiscountItemInputs = new this.discountProductsInputModel(
                item.products,
              );
              const savedDiscountItemInputs =
                await newDiscountItemInputs.save();
              const newDiscountItem = new this.discountItemsModel({
                all: item.all,
                collections: null,
                products: savedDiscountItemInputs._id,
              });
              const savedDiscountItem = await newDiscountItem.save();
              const newDIscountValues = new this.discountCustomerBuysValueModel(
                value,
              );
              const savedDiscountValues = await newDIscountValues.save();

              const newDiscountCustomerBuys =
                new this.discountCustomerBuysModel({
                  item: savedDiscountItem._id,
                  value: newDIscountValues._id,
                });
              const savedDiscountCustomerBuys =
                await newDiscountCustomerBuys.save();
              return {
                _id: savedDiscountCustomerBuys._id,
                item: {
                  products: item.products,
                  all: savedDiscountItem.all,
                  collections: savedDiscountItem.collections,
                },
                value: {
                  amount: savedDiscountValues.amount,
                  quantity: savedDiscountValues.quantity,
                },
              };
            }
          } else {
            const newDiscountItemInputs = new this.discountProductsInputModel(
              item.products,
            );
            const savedDiscountItemInputs = await newDiscountItemInputs.save();
            const newDiscountItem = new this.discountItemsModel({
              all: item.all,
              collections: null,
              products: savedDiscountItemInputs._id,
            });
            const savedDiscountItem = await newDiscountItem.save();
            const newDIscountValues = new this.discountCustomerBuysValueModel(
              value,
            );
            const savedDiscountValues = await newDIscountValues.save();

            const newDiscountCustomerBuys = new this.discountCustomerBuysModel({
              item: savedDiscountItem._id,
              value: newDIscountValues._id,
            });
            const savedDiscountCustomerBuys =
              await newDiscountCustomerBuys.save();
            return {
              _id: savedDiscountCustomerBuys._id,
              item: {
                products: item.products,
                all: savedDiscountItem.all,
                collections: savedDiscountItem.collections,
              },
              value: {
                amount: savedDiscountValues.amount,
                quantity: savedDiscountValues.quantity,
              },
            };
          }
        }
      }
    }
  }
  async createDiscountCustomerGets({
    item,
    value,
    ...discountCustomerGetsDto
  }: DiscountCustomerGetsDto) {
    const discountItem = [];
    const discountValue = [];
    if (item.products && item.collections) {
      const newDiscountItem = new this.discountItemsModel({
        all: true,
        products: null,
        collections: null,
      });
      const savedDiscountItem = await newDiscountItem.save();
      discountItem.push(savedDiscountItem);
    } else if (item.products) {
      console.log(item.products.productsToAdd);

      const newDiscountInput = new this.discountProductsInputModel({
        productsToAdd: item.products.productsToAdd,
      });
      const savedDiscountInput = await newDiscountInput.save();
      console.log(savedDiscountInput);

      discountItem.push(savedDiscountInput);
    }

    if (value.percentage) {
      const newDiscountValue = await this.createDiscountCustomerGetsValue({
        percentage: value.percentage,
        discountAmount: null,
        discountOnQuantity: null,
      });
      discountValue.push(newDiscountValue);
    } else if (value.discountAmount) {
      const newDiscountValue = await this.createDiscountCustomerGetsValue({
        percentage: null,
        discountAmount: value.discountAmount,
        discountOnQuantity: null,
      });
      discountValue.push(newDiscountValue);
    } else if (value.discountOnQuantity) {
      if (value.discountOnQuantity.effect.percentage) {
        const newDiscountValue = await this.createDiscountCustomerGetsValue({
          percentage: null,
          discountAmount: null,
          discountOnQuantity: {
            quantity: value.discountOnQuantity.quantity,
            effect: {
              discountAmount: null,
              percentage: value.discountOnQuantity.effect.percentage,
            },
          },
        });
        discountValue.push(newDiscountValue);
      } else if (value.discountOnQuantity.effect.discountAmount) {
        const newDiscountValue = await this.createDiscountCustomerGetsValue({
          percentage: null,
          discountAmount: null,
          discountOnQuantity: {
            quantity: value.discountOnQuantity.quantity,
            effect: {
              discountAmount: value.discountOnQuantity.effect.discountAmount,
              percentage: null,
            },
          },
        });
        discountValue.push(newDiscountValue);
      }
    }
    if (discountItem.length == 0) {
      const newDiscountCustomerGets = new this.discountCustomerGetsModel({
        item: null,
        value: discountValue[0]._id,
        appliesOnOnetimePurchase:
          discountCustomerGetsDto.appliesOnOneTimePurchase,
        appliesOnSubscription: discountCustomerGetsDto.appliesOnSubscription,
      });
      const savedDiscountCustomerGets = await newDiscountCustomerGets.save();
      return {
        _id: savedDiscountCustomerGets._id,
        item: null,
        value: discountValue[0],
        appliesOnOnetimePurchase:
          discountCustomerGetsDto.appliesOnOneTimePurchase,
        appliesOnSubscription: discountCustomerGetsDto.appliesOnSubscription,
      };
    } else {
      const newDiscountCustomerGets = new this.discountCustomerGetsModel({
        item: discountItem[0]._id,
        value: discountValue[0]._id,
        appliesOnOnetimePurchase:
          discountCustomerGetsDto.appliesOnOneTimePurchase,
        appliesOnSubscription: discountCustomerGetsDto.appliesOnSubscription,
      });
      const savedDiscountCustomerGets = await newDiscountCustomerGets.save();
      return {
        _id: savedDiscountCustomerGets._id,
        item: discountItem[0],
        value: discountValue[0],
        appliesOnOnetimePurchase:
          discountCustomerGetsDto.appliesOnOneTimePurchase,
        appliesOnSubscription: discountCustomerGetsDto.appliesOnSubscription,
      };
    }
  }
  async createDiscountOnQuantity({
    effect,
    ...discountOnQuantityDto
  }: DiscountOnQuantityDto) {
    if (effect.percentage) {
      const newDiscountEffect = await this.createDiscountEffect(effect);
      const newDiscountOnQuantity = new this.discountOnQuantityModel({
        quantity: discountOnQuantityDto.quantity,
        effect: newDiscountEffect._id,
      });
      const savedDiscountOnQuantity = await newDiscountOnQuantity.save();
      return {
        _id: savedDiscountOnQuantity._id,
        quantity: savedDiscountOnQuantity.quantity,
        effect: {
          percentage: newDiscountEffect.percentage,
          discountAmount: null,
        },
      };
    } else if (effect.discountAmount) {
      const newDiscountEffect = await this.createDiscountEffect({
        discountAmount: effect.discountAmount,
        percentage: null,
      });
      const newDiscountOnQuantity = new this.discountOnQuantityModel({
        quantity: discountOnQuantityDto.quantity,
        effect: newDiscountEffect._id,
      });
      const savedDiscountOnQuantity = await newDiscountOnQuantity.save();

      return {
        _id: savedDiscountOnQuantity._id,
        quantity: savedDiscountOnQuantity.quantity,
        effect: {
          percentage: null,
          discountAmount: {
            amount: effect.discountAmount.amount,
            appliesOnEachItem: effect.discountAmount.appliesOnEachItem,
          },
        },
      };
    }
  }
  async createDiscountCustomerGetsValue({
    discountAmount,
    discountOnQuantity,
    ...discountCustomerGetsValueDto
  }: DiscountCustomerGetsValuesDto) {
    const savedDiscountAmount = [];
    const savedDiscountOnQuantity = [];
    const savedPercentage = [];
    if (discountAmount) {
      const newDiscountAmount = await this.createDiscountAmount(discountAmount);
      const newDisscountValue = new this.discountCustomerGetsValueModel({
        percentage: null,
        discountAmount: newDiscountAmount._id,
        discountOnQuantity: null,
      });
      const savedDiscountValue = await newDisscountValue.save();

      return {
        _id: savedDiscountValue._id,
        percentage: null,
        discountOnQuantity: null,
        discountAmount: newDiscountAmount,
      };
    } else if (discountOnQuantity) {
      const newDiscountOnQuantity =
        await this.createDiscountOnQuantity(discountOnQuantity);
      const newDisscountValue = new this.discountCustomerGetsValueModel({
        percentage: null,
        discountAmount: null,
        discountOnQuantity: newDiscountOnQuantity._id,
      });
      const savedDiscountValue = await newDisscountValue.save();
      if (discountOnQuantity.effect.discountAmount) {
        return {
          _id: savedDiscountValue._id,
          percentage: null,
          discountOnQuantity: {
            quantity: newDiscountOnQuantity.quantity,
            effect: {
              discountAmount: discountOnQuantity.effect.discountAmount,
              percentage: null,
            },
          },
          discountAmount: null,
        };
      } else if (discountOnQuantity.effect.percentage) {
        return {
          _id: savedDiscountValue._id,
          percentage: null,
          discountOnQuantity: {
            quantity: newDiscountOnQuantity.quantity,
            effect: {
              discountAmount: null,
              percentage: discountOnQuantity.effect.percentage,
            },
          },
          discountAmount: null,
        };
      }
    } else if (discountCustomerGetsValueDto.percentage) {
      const newDisscountValue = new this.discountCustomerGetsValueModel({
        percentage: discountCustomerGetsValueDto.percentage,
        discountAmount: null,
        discountOnQuantity: null,
      });
      const savedDiscountValue = await newDisscountValue.save();
      return {
        _id: savedDiscountValue._id,
        percentage: discountCustomerGetsValueDto.percentage,
        discountOnQuantity: null,
        discountAmount: null,
      };
    }
  }
  async createDiscountEffect({
    discountAmount,
    ...discountEffectDto
  }: DiscountEffectDto) {
    const savedDiscountAmount = [];
    const savedDiscountEffect = [];
    const discountAmountFromDiscountEffect =
      await this.discountEffectModel.aggregate([
        {
          $lookup: {
            from: 'discountamounts',
            localField: 'discountAmount',
            foreignField: '_id',
            as: 'discountAmount_info',
          },
        },
      ]);
    if (discountAmountFromDiscountEffect.length == 0) {
      if (discountAmount) {
        const discountAmounts = await this.discountAmountModel.find();
        if (discountAmounts.length == 0) {
          const newDiscountAmount = new this.discountAmountModel(
            discountAmount,
          );
          const temp = await newDiscountAmount.save();
          const newDiscountEffect = new this.discountEffectModel({
            discountAmount: temp._id,
            ...discountEffectDto,
          });
          return {
            _id: newDiscountEffect._id,
            discountAmount: discountAmount,
          };
        } else {
          discountAmounts.map((index) => {
            const { amount, appliesOnEachItem } = index as {
              amount: number;
              appliesOnEachItem: boolean;
            };
            if (
              this.compareObject({ amount, appliesOnEachItem }, discountAmount)
            ) {
              savedDiscountAmount.push(index);
            }
          });
        }
      }

      if (discountEffectDto) {
        const newDiscountEffect = new this.discountEffectModel({
          ...discountEffectDto,
        });

        const savedDiscountEffect = await newDiscountEffect.save();
        return {
          _id: savedDiscountEffect._id,
          percentage: discountEffectDto.percentage,
        };
      }
    } else {
      await Promise.all(
        discountAmountFromDiscountEffect.map(async (index) => {
          const discountAmount_info = index.discountAmount_info[0];

          if (discountAmount) {
            if (discountAmount_info != null) {
              const { amount, appliesOnEachItem } = discountAmount_info as {
                _id: any;
                amount: number;
                appliesOnEachItem: boolean;
              };

              if (
                this.compareObject(
                  { amount, appliesOnEachItem },
                  discountAmount,
                )
              ) {
                savedDiscountAmount.push(index);
              }
            } else {
              const newDiscountAmount =
                await this.createDiscountAmount(discountAmount);
              savedDiscountAmount.push(newDiscountAmount);
            }
          }
          if (discountEffectDto) {
            if (discountEffectDto.percentage == index.percentage) {
              savedDiscountEffect.push(index);
            }
          }
        }),
      );
    }
    if (discountAmount) {
      if (savedDiscountAmount.length != 0) {
        return {
          _id: savedDiscountAmount[0]._id,
          discountAmount: discountAmount,
        };
      } else {
        const newDiscountAmount =
          await this.createDiscountAmount(discountAmount);
        const newDiscountEffect = new this.discountEffectModel({
          discountAmount: newDiscountAmount._id,
        });

        const savedDiscountEffect = await newDiscountEffect.save();

        return {
          _id: savedDiscountEffect._id,
          discountAmount: discountAmount,
        };
      }
    }
    if (discountEffectDto) {
      if (savedDiscountEffect.length != 0) {
        const newDiscountEffect = new this.discountEffectModel({
          ...discountEffectDto,
        });
        const savedDiscountEffect = await newDiscountEffect.save();

        return {
          _id: savedDiscountEffect._id,
          percentage: discountEffectDto.percentage,
        };
      } else {
        const newDiscountEffect = new this.discountEffectModel({
          percentage: discountEffectDto.percentage,
          discountAmount: null,
        });
        const savedDiscountEffect = await newDiscountEffect.save();

        return {
          _id: savedDiscountEffect._id,
          percentage: discountEffectDto.percentage,
        };
      }
    }
  }
  async createDiscountAmount({ ...discountAmountDto }: DiscountAmountDto) {
    if (discountAmountDto) {
      const discountAmounts = await this.discountAmountModel.find();
      if (discountAmounts.length == 0) {
        const newDiscountAmount = new this.discountAmountModel(
          discountAmountDto,
        );
        return newDiscountAmount.save();
      } else {
        const results = await Promise.all(
          discountAmounts.map((discountAmount) => {
            const { amount, appliesOnEachItem } = discountAmount as {
              amount: number;
              appliesOnEachItem: boolean;
            };
            if (
              this.compareObject(
                { amount, appliesOnEachItem },
                discountAmountDto,
              )
            ) {
              return discountAmount;
            }
          }),
        );
        const filteredResults = results.filter(
          (result) => result !== undefined,
        );
        if (filteredResults.length == 0) {
          const newDiscountAmount = new this.discountAmountModel(
            discountAmountDto,
          );
          return newDiscountAmount.save();
        } else {
          return filteredResults[0];
        }
      }
    }
  }
  async createDestination({
    ...destination
  }: DiscountShippingDestinationSelectionDto) {
    const destinations =
      await this.discountShippingDestinationSelectionModel.find();
    let found = false;
    let savedDestination;
    if (destinations.length == 0) {
      const newDestination = new this.discountShippingDestinationSelectionModel(
        destination,
      );
      return await newDestination.save();
    } else {
      destinations.map((index) => {
        const { all } = index as { all: boolean };
        if (this.compareObject({ all }, destination)) {
          found = true;
          savedDestination = index;
        }
      });
    }
    if (found) {
      return savedDestination;
    } else {
      const newDestination = new this.discountShippingDestinationSelectionModel(
        destination,
      );
      return await newDestination.save();
    }
  }
  async createDiscountMinimumRequirement({
    ...discountMinimumRequirement
  }: DiscountMinimumRequirementDto) {
    const minimumRequirement = [];
    console.log(discountMinimumRequirement);
    if (discountMinimumRequirement.quantity) {
      const minimumRequirements =
        await this.discountMinimumRequirementModel.find();
      if (minimumRequirements.length == 0) {
        const newMinimumRequirement = new this.discountMinimumRequirementModel(
          discountMinimumRequirement,
        );
        return newMinimumRequirement.save();
      } else {
        minimumRequirements.map((value) => {
          if (discountMinimumRequirement.quantity == value.quantity) {
            minimumRequirement.push(value);
          }
        });
        if (minimumRequirement.length == 0) {
          const newMinimumRequirement =
            new this.discountMinimumRequirementModel(
              discountMinimumRequirement,
            );
          return newMinimumRequirement.save();
        } else {
          return minimumRequirement[0];
        }
      }
    } else if (discountMinimumRequirement.subtotal) {
      const minimumRequirements =
        await this.discountMinimumRequirementModel.find();
      if (minimumRequirements.length == 0) {
        const newMinimumRequirement = new this.discountMinimumRequirementModel(
          discountMinimumRequirement,
        );
        return newMinimumRequirement.save();
      } else {
        minimumRequirements.map((value) => {
          if (discountMinimumRequirement.subtotal == value.subtotal) {
            minimumRequirement.push(value);
          }
        });
        if (minimumRequirement.length == 0) {
          const newMinimumRequirement =
            new this.discountMinimumRequirementModel(
              discountMinimumRequirement,
            );
          return newMinimumRequirement.save();
        } else {
          return minimumRequirement[0];
        }
      }
    } else {
      const minimumRequirements =
        await this.discountMinimumRequirementModel.find();

      if (minimumRequirements.length == 0) {
        const newMinimumRequirement = new this.discountMinimumRequirementModel(
          discountMinimumRequirement,
        );
        return newMinimumRequirement.save();
      } else {
        minimumRequirements.map((value) => {
          if (value.quantity == null && value.subtotal == null) {
            minimumRequirement.push(value);
          }
        });
        if (minimumRequirement.length == 0) {
          const newMinimumRequirement =
            new this.discountMinimumRequirementModel(
              discountMinimumRequirement,
            );

          return newMinimumRequirement.save();
        } else {
          return minimumRequirement[0];
        }
      }
    }
  }
  async getAllDiscount(automatics, codes) {}
}
