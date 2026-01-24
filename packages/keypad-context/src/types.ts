import type {
    KeypadAPI,
    KeypadContextRendererInterface,
} from "@ethosengine/perseus-core";

export type KeypadContextType = {
    setKeypadActive: (keypadActive: boolean) => void;
    keypadActive: boolean;
    setKeypadElement: (keypadElement?: KeypadAPI | null) => void;
    keypadElement: KeypadAPI | null | undefined;
    setRenderer: (renderer?: KeypadContextRendererInterface | null) => void;
    renderer: KeypadContextRendererInterface | null | undefined;
    setScrollableElement: (
        scrollableElement?: HTMLElement | null | undefined,
    ) => void;
    scrollableElement: HTMLElement | null | undefined;
};
