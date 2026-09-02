import type { Components, JSX } from "../types/components";

interface IfxFileUpload extends Components.IfxFileUpload, HTMLElement {}
export const IfxFileUpload: {
    prototype: IfxFileUpload;
    new (): IfxFileUpload;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
