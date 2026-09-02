import type { Components, JSX } from "../types/components";

interface IfxTemplatesUi extends Components.IfxTemplatesUi, HTMLElement {}
export const IfxTemplatesUi: {
    prototype: IfxTemplatesUi;
    new (): IfxTemplatesUi;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
