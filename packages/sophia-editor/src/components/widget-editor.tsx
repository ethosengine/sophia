/* eslint-disable @khanacademy/ts-no-error-suppressions */
import {
    CoreWidgetRegistry,
    applyDefaultsToWidget,
    isFeatureOn,
} from "@ethosengine/perseus-core";
import {Widgets, excludeDenylistKeys} from "@ethosengine/sophia";
import {View} from "@khanacademy/wonder-blocks-core";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import Switch from "@khanacademy/wonder-blocks-switch";
import {spacing} from "@khanacademy/wonder-blocks-tokens";
import trashIcon from "@phosphor-icons/core/bold/trash-bold.svg";
import * as React from "react";
import {useId} from "react";

import SectionControlButton from "./section-control-button";
import SubscaleMappingsEditor from "./subscale-mappings-editor";
import ToggleableCaret from "./toggleable-caret";

import type Editor from "../editor";
import type {Alignment, PerseusWidget} from "@ethosengine/perseus-core";
import type {APIOptions} from "@ethosengine/sophia";
import type {
    AssessmentPurpose,
    SubscaleMappings,
    ChoiceSubscaleMap,
} from "@ethosengine/sophia-core";

type WidgetEditorProps = {
    // Unserialized props
    id: string;
    onChange: (
        widgetInfo: PerseusWidget,
        cb?: () => unknown,
        silent?: boolean,
    ) => unknown;
    onRemove: () => unknown;
    apiOptions: APIOptions;
    widgetIsOpen?: boolean;
    // Mode-aware props
    purpose?: AssessmentPurpose;
    subscaleMappings?: SubscaleMappings;
    onSubscaleMappingsChange?: (mappings: SubscaleMappings) => void;
    subscaleNames?: string[];
} & Omit<PerseusWidget, "key">;

type WidgetEditorState = {
    showWidget: boolean;
    widgetInfo: PerseusWidget;
};

const _upgradeWidgetInfo = (props: WidgetEditorProps): PerseusWidget => {
    // We can't call serialize here because this.refs.widget
    // doesn't exist before this component is mounted.
    const filteredProps = excludeDenylistKeys(props);
    return applyDefaultsToWidget(filteredProps as any);
};

// This component handles upgading widget editor props via prop
// upgrade transforms. Widget editors will always be rendered
// with all available transforms applied, but the results of those
// transforms will not be propogated upwards until serialization.
// eslint-disable-next-line react/no-unsafe
class WidgetEditor extends React.Component<
    WidgetEditorProps,
    WidgetEditorState
