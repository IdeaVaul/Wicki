/** Texter för Wicki Plus på alla fyra språk. */
type PlusText = {
  close: string; test: string; sub: string; perksT: string; perks: string[]; freeNote: string;
  mT: string; yT: string; mSub: string; ySub: (kr: number) => string; save: (pct: number) => string;
  ladderT: string; step0: string; stepN: (m: number) => string; youHere: string; loseNote: string;
  start: string; testNote: string; legal: string; terms: string; privacy: string; restart: string;
  mine: string; monthly: (kr: number) => string; yearly: (kr: number) => string; member: string; months: (n: number) => string;
  nextPay: string; endsOn: string; nextStep: (n: number, kr: number) => string;
  cancel: string; sureT: string; sure: (now: number, back: number, end: string) => string; sureY: (end: string) => string;
  keep: string; cancelYes: string; canceled: (end: string) => string; resumeNote: string; resume: string; skip: string;
  badge: string; lockNode: string; unlock: string; simLock: string; card: string; cardOn: (kr: number) => string; cardOff: string;
};
export const PL: Record<string, PlusText> = {
  sv: {
    close: 'Stäng', test: 'TESTLÄGE', sub: 'Lås upp allt i Wicki och bli belönad för att du stannar.', perksT: 'Det här får du',
    perks: ['Alla avancerade avsnitt: strategier, tidsramar, marknader, fundamental analys, makro och tillgångsslag', 'Simulatorn med forex, krypto och guld', 'Prop-utmaningen i simulatorn', 'Priset sjunker ju längre du stannar'],
    freeNote: 'Grunderna, risk, psykologi och hur du undviker bluffar är alltid gratis.',
    mT: 'Månad', yT: 'År', mSub: 'Sjunker till 29 kr', ySub: kr => `Bara ${kr} kr/mån`, save: p => `Spara ${p} %`,
    ladderT: 'Ditt pris sjunker med tiden', step0: 'Första 3 månaderna', stepN: m => `Efter ${m} månader`, youHere: 'Du är här',
    loseNote: 'Säger du upp förlorar du ditt lojalitetspris och börjar om på 49 kr om du kommer tillbaka.',
    start: 'Starta Wicki Plus', testNote: 'Testversion: inga pengar dras. Riktiga betalningar kommer innan appen lanseras.',
    legal: 'Abonnemanget förnyas automatiskt tills du säger upp det. Du kan säga upp när som helst under Profil → Wicki Plus och behåller Plus perioden ut.',
    terms: 'Användarvillkor', privacy: 'Integritetspolicy', restart: 'Du har haft Plus förut, så du börjar om på första steget i trappan.',
    mine: 'Ditt Wicki Plus', monthly: kr => `Månadsabonnemang · ${kr} kr/mån`, yearly: kr => `Årsabonnemang · ${kr} kr/år`, member: 'Medlem i', months: n => n === 1 ? '1 månad' : `${n} månader`,
    nextPay: 'Nästa dragning', endsOn: 'Plus slutar', nextStep: (n, kr) => `Om ${n === 1 ? '1 månad' : n + ' månader'} sjunker ditt pris till ${kr} kr/mån.`,
    cancel: 'Säg upp Plus', sureT: 'Vill du säga upp?',
    sure: (now, back, end) => `Du betalar ${now} kr/mån tack vare lojalitetspriset. Säger du upp förlorar du det och får börja om på ${back} kr/mån om du kommer tillbaka. Plus fungerar till ${end}.`,
    sureY: end => `Plus fungerar till ${end}, sedan förnyas det inte.`,
    keep: 'Behåll mitt pris', cancelYes: 'Säg upp ändå', canceled: end => `Uppsagt. Plus fungerar till ${end}.`,
    resumeNote: 'Ångrar du dig innan dess behåller du ditt lojalitetspris.', resume: 'Fortsätt med Plus', skip: 'Testläge: spola fram en månad',
    badge: 'PLUS', lockNode: 'Det här avsnittet ingår i Wicki Plus.', unlock: 'Lås upp med Plus', simLock: 'Ingår i Wicki Plus',
    card: 'Wicki Plus', cardOn: kr => `Aktivt · ${kr} kr/mån`, cardOff: 'Lås upp alla avsnitt. Priset sjunker ju längre du stannar.',
  },
  en: {
    close: 'Close', test: 'TEST MODE', sub: 'Unlock everything in Wicki and get rewarded for staying.', perksT: 'What you get',
    perks: ['All advanced sections: strategies, timeframes, markets, fundamental analysis, macro and asset classes', 'The simulator with forex, crypto and gold', 'The prop challenge in the simulator', 'Your price drops the longer you stay'],
    freeNote: 'The basics, risk, psychology and how to avoid scams are always free.',
    mT: 'Monthly', yT: 'Yearly', mSub: 'Drops to 29 kr', ySub: kr => `Only ${kr} kr/month`, save: p => `Save ${p}%`,
    ladderT: 'Your price drops over time', step0: 'First 3 months', stepN: m => `After ${m} months`, youHere: 'You are here',
    loseNote: 'If you cancel you lose your loyalty price and start again at 49 kr if you come back.',
    start: 'Start Wicki Plus', testNote: 'Test version: no money is charged. Real payments arrive before launch.',
    legal: 'The subscription renews automatically until you cancel. You can cancel any time under Profile → Wicki Plus and keep Plus until the period ends.',
    terms: 'Terms of use', privacy: 'Privacy policy', restart: 'You have had Plus before, so you start again at the first step.',
    mine: 'Your Wicki Plus', monthly: kr => `Monthly plan · ${kr} kr/month`, yearly: kr => `Yearly plan · ${kr} kr/year`, member: 'Member for', months: n => n === 1 ? '1 month' : `${n} months`,
    nextPay: 'Next payment', endsOn: 'Plus ends', nextStep: (n, kr) => `In ${n === 1 ? '1 month' : n + ' months'} your price drops to ${kr} kr/month.`,
    cancel: 'Cancel Plus', sureT: 'Cancel your plan?',
    sure: (now, back, end) => `You pay ${now} kr/month thanks to your loyalty price. If you cancel you lose it and start again at ${back} kr/month if you come back. Plus works until ${end}.`,
    sureY: end => `Plus works until ${end} and then won't renew.`,
    keep: 'Keep my price', cancelYes: 'Cancel anyway', canceled: end => `Cancelled. Plus works until ${end}.`,
    resumeNote: 'Change your mind before then and you keep your loyalty price.', resume: 'Keep Plus', skip: 'Test mode: skip ahead one month',
    badge: 'PLUS', lockNode: 'This section is part of Wicki Plus.', unlock: 'Unlock with Plus', simLock: 'Part of Wicki Plus',
    card: 'Wicki Plus', cardOn: kr => `Active · ${kr} kr/month`, cardOff: 'Unlock every section. The price drops the longer you stay.',
  },
  fr: {
    close: 'Fermer', test: 'MODE TEST', sub: 'Débloque tout Wicki et sois récompensé de rester.', perksT: 'Ce que tu obtiens',
    perks: ['Toutes les sections avancées : stratégies, unités de temps, marchés, analyse fondamentale, macro et classes d’actifs', 'Le simulateur avec forex, crypto et or', 'Le défi prop du simulateur', 'Ton prix baisse avec l’ancienneté'],
    freeNote: 'Les bases, le risque, la psychologie et comment éviter les arnaques restent toujours gratuits.',
    mT: 'Mensuel', yT: 'Annuel', mSub: 'Descend à 29 kr', ySub: kr => `Seulement ${kr} kr/mois`, save: p => `−${p} %`,
    ladderT: 'Ton prix baisse avec le temps', step0: 'Les 3 premiers mois', stepN: m => `Après ${m} mois`, youHere: 'Tu es ici',
    loseNote: 'Si tu résilies, tu perds ton tarif fidélité et tu recommences à 49 kr si tu reviens.',
    start: 'Démarrer Wicki Plus', testNote: 'Version test : aucun paiement n’est prélevé. Les vrais paiements arrivent avant le lancement.',
    legal: 'L’abonnement se renouvelle automatiquement jusqu’à résiliation. Tu peux résilier à tout moment dans Profil → Wicki Plus et garder Plus jusqu’à la fin de la période.',
    terms: 'Conditions d’utilisation', privacy: 'Politique de confidentialité', restart: 'Tu as déjà eu Plus, tu recommences donc à la première marche.',
    mine: 'Ton Wicki Plus', monthly: kr => `Abonnement mensuel · ${kr} kr/mois`, yearly: kr => `Abonnement annuel · ${kr} kr/an`, member: 'Membre depuis', months: n => `${n} mois`,
    nextPay: 'Prochain paiement', endsOn: 'Plus se termine', nextStep: (n, kr) => `Dans ${n} mois, ton prix passe à ${kr} kr/mois.`,
    cancel: 'Résilier Plus', sureT: 'Résilier ?',
    sure: (now, back, end) => `Tu paies ${now} kr/mois grâce à ton tarif fidélité. Si tu résilies, tu le perds et tu recommences à ${back} kr/mois si tu reviens. Plus fonctionne jusqu’au ${end}.`,
    sureY: end => `Plus fonctionne jusqu’au ${end}, puis ne se renouvelle pas.`,
    keep: 'Garder mon tarif', cancelYes: 'Résilier quand même', canceled: end => `Résilié. Plus fonctionne jusqu’au ${end}.`,
    resumeNote: 'Si tu changes d’avis d’ici là, tu gardes ton tarif fidélité.', resume: 'Continuer avec Plus', skip: 'Mode test : avancer d’un mois',
    badge: 'PLUS', lockNode: 'Cette section fait partie de Wicki Plus.', unlock: 'Débloquer avec Plus', simLock: 'Inclus dans Wicki Plus',
    card: 'Wicki Plus', cardOn: kr => `Actif · ${kr} kr/mois`, cardOff: 'Débloque toutes les sections. Le prix baisse avec l’ancienneté.',
  },
  ar: {
    close: 'إغلاق', test: 'وضع الاختبار', sub: 'افتح كل محتوى Wicki واحصل على مكافأة كلما بقيت أطول.', perksT: 'ما تحصل عليه',
    perks: ['كل الأقسام المتقدمة: الاستراتيجيات والأطر الزمنية والأسواق والتحليل الأساسي والاقتصاد الكلي وفئات الأصول', 'المحاكي مع الفوركس والعملات المشفرة والذهب', 'تحدي شركات التمويل في المحاكي', 'ينخفض سعرك كلما بقيت أطول'],
    freeNote: 'الأساسيات وإدارة المخاطر وعلم النفس وكيفية تجنب الاحتيال مجانية دائمًا.',
    mT: 'شهري', yT: 'سنوي', mSub: 'ينخفض إلى 29 كرونة', ySub: kr => `فقط ${kr} كرونة شهريًا`, save: p => `وفّر ${p}%`,
    ladderT: 'سعرك ينخفض مع الوقت', step0: 'أول 3 أشهر', stepN: m => `بعد ${m} شهرًا`, youHere: 'أنت هنا',
    loseNote: 'إذا ألغيت الاشتراك تفقد سعر الولاء وتبدأ من جديد بـ 49 كرونة إذا عدت.',
    start: 'ابدأ Wicki Plus', testNote: 'نسخة تجريبية: لا يتم خصم أي مبلغ. الدفع الحقيقي سيأتي قبل الإطلاق.',
    legal: 'يتجدد الاشتراك تلقائيًا حتى تلغيه. يمكنك الإلغاء في أي وقت من الملف الشخصي ← Wicki Plus وتحتفظ بـ Plus حتى نهاية الفترة.',
    terms: 'شروط الاستخدام', privacy: 'سياسة الخصوصية', restart: 'كان لديك Plus من قبل، لذلك تبدأ من الدرجة الأولى.',
    mine: 'اشتراكك في Wicki Plus', monthly: kr => `اشتراك شهري · ${kr} كرونة/شهر`, yearly: kr => `اشتراك سنوي · ${kr} كرونة/سنة`, member: 'عضو منذ', months: n => `${n} شهر`,
    nextPay: 'الدفعة التالية', endsOn: 'ينتهي Plus في', nextStep: (n, kr) => `بعد ${n} شهر ينخفض سعرك إلى ${kr} كرونة شهريًا.`,
    cancel: 'إلغاء Plus', sureT: 'هل تريد الإلغاء؟',
    sure: (now, back, end) => `تدفع ${now} كرونة شهريًا بفضل سعر الولاء. إذا ألغيت تفقده وتبدأ من جديد بـ ${back} كرونة شهريًا إذا عدت. يعمل Plus حتى ${end}.`,
    sureY: end => `يعمل Plus حتى ${end} ثم لا يتجدد.`,
    keep: 'احتفظ بسعري', cancelYes: 'ألغِ على أي حال', canceled: end => `تم الإلغاء. يعمل Plus حتى ${end}.`,
    resumeNote: 'إذا غيرت رأيك قبل ذلك تحتفظ بسعر الولاء.', resume: 'استمر مع Plus', skip: 'وضع الاختبار: تقدم شهرًا',
    badge: 'PLUS', lockNode: 'هذا القسم جزء من Wicki Plus.', unlock: 'افتح مع Plus', simLock: 'ضمن Wicki Plus',
    card: 'Wicki Plus', cardOn: kr => `نشط · ${kr} كرونة/شهر`, cardOff: 'افتح كل الأقسام. ينخفض السعر كلما بقيت أطول.',
  },
};

/** Samtycke till statistik och kraschrapporter: [rubrik, förklaring, ja, nej]. */
export const STATS: Record<string, [string, string, string, string]> = {
  sv: ['Hjälp till att förbättra Wicki', 'Skicka anonym statistik om hur appen används och rapporter när något kraschar. Inget namn eller e-post skickas.', 'Ja, gärna', 'Nej tack'],
  en: ['Help improve Wicki', 'Send anonymous usage statistics and reports when something crashes. No name or email is sent.', 'Yes, happy to', 'No thanks'],
  fr: ['Aide à améliorer Wicki', 'Envoyer des statistiques d’utilisation anonymes et des rapports en cas de plantage. Aucun nom ni e-mail n’est envoyé.', 'Oui, volontiers', 'Non merci'],
  ar: ['ساعد في تحسين Wicki', 'أرسل إحصاءات استخدام مجهولة وتقارير عند حدوث عطل. لا يتم إرسال الاسم أو البريد الإلكتروني.', 'نعم، بكل سرور', 'لا، شكرًا'],
};
