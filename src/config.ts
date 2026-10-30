/** Nycklar till statistik och kraschrapporter. Tomma = avstängt. Båda nycklarna är publika (de får ligga i appen).
 *  PostHog: Project settings → Project API key (börjar med phc_). Välj EU-servern.
 *  Sentry: Settings → Projects → wicki → Client Keys (DSN). */
export const CONFIG = {
  posthogKey: 'phc_swHF8QX5yEhAHqQywTiWy6WgVLQaHQswHPyLXJMeCRi3',
  posthogHost: 'https://eu.i.posthog.com',
  sentryDsn: 'https://a42b363b297f35191d145f1c9ae32b86@o4512345329893376.ingest.de.sentry.io/4512345334546512',
  release: 'wicki@1.0.0',
};
