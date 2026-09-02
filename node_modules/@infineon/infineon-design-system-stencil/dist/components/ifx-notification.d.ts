import type { Components, JSX } from "../types/components";

interface IfxNotification extends Components.IfxNotification, HTMLElement {}
export const IfxNotification: {
    prototype: IfxNotification;
    new (): IfxNotification;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
