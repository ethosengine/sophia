/**
 * SubscaleMappingsEditor Component
 *
 * Edits subscale contribution mappings for discovery mode widgets.
 * For radio/dropdown widgets, allows mapping each choice to subscale contributions.
 */
import Button from "@khanacademy/wonder-blocks-button";
import {View} from "@khanacademy/wonder-blocks-core";
import {TextField} from "@khanacademy/wonder-blocks-form";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import {spacing, color} from "@khanacademy/wonder-blocks-tokens";
import {
    LabelMedium,
    LabelSmall,
    Body,
} from "@khanacademy/wonder-blocks-typography";
import {StyleSheet, css} from "aphrodite";
import * as React from "react";
import {useState, useCallback, useMemo} from "react";

import {PREDEFINED_SUBSCALE_SETS, type PredefinedSubscaleSet} from "../types";

import type {
    ChoiceSubscaleMap,
    SubscaleContribution,
} from "@ethosengine/sophia-core";

/**
 * A single choice from a widget that can have subscale mappings.
 */
type WidgetChoice = {
    id: string;
    label: string;
};

type Props = {
    /** Unique widget ID */
    widgetId: string;
    /** Available choices from the widget */
    choices: WidgetChoice[];
    /** Current subscale mappings for this widget */
    mappings: ChoiceSubscaleMap;
    /** Callback when mappings change */
    onChange: (widgetId: string, mappings: ChoiceSubscaleMap) => void;
    /** Available subscale names (from consumer or predefined set) */
    subscaleNames?: string[];
    /** Predefined subscale set to use (if subscaleNames not provided) */
    subscaleSet?: PredefinedSubscaleSet;
    /** Whether to allow adding custom subscales */
    allowCustomSubscales?: boolean;
};

