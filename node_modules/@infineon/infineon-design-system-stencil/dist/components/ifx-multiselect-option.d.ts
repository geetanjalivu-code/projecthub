import type { Components, JSX } from "../types/components";

interface IfxMultiselectOption extends Components.IfxMultiselectOption, HTMLElement {}
export const IfxMultiselectOption: {
    prototype: IfxMultiselectOption;
    new (): IfxMultiselectOption;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
