/**
 * PurposeSelector Component
 *
 * A radio button group for selecting assessment purpose (mastery, discovery, reflection).
 * Used in mode-aware editors to configure the assessment type.
 */
import {View} from "@khanacademy/wonder-blocks-core";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import {spacing, color} from "@khanacademy/wonder-blocks-tokens";
import {
    LabelMedium,
    LabelSmall,
    Body,
} from "@khanacademy/wonder-blocks-typography";
import {StyleSheet, css} from "aphrodite";
import * as React from "react";

import type {AssessmentPurpose} from "@ethosengine/sophia-core";

type PurposeOption = {
    value: AssessmentPurpose;
    label: string;
    description: string;
    icon: string;
};

const PURPOSE_OPTIONS: PurposeOption[] = [
    {
        value: "mastery",
        label: "Mastery",
        description: "Graded exercises with correct answers",
        icon: "\u2713", // checkmark
    },
    {
        value: "discovery",
        label: "Discovery",
        description: "Resonance/affinity mapping without right answers",
        icon: "\u2728", // sparkles (compass alternative)
    },
    {
        value: "reflection",
        label: "Reflection",
        description: "Psychometric instruments for self-assessment",
        icon: "\u263A", // smiley (mirror alternative)
    },
];

type Props = {
    /** Currently selected purpose */
    value: AssessmentPurpose;
    /** Callback when purpose changes */
    onChange: (purpose: AssessmentPurpose) => void;
    /** Whether the selector is disabled */
    disabled?: boolean;
    /** Compact mode - single row without descriptions */
    compact?: boolean;
};

const PurposeSelector = (props: Props): React.ReactElement => {
    const {value, onChange, disabled = false, compact = false} = props;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value as AssessmentPurpose);
    };

    return (
        <View style={styles.container}>
            <LabelMedium style={styles.label}>Assessment Purpose</LabelMedium>
            <Strut size={spacing.xSmall_8} />
            <View
                style={compact ? styles.optionsRowCompact : styles.optionsRow}
            >
                {PURPOSE_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className={css(
                            styles.option,
                            compact && styles.optionCompact,
                            value === option.value && styles.optionSelected,
                            disabled && styles.optionDisabled,
                        )}
                    >
                        <input
                            type="radio"
                            name="assessment-purpose"
                            value={option.value}
                            checked={value === option.value}
                            onChange={handleChange}
                            disabled={disabled}
                            className={css(styles.radio)}
                        />
                        <View style={styles.optionContent}>
                            <View style={styles.optionHeader}>
                                <span className={css(styles.icon)}>
                                    {option.icon}
                                </span>
                                <LabelSmall style={styles.optionLabel}>
                                    {option.label}
                                </LabelSmall>
                            </View>
                            {!compact && (
                                <Body
                                    style={[
                                        styles.optionDescription,
                                        value === option.value &&
                                            styles.optionDescriptionSelected,
                                    ]}
                                >
                                    {option.description}
                                </Body>
                            )}
                        </View>
                    </label>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.medium_16,
    },
    label: {
        marginBottom: spacing.xxSmall_6,
    },
    optionsRow: {
        flexDirection: "row",
        gap: spacing.small_12,
        flexWrap: "wrap",
    },
    optionsRowCompact: {
        flexDirection: "row",
        gap: spacing.xSmall_8,
    },
    option: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        padding: spacing.small_12,
        borderRadius: spacing.xSmall_8,
        border: `1px solid ${color.offBlack16}`,
        cursor: "pointer",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        minWidth: 160,
        ":hover": {
            borderColor: color.offBlack32,
            backgroundColor: color.offBlack8,
        },
    },
    optionCompact: {
        minWidth: "auto",
        padding: spacing.xSmall_8,
    },
    optionSelected: {
        borderColor: color.blue,
        backgroundColor: color.fadedBlue8,
        ":hover": {
            borderColor: color.blue,
            backgroundColor: color.fadedBlue8,
        },
    },
    optionDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        ":hover": {
            borderColor: color.offBlack16,
            backgroundColor: "transparent",
        },
    },
    optionContent: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xxSmall_6,
    },
    icon: {
        fontSize: 16,
    },
    optionLabel: {
        fontWeight: 600,
    },
    optionDescription: {
        marginTop: spacing.xxSmall_6,
        fontSize: 12,
        color: color.offBlack64,
    },
    optionDescriptionSelected: {
        color: color.offBlack,
    },
    radio: {
        // Visually hidden but still accessible
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        border: 0,
    },
});

export default PurposeSelector;
