# Prompt: dựng thử MỘT cảnh bắn cung (mũi tên vs tấm giáp) bằng Remotion + three.js

> Mục tiêu: kiểm tra xem bộ dựng của bạn có làm được kiểu cảnh "tình huống vật lý" (mũi tên bay chậm, va vào giáp, tia lửa) hay không, trước khi viết kịch bản cho kiểu này.
> Cách dùng: mở VS Code trong thư mục dự án Remotion, mở terminal, chạy `claude`, dán toàn bộ từ "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT".
> Cảnh thử **không có máu, không có người bị trúng**: mục tiêu là tấm giáp gắn trên giá. Nếu muốn thử cảnh súng sau này, dùng cùng cách làm, thay mũi tên bằng viên đạn.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, PowerShell. Dự án Remotion này đã có skill `cartoon-3d-short` (three.js + @remotion/three). Mình muốn thử xem có dựng được một cảnh "tình huống vật lý" ngắn cho kênh YouTube Shorts lịch sử: **một cung thủ bắn một mũi tên vào tấm giáp thép gắn trên giá**, quay chậm, có tia lửa khi va chạm. Đây chỉ là **cảnh thử**, chưa làm video thật.

Làm lần lượt từng bước, báo ngắn gọn sau mỗi bước, dừng hỏi mình ở điểm đánh dấu **[HỎI MÌNH]**.

### Quy tắc chung
- Chỉ render **ảnh tĩnh** (`npx remotion still ... --scale=0.5`). **Không render video, không render 2K.**
- Đừng tải gì ngoài gói npm. Nếu cần model 3D, **không tự tải**: chỉ cho mình biết cần gì, mình tự tải. Cảnh thử này dùng hình khối đơn giản do code tự dựng, **không cần model ngoài**.
- Hỏi mình trước khi xóa thư mục. **Không sửa tập cũ, không sửa engine dùng chung**; chỉ thêm file mới trong `src\tests\arrow\`.
- Không sao chép khung hình hay nhân vật từ `references\` của skill. Chỉ học phong cách (nét viền, đổ bóng, camera).
- Nội dung phải không có máu, không có người hay con vật bị trúng đòn. Mục tiêu duy nhất là tấm giáp trên giá.
- Sau thay đổi lớn: `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem bằng mắt. Nếu ảnh ra màu trơn, dừng và báo nguyên nhân WebGL.

### Bước 1. Đọc trước khi làm
Đọc `SKILL.md`, `Root.tsx`, cách một cảnh three.js được dựng trong `src\videos\bridge` (hoặc `src\engine` nếu có), `lights.ts`, và cách vẽ viền toon (`toon.ts`, `ink.ts`, hoặc tương đương). Tóm tắt trong tối đa 8 dòng:
- Cảnh 3D được dựng bằng gì, camera/ánh sáng ở đâu.
- Có dùng lại được viền toon và đổ bóng có sẵn cho vật thể hình khối đơn giản không, hay phải dùng `MeshToonMaterial` + viền kiểu "vỏ đảo ngược" (inverted hull).
- Có thư viện vật lý nào đã cài chưa.

### Bước 2. Nguyên tắc kỹ thuật (quan trọng)
Remotion render **từng khung độc lập**, nên mọi chuyển động phải là **hàm thuần của số khung** (deterministic). **Không dùng** vật lý chạy theo thời gian thực (Rapier/cannon-es step theo đồng hồ) trừ khi bạn đảm bảo kết quả giống nhau mọi lần render. Với cảnh này làm đơn giản:
- Quỹ đạo mũi tên: công thức parabol theo thời gian `t = f(frame)` (vị trí = đầu + vận tốc·t + trọng lực).
- Quay chậm: **remap thời gian** (ví dụ chỉ số khung của chuyển động = khung gốc × 0,25 trong đoạn va chạm).
- Tia lửa và bụi: hạt sinh theo **seed cố định**, vị trí tính từ `(frame - impactFrame)`.
- Rung camera khi va chạm: 7 khung, như quy tắc camera của skill; không rung tay giả.

