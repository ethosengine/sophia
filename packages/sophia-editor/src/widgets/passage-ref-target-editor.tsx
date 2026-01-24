import {
    passageRefTargetLogic,
    type PassageRefTargetDefaultWidgetOptions,
} from "@ethosengine/perseus-core";
import {Changeable, EditorJsonify} from "@ethosengine/sophia";
import PropTypes from "prop-types";
import * as React from "react";

type Props = any;

class PassageRefTargetEditor extends React.Component<Props> {
    static propTypes = {
        ...Changeable.propTypes,
        content: PropTypes.string,
    };

    static widgetName = "passage-ref-target" as const;

    static defaultProps: PassageRefTargetDefaultWidgetOptions =
        passageRefTargetLogic.defaultWidgetOptions;

    change: (
        newPropsOrSinglePropName: string | {[key: string]: unknown},
        propValue?: unknown,
        callback?: () => unknown,
    ) => unknown = (...args) => {
        return Changeable.change.apply(this, args);
    };

    handleContentChange: (arg1: React.ChangeEvent<HTMLInputElement>) => void = (
        e,
    ) => {
        this.change({content: e.target.value});
    };

    serialize: () => any = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.ReactNode {
        return (
            <div>
                Content:
                <input
                    type="text"
                    value={this.props.content}
                    onChange={this.handleContentChange}
                />
            </div>
        );
    }
}

export default PassageRefTargetEditor;
