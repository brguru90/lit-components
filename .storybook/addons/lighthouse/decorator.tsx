import React, { useEffect, useState } from 'react';
import type { Decorator, StoryContext } from 'storybook/internal/types';

interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  metrics: {
    fcp: number;
    lcp: number;
    cls: number;
    tbt: number;
    si: number;
  };
  audits?: Array<{
    id: string;
    title: string;
    score: number | null;
    displayValue?: string;
  }>;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
};

const formatMetricValue = (value: number, unit: string = 'ms'): string => {
  if (unit === 'ms') {
    return `${Math.round(value)}ms`;
  }
  return value.toFixed(3);
};

const LighthouseMetricsPanel: React.FC<{ metrics: LighthouseMetrics | null; loading: boolean }> = ({
  metrics,
  loading,
}) => {
  if (loading) {
    return (
      <div style={{
        padding: '20px',
        background: '#f6f9fc',
        borderRadius: '4px',
        margin: '20px 0',
        textAlign: 'center',
      }}>
        <p>⚡ Running Lighthouse audit...</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div style={{
      padding: '20px',
      background: '#f6f9fc',
      borderRadius: '4px',
      margin: '20px 0',
      fontFamily: '"Nunito Sans", -apple-system, sans-serif',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>
        ⚡ Lighthouse Metrics
      </h3>
      
      {/* Category Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'Performance', value: metrics.performance },
          { label: 'Accessibility', value: metrics.accessibility },
          { label: 'Best Practices', value: metrics.bestPractices },
          { label: 'SEO', value: metrics.seo },
          { label: 'PWA', value: metrics.pwa },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: getScoreColor(value),
              marginBottom: '4px',
            }}>
              {value}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Core Web Vitals */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Core Web Vitals
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '12px',
        }}>
          {[
            { label: 'FCP', value: metrics.metrics.fcp, unit: 'ms' },
            { label: 'LCP', value: metrics.metrics.lcp, unit: 'ms' },
            { label: 'CLS', value: metrics.metrics.cls, unit: '' },
            { label: 'TBT', value: metrics.metrics.tbt, unit: 'ms' },
            { label: 'SI', value: metrics.metrics.si, unit: 'ms' },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '2px',
              }}>
                {unit ? formatMetricValue(value, unit) : value.toFixed(3)}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audits Summary */}
      {metrics.audits && metrics.audits.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '12px',
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            Top Issues
          </h4>
          <div style={{ fontSize: '13px' }}>
            {metrics.audits.slice(0, 5).map((audit, idx) => (
              <div key={audit.id} style={{
                padding: '8px 0',
                borderBottom: idx < 4 ? '1px solid #eee' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: audit.score !== null ? getScoreColor(audit.score * 100) : '#999',
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, color: '#333' }}>{audit.title}</span>
                {audit.displayValue && (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    {audit.displayValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Simulate lighthouse results (replace with real API call)
const fetchLighthouseMetrics = async (storyId: string): Promise<LighthouseMetrics> => {
  // TODO: Replace with real API call to your lighthouse service
  // For now, return simulated data
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    performance: 85,
    accessibility: 92,
    bestPractices: 87,
    seo: 95,
    pwa: 50,
    metrics: {
      fcp: 1200,
      lcp: 2400,
      cls: 0.05,
      tbt: 150,
      si: 3200,
    },
    audits: [
      { id: 'unused-javascript', title: 'Reduce unused JavaScript', score: 0.45, displayValue: '120 KiB' },
      { id: 'render-blocking-resources', title: 'Eliminate render-blocking resources', score: 0.62, displayValue: '450ms' },
      { id: 'largest-contentful-paint-element', title: 'Largest Contentful Paint element', score: 0.78, displayValue: '2.4s' },
    ],
  };
};

export const withLighthouse: Decorator = (Story, context: StoryContext) => {
  const [metrics, setMetrics] = useState<LighthouseMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check if lighthouse is enabled for this story
  const lighthouseConfig = context.parameters?.lighthouse;
  const isEnabled = lighthouseConfig?.enabled !== false;

  useEffect(() => {
    if (!isEnabled) {
      setMetrics(null);
      return;
    }

    setLoading(true);
    fetchLighthouseMetrics(context.id)
      .then(setMetrics)
      .catch(err => {
        console.error('Failed to fetch Lighthouse metrics:', err);
        setMetrics(null);
      })
      .finally(() => setLoading(false));
  }, [context.id, isEnabled]);

  return (
    <>
      <Story />
      {isEnabled && <LighthouseMetricsPanel metrics={metrics} loading={loading} />}
    </>
  );
};
