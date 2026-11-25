import type { LocaleBundle, Translations } from "@/components/course/i18n";

import type { DesignUi } from "../types";

/**
 * Vietnamese, in one file: the Design System course's own words, the name of every module, and
 * the lessons. Every lesson has its title and summary. Lessons translated in full also have
 * `goals`, `takeaways`, `hud`, `labels` (the names on the diagram) and `steps` (see LessonText;
 * a step's `labels` are keyed as in mapScene, in ../index.ts). A lesson without `steps` is shown
 * in English under its translated title, with a note saying so. To translate another lesson, give
 * its entry in `lessons` the same fields as "request-lifecycle".
 */
const ui: DesignUi = {
  nav: {
    learn: "Học",
    practice: "Luyện tập",
    designLab: "Phòng thiết kế",
    cheatsheets: "Tóm tắt nhanh",
  },
  searchPlaceholder: "Tìm bài học và khái niệm…",
  legend: { request: "yêu cầu", response: "phản hồi", handshake: "bắt tay", failed: "thất bại" },
  goesDown: (name) => `${name} ngừng hoạt động`,
  isBack: (name) => `${name} hoạt động trở lại`,
  traffic: (label) => `Lưu lượng: ${label}`,
  focusOn: (name) => `Tập trung vào ${name}`,
};

const modules: Translations["modules"] = {
  foundations: "01. Nền tảng",
  scaling: "02. Mở rộng quy mô",
  data: "03. Dữ liệu & Lưu trữ",
  communication: "04. Giao tiếp",
  reliability: "05. Độ tin cậy",
  architecture: "06. Kiến trúc",
  security: "07. Bảo mật",
  shipping: "08. Triển khai",
  "whole-systems": "09. Hệ thống hoàn chỉnh",
};

