/**
 * Answer templates in the four languages. Darija is written in Latin letters, the way people
 * type it. NOTE: the Darija and Arabic wording needs a native speaker's read-through.
 */
import type { Language } from "../../../generated/prisma/client";
import type { CircleCtx } from "./context.ts";

export type TurnKind = "active" | "proposed" | "autoPending" | "manualPending";

export interface Phrases {
  hello(first: string): string;
  thanks: string;
  help: string;
  unknown: string;
  noCircles: string;
  turn(c: CircleCtx, kind: TurnKind, month: number, date: string): string;
  nextPay(c: CircleCtx, amount: number, date: string): string;
  notStarted(c: CircleCtx, date: string): string;
  nothingDue: string;
  whoRecv(c: CircleCtx, who: string, you: boolean, date: string): string;
  circleLine(c: CircleCtx): string;
  grace(c: CircleCtx): string;
  graceGeneric: string;
  owes(amount: number): string;
  owesNothing: string;
  missed: string;
  safetyFund: string;
  order: string;
  trust: string;
  about: string;
  refusePredict: string;
  refuseAdvice: string;
  refuseRank: string;
}

const EN: Phrases = {
  hello: (f) => `Hello ${f}! I am the DigiDaret assistant. I can explain your circle's rules, your turn, what you owe and what happens if someone misses a payment. What would you like to know?`,
  thanks: "You're welcome! Ask me anything else about your circle.",
  help: "I can answer: when is my turn, how much and when do I pay, who receives this month, what happens if someone misses a payment, how the Safety Fund and the grace period work, and how the payout order is decided. I do not predict, rank anyone, approve loans or give financial advice.",
  unknown: "I did not quite get that.",
  noCircles: "You are not in a circle yet. Create one, or open an invite link someone sent you.",
  turn: (c, kind, m, d) =>
    ({
      active: `In "${c.name}" you receive the ${c.potAmount} MAD pot in month ${m} (${d}).`,
      proposed: `In "${c.name}" the proposed order puts you in month ${m}. It is not final until everyone approves it.`,
      autoPending: `In "${c.name}" the order is not set yet. When the organizer starts the circle it is decided automatically: best payment record first, newcomers last (random if everyone is new).`,
      manualPending: `In "${c.name}" the organizer has not proposed an order yet.`,
    })[kind],
  nextPay: (c, a, d) => `In "${c.name}" you pay ${a} MAD on ${d}.`,
  notStarted: (c, d) => `"${c.name}" has not started yet. The first payment, ${c.monthlyAmount} MAD, is due on ${d}.`,
  nothingDue: "You have nothing to pay right now.",
  whoRecv: (c, w, you, d) => (you ? `In "${c.name}" you receive the pot this month (${d}).` : `In "${c.name}" ${w} receives the pot this month (${d}).`),
  circleLine: (c) => `"${c.name}": ${c.status === "ACTIVE" ? "active" : "forming"}, ${c.monthlyAmount} MAD a month, ${c.joined}/${c.memberCount} members.`,
  grace: (c) => (c.graceDays === 0 ? `"${c.name}" has no grace period.` : `"${c.name}" gives ${c.graceDays} day${c.graceDays > 1 ? "s" : ""} after the due date before the Safety Fund steps in.`),
  graceGeneric: "The grace period is the number of days after the due date before the Safety Fund steps in. Your circle sets it before it starts.",
  owes: (a) => `Yes. The Safety Fund covered a payment for you, and you still owe ${a} MAD. Until it is settled you cannot join or create new circles.`,
  owesNothing: "No. You do not owe anything.",
  missed:
    "If a payment is missed: 1) a reminder is sent and the debit is retried, 2) there is a short grace period, 3) if it is still unpaid, the Safety Fund covers the amount (up to a cap) so the member whose turn it is still receives the full pot, 4) the member who missed still owes it. It goes on their record and they cannot join new circles until it is settled.",
  safetyFund:
    "The Safety Fund is a reserve that covers one missed payment, up to a cap, so the group is still paid. For the pilot it is designed as a reserve held by a licensed partner and funded by a sponsor. It is a design, not insurance, and nothing is signed yet. The member who missed still owes the money.",
  order:
    "The payout order depends on the circle. Automatic: the member with the best payment record receives first and newcomers go last (random if everyone is new). Manual: the organizer proposes an order and every member must approve it. Your own points are private.",
  trust:
    "Your Trust Record is the history of your payments, and it belongs to you. It shows a Reliability Level worked out by published rules, with no AI. Only you can see your points, and a lender sees nothing unless you choose to share it. Open the Trust Record page to see yours.",
  about:
    "A Daret is a savings circle: each month every member pays a fixed amount and one member receives the whole pot, in an agreed order, until everyone has had a turn. DigiDaret keeps that tradition and adds verified members, automatic payments, a Safety Fund and a payment record you own.",
  refusePredict: "I do not predict who will miss a payment, and I do not judge anyone. I can only explain the rules your group agreed on.",
  refuseAdvice: "I cannot give financial, legal or loan advice, and I do not approve or recommend anything. I can explain how your circle works.",
  refuseRank: "Reliability points are private. Nobody sees anyone else's, and I do not rank members. I can explain how your own record is calculated.",
};

