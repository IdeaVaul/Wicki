/** Översättningar för de praktiska övningarna (utritning, räkning, riktiga grafer). */
const ROWS: [string, string, string, string][] = [
  ['Tryck i grafen där stödet ligger.', 'Tap the chart where the support is.', 'Touche le graphique là où se trouve le support.', 'اضغط على الرسم البياني حيث يوجد الدعم.'],
  ['Tryck i grafen där motståndet ligger.', 'Tap the chart where the resistance is.', 'Touche le graphique là où se trouve la résistance.', 'اضغط على الرسم البياني حيث توجد المقاومة.'],
  ['Riktig graf: tryck där priset hittade stöd.', 'Real chart: tap where the price found support.', 'Graphique réel : touche là où le prix a trouvé un support.', 'رسم حقيقي: اضغط حيث وجد السعر دعمًا.'],
  ['Riktig graf: vilken trend ser du?', 'Real chart: which trend do you see?', 'Graphique réel : quelle tendance vois-tu ?', 'رسم حقيقي: ما الاتجاه الذي تراه؟'],
  ['Riktig graf: gick priset upp eller ner de närmaste 10 ljusen?', 'Real chart: did the price go up or down over the next 10 candles?', 'Graphique réel : le prix a-t-il monté ou baissé sur les 10 bougies suivantes ?', 'رسم حقيقي: هل ارتفع السعر أم انخفض خلال الشموع العشر التالية؟'],
  ['Upp', 'Up', 'Hausse', 'صعود'], ['Ner', 'Down', 'Baisse', 'هبوط'],
  ['Köp', 'Buy', 'Achat', 'شراء'], ['Din linje', 'Your line', 'Ta ligne', 'خطك'], ['Facit', 'Answer', 'Réponse', 'الإجابة'],
  ['aktier', 'shares', 'actions', 'أسهم'],
  ['Tryck i grafen för att dra en linje.', 'Tap the chart to draw a line.', 'Touche le graphique pour tracer une ligne.', 'اضغط على الرسم البياني لرسم خط.'],
  ['Tryck igen för att flytta linjen.', 'Tap again to move the line.', 'Touche à nouveau pour déplacer la ligne.', 'اضغط مرة أخرى لتحريك الخط.'],
  ['Den gröna linjen visar rätt nivå.', 'The green line shows the right level.', 'La ligne verte montre le bon niveau.', 'الخط الأخضر يُظهر المستوى الصحيح.'],
  ['Riktiga grafer', 'Real charts', 'Graphiques réels', 'رسوم حقيقية'],
  ['Läs riktiga marknadsgrafer, rita stöd och sätt stop-loss.', 'Read real market charts, draw support and set stop-losses.', 'Lis de vrais graphiques, trace des supports et place des stop-loss.', 'اقرأ رسومًا حقيقية للسوق وارسم الدعم وضع وقف الخسارة.'],
  ['Stödet är den nivå där priset flera gånger slutat falla och vänt upp, här vid de lägsta bottnarna.', 'Support is the level where the price has stopped falling and turned up several times, here at the lowest lows.', 'Le support est le niveau où le prix a plusieurs fois cessé de baisser pour remonter, ici aux plus bas.', 'الدعم هو المستوى الذي توقف عنده السعر عن الهبوط وارتد صعودًا عدة مرات، هنا عند أدنى القيعان.'],
  ['Motståndet är taket där priset flera gånger vänt ner, här vid de högsta topparna.', 'Resistance is the ceiling where the price has turned down several times, here at the highest highs.', 'La résistance est le plafond où le prix a plusieurs fois rebroussé chemin, ici aux plus hauts.', 'المقاومة هي السقف الذي ارتد عنده السعر هبوطًا عدة مرات، هنا عند أعلى القمم.'],
  ['Lägg stoppen strax under den senaste bottnen. Bryts den är idén fel. Ligger stoppen ovanför bottnen slås den ut av vanligt brus, och för långt ner riskerar du onödigt mycket.', 'Put the stop just below the latest low. If it breaks, the idea is wrong. A stop above the low gets hit by normal noise, and too far below risks more than you need to.', 'Place le stop juste sous le dernier creux. S\'il casse, l\'idée est fausse. Au-dessus du creux, le bruit normal le déclenche, et trop bas tu risques plus que nécessaire.', 'ضع وقف الخسارة أسفل آخر قاع مباشرة. إن كُسر فالفكرة خاطئة. وقف فوق القاع يضربه التذبذب العادي، والوقف البعيد جدًا يعرّضك لمخاطرة غير ضرورية.'],
  ['Stödet ligger vid den nivå där köparna tog över och priset vände upp, här vid den lägsta bottnen.', 'Support is where buyers took over and the price turned up, here at the lowest low.', 'Le support est là où les acheteurs ont pris le dessus et le prix est reparti, ici au plus bas.', 'الدعم حيث سيطر المشترون وارتد السعر صعودًا، هنا عند أدنى قاع.'],
  ['I Sverige finns investeringssparkonto (ISK). Där betalar du en schablonskatt varje år i stället för skatt på varje vinst. Från 2026 är de första 300 000 kronorna skattefria (ISK och kapitalförsäkring tillsammans). Kontrollera aktuella regler hos Skatteverket.', 'Sweden has the investment savings account (ISK). You pay a flat-rate tax each year instead of tax on every gain. From 2026 the first 300,000 kronor are tax-free (ISK and endowment insurance combined). Check the current rules with the Swedish Tax Agency.', 'En Suède existe le compte d\'épargne-investissement (ISK). On y paie un impôt forfaitaire chaque année au lieu d\'un impôt sur chaque gain. À partir de 2026, les 300 000 premières couronnes sont exonérées (ISK et assurance capitalisation ensemble). Vérifie les règles en vigueur auprès de Skatteverket.', 'في السويد يوجد حساب الادخار الاستثماري (ISK). تدفع فيه ضريبة ثابتة كل عام بدلًا من ضريبة على كل ربح. ابتداءً من 2026 تُعفى أول 300 000 كرونة من الضريبة (ISK وتأمين رأس المال معًا). تحقّق من القواعد الحالية لدى مصلحة الضرائب.'],
  ['Rätt svar:', 'Correct answer:', 'Bonne réponse :', 'الإجابة الصحيحة:'],
];
export const PR_DICT: Record<string, Record<string, string>> = { en: {}, fr: {}, ar: {} };
for (const [sv, en, fr, ar] of ROWS) { PR_DICT.en[sv] = en; PR_DICT.fr[sv] = fr; PR_DICT.ar[sv] = ar; }