const lessons: Translations["lessons"] = {
  apis: {
    title: "REST, RPC & GraphQL",
    summary: "Ba cách định hình một API, và cách chọn giữa chúng.",
  },
  authentication: {
    title: "Xác thực",
    summary:
      "Chứng minh ai đang gọi: băm mật khẩu, phiên, token, và chuyện gì xảy ra khi thông tin đăng nhập bị lộ.",
  },
  authorization: {
    title: "Phân quyền",
    summary:
      "Quyết định một người gọi đã biết được phép làm gì: vai trò, quyền sở hữu, phạm vi, và nơi phép kiểm tra phải nằm.",
  },
  "batch-stream": {
    title: "Xử lý theo lô và theo luồng",
    summary:
      "Xử lý dữ liệu theo từng mảng lớn có lịch hoặc từng sự kiện một, và chọn theo độ mới và chi phí.",
  },
  caching: {
    title: "Bộ nhớ đệm",
    summary: "Giữ gần những câu trả lời bạn đã tính, và biết cái giá phải trả.",
  },
  cap: {
    title: "CAP và tính nhất quán",
    summary: "Khi mạng bị chia cắt, một kho dữ liệu nhân bản phải chọn giữa trả lời và đúng đắn.",
  },
  cdn: {
    title: "Phân phối nội dung",
    summary:
      "Đặt bản sao nội dung gần người dùng để hầu hết yêu cầu không bao giờ phải đi tới máy chủ gốc.",
  },
  cicd: {
    title: "CI/CD và triển khai",
    summary:
      "Biến một commit thành phần mềm đang chạy bằng kiểm tra tự động, triển khai an toàn và đường lùi nhanh.",
  },
  consensus: {
    title: "Đồng thuận và bầu leader",
    summary:
      "Cách một cụm máy không đáng tin đồng ý về một leader và một nhật ký, dùng đa số và nhiệm kỳ.",
  },
  "consistent-hashing": {
    title: "Băm nhất quán",
    summary: "Rải khóa trên nhiều máy chủ để thêm hoặc mất một máy chỉ di chuyển một phần nhỏ.",
  },
  "design-chat": {
    title: "Thiết kế hệ thống chat",
    summary:
      "Giữ hàng triệu kết nối trực tiếp, định tuyến tin nhắn giữa các máy chủ, và không bao giờ mất hay đảo thứ tự tin nào.",
  },
  "design-news-feed": {
    title: "Thiết kế bảng tin",
    summary:
      "Xây một dòng thời gian tải nhanh cho hàng triệu người đọc, từ fan-out đến xếp hạng đến bộ nhớ đệm.",
  },
  encryption: {
    title: "Mã hóa và bí mật",
    summary:
      "Bảo vệ dữ liệu trên đường truyền và trên đĩa, và giữ chính các khóa và mật khẩu khỏi nguy hiểm.",
  },
  files: {
    title: "Tệp và phương tiện",
    summary: "Lưu, tải lên và phân phối tệp lớn mà không làm nghẽn máy chủ ứng dụng.",
  },
  "hld-lld": {
    title: "HLD và LLD",
    summary: "Đi từ một yêu cầu mơ hồ đến các hộp và mũi tên, rồi phóng to vào các lớp và API.",
  },
  indexes: {
    title: "Chỉ mục",
    summary: "Đánh đổi một chút chi phí ghi và dung lượng đĩa để tra cứu bỏ qua gần hết bảng.",
  },
  "latency-throughput": {
    title: "Độ trễ và thông lượng",
    summary:
      "Hai con số nghe giống nhau nhưng trả lời những câu hỏi khác nhau, và tải liên kết chúng ra sao.",
  },
  "load-balancing": {
    title: "Cân bằng tải",
    summary: "Rải lưu lượng lên nhiều máy chủ, và tiếp tục phục vụ khi một máy chết.",
  },
  "message-queues": {
    title: "Hàng đợi thông điệp",
    summary: "Giao việc chậm cho một hàng worker để người dùng không phải chờ.",
  },
  microservices: {
    title: "Nguyên khối và vi dịch vụ",
    summary:
      "Khi nào một bản triển khai duy nhất là món quà, khi nào thành nút thắt, và chia nhỏ thật sự tốn gì.",
  },
  "napkin-math": {
    title: "Tính nhẩm trên khăn giấy",
    summary:
      "Ước lượng lưu lượng, dung lượng lưu trữ và băng thông trong đầu, đủ gần để chọn một thiết kế.",
  },
  observability: {
    title: "Khả năng quan sát",
    summary: "Dùng log, metric và trace để thấy hệ thống đang chạy làm gì và vì sao đau.",
  },
  pubsub: {
    title: "Pub/Sub và sự kiện",
    summary:
      "Thông báo điều đã xảy ra và để bất kỳ số dịch vụ nào phản ứng, mà không cần biết nhau.",
  },
  "rate-limiting": {
    title: "Giới hạn tốc độ",
    summary: "Bảo vệ dịch vụ khỏi những client đòi hỏi quá nhiều, vô tình hay cố ý.",
  },
  realtime: {
    title: "Cập nhật thời gian thực",
    summary:
      "Đẩy thay đổi tới người dùng ngay khi chúng xảy ra: polling, long polling, SSE và WebSocket.",
  },
  redundancy: {
    title: "Dự phòng và chuyển đổi dự phòng",
    summary:
      "Loại bỏ các điểm lỗi đơn bằng dung lượng dự phòng, kiểm tra sức khỏe và chuyển đổi gọn gàng.",
  },
  replication: {
    title: "Nhân bản",
    summary: "Giữ các bản sao dữ liệu trên nhiều máy để nhanh hơn và để sống sót.",
  },
  "request-lifecycle": {
    title: "Một yêu cầu đi như thế nào",
    summary: "Theo dõi một lần tải trang từng chặng một — và tìm ra thời gian thực sự đi đâu.",
    goals: [
      "DNS làm gì và vì sao câu trả lời của nó được lưu đệm",
      "Vì sao một kết nối tốn các vòng đi về",
      "Con đường: trình duyệt → máy chủ → cơ sở dữ liệu → quay lại",
      "Thời gian tải trang thực sự đi đâu",
      "Các tình huống: truy vấn chậm và người dùng ở xa",
    ],
    takeaways: [
      "Một lần tải trang là một chuỗi các chặng: DNS, kết nối, yêu cầu, cơ sở dữ liệu, phản hồi.",
      "Các lần bắt tay tốn các vòng đi về, nên khoảng cách và việc tái sử dụng kết nối rất quan trọng.",
      "Phần lớn thời gian là chờ đợi. Hãy đo xem nó đi đâu trước khi tối ưu bất cứ thứ gì.",
    ],
    hud: ["Tra cứu DNS", "Kết nối", "Yêu cầu + máy chủ", "Tải về", "Tổng"],
    labels: {
      you: "bạn",
      "dns.sub": "bộ phân giải",
      web: "Máy chủ web",
      db: "Cơ sở dữ liệu",
    },
    steps: [
      {
        short: "Nhấn Enter",
        title: "Người dùng nói cửa hàng chạy chậm",
        body: [
          "Trước khi làm gì nhanh hơn, bạn cần biết thời gian đi đâu. Vậy hãy theo dõi một lần tải trang.",
          "Bạn gõ `shop.example` và nhấn Enter. Khoảng một phần sáu giây sau, trang xuất hiện. Có rất nhiều chuyện xảy ra ở giữa.",
        ],
        callout:
          "Mỗi yêu cầu web là một cuộc trò chuyện giữa các máy. Mỗi bước tốn thời gian, và các chi phí cộng dồn lại.",
      },
      {
        short: "Tìm địa chỉ",
        title: "Tìm địa chỉ (DNS)",
        body: [
          "Mạng định tuyến theo địa chỉ IP dạng số, không theo tên. Vì vậy trình duyệt trước hết hỏi một bộ phân giải DNS: `shop.example` ở đâu?",
          "Câu trả lời, `203.0.113.7`, quay lại trong khoảng 20 ms.",
        ],
        callout:
          "Câu trả lời được lưu đệm trong một khoảng thời gian sống (TTL). Vài phút sau đó, các lượt truy cập lặp lại bỏ qua hẳn bước này.",
        labels: {
          "linkLabels.q": "shop.example ở đâu?",
        },
      },
      {
        short: "Kết nối",
        title: "Mở một kết nối",
        body: [
          "Giờ trình duyệt kết nối tới `203.0.113.7`. Một cái bắt tay TCP thống nhất việc trò chuyện; một cái bắt tay TLS thiết lập mã hóa.",
          "Mỗi cái bắt tay là một vòng đi về: một thông điệp đi và một phản hồi quay lại. Trên đường truyền 30 ms, đó đã là 60 ms trước khi một byte nào của trang được di chuyển.",
        ],
        callout:
          "Khoảng cách quan trọng. Ánh sáng trong cáp quang đi được khoảng 200 km mỗi mili giây, nên một máy chủ bên kia đại dương tốn thời gian thật ở mỗi vòng đi về.",
        labels: {
          "linkLabels.q": "đã lưu đệm · 5 phút",
        },
      },
      {
        short: "Yêu cầu",
        title: "Gửi yêu cầu",
        body: [
          "Qua kết nối đang mở, trình duyệt gửi `GET /products`. Máy chủ web nhận nó và bắt đầu dựng trang.",
          "Nhưng danh sách sản phẩm nằm trong cơ sở dữ liệu, nên máy chủ không thể tự trả lời.",
        ],
        labels: {
          "linkLabels.q": "đã lưu đệm · 5 phút",
        },
      },
      {
        short: "Lấy dữ liệu",
        title: "Máy chủ hỏi cơ sở dữ liệu",
        body: [
          "Máy chủ chạy một truy vấn như `SELECT * FROM products`, chờ các dòng kết quả, và điền vào mẫu HTML.",
          "Hãy để ý phần lớn thời gian máy chủ làm gì: chờ đợi. Một truy vấn chậm khiến mọi người dùng phải chờ theo.",
        ],
        callout:
          "Một truy vấn chậm là lý do phổ biến nhất khiến trang chậm. Hãy đo nó trước khi nghĩ đến việc thêm máy chủ.",
        labels: {
          "linkLabels.q": "đã lưu đệm · 5 phút",
        },
      },
      {
        short: "Phản hồi",
        title: "Trang quay về",
        chapter: "Giải pháp",
        body: [
          "Máy chủ gửi trang hoàn chỉnh xuống cùng kết nối đó và trình duyệt vẽ nó ra.",
          "Cộng lại: DNS 20 ms, bắt tay 60 ms, yêu cầu và cơ sở dữ liệu 55 ms, tải về 20 ms. Khoảng 155 ms, và 130 ms trong đó là chờ mạng.",
        ],
        labels: {
          "bubbles.you": "trang sẵn sàng · 155 ms",
          "linkLabels.q": "đã lưu đệm · 5 phút",
        },
      },
      {
        short: "Nhiều tệp hơn",
        title: "Một trang, nhiều yêu cầu",
        body: [
          "HTML chỉ là khởi đầu. Nó trỏ tới một stylesheet, một script và các hình ảnh, và trình duyệt tải từng thứ.",
          "Chúng đi qua kết nối đã mở sẵn, nên không có bắt tay mới. Nhưng mỗi tệp vẫn phải di chuyển, và trang chưa sẵn sàng cho đến khi các tệp quan trọng đến nơi.",
        ],
        callout:
          "Ít tệp hơn, nhỏ hơn thì tải nhanh hơn. Lưu đệm chúng trong trình duyệt hoặc trên CDN loại bỏ cả các yêu cầu.",
        labels: {
          "bubbles.you": "40 tệp · 1 kết nối",
          "linkLabels.q": "đã lưu đệm · 5 phút",
          "linkLabels.h": "HTTP/2 · nhiều yêu cầu cùng lúc",
        },
      },
      {
        short: "Truy vấn chậm",
        title: "Tình huống: truy vấn mất 400 ms",
        chapter: "Vấn đề",
        body: [
          "Giờ giả sử bảng sản phẩm đã lớn lên và truy vấn quét mọi dòng. Cơ sở dữ liệu mất 400 ms thay vì 35.",
          "Mạng không có gì thay đổi, vậy mà trang chậm gấp bốn lần, và mọi người dùng đều thấy.",
        ],
        callout:
          "Thêm máy chủ web sẽ không giúp gì ở đây: tất cả sẽ cùng chờ một truy vấn chậm. Hãy sửa nó bằng chỉ mục hoặc bộ nhớ đệm.",
        labels: {
          "bubbles.db": "400 ms · đang quét",
          "linkLabels.q": "đã lưu đệm · 5 phút",
        },
      },
      {
        short: "Ở xa",
        title: "Tình huống: người dùng ở lục địa khác",
        chapter: "Vấn đề",
        body: [
          "Một người mua ở Sydney kết nối tới máy chủ ở Virginia. Chỉ riêng ánh sáng đã cần khoảng 80 ms mỗi chiều, và đường đi thật dài hơn, nên một vòng đi về gần 200 ms.",
          "Hai cái bắt tay và một yêu cầu giờ tốn vài vòng đi về, và trang mất hơn nửa giây trước khi làm được việc gì.",
        ],
        callout:
          "Bạn không thể làm ánh sáng nhanh hơn. Hãy đặt nội dung gần người dùng hơn (CDN, hoặc một máy chủ trong khu vực của họ).",
        labels: {
          "labels.you": "bạn · Sydney",
          "linkLabels.q": "đã lưu đệm · 5 phút",
          "linkLabels.h": "≈ 200 ms mỗi vòng đi về",
        },
      },
      {
        short: "Tóm tắt",
        title: "Thời gian đã đi đâu",
        body: [
          "Một lần tải trang bình thường: DNS 20 ms, bắt tay 60 ms, yêu cầu và máy chủ 55 ms, tải về 20 ms. Tổng cộng khoảng 155 ms.",
          "Hãy để ý có bao nhiêu phần ít ỏi là mã của bạn. Phần lớn thời gian là chờ mạng, nên những cải thiện lớn là loại bỏ chặng, rút ngắn chúng, hoặc làm chúng song song.",
        ],
        callout:
          "Hầu hết các bài sau là mẹo để loại bỏ một chặng (bộ nhớ đệm), rút ngắn một chặng (CDN), hoặc làm một chặng song song (mở rộng ngang).",
        labels: {
          "bubbles.you": "trang sẵn sàng · 155 ms",
          "panels.0.title": "Thời gian đã đi đâu",
          "panels.0.line0": "Tra cứu DNS\t20 ms",
          "panels.0.line1": "Kết nối\t60 ms",
          "panels.0.line2": "Yêu cầu + máy chủ\t55 ms",
          "panels.0.line3": "Tải về\t20 ms",
          "panels.0.line4": "Tổng\t155 ms",
          "panels.0.line5": "130 ms trong đó là chờ",
        },
      },
    ],
  },
  sagas: {
    title: "Saga và giao dịch phân tán",
    summary:
      "Giữ một hành động nghiệp vụ nhiều dịch vụ nhất quán mà không khóa mọi cơ sở dữ liệu cùng lúc.",
  },
  "service-discovery": {
    title: "Khám phá dịch vụ và cổng",
    summary:
      "Cách người gọi tìm các instance khỏe mạnh đến rồi đi, và vì sao một cổng đứng ở cửa trước.",
  },
  sharding: {
    title: "Phân mảnh (Sharding)",
    summary:
      "Chia một tập dữ liệu khổng lồ ra nhiều máy để không cơ sở dữ liệu nào phải chứa tất cả.",
  },
  "sql-nosql": {
    title: "SQL và NoSQL",
    summary: "Chọn cơ sở dữ liệu hợp với hình dạng dữ liệu và các bảo đảm mà truy vấn của bạn cần.",
  },
  stateless: {
    title: "Dịch vụ phi trạng thái",
    summary:
      "Giữ bộ nhớ theo từng người dùng ra khỏi máy chủ web để máy chủ nào cũng trả lời được mọi yêu cầu.",
  },
  "storage-engines": {
    title: "Engine lưu trữ",
    summary:
      "So sánh B-tree và LSM-tree theo cách chúng biến ghi thành việc trên đĩa, và chọn theo khối lượng công việc.",
  },
  testing: {
    title: "Kiểm thử",
    summary:
      "Xây dựng sự tự tin với chi phí thấp: kiểm thử đơn vị, tích hợp và đầu-cuối, đồ giả, tính chập chờn, và những gì chạy trong CI.",
  },
  "timeouts-retries": {
    title: "Timeout và thử lại",
    summary:
      "Giới hạn thời gian chờ, chỉ thử lại những gì an toàn, và tránh biến một cú giật thành sự cố.",
  },
  transactions: {
    title: "Giao dịch và cô lập",
    summary:
      "Giữ các lượt ghi đồng thời đúng đắn: commit nguyên tử, mức cô lập, khóa và phiên bản.",
  },
  "unique-ids": {
    title: "ID duy nhất ở quy mô lớn",
    summary:
      "Sinh hàng triệu ID duy nhất, gần như theo thứ tự thời gian, mỗi giây mà không có một nút thắt đơn lẻ.",
  },
  "url-shortener": {
    title: "Thiết kế dịch vụ rút gọn URL",
    summary: "Ghép các mảnh lại: ID, lưu trữ, bộ nhớ đệm và lượng đọc nhiều hơn ghi 100 lần.",
  },
  "vertical-horizontal": {
    title: "Mở rộng dọc và mở rộng ngang",
    summary: "Mua máy to hơn hay thêm nhiều máy: mỗi cách tốn gì và dừng ở đâu.",
  },
};

const vi: LocaleBundle<DesignUi> = { ui, translations: { modules, lessons } };

export default vi;
