// Genererad från wick.html. Ändra innehållet här.
import type { Lesson, UnitDef } from '../types';
export const CONTENT: Record<string, Lesson> = {
 "u1a": {
  "t": "Vad är en aktie?",
  "c": [
   {
    "t": "Aktie",
    "d": "En aktie är en liten ägarandel i ett företag. Går företaget bra kan aktien stiga i värde och ibland ge utdelning."
   },
   {
    "t": "Börsen",
    "d": "På börsen möts köpare och säljare. Priset sätts av utbud och efterfrågan: fler köpare än säljare driver priset upp.",
    "fig": "up"
   },
   {
    "t": "Trading eller investering",
    "d": "Investerare äger ofta i flera år. Traders köper och säljer under kortare tid, dagar, timmar eller minuter, för att tjäna på prisrörelser."
   }
  ],
  "q": [
   {
    "q": "Vad äger du när du köper en aktie?",
    "o": [
     "En liten del av företaget",
     "Ett lån till företaget",
     "En produkt från företaget",
     "En garanti på vinst"
    ],
    "why": "En aktie är en ägarandel. Ett lån till ett företag kallas obligation."
   },
   {
    "q": "Vad händer oftast med priset när fler vill köpa än sälja?",
    "o": [
     "Det stiger",
     "Det sjunker",
     "Det står still",
     "Börsen stänger"
    ],
    "why": "Fler köpare än säljare betyder högre efterfrågan, och då stiger priset."
   },
   {
    "q": "Vad skiljer en trader från en långsiktig investerare?",
    "o": [
     "Tradern håller sina affärer kortare tid",
     "Tradern köper bara fonder",
     "Tradern betalar ingen avgift",
     "Tradern kan inte förlora pengar"
    ]
   },
   {
    "m": [
     [
      "Aktie",
      "Ägarandel i ett företag"
     ],
     [
      "Utdelning",
      "Del av vinsten till ägarna"
     ],
     [
      "Börs",
      "Marknadsplats för köp och sälj"
     ],
     [
      "Obligation",
      "Ett lån till företag eller stat"
     ]
    ]
   },
   {
    "q": "Kan en aktie bli värd noll kronor?",
    "o": [
     "Ja, om företaget går i konkurs",
     "Nej, aldrig",
     "Bara i USA",
     "Bara för små företag"
    ],
    "why": "Går företaget i konkurs kan aktieägarna förlora allt de satt in."
   }
  ]
 },
 "u1b": {
  "t": "Order och priser",
  "c": [
   {
    "t": "Bid och ask",
    "d": "Köpkursen (bid) är det högsta någon vill betala. Säljkursen (ask) är det lägsta någon vill sälja för. Skillnaden kallas spread."
   },
   {
    "t": "Marknadsorder",
    "d": "En marknadsorder köper eller säljer direkt till bästa tillgängliga pris. Den går snabbt, men priset kan bli sämre än du tänkt."
   },
   {
    "t": "Limitorder",
    "d": "En limitorder sätter ett högsta pris när du köper eller ett lägsta pris när du säljer. Du får aldrig sämre pris, men ordern kanske inte genomförs."
   }
  ],
  "q": [
   {
    "q": "Bid är 99 kr och ask är 100 kr. Hur stor är spreaden?",
    "o": [
     "1 kr",
     "99 kr",
     "199 kr",
     "0,5 kr"
    ],
    "why": "Spread = ask − bid = 100 − 99 = 1 kr."
   },
   {
    "q": "Du vill köpa men inte betala mer än 50 kr. Vilken order passar?",
    "o": [
     "Limitorder på 50 kr",
     "Marknadsorder",
     "Stop-loss på 50 kr",
     "Ingen order behövs"
    ],
    "why": "En limitorder garanterar att du inte betalar mer än ditt pris."
   },
   {
    "q": "Vad är risken med en marknadsorder när det är lite handel?",
    "o": [
     "Du kan få ett sämre pris",
     "Ordern blir alltid billigare",
     "Du får exakt senaste priset",
     "Den tar flera dagar"
    ],
    "why": "Med få säljare kan ordern fyllas på sämre nivåer än senaste pris."
   },
   {
    "m": [
     [
      "Bid",
      "Högsta köpbud"
     ],
     [
      "Ask",
      "Lägsta säljbud"
     ],
     [
      "Spread",
      "Skillnaden mellan bid och ask"
     ],
     [
      "Limitorder",
      "Order med prisgräns"
     ]
    ]
   },
   {
    "q": "Vem betalar du courtage till?",
    "o": [
     "Din bank eller mäklare",
     "Företaget du köper",
     "Staten",
     "Den som säljer till dig"
    ],
    "why": "Courtage är mäklarens avgift för att genomföra affären."
   },
   {
    "q": "Ordna stegen när du köper en aktie",
    "ord": [
     "Välj aktie och bestäm hur mycket du riskerar",
     "Välj ordertyp och pris",
     "Lägg ordern hos mäklaren",
     "Ordern matchas mot en säljare",
     "Aktien syns i din depå"
    ]
   }
  ]
 },
 "u2a": {
  "t": "Candlesticks",
  "c": [
   {
    "t": "Fyra priser per ljus",
    "d": "En linjegraf visar bara stängningspriset. Ett candlestick-ljus visar fyra priser för perioden: öppning, högsta, lägsta och stängning (OHLC).",
    "fig": "ohlc"
   },
   {
    "t": "Grönt och rött",
    "d": "Grönt ljus: priset stängde högre än det öppnade. Rött ljus: det stängde lägre. Den tjocka delen kallas kropp.",
    "fig": "greenred"
   },
   {
    "t": "Veken",
    "d": "De tunna strecken ovanför och under kroppen kallas vekar. De visar periodens högsta och lägsta pris.",
    "fig": "ohlc"
   }
  ],
  "q": [
   {
    "q": "Vad betyder ett grönt ljus?",
    "fig": "oneGreen",
    "o": [
     "Stängningen var högre än öppningen",
     "Priset steg hela perioden",
     "Det var hög volym",
     "Stängningen var lägre än öppningen"
    ],
    "why": "Färgen jämför bara stängning med öppning. Priset kan ha fallit en stund under perioden."
   },
   {
    "q": "Ljuset är rött. Var öppnade priset?",
    "fig": "oneRed",
    "o": [
     "Överst på kroppen",
     "Nederst på kroppen",
     "Vid toppen av övre veken",
     "Vid botten av nedre veken"
    ],
    "why": "Ett rött ljus stängde lägre än det öppnade, så öppningen är kroppens överkant."
   },
   {
    "q": "Vad visar den övre veken?",
    "o": [
     "Periodens högsta pris",
     "Öppningspriset",
     "Volymen",
     "Stängningspriset"
    ]
   },
   {
    "m": [
     [
      "Open",
      "Öppningspris"
     ],
     [
      "High",
      "Högsta pris"
     ],
     [
      "Low",
      "Lägsta pris"
     ],
     [
      "Close",
      "Stängningspris"
     ]
    ]
   },
   {
    "q": "Öppning 100, stängning 104, högsta 106, lägsta 99. Vilken färg har ljuset?",
    "o": [
     "Grönt",
     "Rött",
     "Grått",
     "Går inte att avgöra"
    ],
    "why": "Stängningen 104 är högre än öppningen 100, alltså grönt."
   },
   {
    "q": "Samma ljus: öppning 100, stängning 104. Hur stor är kroppen?",
    "o": [
     "4 kr",
     "7 kr",
     "6 kr",
     "2 kr"
    ],
    "why": "Kroppen går från öppning till stängning: 104 − 100 = 4 kr."
   }
  ]
 },
 "u2b": {
  "t": "Tidsramar och volym",
  "c": [
   {
    "t": "Tidsram",
    "d": "Ett ljus kan vara en minut, en timme, en dag eller en vecka. Samma aktie kan stiga på dagsgrafen men falla på timgrafen."
   },
   {
    "t": "Volym",
    "d": "Volym är hur många aktier som handlades. Stora rörelser på hög volym väger oftast tyngre än rörelser på låg volym.",
    "fig": "volume"
   }
  ],
  "q": [
   {
    "q": "På en dagsgraf, vad motsvarar ett ljus?",
    "o": [
     "En handelsdag",
     "En minut",
     "En vecka",
     "Ett år"
    ]
   },
   {
    "q": "Vad visar staplarna under grafen?",
    "fig": "volume",
    "o": [
     "Volym, hur mycket som handlades",
     "Vinsten",
     "Antal ägare",
     "Utdelningen"
    ]
   },
   {
    "q": "Priset bryter upp på mycket låg volym. Hur bör du tolka det?",
    "o": [
     "Med försiktighet, få deltog",
     "Som extra säkert",
     "Volym spelar ingen roll",
     "Som en garanti att priset stiger"
    ],
    "why": "Låg volym betyder att få aktörer stod bakom rörelsen, så den kan lätt vända."
   },
   {
    "q": "Vilka tidsramar använder en daytrader oftast?",
    "o": [
     "Minut- och timgrafer",
     "Månadsgrafer",
     "Årsgrafer",
     "Ingen graf alls"
    ]
   },
   {
    "m": [
     [
      "1D",
      "Ett ljus per dag"
     ],
     [
      "1H",
      "Ett ljus per timme"
     ],
     [
      "1W",
      "Ett ljus per vecka"
     ],
     [
      "Volym",
      "Antal handlade aktier"
     ]
    ]
   }
  ]
 },
 "u3a": {
  "t": "Trender",
  "c": [
   {
    "t": "Upptrend",
    "d": "En upptrend har högre toppar och högre bottnar.",
    "fig": "up"
   },
   {
    "t": "Nedtrend",
    "d": "En nedtrend har lägre toppar och lägre bottnar.",
    "fig": "down"
   },
   {
    "t": "Sidled",
    "d": "När priset studsar mellan ungefär samma nivåer rör det sig i sidled, i ett intervall.",
    "fig": "side"
   }
  ],
  "q": [
   {
    "q": "Vad kännetecknar en upptrend?",
    "o": [
     "Högre toppar och högre bottnar",
     "Lägre toppar och lägre bottnar",
     "Bara gröna ljus",
     "Alltid hög volym"
    ]
   },
   {
    "q": "Vilken trend visar grafen?",
    "fig": "down",
    "o": [
     "Nedtrend",
     "Upptrend",
     "Sidled",
     "Ingen, det är slump"
    ]
   },
   {
    "q": "\"The trend is your friend\". Vad betyder det?",
    "o": [
     "Handla i trendens riktning",
     "Handla alltid mot trenden",
     "Trender varar för evigt",
     "Köp när alla säljer"
    ],
    "why": "Det är oftast lättare att följa en etablerad trend än att gissa när den vänder."
   },
   {
    "q": "Vilken trend visar grafen?",
    "fig": "side",
    "o": [
     "Sidled",
     "Upptrend",
     "Nedtrend",
     "Krasch"
    ]
   },
   {
    "m": [
     [
      "Upptrend",
      "Högre toppar och bottnar"
     ],
     [
      "Nedtrend",
      "Lägre toppar och bottnar"
     ],
     [
      "Sidled",
      "Priset rör sig i ett intervall"
     ],
     [
      "Trendbrott",
      "Mönstret av toppar bryts"
     ]
    ]
   }
  ]
 },
 "u3b": {
  "t": "Stöd och motstånd",
  "c": [
   {
    "t": "Stöd",
    "d": "Stöd är en nivå där priset flera gånger slutat falla, eftersom köpare kliver in där.",
    "fig": "sr"
   },
   {
    "t": "Motstånd",
    "d": "Motstånd är en nivå där priset flera gånger vänt ner, eftersom säljare tar över där.",
    "fig": "sr"
   },
   {
    "t": "Utbrott",
    "d": "När priset bryter igenom motståndet kan det gamla motståndet bli nytt stöd.",
    "fig": "breakout"
   }
  ],
  "q": [
   {
    "q": "Den gröna linjen där priset studsat upp flera gånger kallas…",
    "fig": "sr",
    "o": [
     "Stöd",
     "Motstånd",
     "Trendbrott",
     "Volym"
    ]
   },
   {
    "q": "Den röda linjen där priset vänt ner kallas…",
    "fig": "sr",
    "o": [
     "Motstånd",
     "Stöd",
     "Spread",
     "Medelvärde"
    ]
   },
   {
    "q": "Vad hände i slutet av grafen?",
    "fig": "breakout",
    "o": [
     "Priset bröt upp genom motståndet",
     "Priset föll genom stödet",
     "Ingenting",
     "Handeln stoppades"
    ]
   },
   {
    "q": "Vad händer ofta med gammalt motstånd efter ett utbrott?",
    "o": [
     "Det kan bli nytt stöd",
     "Det försvinner helt",
     "Det blir alltid motstånd igen",
     "Priset måste tillbaka dit direkt"
    ]
   },
   {
    "m": [
     [
      "Stöd",
      "Golv där köpare kliver in"
     ],
     [
      "Motstånd",
      "Tak där säljare tar över"
     ],
     [
      "Utbrott",
      "Priset bryter igenom en nivå"
     ],
     [
      "Intervall",
      "Priset pendlar mellan två nivåer"
     ]
    ]
   }
  ]
 },
 "cA": {
  "t": "Ljusets anatomi",
  "c": [
   {
    "t": "Kroppens storlek",
    "d": "En lång kropp visar att ena sidan dominerade perioden. En kort kropp visar att köpare och säljare var ungefär jämnstarka.",
    "fig": "spinning"
   },
   {
    "t": "Vekar betyder avvisning",
    "d": "En lång veke visar att priset testade en nivå men trycktes tillbaka. Lång nedre veke: köpare avvisade lägre priser. Lång övre veke: säljare avvisade högre priser.",
    "fig": "hammer"
   },
   {
    "t": "Marubozu",
    "d": "Ett ljus helt utan vekar kallas marubozu. En grön marubozu betyder att köparna styrde från första till sista stund.",
    "fig": "marubozuBull"
   }
  ],
  "q": [
   {
    "q": "Vad visar en lång nedre veke?",
    "o": [
     "Köpare tryckte upp priset från lägre nivåer",
     "Säljare tog över helt",
     "Att ingen handlade",
     "Att aktien gett utdelning"
    ],
    "why": "Priset var nere och vände, så köpare avvisade de lägre priserna."
   },
   {
    "q": "Ett ljus har lång kropp och nästan inga vekar. Vad visar det?",
    "o": [
     "Ena sidan dominerade hela perioden",
     "Obeslutsamhet",
     "Låg volym",
     "Ett fel i grafen"
    ]
   },
   {
    "q": "Ett ljus har liten kropp och lika långa vekar åt båda håll. Vad visar det?",
    "o": [
     "Obeslutsamhet",
     "Stark köpkraft",
     "Stark säljkraft",
     "En trend som säkert fortsätter"
    ]
   },
   {
    "m": [
     [
      "Lång kropp",
      "Ena sidan dominerade"
     ],
     [
      "Kort kropp",
      "Jämn kamp"
     ],
     [
      "Lång övre veke",
      "Högre pris avvisades"
     ],
     [
      "Lång nedre veke",
      "Lägre pris avvisades"
     ]
    ]
   }
  ]
 },
 "cB": {
  "t": "Kontext, plats och bekräftelse",
  "c": [
   {
    "t": "Kontext",
    "d": "Samma form kan betyda olika saker. En hammare efter en nedgång är en möjlig botten. Samma form efter en uppgång kallas hängande man och är en varning.",
    "fig": "hangingMan"
   },
   {
    "t": "Plats",
    "d": "Mönster vid viktiga nivåer, som stöd, motstånd eller ett medelvärde, är mer intressanta än mönster mitt i ingenstans.",
    "fig": "sr"
   },
   {
    "t": "Bekräftelse",
    "d": "Vänta gärna på nästa ljus. Ett mönster uppåt bekräftas ofta när nästa ljus stänger över mönstrets högsta pris."
   }
  ],
  "q": [
   {
    "q": "En hammarform dyker upp efter en kraftig uppgång. Vad kallas den då?",
    "o": [
     "Hängande man",
     "Hammare",
     "Doji",
     "Marubozu"
    ],
    "why": "Formen är densamma, men efter en uppgång kallas den hängande man och varnar för en vändning nedåt."
   },
   {
    "q": "Var är ett vändningsmönster uppåt mest intressant?",
    "o": [
     "Vid ett stöd efter en nedgång",
     "Mitt i ett intervall",
     "Vid ett motstånd efter en uppgång",
     "Det spelar ingen roll"
    ]
   },
   {
    "q": "Hur kan ett mönster uppåt bekräftas?",
    "o": [
     "Nästa ljus stänger över mönstrets högsta pris",
     "Mönstret är grönt",
     "Du har en bra känsla",
     "Någon på sociala medier säger det"
    ]
   },
   {
    "q": "Ordna checklistan innan du handlar ett mönster",
    "ord": [
     "Vilken trend råder?",
     "Ligger mönstret vid en viktig nivå?",
     "Har mönstret bekräftats?",
     "Var ligger stop-loss och hur stor är risken?"
    ]
   }
  ]
 },
 "s1": {
  "t": "Doji-familjen",
  "pat": [
   "doji",
   "dragonfly",
   "gravestone",
   "longDoji"
  ]
 },
 "s1b": {
  "t": "Snurrtopp och marubozu",
  "pat": [
   "spinning",
   "marubozuBull",
   "marubozuBear"
  ]
 },
 "s2": {
  "t": "Hammare och stjärnfall",
  "pat": [
   "hammer",
   "invHammer",
   "hangingMan",
   "shootingStar"
  ]
 },
 "d1": {
  "t": "Uppslukande och moln",
  "pat": [
   "bullEng",
   "bearEng",
   "piercing",
   "darkCloud"
  ]
 },
 "d2": {
  "t": "Harami och pincett",
  "pat": [
   "bullHarami",
   "bearHarami",
   "tweezBot",
   "tweezTop"
  ]
 },
 "t1": {
  "t": "Stjärnor, soldater och kråkor",
  "pat": [
   "morningStar",
   "eveningStar",
   "soldiers",
   "crows"
  ]
 },
 "t2": {
  "t": "Inifrån och tre metoder",
  "pat": [
   "insideUp",
   "insideDown",
   "risingThree",
   "fallingThree"
  ]
 },
 "h1": {
  "t": "Handla mönster",
  "c": [
   {
    "t": "Ingång",
    "d": "En vanlig ingång efter ett mönster uppåt är när priset bryter över mönstrets högsta pris."
   },
   {
    "t": "Stop-loss",
    "d": "Stop-loss läggs ofta strax under mönstrets lägsta pris. Bryts den nivån har mönstret misslyckats.",
    "fig": "bullEng"
   },
   {
    "t": "Mål",
    "d": "Målet sätts gärna vid nästa motstånd. Jämför avståndet till målet med avståndet till stoppen: det är din risk/reward."
   },
   {
    "t": "Falska signaler",
    "d": "Många mönster misslyckas. Därför är stop-loss och liten risk per affär viktigare än att hitta det perfekta mönstret."
   }
  ],
  "q": [
   {
    "q": "Du köper efter en uppslukande uppåt. Var är en logisk stop-loss?",
    "o": [
     "Strax under mönstrets lägsta pris",
     "Strax över mönstrets högsta pris",
     "Vid gårdagens stängning",
     "Ingen stop-loss behövs"
    ]
   },
   {
    "q": "Hammarens högsta är 52 kr och lägsta 48 kr. Du köper på 52,10 kr och sätter stop på 47,90 kr. Hur stor är risken per aktie?",
    "o": [
     "4,20 kr",
     "4 kr",
     "2,10 kr",
     "0,10 kr"
    ],
    "why": "52,10 − 47,90 = 4,20 kr per aktie."
   },
   {
    "q": "Varför är hög volym på bekräftelseljuset bra?",
    "o": [
     "Fler aktörer står bakom rörelsen",
     "Det sänker avgiften",
     "Det garanterar vinst",
     "Det spelar ingen roll"
    ]
   },
   {
    "q": "Ett mönster misslyckas och stoppen löser ut. Vad var det?",
    "o": [
     "En normal del av trading",
     "Bevis på att mönster aldrig fungerar",
     "Ett skäl att ta bort stop-loss",
     "Ett skäl att dubbla nästa insats"
    ]
   },
   {
    "m": [
     [
      "Ingång",
      "Över mönstrets högsta"
     ],
     [
      "Stop-loss",
      "Under mönstrets lägsta"
     ],
     [
      "Mål",
      "Nästa motstånd"
     ],
     [
      "Bekräftelse",
      "Nästa ljus visar riktningen"
     ]
    ]
   }
  ]
 },
 "u5a": {
  "t": "Glidande medelvärde",
  "c": [
   {
    "t": "Medelvärde",
    "d": "Ett glidande medelvärde (MA) är snittpriset för de senaste perioderna, till exempel 20 dagar. Det jämnar ut bruset och visar trenden.",
    "fig": "ma"
   },
   {
    "t": "Pris och MA",
    "d": "Ligger priset över ett stigande medelvärde ser trenden positiv ut. Ligger det under ett fallande ser den negativ ut."
   }
  ],
  "q": [
   {
    "q": "Stängningspriser: 10, 12, 14. Vad är 3-dagars medelvärdet?",
    "o": [
     "12",
     "14",
     "36",
     "10"
    ],
    "why": "(10 + 12 + 14) ÷ 3 = 12."
   },
   {
    "q": "Stängningspriser: 20, 22, 21, 25. Vad är MA4?",
    "o": [
     "22",
     "25",
     "21",
     "23"
    ],
    "why": "(20 + 22 + 21 + 25) ÷ 4 = 88 ÷ 4 = 22."
   },
   {
    "q": "Priset ligger över ett stigande medelvärde. Vad tyder det på?",
    "fig": "ma",
    "o": [
     "En upptrend",
     "En nedtrend",
     "Ingenting alls",
     "Att aktien måste säljas"
    ]
   },
   {
    "q": "Varför ligger ett medelvärde efter priset?",
    "o": [
     "Det bygger på gamla priser",
     "Det är felräknat",
     "Det visar framtiden",
     "Det visar volym"
    ]
   }
  ]
 },
 "u5b": {
  "t": "RSI",
  "c": [
   {
    "t": "RSI",
    "d": "RSI mäter hur starka de senaste rörelserna varit, på en skala från 0 till 100. Över 70 kallas ofta överköpt, under 30 översålt.",
    "fig": "rsi"
   },
   {
    "t": "Varning",
    "d": "Överköpt betyder inte att priset måste falla. I starka trender kan RSI ligga högt länge."
   }
  ],
  "q": [
   {
    "q": "RSI är 82. Hur beskrivs det oftast?",
    "o": [
     "Överköpt",
     "Översålt",
     "Neutralt",
     "Ogiltigt"
    ]
   },
   {
    "q": "RSI är 24. Hur beskrivs det oftast?",
    "o": [
     "Översålt",
     "Överköpt",
     "Neutralt",
     "Ogiltigt"
    ]
   },
   {
    "q": "Vilken skala har RSI?",
    "o": [
     "0 till 100",
     "−1 till 1",
     "0 till 10",
     "Obegränsad"
    ]
   },
   {
    "q": "RSI är 75 i en stark upptrend. Vad är en rimlig slutsats?",
    "o": [
     "Trenden är stark, men var vaksam",
     "Sälj allt direkt",
     "Köp med hävstång",
     "RSI är trasig"
    ],
    "why": "Högt RSI visar styrka. Det är en varningsflagga, inte en säljsignal i sig."
   },
   {
    "m": [
     [
      "MA",
      "Snittpris över tid"
     ],
     [
      "RSI",
      "Styrka 0 till 100"
     ],
     [
      "Överköpt",
      "RSI över 70"
     ],
     [
      "Översålt",
      "RSI under 30"
     ]
    ]
   }
  ]
 },
 "u6a": {
  "t": "Risk per affär",
  "c": [
   {
    "t": "1–2-procentsregeln",
    "d": "Många traders riskerar högst 1–2 % av kontot per affär. Då klarar kontot en lång rad förluster."
   },
   {
    "t": "Stop-loss",
    "d": "En stop-loss är en order som säljer automatiskt om priset faller till en nivå du bestämt. Den begränsar förlusten."
   },
   {
    "t": "Förluster är asymmetriska",
    "d": "Förlorar du 50 % måste du sedan vinna 100 % för att komma tillbaka. Därför är det viktigast att skydda kontot."
   }
  ],
  "q": [
   {
    "q": "Kontot är 10 000 kr och du riskerar 1 %. Hur mycket får du förlora på affären?",
    "o": [
     "100 kr",
     "1 000 kr",
     "10 kr",
     "1 kr"
    ],
    "why": "1 % av 10 000 kr är 100 kr."
   },
   {
    "q": "Kontot är 50 000 kr och du riskerar 2 %. Hur mycket är det?",
    "o": [
     "1 000 kr",
     "2 000 kr",
     "500 kr",
     "100 kr"
    ],
    "why": "0,02 × 50 000 = 1 000 kr."
   },
   {
    "q": "Varför använder man stop-loss?",
    "o": [
     "För att begränsa förlusten",
     "För att garantera vinst",
     "För att slippa courtage",
     "För att köpa billigare"
    ]
   },
   {
    "q": "Du förlorar 50 % av kontot. Hur mycket måste du sedan vinna för att vara tillbaka?",
    "o": [
     "100 %",
     "50 %",
     "25 %",
     "75 %"
    ],
    "why": "Från 10 000 till 5 000 kr. För att nå 10 000 igen behövs +5 000, alltså 100 % av 5 000."
   },
   {
    "q": "Vad gör hävstång?",
    "o": [
     "Förstärker både vinster och förluster",
     "Tar bort risken",
     "Ger bara större vinster",
     "Sänker avgiften"
    ]
   },
   {
    "q": "Kan en stop-loss sälja till ett sämre pris än du valt?",
    "o": [
     "Ja, om priset hoppar förbi nivån",
     "Nej, aldrig",
     "Bara på helger",
     "Bara på ett ISK"
    ],
    "why": "En stop-loss blir en vanlig säljorder när nivån nås. Öppnar priset långt under, till exempel efter nyheter över natten, säljs aktien till nästa tillgängliga pris."
   }
  ]
 },
 "u6b": {
  "t": "Positionsstorlek och risk/reward",
  "c": [
   {
    "t": "Positionsstorlek",
    "d": "Antal aktier = belopp du riskerar ÷ avståndet till stop-loss. Riskerar du 100 kr och stoppen ligger 2 kr under köppriset köper du 50 aktier."
   },
   {
    "t": "Risk/reward",
    "d": "Risk/reward jämför möjlig förlust med möjlig vinst. Riskerar du 100 kr för att kunna tjäna 300 kr är kvoten 1:3."
   }
  ],
  "q": [
   {
    "q": "Du riskerar 200 kr. Köp 50 kr, stop-loss 46 kr. Hur många aktier?",
    "o": [
     "50",
     "40",
     "4",
     "200"
    ],
    "why": "Risk per aktie: 50 − 46 = 4 kr. 200 ÷ 4 = 50 aktier."
   },
   {
    "q": "Du riskerar 300 kr. Köp 120 kr, stop-loss 117 kr. Hur många aktier?",
    "o": [
     "100",
     "300",
     "40",
     "117"
    ],
    "why": "Risk per aktie: 3 kr. 300 ÷ 3 = 100 aktier."
   },
   {
    "q": "Köp 100 kr, stop-loss 95 kr, mål 115 kr. Vilken risk/reward?",
    "o": [
     "1:3",
     "1:2",
     "3:1",
     "1:1"
    ],
    "why": "Risk 5 kr, möjlig vinst 15 kr. 5:15 = 1:3."
   },
   {
    "q": "Med risk/reward 1:3, hur ofta måste du ha rätt för att gå jämnt, utan avgifter?",
    "o": [
     "25 %",
     "50 %",
     "75 %",
     "33 %"
    ],
    "why": "Vinner du 1 av 4 affärer: +3 − 1 − 1 − 1 = 0."
   },
   {
    "q": "Ordna stegen i en riskplan",
    "ord": [
     "Bestäm hur många kronor du riskerar",
     "Sätt stop-loss på en logisk nivå",
     "Räkna ut antal aktier",
     "Lägg ordern med stop-loss"
    ]
   }
  ]
 },
 "u7a": {
  "t": "Tradingpsykologi",
  "c": [
   {
    "t": "FOMO",
    "d": "FOMO, rädslan att missa något, får dig att jaga en aktie som redan rusat. Ofta köper man då nära toppen."
   },
   {
    "t": "Hämndtrading",
    "d": "Efter en förlust vill man vinna tillbaka direkt och tar större risk. Det gör ofta förlusten större."
   },
   {
    "t": "Tradingplan",
    "d": "En tradingplan bestämmer i förväg vad du handlar, när du går in, var stoppen ligger och hur mycket du riskerar."
   }
  ],
  "q": [
   {
    "q": "En aktie har stigit 40 % i dag och alla pratar om den. Vad är klokast?",
    "o": [
     "Följ din plan och jaga inte",
     "Köp så mycket du kan",
     "Låna pengar och köp",
     "Köp utan stop-loss"
    ]
   },
   {
    "q": "Du har förlorat tre affärer i rad. Vad bör du göra?",
    "o": [
     "Pausa och gå igenom affärerna",
     "Dubbla insatsen",
     "Ta bort stop-loss",
     "Handla snabbare"
    ]
   },
   {
    "q": "Vad ska en tradingplan innehålla?",
    "o": [
     "Regler för in, ut och risk",
     "Bara populära aktier",
     "Tips från sociala medier",
     "Inget, det är känsla"
    ]
   },
   {
    "q": "Varför föra en tradingdagbok?",
    "o": [
     "För att lära av dina misstag",
     "Bara för Skatteverket",
     "För att visa vänner",
     "Det behövs inte"
    ]
   },
   {
    "m": [
     [
      "FOMO",
      "Rädslan att missa en uppgång"
     ],
     [
      "Hämndtrading",
      "Jaga tillbaka en förlust"
     ],
     [
      "Överhandel",
      "Handla för ofta"
     ],
     [
      "Tradingplan",
      "Regler bestämda i förväg"
     ]
    ]
   }
  ]
 },
 "u8a": {
  "t": "Kostnader och bluffar",
  "c": [
   {
    "t": "Avgifter",
    "d": "Courtage och spread äter av vinsten. Ju oftare du handlar, desto mer betalar du."
   },
   {
    "t": "ISK",
    "d": "I Sverige finns investeringssparkonto (ISK). Där betalar du en schablonskatt varje år i stället för skatt på varje vinst. Kontrollera aktuella regler hos Skatteverket."
   },
   {
    "t": "Varningstecken",
    "d": "Löften om garanterad avkastning, stress att agera nu och \"signalgrupper\" som vill ha insättningar är klassiska tecken på bedrägeri. Kontrollera alltid företag hos Finansinspektionen."
   }
  ],
  "q": [
   {
    "q": "Någon lovar 10 % i veckan, garanterat. Vad är det troligen?",
    "o": [
     "Ett bedrägeri",
     "En bra affär",
     "Ett ISK",
     "En indexfond"
    ],
    "why": "Ingen seriös aktör kan garantera hög avkastning. Det är ett typiskt bedrägeritecken."
   },
   {
    "q": "Vad är courtage?",
    "o": [
     "Mäklarens avgift per affär",
     "Skatt på vinst",
     "Utdelning",
     "Ränta"
    ]
   },
   {
    "q": "Du handlar 10 gånger om dagen. Vad händer med avgifterna?",
    "o": [
     "De blir en stor kostnad över tid",
     "Inget",
     "Det blir gratis",
     "Du betalar bara en gång"
    ]
   },
   {
    "q": "Hur beskattas ett ISK?",
    "o": [
     "Med en årlig schablonskatt",
     "Med skatt på varje vinst",
     "Inte alls",
     "Bara vid förlust"
    ]
   },
   {
    "q": "Vilket är ett varningstecken?",
    "o": [
     "\"Agera nu, platserna tar slut!\"",
     "Tydlig information om risker",
     "En bank med tillstånd",
     "Möjlighet att ångra"
    ]
   },
   {
    "m": [
     [
      "Courtage",
      "Avgift per affär"
     ],
     [
      "Spread",
      "Gapet mellan köp och sälj"
     ],
     [
      "ISK",
      "Konto med schablonskatt"
     ],
     [
      "FI",
      "Svensk finanstillsyn"
     ]
    ]
   }
  ]
 }
};
export const UNIT_DEFS: UnitDef[] = [
 {
  "key": "bas",
  "title": "Grunderna",
  "les": [
   "u1a",
   "u1b"
  ],
  "gen": null
 },
 {
  "key": "graf",
  "title": "Läsa grafer",
  "les": [
   "u2a",
   "u2b"
  ],
  "gen": "candle"
 },
 {
  "key": "trend",
  "title": "Trender och nivåer",
  "les": [
   "u3a",
   "u3b"
  ],
  "gen": "trend"
 },
 {
  "key": "anat",
  "title": "Candlestick: grunderna",
  "les": [
   "cA",
   "cB"
  ],
  "gen": "candle"
 },
 {
  "key": "p1",
  "title": "Enljusmönster",
  "les": [
   "s1",
   "s1b",
   "s2"
  ],
  "gen": "p1"
 },
 {
  "key": "p2",
  "title": "Tvåljusmönster",
  "les": [
   "d1",
   "d2"
  ],
  "gen": "p2"
 },
 {
  "key": "p3",
  "title": "Treljusmönster",
  "les": [
   "t1",
   "t2"
  ],
  "gen": "p3"
 },
 {
  "key": "hm",
  "title": "Handla mönster",
  "les": [
   "h1"
  ],
  "gen": "spot"
 },
 {
  "key": "ind",
  "title": "Indikatorer",
  "les": [
   "u5a",
   "u5b"
  ],
  "gen": "ind"
 },
 {
  "key": "risk",
  "title": "Riskhantering",
  "les": [
   "u6a",
   "u6b"
  ],
  "gen": "risk"
 },
 {
  "key": "psy",
  "title": "Psykologi",
  "les": [
   "u7a"
  ],
  "gen": null
 },
 {
  "key": "cost",
  "title": "Kostnader och bluffar",
  "les": [
   "u8a"
  ],
  "gen": null
 }
];
export const GENNAME: Record<string, string> = {"candle":"Läs ljusen","trend":"Hitta trenden","p1":"Känn igen enljusmönster","p2":"Känn igen tvåljusmönster","p3":"Känn igen treljusmönster","spot":"Mönsterjakt","ind":"Räkna indikatorer","risk":"Räkna risk"};
export const GLOSS_EXTRA: [string, string][] = [['Depå','Konto där dina aktier och fonder förvaras.'],['Index','Ett mått på hur en grupp aktier utvecklas, till exempel OMXS30.'],['Fond','En samling värdepapper som många sparare äger tillsammans.'],['Likviditet','Hur lätt något går att köpa eller sälja utan att priset påverkas.'],['Volatilitet','Hur mycket och hur snabbt priset svänger.'],['Blankning','Att tjäna på fallande priser genom att sälja lånade aktier. Hög risk.'],['Take profit','En order som säljer automatiskt när priset når ditt vinstmål.'],['Diversifiering','Att sprida pengarna på flera tillgångar för att minska risken.'],['Bull / bear','Bull är en stigande marknad, bear en fallande.']];
