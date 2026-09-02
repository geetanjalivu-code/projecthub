import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class IconButtonCellRenderer implements ICellRendererComp {
    eGui: HTMLDivElement;
    eIconButton: HTMLElement;
    eventListener: (event: Event) => void;
    init(params: ICellRendererParams): void;
    getGui(): HTMLDivElement;
    refresh(params: ICellRendererParams): boolean;
    private createIconButton;
    private updateIconButton;
    private setIconButtonAttributes;
    private attachEventListener;
    private detachEventListener;
    private hasRequiredKeys;
}
