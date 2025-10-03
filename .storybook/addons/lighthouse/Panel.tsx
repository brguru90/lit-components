import React, { useEffect, useState, useCallback } from 'react';
import { useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';
import { styled } from 'storybook/theming';
import { DEFAULT_THRESHOLDS, type LighthouseThresholds } from '../../lighthouse-config';

// Styled components
const Container = styled.div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.appBorderColor};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const Button = styled.button`
  background: ${props => props.theme.color.secondary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div<{ score: number; passed: boolean }>`
  background: ${props => props.theme.background.content};
  border: 1px solid ${props => props.theme.appBorderColor};
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => 
      props.passed ? '#0cce6b' : 
      props.score >= 50 ? '#ffa400' : 
      '#ff4e42'
    };
  }
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${props => props.theme.color.mediumdark};
  margin-bottom: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const MetricScore = styled.div<{ score: number; passed: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => 
    props.passed ? '#0cce6b' : 
    props.score >= 50 ? '#ffa400' : 
    '#ff4e42'
  };
  margin-bottom: 0.25rem;
`;

const MetricThreshold = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.color.mediumdark};
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.color.defaultText};
`;

const AuditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AuditItem = styled.div<{ passed: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: ${props => props.theme.background.content};
  border: 1px solid ${props => props.theme.appBorderColor};
  border-radius: 4px;
  border-left: 3px solid ${props => props.passed ? '#0cce6b' : '#ff4e42'};
`;

const AuditIcon = styled.span<{ passed: boolean }>`
  margin-right: 0.75rem;
  font-size: 1.2rem;
  color: ${props => props.passed ? '#0cce6b' : '#ff4e42'};
`;

const AuditContent = styled.div`
  flex: 1;
`;

const AuditTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const AuditDescription = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.color.mediumdark};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.color.mediumdark};
`;

const Spinner = styled.div`
  border: 3px solid ${props => props.theme.appBorderColor};
  border-top: 3px solid ${props => props.theme.color.secondary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.color.mediumdark};
  text-align: center;
  padding: 2rem;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  background: #ff4e4233;
  border: 1px solid #ff4e42;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #ff4e42;
`;

interface LighthouseResults {
  scores: {
    performance: number;
    accessibility: number;
    'best-practices': number;
    seo: number;
  };
  thresholds?: LighthouseThresholds;
  audits?: Array<{
    title: string;
    description?: string;
    score: number;
    passed: boolean;
  }>;
  metrics?: {
    'first-contentful-paint'?: number | string;
    'largest-contentful-paint'?: number | string;
    'cumulative-layout-shift'?: number | string;
    'total-blocking-time'?: number | string;
    'speed-index'?: number | string;
    interactive?: number | string;
  };
  timestamp?: string;
  url?: string;
  cached?: boolean;
  cacheAge?: number;
}

export const LighthousePanel: React.FC<{ active: boolean }> = ({ active }) => {
  const [results, setResults] = useState<LighthouseResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const api = useStorybookApi();
  const state = useStorybookState();

  // Listen for story changes and try to restore cached results
  useEffect(() => {
    const storyId = state.storyId;
    
    // If story changed
    if (currentStoryId && storyId && storyId !== currentStoryId) {
      console.log(`📖 Story changed (${currentStoryId} → ${storyId})`);
      
      // Clear current results
      setResults(null);
      setError(null);
      
      // Try to restore cached results for new story
      fetchCachedResults(storyId);
    } else if (storyId && !currentStoryId) {
      // Initial load - try to restore cache
      fetchCachedResults(storyId);
    }
    
    if (storyId) {
      setCurrentStoryId(storyId);
    }
  }, [state.storyId, currentStoryId]);

  // Fetch cached results without running Lighthouse
  const fetchCachedResults = useCallback(async (storyId: string) => {
    try {
      const baseUrl = window.location.origin;
      const storyUrl = `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`;
      const encodedUrl = encodeURIComponent(storyUrl);
      
      const apiUrl = `http://localhost:9002/api/lighthouse/cache/${encodedUrl}`;
      console.log('🔍 Checking for cached Lighthouse results...');
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Restored cached results (${Math.round(data.cacheAge / 1000)}s old)`);
        setResults(data);
      } else {
        console.log('📭 No cached results found for this story');
      }
    } catch (err) {
      // Silently fail - just means no cache or API not available
      console.log('📭 Could not fetch cached results');
    }
  }, []);

  // Direct API call - no channel communication needed!
  const runLighthouse = useCallback(async (skipCache = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const storyId = api.getUrlState().storyId;
      console.log('🔦 Running Lighthouse audit for story:', storyId, skipCache ? '(forcing fresh audit)' : '');
      
      // Get the story URL - construct from storyId
      const baseUrl = window.location.origin;
      const storyUrl = `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`;
      
      // Call Lighthouse API directly
      const apiUrl = 'http://localhost:9002/api/lighthouse';
      console.log(`🔦 Calling Lighthouse API at ${apiUrl}...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: storyUrl,
          skipCache, // Pass skipCache to API
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Real Lighthouse results received:', data);
      
      // Log if result was cached
      if (data.cached) {
        console.log(`📦 Result from cache (${Math.round(data.cacheAge / 1000)}s old)`);
      }
      
      setResults(data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Lighthouse API failed:', errorMessage);
      
      setError(
        `Failed to run Lighthouse audit.\n\n` +
        `Error: ${errorMessage}\n\n` +
        `Make sure the Lighthouse API server is running:\n` +
        `npm run lighthouse:api`
      );
      setLoading(false);
    }
  }, [api]);

  if (!active) {
    return null;
  }

  if (loading) {
    return (
      <AddonPanel active={active}>
        <LoadingContainer>
          <Spinner />
          <div>Running Lighthouse audit...</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            This may take 10-30 seconds
          </div>
        </LoadingContainer>
      </AddonPanel>
    );
  }

  if (error) {
    return (
      <AddonPanel active={active}>
        <Container>
          <ErrorContainer>
            <strong>Error:</strong> {error}
          </ErrorContainer>
          <Button onClick={() => runLighthouse(false)}>Try Again</Button>
        </Container>
      </AddonPanel>
    );
  }

  if (!results) {
    return (
      <AddonPanel active={active}>
        <EmptyState>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
          <h3>No Lighthouse Results</h3>
          <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            Run Lighthouse to audit this story's performance, accessibility, best practices, and SEO.
          </p>
          <Button onClick={() => runLighthouse(false)}>Run Lighthouse Audit</Button>
        </EmptyState>
      </AddonPanel>
    );
  }

  const categories = [
    { key: 'performance', label: 'Performance' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'best-practices', label: 'Best Practices' },
    { key: 'seo', label: 'SEO' },
  ];

  // Use thresholds from results if available, otherwise use DEFAULT_THRESHOLDS
  const activeThresholds = results.thresholds || DEFAULT_THRESHOLDS;

  return (
    <AddonPanel active={active}>
      <Container>
        <Header>
          <div>
            <Title>Lighthouse Metrics</Title>
            {results.timestamp && (
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                Last run: {new Date(results.timestamp).toLocaleString()}
                {results.cached && ` • Cached (${Math.round((results as any).cacheAge / 1000)}s old)`}
              </div>
            )}
          </div>
          <Button onClick={() => runLighthouse(true)} disabled={loading}>
            {loading ? 'Running...' : 'Re-run Audit'}
          </Button>
        </Header>

        <Section>
          <SectionTitle>Core Metrics</SectionTitle>
          <MetricsGrid>
            {categories.map(({ key, label }) => {
              const score = results.scores[key as keyof typeof results.scores];
              const threshold = activeThresholds[key as keyof LighthouseThresholds];
              // For category scores, higher is better (0-100 scale)
              const passed = threshold !== undefined ? score >= threshold : true;
              
              return (
                <MetricCard key={key} score={score} passed={passed}>
                  <MetricLabel>{label}</MetricLabel>
                  <MetricScore score={score} passed={passed}>{score}</MetricScore>
                  {threshold !== undefined && (
                    <MetricThreshold>
                      Threshold: {threshold} {passed ? '✓' : '✗'}
                    </MetricThreshold>
                  )}
                </MetricCard>
              );
            })}
          </MetricsGrid>
        </Section>

        {results.metrics && (
          <Section>
            <SectionTitle>Core Web Vitals</SectionTitle>
            <AuditList>
              {Object.entries(results.metrics).map(([key, value]) => {
                const threshold = activeThresholds[key as keyof LighthouseThresholds];
                // Convert value to number if it's a string (from server)
                const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                // For Core Web Vitals, lower is better (opposite of category scores)
                const passed = threshold !== undefined ? numericValue <= threshold : true;
                const unit = key === 'cumulative-layout-shift' ? '' : 'ms';
                const displayValue = key === 'cumulative-layout-shift' 
                  ? numericValue.toFixed(3) 
                  : Math.round(numericValue);
                
                return (
                  <AuditItem key={key} passed={passed}>
                    <AuditIcon passed={passed}>
                      {passed ? '✓' : '✗'}
                    </AuditIcon>
                    <AuditContent>
                      <AuditTitle>
                        {key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </AuditTitle>
                      <AuditDescription>
                        {displayValue}{unit}
                        {threshold !== undefined && (
                          <> (threshold: {threshold === 0.05 ? '0.050' : threshold}{unit})</>
                        )}
                      </AuditDescription>
                    </AuditContent>
                  </AuditItem>
                );
              })}
            </AuditList>
          </Section>
        )}

        {results.audits && results.audits.length > 0 && (
          <Section>
            <SectionTitle>Failed Audits</SectionTitle>
            <AuditList>
              {results.audits.map((audit, index) => (
                <AuditItem key={index} passed={audit.passed}>
                  <AuditIcon passed={audit.passed}>
                    {audit.passed ? '✓' : '✗'}
                  </AuditIcon>
                  <AuditContent>
                    <AuditTitle>{audit.title}</AuditTitle>
                    {audit.description && (
                      <AuditDescription>{audit.description}</AuditDescription>
                    )}
                  </AuditContent>
                </AuditItem>
              ))}
            </AuditList>
          </Section>
        )}
      </Container>
    </AddonPanel>
  );
};
