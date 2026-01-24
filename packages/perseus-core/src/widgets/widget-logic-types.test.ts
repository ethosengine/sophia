/**
 * Type tests for widget logic exports.
 *
 * These tests verify that widget logic exports have properly typed
 * defaultWidgetOptions that match their respective interface types.
 * If the file compiles, the types are correct.
 */
import {
    categorizerLogic,
    csProgramLogic,
    definitionLogic,
    dropdownLogic,
    explanationLogic,
    expressionLogic,
    freeResponseLogic,
    gradedGroupLogic,
    gradedGroupSetLogic,
    grapherLogic,
    groupLogic,
    iframeLogic,
    imageLogic,
    inputNumberLogic,
    interactionLogic,
    interactiveGraphLogic,
    labelImageLogic,
    matcherLogic,
    matrixLogic,
    measurerLogic,
    numberLineLogic,
    numericInputLogic,
    ordererLogic,
    passageLogic,
    passageRefLogic,
    passageRefTargetLogic,
    phetSimulationLogic,
    plotterLogic,
    pythonProgramLogic,
    radioLogic,
    sorterLogic,
    tableLogic,
    videoLogic,
} from "../index";

import type {
    CategorizerDefaultWidgetOptions,
    CSProgramDefaultWidgetOptions,
    DefinitionDefaultWidgetOptions,
    DropdownDefaultWidgetOptions,
    ExplanationDefaultWidgetOptions,
    ExpressionDefaultWidgetOptions,
    FreeResponseDefaultWidgetOptions,
    GradedGroupDefaultWidgetOptions,
    GradedGroupSetDefaultWidgetOptions,
    GrapherDefaultWidgetOptions,
    GroupDefaultWidgetOptions,
    IFrameDefaultWidgetOptions,
    ImageDefaultWidgetOptions,
    InputNumberDefaultWidgetOptions,
    InteractionDefaultWidgetOptions,
    InteractiveGraphDefaultWidgetOptions,
    LabelImageDefaultWidgetOptions,
    MatcherDefaultWidgetOptions,
    MatrixDefaultWidgetOptions,
    MeasurerDefaultWidgetOptions,
    NumberLineDefaultWidgetOptions,
    NumericInputDefaultWidgetOptions,
    OrdererDefaultWidgetOptions,
    PassageDefaultWidgetOptions,
    PassageRefDefaultWidgetOptions,
    PassageRefTargetDefaultWidgetOptions,
    PhetSimulationDefaultWidgetOptions,
    PlotterDefaultWidgetOptions,
    PythonProgramDefaultWidgetOptions,
    RadioDefaultWidgetOptions,
    SorterDefaultWidgetOptions,
    TableDefaultWidgetOptions,
    VideoDefaultWidgetOptions,
} from "../index";

