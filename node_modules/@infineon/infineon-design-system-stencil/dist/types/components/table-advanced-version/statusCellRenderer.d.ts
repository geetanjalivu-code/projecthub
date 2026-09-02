import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class StatusCellRenderer implements ICellRendererComp {
    private eGui;
    init(params: ICellRendererParams): void;
    getGui(): HTMLDivElement;
    refresh(params: ICellRendererParams): boolean;
    private render;
}
