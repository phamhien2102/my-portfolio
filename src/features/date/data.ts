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
  "Final hint: it starts with ANH and ends with EM. You know what goes in the middle.",
] as const;

/** Gợi ý khi nhập sai tên hành khách, rõ dần sau mỗi lần sai. */
export const WRONG_NAME_PA = [
  "That name is not on the passenger list. This flight was booked for one very specific person.",
  "Hint from the captain: the name on the list is short. Four letters, no spaces.",
  "Final hint: it starts with H, and the captain says it every day.",
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

/** Giờ bay thường: giờ nào bấm vào cũng hết vé, mỗi giờ một câu đùa riêng. */
export const DEPARTURE_TIMES = [
  { time: "10:00", soldOut: "10:00 is sold out. The captain is not a morning person." },
  { time: "15:00", soldOut: "15:00 is gone. An afternoon nap booked every seat." },
  { time: "19:00", soldOut: "19:00 is sold out. Dinner rush, apparently." },
  { time: "21:00", soldOut: "21:00 is fully booked by a parliament of sleepy owls." },
] as const;

/**
 * Đi chuyên cơ ngày thứ 2 thì giữ lại đúng một giờ thường cho em: 19:00 chọn được luôn, không sold out.
 * weekday theo getDay(): 1 là thứ 2.
 */
export const JET_OPEN_TIME = {
  weekday: 1,
  time: "19:00",
  note: "Monday 19:00 on the private jet: the one regular slot the captain kept just for you.",
} as const;

/** Hết sạch giờ thường thì mở một khung giờ bí mật. */
export const SECRET_TIME = {
  time: "19:30",
  vibe: "The captain's favourite slot. Just enough time to look good and still be on time.",
} as const;

export const SECRET_TIME_PA =
  "All departure times are sold out. The captain has opened one secret slot at 19:30, reserved just for you.";

/**
 * Lịch thường ngày nào cũng hết vé. Bấm vào ngày nào thì cơ trưởng từ chối bằng một câu riêng.
 * Khoá là getDay(): 0 là chủ nhật, 1 là thứ 2… 6 là thứ 7.
 */
export const SOLD_OUT_PA: Record<number, string> = {
  1: "Monday is sold out. Turns out everyone wants to fix their Monday with a date.",
  2: "Tuesday is fully booked by a group of very emotional penguins.",
  3: "Wednesday is sold out. The plane is having a mid-week crisis.",
  4: "Thursday is gone. Someone bought every seat just to watch the sunset.",
  5: "Friday is sold out. Everyone else had the same idea.",
  6: "Saturday is reserved for the captain's beauty sleep.",
  0: "On Sundays this plane visits its grandma.",
};

/** Hết sạch vé cả tuần thì cơ trưởng mở chuyên cơ riêng, chỉ bay thứ 2 hoặc thứ 3. */
export const PRIVATE_JET_WEEKDAYS = [1, 2] as const;

export const PRIVATE_JET_PA =
  "Ladies and gentlemen, every flight this week is sold out. Fortunately, the captain owns a private jet. It flies on Monday or Tuesday, for one passenger only.";

export const FORECASTS = [
  "100% chance of butterflies. Light giggles in the evening.",
  "Clear skies, warm hands, scattered blushing.",
  "Strong winds of attraction from the south-west.",
  "Mild nerves early, turning sunny after the first laugh.",
] as const;

/** Sơ đồ ghế: lối đi nằm giữa B và C. */
export const SEAT_ROWS = [1, 2, 3, 4, 5] as const;
export const SEAT_LETTERS = ["A", "B", "C", "D"] as const;
/** Ghế trống rải rác khắp máy bay, để em tưởng mình được ngồi tự do. */
export const FREE_SEATS = ["1A", "1D", "2B", "2C", "3A", "3D", "4B", "4C", "5A", "5D"];

/** Tên hiện trên tooltip khi ghế bên cạnh lật ra là anh. */
export const CAPTAIN_NAME = "Raymond";

/** Ngồi ghế nào thì ghế bên cạnh cũng hoá ra là anh. */
export const PLOT_TWIST_PA =
  "Plot twist. The passenger next to you is not a stranger. It's me. This was always the plan.";

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
    /** Phóng to soi kỹ thì lòi ra một bức thư tình. */
    surprise: "letter",
    answers: [
      {
        label: "Bubble tea",
        reply: "Bubble tea confirmed. The scanner also found a love letter addressed to you.",
      },
      {
        label: "No",
        reply:
          "The scanner disagrees: one bubble tea (700ml, extra pearls) and one love letter addressed to you.",
        liar: true,
      },
    ],
  },
  {
    question: "Does your luggage contain any intention to say no?",
    item: "👕",
    /** Có hay không thì cũng lôi ra cả dàn chữ từ chối, cẩu gắp từng chữ lên lật lại. */
    surprise: "flip",
    answers: [
      {
        label: "Yes",
        reply:
          "Found it. Then found more. NO → ON, NOPE → OPEN, NOT NOW → NOW, MAYBE → YES. Your luggage is now 100% yes.",
      },
      {
        label: "No",
        reply:
          "The side pocket disagrees. NO → ON, NOPE → OPEN, NOT NOW → NOW, MAYBE → YES. Your luggage is now 100% yes.",
        deep: true,
      },
    ],
  },
  {
    question: "Travelling alone or with someone?",
    item: "🧑‍🤝‍🧑",
    surprise: null,
    answers: [
      {
        label: "Alone",
        // Câu thật được chọn trong ALONE_VERDICTS tuỳ em tự chọn bao nhiêu ô; đây chỉ là câu dự phòng.
        reply: "Verdict: not alone.",
        captcha: "Suspicious answer detected. Please complete one more security check.",
      },
      {
        label: "With you",
        reply: "Verified: travelling with Raymond. Passengers paired.",
        captcha: "Great answer. Please verify you are human anyway. Airline policy.",
      },
    ],
  },
] as const;

