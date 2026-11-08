# Prompt: dựng thử nhân vật hình que + một cảnh 6 giây "bước đi – vấp – đứng dậy – đi tiếp" bằng Remotion

> Mục tiêu: kiểm tra xem bộ dựng của bạn có tạo được chuyển động **mượt, đúng vật lý** cho nhân vật hình que (bước chân không trượt, vấp ngã tự nhiên, camera theo nhân vật), với ánh sáng điện ảnh kiểu nền tối. Đây là cảnh thử cho kênh mới, chưa phải video thật.
> Cách dùng: mở VS Code trong thư mục dự án Remotion, mở terminal, chạy `claude`, dán toàn bộ từ "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT".
> Ẩn dụ của cảnh (tự nghĩ, không sao chép kênh nào): *"Bạn chỉ cần nhìn thấy bước kế tiếp."* Nhân vật đi trong bóng tối, mỗi bước chân làm sáng ô gạch phía trước; vấp một lần, giữ thăng bằng, đi tiếp, và bước cuối cùng mở ra một cánh cửa sáng.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, PowerShell. Dự án Remotion này đã có style 2D phẳng trong `src\flat\` (rig xương dùng chung, IK 2 xương, foot_lock, events.ts, motion, particles seed cố định). Mình muốn thử một nhân vật **hình que** mới và một cảnh ngắn 6 giây để kiểm tra chuyển động. Đây chỉ là **cảnh thử**.

Làm lần lượt từng bước, báo ngắn gọn sau mỗi bước, dừng hỏi mình ở điểm đánh dấu **[HỎI MÌNH]**.

### Quy tắc chung
- Bước đầu chỉ render **ảnh tĩnh** (`npx remotion still ... --scale=0.5`). Chỉ render video ở Bước 7 sau khi mình duyệt ảnh.
- Không tải gì ngoài gói npm. Hỏi mình trước khi xóa thư mục. **Không sửa các tập cũ và engine dùng chung**; chỉ thêm file mới trong `src\tests\stick\`. Nếu cần tái sử dụng rig từ `src\flat\`, import chứ không sửa.
- Không dùng nhân vật, cảnh hay chữ của bất kỳ kênh nào khác. Nhân vật là thiết kế gốc theo mô tả bên dưới.
- Nội dung không có máu, không có bạo lực.
- Sau thay đổi lớn: `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem bằng mắt.

### Bước 1. Đọc trước khi làm
Đọc `src\flat\` (style, rig, motion, props, ui), `events.ts`, `scenes.ts` và cách particles seed cố định được dùng. Tóm tắt tối đa 8 dòng:
- Rig xương hiện có gồm những khớp nào, IK và foot_lock ở đâu.
- Có thể dùng lại bộ rig này cho nhân vật hình que (chỉ đổi cách vẽ) hay phải viết thêm.
- Cách đo thời gian render ảnh tĩnh.

### Bước 2. Nguyên tắc kỹ thuật (quan trọng)
Remotion render từng khung độc lập, nên mọi chuyển động phải là **hàm thuần của số khung** (deterministic):
- Không dùng vật lý chạy theo đồng hồ. Chu kỳ đi bộ, vấp, lấy thăng bằng đều là công thức theo `frame`.
- Camera mượt bằng cách lấy **trung bình trượt** của vị trí hông, tính trực tiếp từ hàm vị trí theo khung (lấy mẫu các khung `f-11..f`), không tích phân theo trạng thái.
- Hạt bụi: seed cố định (mulberry32, seed 7), vị trí tính từ `frame`.
- Rung camera: 7 khung, như quy tắc đã có.
- Mỗi tiếp xúc chân là một **sự kiện** trong `events.ts` (khung, chân, ô gạch). Cùng sự kiện điều khiển: ô gạch sáng, vòng sáng, hạt bụi, SFX trong `sfx-cues.json`. Không tính lại thời điểm ở nơi khác.

### Bước 3. Thiết kế nhân vật hình que (thư mục `src\tests\stick\`)
Khung 1080x1920, 30 fps. Nhân vật cao khoảng 380 px trên khung hình.

| Bộ phận | Quy cách |
|---|---|
| Đầu | hình tròn đặc trắng `#F2F2F2`, bán kính 26 px, **không có mặt**; cảm xúc thể hiện bằng nghiêng đầu và tư thế |
| Cổ | 16 px |
| Thân (xương chậu đến gốc cổ) | 120 px, có thể nghiêng và xoay nhẹ |
| Cánh tay | cánh tay trên 70 px, cẳng tay 70 px (mảnh hơn thân) |
| Chân | đùi 96 px, cẳng chân 96 px; bàn chân là một nét ngắn 22 px |
| Nét vẽ | rộng 9 px, đầu nét tròn, màu `#F2F2F2`; khớp nối được vẽ mượt, không để lộ chỗ gãy |

