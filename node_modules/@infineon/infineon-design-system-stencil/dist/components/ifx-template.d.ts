import type { Components, JSX } from "../types/components";

interface IfxTemplate extends Components.IfxTemplate, HTMLElement {}
export const IfxTemplate: {
    prototype: IfxTemplate;
    new (): IfxTemplate;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
