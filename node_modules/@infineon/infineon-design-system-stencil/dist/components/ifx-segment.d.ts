import type { Components, JSX } from "../types/components";

interface IfxSegment extends Components.IfxSegment, HTMLElement {}
export const IfxSegment: {
    prototype: IfxSegment;
    new (): IfxSegment;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
