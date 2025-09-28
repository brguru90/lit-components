import fs from "fs"



export const fix_react_utils = () => {
    const new_utils = `import { useEffect, useLayoutEffect } from "react";

export function useProperties(targetElement, propName, value) {
  useEffect(() => {
    if (
      value !== undefined &&
      targetElement.current &&
      targetElement.current[propName] !== value
    ) {
      // add try catch to avoid errors when setting read-only properties
      try {
        targetElement.current[propName] = value;
      } catch (e) {
        console.warn(e);
      }
    }
  }, [value, targetElement.current]);
}

export function useEventListener(targetElement, eventName, eventHandler) {
  useLayoutEffect(() => {
    const el = targetElement?.current;
    if (eventHandler !== undefined) {
      el?.addEventListener(eventName, eventHandler);
    }

    return () => {
      if (eventHandler?.cancel) {
        eventHandler.cancel();
      }

      el?.removeEventListener(eventName, eventHandler);
    };
  }, [eventName, eventHandler, targetElement.current]);
}
`

    fs.writeFile('dist/react/react-utils.js', new_utils, 'utf8', (err) => {
        if (err) {
            console.error('Failed to update React utils:', err);
        } else {
            console.log('React utils updated!');
        }
    });
}