const FR: Phrases = {
  hello: (f) => `Bonjour ${f} ! Je suis l'assistant DigiDaret. Je peux vous expliquer les règles de votre cercle, votre tour, ce que vous devez et ce qui se passe si quelqu'un rate un paiement. Que voulez-vous savoir ?`,
  thanks: "Avec plaisir ! Posez-moi d'autres questions sur votre cercle.",
  help: "Je peux répondre à : quand est mon tour, combien et quand je paie, qui reçoit ce mois-ci, que se passe-t-il si quelqu'un rate un paiement, comment fonctionnent le Fonds de sécurité et le délai de grâce, et comment l'ordre est décidé. Je ne fais pas de prédictions, je ne classe personne, je n'approuve pas de prêts et je ne donne pas de conseils financiers.",
  unknown: "Je n'ai pas bien compris.",
  noCircles: "Vous n'êtes dans aucun cercle pour l'instant. Créez-en un ou ouvrez un lien d'invitation.",
  turn: (c, kind, m, d) =>
    ({
      active: `Dans « ${c.name} », vous recevez la cagnotte de ${c.potAmount} MAD au mois ${m} (${d}).`,
      proposed: `Dans « ${c.name} », l'ordre proposé vous place au mois ${m}. Ce n'est pas définitif tant que tout le monde ne l'a pas approuvé.`,
      autoPending: `Dans « ${c.name} », l'ordre n'est pas encore fixé. Au démarrage, il est décidé automatiquement : meilleur historique de paiement en premier, nouveaux en dernier (au hasard si tout le monde est nouveau).`,
      manualPending: `Dans « ${c.name} », l'organisateur n'a pas encore proposé d'ordre.`,
    })[kind],
  nextPay: (c, a, d) => `Dans « ${c.name} », vous payez ${a} MAD le ${d}.`,
  notStarted: (c, d) => `« ${c.name} » n'a pas encore démarré. Le premier paiement, ${c.monthlyAmount} MAD, est dû le ${d}.`,
  nothingDue: "Vous n'avez rien à payer pour le moment.",
  whoRecv: (c, w, you, d) => (you ? `Dans « ${c.name} », c'est vous qui recevez la cagnotte ce mois-ci (${d}).` : `Dans « ${c.name} », ${w} reçoit la cagnotte ce mois-ci (${d}).`),
  circleLine: (c) => `« ${c.name} » : ${c.status === "ACTIVE" ? "actif" : "en formation"}, ${c.monthlyAmount} MAD par mois, ${c.joined}/${c.memberCount} membres.`,
  grace: (c) => (c.graceDays === 0 ? `« ${c.name} » n'a pas de délai de grâce.` : `« ${c.name} » laisse ${c.graceDays} jour${c.graceDays > 1 ? "s" : ""} après l'échéance avant l'intervention du Fonds de sécurité.`),
  graceGeneric: "Le délai de grâce est le nombre de jours après l'échéance avant que le Fonds de sécurité n'intervienne. Votre cercle le fixe avant de démarrer.",
  owes: (a) => `Oui. Le Fonds de sécurité a couvert un paiement pour vous et vous devez encore ${a} MAD. Tant que ce n'est pas réglé, vous ne pouvez ni rejoindre ni créer de nouveau cercle.`,
  owesNothing: "Non, vous ne devez rien.",
  missed:
    "Si un paiement est raté : 1) un rappel est envoyé et le prélèvement est retenté, 2) un court délai de grâce s'applique, 3) s'il reste impayé, le Fonds de sécurité couvre le montant (dans la limite d'un plafond) pour que le membre dont c'est le tour reçoive toute la cagnotte, 4) le membre défaillant doit toujours la somme. Elle figure dans son historique et il ne peut pas rejoindre de nouveau cercle tant qu'elle n'est pas réglée.",
  safetyFund:
    "Le Fonds de sécurité est une réserve qui couvre un paiement manqué, dans la limite d'un plafond, pour que le groupe soit quand même payé. Pour le pilote, il est conçu comme une réserve détenue par un partenaire agréé et financée par un sponsor. C'est une conception, pas une assurance, et rien n'est signé. Le membre défaillant doit toujours l'argent.",
  order:
    "L'ordre de passage dépend du cercle. Automatique : le meilleur historique de paiement reçoit en premier et les nouveaux passent en dernier (au hasard si tout le monde est nouveau). Manuel : l'organisateur propose un ordre que chaque membre doit approuver. Vos points restent privés.",
  trust:
    "Votre Trust Record est l'historique de vos paiements, et il vous appartient. Il affiche un Niveau de fiabilité calculé par des règles publiées, sans IA. Vous seul voyez vos points, et un prêteur ne voit rien sans votre accord. Ouvrez la page Trust Record pour voir le vôtre.",
  about:
    "Une Daret est un cercle d'épargne : chaque mois, chaque membre verse un montant fixe et l'un d'eux reçoit toute la cagnotte, dans un ordre convenu, jusqu'à ce que chacun ait eu son tour. DigiDaret garde cette tradition et ajoute des membres vérifiés, des paiements automatiques, un Fonds de sécurité et un historique qui vous appartient.",
  refusePredict: "Je ne prédis pas qui ratera un paiement et je ne juge personne. Je peux seulement expliquer les règles que votre groupe a acceptées.",
  refuseAdvice: "Je ne peux pas donner de conseil financier, juridique ou de prêt, et je n'approuve ni ne recommande rien. Je peux expliquer le fonctionnement de votre cercle.",
  refuseRank: "Les points de fiabilité sont privés. Personne ne voit ceux des autres et je ne classe pas les membres. Je peux expliquer comment votre propre historique est calculé.",
};

