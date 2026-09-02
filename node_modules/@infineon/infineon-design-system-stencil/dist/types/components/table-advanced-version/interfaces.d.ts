export interface ButtonInterface {
    disabled?: boolean;
    variant?: string;
    size?: string;
    target?: string;
    href?: string;
    theme?: string;
    type?: string;
    fullWidth?: boolean;
    icon?: string;
    iconPosition?: string;
    text: string;
}
export interface IconButtonInterface {
    disabled?: boolean;
    variant?: string;
    size?: string;
    target?: string;
    href?: string;
    shape?: string;
    icon?: string;
}
export interface CheckboxInterface {
    disabled?: boolean;
    error?: boolean;
    size?: string;
    checked?: boolean;
    indeterminate?: boolean;
}
export interface LinkInterface {
    disabled?: boolean;
    variant?: string;
    size?: string;
    target?: string;
    href?: string;
    download?: string;
    text: string;
}
export interface StatusInterface {
    color?: string;
    label?: string;
    border?: boolean;
}
export interface TooltipInterface {
    text?: string;
    position?: string;
    value?: string;
}
export declare const ButtonKeys: Array<keyof ButtonInterface>;
export declare const IconButtonKeys: Array<keyof IconButtonInterface>;
export declare const StatusKeys: Array<keyof StatusInterface>;
export declare const CheckboxKeys: Array<keyof CheckboxInterface>;
export declare const TooltipKeys: Array<keyof TooltipInterface>;
