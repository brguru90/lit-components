import { generateCustomData } from "cem-plugin-vs-code-custom-data-generator";
import { customElementVsCodePlugin } from "custom-element-vs-code-integration";
import { customElementReactWrapperPlugin } from "custom-element-react-wrappers";
import { getTsProgram, expandTypesPlugin } from "cem-plugin-expanded-types";
import reactify from "cem-plugin-reactify";

export default {
  globs: ["src/**/*.{js,ts}"],
  exclude: ["node_modules", "dist", "public", "types"],
  outdir: "dist",
  litelement: true,
  packagejson: true,
  dev: false,
  fast: false,
  stencil: false,
  catalyst: false,
  plugins: [
    customElementReactWrapperPlugin({
      outdir: "dist/react",
      modulePath: (className, tagName) => `../index.js`,
      attributeMapping: {
        for: "_for",
      },
      ssrSafe: false,
      reactProps:true,
    }),
    // reactify({
    //   outdir: "dist/react2",
    //   attributeMapping: {
    //     for: "_for",
    //   },
    // }),
    // generateCustomData({
    //   outdir: "dist",
    //   htmlFileName: "vg.html-custom-data.json",
    //   cssFileName: "vg.css-custom-data.json",
    //   descriptionSrc: "description",
    //   slotDocs: true,
    //   eventDocs: true,
    //   cssPropertiesDocs: true,
    //   cssPartsDocs: true,
    //   methodDocs: true,
    // }),
    customElementVsCodePlugin({
      outdir: "dist",
      htmlFileName: "vg.html-custom-data.json",
      cssFileName: "vg.css-custom-data.json",
      descriptionSrc: "description",
    }),
    expandTypesPlugin({ propertyName: "type" }),
  ],
  overrideModuleCreation: ({ts, globs}) => {
    const program = getTsProgram(ts, globs, "tsconfig-module.json");
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },
};
