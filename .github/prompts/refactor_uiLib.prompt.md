---
mode: agent
---
# Can you refactor Lit ui-library to proper setup, which implements following,
- make sure you are using Lit v3 (https://lit.dev/docs/)
- don't create new project/workspace, but refactor existing code in this project
- you will be using typescript
- use vite as build tool
- all the code should be in /src folder and remaining files like vite config, package.json etc should be in root folder

### ThemeProvider and css styles:
- for now implement four types of theme like dark, light, glass, cartoon
- default theme mode will be dark mode
- to easily manage app themes from single place
- if theme is set to light mode, then it should switch to light mode for all the components and it should use the pre-declared css variables for light mode,
- you can use scss to programmatically generate css variable with respective color using the loop provided by scss
- dark, light, glass or any etc mode will share same css variable like 
  ```
  --vg-text-color, --vg-text-color-disabled,--vg-text-color-primary --vg-text-color-secondary, --vg-text-color-tertiary, --vg-background-color, --vg-background-color-primary, --vg-background-color-secondary, --vg-background-color-tertiary
  ```
  so i use --vg-text-color, but theme provide should automatically manage its values based on theme,
  may be you can wrap these css like,
    ```
    .vg-theme-dark {
      --vg-text-color: #fff;
      --vg-background-color: #000;
      ...
    }
    .vg-theme-light {
      --vg-text-color: #000;
      --vg-background-color: #fff;
      ...
    }
    .vg-theme-glass {
      --vg-text-color: rgba(255, 255, 255, 0.8);
      --vg-background-color: rgba(0, 0, 0, 0.3);
      ...
    }
    ```
- also predefine(or programmatically generate using scss) font size, margins,padding,border-color,shadow, etc 

### Create few reusable ui-rich components like button, card, input,dropdown etc:
- which should use the theme provider
- components should be exported
- should be able to import from single file like
  ```
  import {VgButton, VgCard, VgInput} from 'vg/react'
  ```
- add doc strings for components, properties, events, information about slots etc
- create proper types for component props/arguments,events and export them
- for events don't prefix anything, just use event name like 'click', 'change' etc


make sure every component, props, events, types etc should have ts-doc string so it should provide those information in vscode linter and also later it should support to generate documentation out of it