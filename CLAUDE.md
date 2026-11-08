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

## Tập 3 (ep003-milo-lawyer-rooster)
- Kịch bản: `SCRIPT-ep003-milo-lawyer-rooster.md`. Mã: `src/videos/ep003/` (composition `Ep003`, 1080x1920, 30 fps, 1590 khung = 53 s, 19 shot). Cùng công thức tập 2 (`ep002`): văn phòng luật sư dùng lại từ `ep002/sets.ts`; quảng trường Basel là `ep003/sets.ts`.
- Giọng: Kokoro `am_santa` (cùng tập 1, 2). `voice/ep003/` (`script.txt`, `fixes.json`: câu "Basel" cần dấu "..." ở đầu câu mới đọc đủ âm B). Quy trình: `make_voice.py am_santa ep003` -> `pad_voice.py ep003 "2:0.8,8:0.5,10:0.5,12:1.0,13:0.35,16:0.5"` -> `fix_voice_lines.py` (nếu cần) -> xóa `words.json` -> `make_voice.py`.
- Mốc hình: bảng `Q` trong `ep003/story.ts` (khung = thời điểm từ x 30 - 2). `audio/make_audio_ep003.py` đọc cùng bảng `Q` nên đổi mốc là đồng bộ âm thanh.
- Nhân vật mới: gà trống (`fxRooster`, 7 trạng thái), công tố viên, chủ gà béo, thư ký tòa, lính canh, quái vật dễ thương, bóng Satan đỏ, bóng đèn ý tưởng. Gà KHÔNG xuất hiện sau phán quyết (cảnh 14 trở đi); không lửa, không khói, không thương tích.
- Nút SUBSCRIBE: component dùng lại `src/series/SubscribeButton.tsx` (props `from`, `shrinkAt`, `label`, `top`); thêm "ding" ở audio tại khung `from`.
- Đám đông: hai hàng ngay sau Milo + hai bên sườn (`ROW1`, `ROW2`, `FLANK` trong `ep003/cast.ts`); khung dọc hẹp nên đám đông ngoài ±3 m không hiện trong cảnh rộng.
- Góc máy ep003 (để không giống ep002): mỗi nhịp một kiểu: crane xiên, góc thấp nghiêng (roll), POV con gà, orbit quanh Milo (cảnh 7), góc cao nhìn toàn sân (cảnh 12), chia đôi màn hình chéo (cảnh 11: panel id 20/21 trong `SHOTS`, `PANELS`/`PANEL_CLIPS` ở `story.ts`, `layersAt` trả thêm `clip`). Bản đầu (góc chính diện) còn ở `out/ep003/ep003-rooster-trial_v1.mp4`.
- Giọng ep003: Kokoro hay nuốt từ ngắn đầu câu ("Basel", "So", "A"): sửa bằng `fix_voice_lines.py` với biến thể có "..." ở đầu (`voice/ep003/fixes*.json`).

