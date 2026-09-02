declare global {
    interface Window {
        btntConfig?: any;
        btntQueue?: any[];
        btnt?: (data: object) => void;
        INFINEON_TRACKED_COMPONENTS?: Set<string>;
    }
}
export declare function trackComponent(componentName: string, environment: string): void;
export default trackComponent;
