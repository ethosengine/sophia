/* eslint-disable react/no-unsafe */
import {
    interactionLogic,
    type Coords,
    type InteractionDefaultWidgetOptions,
    type MarkingsType,
} from "@ethosengine/perseus-core";
import {
    Changeable,
    Dependencies,
    EditorJsonify,
    Util,
} from "@ethosengine/sophia";
import * as React from "react";
import _ from "underscore";

import GraphSettings from "../../components/graph-settings";

import ElementContainer from "./element-container";
import FunctionEditor from "./function-editor";
import LabelEditor from "./label-editor";
import LineEditor from "./line-editor";
import MovableLineEditor from "./movable-line-editor";
import MovablePointEditor from "./movable-point-editor";
import ParametricEditor from "./parametric-editor";
import PointEditor from "./point-editor";
import RectangleEditor from "./rectangle-editor";

const {getDependencies} = Dependencies;
const {unescapeMathMode} = Util;

type Graph = {
    box: ReadonlyArray<number>;
    labels: ReadonlyArray<string>;
    range: Coords;
    tickStep: [number, number];
    gridStep: [number, number];
    markings: MarkingsType;
    valid?: boolean;
};

type Props = Changeable.ChangeableProps & {
    elements: ReadonlyArray<any>;
    graph: Graph;
};

type State = any;

// JSDoc will be shown in Storybook widget editor description
/**
 * An editor for the interaction widget that allows users to engage with interactive content.
 *
 * The interaction widget provides a dynamic graph interface with various interactive elements
 * including points, lines, movable points, movable lines, functions, parametric curves,
 * labels, and rectangles. This editor allows content creators to configure those elements
 * and their properties.
 */
class InteractionEditor extends React.Component<Props, State> {
    static widgetName = "interaction" as const;
    static defaultProps: InteractionDefaultWidgetOptions =
        interactionLogic.defaultWidgetOptions;

