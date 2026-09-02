import type { Components, JSX } from "../types/components";

interface IfxListEntry extends Components.IfxListEntry, HTMLElement {}
export const IfxListEntry: {
    prototype: IfxListEntry;
    new (): IfxListEntry;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
