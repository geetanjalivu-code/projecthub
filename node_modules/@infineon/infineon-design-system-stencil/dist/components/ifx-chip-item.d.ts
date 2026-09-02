import type { Components, JSX } from "../types/components";

interface IfxChipItem extends Components.IfxChipItem, HTMLElement {}
export const IfxChipItem: {
    prototype: IfxChipItem;
    new (): IfxChipItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
