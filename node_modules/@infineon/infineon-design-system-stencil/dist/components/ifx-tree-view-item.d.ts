import type { Components, JSX } from "../types/components";

interface IfxTreeViewItem extends Components.IfxTreeViewItem, HTMLElement {}
export const IfxTreeViewItem: {
    prototype: IfxTreeViewItem;
    new (): IfxTreeViewItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
