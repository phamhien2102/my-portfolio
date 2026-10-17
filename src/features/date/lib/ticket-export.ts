import { barcodeBars, FLIGHT, pickupTime, type Ticket } from "./ticket";

/** Kích thước ảnh tính theo đơn vị logic; ảnh thật được vẽ gấp SCALE lần cho nét. */
const WIDTH = 1080;
const HEIGHT = 480;
const SCALE = 2;
const PAD = 40;
const TICKET_W = WIDTH - PAD * 2;
const TICKET_H = HEIGHT - PAD * 2;
const STUB_X = 760;

const INK = "#1d1a16";
const MUTED = "#8a7f70";
const PINK = "#ff2d78";
const PAPER = "#f6f1e7";
const STUB = "#ffe4ee";
const NIGHT = "#070a12";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

/** letterSpacing chưa có trên mọi trình duyệt, nên chỉ đặt khi được hỗ trợ. */
function spacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = value;
}

function field(
  ctx: CanvasRenderingContext2D,
  sans: string,
  x: number,
  y: number,
  label: string,
  value: string,
  size = 20,
) {
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = `600 11px ${sans}`;
  spacing(ctx, "2px");
  ctx.fillText(label.toUpperCase(), x, y);
  ctx.fillStyle = INK;
  ctx.font = `700 ${size}px ${MONO}`;
  spacing(ctx, "0px");
  ctx.fillText(value, x, y + size + 6);
}

/**
 * Vẽ lại tấm vé lên canvas, không chụp DOM: trên trang vé đang nghiêng 3D và có hiệu ứng in,
 * chụp ra sẽ méo. Vẽ lại thì ảnh luôn thẳng và nét.
 */
