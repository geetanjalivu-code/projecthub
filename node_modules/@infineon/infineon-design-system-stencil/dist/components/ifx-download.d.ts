import type { Components, JSX } from "../types/components";

interface IfxDownload extends Components.IfxDownload, HTMLElement {}
export const IfxDownload: {
    prototype: IfxDownload;
    new (): IfxDownload;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