const DARIJA: Phrases = {
  hello: (f) => `Salam ${f}! Ana l mosa3id dyal DigiDaret. Nqdar nchra7 lik l9awanin dyal daret dyalk, dorek, chhal khass tkhellas, w ach kaywqa3 ila chi wa7ed ma khellasch. Ach bghiti t3ref?`,
  thanks: "Bla jmil! Sewlni 3la ay haja khra 3la daret dyalk.",
  help: "Nqdar njawbek 3la: fash kayji dorek, chhal w imta khass tkhellas, chkoun li ghadi yakhod l pot had chher, ach kaywqa3 ila chi wa7ed ma khellasch, kifach khddam sandou9 l aman w l mohla, w kifach kayt7ded tartib. Ma kanwt9a3ch chkoun ghadi ma ykhellasch, ma kan9ayyem ta wa7ed, w ma kan3tich nasi7a mali wla 9rod.",
  unknown: "Ma fhemtch mzyan.",
  noCircles: "Mazal ma nti f ta daret. Sayb wa7da jdida wla fte7 lien dyal d3wa li sifto lik.",
  turn: (c, kind, m, d) =>
    ({
      active: `F "${c.name}" ghadi takhod pot dyal ${c.potAmount} MAD f chher ${m} (${d}).`,
      proposed: `F "${c.name}" tartib li t9tar7 kay7et lik dorek f chher ${m}. Mazal ma ywafqo 3lih kolchi.`,
      autoPending: `F "${c.name}" tartib mazal ma t7ded. Mli ybda l circle kayt7ded b rassou: li 3ndo ahsan sijil dyal l khlass kaywsel lwl, w jdad kaywslo lkhr (b tari9a 3chwa2ya ila kolchi jdid).`,
      manualPending: `F "${c.name}" l organizer mazal ma 9tar7ch tartib.`,
    })[kind],
  nextPay: (c, a, d) => `F "${c.name}" khass tkhellas ${a} MAD f ${d}.`,
  notStarted: (c, d) => `"${c.name}" mazal ma bdat. L khlass lwl howa f ${d}: ${c.monthlyAmount} MAD.`,
  nothingDue: "Ma 3ndek ta khlass daba.",
  whoRecv: (c, w, you, d) => (you ? `F "${c.name}" nta li ghadi takhod l pot had chher (${d})!` : `F "${c.name}" ${w} howa li ghadi yakhod l pot had chher (${d}).`),
  circleLine: (c) => `"${c.name}": ${c.status === "ACTIVE" ? "khddama" : "mazal kat t9ad"}, ${c.monthlyAmount} MAD f chher, ${c.joined}/${c.memberCount} members.`,
  grace: (c) => (c.graceDays === 0 ? `"${c.name}" ma fiha ta mohla.` : `"${c.name}" 3ndha ${c.graceDays} ayam mn ba3d nhar l khlass 9bel ma ydkhel sandou9 l aman.`),
  graceGeneric: "L mohla hiya 3dad l ayam mn ba3d nhar l khlass 9bel ma ydkhel sandou9 l aman. L circle kat7eddha 9bel ma tbda.",
  owes: (a) => `Iyeh. Sandou9 l aman ghatta wa7ed l khlass 3lik, w mazal 3lik ${a} MAD. 7ta tkhellashom ma tqdarch tdkhel wla tsayeb circle jdida.`,
  owesNothing: "La, ma 3lik walou.",
  missed:
    "Ila chi wa7ed ma khellasch: 1) kayjih tadkir w kay3awdo l khlass, 2) kayb9a 3ndo mohla 9sira, 3) ila mazal ma khellasch, sandou9 l aman kaghatti l mablagh (7ta l 7ad) bach li 3ndo dor yakhod l pot kamel, 4) li ma khellasch mazal 3lih l mablagh, kaytsejjel f sijil dyalo, w ma ymknlouch ydkhel l dawayr jdida 7ta ykhelles.",
  safetyFund:
    "Sandou9 l aman howa ihtiyat kay9dar yghatti wa7ed l khlass li ma tkhellasch (7ta l 7ad) bach l group ykhelles. F l pilot howa mosamam bach ykon ihtiyat 3and partner mo2ahhal w kaymwwlo sponsor. Hada tasmim machi ta2min, w mazal ma tsajjal 7ta chi 7aja. Li ma khellasch mazal 3lih l flous.",
  order:
    "Tartib kay3tamed 3la l circle. Automatic: li 3ndo ahsan sijil dyal l khlass kaywsel lwl w jdad lkhr (3chwa2iyan ila kolchi jdid). Manual: l organizer kay9tar7 tartib w khass kolchi ywafaq 3lih. Nqat dyalek khassa bik nta.",
  trust:
    "Sijil dyal l khlass howa tarikh dyal l khlassat dyalek, w howa dyalek nta. Fih Reliability Level kayt7seb b 9awanin m3lna, bla AI. Nta ghir li kaychouf nqatek, w ta bank ma kaychouf walou ila ma khtartich tcharek. Fte7 safha dyal Trust Record bach tchouf dyalek.",
  about:
    "Daret hiya jam3iya: kol chher kol wa7ed kaykhelles mablagh mo7added w wa7ed kaykhod l pot kamel b tartib mt3ahed 3lih, 7ta ykhod kol wa7ed dorou. DigiDaret kayb9a 3la had t9lid w kayzid members mt2akkdin, khlassat automatic, sandou9 l aman w sijil dyalek.",
  refusePredict: "Ma kanwt9a3ch chkoun ghadi ma ykhellasch w ma kan7kem 3la ta wa7ed. Nqdar ghir nchra7 l9awanin li twafaqto 3lihom f l group.",
  refuseAdvice: "Ma nqdarch n3tik nasi7a mali, 9anouniya wla 3la l 9rod, w ma kan3tamed wla kan9tar7 walou. Nqdar nchra7 lik kifach khddam l circle.",
  refuseRank: "Nqat l reliability khassin b sa7bhom: ta wa7ed ma kaychouf dyal chi wa7ed akhor w ma kan9ayyem ta wa7ed. Nqdar nchra7 lik kifach kayt7seb sijil dyalek.",
};

