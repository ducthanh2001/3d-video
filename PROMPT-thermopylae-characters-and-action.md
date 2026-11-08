# Prompt: nhân vật + cảnh hành động Thermopylae (một bộ khung xương dùng chung, chuyển động khớp nhau)

> Dùng cùng `SCRIPT-thermopylae-300-vs-million.md`.
> Cách dùng: mở VS Code trong thư mục dự án Remotion (đã có Pip, `src\flat`, MYTH-O-METER...), mở terminal, chạy `claude`, dán toàn bộ từ "BẮT ĐẦU PROMPT" đến "KẾT THÚC PROMPT".

---

## Ý tưởng cốt lõi: vì sao cách này sẽ "khớp"

Chuyển động nhìn rời rạc thường do 3 lỗi: (1) mỗi nhân vật diễn bằng một kiểu khác nhau, (2) đòn đánh, tiếng động, rung camera và tia lửa không rơi **đúng cùng một khung hình**, (3) chân trượt trên đất. Prompt này sửa cả ba:

1. **Một bộ khung xương (rig) cho mọi nhân vật.** Pip, lính Sparta, lính Ba Tư, Xerxes, Ephialtes đều dùng cùng cấu trúc khớp, nên mọi động tác (đi, đâm, chặn, quay) dùng được cho tất cả, chỉ khác hình dạng và đồ vật cầm.
2. **Một "sự kiện" điều khiển mọi thứ.** Mỗi cú đâm là một sự kiện `ev:thrust_1` ở một số khung. Cùng số khung đó quyết định: khung chạm của mũi giáo, tiếng clang, tia lửa, rung camera 7 khung, và phản ứng của lính Ba Tư. Không có hai nơi tự tính giờ riêng.
3. **IK hai xương cho tay và chân.** Bàn chân bám đất, bàn tay bám cán giáo/quai khiên. Không trượt chân.

Quy ước thêm cho mượt: đi theo 12 nguyên lý hoạt hình cơ bản (chuẩn bị, hành động, theo đà, ra vào chậm), không dùng chuyển động tuyến tính.

---

## BẮT ĐẦU PROMPT

Mình dùng Windows, PowerShell. Dự án Remotion này đã có nhân vật Pip, thư mục `src\flat` (style, characters, props, ui), MYTH-O-METER, Captions, SubscribeButton, và có thể có cảnh thử `ArrowTest` (xem `CLAUDE.md`). Mình sắp làm tập **"300 Spartans Held Off a MILLION Persians? Real or Myth?"** (kịch bản ở `SCRIPT-thermopylae-300-vs-million.md`). Tập này có cảnh chiến đấu, nên mình cần **bộ nhân vật và thư viện chuyển động dùng chung một bộ khung xương**, để mọi động tác khớp nhau mượt.

Việc của bạn: dựng rig, nhân vật, thư viện chuyển động, và một cảnh kiểm tra chuyển động. Làm lần lượt từng bước, báo ngắn gọn sau mỗi bước, dừng hỏi mình ở các điểm đánh dấu **[HỎI MÌNH]**. Chưa làm video thật của tập.