export async function drawTicket(ticket: Ticket, sans: string) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = HEIGHT * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  // Nền đêm và vầng sáng hồng phía sau vé.
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(WIDTH / 2, HEIGHT, 0, WIDTH / 2, HEIGHT, WIDTH * 0.6);
  glow.addColorStop(0, "rgba(255,45,120,0.35)");
  glow.addColorStop(1, "rgba(255,45,120,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.translate(PAD, PAD);

  // Thân vé và cuống vé.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, TICKET_W, TICKET_H, 28);
  ctx.clip();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, STUB_X, TICKET_H);
  ctx.fillStyle = STUB;
  ctx.fillRect(STUB_X, 0, TICKET_W - STUB_X, TICKET_H);
  ctx.restore();

  // Hai vết khuyết tròn ở đường xé, cắt bằng màu nền.
  ctx.fillStyle = NIGHT;
  for (const y of [0, TICKET_H]) {
    ctx.beginPath();
    ctx.arc(STUB_X, y, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#d8cfbf";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(STUB_X, 24);
  ctx.lineTo(STUB_X, TICKET_H - 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tiêu đề.
  ctx.fillStyle = PINK;
  ctx.font = `800 18px ${sans}`;
  spacing(ctx, "3px");
  ctx.fillText("✈ DATE AIRWAYS", 36, 52);
  ctx.fillStyle = MUTED;
  ctx.font = `500 13px ${MONO}`;
  ctx.textAlign = "right";
  ctx.fillText("BOARDING PASS", STUB_X - 36, 52);

  // Tuyến bay.
  spacing(ctx, "0px");
  ctx.fillStyle = INK;
  ctx.font = `800 52px ${MONO}`;
  ctx.textAlign = "left";
  ctx.fillText("HOM", 36, 128);
  ctx.textAlign = "right";
  ctx.fillText(ticket.destination.code, STUB_X - 36, 128);
  ctx.fillStyle = MUTED;
  ctx.font = `400 15px ${sans}`;
  ctx.textAlign = "left";
  ctx.fillText("Your place", 36, 154);
  ctx.textAlign = "right";
  ctx.fillText(ticket.destination.name, STUB_X - 36, 154);

  ctx.strokeStyle = PINK;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(170, 110);
  ctx.lineTo(STUB_X - 170, 110);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tem "VERIFIED CUTE" cầu vồng.
  ctx.save();
  ctx.translate(STUB_X / 2, 110);
  ctx.rotate(-0.21);
  const holo = ctx.createConicGradient(0, 0, 0);
  ["#ff8ab3", "#ffc94a", "#5cff9d", "#5cc8ff", "#c58aff", "#ff8ab3"].forEach((color, index) =>
    holo.addColorStop(index / 5, color),
  );
  ctx.fillStyle = holo;
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `900 10px ${MONO}`;
  ctx.fillText("♥", 0, -10);
  ctx.fillText("VERIFIED", 0, 4);
  ctx.fillText("CUTE", 0, 17);
  ctx.restore();

  // Các ô thông tin.
  const cols = [36, 280, 524];
  field(ctx, sans, cols[0], 206, "Passenger", ticket.passenger);
  field(ctx, sans, cols[1], 206, "Flight", FLIGHT);
  field(ctx, sans, cols[2], 206, "Date", ticket.dateLabel);
  field(ctx, sans, cols[0], 268, "Pick-up", pickupTime(ticket.time));
  field(ctx, sans, cols[1], 268, "Departs", ticket.time);
  field(ctx, sans, cols[2], 268, "Gate", "Your front door");
  field(ctx, sans, cols[0], 336, "Class", "Heart business");
  field(ctx, sans, cols[1], 336, "Booking", "******** ✓");

  // Mã vạch.
  ctx.fillStyle = INK;
  const barX = STUB_X - 36 - 200;
  for (const bar of barcodeBars(ticket)) {
    ctx.fillRect(barX + (bar.x / 220) * 200, 318, (bar.w / 220) * 200, 46);
  }

  // Cuống vé.
  const sx = STUB_X + 32;
  field(ctx, sans, sx, 56, "Seat", ticket.seat, 48);
  field(ctx, sans, sx, 150, "Next to", `ME · ${ticket.partnerSeat}`);
  field(ctx, sans, sx, 214, "Flight", FLIGHT);
  ctx.fillStyle = PINK;
  ctx.font = `800 15px ${sans}`;
  ctx.textAlign = "left";
  ctx.fillText("♥ Admit two", sx, 350);

  ctx.restore();

  // Chữ ký nhỏ ở góc.
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = `500 11px ${MONO}`;
  spacing(ctx, "3px");
  ctx.textAlign = "right";
  ctx.fillText("DATE AIRWAYS · NON-REFUNDABLE · NON-TRANSFERABLE", WIDTH - PAD, HEIGHT - 14);

  return canvas;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadTicketImage(ticket: Ticket, sans: string) {
  const canvas = await drawTicket(ticket, sans);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the image");
  download(blob, "date-airways-hh143.png");
}

/**
 * Ghép một file PDF một trang chứa ảnh JPEG của vé. PDF cho phép nhúng thẳng JPEG
 * (bộ lọc DCTDecode), nên chỉ cần viết vài object là đủ, không cần thư viện.
 */
function jpegToPdf(jpeg: Uint8Array, pixelWidth: number, pixelHeight: number) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, body: string) => {
    offsets[id] = length;
    push(`${id} 0 obj\n${body}\nendobj\n`);
  };

  // Trang PDF dùng đúng kích thước logic của ảnh, tính bằng point.
  const pageW = WIDTH;
  const pageH = HEIGHT;
  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  offsets[4] = length;
  push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  push("\nendstream\nendobj\n");
  object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  push(`xref\n0 6\n0000000000 65535 f \n`);
  for (let id = 1; id <= 5; id++) push(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

export async function downloadTicketPdf(ticket: Ticket, sans: string) {
  const canvas = await drawTicket(ticket, sans);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("Could not create the PDF");
  const jpeg = new Uint8Array(await blob.arrayBuffer());
  download(jpegToPdf(jpeg, canvas.width, canvas.height), "date-airways-hh143.pdf");
}
