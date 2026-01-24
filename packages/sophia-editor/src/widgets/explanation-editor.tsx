/* eslint-disable react/forbid-prop-types */
import {explanationLogic} from "@ethosengine/perseus-core";
import {
    components,
    Changeable,
    EditorJsonify,
    createTypedChange,
} from "@ethosengine/sophia";
import PropTypes from "prop-types";
import * as React from "react";
import _ from "underscore";

import Editor from "../editor";

import type {
    ExplanationDefaultWidgetOptions,
    PerseusExplanationWidgetOptions,
} from "@ethosengine/perseus-core";
import type {ChangeFn, EditorProps} from "@ethosengine/sophia";

const {TextInput} = components;

type Props = EditorProps<PerseusExplanationWidgetOptions>;
type State = Record<string, never>;

// JSDoc will be shown in Storybook widget editor description
/**
 * An editor for adding an explanation widget that provides supplementary information to users.
 */
class ExplanationEditor extends React.Component<Props, State> {
    static propTypes = {
        ...Changeable.propTypes,
        showPrompt: PropTypes.string,
        hidePrompt: PropTypes.string,
        explanation: PropTypes.string,
        widgets: PropTypes.object,
        apiOptions: PropTypes.any,
    };

    static widgetName = "explanation" as const;

    static defaultProps: ExplanationDefaultWidgetOptions =
        explanationLogic.defaultWidgetOptions;

    state: State = {};

    change: ChangeFn<PerseusExplanationWidgetOptions> = createTypedChange(this);

    serialize: () => any = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.ReactNode {
        return (
            <div className="perseus-widget-explanation-editor">
                <div className="perseus-widget-row">
                    <label>
                        Prompt to show explanation:{" "}
                        <TextInput
                            value={this.props.showPrompt}
                            onChange={this.change("showPrompt")}
                        />
                    </label>
                </div>
                <div className="perseus-widget-row">
                    <label>
                        Prompt to hide explanation:{" "}
                        <TextInput
                            value={this.props.hidePrompt}
                            onChange={this.change("hidePrompt")}
                        />
                    </label>
                </div>
                <div className="perseus-widget-row">
                    <Editor
                        apiOptions={this.props.apiOptions}
                        content={this.props.explanation}
                        widgets={this.props.widgets}
                        widgetEnabled={true}
                        immutableWidgets={false}
                        onChange={(props) => {
                            const newProps: Record<string, any> = {};
                            if (_.has(props, "content")) {
                                newProps.explanation = props.content;
                            }
                            if (_.has(props, "widgets")) {
                                newProps.widgets = props.widgets;
                            }
                            this.change(newProps);
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default ExplanationEditor;
