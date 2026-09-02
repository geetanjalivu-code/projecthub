import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class CustomNoRowsOverlay implements ICellRendererComp {
    eGui: HTMLElement;
    init(params: ICellRendererParams & {
        noRowsMessageFunc: () => string;
    }): void;
    getGui(): HTMLElement;
    refresh(_params: ICellRendererParams): boolean;
}
