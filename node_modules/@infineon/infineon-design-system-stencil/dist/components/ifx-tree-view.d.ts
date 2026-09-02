import type { Components, JSX } from "../types/components";

interface IfxTreeView extends Components.IfxTreeView, HTMLElement {}
export const IfxTreeView: {
    prototype: IfxTreeView;
    new (): IfxTreeView;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
