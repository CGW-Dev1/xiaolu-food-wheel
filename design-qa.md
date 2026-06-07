# Design QA

Date: 2026-06-07

Reference:
- User annotation screenshot: `C:/Users/cuigw/Documents/Tencent Files/2976367277/nt_qq/nt_data/Pic/2026-06/Ori/4d9898d7852afeb10b533a2481bd76b8.jpeg`

Prototype:
- Local preview: `http://127.0.0.1:5173/`
- Latest screenshot: `D:/javademo/小璐今天吃什么/app-revised-v3-home.png`

Checks:
- Homepage contains only the roulette and 今日推荐 content.
- 今日推荐 card now has only one action: `换一个`; removed `记为已做` and `上传图`.
- Revised recommendation card layout was checked at `390x844`: one button, image width `108`, no card text overflow.
- Cooking tutorial text and external tutorial actions are removed from all visible tabs.
- Roulette pointer final angle, selected sector index, and recommendation name match after spin.
- Verified spin result: pointer angle `280.000`, selected index `7`, slice size `40.000`, target angle `280.000`, difference `0.000000`.
- Spin now uses an immediate lock and pointer ref; after the spin finished, waiting another `1700ms` kept pointer angle, selected index, and recommendation unchanged.
- Selected sector is raised after stop and the selected dish image is highlighted.
- Add dish flow now opens recipe-library quick add instead of direct wheel creation.
- Recipes created without an uploaded image now show a `未上传` placeholder. Existing custom recipes that were previously auto-filled with built-in random dish images are migrated to the placeholder.
- Placeholder check screenshot: `D:/javademo/小璐今天吃什么/app-placeholder-recipe.png`
- Diary is split into 菜谱 and 记录, with create/edit/delete controls and record-to-recipe sync.
- Record-to-recipe sync filters same-name records and existing same-name recipes. Test batch `土豆牛腩 / 土 豆 牛腩 / 番 茄 炒 蛋 / 鱼香肉丝` synced only `土豆牛腩` and `鱼香肉丝`.
- Mine tab shows local stats and management entry points only.
- Mine tab layout updated: `管理菜谱 / 管理记录 / 恢复初始` are one equal-width row; `导入数据 / 导出数据` are a second equal-width row spanning the same panel width.
- Import/export data includes recipes, cooking records, wheel recipe ids, and the selected recipe id.
- Android export now opens the system document-save picker so the user can choose file name and save location before writing the JSON backup.
- Homepage polish: added a compact `避开7天内做过` draw preference, candidate count, and last-cooked metadata on the recommendation card.
- Diary polish: added local search for recipes and cooking records.
- Recipe picker polish: added local search before adding dishes to the wheel.
- Recipe picker now has `同步全部`, which adds every recipe in the recipe library to the wheel without duplicates.
- Recipe picker layout adjusted: stats, bulk actions, search, and recipe list are separated into clearer rows.
- Sync-all picker check: after removing one dish from the wheel, tapping `同步全部` restored the wheel count from `8` to `9` and showed `已同步 1 道菜到转盘。`.
- Polished draw logic: when more than one candidate exists, spinning excludes the currently selected recipe so `换一个` does not immediately return the same dish.
- Homepage polish: wheel count is now a compact utility pill, and the recommendation card shows category plus last-cooked metadata as compact tags.
- Picker polish: `同步全部` becomes a muted disabled `已同步完` state when every recipe is already on the wheel.
- Mobile polish check at `390x844`: homepage wheel width `358`, recommendation card stayed inside the first viewport with no measured overflow; picker modal had no measured overflow.
- Homepage first-screen fit update: home-only spacing and wheel sizing now adapt to viewport height so the full `今日推荐` card stays above the fixed bottom navigation.
- Fit check: at `390x844`, recommendation card bottom `646`, nav top `776`; at `390x760`, card bottom `602`, nav top `692`; no measured overflow.
- Wheel sector visibility restored: roulette now uses a dedicated higher-contrast wheel palette plus thin sector separators, and the highlight overlay opacity was reduced so sectors no longer wash into one solid disk.
- Wheel check at `390x844`: conic background includes separators, 54 color stops were detected, recommendation card remained fully above the fixed bottom nav, and no measured overflow was found.
- Practical draw check: with `避开7天内做过` enabled, the default recent records leave 5 candidates and a test draw selected `蒜蓉西兰花`, not a recent record.
- Android launcher icon replaced with a chicken-wings food icon generated from `src/assets/dishes/cola-wings.jpg`.
- Icon preview: `D:/javademo/小璐今天吃什么/app-icon-chicken-wings-preview.png`
- Android launcher icon replaced again with a centered cartoon drumstick mark on a light blue background.
- Cartoon icon preview: `D:/javademo/小璐今天吃什么/app-icon-cartoon-drumstick-preview.png`
- Version bumped to `versionCode 2`, `versionName 1.1` so Android launchers are more likely to refresh the cached app icon during update install.
- Mine tab layout check at `390x844`: top button widths `106/106/106`, bottom button widths `163/163`, all button heights `42`, no text overflow.
- Mine tab screenshot: `D:/javademo/小璐今天吃什么/app-mine-import-export.png`
- Mobile viewport `390x844` has no key text overflow.
- Unused external Browser plugin removed; app UI no longer exposes tutorial or outbound tutorial flows.
- Android debug APK rebuilt and verified with APK Signature Scheme v2.
- Android target SDK verified as 36.

Final result: passed
