import type { LessonText } from "@/components/course/i18n";

/** Vietnamese: the name of every module and the title and summary of every lesson. */
export const modules: Record<string, string> = {
  foundations: "01. Nền tảng",
  arrays: "02. Mảng & Chuỗi",
  "linked-lists": "03. Danh sách liên kết",
  "stacks-queues": "04. Ngăn xếp & Hàng đợi",
  hashing: "05. Băm",
  trees: "06. Cây",
  heaps: "07. Heap",
  graphs: "08. Đồ thị",
  sorting: "09. Sắp xếp & Tìm kiếm",
  greedy: "10. Thuật toán tham lam",
  backtracking: "11. Quay lui",
  dp: "12. Quy hoạch động",
  bits: "13. Thao tác bit",
  hard: "14. Bài toán khó",
};

export const lessons: Record<string, Pick<LessonText, "title" | "summary">> = {
  arrays: {
    title: "Mảng",
    summary:
      "Một hàng các ô bằng nhau nằm cạnh nhau trong bộ nhớ: đọc tức thì, chèn vào giữa thì tốn kém.",
  },
  "balanced-brackets": {
    title: "Ngoặc cân bằng",
    summary:
      "Kiểm tra mọi dấu (, [ và { đều được đóng đúng thứ tự bằng cách giữ một ngăn xếp các dấu đang mở.",
  },
  "balanced-trees": {
    title: "Cây cân bằng",
    summary: "Giữ cây tìm kiếm luôn thấp bằng các phép xoay để mọi thao tác vẫn là O(log n).",
  },
  "bellman-ford": {
    title: "Bellman–Ford",
    summary:
      "Nới lỏng mọi cạnh V − 1 lần để tìm đường đi ngắn nhất kể cả khi có trọng số âm, và phát hiện chu trình âm.",
  },
  "big-o": {
    title: "Ký hiệu Big-O",
    summary: "Mô tả chi phí của thuật toán tăng thế nào theo đầu vào, và bỏ qua mọi thứ khác.",
  },
  "binary-heaps": {
    title: "Heap nhị phân",
    summary: "Một cây được xếp vào mảng, luôn giữ giá trị nhỏ nhất ở đỉnh.",
  },
  "binary-search-on-answer": {
    title: "Tìm kiếm nhị phân trên đáp án",
    summary:
      "Tìm trong khoảng các đáp án có thể bằng một phép kiểm tra có/không thay vì tìm trong mảng.",
  },
  "binary-search-trees": {
    title: "Cây tìm kiếm nhị phân",
    summary: "Một cây giữ các giá trị có thứ tự để tìm kiếm và chèn chỉ đi theo một đường.",
  },
  "binary-search": {
    title: "Tìm kiếm nhị phân",
    summary:
      "Tìm một giá trị trong danh sách đã sắp xếp bằng cách loại bỏ một nửa phần còn lại ở mỗi bước.",
  },
  "binary-trees": {
    title: "Cây nhị phân",
    summary: "Học từ vựng về cây và vì sao một cây nhị phân có thể nằm gọn trong một mảng thường.",
  },
  "bit-tricks": {
    title: "Mẹo thao tác bit",
    summary:
      "Xóa bit 1 thấp nhất, nhận ra lũy thừa của hai, đếm bit và tìm phần tử lẻ loi bằng XOR.",
  },
  "bits-and-masks": {
    title: "Bit và mặt nạ",
    summary:
      "Đọc số như một hàng bit, kết hợp chúng bằng AND, OR, XOR và dịch bit, rồi nhắm vào một bit.",
  },
  bitsets: {
    title: "Bitset",
    summary:
      "Lưu một tập số nguyên nhỏ với một bit cho mỗi phần tử có thể có và dùng các phép toán bit trên đó.",
  },
  "bloom-filters": {
    title: "Bộ lọc Bloom",
    summary:
      "Một mảng bit nhỏ xíu cho câu trả lời 'chắc chắn không' hoặc 'có lẽ có', đánh đổi độ chắc chắn lấy bộ nhớ.",
  },
  "breadth-first-search": {
    title: "Duyệt theo chiều rộng (BFS)",
    summary: "Khám phá đồ thị từng vòng một bằng hàng đợi, và có khoảng cách ngắn nhất miễn phí.",
  },
  "bst-deletion": {
    title: "Xóa nút trong BST",
    summary: "Xóa một nút khỏi cây tìm kiếm nhị phân trong ba trường hợp mà không phá thứ tự.",
  },
  "building-a-heap": {
    title: "Xây dựng heap",
    summary:
      "Biến một mảng bất kỳ thành heap trong thời gian tuyến tính bằng cách sàng xuống từ nút cha cuối cùng đến gốc.",
  },
  "circular-buffer": {
    title: "Bộ đệm vòng",
    summary:
      "Một mảng cố định dùng như hàng đợi, với chỉ số đầu và đuôi quay vòng bằng phép modulo.",
  },
  "coin-change": {
    title: "Đổi tiền xu",
    summary:
      "Tìm số đồng xu ít nhất cho đủ một số tiền, và xem vì sao chọn tham lam có thể thất bại.",
  },
  "collision-handling": {
    title: "Xử lý va chạm",
    summary:
      "Hai khóa, một ô: nối chuỗi và dò tuyến tính đều giữ được cả hai, với chi phí khác nhau.",
  },
  "connected-components": {
    title: "Thành phần liên thông",
    summary:
      "Tách đồ thị thành các mảnh riêng biệt bằng cách bắt đầu một lượt tìm từ mọi đỉnh chưa thăm.",
  },
  "counting-radix-sort": {
    title: "Sắp xếp đếm và cơ số",
    summary: "Sắp xếp mà không so sánh phần tử: đếm các số nguyên nhỏ, rồi sắp theo từng chữ số.",
  },
  "cycle-detection": {
    title: "Phát hiện chu trình",
    summary:
      "Tìm vòng lặp bằng DFS: láng giềng đã thăm không phải cha khi vô hướng, cạnh ngược khi có hướng.",
  },
  "depth-first-search": {
    title: "Duyệt theo chiều sâu (DFS)",
    summary:
      "Đi sâu theo một đường đến hết, rồi lùi lại thử đường kế tiếp, dùng đệ quy hoặc ngăn xếp.",
  },
  deques: {
    title: "Deque",
    summary:
      "Hàng đợi hai đầu: thêm và lấy ở cả hai đầu trong O(1), nên dùng được như ngăn xếp hoặc hàng đợi.",
  },
  "divide-and-conquer": {
    title: "Chia để trị",
    summary: "Chia bài toán thành các bản sao nhỏ hơn, giải từng cái, rồi gộp các đáp án.",
  },
  "doubly-linked-lists": {
    title: "Danh sách liên kết đôi",
    summary: "Mỗi nút biết cả hai láng giềng, nên một nút bạn đang giữ có thể bị xóa trong O(1).",
  },
  "dynamic-arrays": {
    title: "Mảng động",
    summary:
      "Một mảng tăng bằng cách nhân đôi dung lượng, nên việc thêm vào cuối rẻ tính trung bình.",
  },
  "edit-distance": {
    title: "Khoảng cách chỉnh sửa",
    summary: "Đếm số lần chèn, xóa và thay thế ít nhất để biến một từ thành từ khác.",
  },
  "fast-slow": {
    title: "Con trỏ nhanh và chậm",
    summary:
      "Hai con trỏ với tốc độ khác nhau tìm phần giữa của danh sách và phát hiện chu trình trong một lượt.",
  },
  "floyd-warshall": {
    title: "Floyd–Warshall",
    summary:
      "Điền ma trận khoảng cách cho mọi cặp nút bằng cách lần lượt thử từng nút làm điểm dừng chân.",
  },
  "graph-representation": {
    title: "Biểu diễn đồ thị",
    summary: "Lưu đỉnh và cạnh trong ma trận hoặc danh sách kề, và biết cái nào phù hợp.",
  },
  "grid-paths": {
    title: "Đường đi trên lưới",
    summary: "Đếm các lối đi qua lưới chỉ đi sang phải hoặc xuống dưới, từng ô một.",
  },
  "hash-tables": {
    title: "Bảng băm",
    summary: "Biến một khóa thành chỉ số mảng để tra cứu, thêm và xóa mất O(1) trung bình.",
  },
  "heap-sort": {
    title: "Sắp xếp vun đống (Heap Sort)",
    summary: "Sắp xếp tại chỗ bằng cách xây max-heap và liên tục đưa gốc về cuối mảng.",
  },
  "huffman-coding": {
    title: "Mã hóa Huffman",
    summary:
      "Cho các ký hiệu thường gặp mã bit ngắn bằng cách liên tục gộp hai nút nhẹ nhất thành một cây.",
  },
  "interval-scheduling": {
    title: "Xếp lịch theo khoảng",
    summary:
      "Xếp được nhiều cuộc họp không chồng nhau nhất vào một phòng bằng cách luôn chọn cuộc kết thúc sớm nhất.",
  },
  kmp: {
    title: "Tìm kiếm KMP",
    summary:
      "Knuth-Morris-Pratt tận dụng điều mà một phần khớp cho biết, nên văn bản không bao giờ bị đọc lại.",
  },
  knapsack: {
    title: "Bài toán cái túi",
    summary:
      "Chọn đồ vật để tối đa giá trị trong giới hạn khối lượng, quyết định lấy hay bỏ bằng bảng 2 chiều.",
  },
  "linked-lists": {
    title: "Danh sách liên kết đơn",
    summary: "Các nút nối bằng con trỏ next: thêm ở đầu rẻ, tìm chậm, dễ nối lại.",
  },
  "longest-increasing-subsequence": {
    title: "Dãy con tăng dài nhất",
    summary:
      "Tìm dãy tăng nghiêm ngặt dài nhất có thể chọn theo thứ tự, dùng bảng độ dài tốt nhất.",
  },
  "lowest-common-ancestor": {
    title: "Tổ tiên chung gần nhất",
    summary: "Tìm nút sâu nhất nằm trên hai nút cho trước, trong cây tổng quát và cây tìm kiếm.",
  },
  "lru-cache": {
    title: "Bộ nhớ đệm LRU",
    summary: "Bảng băm và danh sách liên kết đôi cho get và put O(1) và luôn loại khóa cũ nhất.",
  },
  matrices: {
    title: "Mảng 2 chiều",
    summary: "Lưới các hàng và cột: nằm trong bộ nhớ thế nào, duyệt ra sao và biến đổi thế nào.",
  },
  "maximum-subarray": {
    title: "Dãy con liên tiếp lớn nhất",
    summary:
      "Thuật toán Kadane tìm đoạn liên tiếp tốt nhất trong một lượt bằng cách theo dõi đoạn tốt nhất kết thúc tại đây.",
  },
  maze: {
    title: "Giải mê cung",
    summary: "Tìm lối đi qua mê cung dạng lưới bằng cách tiến lên và lùi ra khỏi ngõ cụt.",
  },
  "median-of-a-stream": {
    title: "Trung vị của luồng dữ liệu",
    summary: "Theo dõi trung vị đang chạy bằng hai heap chia dữ liệu thành nửa dưới và nửa trên.",
  },
  memoization: {
    title: "Ghi nhớ kết quả (Memoization)",
    summary: "Nhớ đáp án của mọi bài toán con để hàm đệ quy không bao giờ giải một bài hai lần.",
  },
  memory: {
    title: "Bộ nhớ và con trỏ",
    summary:
      "RAM là một hàng dài các ô được đánh số; con trỏ chỉ là số ô được lưu trong các ô khác.",
  },
  "merge-intervals": {
    title: "Gộp các khoảng",
    summary:
      "Sắp xếp các khoảng theo điểm đầu, rồi quét một lượt và gộp mọi khoảng chồng nhau vào khoảng trước.",
  },
  "merge-sort": {
    title: "Sắp xếp trộn (Merge Sort)",
    summary: "Chia danh sách làm đôi đến từng phần tử, rồi trộn các nửa đã sắp xếp lại với nhau.",
  },
  "merge-sorted-lists": {
    title: "Trộn các danh sách đã sắp xếp",
    summary: "Đan hai danh sách liên kết đã sắp xếp thành một bằng cách liên tục lấy đầu nhỏ hơn.",
  },
  "minimum-spanning-trees": {
    title: "Cây khung nhỏ nhất",
    summary:
      "Nối mọi nút bằng tập cạnh rẻ nhất mà không có chu trình, xây theo kiểu tham lam với phương pháp Kruskal.",
  },
  "monotonic-queue": {
    title: "Hàng đợi đơn điệu",
    summary: "Cực đại của cửa sổ trượt trong O(n): một deque các chỉ số mà giá trị giảm dần.",
  },
  "monotonic-stack": {
    title: "Ngăn xếp đơn điệu",
    summary:
      "Tìm phần tử lớn hơn kế tiếp cho mọi vị trí trong một lượt với ngăn xếp luôn được sắp xếp.",
  },
  "n-queens": {
    title: "N quân hậu",
    summary:
      "Đặt bốn quân hậu lên bàn cờ 4x4 sao cho không quân nào tấn công nhau, lùi lại từ ngõ cụt.",
  },
  "p-vs-np": {
    title: "P và NP",
    summary:
      "Vì sao kiểm tra một đáp án có thể dễ trong khi tìm ra nó lại khó, và điều đó có ý nghĩa gì với bạn.",
  },
  "pattern-matching": {
    title: "So khớp mẫu",
    summary:
      "Cách ngây thơ để tìm một mẫu trong văn bản: thử mọi vị trí bắt đầu và so từng chữ cái.",
  },
  permutations: {
    title: "Hoán vị",
    summary:
      "Sinh mọi thứ tự của một tập bằng cách mở rộng tiền tố, thử từng phần tử chưa dùng và hoàn tác.",
  },
  "prefix-sums": {
    title: "Tổng tiền tố",
    summary:
      "Tính trước các tổng cộng dồn một lần, rồi trả lời mọi câu hỏi tổng đoạn bằng một phép trừ.",
  },
  "prims-algorithm": {
    title: "Thuật toán Prim",
    summary: "Mọc một cây từ nút bắt đầu bằng cách luôn thêm cạnh rẻ nhất rời khỏi cây.",
  },
  "priority-queues": {
    title: "Hàng đợi ưu tiên",
    summary: "Một tập hợp luôn trả về phần tử khẩn cấp nhất, và các cách xây dựng nó.",
  },
  queues: {
    title: "Hàng đợi",
    summary: "Vào trước, ra trước: thêm ở cuối, lấy ở đầu, và giữ cả hai đầu đều rẻ.",
  },
  "quick-sort": {
    title: "Sắp xếp nhanh (Quick Sort)",
    summary:
      "Chọn một chốt, chia giá trị nhỏ sang trái và lớn sang phải, rồi sắp từng bên theo cách tương tự.",
  },
  quickselect: {
    title: "Quickselect",
    summary: "Tìm phần tử nhỏ thứ k bằng cách phân hoạch và chỉ đệ quy vào phía chứa nó.",
  },
  recursion: {
    title: "Đệ quy",
    summary: "Một hàm giải bài toán bằng cách tự gọi chính nó trên một phần nhỏ hơn.",
  },
  resizing: {
    title: "Đổi kích thước và băm lại",
    summary: "Giữ hệ số tải thấp bằng cách nhân đôi bảng và chèn lại mọi khóa.",
  },
  "reversing-a-list": {
    title: "Đảo ngược danh sách",
    summary:
      "Lật mọi mũi tên next bằng ba con trỏ, lưu phần còn lại của danh sách trước mỗi thay đổi.",
  },
  "segment-trees": {
    title: "Cây phân đoạn",
    summary:
      "Trả lời truy vấn tổng đoạn và cập nhật điểm trong O(log n) với cây các tổng một phần.",
  },
  sequences: {
    title: "Dãy",
    summary: "Tìm dãy con chung dài nhất của hai chuỗi bằng bảng 2 chiều và truy ngược đáp án.",
  },
  "sets-and-maps": {
    title: "Tập hợp và ánh xạ",
    summary:
      "Bảng băm với giao diện thân thiện: ánh xạ ghép khóa với giá trị, tập hợp chỉ giữ khóa.",
  },
  "shortest-paths": {
    title: "Đường đi ngắn nhất",
    summary:
      "Thuật toán Dijkstra: chốt nút gần nhất, nới lỏng các cạnh của nó, lặp lại, rồi truy ngược lối đi.",
  },
  "simple-sorts": {
    title: "Các cách sắp xếp đơn giản",
    summary: "Sắp xếp nổi bọt, chọn và chèn trên một mảng nhỏ, có đếm chi phí.",
  },
  "sliding-window": {
    title: "Cửa sổ trượt",
    summary: "Giữ một khung trên một phần của mảng và cập nhật từng phần tử một thay vì làm lại.",
  },
  "stability-and-limits": {
    title: "Tính ổn định và giới hạn của sắp xếp",
    summary:
      "Vì sao các khóa bằng nhau giữ nguyên thứ tự lại quan trọng, và vì sao không thuật toán so sánh nào nhanh hơn n log n.",
  },
  stacks: {
    title: "Ngăn xếp",
    summary: "Vào sau, ra trước: cấu trúc đằng sau hoàn tác, ngăn xếp lời gọi và khớp ngoặc.",
  },
  "strongly-connected-components": {
    title: "Thành phần liên thông mạnh",
    summary: "Tách đồ thị có hướng thành các nhóm mà mọi nút đều đến được nhau, dùng hai lượt DFS.",
  },
  subsets: {
    title: "Tập con",
    summary:
      "Liệt kê mọi tập con của một tập bằng cách quyết định bao gồm hay loại cho từng phần tử.",
  },
  tabulation: {
    title: "Quy hoạch động dạng bảng",
    summary: "Điền bảng từ bài toán con nhỏ nhất đi lên, không đệ quy và không ngăn xếp lời gọi.",
  },
  "top-k": {
    title: "Bài toán Top-K",
    summary: "Giữ k phần tử lớn nhất của luồng bằng một min-heap nhỏ thay vì sắp xếp tất cả.",
  },
  "topological-sort": {
    title: "Sắp xếp tô-pô",
    summary:
      "Sắp xếp công việc để mọi phụ thuộc đứng trước, dùng bậc vào và hàng đợi (thuật toán Kahn).",
  },
  "tree-traversals": {
    title: "Duyệt cây",
    summary:
      "Thăm mọi nút của cây nhị phân theo bốn thứ tự kinh điển và xem khi nào mỗi cách có ích.",
  },
  tries: {
    title: "Trie",
    summary:
      "Lưu từ như các đường đi trong cây các chữ cái để câu hỏi về tiền tố được trả lời trong một lượt đi.",
  },
  "two-pointers": {
    title: "Hai con trỏ",
    summary: "Đi hai chỉ số qua mảng để một lượt thay cho vòng lặp lồng nhau.",
  },
  "union-find": {
    title: "Union-Find",
    summary:
      "Theo dõi các phần tử được nhóm cùng nhau bằng một rừng trong mảng, gộp tập trong thời gian gần như hằng số.",
  },
  "when-greedy-fails": {
    title: "Khi tham lam thất bại",
    summary:
      "Lựa chọn tốt nhất cục bộ không phải lúc nào cũng tốt nhất toàn cục: đổi tiền xu cho thấy cách nhận ra cái bẫy.",
  },
};
