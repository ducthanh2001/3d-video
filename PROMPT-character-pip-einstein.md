# Prompt: dựng nhân vật mới (Pip + Einstein hoạt hình + Giám khảo) cho tập "Einstein Failed Math? Real or Myth?"

> Dùng cùng `SCRIPT-einstein-failed-math-real-or-myth.md`.
> Cách dùng: mở VS Code trong thư mục dự án Remotion đang dùng (cùng dự án có skill `cartoon-3d-short`), mở terminal, chạy `claude`, dán toàn bộ từ "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT".
> "Pip" là tên tạm. Đổi tên, màu mũ, màu khăn trước khi dán nếu muốn.

---

## Quyết định thiết kế (đọc trước, 1 phút)

- **Phong cách:** 2D phẳng, đầu tròn, viền dày, bảng màu ít. Làm bằng **SVG/React trong Remotion** (không cần WebGL), nên sandbox hay máy nào cũng render ảnh tĩnh được và nhanh hơn thẻ billboard 3D. Dùng lại phần chung của dự án: dựng timeline, `words.json`, camera đẩy chậm, âm thanh.
- **Không sao chép kênh khác.** Không tải khung hình, không bắt chước thiết kế nhân vật của video tham khảo. Chỉ giữ ý chung "đầu tròn, phẳng". Màu, tỉ lệ, mắt, phụ kiện là của riêng bạn.
- **Einstein là tranh biếm họa tự vẽ** (tóc bạc rối, ria dày, áo len nhàn). Không dùng ảnh thật, không bắt chước một bức ảnh cụ thể. Quyền dùng tên/hình ảnh Einstein cho nội dung thương mại **chưa kiểm chứng**, bạn tự kiểm tra trước khi đăng.
- **Tránh "made for kids":** Pip là người lớn trẻ (đầu tròn nhưng thân có tỉ lệ người lớn). Các bản Einstein 12 và 16 tuổi chỉ là nhân vật lịch sử trong nội dung giáo dục dành cho mọi lứa tuổi; khi đăng, chọn "Không dành cho trẻ em" trong YouTube Studio.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, PowerShell. Dự án Remotion này đã có skill `cartoon-3d-short` và có thể đã có bộ khung nhiều tập (`src\engine`, `src\series`, `src\episodes`, `Root.tsx`, `EPISODE_RECIPE.md`, `CLAUDE.md`). Mình đang làm kênh YouTube Shorts tiếng Anh cho khán giả Mỹ. Mình **không dùng nhân vật Milo nữa**. Concept mới: **"Real or Myth?"**: một nhân vật dẫn (tên tạm: Pip) đi kiểm chứng một "sự thật" nổi tiếng bằng 3 manh mối và một đồng hồ MYTH-O-METER, rồi đóng dấu REAL hoặc MYTH.

Tập đầu: **"Einstein Failed Math? Real or Myth?"** (kịch bản ở `SCRIPT-einstein-failed-math-real-or-myth.md`, mình sẽ đặt file vào thư mục dự án nếu bạn cần đọc).

Việc của bạn: dựng **bộ nhân vật 2D phẳng đầu tròn** và các component dùng lại nhiều tập. Làm lần lượt từng bước, báo ngắn gọn sau mỗi bước, dừng hỏi mình ở các điểm đánh dấu **[HỎI MÌNH]**. Chưa làm video thật.

### Quy tắc chung
- Chỉ render ảnh tĩnh (`npx remotion still ... --scale=0.5`). **Không render video, không render 2K** khi mình chưa yêu cầu.
- Đừng tải gì ngoài gói npm. Không tải ảnh/font từ web. Nếu cần font, dùng font hệ thống hoặc gói npm `@remotion/google-fonts` và báo mình biết tên font.
- Hỏi mình trước khi xóa bất kỳ thư mục nào. **Không sửa tập cũ** (Milo, bridge) và không sửa engine dùng chung nếu không cần; ưu tiên thêm file mới.
- Không sao chép nhân vật hay khung hình từ thư mục `references\` của skill hoặc từ bất kỳ video nào. Mọi thiết kế là của mình.
- Sau mỗi thay đổi lớn: chạy `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem bằng mắt.
- Mọi nhân vật dùng cùng một bộ tham số để dễ chỉnh sau (xem bước 2).

