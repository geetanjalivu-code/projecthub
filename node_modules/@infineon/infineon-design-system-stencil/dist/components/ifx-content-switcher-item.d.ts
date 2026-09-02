import type { Components, JSX } from "../types/components";

interface IfxContentSwitcherItem extends Components.IfxContentSwitcherItem, HTMLElement {}
export const IfxContentSwitcherItem: {
    prototype: IfxContentSwitcherItem;
    new (): IfxContentSwitcherItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
