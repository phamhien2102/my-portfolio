import type { Band, SpeakingTest, WritingTest } from "../types";

export const WRITING: Record<Band, WritingTest> = {
  "56": {
    band: "56",
    task1: {
      prompt:
        "The table below shows the percentage of workers in the fictional city of Brennan who used five different methods of travelling to work in 2000, 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      visual: {
        kind: "table",
        caption: "Methods of travel to work in Brennan (% of workers)",
        columns: ["Method", "2000", "2010", "2020"],
        rows: [
          ["Car", "58", "52", "44"],
          ["Bus", "20", "22", "24"],
          ["Train", "12", "12", "11"],
          ["Bicycle", "6", "10", "15"],
          ["Walking", "4", "4", "6"],
        ],
      },
      modelAnswer:
        "The table compares the percentage of workers in the fictional city of Brennan who used five different ways of travelling to work in 2000, 2010 and 2020.\n\nOverall, the car remained the most popular method throughout the period, although its share fell steadily. In contrast, cycling and bus travel both became more common, while the figures for train travel and walking changed very little.\n\nIn 2000, well over half of workers (58%) drove to work, compared with 20% who took the bus and 12% who went by train. Cycling and walking were much less common, at 6% and 4% respectively. By 2020, the proportion of car users had dropped to 44%, a fall of 14 percentage points.\n\nThe most striking change was in cycling, which rose from 6% to 15% over the twenty years, more than doubling. Bus use also grew gradually, from 20% to 24%. Train travel stayed stable at 12% before dipping slightly to 11% in 2020, and walking edged up from 4% to 6%. Even so, the car was still used by nearly twice as many people as the bus at the end of the period.",
    },
    task2: {
      prompt:
        "Some people believe that university students should only study subjects that will help them to find a job. Others think that students should be free to study any subject they like. Discuss both views and give your own opinion.\n\nWrite at least 250 words.",
      ideas: [
        "Tuition is expensive, so a degree should lead to a well-paid job.",
        "Countries need doctors, engineers and teachers, so useful subjects help the economy.",
        "Students who enjoy their subject are more motivated and get better results.",
        "Subjects such as history or philosophy teach skills like critical thinking.",
        "The job market changes quickly, so a popular career today may disappear later.",
      ],
      modelAnswer:
        "People have different opinions about what students should study at university. While some argue that courses should prepare students for employment, others believe that students should be free to choose any subject. In my opinion, both views have merit, but a balance is the best solution.\n\nOn the one hand, there are good reasons to focus on subjects that lead to jobs. University is expensive, and many students and their families pay large amounts of money for tuition. They naturally hope that a degree will help them to find a well-paid position afterwards. In addition, governments need engineers, doctors and teachers, so encouraging students to study these areas can benefit the whole economy. For example, a country with too few nurses will have serious problems in its hospitals.\n\nOn the other hand, students who study a subject they enjoy are usually more motivated and achieve better results. Someone who loves history or art will work harder than someone who is forced to take a course they find boring. Moreover, subjects such as philosophy or literature teach useful skills, for instance critical thinking and communication, which employers also value. Finally, the job market changes quickly, so a career that is popular today may not exist in twenty years.\n\nIn my view, universities should offer a wide range of subjects, but they should also give students clear information about job opportunities and include practical skills in every course. In this way, students can follow their interests and still have a good chance of finding work.\n\nIn conclusion, although studying for a career is sensible, personal interest is equally important, and the best approach combines both.",
    },
  },
  "67": {
    band: "67",
    task1: {
      prompt:
        "The bar chart below shows the average monthly spending of single-person households and families with children in the fictional region of Eastvale on five categories. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      visual: {
        kind: "bar",
        caption: "Average monthly household spending in Eastvale",
        unit: "US dollars per month",
        categories: ["Housing", "Food", "Transport", "Leisure", "Healthcare"],
        series: [
          { name: "Single-person households", values: [900, 350, 280, 240, 90] },
          { name: "Families with children", values: [1150, 620, 410, 180, 210] },
        ],
      },
      modelAnswer:
        "The bar chart illustrates average monthly spending by single-person households and families with children in a fictional region, Eastvale, across five categories.\n\nOverall, housing was the largest expense for both groups, and families spent more than single people in every category except leisure.\n\nHousing accounted for the biggest outlay, at $900 for single people and $1,150 for families, a difference of $250. The gap was even more marked in food, where families spent $620 per month, almost double the $350 spent by single households. Transport followed a similar pattern, with families paying $410 compared with $280.\n\nHealthcare costs were low for both groups, but families spent more than twice as much, at $210 against $90. Leisure was the only category in which single people spent more, at $240 compared with $180 for families.\n\nIn total, families spent roughly $2,570 a month, whereas single-person households spent about $1,860, which suggests that the cost of supporting children is considerable, particularly in the areas of food and housing.",
    },
    task2: {
      prompt:
        "Many people believe that working from home is better for employees than working in an office. To what extent do you agree or disagree?\n\nWrite at least 250 words.",
      ideas: [
        "Working from home saves commuting time and money.",
        "Flexible hours help parents and people with disabilities.",
        "Isolation from colleagues can harm motivation and mental health.",
        "Younger workers learn by watching experienced colleagues.",
        "A hybrid model combines independence with teamwork.",
      ],
      modelAnswer:
        "It is often claimed that employees are better off working from home than in a traditional office. While remote work clearly offers significant advantages, I only partly agree with this view, because it also carries risks that are easy to overlook.\n\nThe main benefit of working from home is flexibility. Employees save the time and money they would otherwise spend commuting, which can amount to several hours a week, and they can arrange their day around family commitments. Many people also report higher productivity, since they are free from the constant interruptions of an open-plan office. For parents and people with disabilities in particular, this arrangement can make employment possible when it would otherwise be difficult.\n\nHowever, remote work is not suitable for everyone. Humans are social beings, and employees who rarely meet colleagues may feel isolated, which can damage both mental health and motivation. Furthermore, younger workers often learn most by observing experienced colleagues, something that is hard to replicate through a video call. There is also the practical problem that some homes lack a quiet space or a reliable internet connection, which makes concentration difficult. Finally, the boundary between work and personal life can disappear, leading some people to work longer hours and suffer from exhaustion.\n\nIn my opinion, the best solution is a hybrid model in which staff spend part of the week at the office and the remainder at home. This would preserve the independence that people value while maintaining the teamwork and training that only face-to-face contact provides.\n\nIn conclusion, working from home is beneficial for many employees, but it is not automatically better than office work. A balanced approach would deliver the advantages of both while limiting their drawbacks.",
    },
  },
  "78": {
    band: "78",
    task1: {
      prompt:
        "The graph below shows the number of visitors to three fictional attractions in the city of Calder at two-monthly intervals between January and November. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      visual: {
        kind: "line",
        caption: "Visitors to three attractions in Calder",
        unit: "thousand visitors",
        categories: ["January", "March", "May", "July", "September", "November"],
        series: [
          { name: "Maritime Museum", values: [12, 15, 24, 41, 30, 14] },
          { name: "Science Centre", values: [20, 22, 25, 27, 26, 21] },
          { name: "Art Gallery", values: [18, 16, 13, 9, 17, 22] },
        ],
      },
      modelAnswer:
        "The line graph shows how many visitors, in thousands, attended three fictional attractions in the city of Calder at two-monthly intervals between January and November.\n\nOverall, the Maritime Museum was the most seasonal attraction, with a pronounced summer peak, whereas visitor numbers at the Science Centre remained comparatively stable. The Art Gallery followed the opposite pattern, attracting its fewest visitors in the middle of the year.\n\nThe Maritime Museum began the year as the least visited site, with 12,000 visitors in January, but numbers climbed sharply to 24,000 in May and reached a peak of 41,000 in July, far above any other venue. Thereafter they fell back to 30,000 in September and just 14,000 by November.\n\nBy contrast, the Science Centre fluctuated within a narrow band of 20,000 to 27,000 throughout, peaking in July. It was the most popular attraction in January, March and May. The Art Gallery dropped steadily from 18,000 in January to a low of 9,000 in July, before recovering strongly to 22,000 in November, when it overtook the Science Centre to become the most visited venue.",
    },
    task2: {
      prompt:
        "In many countries, fewer young people are choosing to learn traditional crafts such as weaving, pottery or woodwork. Why is this happening, and what can be done to encourage more young people to learn these skills?\n\nWrite at least 250 words.",
      ideas: [
        "Handmade goods cannot compete on price with mass-produced products.",
        "Long apprenticeships seem unattractive in a culture of instant results.",
        "Manual work is often seen as lower in status than office jobs.",
        "Subsidised apprenticeships and tax relief could support young craftspeople.",
        "Online platforms let makers sell directly to international customers.",
      ],
      modelAnswer:
        "Traditional crafts such as weaving, pottery and woodwork are attracting fewer young practitioners than ever before in many countries. This trend can be explained by a combination of economic and cultural pressures, but there are practical steps that could reverse it.\n\nThe primary reason is financial. Handmade goods struggle to compete with cheap, mass-produced alternatives, so artisans often earn modest and unpredictable incomes. Young people, who may be burdened by student debt or rising housing costs, understandably favour careers that offer a stable salary. In addition, a craft can take years of patient apprenticeship to master, and in a culture that prizes instant results, this slow investment appears unattractive. Social attitudes compound the problem: manual skills are frequently regarded as inferior to office-based professions, and schools tend to steer talented pupils towards academic qualifications, leaving practical vocations with little prestige.\n\nNevertheless, several measures could revitalise these disciplines. Governments could subsidise apprenticeships, offering trainees a living wage while they develop their skills, and grant tax relief to small workshops that take on young staff. Equally important is a change in perception. If schools incorporated craft workshops into the curriculum and invited master artisans to demonstrate their work, pupils might discover both talent and genuine enthusiasm. Furthermore, digital platforms now allow makers to reach international customers directly, so training in online marketing could make craft businesses considerably more viable than they were a generation ago.\n\nIn conclusion, the decline in traditional crafts stems chiefly from poor financial prospects and low social status. By investing in apprenticeships, reshaping attitudes in education and helping artisans to exploit online markets, society could ensure that these valuable skills endure.",
    },
  },
};

