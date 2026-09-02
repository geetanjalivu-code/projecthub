import type { Components, JSX } from "../types/components";

interface IfxCardLinks extends Components.IfxCardLinks, HTMLElement {}
export const IfxCardLinks: {
    prototype: IfxCardLinks;
    new (): IfxCardLinks;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
