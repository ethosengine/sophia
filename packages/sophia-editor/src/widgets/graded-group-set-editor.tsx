/* eslint-disable react/forbid-prop-types, react/no-unsafe */
import {gradedGroupSetLogic} from "@ethosengine/perseus-core";
import {ApiOptions, Changeable} from "@ethosengine/sophia";
import PropTypes from "prop-types";
import * as React from "react";

import GradedGroupEditor from "./graded-group-editor";

import type {GradedGroupSetDefaultWidgetOptions} from "@ethosengine/perseus-core";

type Props = any;

class GradedGroupSetEditor extends React.Component<Props> {
    // eslint-disable-next-line react/sort-comp
    _editors: Array<unknown> = [];

    static propTypes = {
        ...Changeable.propTypes,
        apiOptions: ApiOptions.propTypes,
        gradedGroups: PropTypes.array,
        onChange: PropTypes.func.isRequired,
    };

    static widgetName = "graded-group-set" as const;

    static defaultProps: GradedGroupSetDefaultWidgetOptions =
        gradedGroupSetLogic.defaultWidgetOptions;

    // TODO(jangmi, CP-3288): Remove usage of `UNSAFE_componentWillMount`
    UNSAFE_componentWillMount() {
        this._editors = [];
    }

    change: (
        newPropsOrSinglePropName: string | {[key: string]: unknown},
        propValue?: unknown,
        callback?: () => unknown,
    ) => unknown = (...args) => {
        return Changeable.change.apply(this, args);
    };

    getSaveWarnings: () => ReadonlyArray<any> = () => {
        return [].concat(
            ...this._editors.map((editor) =>
                editor ? editor.getSaveWarnings() : [],
            ),
        );
    };

    serialize: () => {
        gradedGroups: any;
    } = () => {
        return {
            gradedGroups: this.props.gradedGroups,
        };
    };

    renderGroups: () => React.ReactElement = () => {
        if (!this.props.gradedGroups) {
            return null;
        }
        return this.props.gradedGroups.map((group, i) => (
            <GradedGroupEditor
                key={i}
                ref={(el) => (this._editors[i] = el)}
                {...group}
                apiOptions={this.props.apiOptions}
                widgetEnabled={true}
                immutableWidgets={false}
                onChange={(data) =>
                    this.change(
                        "gradedGroups",
                        setArrayItem(this.props.gradedGroups, i, {
                            ...this.props.gradedGroups[i],
                            ...data,
                        }),
                    )
                }
            />
        ));
    };

    addGroup: () => void = () => {
        const groups = this.props.gradedGroups || [];
        this.change(
            "gradedGroups",
            groups.concat([GradedGroupEditor.defaultProps]),
        );
    };

    render(): React.ReactNode {
        return (
            <div className="perseus-group-editor">
                {this.renderGroups()}
                <button onClick={this.addGroup}>Add group</button>
            </div>
        );
    }
}

const setArrayItem = (list, i: any, value) => [
    ...list.slice(0, i),
    value,
    ...list.slice(i + 1),
];

export default GradedGroupSetEditor;
