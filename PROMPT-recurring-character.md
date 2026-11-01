# Prompt: dựng nhân vật xuyên suốt kênh (Milo) trên nền skill cartoon-3d-short

> Dùng sau khi `SETUP-3D-SHORT.md` đã chạy xong và bước 8 ra ảnh 3D thật.
> Cách dùng: mở VS Code trong thư mục dự án Remotion đã cài (ví dụ `shorts`), mở terminal, chạy `claude`, rồi dán toàn bộ nội dung từ "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT".
> "Milo" chỉ là tên tạm. Bạn đổi tên, màu mũ, màu da trước khi dán nếu muốn.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, PowerShell. Dự án Remotion này đã cài skill `cartoon-3d-short` (mã mẫu `bridge` nằm ở `src\videos\bridge`, skill gốc ở `$HOME\.claude\skills\cartoon-3d-short`). Mình đang làm kênh YouTube Shorts tiếng Anh cho khán giả Mỹ với concept sau:

**Một nhân vật 3D cố định (tên tạm: Milo) bị "ném" vào các thời đại lịch sử. Mỗi tập mở bằng một câu hỏi ("What if you spent a week in Ancient Greece?", "Could you survive Tudor England?"), trả lời bằng một tình huống thật có nhịp hài và twist cuối. Nhân vật, giọng điệu và cách quay luôn giống nhau; chỉ bối cảnh, trang phục thời đại, ánh sáng và kịch bản thay đổi.**

Việc của bạn: biến mã mẫu "cây cầu" (gắn cứng một câu chuyện) thành một **bộ khung dùng lại cho nhiều tập**, và dựng nhân vật Milo thật nhất quán. Làm lần lượt từng bước, báo ngắn gọn sau mỗi bước, dừng hỏi mình ở các điểm đánh dấu **[HỎI MÌNH]**. Chưa làm video thật.

### Quy tắc chung
- Chỉ render ảnh tĩnh (`npx remotion still ... --scale=0.5`) hoặc độ phân giải thường. **Không render 2K, không render video đầy đủ** khi mình chưa yêu cầu.
- Đừng tự tải gì ngoài gói npm. Nếu cần đồ vật 3D, chỉ cho mình biết gói miễn phí nào của Kenney (CC0) cần tải, mình tự tải.
- Hỏi mình trước khi xóa bất kỳ thư mục nào. Giữ nguyên `src\videos\bridge` làm bản tham khảo, không sửa vào đó.
- Nhân vật, câu chuyện, giọng đọc phải là của mình. Không sao chép nhân vật hay khung hình từ thư mục `references\` của skill, chỉ học phong cách (nét viền, đổ bóng, camera). Không đăng hay gửi các khung hình đó đi đâu.
- Sau mỗi thay đổi lớn: chạy `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem bằng mắt. Nếu ảnh ra một màu trơn, dừng lại và báo nguyên nhân WebGL.
- Thay đổi mã gốc của skill (đặc biệt `toon.ts`) ở mức nhỏ nhất. Ưu tiên thêm file mới và thêm trường tùy chọn, tránh viết lại hàm vẽ có sẵn.

### Bước 1. Đọc trước khi làm
Đọc `SKILL.md`, rồi `src\videos\bridge\toon.ts` (kiểu `Outfit`, `Expr`, `bodyFront`, `bodySide`, `headBlob`, `Pen`), `cast.ts` (lớp `Actor`, `Pool`, cách mỗi nhân vật được vẽ thành thẻ billboard), `lights.ts`, `story.ts`, `world.ts`. Tóm tắt cho mình trong tối đa 10 dòng:
- Một nhân vật được vẽ bằng gì, có những mũ/phụ kiện nào, các biểu cảm nào dùng được.
- Phần nào của mã đang gắn cứng vào câu chuyện cây cầu, phần nào dùng lại được cho mọi tập.
- Các kiểu `hat` đang hỗ trợ là gì (shako, shako_tall, cap, hair, bonnet, tophat, ...).

### Bước 2. Thiết kế Milo (character bible)
Tạo `src\series\character.ts` và file `CLAUDE.md` ở thư mục gốc dự án (để các phiên sau không quên). Milo phải nhận ra ngay cả khi trang phục đổi hoàn toàn, nên **một số thứ không bao giờ đổi**:

