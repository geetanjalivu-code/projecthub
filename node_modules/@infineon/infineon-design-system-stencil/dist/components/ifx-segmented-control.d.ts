import type { Components, JSX } from "../types/components";

interface IfxSegmentedControl extends Components.IfxSegmentedControl, HTMLElement {}
export const IfxSegmentedControl: {
    prototype: IfxSegmentedControl;
    new (): IfxSegmentedControl;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
