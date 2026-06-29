const fs = require('fs');

// Ultra-compact format: type|level|id|german|english|extra1|extra2|emoji|exam
// Types: n=noun, v=verb, a=adverb, p=phrase, adj=adjective, prep=preposition,
//        conj=conjunction, pron=pronoun, t=time, col=color, num=number,
//        q=question, c=case, g=grammar

// Existing cards converted to compact format
const EXISTING = [
  "n|a1|n1|der Tisch|table|der|die Tische|table",
  "n|a1|n2|die Schule|school|die|die Schulen|school",
  "n|a1|n3|das Buch|book|das|die Bucher|book",
  "n|a1|n4|der Freund|friend|der|die Freunde|friend",
  "n|a1|n5|die Familie|family|die|die Familien|family",
  "n|a1|n6|das Haus|house|das|die Hauser|house",
  "n|a1|n7|der Mann|man|der|die Manner|man",
  "n|a1|n8|die Frau|woman|die|die Frauen|woman",
  "n|a1|n9|das Kind|child|das|die Kinder|child",
  "n|a1|n10|der Hund|dog|der|die Hunde|dog",
  "n|a1|n11|der Stuhl|chair|der|die Stuhle|chair",
  "n|a1|n12|das Bett|bed|das|die Betten|bed",
  "n|a1|n13|die Kuche|kitchen|die|die Kuchen|kitchen",
  "n|a1|n14|das Bad|bathroom|das|die Bader|bath",
  "n|a1|n15|das Brot|bread|das|die Brote|bread",
  "n|a1|n16|die Milch|milk|die|-|milk",
  "n|a1|n17|der Kaffee|coffee|der|-|coffee",
  "n|a1|n18|der Kopf|head|der|die Kopfe|head",
  "n|a1|n19|die Hand|hand|die|die Hande|hand",
  "n|a1|n20|das Auge|eye|das|die Augen|eye",
  "n|a1|n21|der Fuß|foot|der|die Fuße|foot",
  "n|a1|n22|das Hemd|shirt|das|die Hemden|shirt",
  "n|a1|n23|die Hose|pants|die|die Hosen|pants",
  "n|a1|n24|der Schuh|shoe|der|die Schuhe|shoe",
  "n|a1|n25|die Jacke|jacket|die|die Jacken|jacket",
  "n|a1|n26|die Farbe|color|die|die Farben|color",
  "n|a1|n27|die Stadt|city|die|die Stadte|city",
  "n|a1|n28|der Zug|train|der|die Zuge|train",
  "n|a1|n29|der Bus|bus|der|die Busse|bus",
  "n|a1|n30|das Fahrrad|bicycle|das|die Fahrrader|bike",
  "n|a1|n31|das Wetter|weather|das|-|sun",
  "n|a1|n32|die Sonne|sun|die|-|sun",
  "n|a1|n33|der Regen|rain|der|-|rain",
  "v|a1|v1|sein|to be|ist/war/ist gewesen|star|1",
  "v|a1|v2|haben|to have|hat/hatte/hat gehabt|muscle|1",
  "v|a1|v3|werden|to become|wird/wurde/ist geworden|cycle|1",
  "v|a1|v4|konnen|can/be able to|kann/konnte/hat gekonnt|check|1",
  "v|a1|v5|mussen|must/have to|muss/musste/hat gemusst|warning|1",
  "v|a1|v6|sagen|to say|sagt/sagte/hat gesagt|speech|0",
  "v|a1|v7|machen|to do/make|macht/machte/hat gemacht|tool|0",
  "v|a1|v8|gehen|to go|geht/ging/ist gegangen|walk|0",
  "v|a1|v9|kommen|to come|kommt/kam/ist gekommen|door|0",
  "v|a1|v10|sehen|to see|sieht/sah/hat gesehen|eye|0",
  "v|a1|v11|geben|to give|gibt/gab/hat gegeben|give|0",
  "v|a1|v12|essen|to eat|isst/aß/hat gegessen|eat|0",
  "v|a1|v13|trinken|to drink|trinkt/trank/hat getrunken|drink|0",
  "v|a1|v14|sprechen|to speak|spricht/sprach/hat gesprochen|speak|0",
  "v|a1|v15|nehmen|to take|nimmt/nahm/hat genommen|take|0",
  "v|a1|v16|wohnen|to live|wohnt/wohnte/hat gewohnt|house|0",
  "v|a1|v17|kaufen|to buy|kauft/kaufte/hat gekauft|cart|0",
  "v|a1|v18|suchen|to search|sucht/suchte/hat gesucht|search|0",
  "v|a1|v19|finden|to find|findet/fand/hat gefunden|find|0",
  "v|a1|v20|brauchen|to need|braucht/brauchte/hat gebraucht|need|0",
  "v|a1|v21|spielen|to play|spielt/spielte/hat gespielt|play|0",
  "a|a1|a1|heute|today|||today",
  "a|a1|a2|morgen|tomorrow|||tomorrow",
  "a|a1|a3|gestern|yesterday|||yesterday",
  "a|a1|a4|jetzt|now|||now",
  "a|a1|a5|hier|here|||here",
  "a|a1|a6|da|there|||there",
  "a|a1|a7|sehr|very|||very",
  "a|a1|a8|auch|also/too|||also",
  "a|a1|a9|nicht|not|||no",
  "a|a1|a10|viel|much/many|||many",
  "p|a1|p1|Guten Morgen|Good morning|||sunrise",
  "p|a1|p2|Guten Tag|Good day/Hello|||sun",
  "p|a1|p3|Guten Abend|Good evening|||sunset",
  "p|a1|p4|Gute Nacht|Good night|||moon",
  "p|a1|p5|Tschuss|Bye!|||wave",
  "p|a1|p6|Danke|Thanks|||pray",
  "p|a1|p7|Bitte|Please/You are welcome|||please",
  "p|a1|p8|Prost!|Cheers!|||cheers",
  "p|a1|p9|Entschuldigung|Excuse me/Sorry|||sorry",
  "p|a1|p10|Wie geht es Ihnen?|How are you?|||hello",
  "n|a2|n34|die Arbeit|work/job|die|die Arbeiten|work|1",
  "n|a2|n35|das Buro|office|das|die Buros|office",
  "n|a2|n36|der Beruf|profession|der|die Berufe|tie",
  "n|a2|n37|der Arzt|doctor|der|die Arzte|doctor",
  "n|a2|n38|das Krankenhaus|hospital|das|die Krankenhauser|hospital",
  "n|a2|n39|der Schmerz|pain|der|die Schmerzen|pain",
  "n|a2|n40|das Restaurant|restaurant|das|die Restaurants|restaurant",
  "n|a2|n41|die Rechnung|bill|die|die Rechnungen|receipt",
  "n|a2|n42|das Hotel|hotel|das|die Hotels|hotel",
  "n|a2|n43|die Reise|trip|die|die Reisen|travel",
  "n|a2|n44|die Fahrkarte|ticket|die|die Fahrkarten|ticket",
  "n|a2|n45|der Bahnhof|train station|der|die Bahnhofe|station",
  "n|a2|n46|der Flughafen|airport|der|die Flughafen|airport",
  "n|a2|n47|die Kleidung|clothing|die|-|clothing",
  "n|a2|n48|der Preis|price|der|die Preise|price",
  "n|a2|n49|das Handy|mobile phone|das|die Handys|phone",
  "n|a2|n50|der Geburtstag|birthday|der|die Geburtstage|birthday",
  "n|a2|n51|das Geschenk|gift|das|die Geschenke|gift",
  "n|a2|n52|die Katze|cat|die|die Katzen|cat",
  "n|a2|n53|das Auto|car|das|die Autos|car",
  "n|a2|n54|das Wasser|water|das|-|water",
  "n|a2|n55|die Blume|flower|die|die Blumen|flower",
  "n|a2|n56|der Baum|tree|der|die Baume|tree",
  "n|a2|n57|der Schnee|snow|der|-|snow",
  "v|a2|v22|arbeiten|to work|arbeitet/arbeitete/hat gearbeitet|work|1",
  "v|a2|v23|lernen|to learn|lernt/lernte/hat gelernt|learn|1",
  "v|a2|v24|verstehen|to understand|versteht/verstand/hat verstanden|understand|1",
  "v|a2|v25|schreiben|to write|schreibt/schrieb/hat geschrieben|write|1",
  "v|a2|v26|lesen|to read|liest/las/hat gelesen|read|1",
  "v|a2|v27|fahren|to drive/go|fahrt/fuhr/ist gefahren|drive|0",
  "v|a2|v28|helfen|to help|hilft/half/hat geholfen|help|0",
  "v|a2|v29|bringen|to bring|bringt/brachte/hat gebracht|bring|0",
  "v|a2|v30|denken|to think|denkt/dachte/hat gedacht|think|1",
  "v|a2|v31|antworten|to answer|antwortet/antwortete/hat geantwortet|answer|0",
  "v|a2|v32|fragen|to ask|fragt/fragte/hat gefragt|ask|0",
  "v|a2|v33|bestellen|to order|bestellt/bestellte/hat bestellt|order|0",
  "v|a2|v34|bezahlen|to pay|bezahlt/bezahlte/hat bezahlt|pay|0",
  "v|a2|v35|kochen|to cook|kocht/kochte/hat gekocht|cook|0",
  "v|a2|v36|wissen|to know|weiß/wusste/hat gewusst|know|0",
  "v|a2|v37|glauben|to believe|glaubt/glaubte/hat geglaubt|believe|0",
  "v|a2|v38|offnen|to open|offnet/offnete/hat geoffnet|open|0",
  "v|a2|v39|schließen|to close|schließt/schloss/hat geschlossen|close|0",
  "a|a2|a11|immer|always|||always",
  "a|a2|a12|oft|often|||often",
  "a|a2|a13|manchmal|sometimes|||sometimes",
  "a|a2|a14|dort|over there|||there",
  "a|a2|a15|links|left|||left",
  "a|a2|a16|rechts|right|||right",
  "a|a2|a17|geradeaus|straight ahead|||straight",
  "a|a2|a18|vielleicht|maybe|||maybe",
  "a|a2|a19|deshalb|therefore|||therefore",
  "a|a2|a20|zusammen|together|||together",
  "p|a2|p11|Bitte schon|You are welcome|||smile",
  "p|a2|p12|Danke schon|Thank you very much|||thanks",
  "p|a2|p13|Wo ist das?|Where is it?|||where",
  "p|a2|p14|Wie viel kostet das?|How much is that?|||money",
  "p|a2|p15|Ich mochte ...|I would like...|||want",
  "p|a2|p16|Konnen Sie mir helfen?|Can you help me?|||help",
  "p|a2|p17|Es tut mir leid|I am sorry|||sorry",
  "p|a2|p18|Gute Reise!|Have a good trip!|||travel",
  "p|a2|p19|Alles Gute!|All the best!|||celebration",
  "p|a2|p20|Nichts zu danken|Do not mention it|||smile",
  "n|b1|n58|die Ausbildung|education/training|die|die Ausbildungen|education|1",
  "n|b1|n59|das Studium|university studies|das|die Studien|study|1",
  "n|b1|n60|die Prufung|exam/test|die|die Prufungen|exam|1",
  "n|b1|n61|der Kurs|course|der|die Kurse|course",
  "n|b1|n62|die Note|grade|die|die Noten|grade|1",
  "n|b1|n63|die Firma|company|die|die Firmen|company",
  "n|b1|n64|die Erfahrung|experience|die|die Erfahrungen|experience|1",
  "n|b1|n65|die Bewerbung|application|die|die Bewerbungen|application",
  "n|b1|n66|die Beziehung|relationship|die|die Beziehungen|relationship",
  "n|b1|n67|die Umwelt|environment|die|-|earth",
  "n|b1|n68|die Energie|energy|die|die Energien|energy",
  "n|b1|n69|die Gesellschaft|society|die|die Gesellschaften|society",
  "n|b1|n70|die Politik|politics|die|-|politics",
  "n|b1|n71|die Kultur|culture|die|die Kulturen|culture",
  "n|b1|n72|die Geschichte|history/story|die|die Geschichten|history",
  "n|b1|n73|die Bildung|education|die|-|education",
  "n|b1|n74|der Computer|computer|der|die Computer|computer",
  "v|b1|v40|beginnen|to begin|beginnt/begann/hat begonnen|begin|1",
  "v|b1|v41|beschreiben|to describe|beschreibt/beschrieb/hat beschrieben|describe|1",
  "v|b1|v42|erklaren|to explain|erklart/erklarte/hat erklart|explain|1",
  "v|b1|v43|erwarten|to expect|erwartet/erwartete/hat erwartet|expect|0",
  "v|b1|v44|sich freuen|to be happy about|freut/freute/hat gefreut|happy|0",
  "v|b1|v45|sich interessieren|to be interested|interessiert/interessierte/hat interessiert|interested|0",
  "v|b1|v46|leben|to live|lebt/lebte/hat gelebt|live|0",
  "v|b1|v47|passieren|to happen|passiert/passierte/ist passiert|happen|0",
  "v|b1|v48|reisen|to travel|reist/reiste/ist gereist|travel|0",
  "v|b1|v49|studieren|to study|studiert/studierte/hat studiert|study|0",
  "v|b1|v50|teilnehmen|to participate|nimmt teil/nahm teil/hat teilgenommen|participate|1",
  "v|b1|v51|verbringen|to spend time|verbringt/verbrachte/hat verbracht|time|0",
  "v|b1|v52|vorschlagen|to suggest|schlagt vor/schlug vor/hat vorgeschlagen|suggest|0",
  "v|b1|v53|sich vorstellen|to introduce|stellt vor/stellte vor/hat vorgestellt|introduce|0",
  "v|b1|v54|gewinnen|to win|gewinnt/gewann/hat gewonnen|win|0",
  "v|b1|v55|wahlen|to choose/elect|wahlt/wahlte/hat gewahlt|choose|0",
  "v|b1|v56|genießen|to enjoy|genießt/genoss/hat genossen|enjoy|0",
  "a|b1|a21|sofort|immediately|||immediately",
  "a|b1|a22|selten|rarely|||rarely",
  "a|b1|a23|nie|never|||never",
  "a|b1|a24|ziemlich|quite|||quite",
  "a|b1|a25|wirklich|really|||really",
  "a|b1|a26|außerdem|besides/moreover|||plus",
  "a|b1|a27|trotzdem|nevertheless|||still",
  "a|b1|a28|deswegen|therefore|||therefore",
  "a|b1|a29|besonders|especially|||star",
  "a|b1|a30|allerdings|however|||but",
  "p|b1|p21|Ich verstehe nicht|I do not understand|||confused",
  "p|b1|p22|Ich bin mude|I am tired|||tired",
  "p|b1|p23|Das gefallt mir|I like that|||heart",
  "p|b1|p24|Meiner Meinung nach|In my opinion|||think",
  "p|b1|p25|Ich glaube, dass ...|I believe that...|||believe",
  "p|b1|p26|Es kommt darauf an|It depends|||depends",
  "p|b1|p27|Ich habe Lust auf ...|I feel like...|||want",
  "p|b1|p28|Das macht nichts|That does not matter|||ok",
  "p|b1|p29|Ich bin einverstanden|I agree|||agree",
  "p|b1|p30|Keine Ahnung|No idea|||shrug",
  "n|b2|n75|die Wirtschaft|economy|die|-|economy",
  "n|b2|n76|das Unternehmen|company|das|die Unternehmen|company",
  "n|b2|n77|die Entwicklung|development|die|die Entwicklungen|growth",
  "n|b2|n78|die Forschung|research|die|die Forschungen|research",
  "n|b2|n79|die Wissenschaft|science|die|die Wissenschaften|science",
  "n|b2|n80|das Recht|right/law|das|die Rechte|law",
  "n|b2|n81|das Gesetz|law|das|die Gesetze|law",
  "n|b2|n82|die Freiheit|freedom|die|-|freedom",
  "n|b2|n83|die Zukunft|future|die|-|future",
  "n|b2|n84|die Entscheidung|decision|die|die Entscheidungen|decision|1",
  "n|b2|n85|die Veranderung|change|die|die Veranderungen|change",
  "n|b2|n86|die Moglichkeit|possibility|die|die Moglichkeiten|possibility|1",
  "n|b2|n87|der Vertrag|contract|der|die Vertrage|contract",
  "n|b2|n88|die Steuer|tax|die|die Steuern|tax",
  "n|b2|n89|der Markt|market|der|die Markte|market",
  "n|b2|n90|die Krise|crisis|die|die Krisen|crisis",
  "n|b2|n91|die Gerechtigkeit|justice|die|-|justice",
  "n|b2|n92|die Verantwortung|responsibility|die|-|responsibility|1",
  "n|b2|n93|die Wahrheit|truth|die|-|truth",
  "v|b2|v57|beeinflussen|to influence|beeinflusst/beeinflusste/hat beeinflusst|influence|0",
  "v|b2|v58|vermeiden|to avoid|vermeidet/vermied/hat vermieden|avoid|0",
  "v|b2|v59|entwickeln|to develop|entwickelt/entwickelte/hat entwickelt|develop|0",
  "v|b2|v60|unterstutzen|to support|unterstutzt/unterstutzte/hat unterstutzt|support|0",
  "v|b2|v61|analysieren|to analyze|analysiert/analysierte/hat analysiert|analyze|0",
  "v|b2|v62|beweisen|to prove|beweist/bewies/hat bewiesen|prove|0",
  "v|b2|v63|diskutieren|to discuss|diskutiert/diskutierte/hat diskutiert|discuss|1",
  "v|b2|v64|sich entscheiden|to decide|entscheidet/entschied/hat entschieden|decide|1",
  "v|b2|v65|ermoglichen|to enable|ermoglicht/ermoglichte/hat ermoglicht|enable|0",
  "v|b2|v66|grunden|to found|grundet/grundete/hat gegrundet|found|0",
  "v|b2|v67|vergleichen|to compare|vergleicht/verglich/hat verglichen|compare|1",
  "v|b2|v68|verursachen|to cause|verursacht/verursachte/hat verursacht|cause|0",
  "v|b2|v69|erhohen|to increase|erhoht/erhohste/hat erhoht|increase|0",
  "v|b2|v70|leisten|to achieve|leistet/leistete/hat geleistet|achieve|0",
  "a|b2|a31|fast|almost|||almost",
  "a|b2|a32|uberall|everywhere|||everywhere",
  "a|b2|a33|moglicherweise|possibly|||maybe",
  "a|b2|a34|durchaus|absolutely|||check",
  "a|b2|a35|inzwischen|meanwhile|||meanwhile",
  "a|b2|a36|dennoch|nevertheless|||still",
  "a|b2|a37|folglich|consequently|||consequence",
  "a|b2|a38|keinesfalls|by no means|||no",
  "a|b2|a39|beinahe|nearly|||almost",
  "a|b2|a40|nirgends|nowhere|||nowhere",
  "p|b2|p31|Es handelt sich um ...|It is about...|||about",
  "p|b2|p32|Ich freue mich darauf|I look forward to it|||excited",
  "p|b2|p33|Das ist mir egal|I do not care|||careless",
  "p|b2|p34|Aus meiner Sicht|From my perspective|||view",
  "p|b2|p35|Ich bin der Meinung, dass|I am of the opinion that|||opinion",
  "p|b2|p36|Es besteht die Moglichkeit|There is the possibility|||possible",
  "p|b2|p37|Es kommt darauf an, ob|It depends whether|||depends",
  "p|b2|p38|Im Großen und Ganzen|By and large|||overall",
  "q|a1|q1|Wer?|Who?|||who|1",
  "q|a1|q2|Was?|What?|||what|1",
  "q|a1|q3|Wo?|Where?|||where|1",
  "q|a1|q4|Wohin?|Where to?|||whereto|1",
  "q|a1|q5|Woher?|Where from?|||wherefrom|1",
  "q|a1|q6|Wie?|How?|||how|1",
  "q|a2|q7|Wann?|When?|||when|1",
  "q|a2|q8|Warum?|Why?|||why|1",
  "q|b1|q9|Welcher / Welche / Welches?|Which?|||which|1",
  "q|a1|q10|Ja/Nein Frage|Yes/No question (verb first)|||yesno|1",
  "c|a1|c1|Nominativ|Subject case (who/what)|||subject|1",
  "c|a1|c2|Akkusativ|Direct object (whom/what)|||target|1",
  "c|a2|c3|Dativ|Indirect object (to whom)|||gift|1",
  "c|b1|c4|Genitiv|Possession (whose)|||possession|1",
  "g|a1|g1|Satzbau|Verb is 2nd position in main clause|||structure|1",
  "g|a2|g2|Nebensatz|Sub clause: verb goes to the end|||chain|1",
  "g|a1|g3|Prasens|Present tense|||present|1",
  "g|a2|g4|Perfekt|Perfect tense: haben/sein + Partizip II|||past|1",
  "g|b1|g5|Trennbare Verben|Separable prefix verbs|||split|1",
  "g|a1|g6|Modalverben|Modal verbs + infinitive at end|||modal|1",
  "g|b1|g7|Adjektivendungen|Adjective endings after article|||paint|1",
  "g|b1|g8|Komparativ|Comparative: schneller, besser|||graph|1",
  "g|a2|g9|Praspositionen|Two-way prepositions: in, auf, unter...|||compass|1",
  "g|b2|g10|Passiv|Passive: werden + Partizip II|||passive|1",
  "g|b2|g11|Konjunktiv II|Would/could: wurde + Infinitiv|||subjunctive|1",
  "g|a2|g12|Reflexive Verben|Verb + sich: ich wasche mich|||reflexive|1",
];

