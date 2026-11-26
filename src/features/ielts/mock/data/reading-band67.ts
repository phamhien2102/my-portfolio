import type { ReadingTest } from "../types";

export const readingBand67: ReadingTest = {
  band: "67",
  title: "Reading Mock Test · Band 6–7",
  passages: [
    {
      title: "Why Cramming Fails",
      subtitle: "What memory research says about the way we revise",
      paragraphs: [
        {
          label: "A",
          text: "Every examination season, libraries fill with students who intend to absorb a term’s worth of material in a single sleepless stretch. The habit is understandable, because massed study produces an immediate sense of mastery: the facts feel familiar, and familiarity is easily mistaken for knowledge. Yet psychologists who study memory have argued for well over a century that this strategy is a poor investment. Information crammed into the hours before an exam tends to be recalled adequately on the following morning and then to fade within days, leaving little that can be built upon in later courses. Teachers often notice the consequence when a new unit assumes knowledge that, only a few weeks earlier, the class appeared to have mastered.",
        },
        {
          label: "B",
          text: "The alternative is known as the spacing effect. When the same amount of study is divided into several sessions separated by intervals of time, retention is consistently stronger than when it is packed into one sitting. Early experiments involved lists of nonsense syllables, but the finding has since been replicated with foreign vocabulary, anatomy diagrams, mathematical procedures and even surgical skills. The size of the benefit varies, yet it rarely disappears altogether. What puzzles researchers is not whether spacing works but why a method that feels less productive should leave behind so much more. Several competing theories have been proposed, and the two that follow are the most widely discussed.",
        },
        {
          label: "C",
          text: "One explanation concerns effort. Retrieving a half-forgotten fact is harder than rereading it while it is still fresh in mind, and that difficulty appears to matter. Each successful act of retrieval strengthens the pathways that lead to the memory and makes it easier to reach in future. Educators sometimes call such challenges “desirable difficulties”, since they slow performance during practice while improving it afterwards. The key word is desirable: a task so hard that the learner fails completely teaches little, whereas one that demands a moderate struggle seems to produce the most durable gains.",
        },
        {
          label: "D",
          text: "A second explanation focuses on context. During a single long session, the surroundings, the learner’s mood and the material that came just before all remain more or less constant, so the memory becomes tied to a narrow set of cues. Study spread across several days takes place in varied circumstances, and the information therefore becomes linked to many different triggers. Later, a learner is more likely to meet one of those triggers and so to recall what was studied. Sleep may contribute as well, since laboratory work suggests that memories are reorganised during rest, and a gap between sessions allows that process to occur.",
        },
        {
          label: "E",
          text: "Despite the evidence, spacing has been slow to enter classrooms. Curricula are usually organised in units, each studied intensively and then abandoned, a design that suits timetabling but works against memory. Teachers who try to revisit earlier topics often worry that they are wasting time, because students appear to perform worse at first when the same material returns after a delay. Parents and students, too, may regard that initial dip in performance as proof that the method is not working, when it is in fact a sign that retrieval is being exercised. Persuading everyone to tolerate the dip requires patience.",
        },
        {
          label: "F",
          text: "Some schools have nevertheless experimented with simple adjustments. In one common arrangement, a teacher sets aside the opening minutes of each lesson for a short quiz that mixes questions on the current topic with questions from earlier weeks. Because the quizzes carry no penalty, pupils do not feel judged by them, and the repeated recall builds the habit of reviewing. Other schools provide homework that deliberately returns to earlier units rather than concentrating only on the latest one. Reported results are encouraging, although most studies are small and have been conducted over a single term, so firm conclusions about lasting effects must wait.",
        },
        {
          label: "G",
          text: "Researchers also caution that spacing is not a universal cure. The ideal interval depends on how long the learner needs to remember the material: information needed for a test next week suits a shorter gap than knowledge intended to last for years. Spacing cannot compensate for poor understanding either; a student who has not grasped a concept will simply forget it more slowly. Used sensibly, however, the technique costs nothing, requires no special equipment, and asks only that learners begin their revision earlier and stop sooner on each occasion. For many, that proves the hardest part to accept.",
        },
      ],
      groups: [
        {
          kind: "match",
          title: "Questions 1–5",
          instructions:
            "Paragraphs B–F each have a heading in the list below. Choose the correct heading for each paragraph from the list of headings. Write the correct number, i–vii. There are more headings than paragraphs, so you will not use all of them. Each heading may be used only once.",
          choices: [
            { key: "i", label: "A challenge that strengthens memory" },
            { key: "ii", label: "Evidence that spaced study works across many subjects" },
            { key: "iii", label: "Why varied circumstances aid recall" },
            { key: "iv", label: "Resistance to change in schools" },
            { key: "v", label: "Practical classroom trials" },
            { key: "vi", label: "The role of motivation in revision" },
            { key: "vii", label: "Why teachers prefer examinations to coursework" },
          ],
          questions: [
            {
              n: 1,
              text: "Paragraph B",
              answer: "ii",
              why: "Paragraph B lists vocabulary, diagrams, procedures and surgical skills, showing the effect holds across subjects.",
            },
            {
              n: 2,
              text: "Paragraph C",
              answer: "i",
              why: "Paragraph C explains that “desirable difficulties” make retrieval harder but strengthen memory.",
            },
            {
              n: 3,
              text: "Paragraph D",
              answer: "iii",
              why: "Paragraph D says study in varied circumstances links information to many different triggers.",
            },
            {
              n: 4,
              text: "Paragraph E",
              answer: "iv",
              why: "Paragraph E describes why spacing has been slow to enter classrooms and why people resist it.",
            },
            {
              n: 5,
              text: "Paragraph F",
              answer: "v",
              why: "Paragraph F describes quizzes and homework that some schools have tried.",
            },
          ],
        },
        {
          kind: "tf",
          mode: "TFNG",
          title: "Questions 6–9",
          instructions:
            "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          questions: [
            {
              n: 6,
              text: "Material that is crammed is usually forgotten by the morning of the examination.",
              answer: "FALSE",
              why: "Paragraph A says it is recalled adequately the next morning and fades only within days.",
            },
            {
              n: 7,
              text: "The spacing effect has been found with physical skills as well as with factual knowledge.",
              answer: "TRUE",
              why: "Paragraph B mentions mathematical procedures and surgical skills alongside vocabulary.",
            },
            {
              n: 8,
              text: "Spacing is more effective for adults than for children.",
              answer: "NOT GIVEN",
              why: "The passage never compares age groups.",
            },
            {
              n: 9,
              text: "A temporary fall in results after a delay may lead people to doubt that spaced revision works.",
              answer: "TRUE",
              why: "Paragraph E says students and parents may take the initial dip as proof the method is failing.",
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
              text: "Educators call tasks that slow practice but improve later performance desirable ____.",
              answer: ["difficulties"],
              why: "Paragraph C: “desirable difficulties”.",
            },
            {
              n: 11,
              text: "Studying over several days links information to many different ____, making recall more likely.",
              answer: ["triggers"],
              why: "Paragraph D says the information “becomes linked to many different triggers”.",
            },
            {
              n: 12,
              text: "In some schools, lessons begin with a short ____ that mixes current and earlier topics.",
              answer: ["quiz"],
              why: "Paragraph F describes “a short quiz” at the start of each lesson.",
            },
            {
              n: 13,
              text: "Material needed only for a test next week suits a ____ gap between sessions.",
              answer: ["shorter"],
              why: "Paragraph G says information needed for a test next week suits “a shorter gap”.",
            },
          ],
        },
      ],
    },
    {
      title: "The Case for Slower Streets",
      subtitle: "Why some cities are choosing to reduce the speed of traffic",
      paragraphs: [
        {
          label: "A",
          text: "For most of the twentieth century, the street was treated by planners as a channel whose primary purpose was to move vehicles quickly from one place to another. Widths were calculated from traffic forecasts, junctions were redesigned to reduce delay, and pedestrians were fitted around the edges. The assumption behind this approach was that speed brings prosperity: the faster people could travel, the more easily businesses would trade. Over the past two decades, however, a growing number of city authorities have begun to question that equation, and some are deliberately making their streets slower. The change is rarely welcomed at first. Motorists see it as an attack on their convenience, and officials who propose it can expect to spend months defending a decision that their predecessors would have thought absurd. Whether the sceptics are right deserves careful examination.",
        },
        {
          label: "B",
          text: "The strongest argument for such measures is safety. Collision studies repeatedly show that the likelihood of a pedestrian surviving being struck falls sharply as vehicle speed rises, and that even modest reductions in limits can lower the number of serious injuries. Critics respond that drivers simply adapt, and that signs alone achieve little. They have a point: limits that are not supported by the shape of the road are widely ignored. Narrower lanes, raised crossings and trees planted close to the kerb all make fast driving feel uncomfortable, and engineers increasingly rely on these cues rather than on enforcement. In my view, design of this kind changes behaviour far more reliably than any sign.",
        },
        {
          label: "C",
          text: "A second argument is economic, and it is more contested. Shopkeepers frequently fear that removing parking spaces or restricting traffic will drive customers away. Yet surveys of shoppers in several European cities suggest that business owners tend to overestimate the proportion of their customers who arrive by car, and to underestimate the spending of those who walk or cycle, who visit more often even if each visit is smaller. I would not claim that every trader benefits; those selling bulky goods may reasonably worry. But the evidence that pedestrianised streets damage trade is far weaker than the folklore suggests. Retailers in some districts have even lobbied for wider pavements once they saw that crowded, lively streets keep people browsing for longer. The lesson, I think, is that perceptions of trade are shaped by what is visible, and parked cars are far easier to count than passing pedestrians.",
        },
        {
          label: "D",
          text: "What is often missing from the debate is an honest account of who bears the costs. Free or cheap parking is a subsidy, paid for by everyone through higher prices and taxes, but enjoyed mainly by those who drive. Wide roads cost money to build and maintain, and the land they occupy could otherwise be used for housing or workplaces. When these hidden expenses are counted, the apparent bargain of car-oriented design looks much less attractive. Economists therefore tend to favour pricing schemes that make drivers aware of what they actually use, though such schemes are politically difficult to introduce and are rarely popular. Even so, the principle behind them is hard to dispute: a service that appears to cost nothing is almost always used more heavily than one whose price is plain.",
        },
        {
          label: "E",
          text: "Equity is a further consideration. Households without a car are, in most cities, disproportionately those with low incomes, along with the elderly, the young and people with disabilities. Streets that prioritise vehicles effectively prioritise the better off. Slower, more walkable neighbourhoods give the others better access to shops, schools and clinics without requiring them to buy and insure a vehicle. It would be naive, however, to ignore the opposite risk: when a street becomes pleasant, property prices often rise, and the very residents the scheme was meant to help may eventually be unable to afford to live there.",
        },
        {
          label: "F",
          text: "Experience suggests that how a change is introduced matters as much as what it is. Schemes imposed overnight tend to provoke fierce opposition, whereas temporary trials, in which a street is closed for a few weeks with cheap barriers and planters, allow residents to judge the result for themselves. Several cities have found that hostility fades once people see the outcome, and that a trial can quietly be made permanent. This approach is not foolproof, and it demands that officials be willing to reverse course when a design fails. Still, I believe it offers the most realistic route to streets that serve everyone and not merely those at the wheel.",
        },
      ],
      groups: [
        {
          kind: "mcq",
          title: "Questions 14–17",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 14,
              text: "What assumption lay behind twentieth-century street planning?",
              options: [
                { key: "A", label: "Pedestrians should be kept away from main roads." },
                { key: "B", label: "Faster travel would make trade easier and bring wealth." },
                { key: "C", label: "Junctions were the main cause of congestion." },
                { key: "D", label: "Traffic forecasts were usually unreliable." },
              ],
              answer: "B",
              why: "Paragraph A: “speed brings prosperity: the faster people could travel, the more easily businesses would trade”.",
            },
            {
              n: 15,
              text: "What does the writer suggest about lower speed limits in paragraph B?",
              options: [
                { key: "A", label: "Signs on their own are enough to change driver behaviour." },
                {
                  key: "B",
                  label: "They are most effective when the road itself encourages slow driving.",
                },
                { key: "C", label: "They make no difference to the number of serious injuries." },
                { key: "D", label: "They depend mainly on strict enforcement by police." },
              ],
              answer: "B",
              why: "Paragraph B says limits unsupported by road shape are ignored, and engineers rely on design cues rather than enforcement.",
            },
            {
              n: 16,
              text: "According to paragraph C, shop owners often",
              options: [
                { key: "A", label: "benefit from the removal of parking spaces." },
                { key: "B", label: "overestimate how many of their customers come by car." },
                { key: "C", label: "receive larger purchases from people who walk." },
                { key: "D", label: "refuse to take part in surveys of shoppers." },
              ],
              answer: "B",
              why: "Paragraph C: owners “tend to overestimate the proportion of their customers who arrive by car”.",
            },
            {
              n: 17,
              text: "Why do economists tend to favour pricing schemes, according to paragraph D?",
              options: [
                { key: "A", label: "They are popular with the public." },
                { key: "B", label: "They raise money to build wider roads." },
                { key: "C", label: "They make drivers aware of what they actually use." },
                { key: "D", label: "They remove the need for parking altogether." },
              ],
              answer: "C",
              why: "Paragraph D: such schemes “make drivers aware of what they actually use”, though they are rarely popular.",
            },
          ],
        },
        {
          kind: "tf",
          mode: "YNNG",
          title: "Questions 18–22",
          instructions:
            "Do the following statements agree with the views of the writer in the passage? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          questions: [
            {
              n: 18,
              text: "The design of a road can influence driving speed more reliably than signs can.",
              answer: "YES",
              why: "Paragraph B: the writer states that design “changes behaviour far more reliably than any sign”.",
            },
            {
              n: 19,
              text: "Every shopkeeper is likely to gain from a pedestrianised street.",
              answer: "NO",
              why: "Paragraph C: “I would not claim that every trader benefits”.",
            },
            {
              n: 20,
              text: "The full costs of car-oriented design are not properly discussed.",
              answer: "YES",
              why: "Paragraph D says an honest account of who bears the costs is “often missing from the debate”.",
            },
            {
              n: 21,
              text: "Walkable neighbourhoods bring no risks for low-income residents.",
              answer: "NO",
              why: "Paragraph E warns that rising property prices may push the intended beneficiaries out.",
            },
            {
              n: 22,
              text: "Organisations representing drivers will welcome temporary street closures.",
              answer: "NOT GIVEN",
              why: "The passage never mentions the attitude of drivers’ organisations.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 23–26",
          instructions:
            "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          limit: "NO MORE THAN TWO WORDS",
          questions: [
            {
              n: 23,
              text: "Free or cheap parking is effectively a ____ that the whole community pays for.",
              answer: ["subsidy"],
              why: "Paragraph D: parking “is a subsidy, paid for by everyone”.",
            },
            {
              n: 24,
              text: "The land taken by wide roads could instead provide ____ or workplaces.",
              answer: ["housing"],
              why: "Paragraph D: the land “could otherwise be used for housing or workplaces”.",
            },
            {
              n: 25,
              text: "People on low incomes, the elderly, the young and those with ____ are less likely to have a car.",
              answer: ["disabilities"],
              why: "Paragraph E lists “people with disabilities” among households without a car.",
            },
            {
              n: 26,
              text: "Temporary ____ using cheap barriers allow residents to judge a scheme for themselves.",
              answer: ["trials"],
              why: "Paragraph F: “temporary trials” with cheap barriers and planters.",
            },
          ],
        },
      ],
    },
    {
      title: "Meadows Beneath the Waves",
      subtitle: "The overlooked plants that shelter coastal seas",
      paragraphs: [
        {
          label: "A",
          text: "Seagrasses are flowering plants that have, unusually, returned to the sea. Their ancestors lived on land, and the roughly seventy species alive today still produce flowers, seeds and true roots, features that distinguish them from the seaweeds with which they are often confused. They form dense meadows in shallow coastal waters on every continent except Antarctica, anchoring themselves in sand and mud. To the casual swimmer a meadow may look like an unremarkable green patch, but ecologists regard it as one of the most productive habitats in the ocean, comparable in output to many tropical forests.",
        },
        {
          label: "B",
          text: "Much of that value lies in the shelter the plants provide. The blades slow the movement of water, so that suspended particles settle and the surrounding water becomes clearer. Young fish and invertebrates hide among the leaves, and many commercially important species spend the early part of their lives in meadows before moving to deeper water. Large grazers, including turtles and the dugong, feed directly on the plants, while countless smaller creatures graze on the film of algae that coats the blades. A single hectare may therefore support a food web far richer than the bare seabed beside it. Fishing communities have long noticed the difference, even when they could not explain it: catches tend to be better close to meadows, and poorer once the plants have gone.",
        },
        {
          label: "C",
          text: "Seagrass also performs a service that has attracted attention from climate scientists. Like all plants, it takes in carbon dioxide during photosynthesis, but because much of its biomass is buried in oxygen-poor sediment, the carbon is not quickly released again. Sediments beneath healthy meadows can hold carbon that accumulated over centuries. Some researchers argue that protecting seagrass should therefore be counted among the measures to slow global warming. Others point out that estimates of storage vary widely between sites, and that no single figure can safely be applied to every meadow.",
        },
        {
          label: "D",
          text: "Despite these benefits, meadows have been disappearing. Surveys suggest that a substantial fraction of the world’s seagrass area has been lost since the late nineteenth century, with the rate of decline accelerating in recent decades. The causes are mostly local. Fertilisers and sewage washing from the land encourage algae that cloud the water and block sunlight, while dredging and the dragging of anchors tear plants from the sediment. Because seagrass needs light to survive, anything that reduces water clarity is a serious threat, and the damage can take years to become visible.",
        },
        {
          label: "E",
          text: "Restoration is therefore harder than it sounds. Early attempts consisted of digging up shoots from healthy meadows and transplanting them, a method that damaged the donor site and often failed. More recent projects collect seeds, which are then dispersed over bare areas or planted in biodegradable bags. In one well-known project on the eastern coast of North America, volunteers scattered large quantities of seed across lagoons where the plant had vanished, and within a decade meadows had spread over several thousand hectares. Success, however, depended on first improving water quality; where pollution persisted, plantings did not take. Managers have also learned to be patient, because a new meadow may spend several seasons establishing itself before it begins to spread, and early disappointment can lead funders to abandon projects that would eventually have succeeded.",
        },
        {
          label: "F",
          text: "Monitoring has been transformed by technology. Once, scientists had to dive to record the extent of a meadow. Now satellites and drones can map shallow areas quickly, and machine-learning software can distinguish seagrass from rock and sand in the images. Cheaper sensors anchored on the seabed record light and temperature continuously, giving early warning of stress. Yet these tools have limits: murky or deep water defeats satellites, and divers are still needed to confirm what the images appear to show. Data collected in this way is also only as useful as the comparisons it allows, which means that surveys must be repeated at regular intervals, using the same methods, for many years before a trend can be trusted.",
        },
        {
          label: "G",
          text: "Perhaps the greatest obstacle is public awareness. Unlike coral reefs or mangroves, seagrass meadows rarely feature in holiday brochures, and many people living beside them have never heard of the plant. Conservation groups have found that local fishing communities, who see the link between healthy meadows and their catches, are often the most willing partners, and several now share in the management of protected areas. Experts agree that without such local support, legal protection alone is unlikely to halt the losses. Rules on anchoring, for instance, work only when the people who use the water understand why they exist and are willing to follow them when nobody is watching.",
        },
      ],
      groups: [
        {
          kind: "match",
          title: "Questions 27–31",
          instructions:
            "The passage has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G. You may use any letter more than once.",
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
              n: 27,
              text: "a restoration method that harmed the site from which plants were taken",
              answer: "E",
              why: "Paragraph E: transplanting shoots “damaged the donor site and often failed”.",
            },
            {
              n: 28,
              text: "a way of telling seagrass apart from a similar-looking group of organisms",
              answer: "A",
              why: "Paragraph A: flowers, seeds and true roots distinguish seagrasses from seaweeds.",
            },
            {
              n: 29,
              text: "a disagreement about how reliable measurements are",
              answer: "C",
              why: "Paragraph C: others say storage estimates “vary widely between sites”.",
            },
            {
              n: 30,
              text: "an explanation of how a threat deprives the plants of something they need",
              answer: "D",
              why: "Paragraph D: algae cloud the water and “block sunlight”, which seagrass needs.",
            },
            {
              n: 31,
              text: "an example of cooperation with people whose livelihoods depend on the sea",
              answer: "G",
              why: "Paragraph G: fishing communities now share in managing protected areas.",
            },
          ],
        },
        {
          kind: "tf",
          mode: "TFNG",
          title: "Questions 32–35",
          instructions:
            "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          questions: [
            {
              n: 32,
              text: "Seagrasses reproduce by means of flowers and seeds.",
              answer: "TRUE",
              why: "Paragraph A says they “still produce flowers, seeds and true roots”.",
            },
            {
              n: 33,
              text: "Seagrass meadows can be found on every continent.",
              answer: "FALSE",
              why: "Paragraph A says they occur on every continent except Antarctica.",
            },
            {
              n: 34,
              text: "The loss of seagrass has been greatest in tropical regions.",
              answer: "NOT GIVEN",
              why: "Paragraph D gives no regional comparison of losses.",
            },
            {
              n: 35,
              text: "Seed planting in the North American project worked only after water quality had been improved.",
              answer: "TRUE",
              why: "Paragraph E: “Success… depended on first improving water quality”.",
            },
          ],
        },
        {
          kind: "mcq",
          title: "Questions 36–38",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 36,
              text: "What does paragraph B say about meadows?",
              options: [
                { key: "A", label: "Most commercial fish stay in them throughout their lives." },
                {
                  key: "B",
                  label: "They act as a nursery for species that later move to deeper water.",
                },
                { key: "C", label: "The dugong feeds mainly on the algae that coats the blades." },
                { key: "D", label: "Clear water is the main reason animals gather in them." },
              ],
              answer: "B",
              why: "Paragraph B: many species spend “the early part of their lives in meadows before moving to deeper water”.",
            },
            {
              n: 37,
              text: "What is said about carbon storage in paragraph C?",
              options: [
                {
                  key: "A",
                  label: "Climate scientists have rejected the idea of protecting seagrass.",
                },
                {
                  key: "B",
                  label: "Carbon stored in sediment is released soon after the plant dies.",
                },
                { key: "C", label: "Estimates cannot safely be applied to every meadow." },
                { key: "D", label: "Carbon accumulates in sediment only over a few decades." },
              ],
              answer: "C",
              why: "Paragraph C: “no single figure can safely be applied to every meadow”.",
            },
            {
              n: 38,
              text: "What does the writer say about remote monitoring in paragraph F?",
              options: [
                { key: "A", label: "It cannot yet map shallow areas." },
                { key: "B", label: "Sensors on the seabed are more costly than diving." },
                { key: "C", label: "Software finds it impossible to identify seagrass." },
                { key: "D", label: "It still requires divers to check its results." },
              ],
              answer: "D",
              why: "Paragraph F: “divers are still needed to confirm what the images appear to show”.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 39–40",
          instructions:
            "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
          limit: "ONE WORD ONLY",
          questions: [
            {
              n: 39,
              text: "Fertilisers and sewage encourage ____ that cloud the water and block sunlight.",
              answer: ["algae"],
              why: "Paragraph D: they “encourage algae that cloud the water”.",
            },
            {
              n: 40,
              text: "Conservation groups find that local ____ communities are often the most willing partners.",
              answer: ["fishing"],
              why: "Paragraph G: “local fishing communities… are often the most willing partners”.",
            },
          ],
        },
      ],
    },
  ],
};