> {
    widget: React.RefObject<Editor>;

    constructor(props: WidgetEditorProps) {
        super(props);
        this.state = {
            showWidget: props.widgetIsOpen ?? true,
            widgetInfo: _upgradeWidgetInfo(props),
        };
        this.widget = React.createRef();
    }

    // eslint-disable-next-line react/no-unsafe
    UNSAFE_componentWillReceiveProps(nextProps: WidgetEditorProps) {
        this.setState({widgetInfo: _upgradeWidgetInfo(nextProps)});
        // user can update internal state while the widget is handled globally
        if (
            nextProps.widgetIsOpen != null &&
            nextProps.widgetIsOpen !== this.props.widgetIsOpen
        ) {
            this.setState({showWidget: nextProps.widgetIsOpen});
        }
    }

    _toggleWidget = (e: React.SyntheticEvent) => {
        e.preventDefault();
        this.setState({showWidget: !this.state.showWidget});
    };

    _handleWidgetChange = (
        newProps: WidgetEditorProps,
        cb: () => unknown,
        silent: boolean,
    ) => {
        // Casting to any is necessary because typescript
        // seems confused about the type of WidgetOptions
        // TODO (LC-1794): Fix this type so that we don't
        // require the cast to any.
        const newWidgetInfo = {
            ...this.state.widgetInfo,
            options: {
                ...this.state.widgetInfo.options,
                ...(this.widget.current?.serialize() ?? {}),
                ...newProps,
            },
        } as any;
        this.props.onChange(newWidgetInfo, cb, silent);
    };

    _setStatic = (value: boolean) => {
        const newWidgetInfo = {
            ...this.state.widgetInfo,
            static: value,
        } as PerseusWidget;
        this.props.onChange(newWidgetInfo);
    };

    _handleAlignmentChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
        const newAlignment = e.currentTarget.value as Alignment;
        const newWidgetInfo = Object.assign(
            {},
            this.state.widgetInfo,
        ) as PerseusWidget;
        newWidgetInfo.alignment = newAlignment;
        this.props.onChange(newWidgetInfo);
    };

    getSaveWarnings = () => {
        const issuesFunc = this.widget.current?.getSaveWarnings;
        return issuesFunc ? issuesFunc() : [];
    };

    serialize = () => {
        // TODO(alex): Make this properly handle the case where we load json
        // with a more recent widget version than this instance of Perseus
        // knows how to handle.
        const widgetInfo = this.state.widgetInfo;
        return {
            type: widgetInfo.type,
            alignment: widgetInfo.alignment,
            static: widgetInfo.static,
            graded: widgetInfo.graded,
            options: this.widget.current?.serialize() ?? {},
            version: widgetInfo.version,
        };
    };

    /**
     * Handle subscale mapping changes for this widget.
     */
    _handleSubscaleMappingsChange = (
        widgetId: string,
        mappings: ChoiceSubscaleMap,
    ) => {
        if (!this.props.onSubscaleMappingsChange) {
            return;
        }
        const newMappings: SubscaleMappings = {
            ...this.props.subscaleMappings,
            [widgetId]: mappings,
        };
        this.props.onSubscaleMappingsChange(newMappings);
    };

    /**
     * Extract choices from radio/dropdown widgets for subscale mapping.
     */
    _getWidgetChoices(): Array<{id: string; label: string}> {
        const widgetInfo = this.state.widgetInfo;
        const options = widgetInfo.options as Record<string, any>;

        if (widgetInfo.type === "radio" && options?.choices) {
            return (options.choices as Array<{content: string}>).map(
                (choice, index) => ({
                    id: String(index),
                    label: choice.content || `Choice ${index + 1}`,
                }),
            );
        }

        if (widgetInfo.type === "dropdown" && options?.choices) {
            return (options.choices as Array<string>).map((choice, index) => ({
                id: String(index),
                label: choice || `Option ${index + 1}`,
            }));
        }

        return [];
    }

    /**
     * Check if this widget type supports subscale mappings (for discovery mode).
     */
    _supportsSubscaleMappings(): boolean {
        const type = this.state.widgetInfo.type;
        return type === "radio" || type === "dropdown";
    }

    render(): React.ReactNode {
        const widgetInfo = this.state.widgetInfo;
        const isEditingDisabled =
            this.props.apiOptions.editingDisabled ?? false;

        const Ed = Widgets.getEditor(widgetInfo.type);
        let supportedAlignments: ReadonlyArray<Alignment>;
        const imageUpgradeAlignmentFF = isFeatureOn(
            this.props,
            "image-widget-upgrade-alignment",
        );

        if (this.props.apiOptions.showAlignmentOptions) {
            // TODO(LEMS-3520): Feature flag cleanup
            // Remove if statement once the image alignment upgrade FF is released
            if (widgetInfo.type === "image" && !imageUpgradeAlignmentFF) {
                supportedAlignments = ["block", "full-width"];
            } else {
                supportedAlignments = CoreWidgetRegistry.getSupportedAlignments(
                    widgetInfo.type,
                );
            }
        } else {
            // NOTE(kevinb): "default" is not one in `validAlignments` in widgets.js.
            supportedAlignments = ["default"];
        }

        const supportsStaticMode = Widgets.supportsStaticMode(widgetInfo.type);

        return (
            <div className="perseus-widget-editor">
                <div
                    className={
                        "perseus-widget-editor-title " +
                        (this.state.showWidget ? "open" : "closed")
                    }
                >
                    <div className="perseus-widget-editor-title-id">
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "0.25em",
                            }}
                            onClick={this._toggleWidget}
                        >
                            <ToggleableCaret
                                isExpanded={this.state.showWidget}
                            />
                            <span>{this.props.id}</span>
                        </View>
                    </div>

                    {supportsStaticMode && (
                        <LabeledSwitch
                            label="Static"
                            checked={!!widgetInfo.static}
                            disabled={isEditingDisabled}
                            onChange={this._setStatic}
                        />
                    )}
                    {supportedAlignments.length > 1 && (
                        <select
                            className="alignment"
                            value={widgetInfo.alignment}
                            disabled={isEditingDisabled}
                            onChange={this._handleAlignmentChange}
                        >
                            {supportedAlignments.map((alignment) => (
                                <option key={alignment}>{alignment}</option>
                            ))}
                        </select>
                    )}
                    <SectionControlButton
                        icon={trashIcon}
                        disabled={isEditingDisabled}
                        onClick={() => {
                            this.props.onRemove();
                        }}
                        title="Remove image widget"
                    />
                </div>
                <div
                    className={
                        "perseus-widget-editor-content " +
                        (this.state.showWidget ? "enter" : "leave")
                    }
                >
                    {Ed && (
                        <Ed
                            ref={this.widget}
                            onChange={this._handleWidgetChange}
                            static={widgetInfo.static}
                            apiOptions={this.props.apiOptions}
                            {...widgetInfo.options}
                        />
                    )}

                    {/* Discovery mode: Show subscale mappings for radio/dropdown widgets */}
                    {this.props.purpose === "discovery" &&
                        this._supportsSubscaleMappings() &&
                        this.props.onSubscaleMappingsChange && (
                            <SubscaleMappingsEditor
                                widgetId={this.props.id}
                                choices={this._getWidgetChoices()}
                                mappings={
                                    this.props.subscaleMappings?.[
                                        this.props.id
                                    ] ?? {}
                                }
                                onChange={this._handleSubscaleMappingsChange}
                                subscaleNames={this.props.subscaleNames}
                            />
                        )}

                    {/* Reflection mode: Note about no scoring */}
                    {this.props.purpose === "reflection" && (
                        <div
                            style={{
                                padding: spacing.small_12,
                                backgroundColor: "#f8f9fa",
                                borderRadius: spacing.xxSmall_6,
                                marginTop: spacing.small_12,
                                fontSize: 13,
                                color: "#6c757d",
                            }}
                        >
                            Reflection mode: Responses are collected without
                            scoring or correctness evaluation.
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

function LabeledSwitch(props: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => unknown;
    disabled: boolean;
}) {
    const {label, disabled, ...switchProps} = props;
    const id = useId();
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <Strut size={spacing.xxSmall_6} />
            <Switch id={id} {...switchProps} disabled={disabled} />
        </>
    );
}

export default WidgetEditor;