### Bước 3. Dựng vật thể bằng hình khối (trong `src\tests\arrow\`)
Tất cả do code tự dựng, màu phẳng + viền toon:
- **Cung**: một cung tròn mảnh (`TubeGeometry` hoặc `TorusGeometry` cắt một phần) + dây cung (đường thẳng); khi kéo thì hai đầu cung cong thêm một chút (không cần chính xác).
- **Mũi tên**: thân trụ dài, đầu hình nón, ba cánh lông nhỏ. Có một vệt mờ phía sau khi bay.
- **Tấm giáp trên giá**: một tấm thép bo tròn (hộp bo góc hoặc capsule dẹt) gắn trên giá gỗ (hai trụ + thanh ngang). Vật liệu kim loại giả bằng toon (một mảng sáng + viền).
- **Cung thủ**: dùng thẻ nhân vật có sẵn của skill (góc nghiêng), đứng cách giá khoảng 12–15 đơn vị. **Không dùng nhân vật của kênh khác.** Nhân vật chỉ cần tư thế kéo cung; nếu chưa có tư thế này, đặt nhân vật đứng yên và nói cho mình biết thiếu gì.
- **Nền**: mặt đất cỏ, vài khối đá, bầu trời gradient.

### Bước 4. Hoạt cảnh (180 khung, 30 fps, 1080x1920)
Composition `ArrowTest` với 4 shot:
1. **Khung 0–45**: cảnh rộng. Cung thủ bên trái, giá giáp bên phải. Cung thủ giương cung (kéo dây). Camera đẩy chậm.
2. **Khung 45–90**: camera theo mũi tên bay (quay chậm × 0,5). Vệt mờ phía sau.
3. **Khung 90–135**: cận cảnh va chạm. Quay chậm × 0,25. Tham số `outcome`:
   - `"glance"`: mũi tên trượt khỏi tấm giáp, bay lệch lên và để lại vết xước.
   - `"stick"`: mũi tên cắm lệch vào tấm giáp.
   - `"stop"`: mũi tên gãy hoặc bật ngược lại.
   Mặc định `"glance"`. **Đây chỉ là các biến thể hình ảnh để thử; không khẳng định điều gì đúng về lịch sử.**
   Tia lửa nhỏ (10–20 hạt, seed cố định) + một cú rung 7 khung + một đốm sáng ngắn.
4. **Khung 135–180**: giữ hình quay chậm, camera đẩy nhẹ vào vết trên giáp.
Có thể điều chỉnh số khung nếu cần, nhưng giữ 4 shot.

### Bước 5. Render ảnh tĩnh
Render 5 ảnh `--scale=0.5`:
```
npx remotion still src/index.ts ArrowTest out/arrow-f000.png --frame=0 --scale=0.5
npx remotion still src/index.ts ArrowTest out/arrow-f060.png --frame=60 --scale=0.5
npx remotion still src/index.ts ArrowTest out/arrow-f110.png --frame=110 --scale=0.5
npx remotion still src/index.ts ArrowTest out/arrow-f125.png --frame=125 --scale=0.5
npx remotion still src/index.ts ArrowTest out/arrow-f160.png --frame=160 --scale=0.5
```
Đo thời gian render từng ảnh. **[HỎI MÌNH]** Gửi mình 5 ảnh + thời gian. Mình duyệt trước khi làm tiếp.

### Bước 6. Báo cáo ngắn (cuối cùng)
- Cảnh nhìn có thuyết phục không (tự đánh giá thẳng thắn).
- Thiếu gì: tư thế nhân vật, model, hiệu ứng (liệt kê, đừng tự thêm lớn).
- Thời gian render ảnh tĩnh đo được, và ước tính thời gian render cả video 6 giây ở độ phân giải thường.
- Với kiểu cảnh này, mỗi tập tốn bao nhiêu công dựng so với kiểu thẻ nhân vật cũ.

## KẾT THÚC PROMPT

---

## Sau khi chạy xong

1. Gửi mình 5 ảnh và báo cáo cuối.
2. Nếu cảnh nhìn ổn, mình viết kịch bản tập đầu kiểu "Could…?" (ví dụ giáp và mũi tên); **trước khi viết, mình sẽ đọc nguồn về giáp và mũi tên**, vì mình chưa kiểm chứng dữ kiện này.
3. Nếu cảnh nhìn kém hoặc quá tốn công, giữ kiểu "tình huống ở tầm con người" (đình công Ai Cập, đấu giá ngôi hoàng đế) dùng thẻ nhân vật.
