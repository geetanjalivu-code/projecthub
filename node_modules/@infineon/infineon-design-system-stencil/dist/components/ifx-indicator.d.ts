import type { Components, JSX } from "../types/components";

interface IfxIndicator extends Components.IfxIndicator, HTMLElement {}
export const IfxIndicator: {
    prototype: IfxIndicator;
    new (): IfxIndicator;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
