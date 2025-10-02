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
  // In a real implementation, this would call a backend service
  // that runs Lighthouse and returns the results
  
  // For development, check if there's a backend service available
  try {
    const response = await fetch('/api/lighthouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // Backend not available, return mock data for demonstration
  }
  
  // Mock data for demonstration
  // In production, remove this and require the backend service
  return simulateLighthouseResults();
}

// Simulate Lighthouse results for demonstration
function simulateLighthouseResults() {
  const performance = Math.floor(Math.random() * 30) + 70;
  const accessibility = Math.floor(Math.random() * 20) + 80;
  const bestPractices = Math.floor(Math.random() * 20) + 75;
  const seo = Math.floor(Math.random() * 20) + 75;
  
  return {
    scores: {
      performance,
      accessibility,
      'best-practices': bestPractices,
      seo,
    },
    thresholds: {
      performance: 70,
      accessibility: 90,
      'best-practices': 80,
      seo: 70,
    },
    metrics: {
      'first-contentful-paint': Math.floor(Math.random() * 1000) + 500,
      'largest-contentful-paint': Math.floor(Math.random() * 1500) + 1000,
      'cumulative-layout-shift': (Math.random() * 0.2).toFixed(3),
      'total-blocking-time': Math.floor(Math.random() * 300) + 100,
      'speed-index': Math.floor(Math.random() * 2000) + 1000,
    },
    audits: [
      {
        title: 'Image elements have explicit width and height',
        description: 'Set explicit width and height on images to reduce layout shift',
        score: 0.8,
        passed: false,
      },
      {
        title: 'Links have descriptive text',
        description: 'Link text should be descriptive to help users understand where the link goes',
        score: 0.6,
        passed: false,
      },
    ].filter(() => Math.random() > 0.5), // Randomly include some failures
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };
}

// Export for use in stories if needed
export const triggerLighthouseAudit = () => {
  const channel = getChannel();
  if (channel) {
    const storyId = new URLSearchParams(window.location.search).get('id') || 'unknown';
    channel.emit(RUN_LIGHTHOUSE_EVENT, { storyId });
  }
};
