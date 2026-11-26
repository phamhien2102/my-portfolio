/**
 * Real, official IELTS practice tests. They are somebody else's work, so the app links to them rather
 * than copying them: the recordings, passages and answer keys stay on the publisher's pages.
 * Checked against the publishers' own pages when this list was written.
 */

export type SkillId = "listening" | "reading" | "writing" | "speaking";

export interface OfficialTest {
  name: string;
  url: string;
  skills: SkillId[];
  cost: "Free" | "Paid";
  note: string;
}

export const OFFICIAL_TESTS: readonly OfficialTest[] = [
  {
    name: "Cambridge IELTS 21 · Academic",
    url: "https://shop.cambridge.org/english/product/2700255600",
    skills: ["listening", "reading", "writing", "speaking"],
    cost: "Paid",
    note: "The most recent Cambridge edition: four complete tests with audio, answer keys and sample Writing answers.",
  },
  {
    name: "British Council · free Academic practice tests",
    url: "https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic",
    skills: ["listening", "reading", "writing", "speaking"],
    cost: "Free",
    note: "Practice tests for all four skills, with audio and transcripts.",
  },
  {
    name: "IDP Vietnam · free practice tests",
    url: "https://ielts.idp.com/vietnam/prepare/article-free-practice-tests/en-gb",
    skills: ["listening", "reading", "writing", "speaking"],
    cost: "Free",
    note: "Online practice for each skill, with answers for checking yourself.",
  },
  {
    name: "IDP Vietnam · IELTS on computer familiarisation tests",
    url: "https://ielts.idp.com/vietnam/prepare/ielts-familiarisation-tests/en-gb",
    skills: ["listening", "reading", "writing"],
    cost: "Free",
    note: "Try the computer-delivered test screens, the same style as the exam-screen tools on this page.",
  },
  {
    name: "IELTS.org · Academic sample test questions",
    url: "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test",
    skills: ["listening", "reading", "writing", "speaking"],
    cost: "Free",
    note: "Sample questions from the organisers of the test.",
  },
  {
    name: "Cambridge English · IELTS practice",
    url: "https://www.cambridgeenglish.org/ielts-practice/",
    skills: ["listening", "reading", "writing", "speaking"],
    cost: "Free",
    note: "Practice material and preparation advice from Cambridge English.",
  },
];
