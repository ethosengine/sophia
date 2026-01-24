/* eslint-disable @khanacademy/ts-no-error-suppressions */
import {passageRefLogic} from "@ethosengine/perseus-core";
import {components, Changeable, EditorJsonify} from "@ethosengine/sophia";
import PropTypes from "prop-types";
import * as React from "react";

import type {PassageRefDefaultWidgetOptions} from "@ethosengine/perseus-core";

const {InfoTip, NumberInput, TextInput} = components;

type Props = any;

class PassageRefEditor extends React.Component<Props> {
    static propTypes: Props = {
        ...Changeable.propTypes,
        passageNumber: PropTypes.number,
        referenceNumber: PropTypes.number,
        summaryText: PropTypes.string,
    };

    static widgetName = "passage-ref" as const;

    static defaultProps: PassageRefDefaultWidgetOptions =
        passageRefLogic.defaultWidgetOptions;

    change: (
        newPropsOrSinglePropName: string | {[key: string]: unknown},
        propValue?: unknown,
        callback?: () => unknown,
    ) => unknown = (...args) => {
        return Changeable.change.apply(this, args);
    };

    serialize: () => any = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.ReactNode {
        return (
            <div>
                <div>
                    <label>
                        {"Passage Number: "}
                        <NumberInput
                            value={this.props.passageNumber}
                            onChange={this.change("passageNumber")}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        {"Reference Number: "}
                        <NumberInput
                            value={this.props.referenceNumber}
                            onChange={this.change("referenceNumber")}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        {"Summary Text: "}
                        <TextInput
                            value={this.props.summaryText}
                            onChange={this.change("summaryText")}
                        />
                        <InfoTip>
                            <p>
                                Short summary of the referenced section. This
                                will be included in parentheses and quotes
                                automatically.
                            </p>
                            <p>Ex: The start ... the end</p>
                        </InfoTip>
                    </label>
                </div>
            </div>
        );
    }
}

export default PassageRefEditor;
