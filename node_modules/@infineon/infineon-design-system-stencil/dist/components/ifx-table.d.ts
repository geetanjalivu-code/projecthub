import type { Components, JSX } from "../types/components";

interface IfxTable extends Components.IfxTable, HTMLElement {}
export const IfxTable: {
    prototype: IfxTable;
    new (): IfxTable;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
