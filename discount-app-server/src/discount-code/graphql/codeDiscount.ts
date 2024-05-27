export const createDiscountCodeFreeShipping = `mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
  discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeFreeShipping {
          summary
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}`;
export const createDiscountCodeBasic = `mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          codes(first: 10) {
            nodes {
              code
            }
          }
          startsAt
          endsAt
          customerSelection {
            ... on DiscountCustomerAll {
              allCustomers
            }
          }
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
            }
          }
          appliesOncePerCustomer
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}`;
export const CREATEDISCOUNTCODEBUYXGETY = `
mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
  discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBxgy {
          summary
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}


`;
export const ACTIVEDISCOUNTCODE = `mutation discountCodeActivate($id: ID!) {
  discountCodeActivate(id: $id) {
    codeDiscountNode {
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          status
          startsAt
          endsAt
        }
        ... on DiscountCodeBxgy {
          title
          status
          startsAt
          endsAt
        }
        ... on DiscountCodeFreeShipping {
          title
          status
          startsAt
          endsAt
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}`;
