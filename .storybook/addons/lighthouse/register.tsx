import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { LighthousePanel } from './Panel';

const ADDON_ID = 'lighthouse';
const PANEL_ID = `${ADDON_ID}/panel`;

// Register the addon
addons.register(ADDON_ID, () => {
  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Lighthouse',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => React.createElement(LighthousePanel, { active }),
  });
});
