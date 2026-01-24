import {create} from "storybook/theming";

export default create({
    base: "light",

    // Brand
    brandTitle: "Sophia",
    brandUrl: "/",
    brandImage: "/sophia-logo.svg",
    brandTarget: "_self",

    // Note can't use WonderBlocks semantic colors here.
    appBg: "#f7f8fa", // offWhite
    colorSecondary: "#1865f2", // blue

    // Typography
    fontBase: '"Lato", sans-serif',
    fontCode: "Inconsolata",

    // Text colors
    textColor: "#21242c", // offBlack
});
