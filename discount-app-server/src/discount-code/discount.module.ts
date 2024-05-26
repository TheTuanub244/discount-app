import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AutomaticDiscountFreeShipping,
  AutomaticDiscountFreeShippingSchema,
} from '../schemas/AutomaticDiscountFreeShipping.schema';
import { BasicDetail, BasicDetailSchema } from '../schemas/BasicDetails.schema';
import {
  CombinesWith,
  CombinesWithSchema,
} from '../schemas/CombinesWith.schema';
import {
  DiscountAutomaticApp,
  DiscountAutomaticAppSchema,
} from '../schemas/DiscountAutomaticApp.schema';
import {
  DiscountAutomaticBasic,
  DiscountAutomaticBasicSchema,
} from '../schemas/DiscountAutomaticBasic.schema';
import {
  DiscountAutomaticBxGy,
  DiscountAutomaticBxGySchema,
} from '../schemas/DiscountAutomaticBxGy.schema';
import {
  DiscountCodeApp,
  DiscountCodeAppSchema,
} from '../schemas/DiscountCodeApp.schema';
import {
  DiscountCodeBxGy,
  DiscountCodeBxGySchema,
} from '../schemas/DiscountCodeBxGy.schema';
import {
  DiscountCodeFreeShipping,
  DiscountCodeFreeShippingSchema,
} from '../schemas/DiscountCodeFreeShipping.schema';
import {
  DiscountCustomerBuys,
  DiscountCustomerBuysSchema,
} from '../schemas/DiscountCustomerBuys.schema';
import {
  DiscountCustomerBuysValue,
  DiscountCustomerBuysValueSchema,
} from '../schemas/DiscountCustomerBuysValue.schema';
import {
  DiscountCustomerGets,
  DiscountCustomerGetsSchema,
} from '../schemas/DiscountCustomerGets.schema';
import {
  DiscountItems,
  DiscountItemsSchema,
} from '../schemas/DiscountItems.schema';
import {
  DiscountMinimumRequirement,
  DiscountMinimumRequirementSchema,
} from '../schemas/DiscountMinimumRequirement.schema';
import {
  DiscountShippingDestinationSelection,
  DiscountShippingDestinationSelectionSchema,
} from '../schemas/DiscountShippingDestinationSelection.schema';
import {
  DiscountCodeBasic,
  DiscountCodeBasicSchema,
} from '../schemas/DiscountCodeBasic.schema';
import { Metafield, MetafieldSchema } from '../schemas/Metafield.schema';
import { DiscountController } from './discount.controller';
import { DiscountCodeService } from './discount-code.service';
import { DiscountBasicService } from './discountBasic.service';
import { DiscountAutomaticService } from './discount-automatic.service';
import {
  DiscountEffect,
  DiscountEffectSchema,
} from '../schemas/DiscountEffect.schema';
import {
  DiscountOnQuantity,
  DiscountOnQuantitySchema,
} from '../schemas/DiscountOnQuantity.schema';
import {
  DiscountCustomerGetsValue,
  DiscountCustomerGetsValueSchema,
} from '../schemas/DiscountCustomerGetsValue.schema';
import {
  DiscountAmount,
  DiscountAmountSchema,
} from '../schemas/DiscountAmount.schema';
import {
  DiscountCollectionsInput,
  DiscountCollectionsInputSchema,
} from '../schemas/DiscountCollectionsInput.schema';
import {
  DiscountProductsInput,
  DiscountProductsInputSchema,
} from '../schemas/DiscountProducsInput.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Metafield.name,
        schema: MetafieldSchema,
      },
      {
        name: DiscountShippingDestinationSelection.name,
        schema: DiscountShippingDestinationSelectionSchema,
      },
      {
        name: DiscountMinimumRequirement.name,
        schema: DiscountMinimumRequirementSchema,
      },
      {
        name: DiscountItems.name,
        schema: DiscountItemsSchema,
      },
      {
        name: DiscountCustomerGets.name,
        schema: DiscountCustomerGetsSchema,
      },
      {
        name: DiscountCustomerBuysValue.name,
        schema: DiscountCustomerBuysValueSchema,
      },
      {
        name: DiscountCustomerBuys.name,
        schema: DiscountCustomerBuysSchema,
      },
      {
        name: DiscountCodeFreeShipping.name,
        schema: DiscountCodeFreeShippingSchema,
      },
      {
        name: DiscountCodeBxGy.name,
        schema: DiscountCodeBxGySchema,
      },
      {
        name: DiscountCodeApp.name,
        schema: DiscountCodeAppSchema,
      },
      {
        name: DiscountAutomaticBxGy.name,
        schema: DiscountAutomaticBxGySchema,
      },
      {
        name: DiscountAutomaticBasic.name,
        schema: DiscountAutomaticBasicSchema,
      },
      {
        name: DiscountAutomaticApp.name,
        schema: DiscountAutomaticAppSchema,
      },
      {
        name: CombinesWith.name,
        schema: CombinesWithSchema,
      },
      {
        name: BasicDetail.name,
        schema: BasicDetailSchema,
      },
      {
        name: AutomaticDiscountFreeShipping.name,
        schema: AutomaticDiscountFreeShippingSchema,
      },
      {
        name: DiscountCodeBasic.name,
        schema: DiscountCodeBasicSchema,
      },
      {
        name: DiscountEffect.name,
        schema: DiscountEffectSchema,
      },
      {
        name: DiscountOnQuantity.name,
        schema: DiscountOnQuantitySchema,
      },
      {
        name: DiscountCustomerGetsValue.name,
        schema: DiscountCustomerGetsValueSchema,
      },
      {
        name: DiscountAmount.name,
        schema: DiscountAmountSchema,
      },
      {
        name: DiscountCollectionsInput.name,
        schema: DiscountCollectionsInputSchema,
      },
      {
        name: DiscountProductsInput.name,
        schema: DiscountProductsInputSchema,
      },
    ]),
  ],
  providers: [
    DiscountCodeService,
    DiscountBasicService,
    DiscountAutomaticService,
  ],
  controllers: [DiscountController],
})
export class DiscountModule {}