const AR: Phrases = {
  hello: (f) => `مرحبا ${f}! أنا مساعد DigiDaret. يمكنني شرح قواعد دائرتك ودورك وما عليك دفعه وما يحدث إذا تأخر أحد عن الدفع. ماذا تريد أن تعرف؟`,
  thanks: "عفوا! اسألني عن أي شيء آخر يخص دائرتك.",
  help: "يمكنني الإجابة عن: متى دوري، كم ومتى أدفع، من يستلم هذا الشهر، ماذا يحدث إذا لم يدفع أحد، كيف يعمل صندوق الأمان وفترة السماح، وكيف يتم تحديد الترتيب. لا أتوقع من سيتأخر ولا أرتب الأعضاء ولا أوافق على قروض ولا أقدم نصائح مالية.",
  unknown: "لم أفهم سؤالك جيدا.",
  noCircles: "لست في أي دائرة بعد. أنشئ دائرة أو افتح رابط دعوة أرسله لك أحدهم.",
  turn: (c, kind, m, d) =>
    ({
      active: `في «${c.name}» تستلم مبلغ ${c.potAmount} درهم في الشهر ${m} (${d}).`,
      proposed: `في «${c.name}» الترتيب المقترح يضعك في الشهر ${m}. لا يصبح نهائيا حتى يوافق الجميع.`,
      autoPending: `في «${c.name}» لم يتحدد الترتيب بعد. عند بدء الدائرة يُحدد تلقائيا: صاحب أفضل سجل دفع أولا والجدد في الآخر (عشوائيا إذا كان الجميع جددا).`,
      manualPending: `في «${c.name}» لم يقترح المنظم ترتيبا بعد.`,
    })[kind],
  nextPay: (c, a, d) => `في «${c.name}» تدفع ${a} درهم بتاريخ ${d}.`,
  notStarted: (c, d) => `«${c.name}» لم تبدأ بعد. الدفعة الأولى، ${c.monthlyAmount} درهم، مستحقة بتاريخ ${d}.`,
  nothingDue: "ليس عليك أي دفعة الآن.",
  whoRecv: (c, w, you, d) => (you ? `في «${c.name}» أنت من يستلم المبلغ هذا الشهر (${d}).` : `في «${c.name}» يستلم ${w} المبلغ هذا الشهر (${d}).`),
  circleLine: (c) => `«${c.name}»: ${c.status === "ACTIVE" ? "نشطة" : "قيد التكوين"}، ${c.monthlyAmount} درهم شهريا، ${c.joined}/${c.memberCount} أعضاء.`,
  grace: (c) => (c.graceDays === 0 ? `«${c.name}» ليس فيها فترة سماح.` : `«${c.name}» تمنح ${c.graceDays} أيام بعد تاريخ الاستحقاق قبل تدخل صندوق الأمان.`),
  graceGeneric: "فترة السماح هي عدد الأيام بعد تاريخ الاستحقاق قبل أن يتدخل صندوق الأمان. تحددها دائرتك قبل أن تبدأ.",
  owes: (a) => `نعم. غطى صندوق الأمان دفعة عنك وما زال عليك ${a} درهم. حتى تسددها لا يمكنك الانضمام إلى دوائر جديدة أو إنشاؤها.`,
  owesNothing: "لا، ليس عليك أي مبلغ.",
  missed:
    "إذا فاتت دفعة: 1) يُرسل تذكير وتُعاد محاولة الخصم، 2) تأتي فترة سماح قصيرة، 3) إذا بقيت غير مدفوعة يغطي صندوق الأمان المبلغ (حتى سقف محدد) ليستلم صاحب الدور المبلغ كاملا، 4) يبقى المبلغ دينا على من تأخر. يُسجل في سجله ولا يستطيع الانضمام إلى دوائر جديدة حتى يسدده.",
  safetyFund:
    "صندوق الأمان احتياطي يغطي دفعة واحدة فاتت، حتى سقف محدد، حتى تبقى المجموعة مدفوعة. في المرحلة التجريبية هو مصمم كاحتياطي لدى شريك مرخص ويموله راع. هذا تصميم وليس تأمينا ولم يُوقع شيء بعد. ويبقى المبلغ دينا على من تأخر.",
  order:
    "يعتمد الترتيب على الدائرة. تلقائي: صاحب أفضل سجل دفع يستلم أولا والجدد في الآخر (عشوائيا إذا كان الجميع جددا). يدوي: يقترح المنظم ترتيبا ويجب أن يوافق عليه كل عضو. نقاطك خاصة بك.",
  trust:
    "سجل الثقة هو تاريخ دفعاتك وهو ملك لك. يعرض مستوى موثوقية يُحسب بقواعد منشورة دون ذكاء اصطناعي. أنت وحدك ترى نقاطك ولا يرى المقرض شيئا إلا إذا اخترت المشاركة. افتح صفحة سجل الثقة لترى سجلك.",
  about:
    "الدارت دائرة ادخار: كل شهر يدفع كل عضو مبلغا ثابتا ويستلم عضو واحد المبلغ كاملا بترتيب متفق عليه حتى يأخذ الجميع دورهم. DigiDaret تحافظ على هذا التقليد وتضيف أعضاء موثقين ودفعا تلقائيا وصندوق أمان وسجلا يملكه العضو.",
  refusePredict: "لا أتوقع من سيتأخر في الدفع ولا أحكم على أحد. يمكنني فقط شرح القواعد التي اتفقت عليها مجموعتك.",
  refuseAdvice: "لا أستطيع تقديم نصيحة مالية أو قانونية أو بخصوص القروض، ولا أوافق على شيء ولا أوصي به. يمكنني شرح طريقة عمل دائرتك.",
  refuseRank: "نقاط الموثوقية خاصة. لا أحد يرى نقاط غيره ولا أرتب الأعضاء. يمكنني شرح كيف يُحسب سجلك أنت.",
};

