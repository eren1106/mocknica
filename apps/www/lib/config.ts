/**
 * Application configuration
 * Centralized config for URLs and environment-specific settings
 */

export const config = {
  // Dashboard/App URL - defaults to localhost:3000 in development
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000',
  
  // Marketing site URL - defaults to localhost:3001 in development  
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  
  // External links
  githubUrl: 'https://github.com/eren1106/mocknica',
  githubIssuesUrl: 'https://github.com/eren1106/mocknica/issues',
  githubDocsUrl: 'https://github.com/eren1106/mocknica#readme',
  githubContributingUrl: 'https://github.com/eren1106/mocknica#contribute',
} as const;
