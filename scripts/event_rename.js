// cem-plugin-dynamic-rename-events.mjs
/**
 * cem-plugin-dynamic-rename-events
 *
 * Usage:
 *  import dynamicRenameEvents from './cem-plugin-dynamic-rename-events.mjs';
 *  export default { plugins: [ dynamicRenameEvents({ transform: (name) => name.toLowerCase() }) ] }
 *
 * This plugin mutates the manifest in-place, applying the provided `transform` function to each event name.
 */

export function dynamicRenameEventsPlugin({ transform }) {
  if (typeof transform !== 'function') {
    throw new Error('A valid transform function must be provided.');
  }

  return {
    name: 'cem-plugin-dynamic-rename-events',

    /**
     * packageLinkPhase runs after modules are analyzed and post-processed.
     * We mutate the customElementsManifest to rename event names.
     */
    async packageLinkPhase({ customElementsManifest } = {}) {
      if (!customElementsManifest || !Array.isArray(customElementsManifest.modules)) {
        return;
      }

      for (const moduleDoc of customElementsManifest.modules) {
        if (!moduleDoc?.declarations) continue;

        for (const decl of moduleDoc.declarations) {
          if (!Array.isArray(decl.events)) continue;

          for (const ev of decl.events) {
            const original = ev?.name;
            if (!original) continue;

            const newName = transform(original);
            if (newName && newName !== original) {
              ev.name = newName;
              ev['x-originalName'] = original;

              // Optional: Update description to mention rename
              ev.description = ev.description
                ? `(renamed from "${original}") ${ev.description}`
                : `(renamed from "${original}")`;
            }
          }
        }
      }

      return customElementsManifest;
    },
  };
}
