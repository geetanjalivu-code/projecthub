import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class CustomLoadingOverlay implements ICellRendererComp {
    eGui: HTMLElement;
    init(_params: ICellRendererParams & {
        loadingMessage: string;
    }): void;
    getGui(): HTMLElement;
    refresh(_params: ICellRendererParams): boolean;
}
