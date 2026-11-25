import type { LessonText } from "@/components/course/i18n";

/** The whole Big-O lesson. The title and summary come from curriculum.ts. */
export const bigO: LessonText = {
  goals: [
    "Big-O đo cái gì và vì sao nó bỏ qua hằng số",
    "Sáu tốc độ tăng bạn hay gặp nhất",
    "Trường hợp tốt nhất, trung bình và xấu nhất",
    "Độ phức tạp thời gian so với độ phức tạp bộ nhớ",
  ],
  takeaways: [
    "Big-O mô tả số bước tăng thế nào khi đầu vào tăng, chứ không phải một lần chạy mất bao nhiêu giây.",
    "Bỏ hằng số và các số hạng bậc thấp: 3n + 5 và 100n đều là O(n).",
    "Luôn nói rõ trường hợp nào và tài nguyên nào: thời gian xấu nhất và bộ nhớ phụ có thể khác nhau.",
  ],
  hud: ["n", "Số bước", "Tốc độ tăng", "Bộ nhớ phụ"],
  pseudocode: [
    "analyze(items):",
    "    x = items[3]                  # O(1): một bước",
    "    for each item in items:       # O(n): chạm vào từng phần tử",
    "        total = total + item",
    "    while size > 1:               # O(log n): mỗi lần giảm một nửa",
    "        size = size / 2",
    "    for each a in items:          # O(n^2): vòng lặp trong vòng lặp",
    "        for each b in items:",
    "            compare(a, b)",
    "    return total",
  ],
  steps: [
    {
      short: "Vì sao",
      title: "Đếm bước, không đếm giây",
      body: [
        "Đồng hồ bấm giờ cho bạn biết một chương trình chạy nhanh thế nào trên một máy. Nó không nói gì về chuyện xảy ra khi đầu vào lớn gấp mười lần.",
        "Big-O đếm các bước cơ bản như một hàm của kích thước đầu vào `n`. Ở đây `n = 8`, và mỗi ô là một phần tử mà thuật toán có thể phải xem.",
      ],
      labels: {
        cap: "n = 8 phần tử",
      },
    },
    {
      short: "O(1)",
      title: "O(1): thời gian hằng số",
      body: [
        "Đọc `a[3]` mất một bước dù mảng có 8 hay 8 triệu phần tử. Chi phí hoàn toàn không phụ thuộc vào `n`.",
        "Hằng số không có nghĩa là 'nhanh', mà là 'phẳng'.",
      ],
      callout: "Truy cập mảng theo chỉ số, push vào ngăn xếp và tra cứu bảng băm đều là O(1).",
      labels: {
        cap: "một bước, với mọi n",
      },
    },
    {
      short: "O(n)",
      title: "O(n): thời gian tuyến tính",
      body: [
        "Cộng các phần tử của mảng là thăm mỗi phần tử một lần: 8 phần tử, 8 bước. Gấp đôi đầu vào thì công việc cũng gấp đôi.",
        "Tìm kiếm tuần tự, tìm giá trị lớn nhất và sao chép một danh sách đều là O(n).",
      ],
      labels: {
        cap: "chạm vào mỗi phần tử một lần: 8 bước",
      },
    },
    {
      short: "O(log n)",
      title: "O(log n): chia đôi bài toán",
      body: [
        "Nếu mỗi bước loại bỏ một nửa phần còn lại, 8 phần tử co lại còn 4, rồi 2, rồi 1: chỉ 3 bước. Một nghìn phần tử chỉ cần khoảng 10, một tỷ khoảng 30.",
        "Đó là lý do tìm kiếm nhị phân trên dữ liệu đã sắp xếp cho cảm giác tức thì.",
      ],
      callout: "log n là 'tôi có thể chia đôi n bao nhiêu lần trước khi còn 1'.",
      labels: {
        cap: "8 → 4 → 2 → 1: ba lần chia đôi",
      },
    },
    {
      short: "O(n²)",
      title: "O(n²): vòng lặp trong vòng lặp",
      body: [
        "So sánh mỗi phần tử với mọi phần tử khác mất `n × n` bước. Với `n = 6` đã là 36 ô công việc, và gấp đôi `n` thì tăng gấp bốn.",
        "Các vòng lặp lồng nhau trên cùng một dữ liệu thường là nguồn gốc của O(n²).",
      ],
      callout: "Ổn với vài trăm phần tử, đau đầu với hàng triệu.",
      labels: {
        cap: "6 × 6 = 36 cặp",
      },
    },
    {
      short: "So sánh",
      title: "Đặt cạnh nhau với n = 8",
      body: [
        "Đây là số bước cho cùng `n = 8`: 1, 3, 8, 24 (`n log n`), 64 và 256 (`2ⁿ`).",
        "Hai cái cuối bùng nổ. O(2ⁿ) xuất hiện khi bạn thử mọi tập con; với `n = 40` đã vượt một nghìn tỷ bước.",
      ],
      metrics: [null, "1 đến 256", null],
    },
    {
      short: "Hằng số",
      title: "Bỏ hằng số và số hạng nhỏ",
      body: [
        "Một vòng lặp làm 3 việc cho mỗi phần tử cộng 5 bước chuẩn bị tốn `3n + 5`. Với `n` rất lớn thì `5` chỉ là nhiễu và `3` chỉ là một đơn vị đo, nên ta viết O(n).",
        "Big-O chỉ giữ số hạng tăng nhanh nhất. `n² + n` là O(n²), vì tại `n = 1000` số hạng `n` chỉ thêm 0,1%.",
      ],
      callout: "Hằng số có ý nghĩa với tốc độ thực tế, còn Big-O chỉ trả lời 'nó mở rộng thế nào'.",
      labels: {
        l2: "↓ bỏ số 5",
        l4: "↓ bỏ số 3",
      },
    },
    {
      short: "Các trường hợp",
      title: "Tốt nhất, trung bình và xấu nhất",
      body: [
        "Tìm tuần tự một giá trị trong 6 phần tử có thể trúng ngay lần đầu (1 bước, trường hợp tốt nhất), ở giữa (khoảng 3, trung bình) hoặc ở cuối hay không có (6 bước, trường hợp xấu nhất).",
        "Nếu không nói khác, Big-O nêu trường hợp xấu nhất, vì đó là lời hứa bạn có thể dựa vào.",
      ],
      metrics: [null, null, "O(n) xấu nhất"],
      labels: {
        best: "tốt nhất: 1",
        worst: "xấu nhất: 6",
        cap: "cùng một đoạn mã, ba đầu vào khác nhau",
      },
    },
    {
      short: "Bộ nhớ",
      title: "Thời gian không phải chi phí duy nhất",
      body: [
        "Độ phức tạp bộ nhớ đếm lượng bộ nhớ phụ mà thuật toán cần ngoài đầu vào. Đảo ngược mảng tại chỗ dùng O(1) bộ nhớ phụ; chép nó sang mảng mới dùng O(n).",
        "Thường bạn có thể đánh đổi cái này lấy cái kia, chẳng hạn lưu kết quả vào bảng để khỏi tính lại.",
      ],
      callout: "Hãy nói cả hai: 'O(n log n) thời gian, O(n) bộ nhớ phụ'.",
      metrics: [null, "O(1) so với O(n)"],
      labels: {
        ghostnote: "tại chỗ: O(1)",
        copynote: "sao chép: O(n)",
        cap: "cùng đáp án, hóa đơn bộ nhớ khác nhau",
      },
    },
  ],
};