Cố định (không đổi giữa các tập):
- `build: "adult"` (không dùng `kid`, vì kênh nhắm khán giả người lớn, tránh bị gắn "made for kids").
- Một `head` seed cố định và một màu da cố định (gợi ý `SKINS[1]`, đổi nếu mình muốn).
- Tóc hoặc mũ đặc trưng: **mũ lưỡi trai đỏ hiện đại** (`hat: "cap"`, `cap: "#e2453c"` hoặc màu mình chọn). Chiếc mũ này đội ở mọi thời đại và là trò đùa lệch thời đại. Nó cũng là điểm nhận diện cho thumbnail và avatar kênh. Đôi khi tập có gag làm mất mũ, nhưng mặc định luôn đội.
- Nếu `toon.ts` làm được ít rủi ro, thêm trường tùy chọn `watch?: string` (đồng hồ thông minh trên cổ tay trái) hoặc `scarf?: string`. Nếu cần sửa hàm vẽ lớn thì bỏ qua và báo mình.
- Tính cách khi diễn: vụng về, hay hoảng, thỉnh thoảng đắc ý. Chuyển động bằng các `Expr` có sẵn.

Thay đổi theo tập:
- `jacket`, `pants`, `boots`, `belt`, `sash`, `dress` (dùng cho tóga, váy dài nếu phù hợp).
- Hàm `milo(era: Era, extra?: Partial<Outfit>): Outfit` trả về trang phục Milo cho từng thời đại, luôn giữ phần cố định ở trên.

Tạo bảng `ERAS` với ít nhất 6 thời đại: `ancient_greece`, `ancient_rome`, `ancient_egypt`, `medieval`, `tudor`, `victorian`. Mỗi thời đại có: bảng màu quần áo, kiểu phụ kiện gần nhất mà `Outfit` hỗ trợ, và một dòng ghi chú trang phục lịch sử thật để khi viết kịch bản không bịa.

Thêm file `src\series\expressions.ts`: ánh xạ ý nghĩa diễn xuất sang `Expr` có sẵn, ví dụ:
- hoang mang → `nervous`, bị sốc → `shock`, đắc ý → `grin`, bật cười → `laugh`, nhẹ nhõm → `relief`, choáng → `dazed`, đau → `pained`, bình thản giả vờ → `smile_closed`.
Nếu thiếu biểu cảm cần cho một gag, liệt kê cho mình, đừng tự thêm lớn.

### Bước 3. Bảng nhân vật (contact sheet)
Tạo composition `CharacterSheet` (ảnh tĩnh): Milo trong 6 trang phục, cạnh nhau, góc trước và góc nghiêng, kèm 6 biểu cảm chính. Render:
```
npx remotion still src/index.ts CharacterSheet out/milo-sheet.png --scale=0.5
```
Mở ảnh xem. **[HỎI MÌNH]** Gửi mình ảnh này. Mình duyệt hoặc chỉnh màu, đồ, mũ **trước khi** làm bước tiếp. Không đi tiếp khi mình chưa duyệt.

