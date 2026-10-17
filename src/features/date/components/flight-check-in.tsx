"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { cn } from "@/lib/cn";

import { verifyBookingCode, verifyPassenger } from "../actions";
import {
  CODE_LENGTH,
  DEPARTURE_TIMES,
  DESTINATIONS,
  FORECASTS,
  JET_OPEN_TIME,
  PRIVATE_JET_PA,
  PRIVATE_JET_WEEKDAYS,
  SECRET_TIME,
  SECRET_TIME_PA,
  SOLD_OUT_PA,
  OPENING_PA,
  STEPS,
  WRONG_CODE_PA,
  WRONG_NAME_PA,
  type Destination,
} from "../data";
import { playSound, setSoundEnabled, unlockSound } from "../lib/sound";
import { toTicketName } from "../lib/ticket-name";
import { type Ticket } from "../lib/ticket";
import { downloadTicketImage, downloadTicketPdf } from "../lib/ticket-export";
import { BoardingPass } from "./boarding-pass";
import { BookingCodeInput } from "./booking-code";
import { CaptainBar } from "./captain";
import { DepartureBoard } from "./departure-board";
import { HeartBurst } from "./heart-burst";
import { SeatMap } from "./seat-map";
import { SecurityCheck } from "./security-check";
import { Sky } from "./sky";
import { WelcomeGate } from "./welcome-gate";

interface DayOption {
  label: string;
  /** getDay(): 0 là chủ nhật, 1 là thứ 2… */
  weekday: number;
  /** Ngày dạng YYYYMMDD, dùng cho file lịch. */
  stamp: string;
  year: number;
  month: number;
  date: number;
  forecast: string;
}

/** Bảy ngày tới, bắt đầu từ ngày mai. Gọi trong lúc bấm nút nên không đụng tới render. */
function upcomingDays(): DayOption[] {
  const format = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index + 1);
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const date = day.getDate();
    return {
      label: format.format(day),
      stamp: `${year}${String(month).padStart(2, "0")}${String(date).padStart(2, "0")}`,
      year,
      month,
      date,
      weekday: day.getDay(),
      forecast: FORECASTS[index % FORECASTS.length],
    };
  });
}

function departureAt(day: DayOption, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(day.year, day.month - 1, day.date, hours, minutes).getTime();
}

