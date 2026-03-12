import {EditorJsonify} from "@ethosengine/sophia";
import * as React from "react";

type Props = {
    min?: number;
    max?: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
    onChange: (options: any) => void;
};

class LikertScaleEditor extends React.Component<Props> {
    static widgetName = "likert-scale" as const;

    static defaultProps = {
        min: 1,
        max: 7,
        step: 1,
        minLabel: "",
        maxLabel: "",
    };

    serialize(): any {
        return EditorJsonify.serialize.call(this);
    }

    render(): React.ReactNode {
        const {min, max, step, minLabel, maxLabel} = this.props;
        return (
            <div>
                <div>
                    <label>
                        Min:{" "}
                        <input
                            type="number"
                            value={min}
                            onChange={(e) =>
                                this.props.onChange({
                                    min: parseInt(e.target.value, 10),
                                })
                            }
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Max:{" "}
                        <input
                            type="number"
                            value={max}
                            onChange={(e) =>
                                this.props.onChange({
                                    max: parseInt(e.target.value, 10),
                                })
                            }
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Step:{" "}
                        <input
                            type="number"
                            value={step}
                            onChange={(e) =>
                                this.props.onChange({
                                    step: parseInt(e.target.value, 10),
                                })
                            }
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Min Label:{" "}
                        <input
                            type="text"
                            value={minLabel}
                            onChange={(e) =>
                                this.props.onChange({
                                    minLabel: e.target.value,
                                })
                            }
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Max Label:{" "}
                        <input
                            type="text"
                            value={maxLabel}
                            onChange={(e) =>
                                this.props.onChange({
                                    maxLabel: e.target.value,
                                })
                            }
                        />
                    </label>
                </div>
            </div>
        );
    }
}

export default LikertScaleEditor;