    state: State = {
        usedVarSubscripts: this._getAllVarSubscripts(this.props.elements),
        usedFunctionNames: this._getAllFunctionNames(this.props.elements),
    };

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState({
            usedVarSubscripts: this._getAllVarSubscripts(nextProps.elements),
            usedFunctionNames: this._getAllFunctionNames(nextProps.elements),
        });
    }

    _getAllVarSubscripts(elements: ReadonlyArray<any>): ReadonlyArray<any> {
        return _.map(
            _.where(elements, {type: "movable-point"}),
            (element) => element.options.varSubscript,
        )
            .concat(
                _.map(
                    _.where(elements, {type: "movable-line"}),
                    (element) => element.options.startSubscript,
                ),
            )
            .concat(
                _.map(
                    _.where(elements, {type: "movable-line"}),
                    (element) => element.options.endSubscript,
                ),
            );
    }

    _getAllFunctionNames(elements: ReadonlyArray<any>): ReadonlyArray<string> {
        return _.map(
            _.where(elements, {type: "function"}),
            (element) => element.options.funcName,
        );
    }

    _updateGraphProps: (arg1: any) => any = (newProps) => {
        // TODO(eater): GraphSettings should name this tickStep instead
        // of step. Grr..
        this.change({
            graph: _.extend(_.omit(newProps, "step"), {
                tickStep: newProps.step,
            }),
        });
    };

    _addNewElement: (arg1: React.ChangeEvent<HTMLSelectElement>) => void = (
        e,
    ) => {
        const elementType = e.target.value;
        if (elementType === "") {
            return;
        }
        e.target.value = "";

        // Build options based on element type
        const getDefaultOptions = (): Record<string, unknown> => {
            switch (elementType) {
                case "point":
                    return _.clone(PointEditor.defaultProps);
                case "line":
                    return _.clone(LineEditor.defaultProps);
                case "movable-point":
                    return _.clone(MovablePointEditor.defaultProps);
                case "movable-line":
                    return _.clone(MovableLineEditor.defaultProps);
                case "function":
                    return _.clone(FunctionEditor.defaultProps);
                case "parametric":
                    return _.clone(ParametricEditor.defaultProps);
                case "label":
                    return _.clone(LabelEditor.defaultProps);
                case "rectangle":
                    return _.clone(RectangleEditor.defaultProps);
                default:
                    return {};
            }
        };

        const options = getDefaultOptions();

        // Set subscripts/function names for dynamic elements
        if (elementType === "movable-point") {
            const nextSubscript =
                _.max([_.max(this.state.usedVarSubscripts), -1]) + 1;
            options.varSubscript = nextSubscript;
        } else if (elementType === "movable-line") {
            const nextSubscript =
                _.max([_.max(this.state.usedVarSubscripts), -1]) + 1;
            options.startSubscript = nextSubscript;
            options.endSubscript = nextSubscript + 1;
        } else if (elementType === "function") {
            // TODO(eater): The 22nd function added will be {(x) since '{'
            // comes after 'z'
            const nextLetter = String.fromCharCode(
                _.max([
                    _.max(
                        _.map(this.state.usedFunctionNames, function (c) {
                            return c.charCodeAt(0);
                        }),
                    ),
                    "e".charCodeAt(0),
                ]) + 1,
            );
            options.funcName = nextLetter;
        }

        const newElement = {
            type: elementType,
            key:
                elementType +
                "-" +
                // eslint-disable-next-line no-restricted-properties
                ((Math.random() * 0xffffff) << 0).toString(16),
            options,
        };
        this.change({
            elements: this.props.elements.concat(newElement),
        });
    };

    _deleteElement: (arg1: number) => void = (index) => {
        const element = this.props.elements[index];
        this.change({elements: _.without(this.props.elements, element)});
    };

    _moveElementUp: (arg1: number) => void = (index) => {
        const element = this.props.elements[index];
        const newElements = _.without(this.props.elements, element);
        newElements.splice(index - 1, 0, element);
        this.change({elements: newElements});
    };

    _moveElementDown: (arg1: number) => void = (index) => {
        const element = this.props.elements[index];
        const newElements = _.without(this.props.elements, element);
        newElements.splice(index + 1, 0, element);
        this.change({elements: newElements});
    };

    /**
     * Handle element options change - common pattern for all element editors
     */
    _handleElementChange = (
        index: number,
        newProps: Record<string, unknown>,
    ): void => {
        const elements = JSON.parse(JSON.stringify(this.props.elements));
        _.extend(elements[index].options, newProps);
        this.change({elements: elements});
    };

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
        const {TeX} = getDependencies();

        return (
            <div className="perseus-widget-interaction-editor">
                <ElementContainer title="Grid settings">
                    <GraphSettings
                        editableSettings={["canvas", "graph"]}
                        box={this.props.graph.box}
                        labels={this.props.graph.labels}
                        range={this.props.graph.range}
                        step={this.props.graph.tickStep}
                        gridStep={this.props.graph.gridStep}
                        markings={this.props.graph.markings}
                        onChange={this._updateGraphProps}
                    />
                    <>
                        {this.props.graph.valid !== true && (
                            <div>{this.props.graph.valid}</div>
                        )}
                    </>
                </ElementContainer>
                {this.props.elements.map((element, n) => {
                    if (element.type === "movable-point") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Movable point{" "}
                                        <TeX>
                                            {"(x_{" +
                                                element.options.varSubscript +
                                                "}, y_{" +
                                                element.options.varSubscript +
                                                "})"}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <MovablePointEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "movable-line") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Movable line{" "}
                                        <TeX>
                                            {"(x_{" +
                                                element.options.startSubscript +
                                                "}, y_{" +
                                                element.options.startSubscript +
                                                "})"}
                                        </TeX>{" "}
                                        to{" "}
                                        <TeX>
                                            {"(x_{" +
                                                element.options.endSubscript +
                                                "}, y_{" +
                                                element.options.endSubscript +
                                                "})"}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <MovableLineEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "point") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Point{" "}
                                        <TeX>
                                            {"(" +
                                                element.options.coordX +
                                                ", " +
                                                element.options.coordY +
                                                ")"}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <PointEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "line") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Line{" "}
                                        <TeX>
                                            {"(" +
                                                element.options.startX +
                                                ", " +
                                                element.options.startY +
                                                ")"}
                                        </TeX>{" "}
                                        to{" "}
                                        <TeX>
                                            {"(" +
                                                element.options.endX +
                                                ", " +
                                                element.options.endY +
                                                ")"}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <LineEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "function") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Function{" "}
                                        <TeX>
                                            {element.options.funcName +
                                                "(x) = " +
                                                element.options.value}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <FunctionEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "parametric") {
                        return (
                            <ElementContainer
                                title={<span>Parametric</span>}
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <ParametricEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "label") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Label{" "}
                                        <TeX>
                                            {unescapeMathMode(
                                                element.options.label,
                                            )}
                                        </TeX>{" "}
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <LabelEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    if (element.type === "rectangle") {
                        return (
                            <ElementContainer
                                title={
                                    <span>
                                        Rectangle{" "}
                                        <TeX>
                                            {"(" +
                                                element.options.coordX +
                                                ", " +
                                                element.options.coordY +
                                                ")"}
                                        </TeX>
                                        &nbsp;&mdash;&nbsp;
                                        <TeX>
                                            {element.options.width +
                                                " \\times " +
                                                element.options.height}
                                        </TeX>
                                    </span>
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onUp={
                                    n === 0
                                        ? null
                                        : () => this._moveElementUp(n)
                                }
                                // eslint-disable-next-line react/jsx-no-bind
                                onDown={
                                    n === this.props.elements.length - 1
                                        ? null
                                        : () => this._moveElementDown(n)
                                }
                                onDelete={() => this._deleteElement(n)}
                                key={element.key}
                            >
                                <RectangleEditor
                                    {...element.options}
                                    onChange={(newProps) =>
                                        this._handleElementChange(n, newProps)
                                    }
                                />
                            </ElementContainer>
                        );
                    }
                    return null;
                })}
                <div className="perseus-widget-interaction-editor-select-element">
                    <select onChange={this._addNewElement}>
                        <option value="">Add an element{"\u2026"}</option>
                        <option disabled>--</option>
                        <option value="point">Point</option>
                        <option value="line">Line segment</option>
                        <option value="function">Function plot</option>
                        <option value="parametric">Parametric plot</option>
                        <option value="label">Label</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="movable-point">
                            &#x2605; Movable point
                        </option>
                        <option value="movable-line">
                            &#x2605; Movable line segment
                        </option>
                    </select>
                </div>
            </div>
        );
        /* eslint-enable max-len */
    }
}

export default InteractionEditor;
