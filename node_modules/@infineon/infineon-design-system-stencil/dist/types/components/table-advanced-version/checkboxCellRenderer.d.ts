import type { ICellRendererComp, ICellRendererParams } from "ag-grid-community";
export declare class CheckboxCellRenderer implements ICellRendererComp {
    eGui: HTMLDivElement;
    eCheckbox: HTMLElement;
    eventListener: (event: Event) => void;
    init(params: ICellRendererParams): void;
    getGui(): HTMLDivElement;
    refresh(params: ICellRendererParams): boolean;
    private createCheckbox;
    private updateCheckbox;
    private setCheckboxAttributes;
    private attachEventListener;
    private detachEventListener;
    private hasRequiredKeys;
}
