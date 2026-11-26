import type { ReadingTest } from "../types";

export const readingBand78: ReadingTest = {
  band: "78",
  title: "Reading Mock Test · Band 7–8",
  passages: [
    {
      title: "How Words Change Their Minds",
      subtitle: "Why the meanings of words never stand still",
      paragraphs: [
        {
          label: "A",
          text: "Few complaints about language are as durable as the charge that words are being used wrongly. Every generation produces its guardians, who point to some term, such as “literally”, “decimate” or “awful”, and lament that its true sense has been lost. What the guardians rarely acknowledge is that the “true” sense they defend was itself once an innovation. The word “nice” is the standard example. In medieval English it could mean foolish or ignorant, and it passed through meanings such as fastidious and delicate before settling on its present, mild approval. Nobody now regards this history as a tragedy, yet each stage of it was presumably resisted by someone who felt that the word was being abused.",
        },
        {
          label: "B",
          text: "Historical linguists, who study such drift, have long tried to classify it. A traditional taxonomy distinguishes broadening, in which a word’s range expands, from narrowing, in which it contracts. “Dog” once denoted a particular breed of hound and now covers the entire species, whereas “meat” once meant food in general and has shrunk to mean flesh. Other categories include amelioration, where a word rises in esteem, and pejoration, where it falls. “Knight” began as a word for a young servant, and “silly” once meant blessed. The taxonomy is handy for organising examples, but critics point out that it describes outcomes rather than causes, rather as a list of shipwrecks would describe the sea without explaining storms.",
        },
        {
          label: "C",
          text: "Explanations of cause have tended to fall into two camps. The first stresses the needs of speakers: people want to be vivid, polite or amusing, and so they stretch words beyond their settled range. Euphemism is the clearest case. Because a plain term for something unpleasant carries its unpleasantness with it, speakers substitute a gentler word, which then absorbs the stigma of the original and has to be replaced in turn. Linguists call this the euphemism treadmill, and it helps to explain why the vocabulary for illness, death and bodily functions is renewed so frequently. The second camp looks to the structure of the language itself, arguing that words are pushed about by their neighbours. When a new term enters a field, older terms must adjust their territory to make room; the arrival of a loanword for a particular fabric, for instance, may force a native word to specialise or to retreat.",
        },
        {
          label: "D",
          text: "A third line of thought, associated with the study of grammaticalisation, concerns what happens when meaning drifts so far that a word loses its content altogether. The English future marker “going to” began as a verb of physical motion; a sentence such as “I am going to buy bread” originally described a journey with a purpose. Over time the movement faded and the phrase came to signal only intention, and eventually it could be applied to events that are not journeys at all, as in “it is going to rain”. The process is usually one-directional: concrete words become abstract grammatical tools, and only rarely the reverse. Researchers regard this regularity as one of the few genuine laws in a field that is notoriously resistant to prediction.",
        },
        {
          label: "E",
          text: "Prediction is difficult partly because change depends on who is talking. Studies of living communities suggest that innovations rarely begin in the speech of the most powerful or the most isolated. Instead, they tend to be introduced by people with many loose social connections, those who move between groups, and are then adopted by the tight-knit circles that hear them. A word that is novel in one network is therefore carried, almost accidentally, into another. Young speakers, particularly adolescents, are often described as the engine of change, but the claim needs care. Much of what looks like a generational shift is in fact age grading, in which each cohort uses slang in youth and abandons it in adulthood, leaving the language as a whole unchanged.",
        },
        {
          label: "F",
          text: "Digital communication has complicated this picture. Some commentators argue that the internet accelerates semantic change by exposing speakers to enormous numbers of novel usages. Others counter that it may slow certain kinds of change by providing a permanent, searchable record that makes any deviation from established norms conspicuous. The evidence so far is inconclusive. Large text collections do show some terms shifting faster in online writing, but these are mostly words tied to technology and popular culture, where novelty is the whole point. For everyday vocabulary the pace seems broadly similar to that of earlier centuries, which suggests that the underlying social mechanisms matter more than the medium that carries them.",
        },
        {
          label: "G",
          text: "What, then, should be made of the guardians? Most linguists reject their position, though not entirely for the reason that is commonly assumed. The objection is not that anything goes; communication depends on shared conventions, and a word used in a sense nobody recognises fails at its job. Rather, the objection is that conventions are shaped by use and not decreed in advance, so the only authority a meaning can have is the agreement of its speakers at a given time. That agreement can be withdrawn, as the history of “nice” shows. The guardians’ real error, perhaps, is to mistake a snapshot for a law.",
        },
      ],
      groups: [
        {
          kind: "match",
          title: "Questions 1–5",
          instructions:
            "Reading Passage 1 has seven paragraphs, A–G. Choose the correct heading for paragraphs B–F from the list of headings below. Each heading is used once only. There are more headings than paragraphs, so you will not use them all.",
          choices: [
            { key: "i", label: "Official bodies that regulate usage" },
            { key: "ii", label: "A rare regularity in the direction of change" },
            { key: "iii", label: "Why old words survive unchanged" },
            { key: "iv", label: "Two rival explanations for why meanings shift" },
            { key: "v", label: "A classification that describes without explaining" },
            { key: "vi", label: "Innovators, networks and the limits of youth slang" },
            { key: "vii", label: "The internet: faster change or slower?" },
            { key: "viii", label: "The collapse of shared conventions" },
          ],
          questions: [
            {
              n: 1,
              text: "Paragraph B",
              answer: "v",
              why: "Paragraph B says the taxonomy describes outcomes rather than causes, like a list of shipwrecks.",
            },
            {
              n: 2,
              text: "Paragraph C",
              answer: "iv",
              why: "Paragraph C sets out two camps: speakers’ needs and the pressure of neighbouring words.",
            },
            {
              n: 3,
              text: "Paragraph D",
              answer: "ii",
              why: "Paragraph D calls the movement from concrete to abstract one of the few genuine laws in the field.",
            },
            {
              n: 4,
              text: "Paragraph E",
              answer: "vi",
              why: "Paragraph E discusses loosely connected innovators and says the claim about adolescents needs care.",
            },
            {
              n: 5,
              text: "Paragraph F",
              answer: "vii",
              why: "Paragraph F weighs the argument that the internet accelerates change against the argument that it slows it.",
            },
          ],
        },
        {
          kind: "tf",
          mode: "YNNG",
          title: "Questions 6–9",
          instructions:
            "Do the following statements agree with the views of the writer in Reading Passage 1? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
          questions: [
            {
              n: 6,
              text: "Those who defend a word’s “correct” meaning tend to overlook that this meaning was once new.",
              answer: "YES",
              why: "Paragraph A says the guardians rarely acknowledge that the sense they defend was itself an innovation.",
            },
            {
              n: 7,
              text: "The traditional classification of semantic change is of no use to historical linguists.",
              answer: "NO",
              why: "Paragraph B calls it handy for organising examples, though limited as an explanation.",
            },
            {
              n: 8,
              text: "Euphemisms are renewed more often in English than in other languages.",
              answer: "NOT GIVEN",
              why: "Paragraph C discusses euphemism but never compares English with other languages.",
            },
            {
              n: 9,
              text: "The writer accepts without reservation that adolescents drive linguistic change.",
              answer: "NO",
              why: "Paragraph E says the claim needs care because much of it is age grading.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 10–13",
          instructions:
            "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          limit: "NO MORE THAN TWO WORDS",
          questions: [
            {
              n: 10,
              text: "According to one view, speakers alter words to make their speech more ____, courteous or entertaining.",
              answer: ["vivid"],
              why: "Paragraph C says people want to be vivid, polite or amusing.",
            },
            {
              n: 11,
              text: "The cycle in which a gentler word takes on the stigma of the original is known as the euphemism ____.",
              answer: ["treadmill"],
              why: "Paragraph C names this the euphemism treadmill.",
            },
            {
              n: 12,
              text: "In grammaticalisation, a verb describing ____ can fade into a marker of intention.",
              answer: ["physical motion"],
              why: "Paragraph D says “going to” began as a verb of physical motion.",
            },
            {
              n: 13,
              text: "Innovations are often introduced by people with many ____ connections who move between groups.",
              answer: ["loose social"],
              why: "Paragraph E refers to people with many loose social connections.",
            },
          ],
        },
      ],
    },
    {
      title: "The Company as an Invention",
      subtitle: "How the limited company came to dominate economic life",
      paragraphs: [
        {
          label: "A",
          text: "Of all the institutions that shape modern economic life, few are as taken for granted as the limited company. A shareholder who buys a stake in a firm risks the money paid and nothing more; creditors cannot pursue the shareholder’s house or savings. It seems an obvious arrangement, yet it took many centuries to arrive at, and for most of that time it was regarded with suspicion. Economic historians now treat the company less as a single invention than as a bundle of separate features, each of which had to be discovered, tried and, often, abandoned before they could be combined into something durable.",
        },
        {
          label: "B",
          text: "The earliest ingredient was the pooling of capital for ventures too large for any one merchant. Medieval Mediterranean traders already used partnerships in which a sleeping investor financed a voyage and shared its profits while the active partner did the sailing. But these arrangements dissolved when the voyage ended, and partners remained personally liable for all debts. The great trading companies of the early seventeenth century added permanence: the Dutch East India Company’s capital was locked in for a decade, and its shares could be traded. Investors who wanted their money back could not demand it from the company; they could only sell to someone else. This separation of the investor’s exit from the firm’s finances is, in the view of many historians, the decisive step.",
        },
        {
          label: "C",
          text: "Yet permanence alone did not create the modern company. Liability remained unlimited in most jurisdictions, and a shareholder in a failed enterprise could be ruined. In Britain a series of speculative collapses in the early eighteenth century led Parliament to restrict the formation of joint-stock companies, and for roughly a century the form was awkward and legally precarious. Entrepreneurs responded with ingenuity: some used trusts, others secured special charters, and many simply stayed with partnerships. The restriction did not halt economic growth, which surprises those who assume that new legal forms are a precondition of industrial change. Textile mills and ironworks of the period were typically financed by families and local networks, drawing on personal trust rather than on law.",
        },
        {
          label: "D",
          text: "The case for limited liability was made forcefully only when railways arrived. Building a line required sums that no family could supply and that scattered small investors were reluctant to commit if each might be held answerable for the whole. Reformers argued that unlimited liability favoured the rich, since only a wealthy person could afford the risk of owning shares in a large enterprise. Opponents warned that limited liability would invite recklessness: if owners could not lose more than they had paid in, they would take gambles with other people’s money. Both predictions contained some truth. Legislation in the middle of the nineteenth century conceded the principle, and within a generation the limited company had become the default way of organising large-scale business.",
        },
        {
          label: "E",
          text: "The consequences were not uniformly benign. Because shareholders could now be anonymous and distant, the separation between ownership and control widened. Managers directed the firm; owners merely held certificates. Scholars who study corporate governance see in this the origin of a persistent difficulty: how can dispersed owners ensure that those running the company act in their interest? Solutions have included mandatory audits, disclosure rules and boards of directors, but none has been entirely effective, and periodic scandals suggest that the problem is structural rather than a matter of individual dishonesty.",
        },
        {
          label: "F",
          text: "Comparative evidence suggests that the company’s rise was neither inevitable nor uniform. Some economies with sophisticated commerce, such as those of the medieval Islamic world, relied on partnership forms that were flexible and sturdy yet did not evolve into permanent corporations, partly because inheritance rules divided a deceased merchant’s estate among many heirs and so dissolved the business. Merchants in such societies were not less enterprising than their European counterparts; they were working within different constraints, and they devised other means of sharing risk, such as lending networks bound by reputation. The point is not that one system was superior, but that legal environments channel what organisations can become. Historians who regard the company as the engine of Western prosperity therefore risk reversing the arrow of causation: it may be that societies with strong courts and reliable property rights produced corporations, rather than the reverse.",
        },
        {
          label: "G",
          text: "Today the debate has moved from whether companies should exist to what they owe. Defenders of the view that a firm’s sole duty is to maximise returns to its shareholders invoke the original bargain: investors supplied capital and accepted a limited claim on the firm’s behalf. Critics reply that limited liability is a privilege granted by the state, and that privileges can reasonably carry obligations. Neither side can claim the verdict of history, which shows a form shaped repeatedly by political choices rather than by any steady march towards efficiency, and altered whenever the balance of power between investors, workers and governments shifted. If there is a lesson, it is that the company is a legal creation of human purposes, and can be reshaped by them.",
        },
      ],
      groups: [
        {
          kind: "match",
          title: "Questions 14–18",
          instructions:
            "Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G. You may use any letter more than once.",
          choices: [
            { key: "A", label: "Paragraph A" },
            { key: "B", label: "Paragraph B" },
            { key: "C", label: "Paragraph C" },
            { key: "D", label: "Paragraph D" },
            { key: "E", label: "Paragraph E" },
            { key: "F", label: "Paragraph F" },
            { key: "G", label: "Paragraph G" },
          ],
          questions: [
            {
              n: 14,
              text: "a comparison of two opposing predictions about the effects of a legal change",
              answer: "D",
              why: "Paragraph D contrasts reformers’ claims about the rich with opponents’ warnings of recklessness.",
            },
            {
              n: 15,
              text: "an explanation of how a rule about family property could prevent firms from becoming permanent",
              answer: "F",
              why: "Paragraph F says inheritance rules divided a merchant’s estate among heirs and dissolved the business.",
            },
            {
              n: 16,
              text: "a reference to the problem of making sure that managers serve the interests of owners",
              answer: "E",
              why: "Paragraph E asks how dispersed owners can ensure that those running the company act in their interest.",
            },
            {
              n: 17,
              text: "an example of an early arrangement in which one person paid for a journey that another undertook",
              answer: "B",
              why: "Paragraph B describes sleeping investors financing voyages sailed by the active partner.",
            },
            {
              n: 18,
              text: "an observation that growth continued despite restrictive laws",
              answer: "C",
              why: "Paragraph C says the restriction did not halt economic growth.",
            },
          ],
        },
        {
          kind: "tf",
          mode: "TFNG",
          title: "Questions 19–22",
          instructions:
            "Do the following statements agree with the information given in Reading Passage 2? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
          questions: [
            {
              n: 19,
              text: "Medieval partnerships ended once the voyage they financed was over.",
              answer: "TRUE",
              why: "Paragraph B says these arrangements dissolved when the voyage ended.",
            },
            {
              n: 20,
              text: "Investors in the Dutch East India Company could withdraw their capital from the company whenever they chose.",
              answer: "FALSE",
              why: "Paragraph B says investors could not demand their money back from the company; they could only sell their shares.",
            },
            {
              n: 21,
              text: "Railway companies were the first businesses to experiment with trusts.",
              answer: "NOT GIVEN",
              why: "Trusts appear in Paragraph C as a response to the eighteenth-century restrictions, but nothing links them to railways or to being first.",
            },
            {
              n: 22,
              text: "Supporters of reform argued that unlimited liability made ownership of large firms unrealistic for people of modest means.",
              answer: "TRUE",
              why: "Paragraph D says reformers held that unlimited liability favoured the rich, who alone could afford the risk.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 23–26",
          instructions:
            "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          limit: "ONE WORD ONLY",
          questions: [
            {
              n: 23,
              text: "In a medieval partnership, one partner paid for the voyage and the other did the ____.",
              answer: ["sailing"],
              why: "Paragraph B says the active partner did the sailing.",
            },
            {
              n: 24,
              text: "Investors in the early trading companies who wanted their money back could only ____ to another person.",
              answer: ["sell"],
              why: "Paragraph B says they could only sell to someone else.",
            },
            {
              n: 25,
              text: "Opponents of limited liability feared that it would invite ____.",
              answer: ["recklessness"],
              why: "Paragraph D reports the warning that limited liability would invite recklessness.",
            },
            {
              n: 26,
              text: "Attempts to protect owners have included mandatory audits, disclosure rules and boards of ____.",
              answer: ["directors"],
              why: "Paragraph E lists mandatory audits, disclosure rules and boards of directors.",
            },
          ],
        },
      ],
    },
    {
      title: "Rewilding and the Problem of Baselines",
      subtitle: "What should a restored landscape be restored to?",
      paragraphs: [
        {
          text: "The idea of restoring a damaged landscape rests on an unspoken question: restored to what? Ecologists who work on the problem have long been troubled by a phenomenon sometimes called shifting baselines. Each generation of scientists accepts as normal the ecosystem it first encountered, so the yardstick against which loss is measured drifts downward, and a degraded system may be judged healthy simply because no living observer remembers anything better. A coastal fishery that has lost most of its large predators, for example, can look thriving to a researcher who has never seen it otherwise. If the target of restoration is chosen without confronting this bias, the work risks aiming at a diminished version of what was once possible. The difficulty is compounded by the fact that written records of wildlife usually begin only after the most dramatic losses have occurred, and that oral memory, though valuable, fades within a few generations. Restoration therefore begins, whether its practitioners admit it or not, with a judgement about values as well as facts.",
        },
        {
          text: "Three broad schools have responded. The first, historical restoration, takes a past date as the target, perhaps before large-scale drainage or intensive agriculture, and attempts to reassemble the species then present. Its appeal is clarity: success can be assessed by comparing the site with written records, pollen cores and archaeological remains. Its weakness is arbitrariness. Climate, soils and the surrounding landscape have changed, and a community assembled to match the past may be poorly suited to the present. Moreover, the choice of date tends to reflect cultural preference more than ecological reasoning, since landscapes have been reshaped by people for far longer than records suggest.",
        },
        {
          text: "The second school, functional restoration, gives up on fidelity to any particular past and concentrates on processes such as nutrient cycling, water filtration, pollination and soil formation. If a wetland purifies runoff and shelters breeding birds, the argument goes, it hardly matters whether its plants are those that grew there centuries ago. Practitioners are comfortable with novel ecosystems that contain introduced species, provided those species perform useful roles. Critics respond that function is a slippery notion, defined by what humans happen to value, and that a system which performs one service well, storing carbon for instance, may be impoverished in other respects. There is a further danger: the approach can become a licence for destruction, since a developer can always claim that the functions of a lost habitat will be replaced elsewhere.",
        },
        {
          text: "The third school, trophic rewilding, is the most ambitious and the most controversial. It reintroduces large animals, especially predators and big herbivores, on the grounds that these exert a disproportionate influence on everything beneath them in the food chain. Where wolves return, the argument runs, grazing animals alter their movements, vegetation along rivers recovers, and the effects ripple outwards to songbirds and even to the shape of riverbanks. Supporters stress that the aim is not to recreate a vanished world but to restore the interactions that make ecosystems self-regulating, so that human management can eventually be reduced. Sceptics doubt that such cascades are as strong or as general as the best-known cases suggest, and note that the evidence comes largely from a handful of well-studied sites. Livestock farmers, who live alongside the returning animals, tend to be less convinced than conservationists, and projects that neglect their concerns often fail for social rather than biological reasons.",
        },
        {
          text: "None of the three schools can claim a decisive record of success, and the reasons are as much practical as intellectual. Evaluating these approaches is hindered by timescale. Forests take decades to mature, and some effects of removing or returning a species may not appear for a generation. Funding cycles, by contrast, rarely exceed a few years, so projects are typically judged long before the results are in. Monitoring is often the first casualty of tight budgets, with the paradoxical result that many ambitious schemes cannot say whether they worked at all. Those who have tried to compile findings across projects complain that outcomes are recorded in incompatible ways, which makes comparison between sites, and therefore between philosophies, little more than informed guesswork. Until monitoring is treated as an integral part of every project rather than an optional extra, the argument between the schools is likely to be settled by temperament and fashion rather than by evidence.",
        },
        {
          text: "Increasingly, practitioners reject the contest between schools, and a number of recent projects deliberately borrow from all three. A site’s history can suggest which species were once able to thrive there; a focus on function can ensure that the work yields benefits local people can see; and the return of key animals can accelerate recovery that would otherwise take centuries. The debate about baselines has meanwhile shifted. Rather than treating a baseline as a fixed point to be recovered, some ecologists propose treating it as a range of conditions the system has occupied, within which present management should aim to keep it. This reframing carries a philosophical consequence: it accepts that ecosystems are always changing, and that the task of conservation is to guide the direction of change, not to prevent it.",
        },
      ],
      groups: [
        {
          kind: "mcq",
          title: "Questions 27–30",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 27,
              text: "What point does the writer make about shifting baselines in the first paragraph?",
              options: [
                {
                  key: "A",
                  label: "Scientists deliberately lower their targets in order to win funding.",
                },
                {
                  key: "B",
                  label:
                    "What counts as a natural state depends on what each generation first saw.",
                },
                {
                  key: "C",
                  label: "Early records of ecosystems are unreliable because of poor measurement.",
                },
                { key: "D", label: "The problem arises only in the study of fisheries." },
              ],
              answer: "B",
              why: "Paragraph 1 says each generation accepts as normal the ecosystem it first encountered, so the yardstick drifts downward.",
            },
            {
              n: 28,
              text: "What criticism of historical restoration does the writer mention?",
              options: [
                { key: "A", label: "It depends on species that no longer exist anywhere." },
                { key: "B", label: "Its results cannot be compared with any records." },
                {
                  key: "C",
                  label:
                    "The date chosen as the target often reflects cultural preference rather than ecological reasoning.",
                },
                { key: "D", label: "It has proved practical only in wetland areas." },
              ],
              answer: "C",
              why: "Paragraph 2 says the choice of date tends to reflect cultural preference more than ecological reasoning.",
            },
            {
              n: 29,
              text: "What risk of functional restoration does the writer identify?",
              options: [
                { key: "A", label: "It forbids the use of introduced species." },
                { key: "B", label: "It may help developers justify destroying habitats." },
                { key: "C", label: "It ignores the storage of carbon." },
                { key: "D", label: "It costs more than the other approaches." },
              ],
              answer: "B",
              why: "Paragraph 3 warns that it can become a licence for destruction, since a developer can claim lost functions will be replaced elsewhere.",
            },
            {
              n: 30,
              text: "What is the writer’s main point in the fifth paragraph?",
              options: [
                {
                  key: "A",
                  label: "Restoration science suffers from a shortage of trained monitors.",
                },
                {
                  key: "B",
                  label: "Forests recover too quickly for their progress to be measured.",
                },
                {
                  key: "C",
                  label: "Projects are often judged before their long-term results can emerge.",
                },
                { key: "D", label: "Funders prefer ambitious projects to modest ones." },
              ],
              answer: "C",
              why: "Paragraph 5 says effects may take a generation while funding cycles last a few years, so projects are judged long before results are in.",
            },
          ],
        },
        {
          kind: "match",
          title: "Questions 31–35",
          instructions:
            "Look at the following statements (Questions 31–35) and the list of approaches below. Match each statement with the correct approach, A, B or C. You may use any letter more than once.",
          choices: [
            { key: "A", label: "Historical restoration" },
            { key: "B", label: "Functional restoration" },
            { key: "C", label: "Trophic rewilding" },
          ],
          questions: [
            {
              n: 31,
              text: "It accepts introduced species as long as they serve a useful purpose.",
              answer: "B",
              why: "Paragraph 3 says practitioners are comfortable with novel ecosystems containing introduced species that perform useful roles.",
            },
            {
              n: 32,
              text: "Its success can be judged against pollen records and archaeological evidence.",
              answer: "A",
              why: "Paragraph 2 says success can be assessed using records, pollen cores and archaeological remains.",
            },
            {
              n: 33,
              text: "It hopes that human management of a site can eventually be reduced.",
              answer: "C",
              why: "Paragraph 4 says the aim is self-regulating ecosystems so that human management can eventually be reduced.",
            },
            {
              n: 34,
              text: "It may allow a developer to argue that a lost habitat can be compensated for elsewhere.",
              answer: "B",
              why: "Paragraph 3 says a developer can claim the functions of a lost habitat will be replaced elsewhere.",
            },
            {
              n: 35,
              text: "The community it creates may no longer suit present conditions.",
              answer: "A",
              why: "Paragraph 2 says a community assembled to match the past may be poorly suited to the present.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 36–40",
          instructions:
            "Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          limit: "NO MORE THAN TWO WORDS",
          questions: [
            {
              n: 36,
              text: "Because each generation treats the ecosystem it first knew as normal, the measure of loss tends to drift ____.",
              answer: ["downward"],
              why: "Paragraph 1 says the yardstick of loss drifts downward.",
            },
            {
              n: 37,
              text: "Evidence used in historical restoration includes written records, ____ and archaeological remains.",
              answer: ["pollen cores"],
              why: "Paragraph 2 lists written records, pollen cores and archaeological remains.",
            },
            {
              n: 38,
              text: "Functional restoration focuses on processes such as nutrient cycling, water filtration, pollination and ____.",
              answer: ["soil formation"],
              why: "Paragraph 3 lists soil formation among the processes it targets.",
            },
            {
              n: 39,
              text: "Rewilding projects that ignore the worries of farmers often fail for ____ rather than biological reasons.",
              answer: ["social"],
              why: "Paragraph 4 says such projects often fail for social rather than biological reasons.",
            },
            {
              n: 40,
              text: "Some ecologists see a baseline not as a fixed point but as a ____ of conditions the system has occupied.",
              answer: ["range"],
              why: "Paragraph 6 proposes treating a baseline as a range of conditions the system has occupied.",
            },
          ],
        },
      ],
    },
  ],
};