Yêu cầu bắt buộc:
- **Độ dài xương không đổi** trong mọi khung (sai số ≤ 0,01 px). Tay chân chỉ đổi góc, không co giãn.
- IK 2 xương cho chân, với **tầm với tối đa** = đùi + cẳng chân − 2 px; nếu mục tiêu xa hơn thì hạ hông xuống để chân thực sự chạm được mục tiêu, không kéo giãn xương.
- foot_lock: chân đang đứng trên đất **không trượt**.
- Khi chưa có biểu cảm, nhân vật vẫn đọc được qua tư thế: lưng thẳng, đầu hơi ngẩng khi đi; đầu và thân cúi khi vấp.

### Bước 4. Cảnh và ánh sáng (giả điện ảnh bằng 2D, không cần 3D)
Bối cảnh nhìn ngang, nền tối `#0B0B0D`, ánh sáng giả bằng lớp SVG/CSS:
- **Đèn rọi**: gradient tròn mờ từ trên xuống quanh nhân vật, di chuyển theo nhân vật.
- **Sàn có phản chiếu**: nhân vật và ô gạch được vẽ lại lật ngược dưới đường sàn, độ mờ giảm dần (mask gradient) và hơi nhòe.
- **Ô gạch**: hình chữ nhật bo tròn mỏng trên đường sàn `y = 1320`, bề rộng 110 px, đặt cách nhau 150 px (bằng bước chân). Mỗi ô có phát sáng nhẹ (nhòe bằng `feGaussianBlur`, nếu quá chậm thì dùng gradient thay).
- **Cánh cửa** ở ô thứ 11 (x = 1650): khe sáng mảnh, sau đó mở ra lớp ánh sáng tràn.
- **Bụi trôi**: 40 hạt nhỏ trong vùng đèn rọi, trôi chậm lên trên (có chuyển động ngay từ khung 0).
- **Vignette** nhẹ ở viền.
- **Chữ**: dòng trên cùng "ONE STEP AT A TIME" (≤ 5 từ) hiện từ khung 0; để một ô giữ chỗ tên kênh nhỏ ở giữa dưới. Không đặt chữ trong 20% dưới và 12% bên phải khung hình.

### Bước 5. Hoạt cảnh (180 khung = 6 giây)
Camera: nhân vật đứng ở khoảng x = 380 trên màn hình (bên trái, chừa chỗ phía trước). Camera theo hông bằng trung bình trượt 12 khung. Thế giới tính theo trục x (px), ô gạch n ở `x = 150·n`.

Chân tiếp xúc (mỗi chân **ghim vào vị trí mục tiêu trong khoảng đứng**, không trượt):

| # | Khung | Chân | Vị trí x | Ghi chú |
|---|---|---|---|---|
| 1 | 12 | trái | 150 (ô 1) | bước bình thường |
| 2 | 27 | phải | 300 (ô 2) | |
| 3 | 42 | trái | 450 (ô 3) | |
| 4 | 57 | phải | 600 (ô 4) | |
| 5 | 72 | trái | 705 | **vấp**: mũi chân mắc vào mép ô 5 (ô 5 ở x = 750), chân dừng ngắn hơn bình thường |
| 6 | 86 | phải | 900 (ô 6) | **bước chụp thăng bằng**: bước dài ~300 px, gối gập sâu, hông hạ thấp |
| 7 | 111 | trái | 1050 (ô 7) | đi tiếp |
| 8 | 126 | phải | 1200 (ô 8) | |
| 9 | 141 | trái | 1350 (ô 9) | |
| 10 | 156 | phải | 1500 (ô 10) | khe cửa bắt đầu sáng |
| 11 | 171 | trái | 1650 (ô 11, ở cửa) | cửa mở, ánh sáng tràn, đứng im đến khung 180 |

Tại khung 0, nhân vật đang **giữa bước đi** (chân trái đang vung, chân phải đứng ở x = 0) để có chuyển động ngay từ khung đầu.

