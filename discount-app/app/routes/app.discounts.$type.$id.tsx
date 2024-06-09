import {
  Tabs,
  Tab,
  Input,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
  Button,
  Divider,
  Checkbox,
  CheckboxGroup,
  ButtonGroup,
  useDisclosure,
  Avatar,
} from "@nextui-org/react";
import { now, getLocalTimeZone } from "@internationalized/date";

import "../styles/main.css";
import Calendar from "../Components/Calendar/Calendar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "stream/consumers";
import { useLoaderData } from "@remix-run/react";
import { getAllDiscount } from "~/api/DiscountAPI";
import { useEffect, useMemo, useReducer, useState } from "react";
import { getAllProduct, getProductById } from "~/api/ProductAPI";
import ProductModal from "~/Components/ProductModal/ProductModal";
export async function loader({ params }: LoaderFunctionArgs) {
  const mergeString = `gid://shopify/${params.type}/${params.id}`;
  const discounts = await getAllDiscount();
  const data = await getAllProduct();

  const findDiscount = discounts.find(
    (discount: any) => discount.basicDetail.id == mergeString,
  );
  const discountCustomerGet = [];
  const discountCustomerBuy = [];

  await Promise.all(
    findDiscount.discountCustomerGets.item.products.productsToAdd.map(
      async (product: any) => {
        const getProduct = await getProductById(product);

        discountCustomerGet.push(getProduct.data);
      },
    ),
  );
  await Promise.all(
    findDiscount.discountCustomerBuys.item.products.productsToAdd.map(
      async (product: any) => {
        const getProduct = await getProductById(product);
        console.log(getProduct.data.product.compareAtPriceRange);

        discountCustomerBuy.push(getProduct.data);
      },
    ),
  );
  return {
    discount: findDiscount,
    discountCustomerGets: discountCustomerGet,
    discountCustomerBuys: discountCustomerBuy,
    products: data,
  };
}
export default function EditPage() {
  const { discount, discountCustomerGets, discountCustomerBuys, products } =
    useLoaderData<typeof loader>();
  console.log(discount);

  const [productCustomerSpends, setProductCustomerSpends] = useState([]);
  const [productCustomerGets, setProductCustomerGets] = useState([]);
  const {
    isOpen: isProductCustomerGetsModalOpen,
    onOpen: onProductCustomerGetsModalOpen,
    onOpenChange: onProductCustomerGetsModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isProductCustomerSpendsModalOpen,
    onOpen: onProductCustomerSpendsModalOpen,
    onOpenChange: onProductCustomerSpendsModalOpenChange,
  } = useDisclosure();
  const initialState = {
    title: discount.basicDetail.title,
    minimumRequirement: {
      subtotal: {
        choose: true,
      },
      quantity: {
        choose: false,
      },
      amount: 0,
      products: [],
    },
    customerGets: {
      quantity: discount.discountCustomerGets.value.discountOnQuantity.quantity,
      discountValue: {
        percentage: {
          choose: true,
          amount:
            discount.discountCustomerGets.value.discountOnQuantity.effect
              .percentage,
        },
        amountOff: {
          choose: false,
          amount: 0,
        },
        free: {
          choose: false,
        },
      },
      products: discount.discountCustomerGets.item.products.productsToAdd,
    },
    purchaseType: {
      oneTimePurchase: discount.discountCustomerGets.appliesOnOnetimePurchase,
      subscription: discount.discountCustomerGets.appliesOnSubscription,
      both: false,
    },
    discountValue: {
      percentage: {
        choose: true,
        amount:
          discount.discountCustomerGets.value.discountOnQuantity.effect
            .percentage,
      },
      fixedAmount: {
        choose: true,
        amount: 0,
      },
    },
    shippingMinimumRequirement: {
      subtotal: {
        choose: false,
        amount: 0,
      },
      quantity: {
        choose: false,
        amount: 0,
      },
    },
    maxUses: {
      useInTotal: {
        choose: false,
        amount: 0,
      },
      usePerCustomer: {
        choose: false,
      },
    },
    usesPerOrder: {
      choose: true,
      amount: discount.basicDetail.usePerOrderLimit,
    },
    combinations: {
      product: discount.basicDetail.combinesWith.productDiscounts,
      order: discount.basicDetail.combinesWith.orderDiscounts,
      shipping: discount.basicDetail.combinesWith.shippingDiscounts,
    },
    subscription: {
      firstPay: false,
      multiplePay: false,
      amount: 0,
    },
    startDate: {
      date: now(getLocalTimeZone()),
    },
    endDate: {
      choose: false,
      date: "",
    },
  };
  const reducer = (state: any, action: any) => {
    switch (action.type) {
      case "title":
        return { ...state, title: action.payload };
      case "id":
        return { ...state, id: action.payload };
      case "discountValue":
        console.log(action);

        if (action.subType == "fixedAmount") {
          if (action.payload) {
            return {
              ...state,

              discountValue: {
                percentage: {
                  choose: false,
                  amount: 0,
                },
                fixedAmount: {
                  choose: true,
                  amount: action.payload,
                },
              },
            };
          } else {
            return {
              ...state,

              discountValue: {
                percentage: {
                  choose: false,
                  amount: 0,
                },
                fixedAmount: {
                  choose: true,
                  amount: 0,
                },
              },
            };
          }
        } else {
          if (action.payload) {
            return {
              ...state,

              discountValue: {
                percentage: {
                  choose: true,
                  amount: action.payload,
                },
                fixedAmount: {
                  choose: false,
                  amount: 0,
                },
              },
            };
          } else {
            return {
              ...state,

              discountValue: {
                percentage: {
                  choose: true,
                  amount: 0,
                },
                fixedAmount: {
                  choose: false,
                  amount: 0,
                },
              },
            };
          }
        }
      case "minimumRequirement":
        if (action.subtype == "products") {
          return {
            ...state,
            minimumRequirement: {
              ...state.minimumRequirement,
              products: productCustomerSpends,
            },
          };
        }
        if (action.subType == "subtotal") {
          return {
            ...state,
            minimumRequirement: {
              ...state.minimumRequirement,
              subtotal: {
                ...state.minimumRequirement.subtotal,
                choose: true,
              },
              quantity: {
                ...state.minimumRequirement.quantity,
                choose: false,
              },
            },
          };
        } else if (action.subType == "quantity") {
          return {
            ...state,
            minimumRequirement: {
              ...state.minimumRequirement,
              subtotal: {
                ...state.minimumRequirement.subtotal,
                choose: false,
              },
              quantity: {
                ...state.minimumRequirement.quantity,
                choose: true,
              },
            },
          };
        } else {
          return {
            ...state,
            minimumRequirement: {
              ...state.minimumRequirement,
              amount: action.payload,
            },
          };
        }
      case "customerGets":
        if (action.subType == "quantity") {
          return {
            ...state,
            customerGets: {
              ...state.customerGets,
              quantity: action.payload,
            },
          };
        }
        if (action.subType == "percentage") {
          return {
            ...state,
            customerGets: {
              ...state.customerGets,
              discountValue: {
                percentage: {
                  choose: true,
                  amount: action.payload,
                },
                amountOff: {
                  choose: false,
                  amount: 0,
                },
                free: {
                  choose: false,
                },
              },
            },
          };
        }
        if (action.subType == "amountOff") {
          return {
            ...state,
            customerGets: {
              ...state.customerGets,
              discountValue: {
                percentage: {
                  choose: false,
                  amount: 0,
                },
                amountOff: {
                  choose: true,
                  amount: action.payload,
                },
                free: {
                  choose: false,
                },
              },
            },
          };
        } else if (action.subType == "free") {
          return {
            ...state,
            customerGets: {
              ...state.customerGets,
              discountValue: {
                percentage: {
                  choose: false,
                  amount: 0,
                },
                amountOff: {
                  choose: false,
                  amount: 0,
                },
                free: {
                  choose: true,
                },
              },
            },
          };
        }
        if (action.subtype == "products") {
          return {
            ...state,
            customerGets: {
              ...state.customerGets,
              products: productCustomerGets,
            },
          };
        }
      case "endDate":
        if (action.subType == "choose") {
          return {
            ...state,
            endDate: {
              ...state.endDate,
              choose: action.payload,
            },
          };
        }
      case "shippingMinimumRequirement":
        if (action.subtype == "no") {
          return {
            ...state,
            shippingMinimumRequirement: {
              subtotal: {
                ...state.shippingMinimumRequirement.subtotal,
                choose: false,
              },
              quantity: {
                ...state.shippingMinimumRequirement.quantity,
                choose: false,
              },
            },
          };
        } else if (action.subtype == "subtotal") {
          return {
            ...state,
            shippingMinimumRequirement: {
              subtotal: {
                amount: action.payload,
                choose: true,
              },
              quantity: {
                ...state.shippingMinimumRequirement.quantity,
                choose: false,
              },
            },
          };
        } else {
          return {
            ...state,
            shippingMinimumRequirement: {
              subtotal: {
                ...state.shippingMinimumRequirement.subtotal,
                choose: false,
              },
              quantity: {
                amount: action.payload,
                choose: true,
              },
            },
          };
        }
      case "usesPerOrder":
        if (action.subType == "choose") {
          return {
            ...state,
            usesPerOrder: {
              ...state.usesPerOrder,
              choose: action.payload,
            },
          };
        }
        if (action.subType == "amount") {
          return {
            ...state,
            usesPerOrder: {
              ...state.usesPerOrder,
              amount: action.payload,
            },
          };
        }
      case "purchaseType":
        console.log(action.payload);
        if (action.payload == "oneTime") {
          return {
            ...state,
            purchaseType: {
              oneTimePurchase: true,
              subscription: false,
              both: false,
            },
          };
        } else if (action.payload == "subscription") {
          return {
            ...state,
            purchaseType: {
              oneTimePurchase: false,
              subscription: true,
              both: false,
            },
          };
        } else {
          return {
            ...state,
            purchaseType: {
              oneTimePurchase: false,
              subscription: false,
              both: true,
            },
          };
        }
        break;
      case "maxUses":
        if (action.subType == "useInTotal") {
          return {
            ...state,
            maxUses: {
              ...state.maxUses,
              useInTotal: {
                ...state.maxUses.useInTotal,
                choose: action.payload,
              },
            },
          };
        } else if (action.subType == "usePerCustomer") {
          return {
            ...state,
            maxUses: {
              ...state.maxUses,
              usePerCustomer: {
                ...state.maxUses.usePerCustomer,
                choose: action.payload,
              },
            },
          };
        } else {
          return {
            ...state,
            maxUses: {
              ...state.maxUses,
              useInTotal: {
                ...state.maxUses.useInTotal,
                amount: action.payload,
              },
            },
          };
        }
      case "subscription":
        if (action.subtype == "firstPay") {
          return {
            ...state,
            subscription: {
              firstPay: true,
              multiplePay: false,
            },
          };
        } else if (action.subtype == "multiplePay") {
          return {
            ...state,
            subscription: {
              firstPay: false,
              multiplePay: true,
              amount: action.payload,
            },
          };
        } else if (action.subtype == "all") {
          return {
            ...state,
            subscription: {
              firstPay: true,
              multiplePay: true,
            },
          };
        }
      case "combinations":
        const check = {
          product: false,
          order: false,
          shipping: false,
        };
        action.payload.map((value: string) => {
          if (value == "1") {
            check.product = true;
          } else if (value == "2") {
            check.order = true;
          } else if (value == "3") {
            check.shipping = true;
          }
        });
        return {
          ...state,
          combinations: {
            product: check.product,
            order: check.order,
            shipping: check.shipping,
          },
        };
      case "startDate":
        return {
          ...state,
          startDate: {
            date: action.payload,
          },
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const renderSelectedProductCustomerSpends = useMemo(() => {
    return (
      <div>
        {productCustomerSpends.length != 0 ? (
          <div className="mt-10 border p-2 rounded-md">
            {productCustomerSpends?.map((value: any) => (
              <div className="flex gap-1 mb-2" key={value.id}>
                <Avatar src={value.featuredImage.url} className="mt-2" />
                <div className="flex flex-col">
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    {value.title}
                  </span>
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    đ{value.compareAtPriceRange.maxVariantCompareAtPrice.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 border p-2 rounded-md">
            {discountCustomerBuys?.map((value: any) => {
              return (
                <div className="flex gap-1 mb-2" key={value.product.id}>
                  <Avatar
                    src={value.product.featuredImage.url}
                    className="mt-2"
                  />
                  <div className="flex flex-col">
                    <span className="ml-10 mt-2 font-xl font-semibold">
                      {value.product.title}
                    </span>
                    <span className="ml-10 mt-2 font-xl font-semibold">
                      đ
                      {
                        value.product.compareAtPriceRange
                          .maxVariantCompareAtPrice.amount
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }, [productCustomerSpends]);
  const renderMaxUsesInput = useMemo(() => {
    return (
      <div>
        {state.maxUses.useInTotal.choose && (
          <Input
            variant="bordered"
            className="w-20 mt-2 ml-5"
            onChange={(e) =>
              dispatch({
                type: "maxUses",
                subType: "amount",
                payload: e.target.value,
              })
            }
          />
        )}
      </div>
    );
  }, [state]);
  const renderSelectedProductCustomerGets = useMemo(() => {
    return (
      <div>
        {productCustomerGets.length != 0 ? (
          <div className="mt-10 border p-2 rounded-md">
            {productCustomerGets?.map((value: any) => (
              <div className="flex gap-1 mb-2" key={value.id}>
                <Avatar src={value.featuredImage.url} className="mt-2" />
                <div className="flex flex-col">
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    {value.title}
                  </span>
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    đ{value.compareAtPriceRange.maxVariantCompareAtPrice.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 border p-2 rounded-md">
            {discountCustomerGets?.map((value: any) => (
              <div className="flex gap-1 mb-2" key={value.product.id}>
                <Avatar
                  src={value.product.featuredImage.url}
                  className="mt-2"
                />
                <div className="flex flex-col">
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    {value.product.title}
                  </span>
                  <span className="ml-10 mt-2 font-xl font-semibold">
                    đ
                    {
                      value.product.compareAtPriceRange.maxVariantCompareAtPrice
                        .amount
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [productCustomerGets]);
  useEffect(() => {
    console.log(state);
  }, [state]);
  const renderRadioDiscountValue = useMemo(() => {
    return (
      <RadioGroup
        color="primary"
        style={{
          marginTop: 14,
          width: 300,
        }}
        defaultValue={
          discount.discountCustomerGets.value.discountOnQuantity.effect
            .percentage
            ? "percentage"
            : "amountOff"
        }
        onValueChange={(value) => {
          dispatch({ type: "customerGets", subType: value });
        }}
      >
        <Radio value="percentage">Percentage</Radio>
        {state.customerGets.discountValue.percentage.choose && (
          <Input
            onChange={(e) =>
              dispatch({
                type: "customerGets",
                subType: "percentage",
                payload: e.target.value,
              })
            }
            placeholder={
              discount.discountCustomerGets.value.discountOnQuantity.effect
                .percentage &&
              discount.discountCustomerGets.value.discountOnQuantity.effect
                .percentage * 100
            }
            className="w-1/2 ml-5"
            type="number"
            variant="bordered"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">%</span>
              </div>
            }
          />
        )}
        <Radio value="amountOff">Amount off each</Radio>
        {state.customerGets.discountValue.amountOff.choose && (
          <Input
            onChange={(e) =>
              dispatch({
                type: "customerGets",
                subType: "amountOff",
                payload: e.target.value,
              })
            }
            placeholder={
              discount.discountCustomerGets.value.discountOnQuantity.effect
                .discountAmount &&
              discount.discountCustomerGets.value.discountOnQuantity.effect
                .discountAmount.amount
            }
            className="w-1/2 ml-5"
            type="number"
            variant="bordered"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₫</span>
              </div>
            }
          />
        )}
        <Radio value="free">Free</Radio>
      </RadioGroup>
    );
  }, [state]);
  const renderMaxUses = useMemo(() => {
    return (
      <div
        style={{
          marginLeft: 20,
        }}
      >
        {discount.basicDetail.usePerOrderLimit && (
          <Input
            onChange={(e) =>
              dispatch({
                type: "usesPerOrder",
                subType: "amount",
                payload: e.target.value,
              })
            }
            placeholder={discount.basicDetail.usePerOrderLimit}
            type="number"
            variant="bordered"
            className="w-20"
          />
        )}
      </div>
    );
  }, [state]);
  const renderDiscountName = useMemo(() => {
    return (
      <div className="flex gap-1 mt-2">
        <h1 className="font-bold" style={{ fontSize: 15 }}>
          {discount.basicDetail.title}
        </h1>
        <h1 style={{ fontSize: 15 }}>can be combined with: </h1>
      </div>
    );
  }, [state]);
  return (
    <div className="flex flex-row justify-between background">
      <div className="w-1/2">
        <p className="text-3xl ml-40 text-bold capitalize font-semibold ">
          Create new discount
        </p>
        <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
          <div className="flex justify-between">
            {
              <h1
                className="font-semibold"
                style={{
                  fontSize: 18,
                }}
              >
                Buy X get Y
              </h1>
            }
            {
              <h1
                style={{
                  fontSize: 14,
                }}
              >
                Product Discount
              </h1>
            }
          </div>
          <label
            style={{
              marginTop: 10,
            }}
          >
            Method
          </label>
          <div
            className="flex flex-col"
            style={{
              marginTop: 10,
            }}
          >
            <h1
              style={{
                marginTop: 10,
                marginBottom: 10,
              }}
              className="text-2xl"
            >
              Title
            </h1>
            <Input
              variant="bordered"
              placeholder={discount.basicDetail.title}
            />
            <p
              style={{
                marginTop: 10,
              }}
            >
              Customers must enter this code at checkout.
            </p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
            }}
          >
            Customer spends
          </h1>
          <h1
            className="font-semibold"
            style={{
              fontSize: 16,
              marginTop: 10,
            }}
          >
            Purchase type
          </h1>
          <p>
            Buy X get Y discounts are only supported with one-time purchases.
          </p>
          <RadioGroup
            defaultValue={
              discount.discountCustomerBuys.value.amount != null
                ? "subtotal"
                : "quantity"
            }
            onValueChange={(value) => {
              if (value == "subtotal") {
                dispatch({ type: "minimumRequirement", subType: "subtotal" });
              } else {
                dispatch({ type: "minimumRequirement", subType: "quantity" });
              }
            }}
            style={{
              marginTop: 18,
            }}
          >
            <Radio value="quantity">Minimum quantity of items</Radio>
            <Radio value="subtotal">Minimum purchase amount</Radio>
          </RadioGroup>
          <div className="flex">
            <div
              className="flex flex-col"
              style={{
                marginTop: 18,
              }}
            >
              {discount.discountCustomerBuys.value.amount ? (
                <>
                  <h1>Amount</h1>
                  <Input
                    variant="bordered"
                    className="w-22"
                    placeholder={discount.discountCustomerBuys.value.amount}
                    onChange={(e) =>
                      dispatch({
                        type: "minimumRequirement",
                        payload: e.target.value,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <h1>Quantity</h1>
                  <Input
                    variant="bordered"
                    className="w-22"
                    placeholder={discount.discountCustomerBuys.value.quantity}
                    onChange={(e) =>
                      dispatch({
                        type: "minimumRequirement",
                        payload: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>
            <div
              className="flex flex-col w-full ml-10"
              style={{
                marginTop: 18,
              }}
            >
              <h1>Any items from</h1>
              <Select
                color="primary"
                className="w-full"
                placeholder="Specific products"
              ></Select>
            </div>
          </div>
          <div
            className="flex"
            style={{
              marginTop: 18,
            }}
          >
            <Input variant="bordered" placeholder="Search products" />
            <Button
              color="danger"
              className="ml-5"
              onClick={onProductCustomerSpendsModalOpen}
            >
              Browse
            </Button>
          </div>
          {renderSelectedProductCustomerSpends}
        </div>
        <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
          <h1
            className="font-semibold text-xl"
            style={{
              fontSize: 18,
            }}
          >
            Customer gets
          </h1>
          <p
            style={{
              marginTop: 10,
            }}
          >
            Customers must add the quantity of items specified below to their
            cart.
          </p>
          <div className="flex">
            <div
              className="flex flex-col"
              style={{
                marginTop: 18,
              }}
            >
              <h1>Quantity</h1>
              <Input
                variant="bordered"
                className="w-22"
                placeholder={
                  discount.discountCustomerGets.value.discountOnQuantity
                    .quantity
                }
                onChange={(e) =>
                  dispatch({
                    type: "customerGets",
                    subType: "quantity",
                    payload: e.target.value,
                  })
                }
              />
            </div>
            <div
              className="flex flex-col w-full ml-10"
              style={{
                marginTop: 18,
              }}
            >
              <h1>Any items from</h1>
              <Select
                color="primary"
                className="w-full"
                placeholder="Specific products"
              ></Select>
            </div>
          </div>
          <div
            className="flex"
            style={{
              marginTop: 18,
            }}
          >
            <Input variant="bordered" placeholder="Search products" />
            <Button
              color="danger"
              className="ml-5"
              onClick={() => {
                onProductCustomerGetsModalOpen();
              }}
            >
              Browse
            </Button>
          </div>
          {renderSelectedProductCustomerGets}

          <div
            className="flex flex-col gap-1"
            style={{
              marginTop: 18,
            }}
          >
            <h1
              className="font-semibold"
              style={{
                fontSize: 16,
              }}
            >
              At a discounted value
            </h1>
            {renderRadioDiscountValue}
            <Divider
              style={{
                marginTop: 10,
                marginBottom: 10,
              }}
            />
            <CheckboxGroup
              defaultValue={discount.basicDetail.usePerOrderLimit && "1"}
            >
              <Checkbox
                onChange={(e) =>
                  dispatch({
                    type: "usesPerOrder",
                    subType: "choose",
                    payload: e.target.checked,
                  })
                }
                size="md"
                value={"1"}
              >
                Set a maximum number of uses per order
              </Checkbox>
            </CheckboxGroup>
            {renderMaxUses}
          </div>
        </div>
        <div
          className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col"
          style={{ marginTop: 18 }}
        >
          <h1
            className="font-semibold"
            style={{
              fontSize: 16,
            }}
          >
            Maximum discount uses
          </h1>
          <CheckboxGroup style={{ marginTop: 10 }}>
            <Checkbox
              value={"useInTotal"}
              onChange={(e) => {
                dispatch({
                  type: "maxUses",
                  subType: "useInTotal",
                  payload: e.target.checked,
                });
              }}
            >
              Limit number of times this discount can be used in total
            </Checkbox>
            {renderMaxUsesInput}
            <Checkbox
              value={"usePerCustomer"}
              onChange={(e) =>
                dispatch({
                  type: "maxUses",
                  subType: "usePerCustomer",
                  payload: e.target.checked,
                })
              }
            >
              Limit to one use per customer
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div
          className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col"
          style={{ marginTop: 18 }}
        >
          <h1
            className="font-semibold"
            style={{
              fontSize: 16,
            }}
          >
            Combinations
          </h1>
          {renderDiscountName}
          <CheckboxGroup
            className="mt-2"
            onChange={(value) =>
              dispatch({ type: "combinations", payload: value })
            }
            defaultValue={
              discount.basicDetail.combinesWith.orderDiscounts &&
              discount.basicDetail.combinesWith.productDiscounts &&
              discount.basicDetail.combinesWith.shippingDiscounts
                ? ["1", "2", "3"]
                : !discount.basicDetail.combinesWith.orderDiscounts &&
                    discount.basicDetail.combinesWith.productDiscounts &&
                    discount.basicDetail.combinesWith.shippingDiscounts
                  ? ["2", "3"]
                  : discount.basicDetail.combinesWith.orderDiscounts &&
                      !discount.basicDetail.combinesWith.productDiscounts &&
                      discount.basicDetail.combinesWith.shippingDiscounts
                    ? ["1", "3"]
                    : discount.basicDetail.combinesWith.orderDiscounts &&
                        discount.basicDetail.combinesWith.productDiscounts &&
                        !discount.basicDetail.combinesWith.shippingDiscounts
                      ? ["1", "2"]
                      : discount.basicDetail.combinesWith.orderDiscounts &&
                          !discount.basicDetail.combinesWith.productDiscounts &&
                          !discount.basicDetail.combinesWith.shippingDiscounts
                        ? ["1"]
                        : !discount.basicDetail.combinesWith.orderDiscounts &&
                            discount.basicDetail.combinesWith
                              .productDiscounts &&
                            !discount.basicDetail.combinesWith.shippingDiscounts
                          ? ["2"]
                          : !discount.basicDetail.combinesWith.orderDiscounts &&
                              !discount.basicDetail.combinesWith
                                .productDiscounts &&
                              discount.basicDetail.combinesWith
                                .shippingDiscounts
                            ? ["3"]
                            : []
            }
          >
            <Checkbox value={"1"}>Product discounts</Checkbox>
            <Checkbox value={"2"}>Order discounts</Checkbox>
            <Checkbox value={"3"}>Shipping discounts</Checkbox>
          </CheckboxGroup>
        </div>
        <div
          className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col"
          style={{ marginTop: 18 }}
        >
          <h1
            className="font-semibold"
            style={{
              fontSize: 16,
            }}
          >
            Active dates
          </h1>
          <Calendar
            date={state.startDate.date}
            dispatch={dispatch}
            type="startDate"
          />
          <Checkbox
            onChange={(e) => {
              dispatch({
                type: "endDate",
                subType: "choose",
                payload: e.target.checked,
              });
            }}
            style={{
              marginTop: 10,
            }}
          >
            Set end date
          </Checkbox>
          {/* {renderEndDate} */}
        </div>
        <div
          className="flex gap-1 mt-10 "
          style={{
            marginLeft: 800,
          }}
        >
          <ButtonGroup>
            <Button color={"danger"}>Discard</Button>
            <Button
              color="default"
              style={{ color: "white" }}
              // onClick={() => {
              //   handleSaveDiscount();
              // }}
            >
              Save discount
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <ProductModal
        isOpen={isProductCustomerGetsModalOpen}
        onOpenChange={onProductCustomerGetsModalOpenChange}
        products={products}
        setProduct={setProductCustomerGets}
        product={productCustomerGets}
      />
      <ProductModal
        isOpen={isProductCustomerSpendsModalOpen}
        onOpenChange={onProductCustomerSpendsModalOpenChange}
        products={products}
        setProduct={setProductCustomerSpends}
        product={productCustomerSpends}
      />
    </div>
  );
}