export const PHRASES: Record<Language, Phrases> = { ENGLISH: EN, FRENCH: FR, DARIJA, ARABIC: AR };

const LOCALE: Record<Language, string> = { ENGLISH: "en-GB", FRENCH: "fr-FR", DARIJA: "en-GB", ARABIC: "ar-MA" };

export function fmtDate(lang: Language, iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Suggested questions, shown as chips. Every one is tested to land on the right answer. */
export const CHIPS: Record<Language, { text: string }[]> = {
  ENGLISH: ["When is my turn?", "How much do I owe?", "Who receives this month?", "What if someone misses a payment?", "How is the order decided?"].map((text) => ({ text })),
  FRENCH: ["Quand est mon tour ?", "Combien je dois payer ?", "Qui reçoit ce mois-ci ?", "Que se passe-t-il si quelqu'un rate un paiement ?", "Comment l'ordre est décidé ?"].map((text) => ({ text })),
  DARIJA: ["Fash kayji dor dyali?", "Chhal khass nkhellas?", "Chkoun li ghadi yakhod had chher?", "Ach kaywqa3 ila chi wa7ed ma khellasch?", "Kifach kayt7ded tartib?"].map((text) => ({ text })),
  ARABIC: ["متى دوري؟", "كم يجب أن أدفع؟", "من يستلم هذا الشهر؟", "ماذا يحدث إذا لم يدفع أحد؟", "كيف يتم تحديد الترتيب؟"].map((text) => ({ text })),
};
