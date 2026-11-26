import type { ReadingTest } from "../types";

export const readingBand56: ReadingTest = {
  band: "56",
  title: "Reading Mock Test · Band 5–6",
  passages: [
    {
      title: "The Return of the Beaver",
      subtitle: "How a hunted animal came back to Europe's rivers",
      paragraphs: [
        {
          label: "A",
          text: "For hundreds of years, beavers were hunted across Europe for their thick fur and for a substance called castoreum, which was used in medicine and perfume. Hunters had simply taken too many. By the sixteenth century the animals had vanished from many countries, and by 1900 only a few small groups survived, scattered across France, Germany, Norway and Russia. Nobody expected the animal to return. Yet today beavers live in rivers from Scotland to Poland, and their comeback is one of the most surprising conservation stories of the past fifty years.",
        },
        {
          label: "B",
          text: "The recovery began with protection and with people. Once hunting was made illegal in the early twentieth century, the surviving groups slowly grew. Then conservationists started to move animals to new places. Between the 1920s and the 1990s, beavers were released in more than twenty countries, often in areas where a river had been empty of them for centuries. Local volunteers often helped by watching the animals and counting the new families each spring. Because beavers breed steadily, producing a few young each year, and because they can live in almost any river with trees along its banks, the new populations spread quickly.",
        },
        {
          label: "C",
          text: "Part of the reason the animals attract so much attention is the way they change their surroundings. Beavers cut down small trees with their strong teeth and use the trunks and branches to build dams across streams. Behind each dam, water collects and forms a pond. In the middle of the pond the beavers build a lodge, a pile of sticks and mud with an entrance under the water, where the family can sleep safely. A single family may build several dams along the same stream, creating a chain of ponds that covers a large area.",
        },
        {
          label: "D",
          text: 'These ponds bring benefits to many other species. Fish find shelter in the deeper water, and young fish are protected from larger predators. Frogs, insects and water birds arrive to feed in the slow, warm shallows. Dead trees standing in the water provide homes for woodpeckers and bats. Even plants benefit, because the damp ground around a pond helps willows and other water-loving trees to grow. Researchers who have compared stretches of river with and without beavers often find a greater variety of wildlife where the animals are present. For this reason beavers are sometimes called a "keystone species", meaning that many other animals depend on the habitat they create.',
        },
        {
          label: "E",
          text: "Beaver dams also affect the water itself. By slowing the flow of a stream, they let soil and dirt settle on the bottom, so the water leaving a beaver pond is often cleaner than the water that entered it. During heavy rain the ponds hold back water and release it slowly, which can reduce the risk of flooding in towns further down the valley. In dry summers the same ponds work as a store, keeping the surrounding land damp for longer. The effect is strongest on small streams, where a few dams can change the way a whole valley behaves. Some farmers and local councils now see beavers as a cheap form of flood protection.",
        },
        {
          label: "F",
          text: "Not everyone welcomes the animals, however. Beavers can block drainage channels, and their gnawing sometimes kills valuable trees or damages crops growing close to the water. Fields beside a river may become flooded when a new dam is built. In some regions, landowners have asked for the animals to be removed. Wildlife managers say the best answer is often a practical compromise: fitting pipes through dams to control the water level, or protecting important trees with wire fences. Where such measures are used, people and beavers can live side by side. Surveys suggest that attitudes improve when residents see the benefits for themselves, and the return of this animal looks set to continue.",
        },
      ],
      groups: [
        {
          kind: "match",
          title: "Questions 1–5",
          instructions:
            "The passage has six paragraphs, A–F. Choose the correct heading for paragraphs B–F from the list of headings below. Write the correct number, i–vii, as your answer. There are more headings than paragraphs, so you will not use all of them. Each heading may be used only once.",
          choices: [
            { key: "i", label: "Conflicts between beavers and landowners" },
            { key: "ii", label: "How dams and ponds are built" },
            { key: "iii", label: "A wide range of wildlife gains a home" },
            { key: "iv", label: "The role of beavers in medicine and fashion" },
            { key: "v", label: "Steps taken to bring the species back" },
            { key: "vi", label: "Beavers and the control of water" },
            { key: "vii", label: "Why beavers prefer cold climates" },
          ],
          questions: [
            {
              n: 1,
              text: "Paragraph B",
              answer: "v",
              why: "Paragraph B describes protection from hunting and the release of animals in new places.",
            },
            {
              n: 2,
              text: "Paragraph C",
              answer: "ii",
              why: "Paragraph C explains how beavers cut trees, build dams and make a lodge in the pond.",
            },
            {
              n: 3,
              text: "Paragraph D",
              answer: "iii",
              why: "Paragraph D lists fish, frogs, insects, birds and bats that benefit from the ponds.",
            },
            {
              n: 4,
              text: "Paragraph E",
              answer: "vi",
              why: "Paragraph E is about cleaner water, reduced flooding and water stored in dry summers.",
            },
            {
              n: 5,
              text: "Paragraph F",
              answer: "i",
              why: "Paragraph F begins 'Not everyone welcomes the animals' and describes blocked channels and damaged crops.",
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
              text: "Beavers had become rare in Europe long before the twentieth century.",
              answer: "TRUE",
              why: "Paragraph A says they had vanished from many countries by the sixteenth century.",
            },
            {
              n: 7,
              text: "Beavers have been released only in countries where they had never lived before.",
              answer: "FALSE",
              why: "Paragraph B says they were often released where a river had been empty of them for centuries, so they had lived there before.",
            },
            {
              n: 8,
              text: "Beavers are more active at night than during the day.",
              answer: "NOT GIVEN",
              why: "The passage never mentions when beavers are active.",
            },
            {
              n: 9,
              text: "Beaver ponds can help to lower the danger of floods in nearby towns.",
              answer: "TRUE",
              why: "Paragraph E says the ponds can reduce the risk of flooding in towns further down the valley.",
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
              text: "In the deeper water of a pond, young fish are protected from ____.",
              answer: ["larger predators"],
              why: "Paragraph D says young fish are protected from larger predators.",
            },
            {
              n: 11,
              text: "Dead trees standing in the water provide homes for woodpeckers and ____.",
              answer: ["bats"],
              why: "Paragraph D names woodpeckers and bats as the animals that use dead trees.",
            },
            {
              n: 12,
              text: "Beavers are sometimes called a ____ because so many other animals depend on the habitat they create.",
              answer: ["keystone species"],
              why: 'Paragraph D gives the term "keystone species" and explains its meaning.',
            },
            {
              n: 13,
              text: "Wildlife managers suggest protecting important trees with ____.",
              answer: ["wire fences", "wire fence"],
              why: "Paragraph F suggests protecting important trees with wire fences.",
            },
          ],
        },
      ],
    },
    {
      title: "The Story of the Public Library",
      subtitle: "From private collections to places open to all",
      paragraphs: [
        {
          label: "A",
          text: "Today a library card is so ordinary that it is easy to forget how new the idea is. For most of history, books were rare and expensive objects. Before the printing press arrived in Europe in the fifteenth century, every book was copied by hand, and a single volume could take months to finish. Collections were kept by monasteries, universities and wealthy families, and ordinary people rarely had the chance to read, or even to see, more than a handful of books in their lives. Reading was therefore a privilege of the few.",
        },
        {
          label: "B",
          text: "Printing made books cheaper, but it did not make them free. By the seventeenth and eighteenth centuries, a few towns had small libraries open to the public, but most readers who wanted regular access to books had to pay. Some borrowed from shops that rented novels by the week for a small payment. One popular solution was the subscription library, in which members shared the cost of buying books by each paying a yearly fee. These clubs were useful to merchants and professionals, but a factory worker earning low wages could not afford to join.",
        },
        {
          label: "C",
          text: "Attitudes began to change in the nineteenth century, when many governments became interested in education. Factories had created large cities full of workers, and reformers argued that reading would help people to improve their lives and make them more useful citizens. Supporters hoped that a quiet, free reading room would also keep people away from noisy pubs. In Britain, a law passed in 1850 allowed towns to raise a small local tax to pay for a library. The idea soon crossed the Atlantic, and cities in the United States followed with their own tax-funded libraries. Wealthy businessmen also played a part: one Scottish-born industrialist paid for the construction of thousands of library buildings, provided that the local community agreed to supply the books and keep the building running.",
        },
        {
          label: "D",
          text: "Early public libraries were often serious, quiet places with strict rules. Readers could not usually walk along the shelves and choose for themselves; instead they asked a librarian to fetch the book from a closed store. Children were sometimes not allowed inside at all. Over time, however, librarians began to see the benefit of open shelves, where visitors could browse freely. They also created separate rooms for young readers, and by the early twentieth century story hours for children had become a familiar feature in many towns.",
        },
        {
          label: "E",
          text: "In the second half of the twentieth century, libraries took on new roles. Alongside books they lent records, films and later computer discs. Mobile libraries, built into vans or buses, carried books to villages that had no building of their own. Libraries also became places to learn practical skills, with classes in reading for adults, help with job applications and, more recently, free access to the internet. For many people without a computer at home, the library is still the only place where they can go online.",
        },
        {
          label: "F",
          text: "The arrival of digital books has led some commentators to predict that libraries will disappear. Yet visitor numbers in many countries have remained steady, and in some places they have risen. Part of the explanation is that people value the library as a shared space as much as a store of books. It offers somewhere warm to study, meet friends or simply sit in silence, and it costs nothing to enter. Librarians also report that young people, who grew up with screens, are among their most regular visitors. Many libraries now lend e-books and host events such as film evenings, so that the old idea of a place open to everyone is being adapted rather than abandoned.",
        },
      ],
      groups: [
        {
          kind: "gap",
          title: "Questions 14–18",
          instructions:
            "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          limit: "NO MORE THAN TWO WORDS",
          questions: [
            {
              n: 14,
              text: "Before the printing press arrived in Europe, every book was copied by ____.",
              answer: ["hand"],
              why: "Paragraph A says every book was copied by hand.",
            },
            {
              n: 15,
              text: "Members of a subscription library shared the cost of new books by each paying a ____.",
              answer: ["yearly fee"],
              why: "Paragraph B says members each paid a yearly fee.",
            },
            {
              n: 16,
              text: "A British law of 1850 allowed towns to raise a small local ____ to pay for a library.",
              answer: ["tax"],
              why: "Paragraph C says towns could raise a small local tax.",
            },
            {
              n: 17,
              text: "The industrialist paid for library buildings if the community agreed to supply the ____.",
              answer: ["books"],
              why: "Paragraph C says the community had to supply the books and keep the building running.",
            },
            {
              n: 18,
              text: "In early public libraries, a librarian fetched the book a reader wanted from a ____.",
              answer: ["closed store"],
              why: "Paragraph D says readers asked a librarian to fetch the book from a closed store.",
            },
          ],
        },
        {
          kind: "mcq",
          title: "Questions 19–22",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 19,
              text: "According to paragraph B, subscription libraries were",
              options: [
                { key: "A", label: "cheap enough for factory workers to join." },
                { key: "B", label: "useful mainly to merchants and professionals." },
                { key: "C", label: "the first libraries open to the public." },
                { key: "D", label: "opened and paid for by governments." },
              ],
              answer: "B",
              why: "Paragraph B says the clubs were useful to merchants and professionals but too costly for a factory worker.",
            },
            {
              n: 20,
              text: "In the nineteenth century, reformers believed that reading would",
              options: [
                { key: "A", label: "make factories more profitable." },
                { key: "B", label: "help workers to improve their lives." },
                { key: "C", label: "take the place of schools." },
                { key: "D", label: "persuade people to move to cities." },
              ],
              answer: "B",
              why: "Paragraph C says reformers argued that reading would help people to improve their lives.",
            },
            {
              n: 21,
              text: "What change did librarians make to the way readers used early libraries?",
              options: [
                { key: "A", label: "They closed the rooms for children." },
                { key: "B", label: "They let visitors choose books from the shelves themselves." },
                { key: "C", label: "They stopped asking readers to be quiet." },
                { key: "D", label: "They moved the books into vans." },
              ],
              answer: "B",
              why: "Paragraph D says librarians introduced open shelves where visitors could browse freely.",
            },
            {
              n: 22,
              text: "What does the writer say about libraries today?",
              options: [
                { key: "A", label: "Visitor numbers have fallen sharply." },
                { key: "B", label: "They have stopped lending e-books." },
                { key: "C", label: "Many people value them as a shared space." },
                { key: "D", label: "They no longer hold any events." },
              ],
              answer: "C",
              why: "Paragraph F says people value the library as a shared space as much as a store of books.",
            },
          ],
        },
        {
          kind: "match",
          title: "Questions 23–26",
          instructions:
            "The passage has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, as your answer. You may use any letter more than once.",
          choices: [
            { key: "A", label: "Paragraph A" },
            { key: "B", label: "Paragraph B" },
            { key: "C", label: "Paragraph C" },
            { key: "D", label: "Paragraph D" },
            { key: "E", label: "Paragraph E" },
            { key: "F", label: "Paragraph F" },
          ],
          questions: [
            {
              n: 23,
              text: "a description of how books reached villages without a library building",
              answer: "E",
              why: "Paragraph E describes mobile libraries built into vans or buses.",
            },
            {
              n: 24,
              text: "a prediction that libraries will disappear",
              answer: "F",
              why: "Paragraph F says some commentators predict that libraries will disappear.",
            },
            {
              n: 25,
              text: "a mention of rules that limited how readers could use the books",
              answer: "D",
              why: "Paragraph D describes strict rules, a closed store and children being kept out.",
            },
            {
              n: 26,
              text: "an explanation of why ordinary people saw very few books",
              answer: "A",
              why: "Paragraph A says books were rare, expensive and copied by hand, so ordinary people saw only a handful.",
            },
          ],
        },
      ],
    },
    {
      title: "Growing Food Upwards",
      subtitle: "Can farms in city warehouses feed the future?",
      paragraphs: [
        {
          text: "Imagine a farm with no fields, no soil and no sun, set inside a warehouse in the middle of a city. Rows of leafy plants grow on shelves stacked up to the ceiling, lit by pink and purple LED lamps. This is vertical farming, and its supporters believe it could change the way cities feed themselves. The crops it produces are already on sale in supermarkets in several countries. Whether the idea will spread is still an open question, but it deserves more serious attention than it often receives.",
        },
        {
          text: "The basic method is simple. Instead of soil, the roots of each plant sit in water containing dissolved nutrients, a technique known as hydroponics. Some systems use a mist of nutrient water sprayed onto the roots instead. The lamps replace the sun, and computers control the temperature, the humidity and the amount of light. Because every condition is managed, crops can be grown all year round, and a harvest does not depend on the weather. A farm of this kind can also be built almost anywhere, including in disused buildings or underground tunnels.",
        },
        {
          text: "The most obvious advantage is the saving of water. Because the water in a hydroponic system is collected and used again, vertical farms can use far less than a traditional field, sometimes only a small fraction of it. They also need little or no pesticide, since the indoor environment keeps most insects out. In addition, producing food close to the people who eat it shortens the journey from farm to shop. A lettuce grown in a city warehouse may reach customers within hours, whereas a lettuce from a distant region can spend days in a lorry.",
        },
        {
          text: "Despite these benefits, there are serious difficulties. The biggest is energy. Lamps, pumps and climate controls use large amounts of electricity, and if that electricity comes from coal or gas, the environmental advantage of the farm is greatly reduced. Building and equipping a vertical farm is also expensive, which is why several well-known companies in this field have struggled financially. Some critics say that the whole idea is a fashionable distraction. This view seems too harsh, but it is fair to say that the industry has often promised more than it has delivered.",
        },
        {
          text: "Another limit is the range of crops. At present, vertical farms succeed mainly with salad leaves, herbs and a few soft fruits such as strawberries. These plants are light, grow quickly and sell for a good price. Staple foods such as wheat, rice and potatoes need much more space and light for each kilogram produced, so growing them indoors is not yet practical. Breeders are working on shorter varieties of some grains, but progress is slow. For this reason, vertical farms are unlikely to replace conventional agriculture, and it would be a mistake to think of them as a solution to world hunger.",
        },
        {
          text: "A more realistic role is a supporting one. In places with little farmland or harsh climates, such as desert countries or crowded island cities, fresh vegetables are often imported at high cost. Here an indoor farm can provide a reliable local supply. Small farms of this kind could also create skilled jobs in neighbourhoods that have lost traditional industries. As solar and wind power become cheaper, the energy problem may also become easier to solve. I believe that vertical farming will find a useful, if modest, place in the food system, provided that its owners are honest about what it can and cannot do.",
        },
      ],
      groups: [
        {
          kind: "tf",
          mode: "YNNG",
          title: "Questions 27–31",
          instructions:
            "Do the following statements agree with the views of the writer in the passage? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          questions: [
            {
              n: 27,
              text: "Vertical farming should receive more serious attention than it does at present.",
              answer: "YES",
              why: "The first paragraph says the idea deserves more serious attention than it often receives.",
            },
            {
              n: 28,
              text: "The writer agrees with critics that vertical farming is only a fashionable distraction.",
              answer: "NO",
              why: "The writer says this view seems too harsh.",
            },
            {
              n: 29,
              text: "The writer expects vertical farming to become most popular in Asia.",
              answer: "NOT GIVEN",
              why: "The passage never says where vertical farming is likely to be most popular.",
            },
            {
              n: 30,
              text: "The vertical farming industry has sometimes claimed more than it can achieve.",
              answer: "YES",
              why: "The writer says the industry has often promised more than it has delivered.",
            },
            {
              n: 31,
              text: "Vertical farms could be a solution to world hunger.",
              answer: "NO",
              why: "The writer says it would be a mistake to think of them as a solution to world hunger.",
            },
          ],
        },
        {
          kind: "mcq",
          title: "Questions 32–35",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 32,
              text: "What is the purpose of the lamps in a vertical farm?",
              options: [
                { key: "A", label: "to keep insects away from the plants" },
                { key: "B", label: "to take the place of sunlight" },
                { key: "C", label: "to warm the water around the roots" },
                { key: "D", label: "to measure the humidity" },
              ],
              answer: "B",
              why: "The second paragraph says the lamps replace the sun.",
            },
            {
              n: 33,
              text: "What happens if a vertical farm uses electricity from coal or gas?",
              options: [
                { key: "A", label: "The crops grow more quickly." },
                { key: "B", label: "The farm uses less water." },
                { key: "C", label: "The farm loses much of its environmental advantage." },
                { key: "D", label: "The farm cannot grow salad leaves." },
              ],
              answer: "C",
              why: "The fourth paragraph says the environmental advantage is greatly reduced.",
            },
            {
              n: 34,
              text: "Why do vertical farms mainly grow salad leaves and herbs?",
              options: [
                { key: "A", label: "These plants can grow without any water." },
                { key: "B", label: "These plants grow quickly and sell for a good price." },
                { key: "C", label: "These are the only crops that people want." },
                { key: "D", label: "These plants need more space than other crops." },
              ],
              answer: "B",
              why: "The fifth paragraph says these plants are light, grow quickly and sell for a good price.",
            },
            {
              n: 35,
              text: "What does the writer say about the future of vertical farming?",
              options: [
                { key: "A", label: "It will probably end within a few years." },
                { key: "B", label: "It is likely to have a modest but useful role." },
                { key: "C", label: "It will make food imports unnecessary everywhere." },
                { key: "D", label: "It will depend on cheaper farmland." },
              ],
              answer: "B",
              why: "The last paragraph says it will find a useful, if modest, place in the food system.",
            },
          ],
        },
        {
          kind: "gap",
          title: "Questions 36–40",
          instructions:
            "Complete the summary sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          limit: "NO MORE THAN TWO WORDS",
          questions: [
            {
              n: 36,
              text: "Plants in a vertical farm grow in water with dissolved nutrients, a method known as ____.",
              answer: ["hydroponics"],
              why: "The second paragraph names the technique as hydroponics.",
            },
            {
              n: 37,
              text: "The water in the system is collected and ____, so far less of it is needed.",
              answer: ["used again"],
              why: "The third paragraph says the water is collected and used again.",
            },
            {
              n: 38,
              text: "Because most insects are kept out, the farms need little or no ____.",
              answer: ["pesticide"],
              why: "The third paragraph says they need little or no pesticide.",
            },
            {
              n: 39,
              text: "The greatest difficulty for vertical farms is ____, because lamps and pumps use a great deal of electricity.",
              answer: ["energy"],
              why: "The fourth paragraph says the biggest difficulty is energy.",
            },
            {
              n: 40,
              text: "Wheat, rice and potatoes are not grown indoors yet because they need much more space and ____.",
              answer: ["light"],
              why: "The fifth paragraph says staple foods need much more space and light.",
            },
          ],
        },
      ],
    },
  ],
};
