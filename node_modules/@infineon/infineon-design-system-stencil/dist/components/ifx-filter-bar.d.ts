import type { Components, JSX } from "../types/components";

interface IfxFilterBar extends Components.IfxFilterBar, HTMLElement {}
export const IfxFilterBar: {
    prototype: IfxFilterBar;
    new (): IfxFilterBar;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
