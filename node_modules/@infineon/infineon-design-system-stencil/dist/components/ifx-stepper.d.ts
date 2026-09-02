import type { Components, JSX } from "../types/components";

interface IfxStepper extends Components.IfxStepper, HTMLElement {}
export const IfxStepper: {
    prototype: IfxStepper;
    new (): IfxStepper;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