### Bước 1. Đọc trước khi làm
Đọc `CLAUDE.md` (nếu có), `SKILL.md`, `Root.tsx`, `EPISODE_RECIPE.md`, và cấu trúc `src\`. Tóm tắt cho mình trong tối đa 8 dòng:
- Dự án đã có bộ khung nhiều tập chưa, `Root.tsx` đăng ký thế nào.
- Phần nào dùng lại được cho kiểu 2D (đọc `words.json`, timeline, camera, audio).
- Quyết định của bạn: làm nhân vật bằng **SVG/React 2D** (khuyên dùng, không cần WebGL) hay thẻ billboard 3D. Nếu chọn khác SVG, giải thích vì sao.
Thư mục mới: `src\flat\` (style, characters, props, components) và `src\episodes\ep005-einstein-failed-math\`. Nếu dự án chưa có `src\episodes`, tạo cấu trúc tối thiểu và báo mình.

### Bước 2. Hệ thống phong cách (`src\flat\style.ts`)
Tạo hằng số dùng chung:
- Viền: màu `#1b1b2f`, độ dày 8 px (ở 1080 px), đầu nét tròn.
- Bảng màu (đổi được ở một chỗ): da `#f2c9a0`, nền ấm `#fff4e0`, xanh Pip `#1fa6a0`, cam khăn `#f28c28`, đỏ dấu F `#e03b3b`, xanh MYTH `#2a9d5c`, vàng nhấn `#ffd23f`, đá xám phòng thi `#8a8f99`.
- Tỉ lệ: **đầu tròn** đường kính bằng ~40% chiều cao nhân vật, không có cổ, thân hình quả trứng bo tròn, tay chân ống tròn đầu bo, không ngón tay chi tiết (bàn tay hình quả bóng nhỏ có ngón cái).
- Mắt: hai bầu dục trắng lớn có đồng tử đen; lông mày là một nét đậm, có thể xoay để biểu cảm.
- Chuyển động: spring (`spring()` của Remotion) cho nhún nhảy, không rung tay giả.
Xuất ra một component `<FlatCharacter spec pose expression mouth />` làm nền cho mọi nhân vật.

### Bước 3. Nhân vật (`src\flat\characters\`)
Mỗi nhân vật là một file, nhận `expression`, `pose`, `mouthOpen` (0–1, để mình nối với `words.json`).

**3a. Pip (nhân vật dẫn, cố định mọi tập)**
- Người lớn trẻ (không giống trẻ con): thân tỉ lệ người lớn, đầu tròn.
- Mũ len màu xanh ngọc có bông vàng, khăn cam, vài chấm tàn nhang, mắt to tò mò, áo khoác xanh đậm.
- Dụng cụ cầm tay: sổ ghi chép và kính lúp (đổi được theo pose).
- Tính cách: tò mò, hơi nhút nhát, nhìn khán giả khi cần.
- Poses: `idle`, `point`, `hold_paper`, `magnifier`, `shrug`, `one_finger` (giơ một ngón), `scratch_head`.

**3b. Einstein hoạt hình (một hàm `einstein(age: 12 | 14 | 16 | 26 | "old")`)**
- `12` và `14`: tóc nâu gợn sóng, ngắn; áo sơ mi cổ tròn, quần ngắn; bé hơn, mặt non; ngồi bàn với sách đại số/bảng phấn.
- `16`: tóc nâu gợn sóng dài hơn một chút, áo khoác học sinh, mặt căng thẳng, mồ hôi.
- `26`: tóc nâu rối nhẹ, **ria nhỏ**, vest và cà vạt, ngồi bàn ở văn phòng sáng chế.
- `"old"`: tóc **trắng bạc rối bù** như mây, **ria dày xám trắng**, mắt hiền hơi sụp mí, áo len nhàn màu nâu. Biểu cảm chính: mỉm cười, liếc camera, gật đầu. **Không** vẽ pose lè lưỡi (tránh bắt chước bức ảnh nổi tiếng).
- Nhận ra được từ xa nhờ hình tóc, không dựa vào bắt chước ảnh thật.

**3c. Giám khảo ETH**
- Cao hơn, đầu tròn nhưng cằm vuông, kính kẹp mũi, áo choàng đen, tóc rẽ ngôi, cầm con dấu to.
- Biểu cảm: nghiêm nghị, đóng dấu. Pose: `hold_stamp`, `stamp_down`.

**Biểu cảm** (map trong `src\flat\expressions.ts`): `neutral`, `curious`, `shock`, `smirk`, `proud`, `sweat`, `deadpan`, `laugh`. Miệng mở theo `mouthOpen` để mình nối với `words.json` (đơn giản: mở/đóng theo khoảng thời gian từ).

### Bước 4. Props (`src\flat\props\`)
SVG/React, cùng bảng màu:
- `ExamPaper`: tờ bài thi khổ dọc có dòng kẻ, có khe để đóng dấu F; chế độ `table` hiển thị bảng "GENERAL (non-science)", "MATH", "PHYSICS" (mỗi hàng có trạng thái đỏ/xanh).
- `Stamp`: con dấu tròn, có biến thể `F`, `FAILED`, `REAL`, `MYTH`; đóng xuống bằng spring + rung 7 khung.
- `BigBook`: cuốn sách đại số khổng lồ; `Chalkboard`: bảng phấn có công thức đơn giản (không cần đúng chính xác).
- `PatentDesk`: bàn làm việc có 4 tờ giấy bay lên và xếp thành chữ "4".
- Cảnh nền phẳng: `RoomWarm` (nền ấm), `ExamHall` (phòng thi đá xám, hàng ghế gỗ), `Office` (văn phòng). Mỗi cảnh chỉ vài hình khối màu và gradient nhẹ.

