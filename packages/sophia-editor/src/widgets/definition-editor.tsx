import {definitionLogic} from "@ethosengine/perseus-core";
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
    DefinitionDefaultWidgetOptions,
    PerseusDefinitionWidgetOptions,
} from "@ethosengine/perseus-core";
import type {ChangeFn, EditorProps} from "@ethosengine/sophia";

const {TextInput} = components;

type Props = EditorProps<PerseusDefinitionWidgetOptions>;

// JSDoc will be shown in Storybook widget editor description
/**
 * An editor for adding an interactive definition widget that allows content
 * editors to embed clickable terms with expandable explanations within content.
 */
class DefinitionEditor extends React.Component<Props> {
    static propTypes = {
        ...Changeable.propTypes,
        togglePrompt: PropTypes.string,
        definition: PropTypes.string,
        apiOptions: PropTypes.any,
    };

    static widgetName = "definition" as const;

    static defaultProps: DefinitionDefaultWidgetOptions =
        definitionLogic.defaultWidgetOptions;

    change: ChangeFn<PerseusDefinitionWidgetOptions> = createTypedChange(this);

    serialize: () => any = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.ReactNode {
        return (
            <div className="perseus-widget-definition-editor">
                <a
                    href="https://docs.google.com/document/d/1udaPef4imOfTMhmLDlWq4SM0mxL0r3YHFZE-5J1uGfo"
                    target="_blank"
                    rel="noreferrer"
                >
                    Definition style guide
                </a>
                <div className="perseus-widget-row">
                    <label>
                        Word to be defined:{" "}
                        <TextInput
                            value={this.props.togglePrompt}
                            onChange={this.change("togglePrompt")}
                            placeholder="define me"
                        />
                    </label>
                </div>
                <div className="perseus-widget-row">
                    <Editor
                        apiOptions={this.props.apiOptions}
                        content={this.props.definition}
                        widgetEnabled={false}
                        placeholder="definition goes here"
                        onChange={(props) => {
                            const newProps: Record<string, any> = {};
                            if (_.has(props, "content")) {
                                newProps.definition = props.content;
                            }
                            this.change(newProps);
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default DefinitionEditor;
