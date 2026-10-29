/** Sessionsdata som inte sparas: när senaste pausen var. */
export const session = { lastBreak: Date.now() };
export const breakDue = (on?: boolean) => !!on && Date.now() - session.lastBreak > 10 * 60e3;
