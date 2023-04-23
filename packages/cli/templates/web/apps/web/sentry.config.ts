import * as Sentry from '@sentry/nextjs';

function initSentry() {
  const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('No Sentry DSN found, check your environment variables');

    return;
  }

  Sentry.init({
    enabled: process.env.NODE_ENV !== 'development',
    dsn: SENTRY_DSN,
  });
}

initSentry();
