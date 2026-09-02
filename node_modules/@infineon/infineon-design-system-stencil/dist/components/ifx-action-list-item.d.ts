import type { Components, JSX } from "../types/components";

interface IfxActionListItem extends Components.IfxActionListItem, HTMLElement {}
export const IfxActionListItem: {
    prototype: IfxActionListItem;
    new (): IfxActionListItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
