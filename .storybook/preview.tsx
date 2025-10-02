import React from "react";
import type { Preview, StoryContext } from "@storybook/web-components-vite";
import { setCustomElementsManifest } from "@storybook/web-components";

// Import all components globally
import "../src/index.ts";

// Import custom elements manifest for automatic controls
import customElements from "../dist/custom-elements.json";

// Import theme configuration and decorators
import { withThemeProvider, globalTypes } from "./decorators";
import { themes } from "./themes";
import { PropsWithChildren } from "react";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { ThemeMode } from "./themes";

const ThemedDocsContainer = (props: PropsWithChildren<any>) => {
  const theme: ThemeMode =
    props?.context?.store?.userGlobals?.globals?.theme || "dark";
  const docsTheme = themes[theme];

  return (
    <DocsContainer {...props} theme={docsTheme}>
      {props.children}
    </DocsContainer>
  );
};

customElements.modules.forEach((mod: any) => {
  mod.declarations.forEach((decl: any) => {
    // decl?.events?.forEach((event: any) => {
    //   if(event["x-originalName"]){
    //     event.name = event["x-originalName"]
    //   }
    // })
    // decl.membersOrig=decl.members
    // decl.members = []
  });
});

// Set the custom elements manifest
setCustomElementsManifest(customElements);

const preview: Preview = {
  parameters: {
    docs: {
      container: ThemedDocsContainer,
      extractComponentDescription: (component: string) => {
        // Extract description from Custom Elements Manifest
        const module = customElements.modules.find((mod: any) =>
          mod.declarations.some((decl: any) => decl.tagName === component)
        );

        if (module) {
          const declaration = module.declarations.find(
            (decl: any) => decl.tagName === component
          );

          if (declaration && declaration.description) {
            return `> ####${component}:\n${declaration.description}`;
          }
        }

        return undefined;
      },
      // source: {
      //   excludeDecorators: true,
      //   type: 'dynamic',
      // },
      source: {
        type: "dynamic",
        excludeDecorators: true,
        transform: (code: string, storyContext: StoryContext) => {
          if (
            storyContext.parameters?.docs?.source?.transformOverride &&
            !storyContext.parameters?.docs?.source?.transform_executed
          ) {
            storyContext.parameters.docs.source.transform_executed = true;
            return storyContext.parameters.docs.source.transform(
              code,
              storyContext
            );
          }

          // Extract component name
          const componentName =
            typeof storyContext.component === "string"
              ? storyContext.component
              : storyContext.componentId?.split("--")[0] ||
                storyContext.title?.split("/").pop()?.toLowerCase() ||
                "component";

          // console.log(storyContext.id, storyContext)

          let attrs = "";

          // Convert args to HTML attributes
          for (let [key, value] of Object.entries(storyContext.args || {})) {
            // if(key.startsWith('on')) continue; // Skip event handlers
            if (typeof value === "object") {
              try {
                value = JSON.stringify(value);
              } catch (error) {}
            }
            if (typeof value === "function") {
              value = `()=>{/* function */}`;
            }
            const attrName = key
              .replace(/([A-Z])/g, "-$1")
              .toLowerCase()
              .replace(/^on-/, "on");

            if (value === true) {
              attrs += `\n  ${attrName}`;
            } else if (
              value !== false &&
              value !== undefined &&
              value !== null
            ) {
              attrs += `\n  ${attrName}="${value}"`;
            }
          }

          return `<${componentName}${attrs}\n>\n</${componentName}>`;
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: "alpha",
    },
    backgrounds: {
      // disable: true, // Disable default backgrounds since we use theme provider
      default: "light",
      values: [
        { name: "light", value: themes.light.appPreviewBg },
        { name: "dark", value: themes.dark.appPreviewBg },
        { name: "glass", value: themes.glass.appPreviewBg },
        { name: "cartoon", value: themes.cartoon.appPreviewBg },
      ],
    },
  },
  // Add global types for theme toolbar
  globalTypes,

  // Add global decorator for theme provider
  decorators: [withThemeProvider],

  tags: ["autodocs"],
};

export default preview;