/** Tạo file .ics để em thêm buổi hẹn vào lịch của mình. */
function downloadCalendar(ticket: Ticket, day: DayOption) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Date Airways//HH143//EN",
    "BEGIN:VEVENT",
    `UID:hh143-${day.stamp}@date-airways`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${day.stamp}T${ticket.time.replace(":", "")}00`,
    "DURATION:PT3H",
    `SUMMARY:✈ Flight HH143 to ${ticket.destination.name}`,
    `DESCRIPTION:Seat ${ticket.seat}\\, next to me. Pick-up at your front door.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "flight-hh143.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function StepHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-[11px] tracking-[0.35em] text-[#ffc94a] uppercase">{eyebrow}</p>
      <h1 className="mt-2 bg-gradient-to-b from-white to-[#ffd6e7] bg-clip-text text-3xl font-extrabold tracking-tight text-balance text-transparent sm:text-5xl">
        {title}
      </h1>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Check-in progress">
      {STEPS.map((label, index) => (
        <li
          key={label}
          aria-current={index === step ? "step" : undefined}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <span
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              index < step && "w-5 bg-[#ff2d78]",
              index === step && "w-10 bg-[#ffc94a] shadow-[0_0_12px_#ffc94a]",
              index > step && "w-5 bg-white/15",
            )}
          />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Đồng hồ đếm ngược tới giờ cất cánh. */
function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const left = now === null ? null : Math.max(0, target - now);
  const parts = [
    ["days", left === null ? null : Math.floor(left / 86_400_000)],
    ["hrs", left === null ? null : Math.floor(left / 3_600_000) % 24],
    ["min", left === null ? null : Math.floor(left / 60_000) % 60],
    ["sec", left === null ? null : Math.floor(left / 1000) % 60],
  ] as const;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-[10px] tracking-[0.3em] text-white/45">T-MINUS</p>
      <div className="flex gap-2">
        {parts.map(([unit, value]) => (
          <div
            key={unit}
            className="flex w-16 flex-col items-center rounded-xl bg-[#0a0b0e] py-2 ring-1 ring-white/10"
          >
            <span className="font-mono text-2xl font-bold text-[#ffc94a] tabular-nums">
              {value === null ? "--" : String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] tracking-widest text-white/40 uppercase">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Quy trình check-in một chuyến bay, mà chuyến bay là một buổi hẹn hò. */
export function FlightCheckIn() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  /** Tên đã được server xác nhận là đúng người trên danh sách. */
  const [nameOk, setNameOk] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [wrongNames, setWrongNames] = useState(0);
  const latestName = useRef("");
  const nameTimer = useRef(0);
  const [code, setCode] = useState("");
  const [wrongTries, setWrongTries] = useState(0);
  const [codeError, setCodeError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  /** Mã mới nhất, để bỏ qua kết quả kiểm tra của một mã đã bị gõ đè. */
  const latestCode = useRef("");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [days, setDays] = useState<DayOption[]>([]);
  const [day, setDay] = useState<DayOption | null>(null);
  /** Những ngày cuối tuần em đã bấm thử và bị từ chối, để gạch đi. */
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const [dayRefusal, setDayRefusal] = useState<{ stamp: string; text: string } | null>(null);
  /** Cả tuần đã hết vé, chỉ còn chuyên cơ riêng. */
  const [privateJet, setPrivateJet] = useState(false);
  const [soldOutTimes, setSoldOutTimes] = useState<string[]>([]);
  const [timeRefusal, setTimeRefusal] = useState<{ time: string; text: string } | null>(null);
  /** Mọi giờ thường đã hết vé, chỉ còn khung giờ bí mật. */
  const [secretSlot, setSecretSlot] = useState(false);
  /** Hẹn giờ mở khung giờ bí mật, giữ lại để huỷ được khi em đổi ngày. */
  const secretTimer = useRef(0);
  const [time, setTime] = useState<string | null>(null);
  const [seat, setSeat] = useState<string | null>(null);
  const [partnerSeat, setPartnerSeat] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [departed, setDeparted] = useState(false);
  const [shared, setShared] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"image" | "pdf" | null>(null);
  const [entered, setEntered] = useState(false);
  const [sound, setSound] = useState(true);
  const [shaking, setShaking] = useState(false);
  const [pa, setPa] = useState({ id: 0, text: OPENING_PA });
  const [celebration, setCelebration] = useState<{ x: number; y: number } | null>(null);

  const passenger = toTicketName(name) || "YOU";

  const announce = (text: string) => {
    playSound("chime");
    setPa((current) => ({ id: current.id + 1, text }));
  };

  const shake = () => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 500);
  };

  const enter = () => {
    unlockSound();
    setSound(true);
    setEntered(true);
    playSound("chime");
  };

  const toggleSound = () => {
    setSoundEnabled(!sound);
    setSound(!sound);
    if (!sound) playSound("blip");
  };

  /** Hỏi server mã có đúng không. Mã đúng không bao giờ được gửi xuống trình duyệt. */
  const checkCode = async (value: string) => {
    const ok = await verifyBookingCode(value);
    if (latestCode.current !== value) return null;
    setVerified(ok);
    return ok;
  };

  const rejectCode = () => {
    playSound("buzz");
    setCodeError(true);
    shake();
    announce(WRONG_CODE_PA[Math.min(wrongTries, WRONG_CODE_PA.length - 1)]);
    setWrongTries(wrongTries + 1);
    // Mã sai thì xoá trắng và đặt con trỏ lại vào ô mã để em nhập lại ngay.
    latestCode.current = "";
    setCode("");
    setVerified(false);
    document.getElementById("booking-code")?.focus();
  };

  /** Gõ đủ 8 ký tự là tự kiểm tra. Mã đúng thì để các ô sáng xanh một chút rồi mới sang bước sau. */
  const changeCode = async (value: string) => {
    latestCode.current = value;
    setCode(value);
    setCodeError(false);
    setVerified(false);
    if (value.length !== CODE_LENGTH) return;

    setChecking(true);
    const ok = await checkCode(value);
    setChecking(false);
    if (ok === null) return;
    if (!ok) {
      rejectCode();
      return;
    }
    playSound("sparkle");
    window.setTimeout(() => {
      announce(
        `Welcome aboard, ${passenger}. Cabin crew report that you look great today. Please choose a destination.`,
      );
      setStep(1);
    }, 800);
  };

  /** Ô mã chỉ mở khi tên đã đúng, vì mã đúng là đi tiếp luôn. */
  const hasName = nameOk;

  const confirmName = () => {
    setNameOk(true);
    setNameError(false);
    playSound("sparkle");
    // Đợi ô mã được mở khoá xong rồi mới đặt con trỏ vào.
    window.setTimeout(() => document.getElementById("booking-code")?.focus(), 60);
  };

  const rejectName = () => {
    playSound("buzz");
    setNameError(true);
    announce(WRONG_NAME_PA[Math.min(wrongNames, WRONG_NAME_PA.length - 1)]);
    setWrongNames(wrongNames + 1);
    const input = document.getElementById("passenger");
    if (input instanceof HTMLInputElement) input.select();
  };

  /** Gõ tới đâu kiểm tra ngầm tới đó: đúng thì mở ô mã ngay, sai thì chưa báo lỗi khi đang gõ dở. */
  const changeName = (value: string) => {
    setName(value);
    setNameOk(false);
    setNameError(false);
    latestName.current = value;
    window.clearTimeout(nameTimer.current);
    if (!value.trim()) return;
    nameTimer.current = window.setTimeout(async () => {
      const ok = await verifyPassenger(value);
      if (ok && latestName.current === value) confirmName();
    }, 450);
  };

  /** Nhấn Enter hoặc rời ô tên: lúc này mới báo lỗi nếu tên sai. */
  const submitName = async () => {
    const value = latestName.current;
    if (!value.trim() || nameOk) return;
    window.clearTimeout(nameTimer.current);
    const ok = await verifyPassenger(value);
    if (latestName.current !== value) return;
    if (ok) confirmName();
    else rejectName();
  };

  const chooseDestination = (option: Destination) => {
    setDestination(option);
    setDays(upcomingDays());
    announce(option.pa);
    setStep(2);
  };

  /**
   * Lịch thường ngày nào cũng hết vé: bấm vào là bị gạch, gắn tem SOLD OUT kèm một câu đùa.
   * Bấm hết cả tuần thì chuyên cơ riêng của cơ trưởng hiện ra.
   */
  const pickDay = (option: DayOption) => {
    const refusal = SOLD_OUT_PA[option.weekday];
    playSound("buzz");
    setDayRefusal({ stamp: option.stamp, text: refusal });
    announce(refusal);
    // Bỏ trạng thái rung sau khi rung xong, để lần bấm sau vẫn rung lại được.
    window.setTimeout(
      () => setDayRefusal((current) => (current ? { ...current, stamp: "" } : current)),
      450,
    );
    if (soldOut.includes(option.stamp)) return;
    const next = [...soldOut, option.stamp];
    setSoldOut(next);
    if (next.length === days.length) {
      window.setTimeout(() => {
        playSound("sparkle");
        announce(PRIVATE_JET_PA);
        setPrivateJet(true);
      }, 1200);
    }
  };

  /** Giờ cũng như ngày: giờ nào cũng hết vé, hết sạch thì mở khung giờ bí mật 19:30. */
  /** Giờ còn chọn được với ngày đang chọn (thứ 2 đi chuyên cơ thì 19:00 không bị sold out). */
  const isOpenTime = (value: string) =>
    day?.weekday === JET_OPEN_TIME.weekday && value === JET_OPEN_TIME.time;

  const pickTime = (option: (typeof DEPARTURE_TIMES)[number]) => {
    if (!day) return;
    if (isOpenTime(option.time)) {
      playSound("blip");
      setTimeRefusal(null);
      setTime(option.time);
      return;
    }
    playSound("buzz");
    setTimeRefusal({ time: option.time, text: option.soldOut });
    announce(option.soldOut);
    window.setTimeout(
      () => setTimeRefusal((current) => (current ? { ...current, time: "" } : current)),
      450,
    );
    if (soldOutTimes.includes(option.time)) return;
    const next = [...soldOutTimes, option.time];
    setSoldOutTimes(next);
    if (next.length === DEPARTURE_TIMES.length) {
      secretTimer.current = window.setTimeout(() => {
        playSound("sparkle");
        announce(SECRET_TIME_PA);
        setSecretSlot(true);
      }, 1200);
    }
  };

  /** Đổi sang ngày khác thì phần giờ phải chọn lại từ đầu: hết SOLD OUT, ẩn khung giờ bí mật. */
  const pickJetDay = (option: DayOption) => {
    playSound("blip");
    if (day?.stamp === option.stamp) return;
    setDay(option);
    window.clearTimeout(secretTimer.current);
    setTime(null);
    setSoldOutTimes([]);
    setTimeRefusal(null);
    setSecretSlot(false);
  };

  const confirmSchedule = () => {
    if (!day || !time) return;
    announce(
      `${day.label} at ${time} is confirmed. The pilot has cleared the entire calendar. Please pick a seat.`,
    );
    setStep(3);
  };

  const pickSeat = (picked: string, partner: string) => {
    setSeat(picked);
    setPartnerSeat(partner);
    announce(
      `Seat ${picked} confirmed. Armrest sharing is mandatory on this flight. Please proceed to security.`,
    );
    setStep(4);
  };

  const passSecurity = () => {
    setClearing(true);
    window.setTimeout(() => {
      playSound("thud");
      shake();
    }, 250);
    window.setTimeout(() => {
      setClearing(false);
      announce("Security cleared. Your boarding pass is printing now. Do not lose it.");
      setStep(5);
    }, 1500);
  };

  const depart = () => {
    setDeparted(true);
    setCelebration({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 });
    playSound("whoosh");
    window.setTimeout(() => playSound("sparkle"), 300);
    announce(
      `Cabin crew, prepare for take-off. ${passenger}, see you on ${day?.label}. I'll be at your door at ${time}.`,
    );
  };

  const ticket: Ticket | null =
    destination && day && time && seat && partnerSeat
      ? { passenger, destination, dateLabel: day.label, time, seat, partnerSeat }
      : null;

  /** Tải vé về máy dưới dạng ảnh PNG hoặc PDF. Font chữ lấy từ chính nút được bấm. */
  const saveTicket = async (kind: "image" | "pdf", button: HTMLElement) => {
    if (!ticket || exporting) return;
    playSound("print");
    setExporting(kind);
    const sans = getComputedStyle(button).fontFamily;
    try {
      if (kind === "image") await downloadTicketImage(ticket, sans);
      else await downloadTicketPdf(ticket, sans);
      setShared(kind === "image" ? "Ticket saved as an image." : "Ticket saved as a PDF.");
    } catch {
      setShared("Couldn't save the ticket. A screenshot works too.");
    } finally {
      setExporting(null);
    }
  };

  const share = async () => {
    if (!ticket) return;
    playSound("blip");
    const text = [
      "✈ Flight HH143 · Date Airways",
      `Passenger: ${ticket.passenger}`,
      `Destination: ${ticket.destination.icon} ${ticket.destination.name}`,
      `Date: ${ticket.dateLabel} · departs ${ticket.time}`,
      `Seat: ${ticket.seat}, next to me`,
    ].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Date ticket", text });
        setShared("Ticket sent.");
      } else {
        await navigator.clipboard.writeText(text);
        setShared("Ticket copied. Paste it in a message to me.");
      }
    } catch {
      setShared("Couldn't send it. A screenshot works too.");
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-svh overflow-hidden bg-[#070a12] text-[#f4f1ea]",
        shaking && "animate-[screen-shake_0.45s_ease-in-out]",
      )}
    >
      <style>{`
        @property --holo-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes holo-spin { to { --holo-angle: 360deg; } }
        @keyframes board-blink { 50% { opacity: 0.35; } }
        @keyframes seat-pulse { 50% { box-shadow: 0 0 6px rgba(255,45,120,0.3); } }
        @keyframes step-in {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes print-out { from { transform: translateY(-102%); } to { transform: translateY(0); } }
        @keyframes stub-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          20% { transform: translate(6px, -4px) rotate(4deg); opacity: 1; }
          100% { transform: translate(60px, 70vh) rotate(38deg); opacity: 0; }
        }
        @keyframes fly-by {
          0% { transform: translate(-30vw, 70vh) rotate(-14deg) scale(0.8); }
          100% { transform: translate(115vw, -10vh) rotate(-20deg) scale(1.3); }
        }
        @keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }
        @keyframes confiscate {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(60px) scale(0.2) rotate(40deg); opacity: 0; }
        }
        @keyframes flap-in {
          from { transform: rotateX(-80deg); opacity: 0.4; }
          to { transform: rotateX(0); opacity: 1; }
        }
        .flap-in { animation: flap-in 0.07s ease-out both; transform-origin: 50% 0; }
        @keyframes row-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 4px); }
          40% { transform: translate(7px, -5px); }
          60% { transform: translate(-5px, -3px); }
          80% { transform: translate(4px, 5px); }
        }
        @keyframes twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @keyframes cloud-drift { from { transform: translateX(0); } to { transform: translateX(180vw); } }
        @keyframes banner-plane {
          0% { transform: translateX(-40vw); }
          55%, 100% { transform: translateX(120vw); }
        }
        @keyframes pa-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pa-in { animation: pa-in 0.4s cubic-bezier(.2,.9,.3,1.2) both; }
        @keyframes bubble-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.3); }
          15% { opacity: 1; transform: translateY(0) scale(1.15); }
          25% { transform: translateY(0) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-14px); }
        }
        @keyframes heartbeat {
          0%, 100% { box-shadow: 0 0 20px rgba(255,45,120,0.4); filter: brightness(1); }
          30% { box-shadow: 0 0 50px rgba(255,45,120,0.9); filter: brightness(1.3); }
        }
        @keyframes verify-bar {
          0% { width: 0%; }
          70% { width: 92%; }
          100% { width: 99%; }
        }
        @keyframes glitch {
          0% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
          100% { transform: translateX(3px); }
        }
        @keyframes letter-pop {
          0% { opacity: 0; transform: scale(0.2) rotate(-20deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes claw-drop {
          0% { transform: translateY(-110px); }
          100% { transform: translateY(0); }
        }
        @keyframes tile-flip {
          0% { transform: rotateY(0) scale(1); }
          50% { transform: rotateY(90deg) scale(1.3); }
          100% { transform: rotateY(0) scale(1.15); }
        }
        @keyframes tooltip-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.6); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes seat-flip {
          0% { transform: rotateY(0) scale(1); }
          50% { transform: rotateY(180deg) scale(1.3); }
          100% { transform: rotateY(360deg) scale(1.1); }
        }
        @keyframes poof {
          0% { opacity: 1; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.6) translateY(-10px); }
          100% { opacity: 0; transform: scale(2) translateY(-24px); }
        }
        @keyframes eq-bounce { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
        @keyframes wave { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(20deg); } }
        @keyframes belt-in { from { transform: translateX(-260%); } to { transform: translateX(0); } }
        @keyframes belt { from { background-position: 0 0; } to { background-position: 20px 0; } }
        @keyframes alarm { 50% { opacity: 0; } }
        @keyframes stamp {
          0% { opacity: 0; transform: scale(3); }
          60% { opacity: 1; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heart-trail {
          0% { opacity: 0.9; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(18px) scale(0.4); }
        }
        .step-in { animation: step-in 0.5s ease-out both; }
        .print-out { animation: print-out 2.4s steps(18) both; }
        .stub-torn { animation: stub-fall 0.9s cubic-bezier(.5,0,.8,.4) forwards; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <Sky />

      <button
        type="button"
        onClick={toggleSound}
        aria-label={sound ? "Mute sounds" : "Turn sounds on"}
        aria-pressed={sound}
        className="fixed top-3 right-3 z-50 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg backdrop-blur transition hover:scale-110 sm:top-4 sm:right-4 sm:size-10"
      >
        {sound ? "🔊" : "🔇"}
      </button>

      {!entered && <WelcomeGate onEnter={enter} />}

      {celebration && <HeartBurst x={celebration.x} y={celebration.y} count={160} />}

      {departed && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-40 flex items-center gap-2"
          style={{ animation: "fly-by 3.4s ease-in forwards" }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className="text-[#ff8ab3]"
              style={{
                fontSize: `${0.8 + index * 0.25}rem`,
                animation: `heart-trail 0.6s ${index * 0.1}s ease-out infinite alternate`,
              }}
            >
              ♥
            </span>
          ))}
          <span className="text-7xl text-white drop-shadow-[0_0_24px_rgba(255,45,120,0.9)]">✈</span>
        </div>
      )}

      {clearing && (
        <div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="[rotate:-10deg] animate-[stamp_0.4s_cubic-bezier(.3,1.6,.6,1)_both] rounded-2xl border-[6px] border-[#5cff9d] px-8 py-4 text-center text-[#5cff9d] shadow-[0_0_60px_rgba(92,255,157,0.35)]">
            <p className="font-mono text-5xl font-black tracking-[0.15em] sm:text-7xl">CLEARED</p>
            <p className="mt-1 font-mono text-xs tracking-[0.4em]">♥ SECURITY · LANE 3 ♥</p>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-svh max-w-3xl flex-col items-center px-5 pt-10 pb-24 sm:pt-14">
        <Progress step={step} />
        <CaptainBar announcement={entered ? pa : null} />

        <div key={step} className="step-in mt-8 flex w-full flex-1 flex-col items-center">
          {step === 0 && (
            <>
              <StepHeading eyebrow="Domestic terminal · This week" title="Departures" />
              <p className="mt-3 max-w-md text-center text-sm text-white/60">
                Every other flight is cancelled. Only one gate is still open. Tap a flight if you
                don’t believe me.
              </p>
              <div className="mt-8 w-full">
                {/* Bảng chỉ bắt đầu lật sau khi em vào cổng, lúc đó âm thanh đã được mở khoá. */}
                {entered ? (
                  <DepartureBoard passenger={toTicketName(name)} onRowClick={announce} />
                ) : (
                  <div className="h-56 w-full rounded-xl bg-[#0a0b0e] ring-1 ring-white/5" />
                )}
              </div>
              <form
                onSubmit={(event: FormEvent) => event.preventDefault()}
                className="mt-8 flex w-full max-w-md flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="passenger"
                    className="text-[11px] tracking-[0.2em] text-white/50 uppercase"
                  >
                    Passenger name
                  </label>
                  <input
                    id="passenger"
                    value={name}
                    onChange={(event) => changeName(event.target.value)}
                    onKeyDown={(event) => {
                      // Không có nút Check-in nên form không tự gửi khi nhấn Enter; tự kiểm tra tên.
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (nameOk) document.getElementById("booking-code")?.focus();
                        else void submitName();
                      }
                    }}
                    onBlur={() => void submitName()}
                    placeholder="Your name"
                    maxLength={14}
                    autoComplete="off"
                    aria-invalid={nameError}
                    aria-describedby="passenger-hint"
                    className={cn(
                      "rounded-xl border bg-white/5 px-4 py-3 text-base outline-none placeholder:text-white/30",
                      nameOk
                        ? "border-[#5cff9d] text-[#5cff9d] shadow-[0_0_18px_rgba(92,255,157,0.25)]"
                        : nameError
                          ? "animate-[row-shake_0.45s_ease-in-out] border-[#ff5c5c]/70 bg-[#ff5c5c]/10"
                          : "border-white/15 focus:border-[#ffc94a] focus:shadow-[0_0_0_4px_rgba(255,201,74,0.15)]",
                    )}
                  />
                  <p
                    id="passenger-hint"
                    aria-live="polite"
                    className={cn(
                      "text-xs",
                      nameError ? "text-[#ff8a8a]" : nameOk ? "text-[#5cff9d]" : "text-white/40",
                    )}
                  >
                    {nameError
                      ? `📢 ${WRONG_NAME_PA[Math.min(wrongNames - 1, WRONG_NAME_PA.length - 1)]}`
                      : nameOk
                        ? "✓ Passenger found on the list."
                        : "Name as it appears on your booking."}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    codeError && "animate-[row-shake_0.45s_ease-in-out]",
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="booking-code"
                      className="text-[11px] tracking-[0.2em] text-white/50 uppercase"
                    >
                      Booking code
                    </label>
                    <span className="font-mono text-[10px] text-white/35">
                      {code.length}/{CODE_LENGTH}
                    </span>
                  </div>
                  <BookingCodeInput
                    value={code}
                    onChange={(value) => void changeCode(value)}
                    invalid={codeError}
                    verified={verified}
                    disabled={!hasName || verified}
                  />
                  <p
                    id="booking-code-hint"
                    className={cn(
                      "text-xs",
                      codeError
                        ? "text-[#ff8a8a]"
                        : verified
                          ? "text-[#5cff9d]"
                          : checking
                            ? "text-[#ffc94a]"
                            : "text-white/40",
                    )}
                  >
                    {/* Lặp lại gợi ý ngay dưới ô nhập, vì lúc này khung cơ trưởng có thể đã bị cuộn khuất. */}
                    {codeError
                      ? `📢 ${WRONG_CODE_PA[Math.min(wrongTries - 1, WRONG_CODE_PA.length - 1)]}`
                      : verified
                        ? "Booking found. Boarding you now…"
                        : checking
                          ? "Checking your booking…"
                          : hasName
                            ? "8 characters. The pilot sent it to you privately."
                            : "Confirm the passenger name first to unlock the booking code."}
                  </p>
                </div>
              </form>
            </>
          )}

          {step === 1 && (
            <>
              <StepHeading eyebrow={`Hello, ${passenger}`} title="Where would you like to fly?" />
              <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                {DESTINATIONS.map((option, index) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseDestination(option)}
                    className="step-in group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg] hover:border-[#ffc94a]/60 hover:bg-white/[0.07] hover:shadow-[0_20px_50px_rgba(255,201,74,0.12)]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-3 -bottom-4 text-7xl opacity-20 transition duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:opacity-90"
                    >
                      {option.icon}
                    </span>
                    <p className="font-mono text-3xl font-extrabold text-[#ffc94a]">
                      {option.code}
                    </p>
                    <p className="mt-2 font-bold">{option.name}</p>
                    <p className="mt-1 max-w-[80%] text-sm text-white/55">{option.note}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeading
                eyebrow={`Destination · ${destination?.icon} ${destination?.name}`}
                title="Pick a schedule"
              />
              <p className="mt-3 text-center text-sm text-white/60">
                This flight runs daily. The pilot is free every day.
              </p>
              <div className="mt-8 flex w-full max-w-xl flex-wrap justify-center gap-2">
                {days.map((option) => (
                  <button
                    key={option.stamp}
                    type="button"
                    onClick={() => pickDay(option)}
                    className={cn(
                      "relative rounded-xl border px-4 py-3 font-mono text-sm transition",
                      // Lịch thường không bao giờ được chọn: ngày nào bấm vào cũng thành SOLD OUT.
                      soldOut.includes(option.stamp)
                        ? "border-[#ff5c5c]/40 bg-[#ff5c5c]/5 text-white/35 line-through"
                        : "border-white/15 bg-white/[0.04] hover:-translate-y-0.5 hover:border-white/40",
                      dayRefusal?.stamp === option.stamp && "animate-[row-shake_0.45s_ease-in-out]",
                    )}
                  >
                    {option.label}
                    {soldOut.includes(option.stamp) && (
                      <span className="absolute -top-2.5 -right-2 [rotate:8deg] animate-[stamp_0.35s_cubic-bezier(.3,1.6,.6,1)_both] rounded border-2 border-[#ff3b5c] bg-[#070a12] px-1 font-mono text-[9px] font-black tracking-wider text-[#ff3b5c] no-underline">
                        SOLD OUT
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {dayRefusal && !privateJet && (
                <p
                  key={dayRefusal.text}
                  aria-live="polite"
                  className="step-in mt-4 max-w-md rounded-2xl border border-[#ff5c5c]/30 bg-[#ff5c5c]/10 px-4 py-2 text-center text-sm text-[#ffb3b3]"
                >
                  📢 {dayRefusal.text}
                </p>
              )}
              {privateJet && (
                <div className="step-in relative mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-[#ffc94a]/50 bg-gradient-to-br from-[#2a1d05] via-[#14101f] to-[#2a0b1a] p-5 text-center shadow-[0_0_60px_rgba(255,201,74,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 -right-4 [rotate:-20deg] text-7xl opacity-20"
                  >
                    🛩️
                  </span>
                  <p className="font-mono text-[10px] tracking-[0.35em] text-[#ffc94a]">
                    ✨ CAPTAIN&apos;S PRIVATE JET ✨
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-white">
                    Whole week sold out. Good thing I own a jet.
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    One passenger only. Champagne optional, me included.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    {days
                      .filter((option) =>
                        (PRIVATE_JET_WEEKDAYS as readonly number[]).includes(option.weekday),
                      )
                      .map((option) => (
                        <button
                          key={option.stamp}
                          type="button"
                          onClick={() => pickJetDay(option)}
                          aria-pressed={day?.stamp === option.stamp}
                          className={cn(
                            "rounded-xl border px-4 py-3 font-mono text-sm font-bold transition",
                            day?.stamp === option.stamp
                              ? "scale-105 border-[#ffc94a] bg-[#ffc94a] text-[#1d1500] shadow-[0_0_24px_rgba(255,201,74,0.5)]"
                              : "border-[#ffc94a]/40 bg-[#ffc94a]/10 text-[#ffe3a3] hover:-translate-y-0.5 hover:border-[#ffc94a]",
                          )}
                        >
                          🛩️ {option.label}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              {day && (
                <p
                  key={day.stamp}
                  className="step-in mt-4 rounded-full bg-white/5 px-4 py-2 text-center text-sm text-white/75"
                >
                  ☀️ Forecast: {day.forecast}
                </p>
              )}
              {/* Phải chọn ngày trước rồi mới được chọn giờ. */}
              {!day && (
                <p className="mt-6 text-center font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
                  🔒 Pick a date first to unlock departure times
                </p>
              )}
              <div
                className={cn(
                  "mt-4 flex flex-wrap justify-center gap-2 transition-opacity duration-500",
                  !day && "opacity-25",
                )}
              >
                {DEPARTURE_TIMES.map((option) => (
                  <button
                    key={option.time}
                    type="button"
                    onClick={() => pickTime(option)}
                    disabled={!day}
                    aria-pressed={isOpenTime(option.time) ? time === option.time : undefined}
                    className={cn(
                      "relative rounded-full border px-5 py-2 font-mono text-sm transition",
                      !day && "cursor-not-allowed",
                      time === option.time
                        ? "scale-105 border-[#ff2d78] bg-[#ff2d78] font-bold text-white shadow-[0_0_24px_rgba(255,45,120,0.4)]"
                        : soldOutTimes.includes(option.time)
                          ? "border-[#ff5c5c]/40 bg-[#ff5c5c]/5 text-white/35 line-through"
                          : "border-white/15 hover:-translate-y-0.5 hover:border-white/40",
                      timeRefusal?.time === option.time && "animate-[row-shake_0.45s_ease-in-out]",
                    )}
                  >
                    {option.time}
                    {soldOutTimes.includes(option.time) && (
                      <span className="absolute -top-2.5 -right-3 [rotate:10deg] animate-[stamp_0.35s_cubic-bezier(.3,1.6,.6,1)_both] rounded border-2 border-[#ff3b5c] bg-[#070a12] px-1 font-mono text-[8px] font-black tracking-wider text-[#ff3b5c]">
                        SOLD OUT
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {time && isOpenTime(time) && !timeRefusal && (
                <p
                  aria-live="polite"
                  className="step-in mt-4 max-w-md rounded-2xl border border-[#5cff9d]/30 bg-[#5cff9d]/10 px-4 py-2 text-center text-sm text-[#b8ffd6]"
                >
                  ✈ {JET_OPEN_TIME.note}
                </p>
              )}
              {timeRefusal && !secretSlot && (
                <p
                  key={timeRefusal.text}
                  aria-live="polite"
                  className="step-in mt-4 max-w-md rounded-2xl border border-[#ff5c5c]/30 bg-[#ff5c5c]/10 px-4 py-2 text-center text-sm text-[#ffb3b3]"
                >
                  📢 {timeRefusal.text}
                </p>
              )}
              {secretSlot && (
                <div className="step-in relative mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-[#ff8ab3]/50 bg-gradient-to-br from-[#2a0b1a] via-[#14101f] to-[#1a0b2a] p-5 text-center shadow-[0_0_60px_rgba(255,45,120,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute -top-5 -left-3 [rotate:15deg] text-7xl opacity-20"
                  >
                    🌙
                  </span>
                  <p className="font-mono text-[10px] tracking-[0.35em] text-[#ff8ab3]">
                    🤫 SECRET DEPARTURE 🤫
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-white">
                    Every slot is gone. Except this one.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("blip");
                      setTime(SECRET_TIME.time);
                    }}
                    aria-pressed={time === SECRET_TIME.time}
                    className={cn(
                      "mt-4 rounded-full border px-8 py-3 font-mono text-lg font-bold transition",
                      time === SECRET_TIME.time
                        ? "scale-105 border-[#ff2d78] bg-[#ff2d78] text-white shadow-[0_0_30px_rgba(255,45,120,0.5)]"
                        : "animate-[seat-pulse_1.4s_ease-in-out_infinite] border-[#ff8ab3]/60 bg-[#ff2d78]/15 text-[#ffd6e7] hover:-translate-y-0.5",
                    )}
                  >
                    🌙 {SECRET_TIME.time}
                  </button>
                  {time === SECRET_TIME.time && (
                    <p className="step-in mt-3 text-sm text-[#ff8ab3]">{SECRET_TIME.vibe}</p>
                  )}
                </div>
              )}
              <button
                type="button"
                disabled={!day || !time}
                onClick={confirmSchedule}
                className="mt-8 rounded-xl bg-gradient-to-r from-[#ff2d78] to-[#ff5c9a] px-6 py-3 font-bold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 disabled:opacity-30"
              >
                Continue to seats
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeading eyebrow="Aircraft HH-143 · 20 seats" title="Choose your seat" />
              <div className="mt-6">
                <SeatMap
                  onPick={pickSeat}
                  onAnnounce={announce}
                  onPokeMany={() =>
                    announce(
                      "Passenger near the front, please stop poking other passengers. The blue seats are free, I promise.",
                    )
                  }
                />
              </div>
            </>
          )}

          {step === 4 && (
            <SecurityCheck passenger={passenger} onAnnounce={announce} onDone={passSecurity} />
          )}

          {step === 5 && ticket && day && (
            <>
              <StepHeading
                eyebrow="Now boarding · Gate 14"
                title={departed ? "Have a lovely flight" : "Here’s your ticket"}
              />
              <div className="mt-8 w-full">
                <BoardingPass ticket={ticket} onTorn={depart} />
              </div>
              {departed ? (
                <div className="step-in flex flex-col items-center gap-5 text-center">
                  <Countdown target={departureAt(day, ticket.time)} />
                  <p className="max-w-md text-white/75">
                    {ticket.dateLabel}, {ticket.time}. I’ll pick you up at your door. No luggage
                    needed, just bring yourself.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={share}
                      className="rounded-xl bg-[#ffc94a] px-6 py-3 font-bold text-[#1d1500] transition hover:-translate-y-0.5 hover:brightness-110"
                    >
                      Send me the ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSound("blip");
                        downloadCalendar(ticket, day);
                      }}
                      className="rounded-xl border border-white/20 px-6 py-3 font-bold transition hover:-translate-y-0.5 hover:border-white/50"
                    >
                      📅 Add to calendar
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={(event) => void saveTicket("image", event.currentTarget)}
                      disabled={exporting !== null}
                      className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-white/50 disabled:opacity-50"
                    >
                      {exporting === "image" ? "Printing…" : "🖼 Save as image"}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => void saveTicket("pdf", event.currentTarget)}
                      disabled={exporting !== null}
                      className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-white/50 disabled:opacity-50"
                    >
                      {exporting === "pdf" ? "Printing…" : "📄 Save as PDF"}
                    </button>
                  </div>
                  {shared && (
                    <p aria-live="polite" className="text-sm text-white/55">
                      {shared}
                    </p>
                  )}
                </div>
              ) : (
                <p className="animate-pulse text-center text-sm text-white/55">
                  ✂ Tear off the stub to board.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
