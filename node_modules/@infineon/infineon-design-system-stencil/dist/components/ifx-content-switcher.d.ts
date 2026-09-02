import type { Components, JSX } from "../types/components";

interface IfxContentSwitcher extends Components.IfxContentSwitcher, HTMLElement {}
export const IfxContentSwitcher: {
    prototype: IfxContentSwitcher;
    new (): IfxContentSwitcher;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
