import * as React from "react";
import {action} from "storybook/actions";

import ViewportResizer from "../viewport-resizer";

import type {DeviceType} from "@ethosengine/sophia";
import type {Meta, StoryFn} from "@storybook/react-vite";

const meta: Meta<typeof ViewportResizer> = {
    component: ViewportResizer,
    title: "PerseusEditor/Components/Viewport Resizer",
};

export default meta;
type Story = StoryFn<typeof ViewportResizer>;

export const Controlled: Story = () => {
    const [deviceType, setDeviceType] = React.useState<DeviceType>("phone");
    return (
        <ViewportResizer
            deviceType={deviceType}
            onViewportSizeChanged={(newDeviceType) => {
                action("onViewportSizeChanged")(newDeviceType);
                setDeviceType(newDeviceType);
            }}
        />
    );
};
