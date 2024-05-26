export const getAllProduct = `
query {
  products(first: 10, reverse: true) {
    edges {
      node {
        id
        title
        handle
        featuredImage {
          id
          url
        }
        compareAtPriceRange{
          maxVariantCompareAtPrice {
            amount
          }
        }
      }
    }
  }
}
`;
