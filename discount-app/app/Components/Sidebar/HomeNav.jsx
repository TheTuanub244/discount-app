import {Accordion, AccordionItem} from "@nextui-org/react";
export default function HomeNav(){
    return (
        <Accordion selectionMode="multiple">
        <AccordionItem key="1" aria-label="Accordion 1" title="Discounts">
            <div >Manage Discounts</div>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Accordion 2" title="Settings">
            <h3>Settings</h3>
        </AccordionItem>
        <AccordionItem key="3" aria-label="Accordion 3" title="Help">
            <h3>Help</h3>
        </AccordionItem>
    </Accordion>
    )
}