import type { Components, JSX } from "../types/components";

interface IfxFilterSearch extends Components.IfxFilterSearch, HTMLElement {}
export const IfxFilterSearch: {
    prototype: IfxFilterSearch;
    new (): IfxFilterSearch;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
