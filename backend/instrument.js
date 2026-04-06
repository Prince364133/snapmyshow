const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Add integrations here if needed
    ],
    tracesSampleRate: 1.0,
  });
}
