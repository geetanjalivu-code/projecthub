import type { Components, JSX } from "../types/components";

interface IfxList extends Components.IfxList, HTMLElement {}
export const IfxList: {
    prototype: IfxList;
    new (): IfxList;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