### Bước 4. Tách bộ khung (kiến trúc nhiều tập)
Sắp xếp lại để mỗi tập là một thư mục nhỏ, phần chung dùng lại:
```
src\
  engine\            <- phần chung: toon.ts, cast.ts, ink.ts, lensblur.ts, grade.ts, shade.ts, cardshade.ts, lights.ts (copy từ bridge, sửa tối thiểu)
  series\            <- character.ts, expressions.ts, eras.ts
  sets\              <- bộ dựng cảnh theo kiểu (xem bước 5)
  episodes\
    ep000-test\      <- tập thử: story.ts, set.ts, script.md, (sau này voice.wav, words.json)
    _template\       <- tập mẫu để copy cho tập mới
  Root.tsx           <- đăng ký mỗi tập thành một Composition (id "Ep000", "Ep001", ...), 1080x1920, 30 fps
```
Nguyên tắc: một tập mới chỉ được **thêm thư mục** trong `episodes\` và **thêm một dòng** trong `Root.tsx`. Nếu muốn làm một tập mà phải sửa engine, hãy báo mình trước.

Các thứ phải khái quát hóa:
- `lights.ts`: thêm các preset `torch` (đuốc, cam ấm, tối) và `dusk` (hoàng hôn xanh tím), `interior` (trong nhà, tối ấm), bên cạnh `day` và `golden`. Mỗi preset giữ đủ trường như preset có sẵn.
- `story.ts`: tách phần "khung quay" (danh sách shot với `a`, `b`, `light`, đường chuyển camera, crossfade) khỏi phần vật lý riêng của cây cầu. Mỗi tập tự khai báo shot của mình.
- Camera: giữ đúng ngữ pháp trong skill (đẩy máy chậm liên tục, cắt khi đổi cảnh, va chạm bằng rung 7 khung, không rung tay giả).

### Bước 5. Bộ dựng cảnh theo thời đại
Cây cầu có `world.ts` dựng riêng. Làm một `sets\buildSet(config)` đơn giản, tham số hóa được, dùng được cho nhiều thời đại:
- Tham số: bảng màu nền và tường, loại mặt đất (đá lát, đất, cỏ), danh sách đồ vật Kenney đặt ở đâu, vài khối nhà dựng bằng hộp (box) có màu và ngưỡng cửa, mật độ người đi đường (đám đông nền dùng lại nhân vật `townsfolk` đổi màu áo).
- Bắt đầu với **một** bộ cảnh chung (quảng trường/chợ) có thể đổi diện mạo chỉ bằng config: Hy Lạp (tường trắng, mái ngói cam), La Mã (đá, cột), Trung cổ (gỗ, đá xám), Tudor (khung gỗ đen trắng), Victoria (gạch, đèn đường).
- Liệt kê giúp mình các file `.glb` Kenney cần, gói nào chứa chúng, để mình tự tải. File nào thiếu thì cảnh vẫn chạy bằng hộp màu.
- Không cố làm đẹp tuyệt đối. Mục tiêu: nhìn vào là biết đang ở thời đại nào và Milo nổi bật nhất khung hình.

### Bước 6. Tập thử `ep000-test` (chỉ ảnh tĩnh)
Dùng hook "What if you spent one week in Ancient Rome?". Viết `episodes\ep000-test\script.md` (khoảng 110 từ, tiếng Anh, ~35 giây), cấu trúc cố định mọi tập:
1. 0–2 s: câu hỏi hook, không giới thiệu.
2. 2–28 s: 3 tình huống nhanh, mỗi tình huống một gag và một sự thật lịch sử có thật (ghi nguồn một dòng cho mỗi sự thật trong `script.md`).
3. 28–35 s: twist cuối, quay lại gần y câu hook để người xem xem lại.

Dựng `story.ts` với 5–6 shot (chưa cần giọng đọc, dùng thời lượng giả định). Render 4 ảnh tĩnh ở các khung chính, gửi mình xem. **[HỎI MÌNH]** Mình duyệt hình thức trước khi dựng tiếp.

### Bước 7. Công thức tập mới
Viết `EPISODE_RECIPE.md` ngắn, để lần sau mình chỉ cần nói "Tạo tập mới: thời đại X, hook Y, kịch bản Z" thì Claude Code làm đúng quy trình:
1. Copy `episodes\_template` thành `epNNN-slug`.
2. Điền `script.md` (có nguồn cho sự thật).
3. Tạo `voice.wav` và `words.json` (mình chạy Kokoro và Whisper trên máy; hỏi mình về giọng, đừng tự chọn).
4. Điền `story.ts`, `set.ts`.
5. Thêm một dòng vào `Root.tsx`.
6. Render 3–4 ảnh tĩnh, gửi mình duyệt.
7. Chỉ khi mình bảo mới render video.

Ghi vào `CLAUDE.md`: character bible, danh sách quy tắc ở đầu prompt này, và đường dẫn các file quan trọng.

### Kết thúc
Tóm tắt: những gì đã làm, những gì còn thiếu (gói Kenney nào mình cần tải, biểu cảm nào còn thiếu), thời gian render ảnh tĩnh đo được, và việc mình cần làm tiếp.

## KẾT THÚC PROMPT

---

## Sau khi chạy xong

- Gửi mình ảnh `out/milo-sheet.png` và các ảnh tĩnh của `ep000-test` để mình xem và chỉnh hướng.
- Mình sẽ viết bộ 20 đề tài cho tháng đầu (hook, 3 tình huống, twist, sự thật kiểm chứng) theo đúng cấu trúc ở Bước 6.
- Nếu bạn dùng giọng Kokoro `am_michael` cho kênh này, lưu ý đó cũng là giọng của kênh Ai Cập của bạn. Nên cân nhắc giọng khác cho kênh mới để hai kênh không giống nhau.