// ── New vocabulary in compact format ──
// Same format: type|level|id|german|english|extra1|extra2|emoji|exam

const NEW = [
  // A1 New Nouns (+47)
  "n|a1|n94|der Apfel|apple|der|die Apfel|apple",
  "n|a1|n95|die Banane|banana|die|die Bananen|banana",
  "n|a1|n96|das Ei|egg|das|die Eier|egg",
  "n|a1|n97|der Fisch|fish|der|die Fische|fish",
  "n|a1|n98|das Obst|fruit|das|-|fruit",
  "n|a1|n99|das Gemuse|vegetables|das|-|vegetable",
  "n|a1|n100|der Salat|salad|der|die Salate|salad",
  "n|a1|n101|die Suppe|soup|die|die Suppen|soup",
  "n|a1|n102|der Saft|juice|der|die Safte|juice",
  "n|a1|n103|der Teller|plate|der|die Teller|plate",
  "n|a1|n104|die Tasse|cup|die|die Tassen|cup",
  "n|a1|n105|das Messer|knife|das|die Messer|knife",
  "n|a1|n106|die Gabel|fork|die|die Gabeln|fork",
  "n|a1|n107|der Loffel|spoon|der|die Loffel|spoon",
  "n|a1|n108|die Tur|door|die|die Turen|door",
  "n|a1|n109|das Fenster|window|das|die Fenster|window",
  "n|a1|n110|die Wand|wall|die|die Wande|wall",
  "n|a1|n111|der Boden|floor|der|die Boden|floor",
  "n|a1|n112|die Decke|ceiling|die|die Decken|ceiling",
  "n|a1|n113|der Garten|garden|der|die Garten|garden",
  "n|a1|n114|der Park|park|der|die Parks|park",
  "n|a1|n115|das Zimmer|room|das|die Zimmer|room",
  "n|a1|n116|der Schreibtisch|desk|der|die Schreibtische|desk",
  "n|a1|n117|die Lampe|lamp|die|die Lampen|lamp",
  "n|a1|n118|der Spiegel|mirror|der|die Spiegel|mirror",
  "n|a1|n119|das Bild|picture|das|die Bilder|picture",
  "n|a1|n120|die Pflanze|plant|die|die Pflanzen|plant",
  "n|a1|n121|der Vogel|bird|der|die Vogel|bird",
  "n|a1|n122|die Maus|mouse|die|die Mause|mouse",
  "n|a1|n123|die Straße|street|die|die Straßen|street",
  "n|a1|n124|der Weg|way/path|der|die Wege|path",
  "n|a1|n125|das Land|country|das|die Lander|country",
  "n|a1|n126|die Insel|island|die|die Inseln|island",
  "n|a1|n127|der Fluss|river|der|die Flusse|river",
  "n|a1|n128|der Wald|forest|der|die Walder|forest",
  "n|a1|n129|das Meer|sea|das|die Meere|sea",
  "n|a1|n130|die Post|mail/post office|die|-|mail",
  "n|a1|n131|der Zahn|tooth|der|die Zahne|tooth",
  "n|a1|n132|der Finger|finger|der|die Finger|finger",
  "n|a1|n133|der Arm|arm|der|die Arme|arm",
  "n|a1|n134|das Bein|leg|das|die Beine|leg",
  "n|a1|n135|der Rücken|back|der|die Rücken|back",
  "n|a1|n136|der Bauch|belly|der|die Bauche|belly",
  "n|a1|n137|das Herz|heart|das|die Herzen|heart",
  "n|a1|n138|der Bleistift|pencil|der|die Bleistifte|pencil",
  "n|a1|n139|der Radiergummi|eraser|der|die Radiergummis|eraser",
  "n|a1|n140|die Schultasche|school bag|die|die Schultaschen|schoolbag",
  // A1 New Verbs (+40)
  "v|a1|v71|backen|to bake|backt/buk/hat gebacken|bake",
  "v|a1|v72|tanzen|to dance|tanzt/tanzte/hat getanzt|dance",
  "v|a1|v73|singen|to sing|singt/sang/hat gesungen|sing",
  "v|a1|v74|lachen|to laugh|lacht/lachte/hat gelacht|laugh",
  "v|a1|v75|warten|to wait|wartet/wartete/hat gewartet|wait",
  "v|a1|v76|hoffen|to hope|hofft/hoffte/hat gehofft|hope",
  "v|a1|v77|lieben|to love|liebt/liebte/hat geliebt|love",
  "v|a1|v78|hassen|to hate|hasst/hasste/hat gehasst|hate",
  "v|a1|v79|fühlen|to feel|fühlt/fühlte/hat gefühlt|feel",
  "v|a1|v80|holen|to fetch|holt/holte/hat geholt|fetch",
  "v|a1|v81|werfen|to throw|wirft/warf/hat geworfen|throw",
  "v|a1|v82|ziehen|to pull|zieht/zog/hat gezogen|pull",
  "v|a1|v83|drücken|to push|drückt/drückte/hat gedrückt|push",
  "v|a1|v84|sitzen|to sit|sitzt/saß/hat gesessen|sit",
  "v|a1|v85|stehen|to stand|steht/stand/hat gestanden|stand",
  "v|a1|v86|schlafen|to sleep|schläft/schlief/hat geschlafen|sleep",
  "v|a1|v87|aufstehen|to get up|steht auf/stand auf/ist aufgestanden|wake",
  "v|a1|v88|waschen|to wash|wäscht/wusch/hat gewaschen|wash",
  "v|a1|v89|putzen|to clean|putzt/putzte/hat geputzt|clean",
  "v|a1|v90|frühstücken|to have breakfast|frühstückt/frühstückte/hat gefrühstückt|breakfast",
  "v|a1|v91|zeichnen|to draw|zeichnet/zeichnete/hat gezeichnet|draw",
  "v|a1|v92|rechnen|to calculate|rechnet/rechnete/hat gerechnet|calculate",
  "v|a1|v93|verkaufen|to sell|verkauft/verkaufte/hat verkauft|sell",
  "v|a1|v94|schenken|to give as gift|schenkt/schenkte/hat geschenkt|gift",
  "v|a1|v95|packen|to pack|packt/packte/hat gepackt|pack",
  "v|a1|v96|tragen|to carry|trägt/trug/hat getragen|carry",
  "v|a1|v97|halten|to hold|hält/hielt/hat gehalten|hold",
  "v|a1|v98|klettern|to climb|klettert/kletterte/ist geklettert|climb",
  "v|a1|v99|schwimmen|to swim|schwimmt/schwamm/ist geschwommen|swim",
  "v|a1|v100|rennen|to run|rennt/rannte/ist gerannt|run",
  "v|a1|v101|springen|to jump|springt/sprang/ist gesprungen|jump",
  "v|a1|v102|fangen|to catch|fängt/fing/hat gefangen|catch",
  "v|a1|v103|klingen|to sound|klingt/klang/hat geklungen|sound",
  "v|a1|v104|riechen|to smell|riecht/roch/hat gerochen|smell",
  "v|a1|v105|schmecken|to taste|schmeckt/schmeckte/hat geschmeckt|taste",
  "v|a1|v106|atmen|to breathe|atmet/atmete/hat geatmet|breathe",
  "v|a1|v107|lächeln|to smile|lächelt/lächelte/hat gelächelt|smile",
  "v|a1|v108|weinen|to cry|weint/weinte/hat geweint|cry",
  "v|a1|v109|schreien|to scream|schreit/schrie/hat geschrien|scream",
  "v|a1|v110|flüstern|to whisper|flüstert/flüsterte/hat geflüstert|whisper",
  // A1 New Adjectives (+55)
  "adj|a1|adj1|groß|big|||big",
  "adj|a1|adj2|klein|small|||small",
  "adj|a1|adj3|gut|good|||good",
  "adj|a1|adj4|schlecht|bad|||bad",
  "adj|a1|adj5|neu|new|||new",
  "adj|a1|adj6|alt|old|||old",
  "adj|a1|adj7|jung|young|||young",
  "adj|a1|adj8|dick|fat/thick|||fat",
  "adj|a1|adj9|dünn|thin|||thin",
  "adj|a1|adj10|lang|long|||long",
  "adj|a1|adj11|kurz|short|||short",
  "adj|a1|adj12|hoch|high/tall|||high",
  "adj|a1|adj13|niedrig|low|||low",
  "adj|a1|adj14|breit|wide|||wide",
  "adj|a1|adj15|schmal|narrow|||narrow",
  "adj|a1|adj16|tief|deep|||deep",
  "adj|a1|adj17|leicht|light/easy|||light",
  "adj|a1|adj18|schwer|heavy/difficult|||heavy",
  "adj|a1|adj19|hart|hard|||hard",
  "adj|a1|adj20|weich|soft|||soft",
  "adj|a1|adj21|warm|warm|||warm",
  "adj|a1|adj22|kalt|cold|||cold",
  "adj|a1|adj23|heiß|hot|||hot",
  "adj|a1|adj24|schnell|fast|||fast",
  "adj|a1|adj25|langsam|slow|||slow",
  "adj|a1|adj26|laut|loud|||loud",
  "adj|a1|adj27|leise|quiet|||quiet",
  "adj|a1|adj28|sauber|clean|||clean",
  "adj|a1|adj29|schmutzig|dirty|||dirty",
  "adj|a1|adj30|reich|rich|||rich",
  "adj|a1|adj31|arm|poor|||poor",
  "adj|a1|adj32|schön|beautiful|||beautiful",
  "adj|a1|adj33|hässlich|ugly|||ugly",
  "adj|a1|adj34|nett|nice|||nice",
  "adj|a1|adj35|böse|angry/mean|||angry",
  "adj|a1|adj36|fleißig|hardworking|||hardworking",
  "adj|a1|adj37|faul|lazy|||lazy",
  "adj|a1|adj38|klug|clever|||clever",
  "adj|a1|adj39|dumm|stupid|||stupid",
  "adj|a1|adj40|mutig|brave|||brave",
  "adj|a1|adj41|ängstlich|fearful|||scared",
  "adj|a1|adj42|froh|happy/glad|||glad",
  "adj|a1|adj43|traurig|sad|||sad",
  "adj|a1|adj44|hungrig|hungry|||hungry",
  "adj|a1|adj45|durstig|thirsty|||thirsty",
  "adj|a1|adj46|müde|tired|||tired",
  "adj|a1|adj47|krank|ill/sick|||sick",
  "adj|a1|adj48|gesund|healthy|||healthy",
  "adj|a1|adj49|fertig|finished/ready|||ready",
  "adj|a1|adj50|frei|free|||free",
  "adj|a1|adj51|richtig|correct|||correct",
  "adj|a1|adj52|falsch|wrong|||wrong",
  "adj|a1|adj53|wichtig|important|||important",
  "adj|a1|adj54|einfach|simple|||simple",
  "adj|a1|adj55|lustig|funny|||funny",
  // A1 Adverbs (+20 from existing, already have 10)
  "a|a1|a41|bald|soon|||soon",
  "a|a1|a42|endlich|finally|||finally",
  "a|a1|a43|leider|unfortunately|||unfortunately",
  "a|a1|a44|schon|already|||already",
  "a|a1|a45|noch|still/yet|||still",
  "a|a1|a46|wieder|again|||again",
  "a|a1|a47|draußen|outside|||outside",
  "a|a1|a48|drinnen|inside|||inside",
  "a|a1|a49|oben|above|||above",
  "a|a1|a50|unten|below|||below",
  "a|a1|a51|vorn|in front|||front",
  "a|a1|a52|hinten|behind|||behind",
  "a|a1|a53|gerade|just/straight|||straight",
  "a|a1|a54|genug|enough|||enough",
  "a|a1|a55|ganz|quite/whole|||whole",
  "a|a1|a56|etwa|approximately|||about",
  "a|a1|a57|täglich|daily|||daily",
  "a|a1|a58|abends|in the evening|||evening",
  "a|a1|a59|morgens|in the morning|||morning",
  "a|a1|a60|nachts|at night|||night",
  // A1 New Phrases (+30)
  "p|a1|p39|Wie heißen Sie?|What is your name?|||name",
  "p|a1|p40|Freut mich!|Nice to meet you!|||nice",
  "p|a1|p41|Woher kommen Sie?|Where are you from?|||origin",
  "p|a1|p42|Wie alt sind Sie?|How old are you?|||age",
  "p|a1|p43|Was machst du?|What are you doing?|||doing",
  "p|a1|p44|Sprechen Sie Englisch?|Do you speak English?|||speak",
  "p|a1|p45|Ich spreche ein bisschen Deutsch|I speak a little German|||little",
  "p|a1|p46|Langsam, bitte|Slowly, please|||slow",
  "p|a1|p47|Ich habe eine Frage|I have a question|||question",
  "p|a1|p48|Ja, natürlich|Yes, of course|||yes",
  "p|a1|p49|Nein, tut mir leid|No, I am sorry|||no",
  "p|a1|p50|Kein Problem|No problem|||noproblem",
  "p|a1|p51|Moment, bitte|Just a moment|||moment",
  "p|a1|p52|Wie bitte?|Pardon? / Come again?|||pardon",
  "p|a1|p53|Das ist gut|That is good|||good",
  "p|a1|p54|Das ist schlecht|That is bad|||bad",
  "p|a1|p55|Ich bin müde|I am tired|||tired",
  "p|a1|p56|Ich habe Hunger|I am hungry|||hungry",
  "p|a1|p57|Ich habe Durst|I am thirsty|||thirsty",
  "p|a1|p58|Ich mag Musik|I like music|||music",
  "p|a1|p59|Das gefällt mir|I like that|||like",
  "p|a1|p60|Das schmeckt gut|This tastes good|||tasty",
  "p|a1|p61|Zum Wohl!|Cheers!|||cheers",
  "p|a1|p62|Ich heiße ...|My name is ...|||name",
  "p|a1|p63|Ich komme aus ...|I am from ...|||origin",
  "p|a1|p64|Ich wohne in ...|I live in ...|||live",
  "p|a1|p65|Können Sie das wiederholen?|Can you repeat that?|||repeat",
  "p|a1|p66|Können Sie mir helfen?|Can you help me?|||help",
  "p|a1|p67|Antwort, bitte|Answer, please|||answer",
  "p|a1|p68|Bis später!|See you later!|||seelater",
  // A1 Prepositions (+25)
  "prep|a1|prep1|in|in/into|||in",
  "prep|a1|prep2|auf|on/onto|||on",
  "prep|a1|prep3|unter|under|||under",
  "prep|a1|prep4|über|over/about|||over",
  "prep|a1|prep5|neben|next to|||next",
  "prep|a1|prep6|zwischen|between|||between",
  "prep|a1|prep7|vor|in front of/before|||before",
  "prep|a1|prep8|hinter|behind|||behind",
  "prep|a1|prep9|an|at/on|||at",
  "prep|a1|prep10|bei|at/near/with|||at",
  "prep|a1|prep11|nach|after/to|||after",
  "prep|a1|prep12|seit|since/for|||since",
  "prep|a1|prep13|von|from/of|||from",
  "prep|a1|prep14|bis|until/by|||until",
  "prep|a1|prep15|durch|through|||through",
  "prep|a1|prep16|für|for|||for",
  "prep|a1|prep17|ohne|without|||without",
  "prep|a1|prep18|gegen|against|||against",
  "prep|a1|prep19|um|around/at|||around",
  "prep|a1|prep20|mit|with|||with",
  "prep|a1|prep21|aus|out of/from|||from",
  "prep|a1|prep22|zu|to/at|||to",
  "prep|a1|prep23|entlang|along|||along",
  "prep|a1|prep24|gegenüber|opposite|||opposite",
  "prep|a1|prep25|außer|except|||except",
  // A1 Conjunctions (+20)
  "conj|a1|conj1|und|and|||and",
  "conj|a1|conj2|oder|or|||or",
  "conj|a1|conj3|aber|but|||but",
  "conj|a1|conj4|denn|because (main clause)|||because",
  "conj|a1|conj5|sondern|but rather|||rather",
  "conj|a1|conj6|doch|yet/however|||yet",
  "conj|a1|conj7|also|so/therefore|||so",
  "conj|a1|conj8|dann|then|||then",
  "conj|a1|conj9|erstens|firstly|||first",
  "conj|a1|conj10|zweitens|secondly|||second",
  "conj|a1|conj11|drittens|thirdly|||third",
  "conj|a1|conj12|außerdem|besides/moreover|||moreover",
  "conj|a1|conj13|trotzdem|nevertheless|||nevertheless",
  "conj|a1|conj14|deshalb|therefore|||therefore",
  "conj|a1|conj15|deswegen|for that reason|||reason",
  "conj|a1|conj16|nämlich|namely/because|||namely",
  "conj|a1|conj17|allerdings|however|||however",
  "conj|a1|conj18|sonst|otherwise|||otherwise",
  "conj|a1|conj19|weder|neither|||neither",
  "conj|a1|conj20|entweder|either|||either",
  // A1 Pronouns (+20)
  "pron|a1|pron1|ich|I|||i",
  "pron|a1|pron2|du|you (informal)|||you",
  "pron|a1|pron3|er|he|||he",
  "pron|a1|pron4|sie|she|||she",
  "pron|a1|pron5|es|it|||it",
  "pron|a1|pron6|wir|we|||we",
  "pron|a1|pron7|ihr|you (plural informal)|||youpl",
  "pron|a1|pron8|sie (Plural)|they|||they",
  "pron|a1|pron9|Sie (formal)|you (formal)|||youformal",
  "pron|a1|pron10|mich|me (accusative)|||me",
  "pron|a1|pron11|dich|you (acc informal)|||you",
  "pron|a1|pron12|ihn|him|||him",
  "pron|a1|pron13|uns|us|||us",
  "pron|a1|pron14|euch|you (pl acc informal)|||youpl",
  "pron|a1|pron15|mir|me (dative)|||me",
  "pron|a1|pron16|dir|you (dat informal)|||you",
  "pron|a1|pron17|ihm|him (dative)|||him",
  "pron|a1|pron18|mein|my|||my",
  "pron|a1|pron19|dein|your (informal)|||your",
  "pron|a1|pron20|Ihr|your (formal)|||your",
  // A1 Time (+25)
  "t|a1|t1|Montag|Monday|||monday",
  "t|a1|t2|Dienstag|Tuesday|||tuesday",
  "t|a1|t3|Mittwoch|Wednesday|||wednesday",
  "t|a1|t4|Donnerstag|Thursday|||thursday",
  "t|a1|t5|Freitag|Friday|||friday",
  "t|a1|t6|Samstag|Saturday|||saturday",
  "t|a1|t7|Sonntag|Sunday|||sunday",
  "t|a1|t8|Januar|January|||january",
  "t|a1|t9|Februar|February|||february",
  "t|a1|t10|März|March|||march",
  "t|a1|t11|April|April|||april",
  "t|a1|t12|Mai|May|||may",
  "t|a1|t13|Juni|June|||june",
  "t|a1|t14|Juli|July|||july",
  "t|a1|t15|August|August|||august",
  "t|a1|t16|September|September|||september",
  "t|a1|t17|Oktober|October|||october",
  "t|a1|t18|November|November|||november",
  "t|a1|t19|Dezember|December|||december",
  "t|a1|t20|der Morgen|morning|||morning",
  "t|a1|t21|der Vormittag|late morning|||latemorning",
  "t|a1|t22|der Mittag|noon|||noon",
  "t|a1|t23|der Nachmittag|afternoon|||afternoon",
  "t|a1|t24|der Abend|evening|||evening",
  "t|a1|t25|die Nacht|night|||night",
  // A1 Colors (+15)
  "col|a1|col1|rot|red|||red",
  "col|a1|col2|blau|blue|||blue",
  "col|a1|col3|grün|green|||green",
  "col|a1|col4|gelb|yellow|||yellow",
  "col|a1|col5|schwarz|black|||black",
  "col|a1|col6|weiß|white|||white",
  "col|a1|col7|braun|brown|||brown",
  "col|a1|col8|grau|gray|||gray",
  "col|a1|col9|orange|orange|||orange",
  "col|a1|col10|pink|pink|||pink",
  "col|a1|col11|lila|purple|||purple",
  "col|a1|col12|türkis|turquoise|||turquoise",
  "col|a1|col13|violett|violet|||violet",
  "col|a1|col14|gold|golden|||gold",
  "col|a1|col15|silber|silver|||silver",
  // A1 Numbers (+15)
  "num|a1|num1|null|zero|||zero",
  "num|a1|num2|eins|one|||one",
  "num|a1|num3|zwei|two|||two",
  "num|a1|num4|drei|three|||three",
  "num|a1|num5|vier|four|||four",
  "num|a1|num6|fünf|five|||five",
  "num|a1|num7|sechs|six|||six",
  "num|a1|num8|sieben|seven|||seven",
  "num|a1|num9|acht|eight|||eight",
  "num|a1|num10|neun|nine|||nine",
  "num|a1|num11|zehn|ten|||ten",
  "num|a1|num12|elf|eleven|||eleven",
  "num|a1|num13|zwölf|twelve|||twelve",
  "num|a1|num14|zwanzig|twenty|||twenty",
  "num|a1|num15|dreißig|thirty|||thirty",
];

