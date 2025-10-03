import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { LighthousePanel } from './Panel';

const ADDON_ID = 'lighthouse';
const PANEL_ID = `${ADDON_ID}/panel`;

// Only register the addon in development mode
// This is controlled by the STORYBOOK_LIGHTHOUSE_ENABLED environment variable
// which is set to 'true' in development and 'false' in production (see main.ts)
const isEnabled = process.env.STORYBOOK_LIGHTHOUSE_ENABLED === 'true';

if (isEnabled) {
  // Register the addon
  addons.register(ADDON_ID, () => {
    // Register the panel
    addons.add(PANEL_ID, {
      type: types.PANEL,
      title: 'Lighthouse',
      match: ({ viewMode }) => viewMode === 'story',
      render: ({ active }) => React.createElement(LighthousePanel, { active: active ?? false }),
    });
  });
}
