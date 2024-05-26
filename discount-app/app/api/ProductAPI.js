import axios from "axios";

export const getAllProduct = async () => {
  const data = await axios.get("http://localhost:8000/product/getAllProduct");
  return data.data.data.products.edges;
};
export const getProductById = async (id) => {
  const data = await axios.post(
    "http://localhost:8000/product/getProductById",
    {
      id: id,
    },
  );
  return data.data;
};
