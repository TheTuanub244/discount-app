export const createDiscountAutomaticFreeShipping = `mutation M($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
    discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticFreeShipping {
            summary
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;
export const CREATEDISCOUNTAUTOMATICBXGY = `
mutation discountAutomaticBxgyCreate($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) {
  discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) {
    automaticDiscountNode {
      id
      automaticDiscount {
        ... on DiscountAutomaticBxgy {
          summary
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;
export const CREATEDISCOUNTAUTOMATICBASIC = `
mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode {
      id
      automaticDiscount {
        ... on DiscountAutomaticBasic {
          summary
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
export const DEACTIVEAUTOMATICDISCOUNTS = `mutation discountAutomaticDeactivate($id: ID!) {
  discountAutomaticDeactivate(id: $id) {
    automaticDiscountNode {
      automaticDiscount {
        ... on DiscountAutomaticBxgy {
          status
          startsAt
          endsAt
        }
        ... on DiscountAutomaticFreeShipping{
          status
          startsAt
          endsAt
        }
        ... on DiscountAutomaticBasic{
          status
          startsAt
          endsAt
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
export const ACTIVEAUTOMATICDISCOUNTS = `mutation discountAutomaticActivate($id: ID!) {
  discountAutomaticActivate(id: $id) {
    automaticDiscountNode {
      automaticDiscount {
        ... on DiscountAutomaticBxgy {
          status
          startsAt
          endsAt
        }
        ... on DiscountAutomaticFreeShipping{
          status
          startsAt
          endsAt
        }
        ... on DiscountAutomaticBasic{
          status
          startsAt
          endsAt
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
export const DELETEDISCOUNTS = `
mutation discountAutomaticDelete($id: ID!) {
  discountAutomaticDelete(id: $id) {
    deletedAutomaticDiscountId
    userErrors {
      field
      code
      message
    }
  }
}`;