## Kênh/series mới "Real or Myth?" (2D phẳng, không dùng Milo)
- Phong cách: SVG/React 2D đầu tròn (không WebGL), code ở `src/flat/`: `style.ts` (bảng màu `PAL`, viền `INK` #1b1b2f 8 px, vùng an toàn `SAFE`: không chữ ở 20% dưới và 12% phải), `FlatCharacter.tsx` (nền: đầu tròn 40% chiều cao, không cổ, thân quả trứng), `expressions.ts` (neutral, curious, shock, smirk, proud, sweat, deadpan, laugh), `poses.ts` (idle, point, hold_paper, magnifier, shrug, one_finger, scratch_head, hold_stamp, stamp_down, hold_book, write).
- Nhân vật (`src/flat/characters/`): **Pip** (người dẫn, cố định mọi tập: người lớn trẻ, mũ len xanh ngọc `#1fa6a0` có bông vàng, khăn cam `#f28c28`, tàn nhang, áo khoác xanh đậm `#1d3f5c`); **Einstein** `einstein(age: 12|14|16|26|"old")` tranh biếm họa tự vẽ (old: tóc trắng như mây, ria dày xám, mắt sụp mí, áo len nâu; không vẽ pose lè lưỡi); **Judge** giám khảo ETH (cằm vuông, kính kẹp mũi, áo choàng đen, con dấu). Quyền dùng tên/hình Einstein cho nội dung thương mại chưa kiểm chứng.
- Props `src/flat/props/` (Stamp F/FAILED/REAL/MYTH, ExamPaper + chế độ bảng điểm, BigBook, Chalkboard, PatentDesk, nền RoomWarm/ExamHall/Office), UI `src/flat/ui/` (MythMeter có `keys`/`snap`/`wobble`, ClueChip, Captions từ mảng từ, BigLine ≤ 5 từ, SubscribeButton dùng lại của series). Bảng nhân vật: composition `FlatCharacterSheet` -> `out/flat-sheet.png`.
- Giọng series này: Kokoro `am_santa` (người dùng chọn lại cho ep005; không dùng `am_michael`).

## Tập 5 (ep005-einstein-failed-math, "Einstein Failed Math? Real or Myth?")
- Kịch bản `SCRIPT-einstein-failed-math-real-or-myth.md`. Mã `src/episodes/ep005-einstein-failed-math/` (composition `Ep005Einstein`, 1080x1920, 30 fps, 1452 khung = 48,4 s, 15 cảnh). `story.ts` có bảng `Q` (khung = mốc từ x 30 − 2; đầu câu lấy từ mốc tiếng thật), `captions.ts` do `scripts/caps_from_script.py` sinh từ script.txt (chữ phụ đề là chữ của kịch bản, không phải chữ Whisper nghe nhầm).
- Giọng: `voice/ep005/` (`script.txt`, `fixes.json`). Quy trình: `make_voice.py am_santa ep005` -> cắt 0,17 s đầu `voice_raw.wav` (để VO bắt đầu đúng khung 0) -> `pad_voice.py ep005 "1:0.5,3:0.5,4:0.2,5:0.6,6:0.9,7:0.4,8:0.8,9:0.7,10:0.4,11:0.5,12:0.4,13:0.7,14:0.5,15:0.4,16:0.9"` -> `fix_voice_lines.py ep005 am_santa voice/ep005/fixes.json` (các câu 5, 11, 12, 14, 16 bị nuốt chữ đầu) -> pad lại -> xóa `words.json` -> `make_voice.py`. Whisper lệch tới ±0,2 s ở từ đầu câu: dùng mốc tiếng thật.
- Âm thanh: `audio/make_audio_ep005.py` -> `audio/ep005/mix.wav` (đọc bảng `Q`). Nhạc tự tạo (C trưởng, marimba), có record scratch ở re-hook, nhạc tắt 0,3 s trước dấu F.
- Render: `npx remotion render src/index.ts Ep005Einstein out/ep005/video_silent.mp4 --codec h264 --crf 16 --gl=angle --muted`, rồi ghép tiếng bằng ffmpeg (loudnorm I=-14).

## Tập 7 (ep007-thermopylae, "300 Spartans Held Off a MILLION Persians? Real or Myth?")
- Kịch bản `SCRIPT-thermopylae-300-vs-million.md`; prompt `PROMPT-thermopylae-characters-and-action.md`. Mã `src/episodes/ep007-thermopylae/` (composition `Ep007Thermopylae`, 1080x1920, 30 fps, 1282 khung = 42,7 s, 14 cảnh + khung vòng lặp); video: `out/ep007/ep007-thermopylae.mp4` (render lại: `npx remotion render ... out/ep007/video_silent.mp4 --muted`, rồi `bash out/ep007/mux.sh` = loudnorm hai lượt + limiter).
- **Một sự kiện điều khiển tất cả:** `events.ts` là nơi duy nhất giữ thời gian (bảng `Q`: reveal, meter_on, count_p, count_g, rehook=shield_lock, thrust_1/2, point, night, surprise, wave_off, stand, stamp + mốc câu `L1..L13`). Hình (clip, tia lửa, rung 7 khung `shakeAt`, kim đồng hồ `METER_KEYS`, chip `clueAt`), tiếng (`audio/make_audio_ep007.py` đọc `Q`, xuất `audio/ep007/sfx-cues.json`) và phụ đề đều đọc cùng khung. Cấm tự tính giờ ở nơi khác. Khung = mốc từ trong `words.json` x 30 − 2.
- Rig `src/flat/rig/` (`rig.ts`, `Figure.tsx`, `RIG.md`), nhân vật `src/flat/characters/thermo.tsx`, thư viện chuyển động `src/flat/motion/clips.ts` (idleBreathe, marchCycle + `MARCH_REL`/`marchSpeedPx`, shieldLock, spearThrust, shieldBlock, staggerBack, turnHeadSurprise, pointUp, waveOff, sitThrone) và `formation.ts`. Chân không trượt vì bàn chân đang chạm đất lùi đúng tốc độ đi: nhân vật phải đi `MARCH_REL x scale x spec.size` px/khung (nhân vật nhỏ dần thì dùng tích phân, xem `Stay`). Hy Lạp quay phải, Ba Tư lật hình quay trái. Biểu cảm chiến đấu `fierce` (nghiến răng) và `roar` (gầm).
- Pip (nhìn thẳng) đổi pose mượt bằng `src/flat/motion/pipPose.ts` (`pipTrack(f, [[khung, pose],...])` -> prop `poseObj` của `FlatCharacter`), không đổi đột ngột. Cờ `point` trong `RigPose` vẽ ngón trỏ; đuốc vẽ đè lên đầu.
- Khẩu hình Pip theo độ to của giọng thật: `scripts/mouth_from_voice.py ep007 src/episodes/ep007-thermopylae/mouth.ts 1300` -> `MOUTH[f]` (cửa sổ 50 ms, miệng khép giữa các âm tiết), chạy lại mỗi khi đổi giọng. Ephialtes: mũ trùm có đỉnh nhọn + áo choàng vai (`mantle`) + râu nhọn (`beard.style: "point"`); bàn tay nào cũng có ngón cái; pose `plead` (xin xỏ vua) rồi `point_up` (chỉ lên núi); Xerxes đặt tay lên gối.
- Giọng: Kokoro `am_santa` (cùng series Real or Myth). `voice/ep007/` (`script.txt`, `fixes.json`, `fixes2.json`: tên riêng cần phiên âm `[Herodotus](/hɪɹˈɑdətəs/)`, `[Ephialtes](/ɛfiˈæltiz/)`, `[Leonidas](/liˈɑnədəs/)`, và dấu "..." đầu câu). Quy trình như ep005; pad `"1:0.35,2:0.3,4:0.3,6:0.3,7:0.2,9:0.35,10:0.3,11:0.35,12:0.3"`. Phụ đề sinh bằng `scripts/caps_from_script.py ep007 ...` (câu 3 canh tỉ lệ).
- Cảnh duyệt ban đầu vẫn còn: `ThermoSheet` (`out/thermo-sheet.png`), `ThermoScenes` (`Scenes.tsx`, 8 ảnh).


## Cảnh thử hình que (src/tests/stick/, composition `StickTest`)
- Nhân vật que (đầu tròn đặc, nét 9 px, xương cố định: đùi/cẳng 96, thân 120, cổ 16, tay 70+70, bàn chân 22), chuyển động là hàm thuần của khung. `events.ts` giữ bảng chạm đất (11 bước, bước 5 là vấp) + hàm `tileGlow`/`ringAt`/`sfxCues`; `motion.ts` có chân (ghim theo bảng, foot lock), hông (đường cong đơn điệu + hạ hông khi chân với không tới), nghiêng thân, tay, camera trung bình trượt 12 khung; `check-motion.ts` kiểm bằng số (chạy theo `RUN-CHECK.txt`, dùng esbuild vì chưa cài tsx). Video test: `out/stick/stick-test.mp4` (nửa độ phân giải).

## Cảnh thử xe tải + thiên thạch (src/tests/truck/, composition `TruckTest`, 240 khung = 8 s)
- Người que (xương của `src/tests/stick/motion.ts`, mọi chi lưu bằng GÓC nên trộn tư thế không giãn xương) lái xe tải ban đêm, thiên thạch rơi trúng thùng xe, xe nổ, sóng nổ hất người que văng ra (xoay lộn một vòng, tiếp đất ngửa, trượt, nằm, ngồi dậy, gãi đầu nhìn xe cháy). Không máu. `events.ts` giữ mốc thời gian + hằng số vật lý (`F.hit`, `BLAST`, `F_LAND` tính từ công thức, rung camera, `sfxCues`); `kin.ts` động học (lái bằng IK, bay đạn đạo, lăn, ngồi, camera, `ballistic` có nảy); `TruckTest.tsx` vẽ; `check-motion.ts` kiểm xương/bánh xe lăn không trượt/không xuyên đường/nhảy khớp (chạy như `src/tests/stick/RUN-CHECK.txt`). Video: `out/truck/truck-test.mp4` (nửa độ phân giải, chưa có tiếng; `src/tests/truck/sfx-cues.json`).

## Series người que "Two Lives, One Clock" (src/series2/, chờ duyệt cảnh)
- Kịch bản `two_lives_one_clock_shorts_90s_vi.md` (Alex: ba lô + sổ, ánh sáng vàng ấm, phòng gọn; Ben: điện thoại, ánh sáng xanh lạnh, phòng bừa; cùng một thân hình). `stick.tsx` (người que thon, IK, viền sáng, bóng đổ), `props.tsx` (phòng, đồng hồ, lịch, điện thoại, laptop, giường, sofa, bàn...), `Scenes.tsx` (composition `TwoLivesScenes`, khung n = cảnh n+1, 12 cảnh) -> `out/twolives/scene-0..11.jpg`. Chưa có chuyển động, giọng, âm thanh.
- v2 (src/series2/wide.tsx): các cảnh Năm 1, Năm 3, Năm 5, "10 năm sau" và cảnh toàn cảnh 13 dùng bố cục xếp chồng (trên Alex, dưới Ben, mỗi bên rộng hết khung, đồng hồ chung ở giữa = cùng một thời điểm). Thành công cụ thể: biểu đồ tăng trưởng trên tường (`Growth`: tăng dần cho Alex, phẳng cho Ben), chứng chỉ, màn chiếu dự án, bảng tên TEAM LEAD/MANAGER, phong bì tăng lương, "PROMOTED". Cảnh 1, 2, 6, 8-12 vẫn chia trái/phải (`Scenes.tsx`).
- v3 (src/series2): 16 khung `TwoLivesScenes` = S1, S2, W3 (Năm 1), J1, W4 (Năm 3), J2, W5 (Năm 5), J3, S6, W7 (10 năm sau), J4, S8-S12. `J1..J4` (wide.tsx `Journey`) = cảnh chèn "một bậc thang mỗi mốc": Alex bước lên bậc k (ngẩng đầu, biểu tượng thành tựu trên bậc: chứng chỉ, dự án, tăng lương, cờ), Ben đi thẳng trên đường phẳng cúi đầu nhìn điện thoại, qua cùng loại cột mốc lặp lại. Biểu cảm bằng dáng: `head` dương lớn = cúi đầu, âm = ngẩng.
- v4 đen trắng (src/series2/stick.tsx): `MONO = true` = kênh phong cách đen trắng: lớp "world" bị lọc CSS grayscale+brightness thành xám tối, lớp "figs" vẽ riêng người que TRẮNG (viền đen mảnh, tay chân xa xám nhạt, phản chiếu mờ trên sàn) và chữ/đồng hồ chữ sáng (`Overlay`, `BigText`). `MonoSvg` render children hai lần (world + figs); `Stickman`/`Overlay` tự quyết hiện ở lớp nào. Đặt `MONO = false` để về bản màu. `Stack` (wide.tsx) = hai tầng cao 740 + dải nhãn 80 (nhãn năm bên trái, đồng hồ giữa) kết thúc ở y=1560 để chân không rơi vào 20% đáy Shorts; tên kênh giữ chỗ ở y=1720.