const SubscaleMappingsEditor = (props: Props): React.ReactElement => {
    const {
        widgetId,
        choices,
        mappings,
        onChange,
        subscaleNames: externalSubscaleNames,
        subscaleSet = "elohimDomains",
        allowCustomSubscales = true,
    } = props;

    // Determine active subscale names
    const predefinedNames = PREDEFINED_SUBSCALE_SETS[subscaleSet];
    const [customSubscales, setCustomSubscales] = useState<string[]>([]);
    const [newSubscaleName, setNewSubscaleName] = useState("");

    const activeSubscaleNames = useMemo(
        () => externalSubscaleNames ?? [...predefinedNames, ...customSubscales],
        [externalSubscaleNames, predefinedNames, customSubscales],
    );

    // Handle adding a custom subscale
    const handleAddSubscale = useCallback(() => {
        const trimmed = newSubscaleName.trim().toLowerCase();
        if (
            trimmed &&
            !activeSubscaleNames.includes(trimmed) &&
            !customSubscales.includes(trimmed)
        ) {
            setCustomSubscales([...customSubscales, trimmed]);
            setNewSubscaleName("");
        }
    }, [newSubscaleName, activeSubscaleNames, customSubscales]);

    // Handle removing a custom subscale
    const handleRemoveSubscale = useCallback(
        (subscaleName: string) => {
            setCustomSubscales(
                customSubscales.filter((s) => s !== subscaleName),
            );

            // Also remove from all mappings
            const newMappings = {...mappings};
            for (const choiceId of Object.keys(newMappings)) {
                const contribution = {...newMappings[choiceId]};
                delete contribution[subscaleName];
                newMappings[choiceId] = contribution;
            }
            onChange(widgetId, newMappings);
        },
        [customSubscales, mappings, widgetId, onChange],
    );

    // Handle changing a subscale contribution value
    const handleContributionChange = useCallback(
        (choiceId: string, subscaleName: string, value: number) => {
            const choiceMappings = mappings[choiceId] ?? {};
            const newChoiceMappings: SubscaleContribution = {
                ...choiceMappings,
                [subscaleName]: Math.max(0, Math.min(1, value)),
            };

            // Remove zero values to keep mappings clean
            if (value === 0) {
                delete newChoiceMappings[subscaleName];
            }

            const newMappings: ChoiceSubscaleMap = {
                ...mappings,
                [choiceId]: newChoiceMappings,
            };

            // Remove empty choice mappings
            if (Object.keys(newChoiceMappings).length === 0) {
                delete newMappings[choiceId];
            }

            onChange(widgetId, newMappings);
        },
        [mappings, widgetId, onChange],
    );

    // Get value for a specific choice/subscale combination
    const getContributionValue = (
        choiceId: string,
        subscaleName: string,
    ): number => {
        return mappings[choiceId]?.[subscaleName] ?? 0;
    };

    if (choices.length === 0) {
        return (
            <View style={styles.container}>
                <Body style={styles.emptyMessage}>
                    No choices available to map subscales to.
                </Body>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LabelMedium style={styles.title}>Subscale Mappings</LabelMedium>
            <Body style={styles.description}>
                Set how much each choice contributes to different subscales (0-1
                scale).
            </Body>
            <Strut size={spacing.small_12} />

            {/* Subscale headers */}
            <View style={styles.grid}>
                <View style={styles.choiceHeader}>
                    <LabelSmall>Choice</LabelSmall>
                </View>
                {activeSubscaleNames.map((subscale) => (
                    <View key={subscale} style={styles.subscaleHeader}>
                        <LabelSmall style={styles.subscaleName}>
                            {subscale}
                        </LabelSmall>
                        {customSubscales.includes(subscale) && (
                            <button
                                type="button"
                                className={css(styles.removeButton)}
                                onClick={() => handleRemoveSubscale(subscale)}
                                title="Remove subscale"
                            >
                                x
                            </button>
                        )}
                    </View>
                ))}
            </View>

            {/* Choice rows */}
            {choices.map((choice) => (
                <View key={choice.id} style={styles.choiceRow}>
                    <View style={styles.choiceLabel}>
                        <Body>{choice.label || `Choice ${choice.id}`}</Body>
                    </View>
                    {activeSubscaleNames.map((subscale) => (
                        <View key={subscale} style={styles.inputCell}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={getContributionValue(
                                    choice.id,
                                    subscale,
                                )}
                                onChange={(e) =>
                                    handleContributionChange(
                                        choice.id,
                                        subscale,
                                        parseFloat(e.target.value),
                                    )
                                }
                                className={css(styles.slider)}
                            />
                            <span className={css(styles.sliderValue)}>
                                {getContributionValue(
                                    choice.id,
                                    subscale,
                                ).toFixed(1)}
                            </span>
                        </View>
                    ))}
                </View>
            ))}

            {/* Add custom subscale */}
            {allowCustomSubscales && !externalSubscaleNames && (
                <>
                    <Strut size={spacing.medium_16} />
                    <View style={styles.addSubscaleRow}>
                        <TextField
                            id={`${widgetId}-add-subscale`}
                            value={newSubscaleName}
                            onChange={setNewSubscaleName}
                            placeholder="New subscale name"
                            style={styles.addSubscaleInput}
                        />
                        <Strut size={spacing.xSmall_8} />
                        <Button
                            kind="tertiary"
                            size="small"
                            onClick={handleAddSubscale}
                            disabled={!newSubscaleName.trim()}
                        >
                            Add Subscale
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.medium_16,
        backgroundColor: color.offWhite,
        borderRadius: spacing.xSmall_8,
        marginTop: spacing.small_12,
    },
    title: {
        marginBottom: spacing.xxSmall_6,
    },
    description: {
        fontSize: 13,
        color: color.offBlack64,
    },
    emptyMessage: {
        color: color.offBlack64,
        fontStyle: "italic",
    },
    grid: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderBottom: `1px solid ${color.offBlack16}`,
        paddingBottom: spacing.xSmall_8,
        marginBottom: spacing.xSmall_8,
    },
    choiceHeader: {
        flex: 1,
        minWidth: 120,
    },
    subscaleHeader: {
        width: 100,
        textAlign: "center",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xxSmall_6,
    },
    subscaleName: {
        textTransform: "capitalize",
    },
    removeButton: {
        background: "none",
        border: "none",
        color: color.offBlack50,
        cursor: "pointer",
        fontSize: 12,
        padding: 2,
        ":hover": {
            color: color.red,
        },
    },
    choiceRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: spacing.xxSmall_6,
        paddingBottom: spacing.xxSmall_6,
        borderBottom: `1px solid ${color.offBlack8}`,
    },
    choiceLabel: {
        flex: 1,
        minWidth: 120,
        paddingRight: spacing.xSmall_8,
    },
    inputCell: {
        width: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    slider: {
        width: 80,
        cursor: "pointer",
    },
    sliderValue: {
        fontSize: 11,
        color: color.offBlack64,
        marginTop: 2,
    },
    addSubscaleRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    addSubscaleInput: {
        width: 200,
    },
});

export default SubscaleMappingsEditor;
