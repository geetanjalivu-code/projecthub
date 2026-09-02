import type { Components, JSX } from "../types/components";

interface IfxActionList extends Components.IfxActionList, HTMLElement {}
export const IfxActionList: {
    prototype: IfxActionList;
    new (): IfxActionList;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