export const SECURITY_PA = {
  liar: "Security alert. The scanner says that was not entirely true. Enhancing the image.",
  letter: "Attention please. A love letter was found in your luggage. It is allowed on board.",
  deep: "Running a deep scan. Please do not panic, it is only your side pockets.",
  more: "Wait. The scanner found more. Please remain calm, this happens to everyone.",
  maybe: "One MAYBE left. Upgrading it to YES. This is standard procedure.",
  flip: "Luggage processed. Every no has been repaired. Thank you for your cooperation.",
} as const;

/** Các chữ từ chối lôi ra từ vali ở câu 2, lần lượt bị cẩu gắp lên lật thành chữ đồng ý. */
export const NO_TILES = [
  { from: "NO", to: "ON" },
  { from: "NOPE", to: "OPEN" },
  { from: "NOT NOW", to: "NOW" },
  { from: "MAYBE", to: "YES ♥" },
] as const;

/** Lá thư tìm thấy trong vali. {name} được thay bằng tên hành khách. */
export const LOVE_LETTER = [
  "Dear {name},",
  "Security checked everything twice. The only suspicious thing in my luggage is how nervous I am about our date.",
  "See you on board.",
] as const;

/**
 * CAPTCHA ở câu 3: chín ô ảnh, ô nào cũng là anh trong một bộ đồ khác nhau.
 * Ô cuối là con gấu để em phân vân.
 */
export const CAPTCHA_TILES = [
  { icon: "😎", tag: "R." },
  { icon: "🧑‍✈️", tag: "R." },
  { icon: "🤵", tag: "R." },
  { icon: "🥸", tag: "R." },
  { icon: "🧑‍🍳", tag: "R." },
  { icon: "🦸", tag: "R." },
  { icon: "🧛", tag: "R." },
  { icon: "🧑‍🚀", tag: "R." },
  { icon: "🐻", tag: "R.?" },
] as const;

/**
 * Phán quyết khi em chọn Alone, dựa trên chính số ô Raymond em tự tay bấm trong CAPTCHA.
 * {picked} là số ô em tự chọn, {found} là số ô hệ thống phải chọn giùm.
 */
export const ALONE_VERDICTS = {
  all: "You said “alone”, then clicked on Raymond nine times all by yourself. No further questions, your honour.",
  some: "You said “alone”, yet you picked Raymond {picked} times yourself. Security found the other {found}. The jury has reached a verdict: not alone.",
  none: "You said “alone” and picked nobody. Security still found nine Raymonds in your luggage. Verdict: not alone.",
} as const;

export const CAPTCHA_PA = {
  skip: "Skipping is not available on this flight.",
  missed: "Hint from security: every single square is the same person. Look closer.",
  verified: "Verification complete. Every square was Raymond. Passengers paired.",
} as const;

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

/** Bấm With you cũng chưa được ngay: bị troll 5 lần, lần thứ 6 mới chấp nhận. */
export const WITH_YOU_TROLLS = [
  "The captain heard that, but would like to hear it one more time.",
  "Airline policy: big decisions require a pinky promise.",
  "System error: answer too quiet. Please say it louder.",
  "Autocorrect suggested 'Alone'. Autocorrect has been fired.",
  "Sorry, the captain needed a moment. One last time, please.",
] as const;

export const WITH_YOU_ACCEPTED_PA = "Much better. The whole airport heard that.";

export const STEPS = ["Flight", "Destination", "Schedule", "Seat", "Security", "Boarding"];
