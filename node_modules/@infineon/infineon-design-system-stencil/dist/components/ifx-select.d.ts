import type { Components, JSX } from "../types/components";

interface IfxSelect extends Components.IfxSelect, HTMLElement {}
export const IfxSelect: {
    prototype: IfxSelect;
    new (): IfxSelect;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
