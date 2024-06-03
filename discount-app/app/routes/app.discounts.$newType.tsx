import { useLoaderData, useNavigate } from "@remix-run/react";
import { getParams } from "../utils/UrlUtils";
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
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { now, getLocalTimeZone } from "@internationalized/date";
import "../styles/main.css";
import { useDateFormatter } from "@react-aria/i18n";
import Calendar from "../Components/Calendar/Calendar";
import DiscardModal from "~/Components/DiscardModal/DIscardModal";
import {
  createBuyXgetY,
  createDiscountBasic,
  createFreeShipping,
} from "../api/DiscountAPI";
import { getAllProduct } from "../api/ProductAPI";
import ProductModal from "~/Components/ProductModal/ProductModal";
import { LoaderFunctionArgs } from "@remix-run/node";
export async function loader({ params }: LoaderFunctionArgs) {
  const data = await getAllProduct();
  const type = params.newType;
  const formattedURL = getParams(type);
  if (formattedURL == "BuyXGetY") {
    return {
      params: "Buy X get Y",
      method: "Product discount",
      products: data,
    };
  } else if (formattedURL == "FreeShipping") {
    return {
      params: "Free shipping",
      method: "Shipping discount",
      products: data,
    };
  } else if (formattedURL == "AmountOffOrder") {
    return {
      params: "Amount off order",
      method: "Order discount",
      products: data,
    };
  }
}
export default function CreatePage() {
  const { params, method, products } = useLoaderData<typeof loader>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
  const [valueCustomerGets, setValueCustomerGets] = useState(new Set([]));
  const [valueCustomerSpends, setValueCustomerSpends] = useState(new Set([]));
  const [productCustomerSpends, setProductCustomerSpends] = useState([]);
  const [productCustomerGets, setProductCustomerGets] = useState([]);

  const initialState = {
    title: "",
    id: "automatic",
    discount: params,
    method: method,
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
      quantity: 0,
      discountValue: {
        percentage: {
          choose: true,
          amount: 0,
        },
        amountOff: {
          choose: false,
          amount: 0,
        },
        free: {
          choose: false,
        },
      },
      products: [],
    },
    purchaseType: {
      oneTimePurchase: false,
      subscription: false,
      both: false,
    },
    discountValue: {
      percentage: {
        choose: false,
        amount: 0,
      },
      fixedAmount: {
        choose: false,
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
      choose: false,
      amount: 0,
    },
    combinations: {
      product: false,
      order: false,
      shipping: false,
    },
    startDate: {
      date: now(getLocalTimeZone()),
    },
    endDate: {
      choose: false,
      date: "",
    },
  };
  const [selectedPurchaseType, setSelectedPurchaseType] = useState("1");
  const [selectedMinimumRequirement, setSelectedMinimumRequirement] =
    useState("1");
  const [minimumValue, setMinimumValue] = useState("");
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
  let formatter = useDateFormatter({ dateStyle: "full" });
  const tabs = [
    {
      id: "automatic",
      method: "Automatic discount",
      summary: (
        <div className="flex flex-col w-full">
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
            }}
          >
            Summary
          </h1>
          <h1
            style={{
              fontSize: 15,
              marginTop: 15,
            }}
          >
            {state.title ? state.title : "No title yet"}
          </h1>
          <h1
            className="font-semibold"
            style={{
              marginTop: 15,
              fontSize: 15,
            }}
          >
            Type and method
          </h1>
          <ul
            style={{
              listStyleType: "disc",
              marginLeft: 20,
            }}
          >
            <li style={{ marginTop: 10 }}>{state.discount}</li>
            <li style={{ marginTop: 10 }}>{state.id}</li>
          </ul>
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
              marginTop: 10,
            }}
          >
            Details
          </h1>
          <ul
            style={{
              listStyleType: "disc",
              marginLeft: 20,
            }}
          >
            <li
              style={{
                marginTop: 10,
              }}
            >
              {state.minimumRequirement.subtotal.choose
                ? state.usesPerOrder.choose
                  ? state.customerGets.discountValue.percentage.choose
                    ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.percentage.amount}% off\n ${state.usesPerOrder.amount} uses per order`
                    : state.customerGets.discountValue.amountOff.choose
                      ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.amountOff.amount}d of each item\n ${state.usesPerOrder.amount} uses per order`
                      : state.customerGets.discountValue.free.choose &&
                        `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items free\n ${state.usesPerOrder.amount} uses per order`
                  : state.customerGets.discountValue.percentage.choose
                    ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.percentage.amount}% off`
                    : state.customerGets.discountValue.amountOff.choose
                      ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.amountOff.amount}d of each item`
                      : state.customerGets.discountValue.free.choose &&
                        `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items free`
                : state.usesPerOrder.choose
                  ? state.customerGets.discountValue.percentage.choose
                    ? `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.percentage.amount}% off\n ${state.usesPerOrder.amount} uses per order`
                    : state.customerGets.discountValue.amountOff.choose
                      ? `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.amountOff.amount}d of each item\n ${state.usesPerOrder.amount} uses per order`
                      : state.customerGets.discountValue.free.choose &&
                        `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items free\n ${state.usesPerOrder.amount} uses per order`
                  : state.customerGets.discountValue.percentage.choose
                    ? `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.percentage.amount}% off`
                    : state.customerGets.discountValue.amountOff.choose
                      ? `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.amountOff.amount}d of each item`
                      : state.customerGets.discountValue.free.choose &&
                        `Buy ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items free`}
            </li>
            <li
              style={{
                marginTop: 10,
              }}
            >
              All customers
            </li>
            {state.maxUses.useInTotal.choose &&
              state.maxUses.usePerCustomer.choose && (
                <li>
                  Limit of {state.maxUses.useInTotal.amount} uses, one per
                  customer.
                </li>
              )}
            {!state.maxUses.useInTotal.choose &&
              state.maxUses.usePerCustomer.choose && <li>One per customer.</li>}
            {state.maxUses.useInTotal.choose &&
              !state.maxUses.usePerCustomer.choose && (
                <li>Limit of {state.maxUses.useInTotal.amount} uses</li>
              )}
            {state.combinations.product &&
              !state.combinations.order &&
              !state.combinations.shipping && (
                <li>Combines with product discounts</li>
              )}
            {state.combinations.product &&
              state.combinations.order &&
              !state.combinations.shipping && (
                <li>Combines with product and order discounts</li>
              )}
            {state.combinations.product &&
              state.combinations.order &&
              state.combinations.shipping && (
                <li>Combines with product, order and shipping discounts</li>
              )}
            {!state.combinations.product &&
              state.combinations.order &&
              !state.combinations.shipping && (
                <li>Combines with order discounts</li>
              )}
            {!state.combinations.product &&
              state.combinations.order &&
              state.combinations.shipping && (
                <li>Combines with order and shipping discounts</li>
              )}
            {!state.combinations.product &&
              !state.combinations.order &&
              state.combinations.shipping && (
                <li>Combines with shipping discounts</li>
              )}
            {state.combinations.product &&
              !state.combinations.order &&
              state.combinations.shipping && (
                <li>Combines with product and shipping discounts</li>
              )}
            <li style={{ marginTop: 10 }}>
              Active{" "}
              {formatter.format(
                state.startDate.date.toDate(getLocalTimeZone()),
              )}
            </li>
          </ul>
        </div>
      ),
      TitleInput: (
        <div
          className="flex flex-col"
          style={{
            marginTop: 10,
          }}
        >
          <h1
            className="text-2xl"
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            Title
          </h1>
          <Input
            variant="bordered"
            onChange={(e) => {
              dispatch({ type: "title", payload: e.target.value });
            }}
          />
          <p
            style={{
              marginTop: 10,
            }}
          >
            Customers will see this in their cart and at checkout
          </p>
        </div>
      ),
    },
    {
      id: "code",
      method: "Discount code",
      name: "Buy X Get Y",
      summary: (
        <div className="flex flex-col w-full">
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
            }}
          >
            Summary
          </h1>
          <h1
            style={{
              fontSize: 15,
              marginTop: 15,
            }}
          >
            {state.title ? state.title : "No discount code yet"}
          </h1>
          <h1
            className="font-semibold"
            style={{
              marginTop: 15,
              fontSize: 15,
            }}
          >
            Type and method
          </h1>
          <ul
            style={{
              listStyleType: "disc",
              marginLeft: 20,
            }}
          >
            <li style={{ marginTop: 10 }}>{state.discount}</li>
            <li style={{ marginTop: 10 }}>{state.id}</li>
          </ul>
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
              marginTop: 10,
            }}
          >
            Details
          </h1>
          <ul
            style={{
              listStyleType: "disc",
              marginLeft: 20,
            }}
          >
            <li
              style={{
                marginTop: 10,
              }}
            >
              {state.minimumRequirement.subtotal.choose
                ? state.customerGets.discountValue.percentage.choose
                  ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at`
                  : state.customerGets.discountValue.amountOff.choose
                    ? `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items at ${state.customerGets.discountValue.percentage.quantity} of each item`
                    : state.customerGets.discountValue.free.choose &&
                      `Spend ${state.minimumRequirement.amount} \nGet ${state.customerGets.quantity} items free`
                : `Buy ${state.minimumRequirement.amount} items\n`}
            </li>
          </ul>
        </div>
      ),
      TitleInput: (
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
            Discount code
          </h1>
          <Input
            variant="bordered"
            onChange={(e) => {
              dispatch({ type: "title", payload: e.target.value });
            }}
          />
          <p
            style={{
              marginTop: 10,
            }}
          >
            Customers must enter this code at checkout.
          </p>
        </div>
      ),
    },
  ];

  const renderSelectedProductCustomerSpends = useMemo(() => {
    return (
      <div>
        {productCustomerSpends.length != 0 && (
          <div className="mt-10 border p-2 rounded-md">
            {productCustomerSpends?.map((value) => (
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
        )}
      </div>
    );
  }, [productCustomerSpends]);
  const minimumRequirements = [
    {
      id: "quantity",
      title: "Customer buys",
      render: (
        <div>
          <h1
            className="font-semibold"
            style={{
              fontSize: 18,
            }}
          >
            Customer buys
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
            defaultValue="quantity"
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
              <h1>Quantity</h1>
              <Input
                variant="bordered"
                className="w-22"
                onChange={(e) =>
                  dispatch({
                    type: "minimumRequirement",
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
              onClick={onProductCustomerSpendsModalOpenChange}
            >
              Browse
            </Button>
          </div>
          {renderSelectedProductCustomerSpends}
        </div>
      ),
    },
    {
      id: "subtotal",
      title: "Customer spends",
      render: (
        <div>
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
            defaultValue="subtotal"
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
              <h1>Amount</h1>
              <Input
                variant="bordered"
                className="w-22"
                onChange={(e) =>
                  dispatch({
                    type: "minimumRequirement",
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
              >
                <SelectItem key={1}>asd</SelectItem>
              </Select>
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
      ),
    },
  ];
  const renderMaxUses = useMemo(() => {
    return (
      <div
        style={{
          marginLeft: 20,
        }}
      >
        {state.usesPerOrder.choose && (
          <Input
            onChange={(e) =>
              dispatch({
                type: "usesPerOrder",
                subType: "amount",
                payload: e.target.value,
              })
            }
            type="number"
            variant="bordered"
            className="w-20"
          />
        )}
      </div>
    );
  }, [state]);
  const renderMinimumRequirement = useMemo(() => {
    // eslint-disable-next-line no-lone-blocks
    {
      if (state.minimumRequirement.subtotal.choose) {
        return (
          <div>
            {minimumRequirements.map((value) => {
              if (value.id == "subtotal") {
                return value.render;
              }
            })}
          </div>
        );
      } else {
        return (
          <div>
            {minimumRequirements.map((value) => {
              if (value.id == "quantity") {
                return value.render;
              }
            })}
          </div>
        );
      }
    }
  }, [state, productCustomerSpends]);
  const renderTitle = React.useMemo(() => {
    return (
      <div>
        {tabs.map((tab) => {
          if (tab.id == state.id) {
            return tab.TitleInput;
          }
        })}
      </div>
    );
  }, [state]);
  const renderSummary = useMemo(() => {
    return (
      <div>
        {tabs.map((value) => {
          if (value.id == state.id) {
            return value.summary;
          }
        })}
      </div>
    );
  }, [state]);
  const renderSelectedProductCustomerGets = useMemo(() => {
    return (
      <div>
        {productCustomerGets.length != 0 && (
          <div className="mt-10 border p-2 rounded-md">
            {productCustomerGets?.map((value) => (
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
        )}
      </div>
    );
  }, [productCustomerGets]);

  const renderRadioDiscountValue = useMemo(() => {
    return (
      <RadioGroup
        color="primary"
        style={{
          marginTop: 14,
          width: 300,
        }}
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
  const renderDiscountName = useMemo(() => {
    return (
      <div className="flex gap-1 mt-2">
        <h1 className="font-bold" style={{ fontSize: 15 }}>
          {state.title}
        </h1>
        <h1 style={{ fontSize: 15 }}>can be combined with: </h1>
      </div>
    );
  }, [state]);
  useEffect(() => {
    dispatch({
      type: "customerGets",
      subtype: "products",
      payload: productCustomerGets,
    });
  }, [productCustomerGets]);
  useEffect(() => {
    dispatch({
      type: "minimumRequirement",
      subtype: "products",
      payload: productCustomerSpends,
    });
  }, [productCustomerSpends]);
  const renderEndDate = useMemo(() => {
    return (
      <div>
        {state.endDate.choose && (
          <Calendar
            date={state.startDate.date}
            dispatch={dispatch}
            type="endDate"
          />
        )}
      </div>
    );
  }, [state.endDate]);
  const navigate = useNavigate();

  const handleSaveDiscount = async () => {
    if (params == "Free shipping") {
      const data = await createFreeShipping(state);
    } else if (params == "Buy X get Y") {
      const data = await createBuyXgetY(state);
    } else if (params == "Amount off order") {
      const data = await createDiscountBasic(state);
    }

    // navigate("/app", {
    //   replace: true,
    //   relative: "path",
    //   state: { some: "state" },
    // });
  };
  const renderDiscountValue = useMemo(() => {
    console.log(state);

    return (
      <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
        <span className="font-bold text-xl">Discount Value</span>
        <div className="flex gap-1 mt-2">
          <Select
            className="w-full"
            defaultSelectedKeys={"1"}
            onChange={(e) => {
              if (e.target.value == "1") {
                dispatch({
                  type: "discountValue",
                  subType: "fixedAmount",
                  payload: null,
                });
              } else {
                dispatch({
                  type: "discountValue",
                  subType: "percentage",
                  payload: null,
                });
              }
            }}
          >
            <SelectItem key="1" value={"Fixed amount"}>
              Fixed amount
            </SelectItem>
            <SelectItem key="2" value={"Percentage"}>
              Percentage
            </SelectItem>
          </Select>
          <Input
            variant="bordered"
            className="w-1/4"
            endContent={state.discountValue.percentage.choose ? "%" : "đ"}
            onChange={(e) => {
              if (state.discountValue.percentage.choose) {
                dispatch({
                  type: "discountValue",
                  subType: "percentage",
                  payload: e.target.value,
                });
              } else {
                dispatch({
                  type: "discountValue",
                  subType: "fixedAmount",
                  payload: e.target.value,
                });
              }
            }}
          />
        </div>
        <span className="font-bold text-xl" style={{ marginTop: 18 }}>
          Discount Value
        </span>
        <Select className="w-full mt-2" defaultSelectedKeys={"1"}>
          <SelectItem key="1" value={"oneTime"}>
            One-time purchase
          </SelectItem>
          <SelectItem key="2" value={"subscription"}>
            Subscription
          </SelectItem>
          <SelectItem key="3" value={"both"}>
            Both
          </SelectItem>
        </Select>
      </div>
    );
  }, [state]);
  return (
    <div className="flex flex-row justify-between background">
      <div className="w-1/2 ">
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
                {params}
              </h1>
            }
            {
              <h1
                style={{
                  fontSize: 14,
                }}
              >
                {method}
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
          <Tabs
            style={{
              marginTop: 10,
            }}
            onSelectionChange={(value) => {
              dispatch({ type: "id", payload: value });
            }}
          >
            <Tab key={"automatic"} title={"Automatic discount"} />
            <Tab key={"code"} title={"Discount code"} />
          </Tabs>
          {renderTitle}
        </div>
        {params == "Amount off order" && <>{renderDiscountValue}</>}
        {params == "Buy X get Y" && (
          <>
            <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
              {renderMinimumRequirement}
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
                Customers must add the quantity of items specified below to
                their cart.
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
                <Checkbox
                  onChange={(e) =>
                    dispatch({
                      type: "usesPerOrder",
                      subType: "choose",
                      payload: e.target.checked,
                    })
                  }
                  size="md"
                >
                  Set a maximum number of uses per order
                </Checkbox>
                {renderMaxUses}
              </div>
            </div>
          </>
        )}
        {(params == "Free shipping" || params == "Amount off order") && (
          <>
            {params == "Free shipping" && (
              <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 16,
                  }}
                >
                  Purchase type
                </span>

                <RadioGroup
                  value={selectedPurchaseType}
                  onValueChange={(value) => {
                    setSelectedPurchaseType(value);
                    if (value == "1") {
                      dispatch({ type: "purchaseType", payload: "oneTime" });
                    } else if (value == "2") {
                      dispatch({
                        type: "purchaseType",
                        payload: "subscription",
                      });
                    } else {
                      dispatch({ type: "purchaseType", payload: "both" });
                    }
                  }}
                  style={{
                    marginTop: 10,
                    fontWeight: 400,
                  }}
                >
                  <Radio value="1">One-time purchase</Radio>
                  <Radio value="2">Subscription</Radio>
                  <Radio value="3">Both</Radio>
                </RadioGroup>
              </div>
            )}
            <div className="p-4 bg-white rounded-3xl mt-10 ml-40 w-full h-100 flex flex-col">
              <span
                className="font-semibold"
                style={{
                  fontSize: 16,
                }}
              >
                Minimum purchase requirements
              </span>
              <RadioGroup
                value={selectedMinimumRequirement}
                onValueChange={(value) => {
                  setSelectedMinimumRequirement(value);
                  if (value == "1") {
                    dispatch({
                      type: "shippingMinimumRequirement",
                      subtype: "no",
                    });
                  }
                }}
                style={{
                  marginTop: 10,
                  fontWeight: 400,
                }}
              >
                <Radio value="1">No minimum requirements</Radio>
                <Radio value="2">Minimum purchase amount (₫)</Radio>
                {selectedMinimumRequirement == "2" && (
                  <div
                    style={{
                      marginLeft: 16,
                    }}
                  >
                    <Input
                      type="number"
                      className="w-20"
                      variant="bordered"
                      onChange={(e) =>
                        dispatch({
                          type: "shippingMinimumRequirement",
                          subtype: "subtotal",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <Radio value="3">Minimum quantity of items</Radio>
                {selectedMinimumRequirement == "3" && (
                  <div
                    style={{
                      marginLeft: 16,
                    }}
                  >
                    <Input
                      type="number"
                      className="w-20"
                      variant="bordered"
                      onChange={(e) =>
                        dispatch({
                          type: "shippingMinimumRequirement",
                          subtype: "quantity",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </RadioGroup>
            </div>
          </>
        )}
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
          >
            <Checkbox value={"1"}>Product discounts</Checkbox>
            <Checkbox value={"2"}>Order discounts</Checkbox>
            {params != "Free Shipping" && (
              <Checkbox value={"3"}>Shipping discounts</Checkbox>
            )}
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
          {renderEndDate}
        </div>
        <div
          className="flex gap-1 mt-10 "
          style={{
            marginLeft: 800,
          }}
        >
          <ButtonGroup>
            <Button color={"danger"} onClick={onOpen}>
              Discard
            </Button>
            <Button
              color="default"
              style={{ color: "white" }}
              onClick={() => {
                handleSaveDiscount();
              }}
            >
              Save discount
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div
        className="bg-white p-4"
        style={{
          marginRight: 370,
          marginTop: 75,
          width: 270,
          height: 500,
        }}
      >
        {renderSummary}
      </div>
      <DiscardModal
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />
      <ProductModal
        isOpen={isProductCustomerGetsModalOpen}
        onOpen={onProductCustomerGetsModalOpen}
        onOpenChange={onProductCustomerGetsModalOpenChange}
        products={products}
        value={valueCustomerGets}
        setValue={setValueCustomerGets}
        setProduct={setProductCustomerGets}
        product={productCustomerGets}
      />
      <ProductModal
        isOpen={isProductCustomerSpendsModalOpen}
        onOpen={onProductCustomerSpendsModalOpen}
        onOpenChange={onProductCustomerSpendsModalOpenChange}
        products={products}
        value={valueCustomerSpends}
        setValue={setValueCustomerSpends}
        setProduct={setProductCustomerSpends}
        product={productCustomerSpends}
      />
    </div>
  );
}