describe("Widget Logic Types", () => {
    describe("defaultWidgetOptions type assignments", () => {
        // These tests verify compile-time type safety.
        // If the assignment compiles without error, the type is correct.

        it("categorizerLogic has correctly typed defaultWidgetOptions", () => {
            const options: CategorizerDefaultWidgetOptions =
                categorizerLogic.defaultWidgetOptions;
            expect(options.items).toBeDefined();
            expect(options.categories).toBeDefined();
        });

        it("csProgramLogic has correctly typed defaultWidgetOptions", () => {
            const options: CSProgramDefaultWidgetOptions =
                csProgramLogic.defaultWidgetOptions;
            expect(options.programID).toBeDefined();
        });

        it("definitionLogic has correctly typed defaultWidgetOptions", () => {
            const options: DefinitionDefaultWidgetOptions =
                definitionLogic.defaultWidgetOptions;
            expect(options.togglePrompt).toBeDefined();
            expect(options.definition).toBeDefined();
        });

        it("dropdownLogic has correctly typed defaultWidgetOptions", () => {
            const options: DropdownDefaultWidgetOptions =
                dropdownLogic.defaultWidgetOptions;
            expect(options.placeholder).toBeDefined();
            expect(options.choices).toBeDefined();
        });

        it("explanationLogic has correctly typed defaultWidgetOptions", () => {
            const options: ExplanationDefaultWidgetOptions =
                explanationLogic.defaultWidgetOptions;
            expect(options.showPrompt).toBeDefined();
            expect(options.hidePrompt).toBeDefined();
        });

        it("expressionLogic has correctly typed defaultWidgetOptions", () => {
            const options: ExpressionDefaultWidgetOptions =
                expressionLogic.defaultWidgetOptions;
            expect(options.answerForms).toBeDefined();
            expect(options.buttonSets).toBeDefined();
        });

        it("freeResponseLogic has correctly typed defaultWidgetOptions", () => {
            const options: FreeResponseDefaultWidgetOptions =
                freeResponseLogic.defaultWidgetOptions;
            expect(options.placeholder).toBeDefined();
        });

        it("gradedGroupLogic has correctly typed defaultWidgetOptions", () => {
            const options: GradedGroupDefaultWidgetOptions =
                gradedGroupLogic.defaultWidgetOptions;
            expect(options.title).toBeDefined();
            expect(options.content).toBeDefined();
        });

        it("gradedGroupSetLogic has correctly typed defaultWidgetOptions", () => {
            const options: GradedGroupSetDefaultWidgetOptions =
                gradedGroupSetLogic.defaultWidgetOptions;
            expect(options.gradedGroups).toBeDefined();
        });

        it("grapherLogic has correctly typed defaultWidgetOptions", () => {
            const options: GrapherDefaultWidgetOptions =
                grapherLogic.defaultWidgetOptions;
            expect(options.graph).toBeDefined();
            expect(options.correct).toBeDefined();
        });

        it("groupLogic has correctly typed defaultWidgetOptions", () => {
            const options: GroupDefaultWidgetOptions =
                groupLogic.defaultWidgetOptions;
            expect(options.content).toBeDefined();
            expect(options.widgets).toBeDefined();
        });

        it("iframeLogic has correctly typed defaultWidgetOptions", () => {
            const options: IFrameDefaultWidgetOptions =
                iframeLogic.defaultWidgetOptions;
            expect(options.url).toBeDefined();
            expect(options.width).toBeDefined();
        });

        it("imageLogic has correctly typed defaultWidgetOptions", () => {
            const options: ImageDefaultWidgetOptions =
                imageLogic.defaultWidgetOptions;
            expect(options.title).toBeDefined();
            expect(options.backgroundImage).toBeDefined();
        });

        it("inputNumberLogic has correctly typed defaultWidgetOptions", () => {
            const options: InputNumberDefaultWidgetOptions =
                inputNumberLogic.defaultWidgetOptions;
            expect(options.value).toBeDefined();
            expect(options.simplify).toBeDefined();
        });

        it("interactionLogic has correctly typed defaultWidgetOptions", () => {
            const options: InteractionDefaultWidgetOptions =
                interactionLogic.defaultWidgetOptions;
            expect(options.graph).toBeDefined();
            expect(options.elements).toBeDefined();
        });

        it("interactiveGraphLogic has correctly typed defaultWidgetOptions", () => {
            const options: InteractiveGraphDefaultWidgetOptions =
                interactiveGraphLogic.defaultWidgetOptions;
            expect(options.labels).toBeDefined();
            expect(options.range).toBeDefined();
        });

        it("labelImageLogic has correctly typed defaultWidgetOptions", () => {
            const options: LabelImageDefaultWidgetOptions =
                labelImageLogic.defaultWidgetOptions;
            expect(options.choices).toBeDefined();
            expect(options.markers).toBeDefined();
        });

        it("matcherLogic has correctly typed defaultWidgetOptions", () => {
            const options: MatcherDefaultWidgetOptions =
                matcherLogic.defaultWidgetOptions;
            expect(options.left).toBeDefined();
            expect(options.right).toBeDefined();
        });

        it("matrixLogic has correctly typed defaultWidgetOptions", () => {
            const options: MatrixDefaultWidgetOptions =
                matrixLogic.defaultWidgetOptions;
            expect(options.matrixBoardSize).toBeDefined();
            expect(options.answers).toBeDefined();
        });

        it("measurerLogic has correctly typed defaultWidgetOptions", () => {
            const options: MeasurerDefaultWidgetOptions =
                measurerLogic.defaultWidgetOptions;
            expect(options.box).toBeDefined();
            expect(options.showRuler).toBeDefined();
        });

        it("numberLineLogic has correctly typed defaultWidgetOptions", () => {
            const options: NumberLineDefaultWidgetOptions =
                numberLineLogic.defaultWidgetOptions;
            expect(options.range).toBeDefined();
            expect(options.labelRange).toBeDefined();
        });

        it("numericInputLogic has correctly typed defaultWidgetOptions", () => {
            const options: NumericInputDefaultWidgetOptions =
                numericInputLogic.defaultWidgetOptions;
            expect(options.answers).toBeDefined();
            expect(options.size).toBeDefined();
        });

        it("ordererLogic has correctly typed defaultWidgetOptions", () => {
            const options: OrdererDefaultWidgetOptions =
                ordererLogic.defaultWidgetOptions;
            expect(options.correctOptions).toBeDefined();
            expect(options.layout).toBeDefined();
        });

        it("passageLogic has correctly typed defaultWidgetOptions", () => {
            const options: PassageDefaultWidgetOptions =
                passageLogic.defaultWidgetOptions;
            expect(options.passageTitle).toBeDefined();
            expect(options.passageText).toBeDefined();
        });

        it("passageRefLogic has correctly typed defaultWidgetOptions", () => {
            const options: PassageRefDefaultWidgetOptions =
                passageRefLogic.defaultWidgetOptions;
            expect(options.passageNumber).toBeDefined();
            expect(options.referenceNumber).toBeDefined();
        });

        it("passageRefTargetLogic has correctly typed defaultWidgetOptions", () => {
            const options: PassageRefTargetDefaultWidgetOptions =
                passageRefTargetLogic.defaultWidgetOptions;
            expect(options.content).toBeDefined();
        });

        it("phetSimulationLogic has correctly typed defaultWidgetOptions", () => {
            const options: PhetSimulationDefaultWidgetOptions =
                phetSimulationLogic.defaultWidgetOptions;
            expect(options.url).toBeDefined();
            expect(options.description).toBeDefined();
        });

        it("plotterLogic has correctly typed defaultWidgetOptions", () => {
            const options: PlotterDefaultWidgetOptions =
                plotterLogic.defaultWidgetOptions;
            expect(options.type).toBeDefined();
            expect(options.categories).toBeDefined();
        });

        it("pythonProgramLogic has correctly typed defaultWidgetOptions", () => {
            const options: PythonProgramDefaultWidgetOptions =
                pythonProgramLogic.defaultWidgetOptions;
            expect(options.programID).toBeDefined();
            expect(options.height).toBeDefined();
        });

        it("radioLogic has correctly typed defaultWidgetOptions", () => {
            const options: RadioDefaultWidgetOptions =
                radioLogic.defaultWidgetOptions;
            expect(options.choices).toBeDefined();
            expect(options.randomize).toBeDefined();
        });

        it("sorterLogic has correctly typed defaultWidgetOptions", () => {
            const options: SorterDefaultWidgetOptions =
                sorterLogic.defaultWidgetOptions;
            expect(options.correct).toBeDefined();
            expect(options.layout).toBeDefined();
        });

        it("tableLogic has correctly typed defaultWidgetOptions", () => {
            const options: TableDefaultWidgetOptions =
                tableLogic.defaultWidgetOptions;
            expect(options.headers).toBeDefined();
            expect(options.rows).toBeDefined();
        });

        it("videoLogic has correctly typed defaultWidgetOptions", () => {
            const options: VideoDefaultWidgetOptions =
                videoLogic.defaultWidgetOptions;
            expect(options.location).toBeDefined();
        });
    });

    describe("defaultWidgetOptions are non-optional", () => {
        // These tests verify that defaultWidgetOptions is not undefined
        // (which was the original type error we fixed)

        it("all widget logic exports have non-undefined defaultWidgetOptions", () => {
            expect(categorizerLogic.defaultWidgetOptions).toBeDefined();
            expect(csProgramLogic.defaultWidgetOptions).toBeDefined();
            expect(definitionLogic.defaultWidgetOptions).toBeDefined();
            expect(dropdownLogic.defaultWidgetOptions).toBeDefined();
            expect(explanationLogic.defaultWidgetOptions).toBeDefined();
            expect(expressionLogic.defaultWidgetOptions).toBeDefined();
            expect(freeResponseLogic.defaultWidgetOptions).toBeDefined();
            expect(gradedGroupLogic.defaultWidgetOptions).toBeDefined();
            expect(gradedGroupSetLogic.defaultWidgetOptions).toBeDefined();
            expect(grapherLogic.defaultWidgetOptions).toBeDefined();
            expect(groupLogic.defaultWidgetOptions).toBeDefined();
            expect(iframeLogic.defaultWidgetOptions).toBeDefined();
            expect(imageLogic.defaultWidgetOptions).toBeDefined();
            expect(inputNumberLogic.defaultWidgetOptions).toBeDefined();
            expect(interactionLogic.defaultWidgetOptions).toBeDefined();
            expect(interactiveGraphLogic.defaultWidgetOptions).toBeDefined();
            expect(labelImageLogic.defaultWidgetOptions).toBeDefined();
            expect(matcherLogic.defaultWidgetOptions).toBeDefined();
            expect(matrixLogic.defaultWidgetOptions).toBeDefined();
            expect(measurerLogic.defaultWidgetOptions).toBeDefined();
            expect(numberLineLogic.defaultWidgetOptions).toBeDefined();
            expect(numericInputLogic.defaultWidgetOptions).toBeDefined();
            expect(ordererLogic.defaultWidgetOptions).toBeDefined();
            expect(passageLogic.defaultWidgetOptions).toBeDefined();
            expect(passageRefLogic.defaultWidgetOptions).toBeDefined();
            expect(passageRefTargetLogic.defaultWidgetOptions).toBeDefined();
            expect(phetSimulationLogic.defaultWidgetOptions).toBeDefined();
            expect(plotterLogic.defaultWidgetOptions).toBeDefined();
            expect(pythonProgramLogic.defaultWidgetOptions).toBeDefined();
            expect(radioLogic.defaultWidgetOptions).toBeDefined();
            expect(sorterLogic.defaultWidgetOptions).toBeDefined();
            expect(tableLogic.defaultWidgetOptions).toBeDefined();
            expect(videoLogic.defaultWidgetOptions).toBeDefined();
        });
    });
});