### Quy tắc chung
- Chủ yếu render **ảnh tĩnh** (`npx remotion still ... --scale=0.5`). Khi cần kiểm tra chuyển động, được render **đoạn ngắn tối đa 3 giây ở `--scale=0.5`**, **hỏi mình trước**. Không render 2K, không render cả tập khi mình chưa bảo.
- Đừng tải gì ngoài gói npm (báo tên gói nếu thêm). Không tải ảnh, font, model từ web.
- Hỏi mình trước khi xóa thư mục. **Không sửa các tập cũ và không sửa các file dùng chung của `src\engine`**; thêm file mới trong `src\flat\rig\`, `src\flat\characters\`, `src\flat\motion\`, `src\episodes\ep007-thermopylae\`.
- **Không trộn 2D và 3D trong cùng một tập.** Tập này dùng phong cách 2D phẳng đầu tròn đã có ở `src\flat`. Nếu `ArrowTest` đang là 3D, đừng nhúng nó vào tập này (cảnh bắn cung ở tập khác).
- Không sao chép nhân vật hay khung hình từ `references\` hoặc từ video của kênh khác. Mọi thiết kế là của mình.
- Nội dung phải không có máu, không cận cảnh người bị thương; cảnh cuối chỉ là bóng người. Vẽ người Ba Tư tôn trọng, không biếm họa dân tộc.
- Sau mỗi thay đổi lớn: `npx tsc --noEmit`, rồi render ít nhất một ảnh tĩnh để xem bằng mắt. Nếu ảnh ra một màu trơn, dừng và báo nguyên nhân.

### Bước 1. Đọc trước khi làm
Đọc `CLAUDE.md`, `src\flat\style.ts`, `src\flat\characters\*`, `Root.tsx`, `EPISODE_RECIPE.md`, và (nếu có) `src\tests\arrow\`. Tóm tắt tối đa 8 dòng: những gì đã có để dùng lại (style, FlatCharacter, spring, captions, meter), phần còn thiếu để diễn hành động (khớp xương, IK, thư viện chuyển động, đám đông), và xác nhận tập này làm bằng 2D SVG/React.

### Bước 2. Bộ khung xương dùng chung (`src\flat\rig\`)
Tạo kiểu dữ liệu và hàm:
- `Skeleton`: khớp cố định cho mọi nhân vật: `hip`, `spine`, `neck/head`, `shoulderL/R`, `elbowL/R`, `handL/R`, `hipL/R`, `kneeL/R`, `footL/R`, cộng điểm gắn `weaponGrip`, `shieldGrip`. Độ dài xương lấy từ `spec` của mỗi nhân vật (cao thấp, vai rộng khác nhau) nhưng **tên khớp giống nhau**.
- `Pose`: giá trị góc/vị trí cho từng khớp. Kèm `lerpPose(a, b, t)` và `blendPose(layers)` để trộn (ví dụ thân đang đi + tay đang đâm).
- `solveIK2Bone(root, mid, target)`: giải IK hai xương cho tay (vai-khuỷu-tay → bàn tay) và chân (hông-gối-chân → bàn chân), để bàn chân bám mặt đất (`groundY`) và bàn tay bám cán vũ khí/quai khiên.
- `foot_lock`: khi bàn chân đang "chạm đất" trong chu kỳ đi, giữ nguyên vị trí thế giới của chân, chỉ thân chuyển động (**không trượt chân**).
- `drawCharacter(skeleton, spec, pose)` vẽ bằng SVG theo style của `src\flat\style.ts` (đầu tròn, viền dày, màu phẳng, tay chân ống bo tròn).
Ghi chú thiết kế trong file `RIG.md` (ngắn): tên khớp, đơn vị, hướng trục, cách thêm nhân vật mới.

### Bước 3. Nhân vật (`src\flat\characters\`), tất cả dùng chung rig
Dùng lại **Pip** đã có. Thêm các nhân vật sau (chỉ khác `spec`: tỷ lệ, màu, đồ vật, mũ, tóc):
1. **Lính Sparta (hoplite)**: mũ đồng có mào đỏ, áo choàng đỏ, giáp ngực đơn giản, **khiên tròn đỏ trơn (không vẽ ký hiệu chữ lambda)**, giáo dài. Khác nhau về chiều cao và râu để không giống hệt nhau.
2. **Leonidas** (biến thể của lính Sparta): râu dày, mào mũ lớn hơn, áo choàng đỏ đậm, dáng thẳng; dùng làm nhân vật nhấn trong cảnh cuối.
3. **Lính Hy Lạp khác**: cùng rig, đổi màu áo choàng (xanh, vàng) và hình khiên để đám đông không đơn điệu. Kèm biến thể **người Thespiae** (áo choàng xanh).
4. **Lính Ba Tư**: áo chùng hoa văn, mũ vải dạng khăn, khiên mây/sậy cao hình chữ nhật (đơn giản), giáo ngắn hoặc cung. Thiết kế đẹp, đáng nể, không xấu hóa.
5. **Xerxes**: mũ miện cao, áo vàng, ngồi trên bục (pose ngồi có sẵn từ rig); dáng điềm tĩnh.
6. **Ephialtes**: áo choàng trùm đầu màu xám, dáng khom, lo lắng, tay chỉ lên núi.
Mỗi nhân vật có `hat/helmet`, `cloak`, `shield`, `weapon` là phần đồ vật có thể tháo gắn (đồ vật di chuyển theo khớp tay/ngón).
Không vẽ nhân vật nào giống nhân vật trong phim hay truyện tranh khác.

### Bước 4. Thư viện chuyển động (`src\flat\motion\`)
Mỗi clip là danh sách keyframe `[khung, pose, easing]` + các **điểm tiếp xúc** (contact frames). Dùng easing (ease-in-out, spring có overshoot nhỏ), **chuẩn bị 4–6 khung trước đòn** (wind-up), **giữ 2 khung ở điểm tiếp xúc**, rồi **theo đà** và **ổn định**:
- `idle_breathe` (thở nhẹ, nhún vai, vòng lặp 60 khung)
- `march_cycle` (chu kỳ đi 24 khung, có nhịp lên xuống của hông, foot_lock)
- `shield_lock` (mọi lính sát khiên cùng lúc; mỗi người lệch ±2 khung để không máy móc, nhưng khung chạm chính vẫn là một sự kiện)
- `spear_thrust` (chuẩn bị, đâm, giữ 2 khung ở điểm chạm, rút về)
- `shield_block` (khiên đỡ, thân ngả sau nhẹ)
- `stagger_back` (người bị đẩy lùi một bước, không ngã, không máu)
- `turn_head_surprise` (giật mình quay đầu)
- `point_up` (chỉ tay lên núi)
- `wave_off` (Leonidas vẫy tay ra lệnh)
- `walk_away` (đi dần ra xa, dùng march_cycle)
- `stand_firm` (đứng thẳng, giơ khiên)
- `sit_throne` (Xerxes ngồi)
Liệt kê chuyển động nào không làm được bằng rig hiện tại, đừng tự thêm lớn.

### Bước 5. Sự kiện điều khiển tất cả (`src\episodes\ep007-thermopylae\events.ts`)
Tạo một tệp duy nhất khai báo sự kiện theo giây (đổi ra khung = giây × 30):
```
reveal 0.0 · meter_on 2.4 · count_p 5.0 · count_g 9.5 · rehook=shield_lock 12.8 ·
thrust_1 16.0 · thrust_2 17.0 · point 23.5 · night 26.5 · surprise 29.0 ·
wave_off 31.5 · stand 33.5 · stamp 35.0
```
(Lấy đúng từ cột "Sự kiện" ở bảng mục 2 của kịch bản.)
Từ mỗi sự kiện, **một hàm duy nhất** phát ra mọi thứ cùng khung: clip của nhân vật, hạt/tia lửa (seed cố định), rung camera 7 khung, mốc SFX (xuất ra `sfx-cues.json` để mình đặt tiếng đúng chỗ), và phản ứng của đối phương. **Nghiêm cấm tự tính thời gian riêng ở nơi khác.**

### Bước 6. Đám đông và đội hình
- `formation(rows, cols, spacing, jitter)`: tạo đội hình lính khiên; mỗi người có `phase` lệch ±3 khung và kích thước ±5% (seed cố định) để không đồng bộ máy móc; đội hình di chuyển như **một khối** nhưng từng người có nhịp riêng.
- Biển người Ba Tư ở khung 0: dùng **bóng người (silhouette) lặp** và độ sâu bằng 3 lớp song song (tiền cảnh, giữa, xa), không vẽ chi tiết từng người.
- Bộ đếm PERSIANS và GREEKS dùng component số đã có (con số chạy bằng spring, số cũ bị gạch).
- Hướng màn hình cố định: **Hy Lạp luôn quay mặt sang phải, Ba Tư sang trái**, để người xem không bị lạc.

### Bước 7. Camera và chuyển cảnh
- Đẩy máy chậm liên tục trong mỗi shot (theo skill); va chạm duy nhất gây rung 7 khung tại sự kiện `shield_lock`.
- Chuyển cảnh **cắt theo chuyển động** (cắt ở đỉnh động tác, cùng hướng), ví dụ cắt từ cú đâm sang cận khiên, không dùng mờ dần.
- Nếu đã cài `@remotion/motion-blur`, chỉ bật làm mờ chuyển động cho các động tác nhanh (đâm, vẫy); nếu chưa có, báo mình và bỏ qua, đừng tự cài.

### Bước 8. Cảnh kiểm tra chuyển động `MotionLab` (chỉ để duyệt)
Tạo composition `MotionLab`: mỗi clip chạy vòng lặp trong một ô (grid), có số khung ở góc và vạch đánh dấu ở các khung tiếp xúc. Render **ảnh tĩnh** `--scale=0.5` của 3 khoảnh khắc: chuẩn bị, tiếp xúc, theo đà của `spear_thrust`; và của `shield_lock`. **[HỎI MÌNH]** Gửi mình ảnh. Nếu mình đồng ý, mới render đoạn 3 giây `--scale=0.5` của cú `shield_lock` + `thrust_1` + `thrust_2` để kiểm tra độ mượt và độ khớp (tiếng, tia lửa, rung).

### Bước 9. Bảng nhân vật `ThermoSheet`
Một ảnh tĩnh: Pip, lính Sparta, Leonidas, lính Hy Lạp (3 màu), lính Ba Tư, Xerxes, Ephialtes. Render:
```
npx remotion still src/index.ts ThermoSheet out/thermo-sheet.png --scale=0.5
```
**[HỎI MÌNH]** Mình duyệt hoặc chỉnh màu, tỉ lệ, đồ vật **trước khi** làm bước tiếp.

### Bước 10. Ghi nhớ
Cập nhật `CLAUDE.md`: quy ước rig, danh sách clip, cách thêm sự kiện, vị trí `events.ts`, quy tắc "một sự kiện điều khiển tất cả", hướng màn hình (Hy Lạp phải, Ba Tư trái). Thêm vào `EPISODE_RECIPE.md` mục "Tập có cảnh chiến đấu".

### Kết thúc
Tóm tắt: những gì đã làm; chuyển động nào còn thiếu; chân có còn trượt không; sự kiện nào còn lệch; thời gian render ảnh tĩnh và đoạn 3 giây đo được; việc mình cần làm tiếp (voice, words.json, nhạc/SFX).

## KẾT THÚC PROMPT

---

## Prompt dựng tập (dán sau khi bạn đã duyệt `ThermoSheet` và có `voice.wav` + `words.json`)

```
Mình dùng Windows, PowerShell. Dự án Remotion đã có rig, nhân vật Thermopylae (xem CLAUDE.md), events.ts, MYTH-O-METER, Captions, SubscribeButton. Dựng tập "300 Spartans Held Off a MILLION Persians? Real or Myth?".

