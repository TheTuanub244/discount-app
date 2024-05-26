import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import "../styles/bodyHeader.css";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import {Button, useDisclosure} from "@nextui-org/react";
import HomeNav from "../Components/Sidebar/HomeNav";
import DiscountTable from "../Components/Dashboard/DashboardTable/DiscountTable";
import React, { useEffect }  from "react";
import { getAllDiscount } from "../api/DiscountAPI";
import CreateModal from "../Components/CreateModal/CreateModal";
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data?.productCreate?.product,
  });
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const{isOpen, onOpen, onOpenChange} = useDisclosure()
  return (
    <div className="w-full main-container">
        <div className="navigation w-1/6">
          <HomeNav/>
        </div>
          <div className="body-container">
            <div className="body-header mt-10 w-1/2  ml-100 flex flex-row place-content-around">
              <h3 className="text-3xl ">Manage Discounts</h3>
            </div>
            <div className="body-main border border-black-1 mt-20 h-full mr-20">
              <DiscountTable className="h-full" onOpen={onOpen}/>
            </div>
          </div>
          <CreateModal isOpen={isOpen} onOpenChange={onOpenChange}/>
    </div>
  );
}
