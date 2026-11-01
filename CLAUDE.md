# video-ai: kênh Shorts hoạt hình 3D (Remotion + three.js, skill `cartoon-3d-short`)

## Concept kênh
Một nhân vật 3D cố định (tên tạm **Milo**) bị "ném" vào các thời đại lịch sử. Mỗi tập mở bằng một câu hỏi ("What if you spent a week in Ancient Greece?"), trả lời bằng một tình huống thật có nhịp hài và twist cuối. Tiếng Anh, khán giả Mỹ, người lớn (không gắn "made for kids"). Nhân vật, giọng điệu và cách quay luôn giống nhau; chỉ bối cảnh, trang phục, ánh sáng và kịch bản đổi.

## Character bible (Milo)
- Không bao giờ đổi: `build: "adult"`, màu da `SKINS[1]`, seed đầu `MILO_SEED = 3`, **mũ lưỡi trai đỏ** `#e2453c`, vẽ bằng kiểu mũ `hat: "baseball"` (vòm chia múi, nút trên đỉnh, lưỡi trai cong; mũ lệch thời đại là trò đùa chính; chỉ bỏ khi có gag, bằng `milo(era, { hat: null })`), đồng hồ thông minh ở cổ tay trái (`watch`, màn hình `#7fe3ff`).
- Đổi theo tập: `jacket`, `pants`, `boots`, `sash`, `dress`, `buttons` (bảng `ERAS` trong `src/series/eras.ts`).
- Diễn: vụng về, hay hoảng, thỉnh thoảng đắc ý. Ý nghĩa diễn -> biểu cảm vẽ được: `src/series/expressions.ts`.
- Hàm: `milo(era, extra?)` trong `src/series/character.ts`. Luôn truyền `seed: MILO_SEED` cho `bodyFront` / `bodySide`.
- Thiếu biểu cảm (chưa thêm, hỏi trước khi mở rộng toon.ts): hét, ghê tởm, khóc, ngủ, quyết tâm/giận. Danh sách ở `MISSING` trong `expressions.ts`.
- Trang phục trung cổ đã chốt: áo len mộc dài tới gối + thắt lưng da + áo choàng xanh rêu (`hem`, `cloak` trong `Outfit`, chỉ vẽ góc nhìn trước; góc nghiêng chưa có). Phương án thay: áo xám xanh `#5f7388` như kịch bản ep001.
- Quần áo chỉ quyết định theo kịch bản của từng tập (preset trong `eras.ts` chỉ là gợi ý). Phần chốt của Milo là đầu, mũ, đồng hồ, dáng, bảng màu và bộ biểu cảm.
- Dụng cụ cầm tay có sẵn (chỉ góc nhìn trước, truyền qua `prop`): phone, book, scroll, mug, stick, torch, hammer, icecream. Thêm dụng cụ mới ở `src/engine/toon.ts` (cùng kiểu với `bookAt`, `torchAt`).
- Bảng thiết kế gốc: composition `CharacterSheet` -> `out/milo-sheet.png`.
- Thời đại có: ancient_greece, ancient_rome, ancient_egypt, medieval, tudor, victorian. Mỗi thời đại có ghi chú trang phục thật, đừng bịa.

