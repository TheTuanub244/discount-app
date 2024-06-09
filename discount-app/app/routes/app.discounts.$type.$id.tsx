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
import "../styles/main.css";
import Calendar from "../Components/Calendar/Calendar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "stream/consumers";
import { useLoaderData } from "@remix-run/react";
import { getAllDiscount } from "~/api/DiscountAPI";
import { useMemo, useState } from "react";
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
      async (product) => {
        const getProduct = await getProductById(product);

        discountCustomerGet.push(getProduct.data);
      },
    ),
  );
  await Promise.all(
    findDiscount.discountCustomerBuys.item.products.productsToAdd.map(
      async (product) => {
        const getProduct = await getProductById(product);
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
  const [productCustomerGets, setProductCustomerGets] = useState([]);

  const {
    isOpen: isProductCustomerGetsModalOpen,
    onOpen: onProductCustomerGetsModalOpen,
    onOpenChange: onProductCustomerGetsModalOpenChange,
  } = useDisclosure();
  const renderSelectedProductCustomerSpends = useMemo(() => {
    return (
      <div>
        {discountCustomerBuys.length != 0 && (
          <div className="mt-10 border p-2 rounded-md">
            {discountCustomerBuys?.map((value) => (
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
  }, [discountCustomerBuys]);
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
        // onValueChange={(value) => {
        //   dispatch({ type: "customerGets", subType: value });
        // }}
      >
        <Radio value="percentage">Percentage</Radio>
        {/* {state.customerGets.discountValue.percentage.choose && (
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
        )} */}
        <Radio value="amountOff">Amount off each</Radio>
        {/* {state.customerGets.discountValue.amountOff.choose && (
          <Input
            // onChange={(e) =>
            //   dispatch({
            //     type: "customerGets",
            //     subType: "amountOff",
            //     payload: e.target.value,
            //   })
            // }
            className="w-1/2 ml-5"
            type="number"
            variant="bordered"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₫</span>
              </div>
            }
          />
        )} */}
        <Radio value="free">Free</Radio>
      </RadioGroup>
    );
  }, [discount]);
  const renderMaxUses = useMemo(() => {
    return (
      <div
        style={{
          marginLeft: 20,
        }}
      >
        {discount.basicDetail.usePerOrderLimit && (
          <Input
            // onChange={(e) =>
            //   dispatch({
            //     type: "usesPerOrder",
            //     subType: "amount",
            //     payload: e.target.value,
            //   })
            // }
            placeholder={discount.basicDetail.usePerOrderLimit}
            type="number"
            variant="bordered"
            className="w-20"
          />
        )}
      </div>
    );
  }, [discount]);
  const renderSelectedProductCustomerGets = useMemo(() => {
    return (
      <div>
        {discountCustomerGets.length != 0 && (
          <div className="mt-10 border p-2 rounded-md">
            {discountCustomerGets?.map((value) => (
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
  }, [discountCustomerGets]);
  const renderDiscountName = useMemo(() => {
    return (
      <div className="flex gap-1 mt-2">
        <h1 className="font-bold" style={{ fontSize: 15 }}>
          {discount.basicDetail.title}
        </h1>
        <h1 style={{ fontSize: 15 }}>can be combined with: </h1>
      </div>
    );
  }, [discount]);
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
            // onValueChange={(value) => {
            //   if (value == "subtotal") {
            //     dispatch({ type: "minimumRequirement", subType: "subtotal" });
            //   } else {
            //     dispatch({ type: "minimumRequirement", subType: "quantity" });
            //   }
            // }}
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
                    // onChange={(e) =>
                    //   dispatch({
                    //     type: "minimumRequirement",
                    //     payload: e.target.value,
                    //   })
                    // }
                  />
                </>
              ) : (
                <>
                  <h1>Quantity</h1>
                  <Input
                    variant="bordered"
                    className="w-22"
                    placeholder={discount.discountCustomerBuys.value.quantity}

                    // onChange={(e) =>
                    //   dispatch({
                    //     type: "minimumRequirement",
                    //     payload: e.target.value,
                    //   })
                    // }
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
              // onClick={onProductCustomerSpendsModalOpen}
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
                // onChange={(e) =>
                //   dispatch({
                //     type: "customerGets",
                //     subType: "quantity",
                //     payload: e.target.value,
                //   })
                // }
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
              // onClick={() => {
              //   onProductCustomerGetsModalOpen();
              // }}
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
                // onChange={(e) =>
                //   dispatch({
                //     type: "usesPerOrder",
                //     subType: "choose",
                //     payload: e.target.checked,
                //   })
                // }
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
              // onChange={(e) => {
              //   dispatch({
              //     type: "maxUses",
              //     subType: "useInTotal",
              //     payload: e.target.checked,
              //   });
              // }}
            >
              Limit number of times this discount can be used in total
            </Checkbox>
            {/* {renderMaxUsesInput} */}
            <Checkbox
              value={"usePerCustomer"}
              // onChange={(e) =>
              //   dispatch({
              //     type: "maxUses",
              //     subType: "usePerCustomer",
              //     payload: e.target.checked,
              //   })
              // }
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
            // onChange={(value) =>
            //   dispatch({ type: "combinations", payload: value })
            // }
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
            // date={state.startDate.date}
            // dispatch={dispatch}
            type="startDate"
          />
          <Checkbox
            // onChange={(e) => {
            //   dispatch({
            //     type: "endDate",
            //     subType: "choose",
            //     payload: e.target.checked,
            //   });
            // }}
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
        onOpen={onProductCustomerGetsModalOpen}
        onOpenChange={onProductCustomerGetsModalOpenChange}
        products={products}
        value={"valueCustomerGets"}
        setValue={"setValueCustomerGets"}
        setProduct={setProductCustomerGets}
        product={productCustomerGets}
      />
    </div>
  );
}
