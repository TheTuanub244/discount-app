import {
  Avatar,
  Button,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { SearchIcon } from "./SearchIcon";
import { ListboxWrapper } from "../CreateModal/ListBoxWrapper";
import { getProductById } from "~/api/ProductAPI";
export default function ProductModal({
  isOpen,
  onOpen,
  onOpenChange,
  products,
  value,
  setValue,
  setProduct,
  product,
}) {
  const navigate = useNavigate();
  return (
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
              Edit product
            </ModalHeader>
            <ModalBody>
              <Input
                label="Search"
                radius="lg"
                placeholder="Type to search..."
                startContent={
                  <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                }
              />
              <ListboxWrapper>
                <Listbox
                  classNames={{
                    base: "max-w",
                    list: "max-h-[300px] overflow-scroll",
                  }}
                  items={products}
                  label="Assigned to"
                  selectionMode="multiple"
                  onSelectionChange={async (value) => {
                    const tempSelectedProduct = [];
                    for (let index of value) {
                      const data = await getProductById(index);
                      tempSelectedProduct.push(data.data.product);
                    }
                    const newSelectedProduct = tempSelectedProduct.filter(
                      (index) => !product.includes(index),
                    );
                    setProduct(newSelectedProduct);
                  }}
                  variant="flat"
                >
                  {(item) => (
                    <ListboxItem
                      key={item?.node.id}
                      textValue={item?.node.title}
                      className="max-w"
                    >
                      <div className="flex gap-1 max-w ">
                        <Avatar
                          alt={item?.node.title}
                          className="flex-shrink-0"
                          size="sm"
                          src={
                            item?.node.featuredImage
                              ? item?.node.featuredImage.url
                              : ""
                          }
                        />
                        <div className="flex gap-1 ml-10 justify-between font-semibold w-1/2">
                          <span className="text-lg  font-semibold ">
                            {item?.node.title}
                          </span>
                          <span>
                            {item?.node.compareAtPriceRange
                              ? ` ₫${item?.node.compareAtPriceRange.maxVariantCompareAtPrice.amount}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </ListboxItem>
                  )}
                </Listbox>
              </ListboxWrapper>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={() => {
                  onClose();
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
