/** Chuyến bay trên bảng giờ bay. Bảng chỉ có chữ in hoa, giống bảng thật ở sân bay. */
export const DEPARTURES = [
  {
    flight: "HH101",
    destination: "MY EX",
    status: "CANCEL",
    open: false,
    pa: "Flight HH101 to My Ex has been cancelled. Permanently. Please do not ask again.",
  },
  {
    flight: "HH204",
    destination: "DOOMSCROLLING",
    status: "DELAY",
    open: false,
    pa: "Flight HH204 to Doomscrolling is delayed until you are bored. Which is now.",
  },
  {
    flight: "HH317",
    destination: "SLEEP ALL DAY",
    status: "CANCEL",
    open: false,
    pa: "Flight HH317 to Sleep All Day was cancelled by the pilot, who would rather see you.",
  },
  {
    flight: "HH143",
    destination: "A DATE WITH ME",
    status: "OPEN",
    open: true,
    pa: "Good choice. Flight HH143 is the only one worth boarding tonight.",
  },
] as const;

/** Độ dài mã đặt chỗ. Bản thân mã chỉ nằm trên server, xem actions.ts. */
export const CODE_LENGTH = 8;

/** Gợi ý của cơ trưởng, rõ dần sau mỗi lần nhập sai. */
export const WRONG_CODE_PA = [
  "That booking code is not in our system. Please check the message from your pilot.",
  "Hint from the captain: eight letters, one Vietnamese sentence. You should say it more often.",
  "Final hint: it starts with EM and ends with ANH. You know what goes in the middle.",
] as const;

export const OPENING_PA =
  "Good evening, this is your captain speaking. Tonight's only departure is flight HH143. Please enter your name and booking code to check in.";

export const DESTINATIONS = [
  {
    code: "HOT",
    icon: "🍲",
    name: "Hotpot place",
    note: "Warm, spicy, and good for long talks",
    pa: "Hotpot confirmed. Expect steam, spice, and me stealing your fish balls.",
  },
  {
    code: "ROO",
    icon: "🌃",
    name: "Rooftop café",
    note: "Cool breeze, city lights coming on",
    pa: "Rooftop confirmed. Visibility is excellent, mostly because you'll be there.",
  },
  {
    code: "CIN",
    icon: "🍿",
    name: "Cinema",
    note: "Popcorn split in half, armrest is yours",
    pa: "Cinema confirmed. Please keep your phone off and your hand within reach.",
  },
  {
    code: "LAK",
    icon: "🌙",
    name: "Lakeside walk",
    note: "Slow steps, ice cream, no rush",
    pa: "Lakeside walk confirmed. Ice cream is on the captain tonight.",
  },
] as const;

export type Destination = (typeof DESTINATIONS)[number];

export const DEPARTURE_TIMES = [
  { time: "10:00", vibe: "Brunch energy. Coffee first, flirting second." },
  { time: "15:00", vibe: "Afternoon slot. Golden hour, golden company." },
  { time: "19:00", vibe: "Dinner time. Best seats, best lighting." },
  { time: "21:00", vibe: "Night owls only. Stars included free of charge." },
] as const;

export const FORECASTS = [
  "100% chance of butterflies. Light giggles in the evening.",
  "Clear skies, warm hands, scattered blushing.",
  "Strong winds of attraction from the south-west.",
  "Mild nerves early, turning sunny after the first laugh.",
] as const;

/** Sơ đồ ghế: lối đi nằm giữa B và C. */
export const SEAT_ROWS = [1, 2, 3, 4, 5] as const;
export const SEAT_LETTERS = ["A", "B", "C", "D"] as const;
export const HIS_SEAT = "3C";
export const FREE_SEAT = "3D";

/** Người đang ngồi ở các ghế khác, lần lượt hiện ra khi em bấm vào. */
export const SEAT_OCCUPANTS = [
  { icon: "👻", line: "Reserved for someone's ex. Let's skip it." },
  { icon: "😴", line: "A grandpa is napping here. Don't wake him." },
  { icon: "🔒", line: "Locked for emotional reasons." },
  { icon: "🪐", line: "Already sold to you, in another universe." },
  { icon: "🚽", line: "Right next to the toilet. You deserve better." },
  { icon: "🐈", line: "A cat bought this seat. Nobody knows how." },
  { icon: "📋", line: "The airline confirms: exactly one seat left." },
] as const;

export const SECURITY_QUESTIONS = [
  {
    question: "Carrying any liquids over 100ml?",
    item: "🧋",
    answers: [
      { label: "Bubble tea", reply: "Bubble tea is exempt. I'll get you another one." },
      { label: "No", reply: "Good. I'll get you a bubble tea later anyway." },
    ],
  },
  {
    question: "Does your luggage contain any intention to say no?",
    item: "🙅",
    answers: [
      {
        label: "Yes",
        reply: "Confiscated. That item is not allowed on board.",
        confiscate: true,
      },
      { label: "No", reply: "Bag is clean. Please proceed." },
    ],
  },
  {
    question: "Travelling alone or with someone?",
    item: "🧑‍🤝‍🧑",
    answers: [
      { label: "Alone", reply: "System updated: travelling with me.", runaway: true },
      { label: "With you", reply: "Correct. Passengers paired." },
    ],
  },
] as const;

/** Chữ trên nút Alone sau mỗi lần nó bỏ chạy. Hết danh sách thì nút xin nghỉ việc. */
export const RUNAWAY_LINES = [
  "Alone",
  "Nope",
  "Not alone",
  "Too slow",
  "Try again",
  "Still no",
  "I'm shy",
  "Bye 👋",
] as const;

/** Cơ trưởng bình luận ở vài lần bỏ chạy nhất định. Khoá là số lần đã chạy. */
export const RUNAWAY_PA: Record<number, string> = {
  1: "Attention please. The Alone button is not authorised on this flight.",
  4: "Passenger, please stop chasing the Alone button. It has feelings.",
  6: "The Alone button is requesting a transfer to another airline.",
};

export const RUNAWAY_GIVE_UP_PA =
  "The Alone button has officially resigned. Only one answer remains. Choose wisely.";

export const STEPS = ["Flight", "Destination", "Schedule", "Seat", "Security", "Boarding"];
