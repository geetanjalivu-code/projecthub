import type { Components, JSX } from "../types/components";

interface IfxStep extends Components.IfxStep, HTMLElement {}
export const IfxStep: {
    prototype: IfxStep;
    new (): IfxStep;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
