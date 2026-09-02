import type { Components, JSX } from "../types/components";

interface IfxStatus extends Components.IfxStatus, HTMLElement {}
export const IfxStatus: {
    prototype: IfxStatus;
    new (): IfxStatus;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