// Type mapping
const TYPES = { n:'noun', v:'verb', a:'adverb', p:'phrase', adj:'adjective', prep:'preposition', conj:'conjunction', pron:'pronoun', t:'time', col:'color', num:'number', q:'question', c:'case', g:'grammar' };

// Parse all cards
function parse(line) {
  const parts = line.split('|');
  const t = TYPES[parts[0]];
  const level = parts[1];
  const id = parts[2];
  const german = parts[3];
  const english = parts[4];
  const c = { id, level, type: t, german, english };
  // Extra fields
  if (t === 'noun') { c.article = parts[5]; c.plural = parts[6]; c.emoji = parts[7]; }
  else if (t === 'verb') { c.pattern = parts[5]; c.emoji = parts[6]; if (parts[7] === '1') c.exam = true; }
  else { c.emoji = parts[5] || parts[6] || parts[7]; }
  // Check exam flag (last field)
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  // Exam flag could be in various positions
  if (parts[0] === 'q' || parts[0] === 'c' || parts[0] === 'g') {
    c.emoji = parts[5]; if (parts[6] === '1') c.exam = true;
  }
  return c;
}

// Special handling for each card type - rebuild logic
function parseCard(line) {
  const parts = line.split('|');
  const typeCode = parts[0];
  const t = TYPES[typeCode];
  const level = parts[1];
  const id = parts[2];
  const german = parts[3];
  const english = parts[4];
  const c = { id, level, type: t, german, english };
  
  if (typeCode === 'n') {
    c.article = parts[5];
    c.plural = parts[6];
    c.emoji = parts[7];
  } else if (typeCode === 'v') {
    c.pattern = parts[5];
    c.emoji = parts[6];
    if (parts[7] === '1') c.exam = true;
  } else if (typeCode === 'q' || typeCode === 'c' || typeCode === 'g') {
    c.emoji = parts[5];
    if (parts[6] === '1') c.exam = true;
  } else {
    // adj, prep, conj, pron, t, col, num, a, p
    c.emoji = parts[5];
  }
  return c;
}