const N = '([\\d\\s\\u00a0.,]+)';
const re = (s: string) => new RegExp('^' + s + '$');
/** Mönster för frågor och förklaringar med siffror. $1… = siffrorna som de är. */
export const PR_RULES: [RegExp, Record<string, string>][] = [
  [re(`Du köper på ${N}\\. Tryck där du lägger din stop-loss\\.`), { en: 'You buy at $1. Tap where you put your stop-loss.', fr: 'Tu achètes à $1. Touche là où tu places ton stop-loss.', ar: 'تشتري عند $1. اضغط حيث تضع وقف الخسارة.' }],
  [re(`Kontot är ${N} kr och du riskerar ${N} %\\. Du köper på ${N} kr med stop-loss på ${N} kr\\. Hur många aktier köper du\\?`),
    { en: 'Your account is $1 kr and you risk $2 %. You buy at $3 kr with a stop-loss at $4 kr. How many shares do you buy?', fr: 'Ton compte fait $1 kr et tu risques $2 %. Tu achètes à $3 kr avec un stop-loss à $4 kr. Combien d\'actions achètes-tu ?', ar: 'حسابك $1 كرونة وتخاطر بـ $2 %. تشتري عند $3 كرونة مع وقف خسارة عند $4 كرونة. كم سهمًا تشتري؟' }],
  [re(`Du har ${N} kr och riskerar högst ${N} % per trade\\. Hur många kronor får du som mest förlora\\?`),
    { en: 'You have $1 kr and risk at most $2 % per trade. How many kronor can you lose at most?', fr: 'Tu as $1 kr et risques au plus $2 % par trade. Combien de couronnes peux-tu perdre au maximum ?', ar: 'لديك $1 كرونة وتخاطر بحد أقصى $2 % في كل صفقة. ما أقصى عدد من الكرونات يمكنك خسارته؟' }],
  [re(`Du köper på ${N} kr med stop-loss på ${N} kr\\. Vilket målpris ger risk/reward 1:${N}\\?`),
    { en: 'You buy at $1 kr with a stop-loss at $2 kr. Which target price gives risk/reward 1:$3?', fr: 'Tu achètes à $1 kr avec un stop-loss à $2 kr. Quel objectif donne un risque/rendement de 1:$3 ?', ar: 'تشتري عند $1 كرونة مع وقف خسارة عند $2 كرونة. ما السعر المستهدف الذي يعطي نسبة مخاطرة إلى عائد 1:$3؟' }],
  [re(`Risk i kronor: ${N} % av ${N} = ${N} kr\\. Risk per aktie: ${N} − ${N} = ${N} kr\\. ${N} ÷ ${N} = ${N} aktier\\.`),
    { en: 'Risk in kronor: $1 % of $2 = $3 kr. Risk per share: $4 − $5 = $6 kr. $7 ÷ $8 = $9 shares.', fr: 'Risque en couronnes : $1 % de $2 = $3 kr. Risque par action : $4 − $5 = $6 kr. $7 ÷ $8 = $9 actions.', ar: 'المخاطرة بالكرونات: $1 % من $2 = $3 كرونة. المخاطرة لكل سهم: $4 − $5 = $6 كرونة. $7 ÷ $8 = $9 أسهم.' }],
  [re(`${N} % av ${N} kr är ${N} kr\\.`), { en: '$1 % of $2 kr is $3 kr.', fr: '$1 % de $2 kr font $3 kr.', ar: '$1 % من $2 كرونة يساوي $3 كرونة.' }],
  [re(`Risken är ${N} kr per aktie\\. 1:${N} betyder ${N} × ${N} = ${N} kr i möjlig vinst, alltså ${N} \\+ ${N} = ${N} kr\\.`),
    { en: 'The risk is $1 kr per share. 1:$2 means $3 × $4 = $5 kr of possible profit, so $6 + $7 = $8 kr.', fr: 'Le risque est de $1 kr par action. 1:$2 signifie $3 × $4 = $5 kr de gain possible, donc $6 + $7 = $8 kr.', ar: 'المخاطرة $1 كرونة لكل سهم. 1:$2 تعني $3 × $4 = $5 كرونة ربحًا محتملًا، أي $6 + $7 = $8 كرونة.' }],
  [re(`Från första till sista ljuset ändrades priset ([+-]?[\\d.,]+) %\\. Rörelsen är liten jämfört med svängningarna, alltså sidled\\.`),
    { en: 'From the first to the last candle the price changed $1 %. The move is small compared with the swings, so sideways.', fr: 'Du premier au dernier chandelier, le prix a varié de $1 %. Le mouvement est faible face aux oscillations : latéral.', ar: 'من أول شمعة إلى آخرها تغيّر السعر $1 %. الحركة صغيرة مقارنة بالتذبذبات، إذن اتجاه عرضي.' }],
  [re(`Från första till sista ljuset ändrades priset ([+-]?[\\d.,]+) %\\. Högre toppar och bottnar, alltså upptrend\\.`),
    { en: 'From the first to the last candle the price changed $1 %. Higher highs and lows, so an uptrend.', fr: 'Du premier au dernier chandelier, le prix a varié de $1 %. Des sommets et creux plus hauts : tendance haussière.', ar: 'من أول شمعة إلى آخرها تغيّر السعر $1 %. قمم وقيعان أعلى، إذن اتجاه صاعد.' }],
  [re(`Från första till sista ljuset ändrades priset ([+-]?[\\d.,]+) %\\. Lägre toppar och bottnar, alltså nedtrend\\.`),
    { en: 'From the first to the last candle the price changed $1 %. Lower highs and lows, so a downtrend.', fr: 'Du premier au dernier chandelier, le prix a varié de $1 %. Des sommets et creux plus bas : tendance baissière.', ar: 'من أول شمعة إلى آخرها تغيّر السعر $1 %. قمم وقيعان أدنى، إذن اتجاه هابط.' }],
  [re(`Det gick (upp|ner) ([\\d.,]+) % de följande 10 ljusen\\. Ingen kan veta det i förväg\\. Därför bestämmer du alltid stop-loss innan du köper\\.`),
    { en: 'It went $1 $2 % over the next 10 candles. Nobody can know that in advance. That\'s why you always decide your stop-loss before you buy.', fr: 'Le prix a évolué de $2 % ($1) sur les 10 bougies suivantes. Personne ne peut le savoir à l\'avance. C\'est pour ça qu\'on fixe toujours son stop-loss avant d\'acheter.', ar: 'تحرك السعر $2 % ($1) خلال الشموع العشر التالية. لا أحد يستطيع معرفة ذلك مسبقًا. لهذا تحدد وقف الخسارة دائمًا قبل الشراء.' }],
];
// "upp/ner" i regeln ovan översätts inte via $1, så ersätt dem i engelskan.
PR_RULES[PR_RULES.length - 1][1].en = 'It went {1} $2 % over the next 10 candles. Nobody can know that in advance. That\'s why you always decide your stop-loss before you buy.';
PR_DICT.en.upp = 'up'; PR_DICT.en.ner = 'down'; PR_DICT.fr.upp = 'à la hausse'; PR_DICT.fr.ner = 'à la baisse'; PR_DICT.ar.upp = 'صعودًا'; PR_DICT.ar.ner = 'هبوطًا';
PR_RULES[PR_RULES.length - 1][1].fr = 'Le prix a évolué {1} de $2 % sur les 10 bougies suivantes. Personne ne peut le savoir à l\'avance. C\'est pour ça qu\'on fixe toujours son stop-loss avant d\'acheter.';
PR_RULES[PR_RULES.length - 1][1].ar = 'تحرك السعر {1} بنسبة $2 % خلال الشموع العشر التالية. لا أحد يستطيع معرفة ذلك مسبقًا. لهذا تحدد وقف الخسارة دائمًا قبل الشراء.';
