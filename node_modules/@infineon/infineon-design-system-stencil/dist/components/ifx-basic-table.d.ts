import type { Components, JSX } from "../types/components";

interface IfxBasicTable extends Components.IfxBasicTable, HTMLElement {}
export const IfxBasicTable: {
    prototype: IfxBasicTable;
    new (): IfxBasicTable;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
