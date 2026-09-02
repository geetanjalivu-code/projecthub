import type { IHeaderComp, IHeaderParams } from "ag-grid-community";
export declare class CheckboxHeaderRenderer implements IHeaderComp {
    eGui: HTMLDivElement;
    eCheckbox: HTMLElement;
    params: IHeaderParams & {
        onSelectAll?: (checked: boolean) => void;
    };
    init(params: IHeaderParams & {
        onSelectAll?: (checked: boolean) => void;
    }): void;
    getGui(): HTMLDivElement;
    refresh(params: IHeaderParams): boolean;
    private createHeader;
}
