import type { Components, JSX } from "../types/components";

interface IfxOverviewTable extends Components.IfxOverviewTable, HTMLElement {}
export const IfxOverviewTable: {
    prototype: IfxOverviewTable;
    new (): IfxOverviewTable;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
