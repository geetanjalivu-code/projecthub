import type { Components, JSX } from "../types/components";

interface IfxDatePicker extends Components.IfxDatePicker, HTMLElement {}
export const IfxDatePicker: {
    prototype: IfxDatePicker;
    new (): IfxDatePicker;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