// Parse all
const allCards = [];
for (const line of EXISTING) allCards.push(parseCard(line));
for (const line of NEW) allCards.push(parseCard(line));

// Emoji map (extended)
const em = {};
function addEmoji(k, v) { em[k] = v; }

addEmoji('table','🪑');addEmoji('school','🏫');addEmoji('book','📖');
addEmoji('friend','👤');addEmoji('family','👪');addEmoji('house','🏠');
addEmoji('man','👨');addEmoji('woman','👩');addEmoji('child','👶');
addEmoji('dog','🐕');addEmoji('chair','🪑');addEmoji('bed','🛏️');
addEmoji('kitchen','🍳');addEmoji('bath','🛁');addEmoji('bread','🍞');
addEmoji('milk','🥛');addEmoji('coffee','☕');addEmoji('head','🗣️');
addEmoji('hand','✋');addEmoji('eye','👁️');addEmoji('foot','🦶');
addEmoji('shirt','👔');addEmoji('pants','👖');addEmoji('shoe','👟');
addEmoji('jacket','🧥');addEmoji('color','🎨');addEmoji('city','🏙️');
addEmoji('train','🚂');addEmoji('bus','🚌');addEmoji('bike','🚲');
addEmoji('sun','☀️');addEmoji('rain','🌧️');addEmoji('snow','❄️');
addEmoji('star','✨');addEmoji('muscle','💪');addEmoji('cycle','🔄');
addEmoji('check','✅');addEmoji('warning','⚠️');addEmoji('speech','💬');
addEmoji('tool','🔧');addEmoji('walk','🚶');addEmoji('door','🚪');
addEmoji('give','🤲');addEmoji('eat','🍴');addEmoji('drink','🥤');
addEmoji('speak','🗣️');addEmoji('take','✋');addEmoji('cart','🛒');
addEmoji('search','🔍');addEmoji('find','🔎');addEmoji('need','🆘');
addEmoji('play','🎮');addEmoji('today','📅');addEmoji('tomorrow','🌄');
addEmoji('yesterday','🌃');addEmoji('now','⏰');addEmoji('here','📍');
addEmoji('there','📍');addEmoji('very','💯');addEmoji('also','➕');
addEmoji('no','🚫');addEmoji('many','📈');addEmoji('sunrise','🌅');
addEmoji('sunset','🌇');addEmoji('moon','🌙');addEmoji('wave','👋');
addEmoji('pray','🙏');addEmoji('please','🤲');addEmoji('cheers','🥂');
addEmoji('sorry','🙏');addEmoji('hello','🙋');addEmoji('work','💼');
addEmoji('office','🏢');addEmoji('tie','👔');addEmoji('doctor','👨‍⚕️');
addEmoji('hospital','🏥');addEmoji('pain','🤕');addEmoji('restaurant','🍽️');
addEmoji('receipt','🧾');addEmoji('hotel','🏨');addEmoji('travel','🧳');
addEmoji('ticket','🎫');addEmoji('station','🚉');addEmoji('airport','✈️');
addEmoji('clothing','👗');addEmoji('price','💰');addEmoji('phone','📱');
addEmoji('birthday','🎂');addEmoji('gift','🎁');addEmoji('cat','🐱');
addEmoji('car','🚗');addEmoji('water','💧');addEmoji('flower','🌸');
addEmoji('tree','🌳');addEmoji('learn','📚');addEmoji('understand','🧩');
addEmoji('write','✏️');addEmoji('read','📖');addEmoji('drive','🚗');
addEmoji('help','🤝');addEmoji('bring','📦');addEmoji('think','🤔');
addEmoji('answer','💬');addEmoji('ask','❓');addEmoji('order','📋');
addEmoji('pay','💳');addEmoji('cook','🍳');addEmoji('know','🧠');
addEmoji('believe','🙏');addEmoji('open','🔓');addEmoji('close','🔒');
addEmoji('always','♾️');addEmoji('often','🔄');addEmoji('sometimes','🤷');
addEmoji('left','⬅️');addEmoji('right','➡️');addEmoji('straight','⬆️');
addEmoji('maybe','🤔');addEmoji('therefore','➡️');addEmoji('together','👫');
addEmoji('smile','😊');addEmoji('thanks','🙇');addEmoji('where','📍');
addEmoji('money','💰');addEmoji('want','🙋');addEmoji('celebration','🎉');
addEmoji('education','🎓');addEmoji('study','📚');addEmoji('exam','📝');
addEmoji('course','📖');addEmoji('grade','📊');addEmoji('company','🏢');
addEmoji('experience','💡');addEmoji('application','📄');addEmoji('relationship','💞');
addEmoji('earth','🌍');addEmoji('energy','⚡');addEmoji('society','👥');
addEmoji('politics','🗳️');addEmoji('culture','🎭');addEmoji('history','📜');
addEmoji('computer','💻');addEmoji('begin','🚀');addEmoji('describe','📝');
addEmoji('explain','📋');addEmoji('expect','🤞');addEmoji('happy','😊');
addEmoji('interested','🤩');addEmoji('live','🌱');addEmoji('happen','⚡');
addEmoji('participate','🤝');addEmoji('time','⏰');addEmoji('suggest','💡');
addEmoji('introduce','🤝');addEmoji('win','🏆');addEmoji('choose','🗳️');
addEmoji('enjoy','😎');addEmoji('immediately','⚡');addEmoji('rarely','🕰️');
addEmoji('never','🚫');addEmoji('quite','📏');addEmoji('really','💪');
addEmoji('plus','➕');addEmoji('still','💪');addEmoji('but','🤨');
addEmoji('confused','🤷');addEmoji('tired','😴');addEmoji('heart','❤️');
addEmoji('depends','🤷');addEmoji('ok','😊');addEmoji('agree','👍');
addEmoji('shrug','🤷');addEmoji('economy','📊');addEmoji('growth','📈');
addEmoji('research','🔬');addEmoji('science','🧪');addEmoji('law','⚖️');
addEmoji('freedom','🕊️');addEmoji('future','🔮');addEmoji('decision','🤔');
addEmoji('change','🔄');addEmoji('possibility','✨');addEmoji('contract','📄');
addEmoji('tax','💰');addEmoji('market','🏪');addEmoji('crisis','⚠️');
addEmoji('justice','⚖️');addEmoji('truth','💡');addEmoji('influence','🌊');
addEmoji('avoid','⛔');addEmoji('develop','🔬');addEmoji('support','🤗');
addEmoji('analyze','🔎');addEmoji('prove','🔬');addEmoji('discuss','💬');
addEmoji('decide','🤔');addEmoji('enable','🔓');addEmoji('found','🏗️');
addEmoji('compare','⚖️');addEmoji('cause','⚡');addEmoji('increase','📈');
addEmoji('achieve','💪');addEmoji('almost','🎯');addEmoji('everywhere','🌐');
addEmoji('meanwhile','⏳');addEmoji('consequence','➡️');addEmoji('nowhere','🚫');
addEmoji('about','📋');addEmoji('excited','🎊');addEmoji('careless','😐');
addEmoji('view','👀');addEmoji('opinion','💭');addEmoji('possible','✨');
addEmoji('overall','📊');addEmoji('who','❓');addEmoji('what','❓');
addEmoji('whereto','➡️');addEmoji('wherefrom','⬅️');addEmoji('how','🔧');
addEmoji('when','🕐');addEmoji('why','🤔');addEmoji('which','🤷');
addEmoji('yesno','✅❌');addEmoji('subject','👤');addEmoji('target','🎯');
addEmoji('possession','📖');addEmoji('structure','📐');addEmoji('chain','🔗');
addEmoji('present','⏳');addEmoji('past','🕑');addEmoji('split','🔀');
addEmoji('modal','⚡');addEmoji('paint','🎨');addEmoji('graph','📈');
addEmoji('compass','🧭');addEmoji('passive','🔄');addEmoji('subjunctive','💭');
addEmoji('reflexive','🔄');addEmoji('responsibility','🎯');
addEmoji('apple','🍎');addEmoji('banana','🍌');addEmoji('egg','🥚');
addEmoji('fruit','🍇');addEmoji('vegetable','🥬');addEmoji('salad','🥗');
addEmoji('soup','🍜');addEmoji('juice','🧃');addEmoji('plate','🍽️');
addEmoji('cup','☕');addEmoji('knife','🔪');addEmoji('fork','🍴');
addEmoji('spoon','🥄');addEmoji('wall','🧱');addEmoji('ceiling','🏠');
addEmoji('garden','🌻');addEmoji('park','🏞️');addEmoji('desk','🪑');
addEmoji('lamp','💡');addEmoji('mirror','🪞');addEmoji('picture','🖼️');
addEmoji('plant','🌿');addEmoji('bird','🐦');addEmoji('mouse','🐭');
addEmoji('street','🏙️');addEmoji('path','🛤️');addEmoji('country','🌍');
addEmoji('island','🏝️');addEmoji('river','🌊');addEmoji('forest','🌲');
addEmoji('sea','🌊');addEmoji('mail','📮');addEmoji('tooth','🦷');
addEmoji('finger','🖐️');addEmoji('arm','💪');addEmoji('leg','🦵');
addEmoji('back','🔙');addEmoji('belly','🤰');addEmoji('heart','❤️');
addEmoji('pencil','✏️');addEmoji('eraser','🧹');addEmoji('schoolbag','🎒');
addEmoji('bake','🥖');addEmoji('dance','💃');addEmoji('laugh','😂');
addEmoji('cry','😢');addEmoji('fetch','🦮');addEmoji('throw','🤾');
addEmoji('pull','🔗');addEmoji('push','👇');addEmoji('sit','🪑');
addEmoji('stand','🧍');addEmoji('sleep','😴');addEmoji('wake','⏰');
addEmoji('wash','🧼');addEmoji('clean','🧹');addEmoji('breakfast','🥞');
addEmoji('draw','✏️');addEmoji('calculate','🧮');addEmoji('sell','🏪');
addEmoji('carry','🎒');addEmoji('climb','🧗');addEmoji('swim','🏊');
addEmoji('run','🏃');addEmoji('jump','🤸');addEmoji('catch','🧤');
addEmoji('sound','🔊');addEmoji('smell','👃');addEmoji('taste','👅');
addEmoji('feel','🤗');addEmoji('breathe','🫁');addEmoji('whisper','🤫');
addEmoji('scream','😱');addEmoji('big','📏');addEmoji('small','🐜');
addEmoji('good','👍');addEmoji('bad','👎');addEmoji('old','👴');
addEmoji('young','👶');addEmoji('fat','🐘');addEmoji('thin','🦒');
addEmoji('long','📏');addEmoji('short','📐');addEmoji('high','⛰️');
addEmoji('low','⬇️');addEmoji('wide','↔️');addEmoji('narrow','↔️');
addEmoji('deep','🌊');addEmoji('light','🪶');addEmoji('heavy','🏋️');
addEmoji('hard','🪨');addEmoji('soft','🧸');addEmoji('warm','🌡️');
addEmoji('cold','❄️');addEmoji('hot','🔥');addEmoji('fast','🏃');
addEmoji('slow','🐢');addEmoji('loud','📢');addEmoji('quiet','🤫');
addEmoji('lazy','🦥');addEmoji('clever','🧠');addEmoji('stupid','🤪');
addEmoji('brave','🦸');addEmoji('scared','😨');addEmoji('glad','😊');
addEmoji('sad','😭');addEmoji('sick','🤒');addEmoji('ready','✅');
addEmoji('hardworking','💪');addEmoji('soon','⏳');addEmoji('finally','🎉');
addEmoji('unfortunately','😞');addEmoji('already','✅');addEmoji('again','🔄');
addEmoji('outside','🌳');addEmoji('inside','🏠');addEmoji('above','⬆️');
addEmoji('below','⬇️');addEmoji('front','👀');addEmoji('behind','🔙');
addEmoji('name','🪪');addEmoji('nice','😊');addEmoji('origin','🌍');
addEmoji('age','🎂');addEmoji('doing','🤷');addEmoji('repeat','🔁');
addEmoji('little','🐜');addEmoji('pardon','👂');addEmoji('like','❤️');
addEmoji('tasty','😋');addEmoji('noproblem','👍');addEmoji('moment','⏱️');
addEmoji('in','📥');addEmoji('on','📄');addEmoji('under','⬇️');
addEmoji('over','⬆️');addEmoji('next','👉');addEmoji('between','🔲');
addEmoji('before','⏮️');addEmoji('at','📍');addEmoji('since','📅');
addEmoji('from','📤');addEmoji('until','⏹️');addEmoji('through','🚇');
addEmoji('without','🚫');addEmoji('against','⚔️');addEmoji('around','🔄');
addEmoji('along','➡️');addEmoji('opposite','🔄');addEmoji('except','❌');
addEmoji('rather','🤷');addEmoji('yet','⏳');addEmoji('so','➡️');
addEmoji('first','🥇');addEmoji('second','🥈');addEmoji('third','🥉');
addEmoji('moreover','➕');addEmoji('nevertheless','💪');addEmoji('reason','🤔');
addEmoji('namely','📋');addEmoji('neither','🚫');addEmoji('either','🤷');
addEmoji('i','👤');addEmoji('you','👥');addEmoji('he','👨');addEmoji('she','👩');
addEmoji('it','📦');addEmoji('we','👥');addEmoji('youpl','👥');addEmoji('they','👥');
addEmoji('youformal','👔');addEmoji('him','👨');addEmoji('us','👥');addEmoji('my','🔑');
addEmoji('your','🔑');addEmoji('monday','📅');addEmoji('tuesday','📅');
addEmoji('wednesday','📅');addEmoji('thursday','📅');addEmoji('friday','📅');
addEmoji('saturday','📅');addEmoji('sunday','📅');addEmoji('january','❄️');
addEmoji('february','❄️');addEmoji('march','🌸');addEmoji('april','🌧️');
addEmoji('may','🌼');addEmoji('june','☀️');addEmoji('july','☀️');
addEmoji('august','☀️');addEmoji('september','🍂');addEmoji('october','🎃');
addEmoji('november','🌧️');addEmoji('december','🎄');addEmoji('morning','🌅');
addEmoji('latemorning','☀️');addEmoji('noon','☀️');addEmoji('afternoon','🌤️');
addEmoji('evening','🌆');addEmoji('night','🌙');addEmoji('red','🔴');
addEmoji('blue','🔵');addEmoji('green','🟢');addEmoji('yellow','🟡');
addEmoji('black','⚫');addEmoji('white','⚪');addEmoji('brown','🟤');
addEmoji('gray','🌫️');addEmoji('orange','🟠');addEmoji('pink','🩷');
addEmoji('purple','🟣');addEmoji('turquoise','💎');addEmoji('violet','🔮');
addEmoji('gold','🥇');addEmoji('silver','🥈');addEmoji('zero','0️⃣');
addEmoji('one','1️⃣');addEmoji('two','2️⃣');addEmoji('three','3️⃣');
addEmoji('four','4️⃣');addEmoji('five','5️⃣');addEmoji('six','6️⃣');
addEmoji('seven','7️⃣');addEmoji('eight','8️⃣');addEmoji('nine','9️⃣');
addEmoji('ten','🔟');addEmoji('eleven','1️⃣1️⃣');addEmoji('twelve','1️⃣2️⃣');
addEmoji('twenty','2️⃣0️⃣');addEmoji('thirty','3️⃣0️⃣');
addEmoji('seelater','👋');addEmoji('hungry','🍽️');addEmoji('thirsty','🥤');
addEmoji('music','🎵');addEmoji('yes','✅');addEmoji('question','❓');
addEmoji('answer','💬');addEmoji('finger','🖐️');addEmoji('back','🔙');
addEmoji('belly','🤰');

// Count per level
const counts = {a1:0,a2:0,b1:0,b2:0};
for (const c of allCards) { if (counts[c.level] !== undefined) counts[c.level]++; }

console.log('Card counts:', counts, 'Total:', allCards.length);

// Generate output
let out = `// DeutschLern — Complete vocabulary data\n`;
out += `// ${allCards.length} cards total\n\n`;
out += `var CARDS = [\n`;

for (const c of allCards) {
  out += '  { ';
  const parts = [];
  for (const k of ['id','level','type','german','english','article','plural','pattern','emoji','exam']) {
    if (c[k] !== undefined) {
      const v = typeof c[k] === 'string' ? `'${c[k].replace(/'/g, "\\'")}'` : c[k];
      parts.push(`${k}:${v}`);
    }
  }
  out += parts.join(', ');
  out += ' },\n';
}
out += '];\n\nvar EMOJI_MAP = {\n';
for (const [k, v] of Object.entries(em)) {
  out += `  '${k}':'${v}',\n`;
}
out += '};\n';

fs.writeFileSync('/home/ubuntu/Desktop/data.js', out);
console.log('Written to data.js');
