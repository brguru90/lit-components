import React from "react";
import { PropsWithChildren } from "react";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { ThemeMode } from "./themes";
import { themes } from "./themes";

export const ThemedDocsContainer = (props: PropsWithChildren<any>) => {
  console.log("ThemedDocsContainer");
  const theme: ThemeMode =
    props?.context?.store?.userGlobals?.globals?.theme || "dark";
  const docsTheme = themes[theme];
  
  return (
    <DocsContainer {...props} theme={docsTheme}>
      {props.children}
    </DocsContainer>
  );
};
