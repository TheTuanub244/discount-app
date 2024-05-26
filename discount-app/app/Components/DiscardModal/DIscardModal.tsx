import { Button,  Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";

export default function DiscardModal({isOpen, onOpen, onOpenChange}){
    const navigate = useNavigate();
    return(
        <Modal
        backdrop="opaque" 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
        size="3xl">
             <ModalContent  >
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 ">Leave page with unsaved changes?</ModalHeader>
              <ModalBody>
              Leaving this page will delete all unsaved changes.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose
                } >
                  stay
                </Button>
                <Button color="danger" variant="light" onPress={() => navigate("/app", {
                  replace: true,
                  relative: "path",
                  state: { some: "state" },
                })}>
                  Leave page
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
        </Modal>
    )   
}