export const SPEAKING: Record<Band, SpeakingTest> = {
  "56": {
    band: "56",
    part1: [
      {
        topic: "Hometown",
        questions: [
          "Where is your hometown?",
          "What do you like most about your hometown?",
          "Is it a good place for young people to live?",
          "Would you like to live there in the future?",
        ],
      },
      {
        topic: "Daily routine",
        questions: [
          "What time do you usually get up?",
          "What is your favourite part of the day?",
          "Do you prefer to plan your day or do things as they come?",
          "Has your daily routine changed in the last few years?",
        ],
      },
      {
        topic: "Food",
        questions: [
          "What kind of food do you enjoy eating?",
          "Do you like cooking at home?",
          "Do you usually eat with other people or alone?",
          "Is there any food you did not like as a child but like now?",
        ],
      },
    ],
    part2: {
      cue: "Describe a place where you like to relax.",
      bullets: [
        "where this place is",
        "how often you go there",
        "what you do there",
        "and explain why it helps you to relax",
      ],
      followUp: "Do you think you will still go to this place in the future?",
    },
    part3: [
      "Why do some people find it hard to relax these days?",
      "What kinds of places do people in your country go to for a rest?",
      "Do you think older people and younger people relax in the same way?",
      "How important is it for people to take holidays?",
      "Do you think cities should have more parks and quiet spaces?",
    ],
  },
  "67": {
    band: "67",
    part1: [
      {
        topic: "Weather",
        questions: [
          "What is the weather usually like where you live?",
          "Which season do you like best, and why?",
          "Does the weather affect your mood or your plans?",
          "Do you check the weather forecast before you go out?",
        ],
      },
      {
        topic: "Study or work",
        questions: [
          "Do you work or are you a student at the moment?",
          "What do you find most interesting about your studies or job?",
          "Is there anything you would like to change about it?",
          "What would you like to be doing in five years' time?",
        ],
      },
      {
        topic: "Mobile phones",
        questions: [
          "How often do you use your mobile phone each day?",
          "What do you mostly use it for?",
          "Have you ever tried spending a day without it?",
          "Do you think people spend too much time on their phones?",
        ],
      },
    ],
    part2: {
      cue: "Describe a person who has helped you to learn something new.",
      bullets: [
        "who this person is",
        "what you learned from them",
        "how they helped you to learn it",
        "and explain how you felt about the experience",
      ],
      followUp: "Have you ever helped someone else to learn something?",
    },
    part3: [
      "What qualities make someone a good teacher?",
      "Do you think people learn better in a classroom or by teaching themselves?",
      "How has technology changed the way people acquire new skills?",
      "Should schools focus more on practical skills than on exam results?",
      "Why do some adults find it difficult to learn new things?",
    ],
  },
  "78": {
    band: "78",
    part1: [
      {
        topic: "Reading",
        questions: [
          "Do you read much in your free time?",
          "Do you prefer printed books or reading on a screen?",
          "Did you read more when you were younger?",
          "What makes you decide to start a particular book?",
        ],
      },
      {
        topic: "Public transport",
        questions: [
          "How do you usually get around your city?",
          "What is public transport like in your area?",
          "What would improve public transport where you live?",
          "Would you ever give up your own vehicle for public transport?",
        ],
      },
      {
        topic: "Neighbours",
        questions: [
          "Do you know the people who live near you?",
          "How often do you talk to your neighbours?",
          "Have you ever asked a neighbour for help?",
          "Is it important to have a good relationship with the people next door?",
        ],
      },
    ],
    part2: {
      cue: "Describe a time when you had to make an important decision.",
      bullets: [
        "what the decision was",
        "what options you were considering",
        "how you reached your final choice",
        "and explain whether you think it was the right decision",
      ],
      followUp: "Is there anything you would do differently now?",
    },
    part3: [
      "Why do some people find it difficult to make decisions?",
      "To what extent should young people be free to make important choices for themselves?",
      "Do you think decisions are better made by individuals or by groups?",
      "How far do you think people's choices are influenced by advertising and social media?",
      "Is it more valuable to learn from mistakes or from other people's advice?",
    ],
  },
};
