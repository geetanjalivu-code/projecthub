import type { Components, JSX } from "../types/components";

interface IfxButton extends Components.IfxButton, HTMLElement {}
export const IfxButton: {
    prototype: IfxButton;
    new (): IfxButton;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
