import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const shouldAnalyze = process.env.ANALYZE === 'true';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: shouldAnalyze,
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  /** We run eslint as a separate task in CI */
  eslint: { ignoreDuringBuilds: true },
};

export default withSentryConfig(
  shouldAnalyze ? withBundleAnalyzer(config) : config,
  {},
  { hideSourceMaps: true },
);
