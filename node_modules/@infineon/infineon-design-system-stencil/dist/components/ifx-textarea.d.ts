import type { Components, JSX } from "../types/components";

interface IfxTextarea extends Components.IfxTextarea, HTMLElement {}
export const IfxTextarea: {
    prototype: IfxTextarea;
    new (): IfxTextarea;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
