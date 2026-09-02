import type { Components, JSX } from "../types/components";

interface IfxSetFilter extends Components.IfxSetFilter, HTMLElement {}
export const IfxSetFilter: {
    prototype: IfxSetFilter;
    new (): IfxSetFilter;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
