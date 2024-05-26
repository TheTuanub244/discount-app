export const getAllDiscountAPI = `query {
  discountNodes(first: 3) {
    edges {
      node {
        id
        discount {
          ... on DiscountCodeBasic {
            title
            status
            discountClass
            
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountCodeBxgy {
            title
            status
            discountClass

            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountCodeFreeShipping {
            title
            status
            discountClass
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountAutomaticApp {
            title
            status
            discountClass
      
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountAutomaticBasic {
            title
            status
            discountClass
            
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountAutomaticBxgy {
            title
            status
            discountClass
            
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
          ... on DiscountAutomaticFreeShipping {
            title
            status
            discountClass
            
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
        }
      }
    }
  }
}`;
