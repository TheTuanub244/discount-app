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
              console.log(newDIscountValues);

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
    if (item && value) {
      const savedDiscountItem = [];
      const savedDiscountValue = [];
      const discountAmountEffect = [];
      const discountEffect = [];
      const discountAmount = [];
      const savedDiscountCustomerGets = [];
      const discountOnQuantity = [];
      const productsToAdds = [];
      const saveDiscountItems = [];
      const discountCustomerGetsWithItem =
        await this.discountCustomerGetsModel.aggregate([
          {
            $lookup: {
              from: 'discountitems',
              localField: 'item',
              foreignField: '_id',
              as: 'discountItem_info',
            },
          },
        ]);
      const discountCustomerGetsWithValue =
        await this.discountCustomerGetsModel.aggregate([
          {
            $lookup: {
              from: 'discountcustomergetsvalues',
              localField: 'value',
              foreignField: '_id',
              as: 'discountValue_info',
            },
          },
        ]);

      if (
        discountCustomerGetsWithItem.length == 0 &&
        discountCustomerGetsWithValue.length == 0
      ) {
        const discountItems = await this.discountItemsModel.find();
        const discountValue = await this.createDiscountCustomerGetsValue(value);
        if (discountItems.length == 0) {
          const temp = await this.createDiscountProductsInput(item.products);
          const newDiscountItem = new this.discountItemsModel({
            products: temp._id,
          });
          const savedDiscountItem = await newDiscountItem.save();
          const newDiscountCustomerGets = new this.discountCustomerGetsModel({
            item: savedDiscountItem._id,
            value: discountValue._id,
            appliesOnOnetimePurchase:
              discountCustomerGetsDto.appliesOnOneTimePurchase,
            appliesOnSubscription:
              discountCustomerGetsDto.appliesOnSubscription,
          });

          const temp1 = await newDiscountCustomerGets.save();
          if (value.discountAmount) {
            const discountAmount = await this.discountAmountModel.findById(
              discountValue.discountAmount,
            );
            return {
              _id: temp1._id,
              appliesOnSubscription: temp1.appliesOnSubscription,
              appliesOnOneTimePurchase: temp1.appliesOnOnetimePurchase,
              item: {
                products: item.products,
              },
              value: {
                discountAmount: {
                  amount: discountAmount.amount,
                  appliesOnEachItem: discountAmount.appliesOnEachItem,
                },
              },
            };
          }
          if (value.discountOnQuantity) {
            const discountOnQuantity =
              await this.discountOnQuantityModel.findById(
                discountValue.discountOnQuantity,
              );
            const discountEffect = await this.discountEffectModel.findById(
              discountOnQuantity.effect,
            );
            if (value.discountOnQuantity.effect.discountAmount) {
              const discountAmountEffect =
                await this.discountAmountModel.findById(
                  discountEffect.discountAmount,
                );

              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOneTimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: item.products,
                },
                value: {
                  discountOnQuantity: {
                    effect: {
                      discountAmount: {
                        amount: discountAmountEffect.amount,
                        appliesOnEachItem:
                          discountAmountEffect.appliesOnEachItem,
                      },
                    },
                    quantity: discountOnQuantity.quantity,
                  },
                },
              };
            }
            if (value.discountOnQuantity.effect.percentage) {
              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOneTimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: item.products,
                },
                value: {
                  discountOnQuantity: {
                    effect: {
                      percentage: discountEffect.percentage,
                    },
                    quantity: discountOnQuantity.quantity,
                  },
                },
              };
            }
          }
          if (value.percentage) {
            return {
              _id: temp1._id,
              appliesOnSubscription: temp1.appliesOnSubscription,
              appliesOnOneTimePurchase: temp1.appliesOnOnetimePurchase,
              item: {
                products: item.products,
              },
              value: {
                percentage: discountValue.percentage,
              },
            };
          }
        } else {
          await Promise.all(
            discountItems.map(async (index) => {
              const products = await this.discountProductsInputModel.findById(
                index.products,
              );
              const productsToAdd = products.productsToAdd;
              for (let i = 0; i < productsToAdd.length; i++) {
                for (let j = 0; j < item.products.productsToAdd.length; j++) {
                  if (productsToAdd[i] == item.products.productsToAdd[j]) {
                    productsToAdds.push(productsToAdd[i]);
                    saveDiscountItems[0] = index;
                  }
                }
              }
            }),
          );
          if (saveDiscountItems.length != 0) {
            savedDiscountItem.push({
              _id: saveDiscountItems[0]._id,
              products: {
                productsToAdd: productsToAdds[0],
              },
            });
          }

          if (savedDiscountItem.length == 0) {
            const temp = await this.createDiscountProductsInput(item.products);
            const newDiscountItem = new this.discountItemsModel({
              products: temp._id,
            });
            const savedDiscountItem = await newDiscountItem.save();
            const newDiscountCustomerGets = new this.discountCustomerGetsModel({
              item: savedDiscountItem._id,
              value: discountValue._id,
              ...discountCustomerGetsDto,
            });
            const temp1 = await newDiscountCustomerGets.save();

            if (value.discountAmount) {
              const discountAmount = await this.discountAmountModel.findById(
                discountValue.discountAmount,
              );
              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: item.products,
                },
                value: {
                  discountAmount: {
                    amount: discountAmount.amount,
                    appliesOnEachItem: discountAmount.appliesOnEachItem,
                  },
                },
              };
            }
            if (value.discountOnQuantity) {
              const discountOnQuantity =
                await this.discountOnQuantityModel.findById(
                  discountValue.discountOnQuantity,
                );
              const discountEffect = await this.discountEffectModel.findById(
                discountOnQuantity.effect,
              );
              if (value.discountOnQuantity.effect.discountAmount) {
                const discountAmountEffect =
                  await this.discountAmountModel.findById(
                    discountEffect.discountAmount,
                  );
                return {
                  _id: temp1._id,
                  appliesOnSubscription: temp1.appliesOnSubscription,
                  appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                  item: {
                    products: item.products,
                  },
                  value: {
                    discountOnQuantity: {
                      effect: {
                        discountAmount: {
                          amount: discountAmountEffect.amount,
                          appliesOnEachItem:
                            discountAmountEffect.appliesOnEachItem,
                        },
                      },
                      quantity: discountOnQuantity.quantity,
                    },
                  },
                };
              }
              if (value.discountOnQuantity.effect.percentage) {
                return {
                  _id: temp1._id,
                  appliesOnSubscription: temp1.appliesOnSubscription,
                  appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                  item: {
                    products: item.products,
                  },
                  value: {
                    discountOnQuantity: {
                      effect: {
                        percentage: discountEffect.percentage,
                      },
                      quantity: discountOnQuantity.quantity,
                    },
                  },
                };
              }
            }
            if (value.percentage) {
              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: item.products,
                },
                value: {
                  percentage: value.percentage,
                },
              };
            }
          } else {
            const newDiscountCustomerGets = new this.discountCustomerGetsModel({
              item: savedDiscountItem[0]._id,
              value: discountValue._id,
              ...discountCustomerGetsDto,
            });

            const temp1 = await newDiscountCustomerGets.save();
            if (value.discountAmount) {
              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: savedDiscountItem[0].products,
                },
                value: {
                  discountAmount: discountValue.discountAmount,
                },
              };
            }
            if (value.discountOnQuantity) {
              const discountOnQuantity =
                await this.discountOnQuantityModel.findById(
                  discountValue.discountOnQuantity,
                );
              const discountEffect = await this.discountEffectModel.findById(
                discountOnQuantity.effect,
              );
              if (value.discountOnQuantity.effect.discountAmount) {
                const discountAmountEffect =
                  await this.discountAmountModel.findById(
                    discountEffect.discountAmount,
                  );

                return {
                  _id: temp1._id,
                  appliesOnSubscription: temp1.appliesOnSubscription,
                  appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                  item: {
                    products: savedDiscountItem[0].products,
                  },
                  value: {
                    discountOnQuantity: {
                      effect: {
                        discountAmount: {
                          amount: discountAmountEffect.amount,
                          appliesOnEachItem:
                            discountAmountEffect.appliesOnEachItem,
                        },
                      },
                      quantity: discountOnQuantity.quantity,
                    },
                  },
                };
              }
              if (value.discountOnQuantity.effect.percentage) {
                return {
                  _id: temp1._id,
                  appliesOnSubscription: temp1.appliesOnSubscription,
                  appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                  item: {
                    products: savedDiscountItem[0].products,
                  },
                  value: {
                    discountOnQuantity: {
                      effect: {
                        percentage: discountEffect.percentage,
                      },
                      quantity: discountOnQuantity.quantity,
                    },
                  },
                };
              }
            }
            if (value.percentage) {
              return {
                _id: temp1._id,
                appliesOnSubscription: temp1.appliesOnSubscription,
                appliesOnOnetimePurchase: temp1.appliesOnOnetimePurchase,
                item: {
                  products: savedDiscountItem[0].products,
                },
                value: {
                  percentage: value.percentage,
                },
              };
            }
          }
        }
      } else {
        await Promise.all(
          discountCustomerGetsWithItem.map(async (index) => {
            const item_info = index.discountItem_info[0];
            const findProducts = await this.discountProductsInputModel.findById(
              item_info.products,
            );
            const toAdd = item.products.productsToAdd;

            const productsToAdd = findProducts.productsToAdd;

            for (let i = 0; i < productsToAdd.length; i++) {
              for (let j = 0; j < toAdd.length; j++) {
                if (toAdd[j] == productsToAdd[i]) {
                  productsToAdds.push(productsToAdd[i]);
                  saveDiscountItems[0] = index;
                }
              }
            }
          }),
        );

        if (saveDiscountItems.length != 0) {
          savedDiscountItem.push({
            _id: saveDiscountItems[0]._id,
            products: {
              productsToAdd: productsToAdds[0],
            },
          });
        }

        await Promise.all(
          discountCustomerGetsWithValue.map(async (index) => {
            const discountValue_info = index.discountValue_info[0];
            if (value.discountAmount) {
              const discountamount = await this.discountAmountModel.findById(
                discountValue_info.discountAmount,
              );

              if (
                this.compareObject(
                  {
                    amount: discountamount.amount,
                    appliesOnEachItem: discountamount.appliesOnEachItem,
                  },
                  value.discountAmount,
                )
              ) {
                discountAmount.push({
                  _id: discountamount._id,
                  amount: discountamount.amount,
                  appliesOnEachItem: discountamount.appliesOnEachItem,
                });
              }
              if (discountValue_info.percentage == value.percentage) {
                savedDiscountValue.push(index);
              }
            }
            if (value.discountOnQuantity) {
              const findDiscountOnQuantity =
                await this.createDiscountOnQuantity(value.discountOnQuantity);
              const findDiscountEffect = await this.createDiscountEffect(
                value.discountOnQuantity.effect,
              );
              if (value.discountOnQuantity.effect.discountAmount) {
                const findDiscountAmountEffect =
                  await this.discountAmountModel.findById(
                    findDiscountEffect.discountAmount,
                  );
                const { amount, appliesOnEachItem } =
                  findDiscountAmountEffect as {
                    amount: number;
                    appliesOnEachItem: boolean;
                  };
                if (
                  this.compareObject(
                    { amount, appliesOnEachItem },
                    value.discountOnQuantity.effect.discountAmount,
                  )
                ) {
                  discountAmountEffect.push(findDiscountAmountEffect);
                  if (
                    findDiscountOnQuantity.quantity ==
                    value.discountOnQuantity.quantity
                  ) {
                    discountOnQuantity.push({
                      _id: findDiscountOnQuantity._id,
                      effect: {
                        discountAmount:
                          value.discountOnQuantity.effect.discountAmount,
                      },
                      quantity: value.discountOnQuantity.quantity,
                    });
                  }
                }
              }
              if (value.discountOnQuantity.effect.percentage) {
                if (
                  value.discountOnQuantity.effect.percentage ==
                  findDiscountEffect.percentage
                ) {
                  discountEffect.push({
                    _id: findDiscountEffect._id,
                    discountAmount:
                      value.discountOnQuantity.effect.discountAmount,
                    percentage: value.discountOnQuantity.effect.percentage,
                  });
                  if (
                    findDiscountOnQuantity.quantity ==
                    value.discountOnQuantity.quantity
                  ) {
                    discountOnQuantity.push({
                      _id: findDiscountOnQuantity._id,
                      effect: {
                        percentage: value.discountOnQuantity.effect.percentage,
                      },
                      quantity: value.discountOnQuantity.quantity,
                    });
                  }
                }
              }
              if (value.percentage) {
                if (discountValue_info.percentage == value.percentage) {
                  savedDiscountValue.push(index);
                }
              }
            }
            if (
              discountCustomerGetsDto.appliesOnSubscription ==
                index.appliesOnSubscription &&
              discountCustomerGetsDto.appliesOnOneTimePurchase ==
                index.appliesOnOneTimePurchase
            ) {
              savedDiscountCustomerGets.push(index);
            }
          }),
        );
        if (value.discountAmount) {
          if (
            discountAmount.length != 0 &&
            savedDiscountCustomerGets.length != 0 &&
            savedDiscountItem.length != 0
          ) {
            return {
              _id: savedDiscountCustomerGets[0]._id,
              item: {
                products: savedDiscountItem[0].products,
              },
              value: value,
              appliesOnSubscription:
                discountCustomerGetsDto.appliesOnSubscription,
              appliesOnOneTimePurchase:
                discountCustomerGetsDto.appliesOnOneTimePurchase,
            };
          } else {
            const newDiscountvalue =
              await this.createDiscountCustomerGetsValue(value);
            const temp = await this.createDiscountProductsInput(item.products);
            const newDiscountItem = new this.discountItemsModel({
              products: temp._id,
            });

            const savedDiscountItem = await newDiscountItem.save();
            const newDiscountCustomerGets = new this.discountCustomerGetsModel({
              item: savedDiscountItem._id,
              value: newDiscountvalue._id,
              ...discountCustomerGetsDto,
            });
            return {
              _id: newDiscountCustomerGets._id,
              item: {
                products: item.products,
              },
              value: value,
              appliesOnSubscription:
                discountCustomerGetsDto.appliesOnSubscription,
              appliesOnOneTimePurchase:
                discountCustomerGetsDto.appliesOnOneTimePurchase,
            };
          }
        }
        if (value.discountOnQuantity) {
          if (
            discountOnQuantity.length != 0 &&
            savedDiscountCustomerGets.length != 0 &&
            savedDiscountItem.length != 0
          ) {
            return {
              _id: savedDiscountCustomerGets[0]._id,
              item: {
                products: savedDiscountItem[0].products,
              },
              value: value,
              appliesOnSubscription:
                discountCustomerGetsDto.appliesOnSubscription,
              appliesOnOneTimePurchase:
                discountCustomerGetsDto.appliesOnOneTimePurchase,
            };
          } else {
            const newDiscountvalue =
              await this.createDiscountCustomerGetsValue(value);
            const temp = await this.createDiscountProductsInput(item.products);

            const newDiscountItem = new this.discountItemsModel({
              products: temp._id,
            });

            const savedDiscountItem = await newDiscountItem.save();

            const newDiscountCustomerGets = new this.discountCustomerGetsModel({
              item: savedDiscountItem._id,
              value: newDiscountvalue._id,
              ...discountCustomerGetsDto,
            });
            return {
              _id: newDiscountCustomerGets._id,
              item: {
                products: item.products,
              },
              value: value,
              appliesOnSubscription:
                discountCustomerGetsDto.appliesOnSubscription,
              appliesOnOneTimePurchase:
                discountCustomerGetsDto.appliesOnOneTimePurchase,
            };
          }
        }
        if (value.percentage) {
          if (
            savedDiscountValue.length != 0 &&
            savedDiscountCustomerGets.length != 0 &&
            savedDiscountItem.length != 0
          ) {
            return {
              _id: savedDiscountCustomerGets[0]._id,
              item: {
                products: savedDiscountItem[0].products,
              },
              value: value,
              appliesOnSubscription:
                discountCustomerGetsDto.appliesOnSubscription,
              appliesOnOneTimePurchase:
                discountCustomerGetsDto.appliesOnOneTimePurchase,
            };
          }
        }
      }
    }
  }
  async createDiscountOnQuantity({
    effect,
    ...discountOnQuantityDto
  }: DiscountOnQuantityDto) {
    if (effect && discountOnQuantityDto) {
      const discountOnQuantityWithDiscountEffect =
        await this.discountOnQuantityModel.aggregate([
          {
            $lookup: {
              from: 'discounteffects',
              localField: 'effect',
              foreignField: '_id',
              as: 'discountEffect_info',
            },
          },
        ]);
      if (discountOnQuantityWithDiscountEffect.length == 0) {
        const savedDiscountEffect = await this.createDiscountEffect(effect);

        const newDiscountOnQuantity = new this.discountOnQuantityModel({
          effect: savedDiscountEffect._id,
          ...discountOnQuantityDto,
        });
        return newDiscountOnQuantity.save();
      } else {
        const savedDiscountEffect = [];
        const savedDiscountAmount = [];
        const savedDiscountOnQuantity = [];
        await Promise.all(
          discountOnQuantityWithDiscountEffect.map(async (index) => {
            const discountEffect_info = index.discountEffect_info[0];
            const discountAmount = await this.discountAmountModel.findById(
              discountEffect_info.discountAmount,
            );
            if (effect.discountAmount) {
              const temp = {
                amount: effect.discountAmount.amount,
                appliesOnEachItem: effect.discountAmount.appliesOnEachItem,
              };

              const { amount, appliesOnEachItem } = discountAmount as {
                amount: number;
                appliesOnEachItem: boolean;
              };
              if (this.compareObject({ amount, appliesOnEachItem }, temp)) {
                savedDiscountAmount.push(index);
              }
            }
            if (effect.percentage) {
              if (effect.percentage == discountEffect_info.percentage) {
                savedDiscountEffect.push(index);
              }
            }
            if ((index.quantity = discountOnQuantityDto.quantity)) {
              savedDiscountOnQuantity.push(index);
            }
          }),
        );
        if (effect.discountAmount) {
          if (
            savedDiscountAmount.length != 0 &&
            savedDiscountOnQuantity.length != 0
          ) {
            return {
              _id: savedDiscountAmount[0]._id,
              discountAmount: effect.discountAmount,
              quantity: discountOnQuantityDto.quantity,
            };
          } else {
            const newDiscountEffect = await this.createDiscountEffect(effect);
            const newDiscountOnQuantity = new this.discountOnQuantityModel({
              effect: newDiscountEffect._id,
              ...discountOnQuantityDto,
            });
            const savedDiscountOnQuantity = await newDiscountOnQuantity.save();
            return {
              _id: savedDiscountOnQuantity._id,
              effect: effect,
              quantity: discountOnQuantityDto.quantity,
            };
          }
        }
        if (effect.percentage) {
          if (
            savedDiscountEffect.length != 0 &&
            savedDiscountOnQuantity.length != 0
          ) {
            return {
              _id: savedDiscountEffect[0]._id,
              effect: effect,
              quantity: discountOnQuantityDto.quantity,
            };
          } else {
            const newDiscountEffect = await this.createDiscountEffect(effect);

            const newDiscountOnQuantity = new this.discountOnQuantityModel({
              effect: newDiscountEffect._id,
              ...discountOnQuantityDto,
            });
            const savedDiscountOnQuantity = await newDiscountOnQuantity.save();
            return {
              _id: savedDiscountOnQuantity._id,
              effect: effect,
              quantity: discountOnQuantityDto.quantity,
            };
          }
        }
      }
    }
  }
  async createDiscountCustomerGetsValue({
    discountAmount,
    discountOnQuantity,
    ...discountCustomerGetsValueDto
  }: DiscountCustomerGetsValuesDto) {
    const savedAmount = [];
    const savedAmountEffect = [];
    const savedEffect = [];
    const savedDiscountOnQuantity = [];
    const savedDiscountCustomerGetsValues = [];
    if (discountCustomerGetsValueDto.percentage) {
      const discountCustomerGetsValues =
        await this.discountCustomerGetsValueModel.find();
      if (discountCustomerGetsValues.length == 0) {
        const newDiscountCustomerGetsValue =
          new this.discountCustomerGetsValueModel({
            ...discountCustomerGetsValueDto,
          });
        const savedDiscountCustomerGetsValue =
          await newDiscountCustomerGetsValue.save();
        return {
          _id: savedDiscountCustomerGetsValue._id,
          percentage: discountCustomerGetsValueDto.percentage,
        };
      } else {
        discountCustomerGetsValues.map((index) => {
          if (index.percentage == discountCustomerGetsValueDto.percentage) {
            savedDiscountCustomerGetsValues.push(index);
          }
        });
      }
    }
    if (discountAmount) {
      const discountCustomerGetsValueWithDiscountAmount =
        await this.discountCustomerGetsValueModel.aggregate([
          {
            $lookup: {
              from: 'discountamounts',
              localField: 'discountAmount',
              foreignField: '_id',
              as: 'discountAmount_info',
            },
          },
        ]);
      if (discountCustomerGetsValueWithDiscountAmount.length == 0) {
        const discountAmounts = await this.discountAmountModel.find();
        if (discountAmounts.length == 0) {
          const newDiscountAmount =
            await this.createDiscountAmount(discountAmount);
          const newDiscountCustomerGetsValue =
            new this.discountCustomerGetsValueModel({
              discountAmount: newDiscountAmount._id,
              ...discountCustomerGetsValueDto,
            });
          const savedDiscountCustomerGetsValue =
            await newDiscountCustomerGetsValue.save();
          return {
            _id: savedDiscountCustomerGetsValue._id,
            discountAmount: {
              amount: newDiscountAmount.amount,
              appliesOnEachItem: newDiscountAmount.appliesOnEachItem,
            },
          };
        } else {
          discountAmounts.map((index) => {
            if (
              this.compareObject(
                {
                  amount: index.amount,
                  appliesOnEachItem: index.appliesOnEachItem,
                },
                discountAmount,
              )
            ) {
              savedAmount.push(index);
            }
          });
          if (savedAmount.length == 0) {
            const newDiscountAmount =
              await this.createDiscountAmount(discountAmount);
            const newDiscountCustomerGetsValue =
              new this.discountCustomerGetsValueModel({
                discountAmount: newDiscountAmount._id,
                ...discountCustomerGetsValueDto,
              });
            const savedDiscountCustomerGetsValue =
              await newDiscountCustomerGetsValue.save();
            return {
              _id: savedDiscountCustomerGetsValue._id,
              discountAmount: discountAmount,
            };
          } else {
            const newDiscountCustomerGetsValue =
              new this.discountCustomerGetsValueModel({
                discountAmount: savedAmount[0]._id,
                ...discountCustomerGetsValueDto,
              });
            const savedDiscountCustomerGetsValue =
              await newDiscountCustomerGetsValue.save();
            return {
              _id: savedDiscountCustomerGetsValue._id,
              discountAmount: discountAmount,
            };
          }
        }
      } else {
        await Promise.all(
          discountCustomerGetsValueWithDiscountAmount.map(async (index) => {
            const discountAmount_info = index.discountAmount_info[0];
            const { amount, appliesOnEachItem } = discountAmount_info as {
              amount: number;
              appliesOnEachItem: boolean;
            };
            if (
              this.compareObject({ amount, appliesOnEachItem }, discountAmount)
            ) {
              savedAmount.push(discountAmount_info);
            }
          }),
        );
        if (savedAmount.length != 0) {
          return {
            _id: savedAmount[0]._id,
            discountAmount: discountAmount,
          };
        } else {
          const newDiscountAmount =
            await this.createDiscountAmount(discountAmount);
          const newDiscountCustomerGetsValue =
            new this.discountCustomerGetsValueModel({
              discountAmount: newDiscountAmount._id,
              ...discountCustomerGetsValueDto,
            });
          const savedDiscountCustomerGetsValue =
            await newDiscountCustomerGetsValue.save();
          return {
            _id: savedDiscountCustomerGetsValue._id,
            discountAmount: discountAmount,
          };
        }
      }
    }

    if (discountOnQuantity) {
      const discountCustomerGetsValueWithDiscountOnQuantity =
        await this.discountCustomerGetsValueModel.aggregate([
          {
            $lookup: {
              from: 'discountonquantities',
              localField: 'discountOnQuantity',
              foreignField: '_id',
              as: 'discountOnQuantity_info',
            },
          },
        ]);
      if (discountCustomerGetsValueWithDiscountOnQuantity.length == 0) {
        const newDiscountOnQuantity =
          await this.createDiscountOnQuantity(discountOnQuantity);
        const newDiscountCustomerGetsValue =
          new this.discountCustomerGetsValueModel({
            discountOnQuantity: newDiscountOnQuantity._id,
            ...discountCustomerGetsValueDto,
          });
        const savedDiscountCustomerGetsValue =
          await newDiscountCustomerGetsValue.save();
        return {
          _id: savedDiscountCustomerGetsValue._id,
          discountOnQuantity: discountOnQuantity,
        };
      } else {
        await Promise.all(
          discountCustomerGetsValueWithDiscountOnQuantity.map(async (index) => {
            const discountOnQuantity_info = index.discountOnQuantity_info[0];

            const discountEffect = await this.discountEffectModel.findById(
              discountOnQuantity_info?.effect,
            );
            if (discountOnQuantity.effect.discountAmount) {
              const findDiscountAmount =
                await this.discountAmountModel.findById(
                  discountEffect.discountAmount,
                );
              const { amount, appliesOnEachItem } = findDiscountAmount as {
                amount: number;
                appliesOnEachItem: boolean;
              };
              if (
                this.compareObject(
                  { amount, appliesOnEachItem },
                  discountOnQuantity.effect.discountAmount,
                )
              ) {
                savedAmountEffect.push(findDiscountAmount);
              }
              if (
                discountOnQuantity_info.quantity == discountOnQuantity.quantity
              ) {
                savedDiscountOnQuantity.push(discountOnQuantity_info);
              }
            }
            if (discountOnQuantity.effect.percentage) {
              if (
                discountEffect.percentage ==
                discountOnQuantity.effect.percentage
              ) {
                savedEffect.push(discountEffect);
                if (
                  discountOnQuantity_info.quantity ==
                  discountOnQuantity.quantity
                ) {
                  savedDiscountOnQuantity.push(discountOnQuantity_info);
                }
              }
            }
          }),
        );
        if (discountOnQuantity.effect.discountAmount) {
          if (
            savedDiscountOnQuantity.length != 0 &&
            savedAmountEffect.length != 0
          ) {
            return {
              _id: savedDiscountOnQuantity[0]._id,
              discountOnQuantity: discountOnQuantity,
            };
          } else {
            const newDiscountOnQuantity =
              await this.createDiscountOnQuantity(discountOnQuantity);
            const newDiscountCustomerGetsValue =
              new this.discountCustomerGetsValueModel({
                discountOnQuantity: newDiscountOnQuantity._id,
                ...discountCustomerGetsValueDto,
              });
            const savedDiscountCustomerGetsValue =
              await newDiscountCustomerGetsValue.save();
            return {
              _id: savedDiscountCustomerGetsValue._id,
              discountOnQuantity: discountOnQuantity,
            };
          }
        }
        if (discountOnQuantity.effect.percentage) {
          if (savedEffect.length != 0 && savedDiscountOnQuantity.length != 0) {
            return {
              _id: savedDiscountOnQuantity[0]._id,
              percentage: savedEffect[0].percentage,
            };
          } else {
            const newDiscountOnQuantity =
              await this.createDiscountOnQuantity(discountOnQuantity);
            const newDiscountCustomerGetsValue =
              new this.discountCustomerGetsValueModel({
                discountOnQuantity: newDiscountOnQuantity._id,
              });
            const savedDiscountCustomerGetsValue =
              await newDiscountCustomerGetsValue.save();
            return {
              _id: savedDiscountCustomerGetsValue._id,
              discountOnQuantity: discountOnQuantity,
            };
          }
        }
      }
      if (discountCustomerGetsValueDto.percentage) {
        if (savedDiscountCustomerGetsValues.length != 0) {
          return {
            _id: savedDiscountCustomerGetsValues[0]._id,
            percentage: savedDiscountCustomerGetsValues[0].percentage,
          };
        } else {
          const newDiscountCustomerGetsValue =
            new this.discountCustomerGetsValueModel({
              ...discountCustomerGetsValueDto,
            });
          const savedDiscountCustomerGetsValue =
            await newDiscountCustomerGetsValue.save();
          return {
            _id: savedDiscountCustomerGetsValue._id,
            percentage: savedDiscountCustomerGetsValue.percentage,
          };
        }
      }
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
            const { amount, appliesOnEachItem } = discountAmount_info as {
              _id: any;
              amount: number;
              appliesOnEachItem: boolean;
            };

            if (
              this.compareObject({ amount, appliesOnEachItem }, discountAmount)
            ) {
              savedDiscountAmount.push(index);
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
    }
    if (discountMinimumRequirement.subtotal) {
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
    }
  }
  async getAllDiscount(automatics, codes) {}
}