Sáu pha của đoạn vấp (khung 72–111):
1. **72–75, mắc chân:** chân trái dừng; cẳng chân tụt lại một nhịp (đến 2 khung) so với đùi.
2. **75–84, chúi tới:** thân nghiêng từ 0° đến 35°, hai tay đưa ra phía trước, đầu theo thân chậm 2 khung.
3. **84–90, chụp thăng bằng:** chân phải vung dài, tiếp đất ở khung 86, hông hạ thấp, gối gập ~40°. **Rung camera 7 khung, biên độ 10 px** ở khung 86 (và biên độ 6 px ở khung 72).
4. **90–102, giữ thăng bằng:** hai tay dang ra, lắc nhẹ giảm dần theo dao động tắt dần (`sin` nhân hàm mũ), hai chân đều đã ghim.
5. **102–108, đứng thẳng:** thân về 0°, tay hạ xuống, một nhịp thở.
6. **108–111, đi tiếp:** chân trái vung và tiếp đất ở ô 7.

Nguyên tắc chuyển động để mượt:
- Tay vung đối lập với chân; thân xoay nhẹ theo bước; đầu theo thân chậm 1–2 khung.
- Mỗi chuyển pha dùng **ease** (không bắt đầu hoặc dừng đột ngột); chuyển giữa chu kỳ đi và vấp **trộn 6 khung** để không bị giật.
- Có chuẩn bị trước (anticipation) và theo sau (follow-through) ở pha chúi và pha đứng dậy.

Ánh sáng theo sự kiện:
- Khi chân chạm ô n (khung của bảng trên): ô n sáng hết cỡ kèm một vòng sáng lan trong 8 khung; ô n+1 và n+2 sáng dần lên mức 40% và 15% (bắt đầu 6 khung trước chạm). "Bạn chỉ thấy hai bước phía trước."
- Khi cửa mở (khung 156–171): ánh sáng tràn ra, rim light trên nhân vật, có thể dừng 1 nhịp ở khung 171.

### Bước 6. Kiểm tra chuyển động bằng số (trước khi render ảnh)
Viết script `src\tests\stick\check-motion.ts` (chạy bằng `npx tsx`), in ra bảng và **báo lỗi nếu không đạt**:
- Độ dài mỗi xương không đổi (sai số ≤ 0,01 px) trong toàn bộ 180 khung.
- Với mỗi chân, trong khoảng đứng trên đất, tốc độ x của bàn chân (px/khung) < 0,5.
- Tầm với IK không vượt đùi + cẳng chân − 2 px ở khung nào.
- Không có khung nào mà vị trí khớp nhảy quá 40 px so với khung trước (phát hiện giật).
- In danh sách sự kiện tiếp xúc theo bảng Bước 5 để đối chiếu.
Sửa đến khi tất cả đạt, rồi mới render.

### Bước 7. Render
**Ảnh tĩnh** (`--scale=0.5`) tại các khung: 0, 12, 27, 72, 78, 86, 95, 111, 156, 171.
```
npx remotion still src/index.ts StickTest out/stick-f000.png --frame=0 --scale=0.5
npx remotion still src/index.ts StickTest out/stick-f072.png --frame=72 --scale=0.5
npx remotion still src/index.ts StickTest out/stick-f086.png --frame=86 --scale=0.5
```
(làm tương tự cho các khung còn lại). Đo thời gian từng ảnh. **[HỎI MÌNH]** Gửi mình ảnh + kết quả `check-motion`. Mình duyệt xong mới tiếp tục.

**Video** (chỉ sau khi mình duyệt): render 180 khung, nửa độ phân giải trước, tên `out/stick-test.mp4`. Báo thời gian render. Không render 2K.

### Bước 8. Báo cáo ngắn (cuối cùng)
- Chuyển động có mượt không (tự đánh giá thẳng thắn): chân có trượt không, vấp có tự nhiên không, camera có giật không.
- Còn thiếu gì: biểu cảm, bước đi khác, vật phẩm, phản chiếu.
- Thời gian render ảnh tĩnh và ước tính thời gian render video 6 giây.
- Để làm thành series (mỗi tập một ẩn dụ), phần nào dùng lại được, phần nào phải làm mới.

## KẾT THÚC PROMPT

---

## Sau khi chạy xong
1. Gửi mình các ảnh tĩnh và kết quả `check-motion`; mình sẽ đối chiếu với bảng sự kiện.
2. Nếu chuyển động chưa mượt, nói rõ khung nào giật hoặc chân nào trượt, mình sẽ sửa prompt chuyển pha.
3. Khi cảnh thử đạt, mình viết tiếp 10 ẩn dụ gốc cho series.
