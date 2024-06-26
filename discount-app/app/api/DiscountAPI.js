import axios from "axios";
export const getAllDiscount = async () => {
  const data = await axios.get("http://localhost:8000/discount/getAllDiscount");
  return data.data.edges;
};
export const deactiveAllDiscount = async (discounts) => {
  const data = await axios.post(
    "http://localhost:8000/discount/deactiveAlldiscounts",
    discounts,
  );
  return data.data.edges;
};
export const activeAllDiscount = async (discounts) => {
  const data = await axios.post(
    "http://localhost:8000/discount/activeAlldiscounts",
    discounts,
  );
  console.log(data);
  return data.data.edges;
};
export const createBuyXgetY = async (discount) => {
  const data = await axios.post(
    "http://localhost:8000/discount/createBuyXgetY",
    discount,
  );
  return data.data;
};
export const createFreeShipping = async (discount) => {
  const data = await axios.post(
    "http://localhost:8000/discount/createFreeShipping",
    discount,
  );
  return data.data;
};
export const createDiscountBasic = async (discount) => {
  const data = await axios.post(
    "http://localhost:8000/discount/createBasic",
    discount,
  );
  return data.data;
};
export const createAmountOffProduct = async (discount) => {
  const data = await axios.post(
    "http://localhost:8000/discount/createAmountOffProduct",
    discount,
  );
  return data.data;
};
export const deleteDiscounts = async (discounts) => {
  const data = await axios.post(
    "http://localhost:8000/discount/deleteDiscounts",
    discounts,
  );
  return data.data.edges;
};
export const updateBXGY = async (discount, lastData) => {
  console.log(discount);
  const data = await axios.post("http://localhost:8000/discount/updateBXGY", {
    discount,
    lastData,
  });
  return data.data;
};