Quy tắc: chủ yếu ảnh tĩnh (--scale=0.5); đoạn ngắn ≤ 3 giây chỉ khi mình bảo. Không render cả video khi chưa bảo. Không tải gì ngoài npm. Không sửa tập cũ và engine dùng chung. Không máu, cảnh cuối chỉ là bóng người. Chạy npx tsc --noEmit sau thay đổi lớn.

1. Tạo thư mục episodes\ep007-thermopylae (copy từ _template); script.md = bảng mục 2 của SCRIPT-thermopylae-300-vs-million.md. Thêm một dòng vào Root.tsx: Composition "Ep007Thermopylae", 1080x1920, 30 fps, thời lượng lấy từ voice.wav (tạm 1350 khung).
2. Chờ voice.wav và words.json; hỏi mình về giọng (không dùng am_michael). Nếu thời điểm từ trong words.json lệch khỏi events.ts quá 6 khung, báo mình và gợi ý chỉnh sự kiện; đừng tự đổi VO.
3. Dựng 14 đoạn theo bảng. Frame 0: hàng lính khiên đỏ nhỏ + biển bóng người Ba Tư + chuyển động + chữ "300 vs 1,000,000?"; VO bắt đầu đúng 0,0 s. Không intro, không logo, không flash.
4. MythMeter: 0% → 25% (count_p) → 60% (count_g) → 0% giật ngược (rehook) → 75% (đoạn 8) → 85% (stamp). ClueChip tăng ở đoạn 3, 4, 8.
5. Hành động: dùng clip trong src\flat\motion và events.ts. rehook/shield_lock, thrust_1, thrust_2 phải rơi đúng khung, và rung camera, tia lửa, SFX cue cùng khung. Hướng màn hình: Hy Lạp phải, Ba Tư trái.
6. Phụ đề, camera, vòng lặp, SFX cue theo mục 3 của kịch bản. Xuất sfx-cues.json cho mình.
7. Render 6 ảnh tĩnh: khung 0, count_p, rehook (= shield_lock), thrust_1, night, stamp. Gửi mình xem rồi dừng.
```

---

## Sau khi chạy xong

1. Gửi mình `out/thermo-sheet.png` và 3 ảnh `spear_thrust`.
2. Nếu đoạn 3 giây nhìn mượt, đi tiếp bằng prompt dựng tập.
3. Gặp khớp nào vẫn lệch (chân trượt, đòn không khớp tiếng), gửi mình ảnh + mô tả, mình sẽ chỉnh prompt theo đúng chỗ đó.
