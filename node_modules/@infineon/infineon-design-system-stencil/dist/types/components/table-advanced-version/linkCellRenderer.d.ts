import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class LinkCellRenderer implements ICellRendererComp {
    eGui: HTMLDivElement;
    eLink: HTMLElement;
    init(params: ICellRendererParams): void;
    getGui(): HTMLDivElement;
    refresh(params: ICellRendererParams): boolean;
    private createLink;
    private updateLink;
    private setLinkAttributes;
    private hasRequiredKeys;
}
