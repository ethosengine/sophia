/**
 * Rollup Configuration for sophia-element UMD build
 *
 * This configuration produces a UMD bundle that includes React and ReactDOM,
 * suitable for direct use via <script> tag or CDN.
 */

import path from "path";
import {fileURLToPath} from "url";

import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import url from "@rollup/plugin-url";
import postcss from "rollup-plugin-postcss";
import filesize from "rollup-plugin-filesize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

/**
 * UMD build configuration
 *
 * This build bundles React, ReactDOM, and all dependencies into a single file.
 * Use for direct browser usage without a bundler.
 */
const umdConfig = {
    input: "src/umd-entry.ts",
    output: {
        file: "dist/sophia-element.umd.js",
        format: "umd",
        name: "SophiaElement",
        sourcemap: true,
        globals: {},
        // Provide process shim for browser compatibility (banner runs before entire bundle)
        banner: `if(typeof process==='undefined'){globalThis.process={env:{NODE_ENV:'production'}};}`,
    },
    plugins: [
        url({
            include: ["**/*.svg"],
            limit: Infinity, // Always inline SVGs as data URIs
            fileName: "[name][extname]",
        }),
        replace({
            preventAssignment: true,
            values: {
                // Handle all process.env references for browser compatibility
                "process.env.NODE_ENV": JSON.stringify("production"),
                "process.env.JEST_WORKER_ID": JSON.stringify(""),
                "process.env.DEBUG": JSON.stringify(""),
                "process.env": JSON.stringify({NODE_ENV: "production"}),
                // Fallback for bare process references
                "typeof process": JSON.stringify("undefined"),
                __IS_BROWSER__: true,
            },
        }),
        alias({
            entries: {
                jsdiff: path.join(rootDir, "vendor", "jsdiff"),
                raphael: path.join(rootDir, "vendor", "raphael"),
            },
        }),
        postcss({
            extract: "sophia-element.umd.css",
            minimize: true,
            sourceMap: true,
        }),
        swc({
            swc: {
                jsc: {
                    parser: {
                        syntax: "typescript",
                        tsx: true,
                    },
                    transform: {
                        react: {
                            runtime: "automatic",
                        },
                    },
                },
                minify: true,
            },
            exclude: "node_modules/**",
        }),
        resolve({
            browser: true,
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            preferBuiltins: false,
        }),
        commonjs({
            include: /node_modules/,
            transformMixedEsModules: true,
        }),
        terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
            output: {
                comments: false,
            },
        }),
        filesize(),
    ],
    // Don't externalize anything - bundle everything for UMD
    external: [],
};

/**
 * Minified UMD build
 */
const umdMinConfig = {
    ...umdConfig,
    output: {
        ...umdConfig.output,
        file: "dist/sophia-element.umd.min.js",
    },
};

export default [umdConfig];
