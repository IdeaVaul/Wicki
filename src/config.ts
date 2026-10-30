/** Nycklar till statistik och kraschrapporter. Tomma = avstängt. Båda nycklarna är publika (de får ligga i appen).
 *  PostHog: Project settings → Project API key (börjar med phc_). Välj EU-servern.
 *  Sentry: Settings → Projects → wicki → Client Keys (DSN). */
export const CONFIG = {
  posthogKey: '',
  posthogHost: 'https://eu.i.posthog.com',
  sentryDsn: '',
  release: 'wicki@1.0.0',
};
