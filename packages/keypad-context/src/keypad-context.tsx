/**
 * KeypadContext provides a way to the Keypad and Perseus Renderers to
 * communicate.
 *
 * The StatefulKeypadContextProvider wraps the application
 * while KeypadContext.Consumer wraps things that need this state:
 * - mobile keypad usages
 * - Perseus Renderers (Server/Item/Article)
 */
import * as React from "react";
import {useState, useMemo} from "react";

import type {KeypadContextType} from "./types";
import type {
    KeypadContextRendererInterface,
    KeypadAPI,
} from "@ethosengine/perseus-core";

const defaultContextValue: KeypadContextType = {
    setKeypadActive: () => {},
    keypadActive: false,
    setKeypadElement: () => {},
    keypadElement: null,
    setRenderer: () => {},
    renderer: null,
    setScrollableElement: () => {},
    scrollableElement: null,
};

export const KeypadContext: React.Context<KeypadContextType> =
    React.createContext(defaultContextValue);

type Props = React.PropsWithChildren<unknown>;

export function StatefulKeypadContextProvider(props: Props) {
    // whether or not to display the keypad
    const [keypadActive, setKeypadActive] = useState<boolean>(false);
    // used to communicate between the keypad and the Renderer
    const [keypadElement, setKeypadElement] = useState<KeypadAPI | null>();
    // this is a KeypadContextRendererInterface from Perseus
    const [renderer, setRenderer] =
        useState<KeypadContextRendererInterface | null>();
    const [scrollableElement, setScrollableElement] =
        useState<HTMLElement | null>();

    const memoizedValue = useMemo(
        () => ({
            keypadActive,
            setKeypadActive,
            keypadElement,
            setKeypadElement,
            renderer,
            setRenderer,
            scrollableElement,
            setScrollableElement,
        }),
        [
            keypadActive,
            setKeypadActive,
            keypadElement,
            setKeypadElement,
            renderer,
            setRenderer,
            scrollableElement,
            setScrollableElement,
        ],
    );

    return (
        <KeypadContext.Provider value={memoizedValue}>
            {props.children}
        </KeypadContext.Provider>
    );
}