## Quy tắc (từ PROMPT-recurring-character.md)
- Chỉ render ảnh tĩnh (`npx remotion still ... --scale=0.5`) hoặc độ phân giải thường. Không render 2K, không render video đầy đủ khi chưa được yêu cầu.
- Không tự tải gì ngoài gói npm. Đồ vật 3D: chỉ nói gói Kenney (CC0) nào cần, người dùng tự tải.
- Hỏi trước khi xóa thư mục. Giữ nguyên `src/videos/bridge` làm bản tham khảo, không sửa vào đó.
- Nhân vật, câu chuyện, giọng đọc phải là của người dùng. Không chép nhân vật/khung hình từ `references/` của skill, chỉ học phong cách.
- Sau mỗi thay đổi lớn: `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem. Ảnh một màu trơn thì dừng và báo nguyên nhân WebGL.
- Sửa mã gốc của skill (nhất là `toon.ts`) ở mức nhỏ nhất: thêm file mới, thêm trường tùy chọn.
- Giọng đọc: hỏi người dùng, đừng tự chọn (Kokoro + Whisper chạy trên máy).
- Không dùng logo hay thương hiệu thật. Chữ trên hình chỉ cho thẻ nhãn (mốc thời gian, tiêu đề lựa chọn) mà kịch bản của tập đó yêu cầu, ví dụ ep001; không phụ đề lời đọc.

## Đường dẫn quan trọng
- `src/engine/toon.ts`: bản sao `toon.ts` của bridge + trường `watch` (đồng hồ). Phần engine còn lại sẽ copy từ bridge ở bước tách bộ khung.
- `src/series/`: `character.ts`, `eras.ts`, `expressions.ts`, `CharacterSheet.tsx` (composition `CharacterSheet`, ảnh bảng nhân vật: `out/milo-sheet.png`).
- `src/videos/bridge/`: mã mẫu gốc (chỉ đọc). `src/videos/analog/`: short "24 Shots" đã làm trước đó (June, going analog).
- `scripts/stills.mjs <Comp> <out/prefix> <frames> [scale]`: render nhiều ảnh tĩnh sau một lần bundle. `scripts/make_voice.py`, `scripts/align_voice.py`, `audio/make_audio.py`: giọng, căn giọng, nhạc/hiệu ứng.
- Môi trường: Windows + PowerShell, `.venv` có kokoro, faster-whisper, scipy, yt-dlp. Đặt `TEMP`/`TMP` = `C:\remotion-tmp` trước khi render (mỗi bundle chép ~1,3 GB).

## Lưu ý kỹ thuật
- Giữ `three@0.186.1` và `@react-three/postprocessing@3.0.4`, nếu không render ra một màu trơn.
- Khung dọc rất hẹp: máy phải nhắm vào nhân vật; hộp bến xe/tường có thể chắn tầm nhìn.

## Tập 1 (ep001-medieval-trial)
- Kịch bản: `SCRIPT-ep001-medieval-trial-v4.md` (bản mới nhất; có bảng điểm ✗ ✗ ✓, vùng an toàn Shorts: không để chữ ở 20% dưới và 12% phải). Mã: `src/videos/ep001/` (composition `Ep001`, 1080x1920, 30 fps, kịch bản v4: 1672 khung = 55,7 s, 18 đoạn; bản v1 cũ còn ở `out/ep001/ep001-medieval-trial_v1.mp4` và `voice/ep001_v1/`). Chưa chuyển sang cấu trúc `src/episodes/` (Bước 4 của PROMPT-recurring-character.md chưa làm); ep001 dùng lại pipeline của "24 Shots" (ink, lens blur, grade, cardshade) và nhân vật Milo từ `src/series/`.
- Giọng: Kokoro `am_santa`, `voice/ep001/` (`script.txt`, `voice.wav`, `words.json`, `sentences.json`). Tạo lại: xóa `voice.wav` rồi `.venv\Scripts\python.exe scripts\make_voice.py am_santa ep001`. Mốc khung hình trong `story.ts` lấy từ `words.json` x 30; đổi giọng thì phải canh lại.
- Âm thanh: `audio/make_audio_ep001.py` -> `audio/ep001/mix.wav` (nhạc tự tạo, hiệu ứng theo mốc hình).
- Nhân vật phụ (cast.ts): linh mục (hat `tonsure`), thẩm phán (mũ dẹt), kẻ khổng lồ (scale 1,9), lính Norman (hat `helm`, cờ), dân làng. Dụng cụ mới trong `src/engine/toon.ts`: `iron`, `club`, `bound` (cổ tay bị trói).
- Thẻ chữ là lớp phủ DOM trong `Ep001.tsx` (nhãn OPTION, ACCUSED, KNOWING HOW TO READ, Pick 1, 2 or 3?).
- Gallows chỉ hiện ở shot 7 và không có người; không có cảnh thương tích.
