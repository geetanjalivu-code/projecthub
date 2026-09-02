import type { Components, JSX } from "../types/components";

interface IfxPopover extends Components.IfxPopover, HTMLElement {}
export const IfxPopover: {
    prototype: IfxPopover;
    new (): IfxPopover;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
