import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class ButtonCellRenderer implements ICellRendererComp {
    eGui: HTMLDivElement;
    eButton: HTMLElement;
    eventListener: (event: Event) => void;
    init(params: ICellRendererParams): void;
    getGui(): HTMLDivElement;
    refresh(params: ICellRendererParams): boolean;
    private createButton;
    private updateButton;
    private setButtonAttributes;
    private attachEventListener;
    private detachEventListener;
    private hasRequiredKeys;
}
