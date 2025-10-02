const LIGHTHOUSE_EVENT = 'lighthouse/results';
const RUN_LIGHTHOUSE_EVENT = 'lighthouse/run';

// Use global channel when available
const getChannel = () => {
  if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS_CHANNEL__) {
    return (window as any).__STORYBOOK_ADDONS_CHANNEL__;
  }
  return null;
};

// Initialize listener when window is ready
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const channel = getChannel();
    if (!channel) {
      console.warn('Lighthouse addon: Channel not available');
      return;
    }
    
    // Listen for run requests from the panel
    channel.on(RUN_LIGHTHOUSE_EVENT, async (data: { storyId: string }) => {
      console.log('🔦 Running Lighthouse audit for story:', data.storyId);
      
      try {
        // Get the current story URL
        const storyUrl = window.location.href;
        
        // Run Lighthouse audit
        const results = await runLighthouseAudit(storyUrl);
        
        // Send results back to the panel
        channel.emit(LIGHTHOUSE_EVENT, results);
      } catch (error) {
        console.error('Error running Lighthouse:', error);
        channel.emit(LIGHTHOUSE_EVENT, {
          error: error instanceof Error ? error.message : 'Unknown error',
          scores: { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 }
        });
      }
    });
  });
}

// Function to run Lighthouse audit
async function runLighthouseAudit(url: string) {
  const apiUrl = 'http://localhost:9002/api/lighthouse';
  console.log(`🔦 Calling Lighthouse API at ${apiUrl}...`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const results = await response.json();
    console.log('✅ Real Lighthouse results received:', results);
    return results;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('❌ Lighthouse API failed:', errorMessage);
    
    // Return error result that will be displayed in the UI
    throw new Error(
      `Failed to run Lighthouse audit.\n\n` +
      `Error: ${errorMessage}\n\n` +
      `Make sure the Lighthouse API server is running:\n` +
      `npm run lighthouse:api`
    );
  }
}

// Export for use in stories if needed
export const triggerLighthouseAudit = () => {
  const channel = getChannel();
  if (channel) {
    const storyId = new URLSearchParams(window.location.search).get('id') || 'unknown';
    channel.emit(RUN_LIGHTHOUSE_EVENT, { storyId });
  }
};
