# Cài đặt môi trường làm short hoạt hình 3D (cartoon-3d-short)

> Cách dùng: mở VS Code trong một thư mục trống (ví dụ `shorts`), mở terminal, chạy `claude`, rồi dán toàn bộ nội dung từ dòng "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT" vào.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, terminal là PowerShell. Skill `cartoon-3d-short` đã được clone sẵn ở `$HOME\.claude\skills\cartoon-3d-short` (từ repo mromidev/claude-animated-shorts). Thư mục hiện tại là thư mục dự án của mình. Hãy giúp mình dựng môi trường và kiểm tra đồ họa 3D chạy được. **Chưa làm video thật.** Làm lần lượt các bước sau, báo ngắn gọn sau mỗi bước, và dừng lại hỏi mình khi có điều cần mình quyết định.

### Bước 1. Kiểm tra công cụ
Chạy `node -v`, `git --version`, `python --version`, `ffmpeg -version`. Báo cho mình biết cái nào thiếu. Đừng tự cài thêm phần mềm ngoài danh sách này mà không hỏi.

### Bước 2. Đọc skill
Đọc `$HOME\.claude\skills\cartoon-3d-short\SKILL.md` và `README.md`. Tóm tắt cho mình trong 5 dòng: skill làm gì, cần những thứ gì ngoài mã nguồn.

### Bước 3. Tạo dự án Remotion
Nếu thư mục hiện tại chưa có dự án Remotion, tạo một dự án trống (Blank, TypeScript) ngay tại đây bằng `create-video`. Nếu lệnh bắt chọn tương tác thì hỏi mình chọn gì.

### Bước 4. Cài thư viện 3D
Chạy:
```
npm install @remotion/three three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing --legacy-peer-deps
```
Sau đó kiểm tra `npm ls react`. Cần **React 19**; nếu đang là bản khác thì chạy `npm install react@19 react-dom@19 --legacy-peer-deps`. (Triệu chứng của lỗi phiên bản React: `export 'use' was not found in 'react'` khi bundle.) Đảm bảo tất cả gói `remotion` và `@remotion/*` cùng một phiên bản.

### Bước 5. Chép mã mẫu vào dự án
- Chép `templates\bridge` của skill vào `src\videos\bridge`.
- Chép `templates\scripts` vào `scripts`.
- Đăng ký composition `BridgeShort` (component và `BRIDGE_FRAMES` lấy từ `./videos/bridge/Bridge`), kích thước 1080x1920, 30 fps, trong `src\Root.tsx`. Đảm bảo `src\index.ts` gọi `registerRoot`.
- Chạy `npx tsc --noEmit` và sửa lỗi biên dịch, nếu có, chỉ trong phạm vi cần thiết.

### Bước 6. Đồ vật 3D Kenney
- Tạo thư mục `public\bridge\kenney`.
- Đọc mảng `KENNEY` trong `src\videos\bridge\world.ts` và liệt kê cho mình danh sách tên file `.glb` cần có.
- **Đừng tự tải gì.** Chỉ cho mình biết gói miễn phí nào ở kenney.nl chứa các file đó để mình tự tải về. File nào thiếu thì mã chỉ bỏ qua (lỗi 404 trong log là bình thường).

### Bước 7. Thư mục tạm
Mỗi lần bundle Remotion chép khoảng 1,3 GB vào thư mục tạm. Hỏi mình dùng ổ nào còn trống ít nhất vài chục GB, rồi đặt `$env:TEMP` và `$env:TMP` trỏ tới `<ổ>:\remotion-tmp` (tạo thư mục nếu chưa có) trước khi render.

### Bước 8. Render thử một khung hình
```
npx remotion still src/index.ts BridgeShort out/test.png --frame=400 --scale=0.5
```
Mở ảnh `out/test.png` và nói cho mình biết nó có cảnh 3D thật hay chỉ là một màu trơn.
- Nếu là một màu trơn: xem log trình duyệt, thử `--gl=angle` rồi `--gl=swangle`, kiểm tra lỗi WebGL, và báo mình nguyên nhân.
- Nếu ra cảnh thật: thử thêm frame 100 và frame 900, rồi báo mình.

### Quy tắc
- Chỉ render khung hình thử hoặc độ phân giải thường (1080x1920). **Không render 2K** (`--scale 1.3333`) khi mình chưa yêu cầu.
- Hỏi mình trước khi xóa bất kỳ thư mục nào (đặc biệt `remotion-webpack-bundle-*`).
- Câu chuyện, nhân vật và giọng đọc phải là của mình. Không sao chép nội dung hay nhân vật từ khung hình tham chiếu trong `references/`, chỉ dùng để học phong cách. Không đăng hay gửi các khung hình đó đi đâu.

Khi xong bước 8, tóm tắt: những gì đã chạy, những gì còn thiếu, và việc mình cần làm tiếp.

## KẾT THÚC PROMPT

---

## Sau khi bước 8 ra ảnh 3D thật

Quay lại cuộc trò chuyện với mình, gửi ảnh `out/test.png` (hoặc thông báo lỗi nếu vẫn trống). Mình sẽ gửi tiếp kịch bản tiếng Anh khoảng 60 giây, bảng cảnh và prompt làm video thật. Phần đó cần thêm:
- `voice.wav` (giọng đọc, ví dụ Kokoro `am_michael`) và `words.json` (thời gian từng từ, tạo bằng Whisper hoặc công cụ tương tự).
- Viết lại `story.ts`, `build.ts`, `cast.ts` cho câu chuyện mới, vì bản mẫu gắn cứng với câu chuyện cây cầu.