### Bước 5. Component giao diện (`src\flat\ui\`)
- `MythMeter`: đồng hồ bán nguyệt, trái REAL (đỏ), phải MYTH (xanh); prop `value` 0–1, kim di chuyển bằng spring; đặt ở trên cùng.
- `ClueChip`: chip "CLUE n/3" ở góc trên trái, có hiệu ứng "ding" (chỉ hình, không âm).
- `Captions`: đọc `words.json`, hiển thị **từng cụm 1–3 từ**, in hoa, chữ trắng viền đen dày, tô vàng từ khóa (prop `highlight: string[]`). Vị trí **45–55% chiều cao**, **tránh 20% đáy và 12% bên phải**.
- `BigLine`: dòng chữ lớn giữa màn hình, ≤ 5 từ.
- `SubscribeButton`: nút giữa khung (không đặt ở đáy hoặc cạnh phải), có hiệu ứng nhấn, dùng lại nếu dự án đã có.
Ghi lại vùng an toàn (safe area) thành hằng số trong `style.ts`.

### Bước 6. Bảng nhân vật `CharacterSheet`
Tạo composition `FlatCharacterSheet` (ảnh tĩnh 1080x1920): Pip (4 pose), Einstein 12/14, 16, 26, old, Giám khảo, và 6 biểu cảm chính. Render:
```
npx remotion still src/index.ts FlatCharacterSheet out/flat-sheet.png --scale=0.5
```
Mở ảnh xem. **[HỎI MÌNH]** Gửi mình ảnh này. Mình duyệt hoặc chỉnh màu, tỉ lệ, tóc, ria **trước khi** làm bước tiếp. Không đi tiếp khi mình chưa duyệt.

### Bước 7. Cảnh thử (chỉ ảnh tĩnh)
Tạo composition `EinsteinTest` ghép các cảnh chính của kịch bản (dùng thời lượng giả định, chưa cần giọng đọc):
- Khung 0: tờ bài thi khổng lồ + dấu F + chữ "EINSTEIN FAILED MATH?" + MYTH-O-METER ở 0%.
- Re-hook (≈15 s): Pip giật mình, chữ "HE FAILED?!".
- Phòng thi ETH (≈22 s): giám khảo đóng dấu F lên bài của Einstein 16 tuổi.
- Verdict (≈39 s): dấu MYTH đè lên chữ F, kim 100%, Einstein "old" mỉm cười.
- CTA (≈46 s): nút SUBSCRIBE giữa khung.
Render 5 ảnh tĩnh `--scale=0.5`, gửi mình xem. **[HỎI MÌNH]** Mình duyệt trước khi dựng tập thật.

### Bước 8. Ghi nhớ
Cập nhật `CLAUDE.md`: character bible (Pip, Einstein 5 phiên bản, Giám khảo), bảng màu, vùng an toàn, danh sách quy tắc ở đầu prompt, đường dẫn các file chính. Thêm vào `EPISODE_RECIPE.md` mục "Tập Real or Myth": copy `_template`, điền `script.md` (có nguồn), `voice.wav` + `words.json` (hỏi mình về giọng, **không dùng am_michael** vì đã dùng cho kênh khác), dựng timeline, thêm một dòng vào `Root.tsx`, render 3–5 ảnh tĩnh.

### Kết thúc
Tóm tắt: những gì đã làm, những gì còn thiếu, thời gian render ảnh tĩnh đo được, việc mình cần làm tiếp (voice, words.json, nhạc/SFX).

## KẾT THÚC PROMPT

---

## Sau khi chạy xong

1. Gửi mình `out/flat-sheet.png` và 5 ảnh của `EinsteinTest` để chỉnh hướng.
2. Khi bạn đã có `voice.wav` + `words.json`, dán prompt dựng tập ở mục 6 của file kịch bản.
3. Mỗi tập "Real or Myth?" sau này chỉ cần: kịch bản (3 manh mối), đổi nhân vật phụ (ví dụ Cleopatra), dùng lại Pip, MYTH-O-METER, dấu, phụ đề.
4. **Lưu ý chính sách:** nếu mọi tập dùng cùng một khuôn và chỉ thay chữ, YouTube có thể coi là nội dung hàng loạt (không kiếm tiền được). Giữ mỗi tập có **sự thật mới, bố cục câu chuyện khác nhau và phần hình ảnh mới** (nhân vật, bối cảnh, gag riêng).
