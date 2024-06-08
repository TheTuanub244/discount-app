import React from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { ListboxWrapper } from "./ListBoxWrapper";
export default function CreateModal({ isOpen, onOpen, onOpenChange }) {
  const navigate = useNavigate();
  return (
    <>
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 ">
                Select discount type
              </ModalHeader>
              <ModalBody>
                <ListboxWrapper>
                  <Listbox
                    aria-label="Listbox Variants"
                    color={"default"}
                    variant={"solid"}
                  >
                    <ListboxItem key="new">
                      <div
                        className="flex justify-between "
                        onClick={() => {
                          navigate("/app/discounts/newType=AmountOffProduct", {
                            replace: true,
                            relative: "path",
                            state: { some: "state" },
                          });
                        }}
                      >
                        <div>
                          <p className="text-bold text-small ">
                            Amount off products
                          </p>
                          <p className="text-bold text-tiny capitalize text-default-400">
                            Discount specific products or collections of
                            products
                          </p>
                        </div>
                        <div className="mt-9">Product discount</div>
                      </div>
                    </ListboxItem>
                    <ListboxItem key="copy">
                      <div
                        className="flex justify-between"
                        onClick={() => {
                          navigate("/app/discounts/newType=BuyXGetY", {
                            replace: true,
                            relative: "path",
                            state: { some: "state" },
                          });
                        }}
                      >
                        <div className="flex flex-col">
                          <p className="text-bold text-small ">Buy X get Y</p>
                          <p className="text-bold text-tiny capitalize text-default-400">
                            Discount products based on a customer's purchase
                          </p>
                        </div>
                        <div className="mt-9">Product discount</div>
                      </div>
                    </ListboxItem>
                    <ListboxItem key="edit">
                      <div
                        className="flex justify-between"
                        onClick={() => {
                          navigate("/app/discounts/newType=AmountOffOrder", {
                            replace: true,
                            relative: "path",
                            state: { some: "state" },
                          });
                        }}
                      >
                        <div className="flex flex-col">
                          <p className="text-bold text-small ">
                            Amount off order
                          </p>
                          <p className="text-bold text-tiny capitalize text-default-400">
                            Discount the total order amount
                          </p>
                        </div>
                        <div>Order discount</div>
                      </div>
                    </ListboxItem>
                    <ListboxItem key="delete">
                      <div
                        className="flex justify-between"
                        onClick={() => {
                          navigate("/app/discounts/newType=FreeShipping", {
                            replace: true,
                            relative: "path",
                            state: { some: "state" },
                          });
                        }}
                      >
                        <div className="flex flex-col">
                          <p className="text-bold text-small ">Free shipping</p>
                          <p className="text-bold text-tiny capitalize text-default-400">
                            Offer free shipping on an order
                          </p>
                        </div>
                        <div>Shipping discount</div>
                      </div>
                    </ListboxItem>
                  </Listbox>
                </ListboxWrapper>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
