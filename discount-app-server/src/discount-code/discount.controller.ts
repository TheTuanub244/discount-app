import { Body, Controller, Get, Post } from '@nestjs/common';
import { DiscountCodeService } from './discount-code.service';
import { DiscountCodeBxGyDto } from './dto/level-2/create-discountCodeBxGy.dto';
import { DiscountCodebBasicDto } from './dto/level-2/create-discountCodeBasic.dto';
import { DiscountAutomaticService } from './discount-automatic.service';
import { DiscountAutomaticBasicDto } from './dto/level-2/create-discountAutomaticBasic.dto';
import { DiscountBasicService } from './discountBasic.service';
import { DiscountCustomerGetsDto } from './dto/level-2/create-discountCustomerGets.dto';

@Controller('discount')
export class DiscountController {
  constructor(
    private discountCodeService: DiscountCodeService,
    private discountAutomaticService: DiscountAutomaticService,
    private discountBasicService: DiscountBasicService,
  ) {}
  @Post('/createDiscountCodeBxGy')
  createDiscountCodeBxGy(@Body() discountCodeBxGyDto: DiscountCodeBxGyDto) {
    return this.discountCodeService.createDiscountCodeBxGy(discountCodeBxGyDto);
  }
  @Post('/createDiscountCodeBasic')
  createDiscountCodeBasic(@Body() discountCodeBasicDto: DiscountCodebBasicDto) {
    return this.discountCodeService.createDiscountCodeBasic(
      discountCodeBasicDto,
    );
  }
  @Post('/createDiscountAutomaticBasic')
  createDiscountAutomaticBasic(
    @Body() discountAutomaticBasic: DiscountAutomaticBasicDto,
  ) {
    return this.discountAutomaticService.createDiscountAutomaticBasic(
      discountAutomaticBasic,
    );
  }
  @Post('/createFreeShipping')
  createFreeShippingDiscount(@Body() discount: any) {
    const { year, month, day, hour, minute, second, millisecond } =
      discount.startDate.date;

    const formattedStartDate = `${year}-${(month < 10 ? '0' : '') + month}-${(day < 10 ? '0' : '') + day}T${(hour < 10 ? '0' : '') + hour}:${(minute < 10 ? '0' : '') + minute}:${(second < 10 ? '0' : '') + second}.${('00' + millisecond).slice(-3)}Z`;

    if (discount.id == 'automatic') {
      if (discount.shippingMinimumRequirement.quantity.choose) {
        if (discount.purchaseType.both) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: true,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: discount.shippingMinimumRequirement.quantity.amount,
                subtotal: null,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        } else if (discount.purchaseType.oneTimePurchase) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: discount.shippingMinimumRequirement.quantity.amount,
                subtotal: null,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        } else if (discount.purchaseType.subscription) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: false,
              appliesOnSubscription: true,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: discount.shippingMinimumRequirement.quantity.amount,
                subtotal: null,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        }
      } else if (discount.shippingMinimumRequirement.subtotal.choose) {
        if (discount.purchaseType.both) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: true,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: null,
                subtotal: discount.shippingMinimumRequirement.subtotal.amount,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        } else if (discount.purchaseType.oneTimePurchase) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: null,
                subtotal: discount.shippingMinimumRequirement.subtotal.amount,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        } else if (discount.purchaseType.subscription) {
          return this.discountAutomaticService.createAutomaticDiscountFreeShipping(
            {
              appliesOnOneTimePurchase: false,
              appliesOnSubscription: true,
              maximumShippingPrice: null,
              recurringCycleLimit: null,
              discountMinimumRequirement: {
                quantity: null,
                subtotal: discount.shippingMinimumRequirement.subtotal.amount,
              },
              basicDetail: {
                combinesWith: {
                  orderDiscounts: discount.combinations.order,
                  productDiscounts: discount.combinations.product,
                  shippingDiscounts: discount.combinations.shipping,
                },
                appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
                code: discount.title,
                title: discount.title,
                usageLimit: null,
                startsAt: formattedStartDate,
                endsAt: discount.endDate.date,
                usePerOrderLimit: discount.usesPerOrder.amount,
              },
              destination: { all: true },
            },
          );
        }
      }
    } else {
      if (discount.shippingMinimumRequirement.quantity.choose) {
        if (discount.purchaseType.both) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: true,
            appliesOnSubscription: true,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: discount.shippingMinimumRequirement.quantity.amount,
              subtotal: null,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        } else if (discount.purchaseType.oneTimePurchase) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: true,
            appliesOnSubscription: false,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: discount.shippingMinimumRequirement.quantity.amount,
              subtotal: null,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        } else if (discount.purchaseType.subscription) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: false,
            appliesOnSubscription: true,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: discount.shippingMinimumRequirement.quantity.amount,
              subtotal: null,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        }
      } else if (discount.shippingMinimumRequirement.subtotal.choose) {
        if (discount.purchaseType.both) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: true,
            appliesOnSubscription: true,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: null,
              subtotal: discount.shippingMinimumRequirement.subtotal.amount,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        } else if (discount.purchaseType.oneTimePurchase) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: true,
            appliesOnSubscription: false,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: null,
              subtotal: discount.shippingMinimumRequirement.subtotal.amount,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        } else if (discount.purchaseType.subscription) {
          return this.discountCodeService.createDiscountCodeFreeShipping({
            appliesOnOneTimePurchase: false,
            appliesOnSubscription: true,
            maximumShippingPrice: null,
            recurringCycleLimit: null,
            discountMinimumRequirement: {
              quantity: null,
              subtotal: discount.shippingMinimumRequirement.subtotal.amount,
            },
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            destination: { all: true },
          });
        }
      }
    }
  }
  @Post('1')
  create(@Body() discountCustomerGetsDto: DiscountCustomerGetsDto) {
    return this.discountBasicService.createDiscountCustomerGets(
      discountCustomerGetsDto,
    );
  }
  @Get('/getAllDiscount')
  async getAllDiscount() {
    const discountNodes = {
      edges: [],
    };
    const automaticNodes =
      await this.discountAutomaticService.getAllAutomaticCode();
    const {
      automaticNodes: { edges: automatics },
    } = automaticNodes;
    automatics.map((discount) => {
      discountNodes.edges.push(discount);
    });
    const codeNodes = await this.discountCodeService.getAllDiscountCodes();
    const {
      codeNodes: { edges: codes },
    } = codeNodes;
    codes.map((discount) => {
      discountNodes.edges.push(discount);
    });
    return discountNodes;
  }
  @Post('/deactiveAllDiscounts')
  async handleDeactiveAllDiscounts(@Body() discounts: any) {
    return this.discountAutomaticService.deactiveAllDiscounts(discounts);
  }
  @Post('/activeAllDiscounts')
  async handleActiveAllDiscounts(@Body() discounts: any) {
    return this.discountAutomaticService.activeAllDiscounts(discounts);
  }
  @Post('/createBuyXgetY')
  async handleCreateBuyXgetY(@Body() discount: any) {
    const discountCustomerBuys = [];
    const discountCustomerGets = [];
    discount.minimumRequirement.products.map((value) => {
      discountCustomerBuys.push(value.id);
    });
    discount.customerGets.products.map((value) => {
      discountCustomerGets.push(value.id);
    });
    const { year, month, day, hour, minute, second, millisecond } =
      discount.startDate.date;

    // Format the date string
    const formattedStartDate = `${year}-${(month < 10 ? '0' : '') + month}-${(day < 10 ? '0' : '') + day}T${(hour < 10 ? '0' : '') + hour}:${(minute < 10 ? '0' : '') + minute}:${(second < 10 ? '0' : '') + second}.${('00' + millisecond).slice(-3)}Z`;

    if (discount.id == 'automatic') {
      if (discount.minimumRequirement.quantity) {
        if (discount.customerGets.discountValue.percentage.choose) {
          return this.discountAutomaticService.createDiscountAutomaticBxGy({
            usePerOrderLimit: discount.maxUses.useInTotal.amount,
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            discountCustomerBuys: {
              item: {
                products: {
                  productsToAdd: discountCustomerBuys,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                quantity: discount.minimumRequirement.amount,
                amount: null,
              },
            },
            discountCustomerGets: {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              item: {
                products: {
                  productsToAdd: discountCustomerGets,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                discountOnQuantity: {
                  quantity: discount.customerGets.quantity,
                  effect: {
                    percentage:
                      discount.customerGets.discountValue.percentage.amount,
                    discountAmount: null,
                  },
                },
                discountAmount: null,
                percentage: null,
              },
            },
          });
        } else if (discount.customerGets.discountValue.amountOff.choose) {
          return this.discountAutomaticService.createDiscountAutomaticBxGy({
            usePerOrderLimit: discount.usesPerOrder.amount,
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: discount.startDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            discountCustomerBuys: {
              item: {
                products: {
                  productsToAdd: discountCustomerBuys,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                quantity: discount.minimumRequirement.amount,
                amount: null,
              },
            },
            discountCustomerGets: {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              item: {
                products: {
                  productsToAdd: discountCustomerGets,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                discountOnQuantity: {
                  quantity: discount.customerGets.quantity,
                  effect: {
                    percentage: null,
                    discountAmount: {
                      amount:
                        discount.customerGets.discountValue.amountOff.amount,
                      appliesOnEachItem: true,
                    },
                  },
                },
                discountAmount: null,
                percentage: null,
              },
            },
          });
        }
      }
    } else {
      if (discount.minimumRequirement.quantity) {
        if (discount.customerGets.discountValue.percentage.choose) {
          return this.discountCodeService.createDiscountCodeBxGy({
            usePerOrderLimit: discount.maxUses.useInTotal.amount,
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: formattedStartDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            discountCustomerBuys: {
              item: {
                products: {
                  productsToAdd: discountCustomerBuys,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                quantity: discount.minimumRequirement.amount,
                amount: null,
              },
            },
            discountCustomerGets: {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              item: {
                products: {
                  productsToAdd: discountCustomerGets,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                discountOnQuantity: {
                  quantity: discount.customerGets.quantity,
                  effect: {
                    percentage:
                      discount.customerGets.discountValue.percentage.amount,
                    discountAmount: null,
                  },
                },
                discountAmount: null,
                percentage: null,
              },
            },
          });
        } else if (discount.customerGets.discountValue.amountOff.choose) {
          return this.discountCodeService.createDiscountCodeBxGy({
            usePerOrderLimit: discount.usesPerOrder.amount,
            basicDetail: {
              combinesWith: {
                orderDiscounts: discount.combinations.order,
                productDiscounts: discount.combinations.product,
                shippingDiscounts: discount.combinations.shipping,
              },
              appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
              code: discount.title,
              title: discount.title,
              usageLimit: null,
              startsAt: discount.startDate,
              endsAt: discount.endDate.date,
              usePerOrderLimit: discount.usesPerOrder.amount,
            },
            discountCustomerBuys: {
              item: {
                products: {
                  productsToAdd: discountCustomerBuys,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                quantity: discount.minimumRequirement.amount,
                amount: null,
              },
            },
            discountCustomerGets: {
              appliesOnOneTimePurchase: true,
              appliesOnSubscription: false,
              item: {
                products: {
                  productsToAdd: discountCustomerGets,
                  productsToRemove: [],
                  productVariantsToRemove: [],
                  productVariantsToAdd: [],
                },
                all: false,
                collections: null,
              },
              value: {
                discountOnQuantity: {
                  quantity: discount.customerGets.quantity,
                  effect: {
                    percentage: null,
                    discountAmount: {
                      amount:
                        discount.customerGets.discountValue.amountOff.amount,
                      appliesOnEachItem: true,
                    },
                  },
                },
                discountAmount: null,
                percentage: null,
              },
            },
          });
        }
      }
    }
  }
  @Post('/createBasic')
  async handleCreateBasic(@Body() discount: any) {
    const { year, month, day, hour, minute, second, millisecond } =
      discount.startDate.date;

    // Format the date string
    const formattedStartDate = `${year}-${(month < 10 ? '0' : '') + month}-${(day < 10 ? '0' : '') + day}T${(hour < 10 ? '0' : '') + hour}:${(minute < 10 ? '0' : '') + minute}:${(second < 10 ? '0' : '') + second}.${('00' + millisecond).slice(-3)}Z`;
    if (discount.id == 'automatic') {
      // if (discount.discountValue.percentage.choose) {
      //   return this.discountAutomaticService.createDiscountAutomaticBasic({
      //     basicDetail: {
      //       combinesWith: {
      //         orderDiscounts: discount.combinations.order,
      //         productDiscounts: discount.combinations.product,
      //         shippingDiscounts: discount.combinations.shipping,
      //       },
      //       appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
      //       code: discount.title,
      //       title: discount.title,
      //       usageLimit: null,
      //       startsAt: formattedStartDate,
      //       endsAt: discount.endDate.date,
      //       usePerOrderLimit: discount.usesPerOrder.amount,
      //     },
      //     discountCustomerGets: {
      //       appliesOnOneTimePurchase: discount.purchaseType.oneTimePurchase,
      //       appliesOnSubscription: discount.purchaseType.subscription,
      //       item: {
      //         products: null,
      //         all: true,
      //         collections: null,
      //       },
      //       value: {
      //         percentage: discount.discountValue.percentage.amount,
      //         discountAmount: null,
      //         discountOnQuantity: null,
      //       },
      //     },
      //     recurringCycleLimit: 0,
      //   });
      // }
    } else {
      if (discount.discountValue.percentage.choose) {
        return this.discountCodeService.createDiscountCodeBasic({
          basicDetail: {
            combinesWith: {
              orderDiscounts: discount.combinations.order,
              productDiscounts: discount.combinations.product,
              shippingDiscounts: discount.combinations.shipping,
            },
            appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
            code: discount.title,
            title: discount.title,
            usageLimit: null,
            startsAt: formattedStartDate,
            endsAt: discount.endDate.date,
            usePerOrderLimit: discount.usesPerOrder.amount,
          },
          discountCustomerGets: {
            appliesOnOneTimePurchase: discount.purchaseType.oneTimePurchase,
            appliesOnSubscription: discount.purchaseType.subscription,
            item: {
              products: null,
              all: true,
              collections: null,
            },
            value: {
              percentage:
                parseFloat(discount.discountValue.percentage.amount) / 100,
              discountAmount: null,
              discountOnQuantity: null,
            },
          },
          recurringCycleLimit: 0,
        });
      } else {
        return this.discountCodeService.createDiscountCodeBasic({
          basicDetail: {
            combinesWith: {
              orderDiscounts: discount.combinations.order,
              productDiscounts: discount.combinations.product,
              shippingDiscounts: discount.combinations.shipping,
            },
            appliesOncePerCustomer: discount.maxUses.usePerCustomer.choose,
            code: discount.title,
            title: discount.title,
            usageLimit: null,
            startsAt: formattedStartDate,
            endsAt: discount.endDate.date,
            usePerOrderLimit: discount.usesPerOrder.amount,
          },
          discountCustomerGets: {
            appliesOnOneTimePurchase: discount.purchaseType.oneTimePurchase,
            appliesOnSubscription: discount.purchaseType.subscription,
            item: {
              products: null,
              all: true,
              collections: null,
            },
            value: {
              percentage: null,
              discountAmount: {
                appliesOnEachItem: true,
                amount: discount.discountValue.fixedAmount.amount,
              },
              discountOnQuantity: null,
            },
          },
          recurringCycleLimit: 0,
        });
      }
    }
  }
}
