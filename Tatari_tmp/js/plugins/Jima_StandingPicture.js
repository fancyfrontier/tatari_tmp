//=============================================================================
// RPG Maker MZ - Jima_StandingPicture.js v1.6.0
// Modified edition by Jima; based on LL_StandingPicture.js v2.7.0 by Lulu's Church.
// Jima Renamed Edition v1.6.0 (2026-11-21), includes shared slots, FocusKeep and motion target fixes.
//-----------------------------------------------------------------------------
// ルルの教会 (Lulu's Church)
// https://nine-yusha.com/
//
// Please refer to the URL below for license details.
// https://nine-yusha.com/plugin/
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [Jima v1.6.0] 立繪選單、多人聚焦、批次登錄與共用縮放。
 * @author Jima
 * @url https://nine-yusha.com/plugin-spicture/
 *
 * @jimaAssetsBegin
 * @jimaAssetsEnd
 *
 * @help Jima_StandingPicture.js
 * 
 * Jima 立繪操作介面 v1.6.0（2026-11-21）
 * 位置 1～8 各自設定共用的水平、垂直座標，所有立繪依呼叫位置定位。
 * 沿用發言聚焦保留與動作僅影響指定位置的修正。
 * 
 * 【插件更名 v1.6.0】
 * 本客製版作者顯示為 Jima，插件檔名為 Jima_StandingPicture.js。
 * 以 Lulu's Church 的 LL_StandingPicture.js v2.7.0 為基礎修改，保留原始來源與規約註記。
 * 儲存並關閉 MZ，覆蓋此包後，執行 JIMA_StandingPictureRegisterSync.cmd。
 * 工具會保留原插件設定，改用新名稱，並更新地圖、公共事件、戰鬥事件的插件呼叫名稱。
 * 只更換插件名稱，不變更立繪 ID、台詞或其他事件指令；完成後重開專案。
 * 舊存檔的內部立繪欄位與舊呼叫別名會保留，不需重建事件。
 * 請只啟用 Jima_StandingPicture，不要另行啟用原版 LL_StandingPicture。
 *
 * 【多人同時發言聚焦 v1.5.0】
 * 在「顯示／切換立繪」開啟「此角色發言聚焦」，並於
 * 「額外一起聚焦的位置」逐筆選取其他位置 1～8。
 * 例如呼叫位置 3、額外選位置 1，位置 1 與 3 會同時恢復正常亮度與大小。
 * 未選的位置會變暗；若已開啟未發言角色縮小，也會依設定縮小。
 * 大小以共用／個別縮放為基準，時間沿用「聚焦變化時間（幀）」。
 * 額外位置的立繪請先顯示並保留；此欄位只設定其聚焦，不切圖或重播動作。
 * 每次呼叫都重新指定整組聚焦；下一句只由一人說話時，額外清單留空。
 * 在保留模式下，後續純文字台詞會沿用這組聚焦，直到下一次指定。
 * 此角色發言聚焦關閉時維持全員明亮，忽略額外清單；隱藏指令也忽略此欄位。
 * 舊事件沒有此欄位時視為空清單，維持原本單人聚焦。
 *
 * 【批次登錄與共用縮放 v1.4.0】
 * 儲存並關閉 MZ 與清單同步工具後，執行專案根目錄的
 * JIMA_StandingPictureRegisterSync.cmd。
 * 固定讀取 img/pictures/jima_tool 這一層的 PNG，不包含子資料夾。
 * 同名圖片保留全部既有設定；新增圖使用預設值；缺圖的登錄會移除。
 * 目錄不存在、沒有 PNG 或讀取失敗時停止，不改寫既有清單。
 * 批次程式同時更新事件下拉選項，不建立備份，也不修改舊事件指向。
 * 完成後重開專案；手動登錄的同步方式與即時預覽沿用原有工具。
 *
 * 「所有立繪共用縮放比（%）」預設 100，水平、垂直使用相同百分比。
 * 每筆立繪的「是否共用外部縮放比」預設是，包含未填此欄位的舊立繪。
 * 共用時直接使用外部數值，不與個別縮放相乘；原本個別數值仍保留。
 * 改成否後，才使用該筆的水平、垂直縮放。
 * 未發言縮小效果會在所選的共用／個別基準上套用，恢復時也回到此基準。
 *
 * 【換人進退場 v1.3.0】
 * 在「顯示／切換立繪」開啟「更換前先退場」，目前位置有人時，
 * 會讓原立繪退場，等待插件設定的幀數後，再讓新立繪進場。
 * 「更換前退場等待（幀）」預設 20；事件會自動等待，不需另外加等待指令。
 * 首次顯示或目前位置已完全隱藏時直接進場。
 * 此開關由每句指令自行決定：換表情關閉，換角色時開啟。
 * 即使圖片相同，開啟也會重新進場；不會用檔名猜測角色身分。
 * 等待值控制新圖開始顯示的時機；原本進退場速度不變。
 * 若設定少於原退場時間，會在等待結束時結束退場；0 為立即重新進場。
 *
 * 【未發言角色縮小 v1.3.0】
 * 插件設定的「未發言角色縮小」預設關閉，開啟後套用縮放與明暗動畫。
 * 「未發言縮小幅度（%）」預設 10，表示縮小 10%（保留原大小 90%）。
 * 比例以各立繪既有的水平、垂直縮放為基準，並保持腳底中心的位置。
 * 「聚焦變化時間（幀）」預設 20；縮小、恢復大小與明暗共用此時間。
 * 換成他發言時，自動回到原大小與正常亮度；0 幀為立即切換。
 * \AA[N] 對全部角色套用未發言效果；\AA[R] 或 \AA[0] 恢復全部。
 * 關閉縮小開關時，維持前版即時變暗的行為。
 *
 * 【已登錄立繪下拉選單】
 * 在「立繪個別樣式」從 img/pictures/jima_tool 選擇 PNG 並設定樣式。
 * 圖片 ID 直接使用檔名，不含最後的 .png；不必另外輸入 ID。
 * 事件請選「顯示／切換立繪（已登錄清單）」。
 * 下拉選單只列出已登錄的圖片，並套用該筆縮放、原點與眨眼等設定。
 * 資料夾內未登錄的圖片不會自動加入；空白登錄列不列出。
 * 新增、移除或修改登錄後，逐層按確定，再 Ctrl+S 儲存專案。
 *
 * 【儲存後自動同步】
 * 編輯前開啟專案根目錄的 JIMA_StandingPictureSync.cmd。
 * 在工具中選擇專案根目錄並保持視窗開啟，儲存後約 1～2 秒更新選項。
 * 工具只讀取已儲存的登錄清單，不掃描圖片，也不修改個別樣式或專案參數。
 * 更新後到 MZ 插件管理器對本插件按右鍵「重新整理／Refresh」，
 * 再關閉並重新開啟插件命令參數視窗；仍是舊選項時請重開專案。
 * MZ 原生視窗的確定／關閉按鈕沒有供遊戲插件使用的編輯器回呼。
 * 因此以實際存檔為同步時機，不會讀取尚未儲存的修改。
 * 未開工具時，本機試玩啟動會補同步一次；之後仍需 MZ 重新讀取選項。
 * 試玩補同步限本機 NW.js 測試模式，正式遊戲與網頁遊戲不改寫檔案。
 * 首次改寫會備份插件為 Jima_StandingPicture.js.jima-registered-sync.bak。
 * 安裝時請先關閉舊版「圖片資料夾／清單同步」工具，避免互相改寫選項。
 *
 * 【舊座標設定轉換（v1.1.6）】
 * 尚未轉換舊座標的專案，請先本機試玩一次，再重新開啟專案與插件管理器。
 * 首次轉換會採用立繪登錄清單第一筆的舊座標，建立八個位置的共用座標。
 * 位置 5～8 初始分別複製舊位置 1～4 的座標，之後可獨立調整。
 * 同時保留舊進退場與層級設定，清理分類標題旁的舊結構文字。
 * 轉換前會備份 js/plugins.js 為 js/plugins.js.jima-shared-slots-v1.1.6.bak。
 * 只有本機試玩會轉換；正式遊戲與網頁版僅讀取設定，不改寫檔案。
 *
 * 【用插件指令安排對話】
 * 在事件的「插件命令」選擇「顯示／切換立繪（已登錄清單）」：
 * ・立繪圖片：從下拉選單選擇已登錄的圖片（檔名即 ID）。
 * ・顯示位置：選擇位置 1～8。
 * ・顯示立繪：開啟時顯示；關閉時只讓該位置退場。
 * ・此角色發言聚焦：開啟時此人與額外指定的位置明亮，未選的人變暗。
 * ・額外一起聚焦的位置：清單中逐筆選取其他位置；留空則只有本次呼叫的人聚焦。
 * ・對話結束後保留：開啟時關閉文字視窗後仍保留立繪。
 * ・播放動作：開啟後，執行下方選擇的動作。
 * 接著加入「顯示文字」；台詞可只填一般文字，不必重複輸入控制碼。
 * 每句台詞前都可加入一個插件指令，即使使用相同表情也可切換發言者。
 * 對話結束時可呼叫「結束立繪對話（全部退場）」。
 * 
 * 【位置與顯示層級】
 * 可同時顯示最多 8 個位置的立繪。
 * 位置編號由呼叫指令決定，並非角色在清單中的順序。
 * 每個位置都有獨立的水平、垂直座標；所有立繪在同一位置共用相同的定位點。
 * 位置 5～8 也能各自調整，不再連動位置 1～4。
 * 位置 2、4、6、8 會套用「偶數位置的左右翻轉」。
 * 展開外層位置 1～8，可調整水平座標、垂直座標、進退場效果與顯示層級。
 * 選「插入一般圖片之間」時，以「立繪插入層的圖片編號」區分前後。
 * 
 * 【發言聚焦與保留模式】
 * \FH[ON] 開啟保留模式，文字視窗關閉後立繪繼續顯示。
 * 保留模式中，沒有指定 \AA 的對話或指令會沿用上一次的明暗設定。
 * 因此可在插件指令指定發言者，下一個「顯示文字」只填台詞。
 * \AA[R] 或 \AA[0] 讓全部角色恢復明亮；\AA[N] 讓全部角色變暗。
 * \FH[OFF] 關閉保留模式，沿用原本的隱藏行為。
 * 
 * 【控制碼：可選用，不必背誦】
 * 在「顯示文字」或「執行控制碼（文字輸入）」使用：
 * \F1[立繪ID] ～ \F8[立繪ID]：將立繪顯示在指定位置。
 * 例如：\F1[Asai_1]；亦可用變數指定 ID：\F1[\V[1]]。
 * 前四個位置另可使用 \F、\FF、\FFF、\FFFF。
 * \M1[動作代碼] ～ \M8[動作代碼]：播放指定位置的動作。
 * 例如：\M2[jump]；前四個位置另可使用 \M、\MM、\MMM、\MMMM。
 * \AA[1] ～ \AA[8]：聚焦指定位置，其他位置變暗。
 * 前四個位置另可使用 \AA[F]、\AA[FF]、\AA[FFF]、\AA[FFFF]。
 * \AA[N]：全部變暗；\AA[R] 或 \AA[0]：全部恢復明亮。
 * \FH[ON]：開啟對話後保留；\FH[OFF]：關閉保留。
 * 範例：\F2[Shirasaki_1]\AA[2]\FH[ON]\M2[jump]
 * 控制碼中的 ON、OFF 與動作代碼須維持原寫法。
 * 
 * 【動作代碼】
 * yes：點頭一次；yesyes：點頭兩次。
 * no：左右搖晃；noslow：慢速左右搖晃。
 * jump：往上跳一下；jumpjump：連跳兩下。
 * shake：原地震動；shakeloop：持續震動。
 * jumploop：持續跳躍；noslowloop：持續慢速搖晃。
 * huwahuwa：輕微上下漂浮。
 * runleft：向左離場；runright：向右離場。
 * breathing：呼吸效果 1；breathing2：呼吸效果 2。
 * none：停止動作。
 * 只有明確呼叫該位置的動作才會重新播放，不會因其他角色說話而重播。
 * 持續型動作會持續進行，直到該位置被切換、退場或呼叫停止動作。
 * 
 * 【其他插件命令】
 * 立繪顯示開關：暫時隱藏或恢復全部立繪，預設開啟。
 * 立繪色調調整：調整紅、綠、藍與灰階強度；全部設為 0 恢復原色。
 * 
 * 【眨眼動畫】
 * 設定眨眼圖片後會自動播放；不使用時兩張圖片都留空。
 * 播放順序為：眨眼圖片 1 → 眨眼圖片 2 → 原立繪。
 * 只使用一張差分時，僅設定「眨眼圖片 1」。
 * 眨眼圖片的尺寸須與原立繪相同；使用眨眼時不透明度請設為 255。
 * 時間單位為影格，每影格約 1/60 秒。
 * 
 * 【相容與顯示說明】
 * 插件檔名、內部參數名稱、指令名稱、立繪 ID 與儲存值維持相容。
 * 編輯器部分值欄位仍可能顯示 true／false、jump 或其他內部代碼。
 * 這些是原本的設定資料，請使用中文選項編輯即可。
 * 
 * 【原作者使用規約】
 * ・不必標示著作權，也不必回報使用情況。
 * ・可用於商業與非商業作品，成人作品亦無使用限制。
 * ・可依遊戲需求修改。
 * ・禁止作為插件素材再散布，包括修改後的版本。
 * 原作者：Lulu's Church（ルルの教会）
 * 原版日期：2025/1/15；原版版本：2.7.0。
 * 規約網址：https://nine-yusha.com/plugin/
 * 
 *
 * @command showPictureGui
 * @text 顯示／切換立繪（已登錄清單）
 * @desc 從已登錄的個別樣式清單選擇立繪，設定位置、發言、保留與動作。
 *
 * @arg imageName
 * @text 立繪圖片（已登錄清單）
 * @desc 選項來自已儲存的立繪個別樣式；檔名即 ID。修改後請同步並重新整理插件。
 * @type select
 * @jimaPictureOptionsBegin
 * @option （維持此位置目前圖片；首次請選立繪）
 * @value @keep
 * @option Asai_CloseEyes_30
 * @value jima-id:Asai_CloseEyes_30
 * @option Asai_Cold_30
 * @value jima-id:Asai_Cold_30
 * @option Shirasaki_Panic_30
 * @value jima-id:Shirasaki_Panic_30
 * @option Shirasaki_Smile_30
 * @value jima-id:Shirasaki_Smile_30
 * @option Asai_aLittleSurprise_30
 * @value jima-id:Asai_aLittleSurprise_30
 * @option Asai_Angry_30
 * @value jima-id:Asai_Angry_30
 * @option Asai_Confuse_30
 * @value jima-id:Asai_Confuse_30
 * @option asai_Defult_30
 * @value jima-id:asai_Defult_30
 * @option Asai_Defult02_30
 * @value jima-id:Asai_Defult02_30
 * @option Asai_Diffident_30
 * @value jima-id:Asai_Diffident_30
 * @option Asai_Hate_30
 * @value jima-id:Asai_Hate_30
 * @option Asai_Hurt_30
 * @value jima-id:Asai_Hurt_30
 * @option Asai_Identify_30
 * @value jima-id:Asai_Identify_30
 * @option Asai_LittleAngry_30
 * @value jima-id:Asai_LittleAngry_30
 * @option Asai_Mild_30
 * @value jima-id:Asai_Mild_30
 * @option Asai_PlayGame_30
 * @value jima-id:Asai_PlayGame_30
 * @option Asai_Proud_30
 * @value jima-id:Asai_Proud_30
 * @option Asai_Resignedly_30
 * @value jima-id:Asai_Resignedly_30
 * @option Asai_Scare_30
 * @value jima-id:Asai_Scare_30
 * @option Asai_Serious_30
 * @value jima-id:Asai_Serious_30
 * @option Asai_Smile_30
 * @value jima-id:Asai_Smile_30
 * @option Asai_Sneer_30
 * @value jima-id:Asai_Sneer_30
 * @option Asai_Stare_30
 * @value jima-id:Asai_Stare_30
 * @option Asai_Surprise_30
 * @value jima-id:Asai_Surprise_30
 * @option Asai_Think_30
 * @value jima-id:Asai_Think_30
 * @option Asai_Think02_30
 * @value jima-id:Asai_Think02_30
 * @option Asai_ThinkCloseEyes_30
 * @value jima-id:Asai_ThinkCloseEyes_30
 * @option Asai_YaCyatta_30
 * @value jima-id:Asai_YaCyatta_30
 * @option Shirasaki_BadLaugh_Weird_30
 * @value jima-id:Shirasaki_BadLaugh_Weird_30
 * @option Shirasaki_CloseEyes_30
 * @value jima-id:Shirasaki_CloseEyes_30
 * @option Shirasaki_CloseEyesSad_30
 * @value jima-id:Shirasaki_CloseEyesSad_30
 * @option Shirasaki_Cold_01_30
 * @value jima-id:Shirasaki_Cold_01_30
 * @option Shirasaki_Cold_30
 * @value jima-id:Shirasaki_Cold_30
 * @option Shirasaki_Confuse_30
 * @value jima-id:Shirasaki_Confuse_30
 * @option Shirasaki_Defult_02_30
 * @value jima-id:Shirasaki_Defult_02_30
 * @option Shirasaki_Defult_30
 * @value jima-id:Shirasaki_Defult_30
 * @option Shirasaki_Hand_30
 * @value jima-id:Shirasaki_Hand_30
 * @option Shirasaki_Sad_30
 * @value jima-id:Shirasaki_Sad_30
 * @option Shirasaki_Scare_30
 * @value jima-id:Shirasaki_Scare_30
 * @option Shirasaki_SeeDown_30
 * @value jima-id:Shirasaki_SeeDown_30
 * @option Shirasaki_SeeOtherWhere_30
 * @value jima-id:Shirasaki_SeeOtherWhere_30
 * @option Shirasaki_Serious_30
 * @value jima-id:Shirasaki_Serious_30
 * @option Shirasaki_SeriousCloseEyes_30
 * @value jima-id:Shirasaki_SeriousCloseEyes_30
 * @option Shirasaki_Smile_Cut_30
 * @value jima-id:Shirasaki_Smile_Cut_30
 * @option Shirasaki_Surprise_30
 * @value jima-id:Shirasaki_Surprise_30
 * @option Shirasaki_Talk_Weird_30
 * @value jima-id:Shirasaki_Talk_Weird_30
 * @option Shirasaki_Tender_Cut_30
 * @value jima-id:Shirasaki_Tender_Cut_30
 * @option Shirasaki_Think_30
 * @value jima-id:Shirasaki_Think_30
 * @option Shirasaki_TouchFace_Cut_30
 * @value jima-id:Shirasaki_TouchFace_Cut_30
 * @option Shirasaki_Troubled_30
 * @value jima-id:Shirasaki_Troubled_30
 * @option Shirasaki_VeryScare_30
 * @value jima-id:Shirasaki_VeryScare_30
 * @option Shirasaki_WillCry_30
 * @value jima-id:Shirasaki_WillCry_30
 * @option Shirasaki_WrySmile_30
 * @value jima-id:Shirasaki_WrySmile_30
 * @option Shirasaki_YaCyatta_30
 * @value jima-id:Shirasaki_YaCyatta_30
 * @option 0_0_C_Anyway_30
 * @value jima-id:0_0_C_Anyway_30
 * @option 0_0_C_BlackSmile_30
 * @value jima-id:0_0_C_BlackSmile_30
 * @option 0_0_C_CloseEyesFUFU_30
 * @value jima-id:0_0_C_CloseEyesFUFU_30
 * @option 0_0_C_CloseEyesSerious_30
 * @value jima-id:0_0_C_CloseEyesSerious_30
 * @option 0_0_C_Cute_30
 * @value jima-id:0_0_C_Cute_30
 * @option 0_0_C_Default_30
 * @value jima-id:0_0_C_Default_30
 * @option 0_0_C_HAHA_30
 * @value jima-id:0_0_C_HAHA_30
 * @option 0_0_C_HEHE_30
 * @value jima-id:0_0_C_HEHE_30
 * @option 0_0_C_Kirakira_30
 * @value jima-id:0_0_C_Kirakira_30
 * @option 0_0_C_NoHAHA_30
 * @value jima-id:0_0_C_NoHAHA_30
 * @option 0_0_C_Serious_30
 * @value jima-id:0_0_C_Serious_30
 * @option 0_0_C_SeriousHA_30
 * @value jima-id:0_0_C_SeriousHA_30
 * @option 0_0_C_Smile_30
 * @value jima-id:0_0_C_Smile_30
 * @option 0_0_C_Smile2_30
 * @value jima-id:0_0_C_Smile2_30
 * @option 0_0_C_SoWhat_30
 * @value jima-id:0_0_C_SoWhat_30
 * @option 0_0_C_Surprise_30
 * @value jima-id:0_0_C_Surprise_30
 * @option 0_0_C_Surprise2_30
 * @value jima-id:0_0_C_Surprise2_30
 * @option 0_0_C_Think_30
 * @value jima-id:0_0_C_Think_30
 * @option 0_0_C_Think2_30
 * @value jima-id:0_0_C_Think2_30
 * @option 0_0_C_XD_30
 * @value jima-id:0_0_C_XD_30
 * @option 0_0_C_XD_Good_30
 * @value jima-id:0_0_C_XD_Good_30
 * @option 0_0_C_XD_V_30
 * @value jima-id:0_0_C_XD_V_30
 * @jimaPictureOptionsEnd
 * @default @keep
 *
 * @arg slot
 * @text 顯示位置
 * @desc 對應外層位置 1～8；所有立繪都使用所選位置的共用座標。
 * @type select
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default 1
 *
 * @arg show
 * @text 顯示立繪
 * @desc 開啟時顯示或切換此位置的立繪；關閉時僅讓此位置退場，不執行其他欄位。
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：此位置退場
 * @default true
 *
 * @arg focus
 * @text 此角色發言聚焦
 * @desc 開啟時此角色與額外指定位置明亮，未選的人變暗；關閉時全員明亮。顯示立繪時適用。
 * @type boolean
 * @on 開啟：此人與額外位置聚焦
 * @off 關閉：全部明亮
 * @default true
 *
 * @arg extraFocusSlots
 * @text 額外一起聚焦的位置
 * @desc 此角色發言聚焦開啟時生效。逐筆選取其他已顯示的位置；留空維持單人聚焦，每次呼叫重新指定。
 * @type select[]
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default []
 *
 * @arg hold
 * @text 對話結束後保留
 * @desc 開啟時關閉文字視窗後仍保留立繪；關閉時隨文字視窗退場。顯示立繪時適用。
 * @type boolean
 * @on 開啟：保留
 * @off 關閉：隨文字視窗退場
 * @default true
 *
 * @arg exitBeforeShow
 * @text 更換前先退場
 * @desc 開啟時先讓此位置的舊立繪退場，再依插件設定的等待幀數顯示新立繪；換表情請關閉。
 * @type boolean
 * @on 開啟：先退場再進場
 * @off 關閉：直接換圖
 * @default false
 *
 * @arg motionEnabled
 * @text 播放動作
 * @desc 開啟時播放下方選擇的動作；關閉時不播放。顯示立繪時適用。
 * @type boolean
 * @on 開啟：播放動作
 * @off 關閉：不播放
 * @default false
 *
 * @arg motion
 * @text 動作種類
 * @desc 「播放動作」開啟時才會執行；一次選擇一種動作，且只操作所選位置。
 * @type select
 * @option 往上跳一下
 * @value jump
 * @option 連跳兩下
 * @value jumpjump
 * @option 原地震動
 * @value shake
 * @option 點頭一次
 * @value yes
 * @option 點頭兩次
 * @value yesyes
 * @option 左右搖晃
 * @value no
 * @option 慢速左右搖晃
 * @value noslow
 * @option 持續跳躍
 * @value jumploop
 * @option 持續震動
 * @value shakeloop
 * @option 持續慢速搖晃
 * @value noslowloop
 * @option 輕微上下漂浮
 * @value huwahuwa
 * @option 向左離場
 * @value runleft
 * @option 向右離場
 * @value runright
 * @option 呼吸效果 1
 * @value breathing
 * @option 呼吸效果 2
 * @value breathing2
 * @option 停止動作
 * @value none
 * @default jump
 *
 * @command showPictureFileGui
 * @text 顯示／切換立繪（直接選圖）
 * @desc 從 jima_tool 直接選圖；已登錄沿用原設定，未登錄套用第一筆樣式。
 *
 * @arg imageName
 * @text 立繪圖片（直接選取）
 * @desc 直接選取 img/pictures 的 PNG。未登錄圖片套用第一筆縮放等樣式；留空維持目前圖片。
 * @type file
 * @dir img/pictures/jima_tool
 * @default
 *
 * @arg slot
 * @text 顯示位置
 * @desc 對應外層位置 1～8；所有立繪都使用所選位置的共用座標。
 * @type select
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default 1
 *
 * @arg show
 * @text 顯示立繪
 * @desc 開啟時顯示或切換此位置的立繪；關閉時僅讓此位置退場，不執行其他欄位。
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：此位置退場
 * @default true
 *
 * @arg focus
 * @text 此角色發言聚焦
 * @desc 開啟時此角色與額外指定位置明亮，未選的人變暗；關閉時全員明亮。顯示立繪時適用。
 * @type boolean
 * @on 開啟：此人與額外位置聚焦
 * @off 關閉：全部明亮
 * @default true
 *
 * @arg extraFocusSlots
 * @text 額外一起聚焦的位置
 * @desc 此角色發言聚焦開啟時生效。逐筆選取其他已顯示的位置；留空維持單人聚焦，每次呼叫重新指定。
 * @type select[]
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default []
 *
 * @arg hold
 * @text 對話結束後保留
 * @desc 開啟時關閉文字視窗後仍保留立繪；關閉時隨文字視窗退場。顯示立繪時適用。
 * @type boolean
 * @on 開啟：保留
 * @off 關閉：隨文字視窗退場
 * @default true
 *
 * @arg exitBeforeShow
 * @text 更換前先退場
 * @desc 開啟時先讓此位置的舊立繪退場，再依插件設定的等待幀數顯示新立繪；換表情請關閉。
 * @type boolean
 * @on 開啟：先退場再進場
 * @off 關閉：直接換圖
 * @default false
 *
 * @arg motionEnabled
 * @text 播放動作
 * @desc 開啟時播放下方選擇的動作；關閉時不播放。顯示立繪時適用。
 * @type boolean
 * @on 開啟：播放動作
 * @off 關閉：不播放
 * @default false
 *
 * @arg motion
 * @text 動作種類
 * @desc 「播放動作」開啟時才會執行；一次選擇一種動作，且只操作所選位置。
 * @type select
 * @option 往上跳一下
 * @value jump
 * @option 連跳兩下
 * @value jumpjump
 * @option 原地震動
 * @value shake
 * @option 點頭一次
 * @value yes
 * @option 點頭兩次
 * @value yesyes
 * @option 左右搖晃
 * @value no
 * @option 慢速左右搖晃
 * @value noslow
 * @option 持續跳躍
 * @value jumploop
 * @option 持續震動
 * @value shakeloop
 * @option 持續慢速搖晃
 * @value noslowloop
 * @option 輕微上下漂浮
 * @value huwahuwa
 * @option 向左離場
 * @value runleft
 * @option 向右離場
 * @value runright
 * @option 呼吸效果 1
 * @value breathing
 * @option 呼吸效果 2
 * @value breathing2
 * @option 停止動作
 * @value none
 * @default jump
 *
 * @command endDialogueGui
 * @text 結束立繪對話（全部退場）
 * @desc 全部立繪依各位置的退場效果隱藏，並關閉保留模式。
 *
 * @command syncPictureMenu
 * @text 更新已登錄下拉選單（本機試玩用）
 * @desc 本機試玩限定；按已儲存的登錄清單更新選項。儲存後自動同步請開專用工具。
 *
 * @command processChar
 * @text 執行控制碼（文字輸入）
 * @desc 輸入控制碼操作立繪；一般事件請使用「顯示／切換立繪（已登錄清單）」。
 *
 * @arg text
 * @text 控制碼
 * @desc 例如顯示：\F1[Asai_1]\AA[1]\FH[ON]；全部退場：\FH[OFF]。
 * @type multiline_string
 *
 * @command setEnabled
 * @text 立繪顯示開關
 * @desc 切換全部立繪的顯示狀態；關閉時暫時隱藏，開啟時恢復顯示。
 *
 * @arg enabled
 * @text 顯示立繪
 * @desc 開啟時顯示立繪，關閉時暫時隱藏全部立繪。
 * @default true
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：隱藏
 *
 * @command setTone
 * @text 立繪色調調整
 * @desc 調整全部立繪的紅、綠、藍與灰階色調；全部設為 0 可恢復原色。
 *
 * @arg toneR
 * @text 紅色
 * @desc 紅色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneG
 * @text 綠色
 * @desc 綠色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneB
 * @text 藍色
 * @desc 藍色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneC
 * @text 灰階強度
 * @desc 灰階強度，範圍 0～255；0 為原色，255 為完全灰階。
 * @default 0
 * @type number
 * @min 0
 * @max 255
 *
 * @param sPictures
 * @text 立繪個別樣式（ID 自動使用檔名）
 * @desc 從 jima_tool 登錄圖片與個別樣式；ID 使用檔名。儲存後由同步工具更新事件選項。
 * @default []
 * @type struct<sPictures>[]
 *
 * @param slotSettings1
 * @text 位置 1（\F1 或 \F）
 * @desc 位置 1 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX1
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 1 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 464
 * @parent slotSettings1
 *
 * @param slotY1
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 1 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings1
 *
 * @param transition
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings1
 *
 * @param priority
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings1
 *
 * @param slotSettings2
 * @text 位置 2（\F2 或 \FF）
 * @desc 位置 2 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX2
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 2 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 20
 * @parent slotSettings2
 *
 * @param slotY2
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 2 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings2
 *
 * @param transition2
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings2
 *
 * @param priority2
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings2
 *
 * @param slotSettings3
 * @text 位置 3（\F3 或 \FFF）
 * @desc 位置 3 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX3
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 3 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 364
 * @parent slotSettings3
 *
 * @param slotY3
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 3 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings3
 *
 * @param transition3
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings3
 *
 * @param priority3
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings3
 *
 * @param slotSettings4
 * @text 位置 4（\F4 或 \FFFF）
 * @desc 位置 4 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX4
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 4 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 120
 * @parent slotSettings4
 *
 * @param slotY4
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 4 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings4
 *
 * @param transition4
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings4
 *
 * @param priority4
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings4
 *
 * @param slotSettings5
 * @text 位置 5（\F5）
 * @desc 位置 5 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX5
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 5 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 464
 * @parent slotSettings5
 *
 * @param slotY5
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 5 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings5
 *
 * @param transition5
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings5
 *
 * @param priority5
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings5
 *
 * @param slotSettings6
 * @text 位置 6（\F6）
 * @desc 位置 6 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX6
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 6 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 20
 * @parent slotSettings6
 *
 * @param slotY6
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 6 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings6
 *
 * @param transition6
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings6
 *
 * @param priority6
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings6
 *
 * @param slotSettings7
 * @text 位置 7（\F7）
 * @desc 位置 7 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX7
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 7 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 364
 * @parent slotSettings7
 *
 * @param slotY7
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 7 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings7
 *
 * @param transition7
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings7
 *
 * @param priority7
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings7
 *
 * @param slotSettings8
 * @text 位置 8（\F8）
 * @desc 位置 8 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX8
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 8 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 120
 * @parent slotSettings8
 *
 * @param slotY8
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 8 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings8
 *
 * @param transition8
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings8
 *
 * @param priority8
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings8
 *
 * @param blinkSettings
 * @text 眨眼動畫設定
 * @desc 眨眼動畫的分類標題；請展開下方設定。
 *
 * @param blinkInterval
 * @text 眨眼間隔（影格）
 * @desc 兩次眨眼之間的平均影格數。每影格約 1/60 秒；預設 180，約 3 秒。
 * @default 180
 * @min 1
 * @max 2000
 * @type number
 * @parent blinkSettings
 *
 * @param blinkWaitCount
 * @text 眨眼持續時間（影格）
 * @desc 眨眼圖片的顯示影格數。每影格約 1/60 秒；預設 4，數值越大閉眼越久。
 * @default 4
 * @min 1
 * @max 2000
 * @type number
 * @parent blinkSettings
 *
 * @param globalScale
 * @text 所有立繪共用縮放比（%）
 * @desc 共用外部縮放的立繪，水平與垂直都直接使用此比例；100 為原圖大小，不與個別數值相乘。
 * @type number
 * @min 0
 * @max 2000
 * @decimals 0
 * @default 100
 *
 * @param switchWaitFrames
 * @text 更換前退場等待（幀）
 * @desc 指令開啟「更換前先退場」時，先等待此幀數再顯示新立繪；0 會立即重新進場。
 * @type number
 * @min 0
 * @max 600
 * @decimals 0
 * @default 20
 *
 * @param focusShrinkEnabled
 * @text 未發言角色縮小
 * @desc 開啟時未發言角色會變暗並縮小，再次發言時恢復；大小與明暗共用下方動畫幀數。
 * @type boolean
 * @on 開啟：縮小與明暗動畫
 * @off 關閉：沿用即時變暗
 * @default false
 *
 * @param focusShrinkPercent
 * @text 未發言縮小幅度（%）
 * @parent focusShrinkEnabled
 * @desc 縮小多少百分比：10 代表保留原大小 90%；以立繪原本的水平、垂直縮放為基準。
 * @type number
 * @min 0
 * @max 100
 * @decimals 0
 * @default 10
 *
 * @param focusEffectFrames
 * @text 聚焦變化時間（幀）
 * @parent focusShrinkEnabled
 * @desc 未發言時縮小與變暗、再次發言時恢復大小與亮度，共用此時間；0 為立即切換。
 * @type number
 * @min 0
 * @max 600
 * @decimals 0
 * @default 20
 *
 * @param focusToneAdjust
 * @text 未發言角色的變暗程度
 * @desc 發言聚焦時其他角色的明暗值，範圍 -255～0；越小越暗，0 不變暗，預設 -96。
 * @default -96
 * @min -255
 * @max 0
 * @type number
 *
 * @param betweenPicturesPriority
 * @text 立繪插入層的圖片編號
 * @desc 僅「插入一般圖片之間」時有效；編號大於此值的一般圖片會蓋在立繪上方。
 * @default 50
 * @min 0
 * @max 100
 * @type number
 *
 * @param bootCachePictures
 * @text 預先載入立繪圖片
 * @desc 開啟時預先載入圖片，減少遊戲中等待；圖片數量多或檔案較大時可關閉。
 * @default true
 * @type boolean
 * @on 開啟：預先載入
 * @off 關閉：需要時載入
 */

/*~struct~sPictures:
 *
 * @param imageName
 * @text 立繪圖片（檔名即 ID）
 * @desc 直接從 img/pictures/jima_tool 選 PNG，檔名自動作為 ID。
 * @type file
 * @dir img/pictures/jima_tool
 *
 * @param imageNameBlink
 * @text 眨眼圖片 1（選填）
 * @desc 選擇第一張眨眼差分圖片；尺寸須與立繪圖片相同，不使用眨眼時請留空。
 * @dir img/pictures/jima_tool
 * @type file
 * @require 1
 *
 * @param imageNameBlink2
 * @text 眨眼圖片 2（選填）
 * @desc 選擇第二張眨眼差分圖片；尺寸須與立繪圖片相同，只用一張差分時請留空。
 * @dir img/pictures/jima_tool
 * @type file
 * @require 1
 *
 * @param origin
 * @text 定位原點
 * @desc 指定座標對齊圖片的左上角或中心；放大、縮小時也會依此定位。
 * @default 0
 * @type select
 * @option 左上角
 * @value 0
 * @option 圖片中心
 * @value 1
 *
 * @param reverse
 * @text 偶數位置的左右翻轉
 * @desc 位置 2、4、6、8 使用此設定；選擇是否將立繪左右翻轉。
 * @default 1
 * @type select
 * @option 維持原方向
 * @value 1
 * @option 左右翻轉
 * @value -1
 *
 * @param useGlobalScale
 * @text 是否共用外部縮放比
 * @desc 是：使用外部的所有立繪共用縮放比；否：使用下方本筆水平、垂直縮放。個別數值不會被清除。
 * @type boolean
 * @on 是：使用共用縮放
 * @off 否：使用本筆縮放
 * @default true
 *
 * @param scaleX
 * @text 水平縮放（％）
 * @desc 是否共用外部縮放比設為否時生效；100 為原尺寸、150 為 1.5 倍、200 為 2 倍。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text 垂直縮放（％）
 * @desc 是否共用外部縮放比設為否時生效；100 為原尺寸、150 為 1.5 倍、200 為 2 倍。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param opacity
 * @text 不透明度
 * @desc 範圍 0～255；0 完全透明、255 完全不透明。使用眨眼圖片時請設為 255。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @param blendMode
 * @text 混合模式
 * @desc 設定立繪與下方畫面的顏色混合方式；一般立繪使用「一般」。
 * @default 0
 * @type select
 * @option 一般
 * @value 0
 * @option 加法混合（提亮）
 * @value 1
 * @option 色彩增值（變暗）
 * @value 2
 * @option 濾色（提亮）
 * @value 3
 */

/*~struct~pictureSettings:
 *
 * @param transition
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 *
 * @param priority
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 */

/*:ja
 * @target MZ
 * @plugindesc [Jima v1.6.0] 立繪選單、多人聚焦、批次登錄與共用縮放。
 * @author Jima
 * @url https://nine-yusha.com/plugin-spicture/
 *
 * @jimaAssetsBegin
 * @jimaAssetsEnd
 *
 * @help Jima_StandingPicture.js
 * 
 * Jima 立繪操作介面 v1.6.0（2026-11-21）
 * 位置 1～8 各自設定共用的水平、垂直座標，所有立繪依呼叫位置定位。
 * 沿用發言聚焦保留與動作僅影響指定位置的修正。
 * 
 * 【插件更名 v1.6.0】
 * 本客製版作者顯示為 Jima，插件檔名為 Jima_StandingPicture.js。
 * 以 Lulu's Church 的 LL_StandingPicture.js v2.7.0 為基礎修改，保留原始來源與規約註記。
 * 儲存並關閉 MZ，覆蓋此包後，執行 JIMA_StandingPictureRegisterSync.cmd。
 * 工具會保留原插件設定，改用新名稱，並更新地圖、公共事件、戰鬥事件的插件呼叫名稱。
 * 只更換插件名稱，不變更立繪 ID、台詞或其他事件指令；完成後重開專案。
 * 舊存檔的內部立繪欄位與舊呼叫別名會保留，不需重建事件。
 * 請只啟用 Jima_StandingPicture，不要另行啟用原版 LL_StandingPicture。
 *
 * 【多人同時發言聚焦 v1.5.0】
 * 在「顯示／切換立繪」開啟「此角色發言聚焦」，並於
 * 「額外一起聚焦的位置」逐筆選取其他位置 1～8。
 * 例如呼叫位置 3、額外選位置 1，位置 1 與 3 會同時恢復正常亮度與大小。
 * 未選的位置會變暗；若已開啟未發言角色縮小，也會依設定縮小。
 * 大小以共用／個別縮放為基準，時間沿用「聚焦變化時間（幀）」。
 * 額外位置的立繪請先顯示並保留；此欄位只設定其聚焦，不切圖或重播動作。
 * 每次呼叫都重新指定整組聚焦；下一句只由一人說話時，額外清單留空。
 * 在保留模式下，後續純文字台詞會沿用這組聚焦，直到下一次指定。
 * 此角色發言聚焦關閉時維持全員明亮，忽略額外清單；隱藏指令也忽略此欄位。
 * 舊事件沒有此欄位時視為空清單，維持原本單人聚焦。
 *
 * 【批次登錄與共用縮放 v1.4.0】
 * 儲存並關閉 MZ 與清單同步工具後，執行專案根目錄的
 * JIMA_StandingPictureRegisterSync.cmd。
 * 固定讀取 img/pictures/jima_tool 這一層的 PNG，不包含子資料夾。
 * 同名圖片保留全部既有設定；新增圖使用預設值；缺圖的登錄會移除。
 * 目錄不存在、沒有 PNG 或讀取失敗時停止，不改寫既有清單。
 * 批次程式同時更新事件下拉選項，不建立備份，也不修改舊事件指向。
 * 完成後重開專案；手動登錄的同步方式與即時預覽沿用原有工具。
 *
 * 「所有立繪共用縮放比（%）」預設 100，水平、垂直使用相同百分比。
 * 每筆立繪的「是否共用外部縮放比」預設是，包含未填此欄位的舊立繪。
 * 共用時直接使用外部數值，不與個別縮放相乘；原本個別數值仍保留。
 * 改成否後，才使用該筆的水平、垂直縮放。
 * 未發言縮小效果會在所選的共用／個別基準上套用，恢復時也回到此基準。
 *
 * 【換人進退場 v1.3.0】
 * 在「顯示／切換立繪」開啟「更換前先退場」，目前位置有人時，
 * 會讓原立繪退場，等待插件設定的幀數後，再讓新立繪進場。
 * 「更換前退場等待（幀）」預設 20；事件會自動等待，不需另外加等待指令。
 * 首次顯示或目前位置已完全隱藏時直接進場。
 * 此開關由每句指令自行決定：換表情關閉，換角色時開啟。
 * 即使圖片相同，開啟也會重新進場；不會用檔名猜測角色身分。
 * 等待值控制新圖開始顯示的時機；原本進退場速度不變。
 * 若設定少於原退場時間，會在等待結束時結束退場；0 為立即重新進場。
 *
 * 【未發言角色縮小 v1.3.0】
 * 插件設定的「未發言角色縮小」預設關閉，開啟後套用縮放與明暗動畫。
 * 「未發言縮小幅度（%）」預設 10，表示縮小 10%（保留原大小 90%）。
 * 比例以各立繪既有的水平、垂直縮放為基準，並保持腳底中心的位置。
 * 「聚焦變化時間（幀）」預設 20；縮小、恢復大小與明暗共用此時間。
 * 換成他發言時，自動回到原大小與正常亮度；0 幀為立即切換。
 * \AA[N] 對全部角色套用未發言效果；\AA[R] 或 \AA[0] 恢復全部。
 * 關閉縮小開關時，維持前版即時變暗的行為。
 *
 * 【已登錄立繪下拉選單】
 * 在「立繪個別樣式」從 img/pictures/jima_tool 選擇 PNG 並設定樣式。
 * 圖片 ID 直接使用檔名，不含最後的 .png；不必另外輸入 ID。
 * 事件請選「顯示／切換立繪（已登錄清單）」。
 * 下拉選單只列出已登錄的圖片，並套用該筆縮放、原點與眨眼等設定。
 * 資料夾內未登錄的圖片不會自動加入；空白登錄列不列出。
 * 新增、移除或修改登錄後，逐層按確定，再 Ctrl+S 儲存專案。
 *
 * 【儲存後自動同步】
 * 編輯前開啟專案根目錄的 JIMA_StandingPictureSync.cmd。
 * 在工具中選擇專案根目錄並保持視窗開啟，儲存後約 1～2 秒更新選項。
 * 工具只讀取已儲存的登錄清單，不掃描圖片，也不修改個別樣式或專案參數。
 * 更新後到 MZ 插件管理器對本插件按右鍵「重新整理／Refresh」，
 * 再關閉並重新開啟插件命令參數視窗；仍是舊選項時請重開專案。
 * MZ 原生視窗的確定／關閉按鈕沒有供遊戲插件使用的編輯器回呼。
 * 因此以實際存檔為同步時機，不會讀取尚未儲存的修改。
 * 未開工具時，本機試玩啟動會補同步一次；之後仍需 MZ 重新讀取選項。
 * 試玩補同步限本機 NW.js 測試模式，正式遊戲與網頁遊戲不改寫檔案。
 * 首次改寫會備份插件為 Jima_StandingPicture.js.jima-registered-sync.bak。
 * 安裝時請先關閉舊版「圖片資料夾／清單同步」工具，避免互相改寫選項。
 *
 * 【舊座標設定轉換（v1.1.6）】
 * 尚未轉換舊座標的專案，請先本機試玩一次，再重新開啟專案與插件管理器。
 * 首次轉換會採用立繪登錄清單第一筆的舊座標，建立八個位置的共用座標。
 * 位置 5～8 初始分別複製舊位置 1～4 的座標，之後可獨立調整。
 * 同時保留舊進退場與層級設定，清理分類標題旁的舊結構文字。
 * 轉換前會備份 js/plugins.js 為 js/plugins.js.jima-shared-slots-v1.1.6.bak。
 * 只有本機試玩會轉換；正式遊戲與網頁版僅讀取設定，不改寫檔案。
 *
 * 【用插件指令安排對話】
 * 在事件的「插件命令」選擇「顯示／切換立繪（已登錄清單）」：
 * ・立繪圖片：從下拉選單選擇已登錄的圖片（檔名即 ID）。
 * ・顯示位置：選擇位置 1～8。
 * ・顯示立繪：開啟時顯示；關閉時只讓該位置退場。
 * ・此角色發言聚焦：開啟時此人與額外指定的位置明亮，未選的人變暗。
 * ・額外一起聚焦的位置：清單中逐筆選取其他位置；留空則只有本次呼叫的人聚焦。
 * ・對話結束後保留：開啟時關閉文字視窗後仍保留立繪。
 * ・播放動作：開啟後，執行下方選擇的動作。
 * 接著加入「顯示文字」；台詞可只填一般文字，不必重複輸入控制碼。
 * 每句台詞前都可加入一個插件指令，即使使用相同表情也可切換發言者。
 * 對話結束時可呼叫「結束立繪對話（全部退場）」。
 * 
 * 【位置與顯示層級】
 * 可同時顯示最多 8 個位置的立繪。
 * 位置編號由呼叫指令決定，並非角色在清單中的順序。
 * 每個位置都有獨立的水平、垂直座標；所有立繪在同一位置共用相同的定位點。
 * 位置 5～8 也能各自調整，不再連動位置 1～4。
 * 位置 2、4、6、8 會套用「偶數位置的左右翻轉」。
 * 展開外層位置 1～8，可調整水平座標、垂直座標、進退場效果與顯示層級。
 * 選「插入一般圖片之間」時，以「立繪插入層的圖片編號」區分前後。
 * 
 * 【發言聚焦與保留模式】
 * \FH[ON] 開啟保留模式，文字視窗關閉後立繪繼續顯示。
 * 保留模式中，沒有指定 \AA 的對話或指令會沿用上一次的明暗設定。
 * 因此可在插件指令指定發言者，下一個「顯示文字」只填台詞。
 * \AA[R] 或 \AA[0] 讓全部角色恢復明亮；\AA[N] 讓全部角色變暗。
 * \FH[OFF] 關閉保留模式，沿用原本的隱藏行為。
 * 
 * 【控制碼：可選用，不必背誦】
 * 在「顯示文字」或「執行控制碼（文字輸入）」使用：
 * \F1[立繪ID] ～ \F8[立繪ID]：將立繪顯示在指定位置。
 * 例如：\F1[Asai_1]；亦可用變數指定 ID：\F1[\V[1]]。
 * 前四個位置另可使用 \F、\FF、\FFF、\FFFF。
 * \M1[動作代碼] ～ \M8[動作代碼]：播放指定位置的動作。
 * 例如：\M2[jump]；前四個位置另可使用 \M、\MM、\MMM、\MMMM。
 * \AA[1] ～ \AA[8]：聚焦指定位置，其他位置變暗。
 * 前四個位置另可使用 \AA[F]、\AA[FF]、\AA[FFF]、\AA[FFFF]。
 * \AA[N]：全部變暗；\AA[R] 或 \AA[0]：全部恢復明亮。
 * \FH[ON]：開啟對話後保留；\FH[OFF]：關閉保留。
 * 範例：\F2[Shirasaki_1]\AA[2]\FH[ON]\M2[jump]
 * 控制碼中的 ON、OFF 與動作代碼須維持原寫法。
 * 
 * 【動作代碼】
 * yes：點頭一次；yesyes：點頭兩次。
 * no：左右搖晃；noslow：慢速左右搖晃。
 * jump：往上跳一下；jumpjump：連跳兩下。
 * shake：原地震動；shakeloop：持續震動。
 * jumploop：持續跳躍；noslowloop：持續慢速搖晃。
 * huwahuwa：輕微上下漂浮。
 * runleft：向左離場；runright：向右離場。
 * breathing：呼吸效果 1；breathing2：呼吸效果 2。
 * none：停止動作。
 * 只有明確呼叫該位置的動作才會重新播放，不會因其他角色說話而重播。
 * 持續型動作會持續進行，直到該位置被切換、退場或呼叫停止動作。
 * 
 * 【其他插件命令】
 * 立繪顯示開關：暫時隱藏或恢復全部立繪，預設開啟。
 * 立繪色調調整：調整紅、綠、藍與灰階強度；全部設為 0 恢復原色。
 * 
 * 【眨眼動畫】
 * 設定眨眼圖片後會自動播放；不使用時兩張圖片都留空。
 * 播放順序為：眨眼圖片 1 → 眨眼圖片 2 → 原立繪。
 * 只使用一張差分時，僅設定「眨眼圖片 1」。
 * 眨眼圖片的尺寸須與原立繪相同；使用眨眼時不透明度請設為 255。
 * 時間單位為影格，每影格約 1/60 秒。
 * 
 * 【相容與顯示說明】
 * 插件檔名、內部參數名稱、指令名稱、立繪 ID 與儲存值維持相容。
 * 編輯器部分值欄位仍可能顯示 true／false、jump 或其他內部代碼。
 * 這些是原本的設定資料，請使用中文選項編輯即可。
 * 
 * 【原作者使用規約】
 * ・不必標示著作權，也不必回報使用情況。
 * ・可用於商業與非商業作品，成人作品亦無使用限制。
 * ・可依遊戲需求修改。
 * ・禁止作為插件素材再散布，包括修改後的版本。
 * 原作者：Lulu's Church（ルルの教会）
 * 原版日期：2025/1/15；原版版本：2.7.0。
 * 規約網址：https://nine-yusha.com/plugin/
 * 
 *
 * @command showPictureGui
 * @text 顯示／切換立繪（已登錄清單）
 * @desc 從已登錄的個別樣式清單選擇立繪，設定位置、發言、保留與動作。
 *
 * @arg imageName
 * @text 立繪圖片（已登錄清單）
 * @desc 選項來自已儲存的立繪個別樣式；檔名即 ID。修改後請同步並重新整理插件。
 * @type select
 * @jimaPictureOptionsBegin
 * @option （維持此位置目前圖片；首次請選立繪）
 * @value @keep
 * @option Asai_CloseEyes_30
 * @value jima-id:Asai_CloseEyes_30
 * @option Asai_Cold_30
 * @value jima-id:Asai_Cold_30
 * @option Shirasaki_Panic_30
 * @value jima-id:Shirasaki_Panic_30
 * @option Shirasaki_Smile_30
 * @value jima-id:Shirasaki_Smile_30
 * @option Asai_aLittleSurprise_30
 * @value jima-id:Asai_aLittleSurprise_30
 * @option Asai_Angry_30
 * @value jima-id:Asai_Angry_30
 * @option Asai_Confuse_30
 * @value jima-id:Asai_Confuse_30
 * @option asai_Defult_30
 * @value jima-id:asai_Defult_30
 * @option Asai_Defult02_30
 * @value jima-id:Asai_Defult02_30
 * @option Asai_Diffident_30
 * @value jima-id:Asai_Diffident_30
 * @option Asai_Hate_30
 * @value jima-id:Asai_Hate_30
 * @option Asai_Hurt_30
 * @value jima-id:Asai_Hurt_30
 * @option Asai_Identify_30
 * @value jima-id:Asai_Identify_30
 * @option Asai_LittleAngry_30
 * @value jima-id:Asai_LittleAngry_30
 * @option Asai_Mild_30
 * @value jima-id:Asai_Mild_30
 * @option Asai_PlayGame_30
 * @value jima-id:Asai_PlayGame_30
 * @option Asai_Proud_30
 * @value jima-id:Asai_Proud_30
 * @option Asai_Resignedly_30
 * @value jima-id:Asai_Resignedly_30
 * @option Asai_Scare_30
 * @value jima-id:Asai_Scare_30
 * @option Asai_Serious_30
 * @value jima-id:Asai_Serious_30
 * @option Asai_Smile_30
 * @value jima-id:Asai_Smile_30
 * @option Asai_Sneer_30
 * @value jima-id:Asai_Sneer_30
 * @option Asai_Stare_30
 * @value jima-id:Asai_Stare_30
 * @option Asai_Surprise_30
 * @value jima-id:Asai_Surprise_30
 * @option Asai_Think_30
 * @value jima-id:Asai_Think_30
 * @option Asai_Think02_30
 * @value jima-id:Asai_Think02_30
 * @option Asai_ThinkCloseEyes_30
 * @value jima-id:Asai_ThinkCloseEyes_30
 * @option Asai_YaCyatta_30
 * @value jima-id:Asai_YaCyatta_30
 * @option Shirasaki_BadLaugh_Weird_30
 * @value jima-id:Shirasaki_BadLaugh_Weird_30
 * @option Shirasaki_CloseEyes_30
 * @value jima-id:Shirasaki_CloseEyes_30
 * @option Shirasaki_CloseEyesSad_30
 * @value jima-id:Shirasaki_CloseEyesSad_30
 * @option Shirasaki_Cold_01_30
 * @value jima-id:Shirasaki_Cold_01_30
 * @option Shirasaki_Cold_30
 * @value jima-id:Shirasaki_Cold_30
 * @option Shirasaki_Confuse_30
 * @value jima-id:Shirasaki_Confuse_30
 * @option Shirasaki_Defult_02_30
 * @value jima-id:Shirasaki_Defult_02_30
 * @option Shirasaki_Defult_30
 * @value jima-id:Shirasaki_Defult_30
 * @option Shirasaki_Hand_30
 * @value jima-id:Shirasaki_Hand_30
 * @option Shirasaki_Sad_30
 * @value jima-id:Shirasaki_Sad_30
 * @option Shirasaki_Scare_30
 * @value jima-id:Shirasaki_Scare_30
 * @option Shirasaki_SeeDown_30
 * @value jima-id:Shirasaki_SeeDown_30
 * @option Shirasaki_SeeOtherWhere_30
 * @value jima-id:Shirasaki_SeeOtherWhere_30
 * @option Shirasaki_Serious_30
 * @value jima-id:Shirasaki_Serious_30
 * @option Shirasaki_SeriousCloseEyes_30
 * @value jima-id:Shirasaki_SeriousCloseEyes_30
 * @option Shirasaki_Smile_Cut_30
 * @value jima-id:Shirasaki_Smile_Cut_30
 * @option Shirasaki_Surprise_30
 * @value jima-id:Shirasaki_Surprise_30
 * @option Shirasaki_Talk_Weird_30
 * @value jima-id:Shirasaki_Talk_Weird_30
 * @option Shirasaki_Tender_Cut_30
 * @value jima-id:Shirasaki_Tender_Cut_30
 * @option Shirasaki_Think_30
 * @value jima-id:Shirasaki_Think_30
 * @option Shirasaki_TouchFace_Cut_30
 * @value jima-id:Shirasaki_TouchFace_Cut_30
 * @option Shirasaki_Troubled_30
 * @value jima-id:Shirasaki_Troubled_30
 * @option Shirasaki_VeryScare_30
 * @value jima-id:Shirasaki_VeryScare_30
 * @option Shirasaki_WillCry_30
 * @value jima-id:Shirasaki_WillCry_30
 * @option Shirasaki_WrySmile_30
 * @value jima-id:Shirasaki_WrySmile_30
 * @option Shirasaki_YaCyatta_30
 * @value jima-id:Shirasaki_YaCyatta_30
 * @option 0_0_C_Anyway_30
 * @value jima-id:0_0_C_Anyway_30
 * @option 0_0_C_BlackSmile_30
 * @value jima-id:0_0_C_BlackSmile_30
 * @option 0_0_C_CloseEyesFUFU_30
 * @value jima-id:0_0_C_CloseEyesFUFU_30
 * @option 0_0_C_CloseEyesSerious_30
 * @value jima-id:0_0_C_CloseEyesSerious_30
 * @option 0_0_C_Cute_30
 * @value jima-id:0_0_C_Cute_30
 * @option 0_0_C_Default_30
 * @value jima-id:0_0_C_Default_30
 * @option 0_0_C_HAHA_30
 * @value jima-id:0_0_C_HAHA_30
 * @option 0_0_C_HEHE_30
 * @value jima-id:0_0_C_HEHE_30
 * @option 0_0_C_Kirakira_30
 * @value jima-id:0_0_C_Kirakira_30
 * @option 0_0_C_NoHAHA_30
 * @value jima-id:0_0_C_NoHAHA_30
 * @option 0_0_C_Serious_30
 * @value jima-id:0_0_C_Serious_30
 * @option 0_0_C_SeriousHA_30
 * @value jima-id:0_0_C_SeriousHA_30
 * @option 0_0_C_Smile_30
 * @value jima-id:0_0_C_Smile_30
 * @option 0_0_C_Smile2_30
 * @value jima-id:0_0_C_Smile2_30
 * @option 0_0_C_SoWhat_30
 * @value jima-id:0_0_C_SoWhat_30
 * @option 0_0_C_Surprise_30
 * @value jima-id:0_0_C_Surprise_30
 * @option 0_0_C_Surprise2_30
 * @value jima-id:0_0_C_Surprise2_30
 * @option 0_0_C_Think_30
 * @value jima-id:0_0_C_Think_30
 * @option 0_0_C_Think2_30
 * @value jima-id:0_0_C_Think2_30
 * @option 0_0_C_XD_30
 * @value jima-id:0_0_C_XD_30
 * @option 0_0_C_XD_Good_30
 * @value jima-id:0_0_C_XD_Good_30
 * @option 0_0_C_XD_V_30
 * @value jima-id:0_0_C_XD_V_30
 * @jimaPictureOptionsEnd
 * @default @keep
 *
 * @arg slot
 * @text 顯示位置
 * @desc 對應外層位置 1～8；所有立繪都使用所選位置的共用座標。
 * @type select
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default 1
 *
 * @arg show
 * @text 顯示立繪
 * @desc 開啟時顯示或切換此位置的立繪；關閉時僅讓此位置退場，不執行其他欄位。
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：此位置退場
 * @default true
 *
 * @arg focus
 * @text 此角色發言聚焦
 * @desc 開啟時此角色與額外指定位置明亮，未選的人變暗；關閉時全員明亮。顯示立繪時適用。
 * @type boolean
 * @on 開啟：此人與額外位置聚焦
 * @off 關閉：全部明亮
 * @default true
 *
 * @arg extraFocusSlots
 * @text 額外一起聚焦的位置
 * @desc 此角色發言聚焦開啟時生效。逐筆選取其他已顯示的位置；留空維持單人聚焦，每次呼叫重新指定。
 * @type select[]
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default []
 *
 * @arg hold
 * @text 對話結束後保留
 * @desc 開啟時關閉文字視窗後仍保留立繪；關閉時隨文字視窗退場。顯示立繪時適用。
 * @type boolean
 * @on 開啟：保留
 * @off 關閉：隨文字視窗退場
 * @default true
 *
 * @arg exitBeforeShow
 * @text 更換前先退場
 * @desc 開啟時先讓此位置的舊立繪退場，再依插件設定的等待幀數顯示新立繪；換表情請關閉。
 * @type boolean
 * @on 開啟：先退場再進場
 * @off 關閉：直接換圖
 * @default false
 *
 * @arg motionEnabled
 * @text 播放動作
 * @desc 開啟時播放下方選擇的動作；關閉時不播放。顯示立繪時適用。
 * @type boolean
 * @on 開啟：播放動作
 * @off 關閉：不播放
 * @default false
 *
 * @arg motion
 * @text 動作種類
 * @desc 「播放動作」開啟時才會執行；一次選擇一種動作，且只操作所選位置。
 * @type select
 * @option 往上跳一下
 * @value jump
 * @option 連跳兩下
 * @value jumpjump
 * @option 原地震動
 * @value shake
 * @option 點頭一次
 * @value yes
 * @option 點頭兩次
 * @value yesyes
 * @option 左右搖晃
 * @value no
 * @option 慢速左右搖晃
 * @value noslow
 * @option 持續跳躍
 * @value jumploop
 * @option 持續震動
 * @value shakeloop
 * @option 持續慢速搖晃
 * @value noslowloop
 * @option 輕微上下漂浮
 * @value huwahuwa
 * @option 向左離場
 * @value runleft
 * @option 向右離場
 * @value runright
 * @option 呼吸效果 1
 * @value breathing
 * @option 呼吸效果 2
 * @value breathing2
 * @option 停止動作
 * @value none
 * @default jump
 *
 * @command showPictureFileGui
 * @text 顯示／切換立繪（直接選圖）
 * @desc 從 jima_tool 直接選圖；已登錄沿用原設定，未登錄套用第一筆樣式。
 *
 * @arg imageName
 * @text 立繪圖片（直接選取）
 * @desc 直接選取 img/pictures 的 PNG。未登錄圖片套用第一筆縮放等樣式；留空維持目前圖片。
 * @type file
 * @dir img/pictures/jima_tool
 * @default
 *
 * @arg slot
 * @text 顯示位置
 * @desc 對應外層位置 1～8；所有立繪都使用所選位置的共用座標。
 * @type select
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default 1
 *
 * @arg show
 * @text 顯示立繪
 * @desc 開啟時顯示或切換此位置的立繪；關閉時僅讓此位置退場，不執行其他欄位。
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：此位置退場
 * @default true
 *
 * @arg focus
 * @text 此角色發言聚焦
 * @desc 開啟時此角色與額外指定位置明亮，未選的人變暗；關閉時全員明亮。顯示立繪時適用。
 * @type boolean
 * @on 開啟：此人與額外位置聚焦
 * @off 關閉：全部明亮
 * @default true
 *
 * @arg extraFocusSlots
 * @text 額外一起聚焦的位置
 * @desc 此角色發言聚焦開啟時生效。逐筆選取其他已顯示的位置；留空維持單人聚焦，每次呼叫重新指定。
 * @type select[]
 * @option 位置 1
 * @value 1
 * @option 位置 2
 * @value 2
 * @option 位置 3
 * @value 3
 * @option 位置 4
 * @value 4
 * @option 位置 5
 * @value 5
 * @option 位置 6
 * @value 6
 * @option 位置 7
 * @value 7
 * @option 位置 8
 * @value 8
 * @default []
 *
 * @arg hold
 * @text 對話結束後保留
 * @desc 開啟時關閉文字視窗後仍保留立繪；關閉時隨文字視窗退場。顯示立繪時適用。
 * @type boolean
 * @on 開啟：保留
 * @off 關閉：隨文字視窗退場
 * @default true
 *
 * @arg exitBeforeShow
 * @text 更換前先退場
 * @desc 開啟時先讓此位置的舊立繪退場，再依插件設定的等待幀數顯示新立繪；換表情請關閉。
 * @type boolean
 * @on 開啟：先退場再進場
 * @off 關閉：直接換圖
 * @default false
 *
 * @arg motionEnabled
 * @text 播放動作
 * @desc 開啟時播放下方選擇的動作；關閉時不播放。顯示立繪時適用。
 * @type boolean
 * @on 開啟：播放動作
 * @off 關閉：不播放
 * @default false
 *
 * @arg motion
 * @text 動作種類
 * @desc 「播放動作」開啟時才會執行；一次選擇一種動作，且只操作所選位置。
 * @type select
 * @option 往上跳一下
 * @value jump
 * @option 連跳兩下
 * @value jumpjump
 * @option 原地震動
 * @value shake
 * @option 點頭一次
 * @value yes
 * @option 點頭兩次
 * @value yesyes
 * @option 左右搖晃
 * @value no
 * @option 慢速左右搖晃
 * @value noslow
 * @option 持續跳躍
 * @value jumploop
 * @option 持續震動
 * @value shakeloop
 * @option 持續慢速搖晃
 * @value noslowloop
 * @option 輕微上下漂浮
 * @value huwahuwa
 * @option 向左離場
 * @value runleft
 * @option 向右離場
 * @value runright
 * @option 呼吸效果 1
 * @value breathing
 * @option 呼吸效果 2
 * @value breathing2
 * @option 停止動作
 * @value none
 * @default jump
 *
 * @command endDialogueGui
 * @text 結束立繪對話（全部退場）
 * @desc 全部立繪依各位置的退場效果隱藏，並關閉保留模式。
 *
 * @command syncPictureMenu
 * @text 更新已登錄下拉選單（本機試玩用）
 * @desc 本機試玩限定；按已儲存的登錄清單更新選項。儲存後自動同步請開專用工具。
 *
 * @command processChar
 * @text 執行控制碼（文字輸入）
 * @desc 輸入控制碼操作立繪；一般事件請使用「顯示／切換立繪（已登錄清單）」。
 *
 * @arg text
 * @text 控制碼
 * @desc 例如顯示：\F1[Asai_1]\AA[1]\FH[ON]；全部退場：\FH[OFF]。
 * @type multiline_string
 *
 * @command setEnabled
 * @text 立繪顯示開關
 * @desc 切換全部立繪的顯示狀態；關閉時暫時隱藏，開啟時恢復顯示。
 *
 * @arg enabled
 * @text 顯示立繪
 * @desc 開啟時顯示立繪，關閉時暫時隱藏全部立繪。
 * @default true
 * @type boolean
 * @on 開啟：顯示
 * @off 關閉：隱藏
 *
 * @command setTone
 * @text 立繪色調調整
 * @desc 調整全部立繪的紅、綠、藍與灰階色調；全部設為 0 可恢復原色。
 *
 * @arg toneR
 * @text 紅色
 * @desc 紅色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneG
 * @text 綠色
 * @desc 綠色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneB
 * @text 藍色
 * @desc 藍色色調，範圍 -255～255；0 為不調整。
 * @default 0
 * @type number
 * @min -255
 * @max 255
 *
 * @arg toneC
 * @text 灰階強度
 * @desc 灰階強度，範圍 0～255；0 為原色，255 為完全灰階。
 * @default 0
 * @type number
 * @min 0
 * @max 255
 *
 * @param sPictures
 * @text 立繪個別樣式（ID 自動使用檔名）
 * @desc 從 jima_tool 登錄圖片與個別樣式；ID 使用檔名。儲存後由同步工具更新事件選項。
 * @default []
 * @type struct<sPictures>[]
 *
 * @param slotSettings1
 * @text 位置 1（\F1 或 \F）
 * @desc 位置 1 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX1
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 1 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 464
 * @parent slotSettings1
 *
 * @param slotY1
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 1 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings1
 *
 * @param transition
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings1
 *
 * @param priority
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings1
 *
 * @param slotSettings2
 * @text 位置 2（\F2 或 \FF）
 * @desc 位置 2 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX2
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 2 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 20
 * @parent slotSettings2
 *
 * @param slotY2
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 2 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings2
 *
 * @param transition2
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings2
 *
 * @param priority2
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings2
 *
 * @param slotSettings3
 * @text 位置 3（\F3 或 \FFF）
 * @desc 位置 3 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX3
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 3 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 364
 * @parent slotSettings3
 *
 * @param slotY3
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 3 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings3
 *
 * @param transition3
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings3
 *
 * @param priority3
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings3
 *
 * @param slotSettings4
 * @text 位置 4（\F4 或 \FFFF）
 * @desc 位置 4 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX4
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 4 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 120
 * @parent slotSettings4
 *
 * @param slotY4
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 4 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings4
 *
 * @param transition4
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings4
 *
 * @param priority4
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings4
 *
 * @param slotSettings5
 * @text 位置 5（\F5）
 * @desc 位置 5 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX5
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 5 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 464
 * @parent slotSettings5
 *
 * @param slotY5
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 5 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings5
 *
 * @param transition5
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings5
 *
 * @param priority5
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings5
 *
 * @param slotSettings6
 * @text 位置 6（\F6）
 * @desc 位置 6 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX6
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 6 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 20
 * @parent slotSettings6
 *
 * @param slotY6
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 6 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings6
 *
 * @param transition6
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings6
 *
 * @param priority6
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings6
 *
 * @param slotSettings7
 * @text 位置 7（\F7）
 * @desc 位置 7 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX7
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 7 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 364
 * @parent slotSettings7
 *
 * @param slotY7
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 7 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings7
 *
 * @param transition7
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings7
 *
 * @param priority7
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings7
 *
 * @param slotSettings8
 * @text 位置 8（\F8）
 * @desc 位置 8 的共用座標、進退場效果與顯示層級；請展開下方設定。
 *
 * @param slotX8
 * @text 水平座標（X）
 * @desc 所有立繪呼叫位置 8 時共用的座標，單位為像素；越大越靠右。
 * @type number
 * @min -2000
 * @max 2000
 * @default 120
 * @parent slotSettings8
 *
 * @param slotY8
 * @text 垂直座標（Y）
 * @desc 所有立繪呼叫位置 8 時共用的座標，單位為像素；越大越靠下。
 * @type number
 * @min -2000
 * @max 2000
 * @default 96
 * @parent slotSettings8
 *
 * @param transition8
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 * @parent slotSettings8
 *
 * @param priority8
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 * @parent slotSettings8
 *
 * @param blinkSettings
 * @text 眨眼動畫設定
 * @desc 眨眼動畫的分類標題；請展開下方設定。
 *
 * @param blinkInterval
 * @text 眨眼間隔（影格）
 * @desc 兩次眨眼之間的平均影格數。每影格約 1/60 秒；預設 180，約 3 秒。
 * @default 180
 * @min 1
 * @max 2000
 * @type number
 * @parent blinkSettings
 *
 * @param blinkWaitCount
 * @text 眨眼持續時間（影格）
 * @desc 眨眼圖片的顯示影格數。每影格約 1/60 秒；預設 4，數值越大閉眼越久。
 * @default 4
 * @min 1
 * @max 2000
 * @type number
 * @parent blinkSettings
 *
 * @param globalScale
 * @text 所有立繪共用縮放比（%）
 * @desc 共用外部縮放的立繪，水平與垂直都直接使用此比例；100 為原圖大小，不與個別數值相乘。
 * @type number
 * @min 0
 * @max 2000
 * @decimals 0
 * @default 100
 *
 * @param switchWaitFrames
 * @text 更換前退場等待（幀）
 * @desc 指令開啟「更換前先退場」時，先等待此幀數再顯示新立繪；0 會立即重新進場。
 * @type number
 * @min 0
 * @max 600
 * @decimals 0
 * @default 20
 *
 * @param focusShrinkEnabled
 * @text 未發言角色縮小
 * @desc 開啟時未發言角色會變暗並縮小，再次發言時恢復；大小與明暗共用下方動畫幀數。
 * @type boolean
 * @on 開啟：縮小與明暗動畫
 * @off 關閉：沿用即時變暗
 * @default false
 *
 * @param focusShrinkPercent
 * @text 未發言縮小幅度（%）
 * @parent focusShrinkEnabled
 * @desc 縮小多少百分比：10 代表保留原大小 90%；以立繪原本的水平、垂直縮放為基準。
 * @type number
 * @min 0
 * @max 100
 * @decimals 0
 * @default 10
 *
 * @param focusEffectFrames
 * @text 聚焦變化時間（幀）
 * @parent focusShrinkEnabled
 * @desc 未發言時縮小與變暗、再次發言時恢復大小與亮度，共用此時間；0 為立即切換。
 * @type number
 * @min 0
 * @max 600
 * @decimals 0
 * @default 20
 *
 * @param focusToneAdjust
 * @text 未發言角色的變暗程度
 * @desc 發言聚焦時其他角色的明暗值，範圍 -255～0；越小越暗，0 不變暗，預設 -96。
 * @default -96
 * @min -255
 * @max 0
 * @type number
 *
 * @param betweenPicturesPriority
 * @text 立繪插入層的圖片編號
 * @desc 僅「插入一般圖片之間」時有效；編號大於此值的一般圖片會蓋在立繪上方。
 * @default 50
 * @min 0
 * @max 100
 * @type number
 *
 * @param bootCachePictures
 * @text 預先載入立繪圖片
 * @desc 開啟時預先載入圖片，減少遊戲中等待；圖片數量多或檔案較大時可關閉。
 * @default true
 * @type boolean
 * @on 開啟：預先載入
 * @off 關閉：需要時載入
 */

/*~struct~sPictures:ja
 *
 * @param imageName
 * @text 立繪圖片（檔名即 ID）
 * @desc 直接從 img/pictures/jima_tool 選 PNG，檔名自動作為 ID。
 * @type file
 * @dir img/pictures/jima_tool
 *
 * @param imageNameBlink
 * @text 眨眼圖片 1（選填）
 * @desc 選擇第一張眨眼差分圖片；尺寸須與立繪圖片相同，不使用眨眼時請留空。
 * @dir img/pictures/jima_tool
 * @type file
 * @require 1
 *
 * @param imageNameBlink2
 * @text 眨眼圖片 2（選填）
 * @desc 選擇第二張眨眼差分圖片；尺寸須與立繪圖片相同，只用一張差分時請留空。
 * @dir img/pictures/jima_tool
 * @type file
 * @require 1
 *
 * @param origin
 * @text 定位原點
 * @desc 指定座標對齊圖片的左上角或中心；放大、縮小時也會依此定位。
 * @default 0
 * @type select
 * @option 左上角
 * @value 0
 * @option 圖片中心
 * @value 1
 *
 * @param reverse
 * @text 偶數位置的左右翻轉
 * @desc 位置 2、4、6、8 使用此設定；選擇是否將立繪左右翻轉。
 * @default 1
 * @type select
 * @option 維持原方向
 * @value 1
 * @option 左右翻轉
 * @value -1
 *
 * @param useGlobalScale
 * @text 是否共用外部縮放比
 * @desc 是：使用外部的所有立繪共用縮放比；否：使用下方本筆水平、垂直縮放。個別數值不會被清除。
 * @type boolean
 * @on 是：使用共用縮放
 * @off 否：使用本筆縮放
 * @default true
 *
 * @param scaleX
 * @text 水平縮放（％）
 * @desc 是否共用外部縮放比設為否時生效；100 為原尺寸、150 為 1.5 倍、200 為 2 倍。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text 垂直縮放（％）
 * @desc 是否共用外部縮放比設為否時生效；100 為原尺寸、150 為 1.5 倍、200 為 2 倍。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param opacity
 * @text 不透明度
 * @desc 範圍 0～255；0 完全透明、255 完全不透明。使用眨眼圖片時請設為 255。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @param blendMode
 * @text 混合模式
 * @desc 設定立繪與下方畫面的顏色混合方式；一般立繪使用「一般」。
 * @default 0
 * @type select
 * @option 一般
 * @value 0
 * @option 加法混合（提亮）
 * @value 1
 * @option 色彩增值（變暗）
 * @value 2
 * @option 濾色（提亮）
 * @value 3
 */

/*~struct~pictureSettings:ja
 *
 * @param transition
 * @text 進退場效果
 * @desc 設定此位置的立繪出現與消失時使用的效果。
 * @type select
 * @default 1
 * @option 無效果（立即顯示／隱藏）
 * @value 0
 * @option 淡入／淡出
 * @value 1
 * @option 從左側滑入／往左側退場
 * @value 2
 * @option 從右側滑入／往右側退場
 * @value 3
 * @option 從下方滑入／往下方退場
 * @value 4
 * @option 從上方滑入／往上方退場
 * @value 5
 *
 * @param priority
 * @text 顯示層級
 * @desc 設定立繪相對於一般圖片與視窗的前後順序。
 * @type select
 * @default inFrontOfPicture
 * @option 一般圖片後方
 * @value behindPicture
 * @option 插入一般圖片之間
 * @value betweenPictures
 * @option 一般圖片前方
 * @value inFrontOfPicture
 * @option 視窗後方（畫面淡出時仍顯示）
 * @value behindWindow
 * @option 視窗前方（畫面淡出時仍顯示）
 * @value inFrontOfWindow
 */

(() => {
	"use strict";
	const pluginName = "Jima_StandingPicture";
	const legacyPluginName = "LL_StandingPicture";
	// Keep commands in existing saved interpreters and external scripts working.
	const registerStandingCommand = function(command, handler) {
		PluginManager.registerCommand(pluginName, command, handler);
		PluginManager.registerCommand(legacyPluginName, command, handler);
	};
	// JIMA_REGISTERED_SYNC_CORE_BEGIN
	const jimaRegisteredSync = (function createRegisteredSyncCore() {
  "use strict";
  var pluginPath = ["js", "plugins", "Jima_StandingPicture.js"];
  var configPath = ["js", "plugins.js"];
  var backupPath = ["js", "plugins", "Jima_StandingPicture.js.jima-registered-sync.bak"];
  function parsePlugins(source) {
    var match = /\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$/.exec(source);
    if (!match) throw new Error("js/plugins.js 格式無法辨識，未更新選項。");
    var plugins = JSON.parse(match[1]);
    if (!Array.isArray(plugins)) throw new Error("插件設定必須是清單。");
    return plugins;
  }
  function normalizeImageName(value) {
    var name = String(value == null ? "" : value);
    if (name.indexOf("jima-image:") === 0) name = decodeURIComponent(name.slice(11));
    name = name.replace(/\\/g, "/");
    if (!name) return "";
    if (name.indexOf("img/pictures/") === 0) name = name.slice(13);
    if (/[\u0000-\u001f\u007f:]/.test(name) || name[0] === "/"
        || name.split("/").some(function(part) { return !part || part === "." || part === ".."; })) {
      throw new Error("立繪圖片名稱無效，請從 jima_tool 重新選圖。");
    }
    return name.indexOf("jima_tool/") === 0 ? name : "jima_tool/" + name;
  }
  function entries(parameters) {
    var rows = parameters && parameters.sPictures;
    if (rows == null || rows === "") rows = [];
    if (typeof rows === "string") rows = JSON.parse(rows);
    if (!Array.isArray(rows)) throw new Error("立繪個別樣式格式有誤，未更新選項。");
    var seen = new Set(), result = [];
    rows.forEach(function(row) {
      if (row == null || row === "") return;
      if (typeof row === "string") row = JSON.parse(row);
      if (row == null || row === "") return;
      if (typeof row !== "object" || Array.isArray(row)) throw new Error("立繪個別樣式包含無效項目。");
      var imageName = normalizeImageName(row.imageName);
      if (!imageName) return;
      var id = imageName.split("/").pop();
      if (seen.has(id)) throw new Error("立繪檔名「" + id + "」重複登錄；每個檔名只保留一筆樣式後再儲存。");
      seen.add(id);
      result.push({id: id, imageName: imageName});
    });
    return result;
  }
  function registered(plugins) {
    var matches = plugins.filter(function(item) { return item && (item.name === "Jima_StandingPicture" || item.name === "LL_StandingPicture"); });
    if (matches.length !== 1) throw new Error("請選擇已加入 Jima_StandingPicture 的專案根目錄，並先儲存專案。");
    return entries(matches[0].parameters);
  }
  function patchPlugin(source, list) {
    var newline = source.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
    var lines = [" * @jimaPictureOptionsBegin",
      " * @option （維持此位置目前圖片；首次請選立繪）", " * @value @keep"];
    list.forEach(function(item) {
      var label = item.id.replace(/\*\//g, "*／");
      lines.push(" * @option " + label, " * @value jima-id:" + encodeURIComponent(item.id));
    });
    lines.push(" * @jimaPictureOptionsEnd");
    var count = 0;
    var updated = source.replace(/^ \* @jimaPictureOptionsBegin\r?\n[\s\S]*?^ \* @jimaPictureOptionsEnd(?=\r?$)/gm, function() {
      count++;
      return lines.join(newline);
    });
    if (count !== 2) throw new Error("插件選項標記不完整，請先覆蓋此包 v1.2.2 插件；未改寫原檔。");
    return updated;
  }
  async function handle(root, parts, create) {
    var current = root;
    for (var i = 0; i < parts.length - 1; i++) current = await current.getDirectoryHandle(parts[i]);
    return current.getFileHandle(parts[parts.length - 1], {create: !!create});
  }
  async function read(file) { return (await file.getFile()).text(); }
  async function write(file, content, guard) {
    var stream = await file.createWritable();
    try {
      await stream.write(content);
      if (guard) await guard();
      await stream.close();
    } catch (error) {
      try { await stream.abort(); } catch (_) {}
      throw error;
    }
  }
  async function syncProject(root) {
    var configFile = await handle(root, configPath);
    var config = await read(configFile);
    var list = registered(parsePlugins(config));
    var file = await handle(root, pluginPath), before = await read(file);
    var after = patchPlugin(before, list);
    async function guard() {
      if (await read(configFile) !== config || await read(file) !== before) {
        throw new Error("專案檔案正在儲存，稍後會自動重試。");
      }
    }
    await guard();
    var changed = before !== after;
    if (changed) {
      var backup = null;
      try { backup = await handle(root, backupPath); }
      catch (error) { if (error.name !== "NotFoundError") throw error; }
      if (!backup) {
        await guard();
        await write(await handle(root, backupPath, true), before);
      }
      await guard();
      await write(file, after, guard);
    }
    return {changed: changed, count: list.length, ids: list.map(function(item) { return item.id; })};
  }
  return {parsePlugins: parsePlugins, normalizeImageName: normalizeImageName,
    entries: entries, registered: registered, patchPlugin: patchPlugin, syncProject: syncProject};
})();
	// JIMA_REGISTERED_SYNC_CORE_END
	// JIMA_AUTO_CATALOG_BEGIN
	const jimaCatalogData = {"schema":1,"folder":"jima_tool","images":[],"aliases":{}};
	// JIMA_AUTO_CATALOG_END
	const jimaCatalogApi = (function runtimeFactory() {
    function decode(value, prefix) {
      value = String(value == null ? '' : value);
      return value.indexOf(prefix) === 0 ? decodeURIComponent(value.slice(prefix.length)) : value;
    }
    function baseName(value) { return String(value == null ? '' : value).replace(/\\/g, '/').split('/').pop(); }
    function stem(value) { return baseName(value).replace(/\.png$/i, ''); }
    function resolve(manual, catalog) {
      catalog = catalog && catalog.schema === 1 ? catalog : {images:[], aliases:{}};
      var images = catalog.images || [], byStem = new Map(), byPath = new Map(), result = [], seen = new Set();
      images.forEach(function(image) { byStem.set(image.id, image); byPath.set(image.imageName, image); });
      function path(value) {
        value = decode(value, 'jima-image:');
        var match = byPath.get(value) || byStem.get(baseName(value));
        return match ? match.imageName : value;
      }
      var template = manual.find(function(row) { return row && typeof row === 'object'; }) || {};
      var defaults = {origin:0, reverse:1, scaleX:100, scaleY:100, opacity:255, blendMode:0};
      function appearance(row) {
        var copy = {};
        Object.keys(defaults).forEach(function(key) {
          var value = row[key];
          copy[key] = value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : defaults[key];
        });
        return copy;
      }
      manual.forEach(function(row) {
        if (!row || typeof row !== 'object') return;
        var originalName = decode(row.imageName, 'jima-image:');
        if (!originalName) return;
        var image = byPath.get(originalName) || byStem.get(baseName(originalName));
        var id = image ? image.id : baseName(originalName);
        if (seen.has(id)) return;
        seen.add(id);
        result.push(Object.assign({}, row, {id:id, imageName:path(originalName),
          imageNameBlink:row.imageNameBlink ? path(row.imageNameBlink) : '',
          imageNameBlink2:row.imageNameBlink2 ? path(row.imageNameBlink2) : '',
          actualPath:image ? image.actualPath : null}));
      });
      images.forEach(function(image) {
        if (seen.has(image.id)) return;
        seen.add(image.id);
        result.push(Object.assign(appearance(template), {id:image.id, imageName:image.imageName,
          imageNameBlink:'', imageNameBlink2:'', actualPath:image.actualPath}));
      });
      return result;
    }
    return {decode:decode, stem:stem, baseName:baseName, resolve:resolve};
  })();

	const currentParameters = PluginManager.parameters(pluginName);
	const parameters = Object.keys(currentParameters).length ? currentParameters : PluginManager.parameters(legacyPluginName);
	const paramJsonParse = function(key, value) {
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	};

	// 位置 5～8 使用與前四個位置相同的展開欄位，並相容舊版結構設定。
	const hasSlotValue = value => value !== undefined && value !== null && value !== "";
	const readLegacySlotSettings = function(value) {
		try {
			const parsed = typeof value === "string" ? JSON.parse(value) : value;
			return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
		} catch (error) {
			return {};
		}
	};
	const extendedSlotSettings = [5, 6, 7, 8].map(slot => {
		const legacy = readLegacySlotSettings(parameters["pictureSettings" + slot]);
		const transition = parameters["transition" + slot];
		const priority = parameters["priority" + slot];
		return {
			transition: Number(hasSlotValue(transition) ? transition : hasSlotValue(legacy.transition) ? legacy.transition : 1),
			priority: String(hasSlotValue(priority) ? priority : hasSlotValue(legacy.priority) ? legacy.priority : "inFrontOfPicture")
		};
	});

	// 切替効果
	const transitions = [
		Number(parameters["transition"] || 1),
		Number(parameters["transition2"] || 1),
		Number(parameters["transition3"] || 1),
		Number(parameters["transition4"] || 1),
		extendedSlotSettings[0].transition,
		extendedSlotSettings[1].transition,
		extendedSlotSettings[2].transition,
		extendedSlotSettings[3].transition
	];
	// 優先順位
	const priorities = [
		String(parameters["priority"] || ""),
		String(parameters["priority2"] || ""),
		String(parameters["priority3"] || ""),
		String(parameters["priority4"] || ""),
		extendedSlotSettings[0].priority,
		extendedSlotSettings[1].priority,
		extendedSlotSettings[2].priority,
		extendedSlotSettings[3].priority
	];
	// フォーカス時の暗さ
	const focusToneAdjust = Number(parameters["focusToneAdjust"] || -96);
	const integerSetting = function(key, fallback, min, max) {
		const value = parameters[key];
		const number = value === undefined || value === "" ? fallback : Number(value);
		return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
	};
	const globalScale = integerSetting("globalScale", 100, 0, 2000);
	const switchWaitFrames = integerSetting("switchWaitFrames", 20, 0, 600);
	const focusShrinkEnabled = parameters["focusShrinkEnabled"] === "true";
	const focusShrinkPercent = integerSetting("focusShrinkPercent", 10, 0, 100);
	const focusEffectFrames = integerSetting("focusEffectFrames", 20, 0, 600);
	// 画像の事前読み込み
	const bootCachePictures = (parameters["bootCachePictures"] === "true" || false);
	// 瞬きアニメーションの設定
	const blinkInterval = Number(parameters["blinkInterval"] || 180);
	const blinkWaitCount = Number(parameters["blinkWaitCount"] || 4);
	// 立ち絵リスト
	const sPictures = String(parameters["sPictures"] || "[]");
	const manualPictureLists = JSON.parse(JSON.stringify(sPictures, paramJsonParse));

	const normalizeJimaName = function(value) {
		let name = jimaCatalogApi.decode(value, "jima-image:").replace(/\\/g, "/");
		if (!name) return "";
		if (name.indexOf("img/pictures/") === 0) name = name.slice("img/pictures/".length);
		if (/[\u0000-\u001f:]/.test(name) || name[0] === "/"
			|| name.split("/").some(part => !part || part === "." || part === "..")) {
			throw new Error("Jima_StandingPicture：請選取 img/pictures/jima_tool 內的圖片。");
		}
		return name.indexOf("jima_tool/") === 0 ? name : "jima_tool/" + name;
	};
	const normalizedPictureLists = manualPictureLists.filter(picture => picture && picture.imageName != null
		&& String(picture.imageName) !== "").map(picture => Object.assign({}, picture, {
			imageName: normalizeJimaName(picture.imageName),
			imageNameBlink: picture.imageNameBlink ? normalizeJimaName(picture.imageNameBlink) : "",
			imageNameBlink2: picture.imageNameBlink2 ? normalizeJimaName(picture.imageNameBlink2) : ""
		}));
	// File choices come directly from MZ; a generated catalog is not needed.
	const sPictureLists = jimaCatalogApi.resolve(normalizedPictureLists, {schema:1, images:[], aliases:{}});
	const resolvePictureId = function(value) {
		const raw = String(value || "");
		const id = jimaCatalogApi.decode(raw, "jima-id:");
		if (raw.indexOf("jima-id:") === 0) return id;
		const local = manualPictureLists.find(picture => picture && String(picture.id) === id);
		return (Object.prototype.hasOwnProperty.call(jimaCatalogData.aliases, id) ? jimaCatalogData.aliases[id] : "") || (local ? jimaCatalogApi.baseName(jimaCatalogApi.decode(local.imageName, "jima-image:")) : id);
	};

	const loadJimaPicture = function(name) {
		const image = jimaCatalogData.images.find(item => item.imageName === name);
		if (image && !image.actualPath.endsWith(".png") && typeof ImageManager.loadBitmapFromUrl === "function") {
			return ImageManager.loadBitmapFromUrl(image.actualPath.split("/").map(encodeURIComponent).join("/"));
		}
		return ImageManager.loadPicture(name);
	};

	// 每個位置只有一組共用座標；舊圖片座標僅作首次升級的起始值。
	const defaultSlotPositions = [[464, 96], [20, 96], [364, 96], [120, 96],
		[464, 96], [20, 96], [364, 96], [120, 96]];
	const readCoordinate = function(value, fallback) {
		const number = Number(value);
		return hasSlotValue(value) && Number.isFinite(number) ? number : fallback;
	};
	const decodePictureList = function(value) {
		try {
			const list = typeof value === "string" ? JSON.parse(value) : value;
			return Array.isArray(list) ? list.map(readLegacySlotSettings) : [];
		} catch (error) {
			return [];
		}
	};
	const initialSlotPositions = function(pictures) {
		const first = readLegacySlotSettings(Array.isArray(pictures) ? pictures[0] : null);
		return defaultSlotPositions.map((position, index) => {
			const baseSlot = index % 4 + 1;
			const suffix = baseSlot === 1 ? "" : String(baseSlot);
			return {x: readCoordinate(first["x" + suffix], position[0]),
				y: readCoordinate(first["y" + suffix], position[1])};
		});
	};
	const initialPositions = initialSlotPositions(manualPictureLists);
	const slotPositions = initialPositions.map((position, index) => ({
		x: readCoordinate(parameters["slotX" + (index + 1)], position.x),
		y: readCoordinate(parameters["slotY" + (index + 1)], position.y)
	}));
	// 立ち絵最大スロット数
	const maxStandingPictureSlots = 8;
	// ピクチャ割り込み番号
	const betweenPicturesPriority = Number(parameters["betweenPicturesPriority"] || 50);

	// 制御文字の実行
	const guiBoolean = function(value, defaultValue) {
		if (value === undefined || value === "") return defaultValue;
		return value === true || value === "true";
	};

	// MZ serializes a select[] argument as a JSON array of selected values.
	const guiExtraFocusSlots = function(value) {
		if (value === undefined || value === null || value === "") return [];
		let selected = value;
		if (typeof selected === "string") {
			try {
				selected = JSON.parse(selected);
			} catch (error) {
				throw new Error("Jima_StandingPicture：額外一起聚焦的位置格式錯誤，請重新選擇位置 1～8。");
			}
		}
		if (!Array.isArray(selected)) {
			throw new Error("Jima_StandingPicture：額外一起聚焦的位置必須是位置清單，請重新選擇。");
		}
		const slots = selected.map(item => {
			const slot = Number(item);
			if ((typeof item !== "string" && typeof item !== "number") || String(item).trim() === ""
				|| !Number.isInteger(slot) || slot < 1 || slot > maxStandingPictureSlots) {
				throw new Error("Jima_StandingPicture：額外一起聚焦的位置只能選擇 1～8。");
			}
			return slot;
		});
		return Array.from(new Set(slots));
	};

	// Serializable event wait: keep the old bitmap until the configured retreat wait ends.
	function nextStandingChange(picture) {
		picture._jimaChangeRevision = (Number(picture._jimaChangeRevision) || 0) + 1;
		return picture._jimaChangeRevision;
	}
	function standingSprite(slot) {
		const scene = SceneManager._scene;
		return scene && scene._spSprites ? scene._spSprites[slot - 1] : null;
	}
	function restoreFocusTransform(sprite) {
		const transform = sprite && sprite._jimaFocusTransform;
		if (!transform) return;
		sprite.x -= transform.x;
		sprite.y -= transform.y;
		sprite.scale.x = transform.scaleX;
		sprite.scale.y = transform.scaleY;
		sprite._jimaFocusTransform = null;
	}
	function finishStandingRetreat(slot) {
		const sprite = standingSprite(slot);
		if (!sprite) return;
		restoreFocusTransform(sprite);
		sprite.opacity = 0;
		sprite.opening = false;
		sprite.closing = false;
	}
	function completeStandingChange(interpreter) {
		const pending = interpreter._jimaStandingPicturePending;
		delete interpreter._jimaStandingPicturePending;
		if (!pending) return;
		const current = ($gameSystem._LL_StandingPicture_pictures || [])[pending.slot - 1];
		if (!current || current._jimaChangeRevision !== pending.revision) return;
		finishStandingRetreat(pending.slot);
		showGuiPicture(pending.args, () => pending.picture, interpreter);
	}
	function startStandingChange(args, picture, current, slot, interpreter) {
		if (switchWaitFrames > 0 && (!interpreter || typeof interpreter.wait !== "function"
			|| typeof interpreter.setWaitMode !== "function")) {
			throw new Error("Jima_StandingPicture：「更換前先退場」請由事件的插件命令執行。");
		}
		const pending = {slot:slot, picture:Object.assign({}, picture),
			args:Object.assign({}, args, {exitBeforeShow:"false"}), revision:nextStandingChange(current)};
		current.show = false;
		current.refresh = false;
		current.motion = "";
		current.animationCount = 0;
		delete current._jimaKeepOnNextMessage;
		if (switchWaitFrames === 0) {
			finishStandingRetreat(slot);
			showGuiPicture(pending.args, () => pending.picture, interpreter);
		} else {
			interpreter._jimaStandingPicturePending = pending;
			interpreter.wait(switchWaitFrames);
			interpreter.setWaitMode("jimaStandingPicture");
		}
	}
	if (typeof Game_Interpreter !== "undefined") {
		const originalStandingWaitMode = Game_Interpreter.prototype.updateWaitMode;
		Game_Interpreter.prototype.updateWaitMode = function() {
			if (this._waitMode === "jimaStandingPicture") {
				this._waitMode = "";
				completeStandingChange(this);
				return false;
			}
			return originalStandingWaitMode.apply(this, arguments);
		};
		const originalStandingClear = Game_Interpreter.prototype.clear;
		Game_Interpreter.prototype.clear = function() {
			const pending = this._jimaStandingPicturePending;
			if (pending && typeof $gameSystem !== "undefined") {
				const current = ($gameSystem._LL_StandingPicture_pictures || [])[pending.slot - 1];
				if (current && current._jimaChangeRevision === pending.revision) nextStandingChange(current);
			}
			delete this._jimaStandingPicturePending;
			return originalStandingClear.apply(this, arguments);
		};
	}
	function updateStandingFocus(sprite, picture) {
		const target = picture.focus ? 0 : 1;
		const darkness = Math.max(0, Math.min(255, -focusToneAdjust));
		if (!focusShrinkEnabled || !sprite.showing || !sprite.bitmap) {
			sprite.setBlendColor([0, 0, 0, darkness * target]);
			sprite._jimaFocusEffect = null;
			return;
		}
		let effect = sprite._jimaFocusEffect;
		if (!effect) {
			effect = {amount:target, from:target, target:target, elapsed:focusEffectFrames};
			sprite._jimaFocusEffect = effect;
		}
		if (effect.target !== target) {
			effect.from = effect.amount;
			effect.target = target;
			effect.elapsed = 0;
		}
		if (focusEffectFrames === 0) {
			effect.amount = target;
		} else if (effect.elapsed < focusEffectFrames) {
			effect.elapsed++;
			effect.amount = effect.from + (effect.target - effect.from) * effect.elapsed / focusEffectFrames;
		}
		sprite.setBlendColor([0, 0, 0, Math.round(darkness * effect.amount)]);
		const factor = 1 - focusShrinkPercent / 100 * effect.amount;
		const scaleX = sprite.scale.x;
		const scaleY = sprite.scale.y;
		const anchorX = sprite.anchor ? sprite.anchor.x : 0;
		const anchorY = sprite.anchor ? sprite.anchor.y : 0;
		const x = Number(sprite.bitmap.width || 0) * scaleX * (0.5 - anchorX) * (1 - factor);
		const y = Number(sprite.bitmap.height || 0) * scaleY * (1 - anchorY) * (1 - factor);
		// Preserve the bottom-center pivot and undo this transform before the next engine update.
		sprite._jimaFocusTransform = {x:x, y:y, scaleX:scaleX, scaleY:scaleY};
		sprite.x += x;
		sprite.y += y;
		sprite.scale.x = scaleX * factor;
		sprite.scale.y = scaleY * factor;
	}

	// Both editor commands share focus, motion and hold behavior.
	// The resolver returns a complete record; direct pictures never enter the ID registry.
	const showGuiPicture = function(args, resolvePicture, interpreter) {
		const slot = Number(args.slot || 1);
		if (!Number.isInteger(slot) || slot < 1 || slot > maxStandingPictureSlots) {
			throw new Error("Jima_StandingPicture：顯示位置必須為 1～8。");
		}
		const pictures = $gameSystem._LL_StandingPicture_pictures || [];
		const current = pictures[slot - 1];
		if (!current) throw new Error("Jima_StandingPicture：立繪位置尚未初始化，請重新啟動測試遊戲。");
		if (!guiBoolean(args.show, true)) {
			nextStandingChange(current);
			const wasFocused = current.focus;
			current.show = false;
			current.motion = "";
			current.animationCount = 0;
			current.focus = false;
			delete current._jimaKeepOnNextMessage;
			if (wasFocused && !pictures.some(picture => picture.show && picture.focus)) {
				pictures.forEach(picture => { picture.focus = true; });
			}
			return;
		}
		const selectedPicture = resolvePicture(current);
		if (!selectedPicture) {
			throw new Error("Jima_StandingPicture：首次顯示請先選擇立繪圖片。");
		}
		const pictureId = String(selectedPicture.id);
		const controlId = /^\w+$/.test(pictureId) ? pictureId : "jima_resolved_picture";
		const focus = guiBoolean(args.focus, true);
		const extraFocusSlots = focus ? guiExtraFocusSlots(args.extraFocusSlots) : [];
		const hold = guiBoolean(args.hold, true);
		const motionEnabled = guiBoolean(args.motionEnabled, false);
		const motion = String(args.motion || "jump");
		if (motionEnabled && !Object.prototype.hasOwnProperty.call(animationFrame, motion)) {
			throw new Error("Jima_StandingPicture：不支援的動作種類：" + motion);
		}
		const sprite = standingSprite(slot);
		if (guiBoolean(args.exitBeforeShow, false) && current.sPicture
			&& (sprite ? sprite.opacity > 0 : current.show)) {
			startStandingChange(args, selectedPicture, current, slot, interpreter);
			return;
		}
		let code = "\\F" + slot + "[" + controlId + "]";
		code += focus ? Array.from(new Set([slot].concat(extraFocusSlots)))
			.map(position => "\\AA[" + position + "]").join("") : "\\AA[R]";
		code += hold ? "\\FH[ON]" : "\\FH[OFF]";
		if (motionEnabled) code += "\\M" + slot + "[" + motion + "]";
		exStandingPictureParseChar(code, {slot: slot, picture: selectedPicture, token: controlId});
		// F/M parsing already refreshes and starts the addressed slot only.
		// Leave other sprites and motion counters alone, including active loops.
		pictures.forEach(picture => {
			delete picture._jimaKeepOnNextMessage;
		});
		// With Hold OFF, carry the selected picture into the next plain message
		// once, then let the normal window-close hook remove it.
		if (!hold) current._jimaKeepOnNextMessage = true;
	};

	registerStandingCommand( "showPictureGui", function(args) {
		showGuiPicture(args, current => {
			if (args.imageName !== undefined) {
				const chosen = String(args.imageName || "");
				if (!chosen || chosen === "@keep") return current.sPicture;
				if (chosen.indexOf("jima-id:") === 0) {
					const id = jimaCatalogApi.decode(chosen, "jima-id:");
					const picture = sPictureLists.find(item => String(item.id) === id);
					if (!picture) throw new Error("Jima_StandingPicture：立繪「" + id
						+ "」已不在登錄清單；請同步後重新選擇此事件的立繪。");
					return picture;
				}
				// Preserve native file arguments saved before v1.2.2.
				return directPicture(normalizeJimaName(chosen));
			}
			// Old saved events keep their pictureId argument and custom-ID aliases.
			const id = String(args.pictureId || "");
			if (!id || id === "keep-current" || id === "@keep") return current.sPicture;
			const existing = sPictureLists.find(picture => String(picture.id) === resolvePictureId(id));
			if (existing) return existing;
			const chosen = jimaCatalogApi.decode(id, "jima-id:");
			const legacy = jimaCatalogData.images.find(picture => picture.id === chosen);
			return directPicture(normalizeJimaName(legacy ? legacy.imageName : chosen));
		}, this);
	});

	const directPicture = function(imageName) {
		if (/[\u0000-\u001f\\:]/.test(imageName) || imageName[0] === "/"
			|| imageName.split("/").some(part => !part || part === "." || part === "..")) {
			throw new Error("Jima_StandingPicture：圖片必須位於 img/pictures 內，請使用選圖視窗選擇圖片。");
		}
		const registered = sPictureLists.find(picture => picture && String(picture.imageName) === imageName);
		if (registered) return registered;
		const template = sPictureLists.find(picture => picture && typeof picture === "object") || {};
		const defaults = {origin: 0, reverse: 1, scaleX: 100, scaleY: 100, opacity: 255, blendMode: 0};
		const picture = {id: jimaCatalogApi.baseName(imageName), imageName: imageName,
			imageNameBlink: "", imageNameBlink2: ""};
		Object.keys(defaults).forEach(key => {
			const value = template[key];
			picture[key] = value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))
				? Number(value) : defaults[key];
		});
		if (![0, 1].includes(picture.origin)) picture.origin = 0;
		if (![-1, 1].includes(picture.reverse)) picture.reverse = 1;
		picture.opacity = Math.max(0, Math.min(255, picture.opacity));
		if (![0, 1, 2, 3].includes(picture.blendMode)) picture.blendMode = 0;
		return picture;
	};
	registerStandingCommand( "showPictureFileGui", function(args) {
		showGuiPicture(args, current => {
			const chosen = jimaCatalogApi.decode(args.imageName, "jima-image:");
			const imageName = normalizeJimaName(chosen);
			return imageName ? directPicture(imageName) : current.sPicture;
		}, this);
	});

	registerStandingCommand( "endDialogueGui", () => {
		($gameSystem._LL_StandingPicture_pictures || []).forEach(nextStandingChange);
		exStandingPictureParseChar("\\FH[OFF]");
		($gameSystem._LL_StandingPicture_pictures || []).forEach(picture => {
			picture.show = false;
			picture.motion = "";
			picture.animationCount = 0;
			delete picture._jimaKeepOnNextMessage;
		});
	});

	// Backup trigger: only local NW.js test play may update editor annotations.
	const syncGuiPictureOptions = function() {
		const allowed = typeof Utils !== "undefined"
			&& typeof Utils.isNwjs === "function" && Utils.isNwjs()
			&& typeof Utils.isOptionValid === "function" && Utils.isOptionValid("test")
			&& typeof require === "function";
		if (!allowed) return {available:false, changed:false};
		let temporary = "";
		let ownsTemporary = false;
		let fs = null;
		try {
			if (typeof process === "undefined" || !process.mainModule || !process.mainModule.filename) return {available:false, changed:false};
			fs = require("fs");
			const path = require("path");
			const root = path.dirname(process.mainModule.filename);
			const configPath = path.resolve(root, "js", "plugins.js");
			const pluginPath = path.resolve(root, "js", "plugins", pluginName + ".js");
			const config = fs.readFileSync(configPath, "utf8");
			const list = jimaRegisteredSync.registered(jimaRegisteredSync.parsePlugins(config));
			const before = fs.readFileSync(pluginPath, "utf8");
			const after = jimaRegisteredSync.patchPlugin(before, list);
			if (after === before) return {available:true, changed:false, count:list.length};
			const guard = function() {
				if (fs.readFileSync(configPath, "utf8") !== config || fs.readFileSync(pluginPath, "utf8") !== before) {
					throw new Error("專案檔案正在儲存，請稍後再試。");
				}
			};
			guard();
			const backup = pluginPath + ".jima-registered-sync.bak";
			if (!fs.existsSync(backup)) fs.copyFileSync(pluginPath, backup, fs.constants.COPYFILE_EXCL);
			temporary = pluginPath + ".jima-registered-" + Date.now() + "-" + Math.random().toString(16).slice(2) + ".tmp";
			fs.writeFileSync(temporary, after, {encoding:"utf8", flag:"wx"});
			ownsTemporary = true;
			guard();
			fs.renameSync(temporary, pluginPath);
			temporary = "";
			console.info("[JIMA] 已同步 " + list.length + " 張已登錄立繪。請回 MZ 重新整理插件，並重開命令參數視窗；仍是舊選項時請重開專案。");
			return {available:true, changed:true, count:list.length};
		} catch (error) {
			console.warn("[JIMA] 已登錄選單未更新：" + error.message);
			return {available:true, changed:false, error:error.message};
		} finally {
			if (temporary && ownsTemporary && fs) {
				try { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
				catch (error) { console.warn("[JIMA] 暫存檔尚未清理：" + error.message); }
			}
		}
	};

	// 本機試玩時轉換共用座標，並移除舊分類值；新分類本身不帶結構文字。
	const migrateSlotSettings = function() {
		const allowed = typeof Utils !== "undefined"
			&& typeof Utils.isNwjs === "function" && Utils.isNwjs()
			&& typeof Utils.isOptionValid === "function" && Utils.isOptionValid("test")
			&& typeof require === "function";
		if (!allowed) return;
		try {
			const fs = require("fs");
			const path = require("path");
			if (typeof process === "undefined" || !process.mainModule || !process.mainModule.filename) return;
			const root = path.dirname(process.mainModule.filename);
			const filePath = path.resolve(root, "js", "plugins.js");
			if (!fs.existsSync(filePath)) return;
			const source = fs.readFileSync(filePath, "utf8");
			const assignment = /\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$/.exec(source);
			if (!assignment) throw new Error("插件設定檔格式無法辨識，已保留原檔。");
			const pluginList = JSON.parse(assignment[1]);
			if (!Array.isArray(pluginList)) throw new Error("插件設定清單格式不正確，已保留原檔。");
			const entry = pluginList.find(plugin => plugin && plugin.name === pluginName);
			if (!entry || !entry.parameters || typeof entry.parameters !== "object" || Array.isArray(entry.parameters)) return;
			const saved = entry.parameters;
			const positions = initialSlotPositions(decodePictureList(saved.sPictures));
			let changed = false;
			for (let slot = 1; slot <= 8; slot++) {
				for (const axis of ["X", "Y"]) {
					const key = "slot" + axis + slot;
					if (!hasSlotValue(saved[key]) || !Number.isFinite(Number(saved[key]))) {
						saved[key] = String(positions[slot - 1][axis.toLowerCase()]);
						changed = true;
					}
				}
				const oldKey = "pictureSettings" + slot;
				if (slot >= 5) {
					const legacy = readLegacySlotSettings(saved[oldKey]);
					for (const key of ["transition", "priority"]) {
						if (!hasSlotValue(saved[key + slot])) {
							const fallback = key === "transition" ? 1 : "inFrontOfPicture";
							saved[key + slot] = String(hasSlotValue(legacy[key]) ? legacy[key] : fallback);
							changed = true;
						}
					}
				}
				if (Object.prototype.hasOwnProperty.call(saved, oldKey)) {
					delete saved[oldKey];
					changed = true;
				}
				if (saved["slotSettings" + slot] !== "") {
					saved["slotSettings" + slot] = "";
					changed = true;
				}
			}
			if (!changed) return;
			const backupPath = filePath + ".jima-shared-slots-v1.1.6.bak";
			if (!fs.existsSync(backupPath)) fs.copyFileSync(filePath, backupPath, fs.constants.COPYFILE_EXCL);
			const newline = source.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
			const arrayStart = assignment.index + assignment[0].indexOf(assignment[1]);
			const arrayEnd = arrayStart + assignment[1].length;
			const updated = source.slice(0, arrayStart)
				+ JSON.stringify(pluginList, null, 4).replace(/\n/g, newline) + source.slice(arrayEnd);
			const temporary = filePath + ".jima-slots.tmp";
			try {
				fs.writeFileSync(temporary, updated, "utf8");
				fs.renameSync(temporary, filePath);
			} catch (error) {
				if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
				throw error;
			}
			Object.assign(parameters, saved);
			console.info("[JIMA] 已建立八個位置的共用座標並清理分類標題。請關閉試玩、重新開啟專案；原設定已備份。");
		} catch (error) {
			console.warn("[JIMA] 位置設定未轉換：" + error.message);
		}
	};

	registerStandingCommand( "syncPictureMenu", () => { syncGuiPictureOptions(); });

	registerStandingCommand( "processChar", args => {
		const text = args.text;
		exStandingPictureParseChar(text);

		// Keep unaddressed slots' current position and animation progress.
		if (!$gameSystem._LL_StandingPicture_holdSPicture) {
			($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture) {
				picture.show = false;
				picture.motion = "";
			});
		}
	});

	// 立ち絵表示ON・OFF
	registerStandingCommand( "setEnabled", args => {
		const enabled = (args.enabled === "true" || false);
		$gameSystem._StandingPictureDisabled = !enabled;
	});

	// 色調変更
	registerStandingCommand( "setTone", args => {
		const pictureTone = [Number(args.toneR), Number(args.toneG), Number(args.toneB), Number(args.toneC)];
		$gameSystem._StandingPictureTone = pictureTone;
	});

	// アニメーションフレーム数定義
	const animationFrame = {
		"yes":        24,
		"yesyes":     48,
		"no":         24,
		"noslow":     48,
		"jump":       24,
		"jumpjump":   48,
		"jumploop":   48,
		"shake":      1,
		"shakeloop":  1,
		"runleft":    1,
		"runright":   1,
		"noslowloop": 96,
		"breathing":  96,
		"breathing2": 96,
		"huwahuwa":   192,
		"none":       0
	};


	//-----------------------------------------------------------------------------
	// Game_System
	//
	// 立ち絵制御用の独自配列を追加定義します。

	const _Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.apply(this, arguments);

		this.iniLLStandingPictures();
		this._LL_StandingPicture_battleCache = null;
	};

	Game_System.prototype.iniLLStandingPictures = function() {
		// 立ち絵設定
		this._LL_StandingPicture_pictures = [];
		for (let i = 0; i < maxStandingPictureSlots; i++) {
			this._LL_StandingPicture_pictures.push({
				animationCount: 0,
				sPicture: null,
				show: false,
				refresh: false,
				motion: "",
				focus: false
			});
		}
		// ホールド設定
		this._LL_StandingPicture_holdSPicture = false;
	};

	Game_System.prototype.inBattleMakeCacheLLStandingPictures = function() {
		if (!this._LL_StandingPicture_battleCache) {
			this._LL_StandingPicture_battleCache = {
				pictures: this._LL_StandingPicture_pictures,
				holdSPicture: this._LL_StandingPicture_holdSPicture
			};
		}
		this.iniLLStandingPictures();
	};

	Game_System.prototype.refreshCacheLLStandingPictures = function() {
		if (this._LL_StandingPicture_battleCache) {
			this._LL_StandingPicture_pictures = this._LL_StandingPicture_battleCache.pictures;
			this._LL_StandingPicture_holdSPicture = this._LL_StandingPicture_battleCache.holdSPicture;
		}
		this._LL_StandingPicture_battleCache = null;
	};

	//-----------------------------------------------------------------------------
	// ExStandingPictureParseChar
	//
	// 立ち絵制御文字を解読する関数です。

	const exStandingPictureParseChar = function(text, resolvedPicture) {
		text = text.replace(/\\V\[(\d+)\]/gi, (_, p1) =>
			$gameVariables.value(parseInt(p1))
		);

		let processEscapeNumber = null;
		// Keep the selected speaker across plain messages during Hold Mode.
		// An explicit AA command still replaces the previous focus as before.
		const keepFocus = $gameSystem._LL_StandingPicture_holdSPicture
			&& !/\\AA\[(F{1,4}|[0-8]|R|N)\]/.test(text);

		// 立ち絵を更新
		($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture, index) {
			// 専用制御文字を取得 (\F[s])
			let sPictureNumber = null;
			if (index === 0) processEscapeNumber = text.match(/\\F\[(\w+)\]/) || text.match(/\\F1\[(\w+)\]/);
			if (index === 1) processEscapeNumber = text.match(/\\FF\[(\w+)\]/) || text.match(/\\F2\[(\w+)\]/);
			if (index === 2) processEscapeNumber = text.match(/\\FFF\[(\w+)\]/) || text.match(/\\F3\[(\w+)\]/);
			if (index === 3) processEscapeNumber = text.match(/\\FFFF\[(\w+)\]/) || text.match(/\\F4\[(\w+)\]/);
			if (index === 4) processEscapeNumber = text.match(/\\F5\[(\w+)\]/);
			if (index === 5) processEscapeNumber = text.match(/\\F6\[(\w+)\]/);
			if (index === 6) processEscapeNumber = text.match(/\\F7\[(\w+)\]/);
			if (index === 7) processEscapeNumber = text.match(/\\F8\[(\w+)\]/);
			if (processEscapeNumber && processEscapeNumber[1]) {
				sPictureNumber = processEscapeNumber[1];
			}

			// 専用制御文字を取得 (\M[s])
			let sPictureMotion = null;
			if (index === 0) processEscapeNumber = text.match(/\\M\[(\w+)\]/) || text.match(/\\M1\[(\w+)\]/);
			if (index === 1) processEscapeNumber = text.match(/\\MM\[(\w+)\]/) || text.match(/\\M2\[(\w+)\]/);
			if (index === 2) processEscapeNumber = text.match(/\\MMM\[(\w+)\]/) || text.match(/\\M3\[(\w+)\]/);
			if (index === 3) processEscapeNumber = text.match(/\\MMMM\[(\w+)\]/) || text.match(/\\M4\[(\w+)\]/);
			if (index === 4) processEscapeNumber = text.match(/\\M5\[(\w+)\]/);
			if (index === 5) processEscapeNumber = text.match(/\\M6\[(\w+)\]/);
			if (index === 6) processEscapeNumber = text.match(/\\M7\[(\w+)\]/);
			if (index === 7) processEscapeNumber = text.match(/\\M8\[(\w+)\]/);
			if (processEscapeNumber && processEscapeNumber[1]) {
				sPictureMotion = processEscapeNumber[1];
			}

			// 専用制御文字を取得 (\AA[s])
			let focusSPicture = false;
			if (index === 0) processEscapeNumber = text.match(/\\AA\[(F|1)\]/);
			if (index === 1) processEscapeNumber = text.match(/\\AA\[(FF|2)\]/);
			if (index === 2) processEscapeNumber = text.match(/\\AA\[(FFF|3)\]/);
			if (index === 3) processEscapeNumber = text.match(/\\AA\[(FFFF|4)\]/);
			if (index === 4) processEscapeNumber = text.match(/\\AA\[(5)\]/);
			if (index === 5) processEscapeNumber = text.match(/\\AA\[(6)\]/);
			if (index === 6) processEscapeNumber = text.match(/\\AA\[(7)\]/);
			if (index === 7) processEscapeNumber = text.match(/\\AA\[(8)\]/);
			if (processEscapeNumber && processEscapeNumber[1]) {
				focusSPicture = true;
			}
			// フォーカス設定
			if (!keepFocus) picture.focus = focusSPicture;

			if (sPictureNumber) {
				const override = resolvedPicture && resolvedPicture.slot === index + 1
					&& String(resolvedPicture.token || resolvedPicture.picture.id) === sPictureNumber;
				const sPicture = override ? resolvedPicture.picture : sPictureLists.find(function(item) {
					if (String(item.id) === resolvePictureId(sPictureNumber)) return true;
				});
				nextStandingChange(picture);
				picture.sPicture = sPicture;
				picture.show = sPicture ? true : false;
				picture.refresh = sPicture ? true : false;
				// 再生モーション定義
				picture.motion = sPictureMotion ? sPictureMotion : "none";
				picture.animationCount = animationFrame[picture.motion];
			} else {
				if (!$gameSystem._LL_StandingPicture_holdSPicture) {
					picture.show = false;
					picture.motion = "";
				} else if (sPictureMotion) {
					// 再生モーション更新
					picture.motion = sPictureMotion;
					picture.animationCount = animationFrame[picture.motion];
				}
			}
		}.bind(this));

		// 専用制御文字を取得 (\AA[R])
		let focusSPictureReset = false;
		processEscapeNumber = text.match(/\\AA\[(R|0)\]/);
		if (processEscapeNumber && processEscapeNumber[1]) {
			// フォーカス状態リセット
			focusSPictureReset = true;
		}
		// 専用制御文字を取得 (\AA[N])
		let focusSPictureAllout = false;
		processEscapeNumber = text.match(/\\AA\[(N)\]/);
		if (processEscapeNumber && processEscapeNumber[1]) {
			focusSPictureAllout = true;
		}
		// フォーカス状態をリフレッシュ
		const allNotFocus = ($gameSystem._LL_StandingPicture_pictures || []).every(function(value) {
			return value.focus === false;
		});
		if ((!keepFocus && allNotFocus) || focusSPictureReset) {
			($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture) {
				picture.focus = true;
			});
		}
		if (focusSPictureAllout) {
			($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture) {
				picture.focus = false;
			});
		}

		// 専用制御文字を取得 (\FH[s])
		let sPictureHold = null;
		processEscapeNumber = text.match(/\\FH\[(\w+)\]/);
		if (processEscapeNumber && processEscapeNumber[1]) {
			sPictureHold = processEscapeNumber[1];
		}
		// ホールドモードを切替
		if (sPictureHold === "ON") {
			$gameSystem._LL_StandingPicture_holdSPicture = true;
		} else if (sPictureHold === "OFF") {
			$gameSystem._LL_StandingPicture_holdSPicture = false;
		}
	};

	//-----------------------------------------------------------------------------
	// ExStandingPicture
	//
	// 立ち絵を表示する独自のクラスを追加定義します。

	class ExStandingPicture {

		static create (scene) {
			// 立ち絵スロット
			scene._spSprites = [];
			for (let i = 0; i < maxStandingPictureSlots; i++) {
				scene._spSprites.push(new Sprite_LL_SPicture());
				if (priorities[i] === "behindPicture") {
					scene._spriteset.addChildAt(scene._spSprites[i], scene._spriteset.children.indexOf(scene._spriteset._pictureContainer));
				} else if (priorities[i] === "betweenPictures") {
					scene._spriteset._pictureContainer.addChildAt(scene._spSprites[i], betweenPicturesPriority);
				} else if (priorities[i] === "inFrontOfWindow") {
					scene.addChildAt(scene._spSprites[i], scene.children.indexOf(scene._windowLayer) + 1);
				} else if (priorities[i] === "behindWindow") {
					// v2.6以前と同様の位置
					scene.addChildAt(scene._spSprites[i], scene.children.indexOf(scene._spriteset) + 1);
				} else {
					scene._spriteset.addChildAt(scene._spSprites[i], scene._spriteset.children.indexOf(scene._spriteset._pictureContainer) + 1);
				}
			}

			// 立ち絵画像を事前読み込み
			this.cachePictures();

			// 旧Ver.のセーブデータ読み込み対策
			if (typeof $gameSystem._LL_StandingPicture_pictures === "undefined") {
				$gameSystem.iniLLStandingPictures();
			}

			// 戦闘時判定
			if (SceneManager._scene.constructor === Scene_Battle) {
				// 表示中の立ち絵を消去
				$gameSystem.inBattleMakeCacheLLStandingPictures();
			} else {
				// 戦闘前に消去した立ち絵を戻す
				$gameSystem.refreshCacheLLStandingPictures();
			}

			// 立ち絵表示状態を継続
			($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture) {
				if (picture.show) {
					picture.refresh = true;
					picture.animationCount = animationFrame[picture.motion];
				}
			});
		}

		static update (scene) {
			(scene._spSprites || []).forEach(restoreFocusTransform);
			// 立ち絵を非表示に設定している場合、処理を中断
			if ($gameSystem._StandingPictureDisabled) {
				(scene._spSprites || []).forEach(function(sprite) {
					sprite.opacity = 0;
				});
				return;
			}

			// 立ち絵ピクチャ作成
			($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture, index) {
				// 立ち絵画像読み込み
				if (picture.sPicture && picture.refresh) {
					this.refresh(scene._spSprites[index], picture.sPicture, index + 1);
					picture.refresh = false;
				}
				// フェード処理
				if (picture.show) {
					this.fadeIn(scene._spSprites[index], picture.sPicture, index + 1);
				} else {
					this.fadeOut(scene._spSprites[index], picture.sPicture, index + 1);
				}
				// モーション再生
				if (!scene._spSprites[index].opening && !scene._spSprites[index].closing && picture.animationCount > 0) {
					picture.animationCount = this.animation(scene._spSprites[index], picture.motion, picture.animationCount);
				}
				updateStandingFocus(scene._spSprites[index], picture);
			}.bind(this));
		}

		static refresh (sSprite, sPicture, sNumber) {
			const resetFocus = sSprite.opacity === 0;
			sSprite.setPicture(sPicture);
			sSprite.showing = false;
			const sharedScale = sPicture.useGlobalScale !== false && sPicture.useGlobalScale !== "false";
			let calcScaleX = sharedScale ? globalScale : Number(sPicture.scaleX);
			const calcScaleY = sharedScale ? globalScale : Number(sPicture.scaleY);
			// 左右反転させる場合 (立ち絵2, 4, 6, 8)
			if (sNumber=== 2 || sNumber=== 4 || sNumber=== 6 || sNumber=== 8) calcScaleX *= Number(sPicture.reverse);
			// 同一位置的所有角色、表情都使用相同的共用定位點。
			const position = slotPositions[sNumber - 1];
			const x = position.x;
			const y = position.y;

			// 画像が読み込まれたあとに実行
			sSprite.bitmap.addLoadListener(function() {
				restoreFocusTransform(sSprite);
				if (resetFocus) sSprite._jimaFocusEffect = null;
				if (Number(sPicture.origin) === 0) {
					// 左上原点
					sSprite.x = x;
					sSprite.y = y;
					sSprite.originX = x;
					sSprite.originY = y;
				} else {
					// 中央原点
					sSprite.x = x - (sSprite.width * calcScaleX / 100) / 2;
					sSprite.y = y - (sSprite.height * calcScaleY / 100) / 2;
					sSprite.originX = x - (sSprite.width * calcScaleX / 100) / 2;
					sSprite.originY = y - (sSprite.height * calcScaleY / 100) / 2;
				}
				// 切替効果
				if (sSprite.opacity === 0) {
					if (transitions[sNumber - 1] === 0) sSprite.opacity = Number(sPicture.opacity);
					if (transitions[sNumber - 1] === 2) sSprite.x -= 30;
					if (transitions[sNumber - 1] === 3) sSprite.x += 30;
					if (transitions[sNumber - 1] === 4) sSprite.y += 30;
					if (transitions[sNumber - 1] === 5) sSprite.y -= 30;
				}
				sSprite.setBlendMode(Number(sPicture.blendMode));
				sSprite.setColorTone($gameSystem._StandingPictureTone ? $gameSystem._StandingPictureTone : [0, 0, 0, 0]);
				sSprite.setBlendColor([0, 0, 0, 0]);
				sSprite.scale.x = calcScaleX / 100;
				sSprite.scale.y = calcScaleY / 100;
				sSprite.showing = true;
			}.bind(this));
		}

		static fadeIn (sSprite, sPicture, sNumber) {
			if (!sSprite.showing) return;
			if (sSprite.opacity >= Number(sPicture.opacity)) {
				sSprite.opening = false;
				sSprite.opacity = Number(sPicture.opacity);
				return;
			}
			sSprite.opening = true;
			sSprite.closing = false;
			// 切替効果
			if (sSprite.originX > sSprite.x) sSprite.x += 2;
			if (sSprite.originX < sSprite.x) sSprite.x -= 2;
			if (sSprite.originY < sSprite.y) sSprite.y -= 2;
			if (sSprite.originY > sSprite.y) sSprite.y += 2;
			sSprite.opacity += Number(sPicture.opacity) / 15;
		}

		static fadeOut (sSprite, sPicture, sNumber) {
			if (sSprite.opacity === 0) {
				sSprite.closing = false;
				return;
			}
			sSprite.closing = true;
			if (!sPicture) {
				sSprite.opacity = 0;
				return;
			}
			sSprite.opacity -= Number(sPicture.opacity) / 15;
			// 切替効果
			if (transitions[sNumber - 1] === 0) sSprite.opacity = 0;
			if (transitions[sNumber - 1] === 2 && sSprite.originX - 30 < sSprite.x) sSprite.x -= 2;
			if (transitions[sNumber - 1] === 3 && sSprite.originX + 30 > sSprite.x) sSprite.x += 2;
			if (transitions[sNumber - 1] === 4 && sSprite.originY + 30 > sSprite.y) sSprite.y += 2;
			if (transitions[sNumber - 1] === 5 && sSprite.originY - 30 < sSprite.y) sSprite.y -= 2;
		}

		static animation (sSprite, sMotion, animationCount) {
			if (!sSprite.showing) return animationCount;
			if (sMotion === "yes") {
				if (animationCount > 12) {
					sSprite.y += 2;
				} else {
					sSprite.y -= 2;
				}
				animationCount -= 1;
			}
			if (sMotion === "yesyes") {
				if (animationCount > 36) {
					sSprite.y += 2;
				} else if (animationCount > 24) {
					sSprite.y -= 2;
				} else if (animationCount > 12) {
					sSprite.y += 2;
				} else {
					sSprite.y -= 2;
				}
				animationCount -= 1;
			}
			if (sMotion === "no") {
				if (animationCount > 18) {
					sSprite.x += 2;
				} else if (animationCount > 6) {
					sSprite.x -= 2;
				} else {
					sSprite.x += 2;
				}
				animationCount -= 1;
			}
			if (sMotion === "noslow") {
				if (animationCount > 36) {
					sSprite.x += 1;
				} else if (animationCount > 12) {
					sSprite.x -= 1;
				} else {
					sSprite.x += 1;
				}
				animationCount -= 1;
			}
			if (sMotion === "jump") {
				if (animationCount > 12) {
					sSprite.y -= 2;
				} else {
					sSprite.y += 2;
				}
				animationCount -= 1;
			}
			if (sMotion === "jumpjump") {
				if (animationCount > 36) {
					sSprite.y -= 2;
				} else if (animationCount > 24) {
					sSprite.y += 2;
				} else if (animationCount > 12) {
					sSprite.y -= 2;
				} else {
					sSprite.y += 2;
				}
				animationCount -= 1;
			}
			if (sMotion === "jumploop") {
				if (animationCount > 36) {
					sSprite.y -= 2;
				} else if (animationCount > 24) {
					sSprite.y += 2;
				}
				animationCount -= 1;
				if (animationCount === 0) animationCount = 48;
			}
			if (sMotion === "shake") {
				if (animationCount <= 2) {
					sSprite.x -= 2;
					animationCount += 1;
				} else if (animationCount <= 4) {
					sSprite.y -= 2;
					animationCount += 1;
				} else if (animationCount <= 6) {
					sSprite.x += 4;
					sSprite.y += 4;
					animationCount += 1;
				} else if (animationCount <= 8) {
					sSprite.y -= 2;
					animationCount += 1;
				} else if (animationCount === 9) {
					sSprite.x -= 2;
					animationCount += 1;
				} else if (animationCount === 10) {
					sSprite.x -= 2;
					animationCount = 0;
				}
			}
			if (sMotion === "shakeloop") {
				if (animationCount <= 2) {
					sSprite.x -= 1;
					animationCount += 1;
				} else if (animationCount <= 4) {
					sSprite.y -= 1;
					animationCount += 1;
				} else if (animationCount <= 6) {
					sSprite.x += 2;
					sSprite.y += 2;
					animationCount += 1;
				} else if (animationCount <= 8) {
					sSprite.y -= 1;
					animationCount += 1;
				} else if (animationCount <= 10) {
					sSprite.x -= 1;
					animationCount += 1;
				}
				if (animationCount > 10) animationCount = 1;
			}
			if (sMotion === "runleft") {
				sSprite.x -= 16;
				if (sSprite.x < -2000) animationCount = 0;
			}
			if (sMotion === "runright") {
				sSprite.x += 16;
				if (sSprite.x > 2000) animationCount = 0;
			}
			if (sMotion === "noslowloop") {
				if (animationCount > 72) {
					sSprite.x += 0.25;
				} else if (animationCount > 24) {
					sSprite.x -= 0.25;
				} else {
					sSprite.x += 0.25;
				}
				animationCount -= 1;
				if (animationCount === 0) animationCount = animationFrame["noslowloop"];
			}
			if (sMotion === "breathing") {
				if (animationCount > 72) {
					sSprite.y += 0.5;
				} else if (animationCount > 48) {
					sSprite.y -= 0.5;
				}
				animationCount -= 1;
				if (animationCount === 0) animationCount = animationFrame["breathing"];
			}
			if (sMotion === "breathing2") {
				if (animationCount > 48) {
					sSprite.y -= sSprite.height * 0.0003;
					sSprite.scale.y += 0.0003;
				} else {
					sSprite.y += sSprite.height * 0.0003;
					sSprite.scale.y -= 0.0003;
				}
				animationCount -= 1;
				if (animationCount === 0) animationCount = animationFrame["breathing2"];
			}
			if (sMotion === "huwahuwa") {
				if (animationCount > 144) {
					sSprite.y += 0.25;
				} else if (animationCount > 48) {
					sSprite.y -= 0.25;
				} else {
					sSprite.y += 0.25;
				}
				animationCount -= 1;
				if (animationCount === 0) animationCount = animationFrame["huwahuwa"];
			}
			return animationCount;
		}

		static cachePictures() {
			if (!bootCachePictures) return;

			sPictureLists.forEach(function(pictureList) {
				loadJimaPicture(pictureList.imageName);
			});
		}
	}

	const _Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		_Scene_Map_update.apply(this, arguments);
		ExStandingPicture.update(this);
	};

	const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
		_Scene_Map_createDisplayObjects.apply(this, arguments);
		ExStandingPicture.create(this);
	};

	const _Scene_Battle_update = Scene_Battle.prototype.update;
	Scene_Battle.prototype.update = function() {
		_Scene_Battle_update.apply(this, arguments);
		ExStandingPicture.update(this);
	};

	const _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
	Scene_Battle.prototype.createDisplayObjects = function() {
		_Scene_Battle_createDisplayObjects.apply(this, arguments);
		ExStandingPicture.create(this);
	};

	const _Window_Message_updateClose = Window_Message.prototype.updateClose;
	Window_Message.prototype.updateClose = function() {
		// ピクチャ消去判定
		if (this._closing && this.openness === 255) {
			if (!$gameSystem._LL_StandingPicture_holdSPicture) {
				($gameSystem._LL_StandingPicture_pictures || []).forEach(function(picture) {
					picture.show = false;
					picture.motion = "";
				});
			}
	    }
		_Window_Message_updateClose.apply(this, arguments);
	};

	const _Window_Message_startMessage = Window_Message.prototype.startMessage;
	Window_Message.prototype.startMessage = function() {
		const messageAllText = $gameMessage.allText();
		const pictures = $gameSystem._LL_StandingPicture_pictures || [];
		const keepGuiPictures = pictures.some(picture => picture.show && picture._jimaKeepOnNextMessage);
		const previousHold = $gameSystem._LL_StandingPicture_holdSPicture;
		pictures.forEach(picture => { delete picture._jimaKeepOnNextMessage; });
		if (keepGuiPictures) $gameSystem._LL_StandingPicture_holdSPicture = true;
		try {
			exStandingPictureParseChar(messageAllText);
		} finally {
			if (keepGuiPictures && !/\\FH\[(ON|OFF)\]/.test(messageAllText)) {
				$gameSystem._LL_StandingPicture_holdSPicture = previousHold;
			}
		}

		_Window_Message_startMessage.apply(this, arguments);
	};

	const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
	Window_Base.prototype.convertEscapeCharacters = function(text) {
		// 立ち絵呼び出し用の制御文字(\V[n]内包)を追加
		text = text.replace(/\\F\[\\V\[(\d+)\]\]/gi, "");
		text = text.replace(/\\FF\[\\V\[(\d+)\]\]/gi, "");
		text = text.replace(/\\FFF\[\\V\[(\d+)\]\]/gi, "");
		text = text.replace(/\\FFFF\[\\V\[(\d+)\]\]/gi, "");
		text = text.replace(/\\F[12345678]\[\\V\[(\d+)\]\]/gi, "");

		// 立ち絵呼び出し用の制御文字を追加
		text = text.replace(/\\F\[(\w+)\]/gi, "");
		text = text.replace(/\\FF\[(\w+)\]/gi, "");
		text = text.replace(/\\FFF\[(\w+)\]/gi, "");
		text = text.replace(/\\FFFF\[(\w+)\]/gi, "");
		text = text.replace(/\\F[12345678]\[(\w+)\]/gi, "");
		text = text.replace(/\\M\[(\w+)\]/gi, "");
		text = text.replace(/\\MM\[(\w+)\]/gi, "");
		text = text.replace(/\\MMM\[(\w+)\]/gi, "");
		text = text.replace(/\\MMMM\[(\w+)\]/gi, "");
		text = text.replace(/\\M[12345678]\[(\w+)\]/gi, "");
		text = text.replace(/\\AA\[(\w+)\]/gi, "");
		text = text.replace(/\\FH\[(\w+)\]/gi, "");

		return _Window_Base_convertEscapeCharacters.call(this, text);
	};


	const _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
	Scene_Boot.prototype.onDatabaseLoaded = function() {
		_Scene_Boot_onDatabaseLoaded.apply(this, arguments);
		migrateSlotSettings();
		syncGuiPictureOptions();

		// 立ち絵画像を事前読み込み
		ExStandingPicture.cachePictures();
	};


	//-----------------------------------------------------------------------------
	// Sprite_LL_SPicture
	//
	// 立ち絵を表示するための独自のスプライトを追加定義します。

	function Sprite_LL_SPicture() {
		this.initialize.apply(this, arguments);
	}

	Sprite_LL_SPicture.prototype = Object.create(Sprite.prototype);
	Sprite_LL_SPicture.prototype.constructor = Sprite_LL_SPicture;

	Sprite_LL_SPicture.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);

		this.bitmap = null;
		this.opacity = 0;
		this.opening = false;
		this.closing = false;
		this.originX = 0;
		this.originY = 0;
		this.showing = false;

		this.setOverlayBitmap();
		this.initMembers();
	};

	Sprite_LL_SPicture.prototype.setOverlayBitmap = function() {
		this._spriteBlink = new Sprite();
		this._spriteBlink.visible = false;
		this.addChild(this._spriteBlink);
		this._spriteBlink2 = new Sprite();
		this._spriteBlink2.visible = false;
		this.addChild(this._spriteBlink2);
	};

	Sprite_LL_SPicture.prototype.initMembers = function() {
		this._blinkInterval = 0;
		this._blinkWait = 0;
		this._blinkAnimation = 0;
	};

	Sprite_LL_SPicture.prototype.update = function() {
		Sprite.prototype.update.call(this);

		this.updateBlink();
	};

	Sprite_LL_SPicture.prototype.updateBlink = function() {
		if (this.opening || this.closing) {
			this._spriteBlink.visible = false;
			this._spriteBlink2.visible = false;
			return;
		}

		if (this._blinkInterval <= 0) {
			this._blinkWait--;
			if (this._blinkWait <= 0) {
				this._blinkAnimation++;
				if (this._blinkAnimation > 2 || (this._blinkAnimation === 2 && !this._spriteBlink2.bitmap)) {
					this._blinkAnimation = 0;
				}

				switch (this._blinkAnimation) {
					case 1:
						this._spriteBlink.visible = true;
						this._spriteBlink2.visible = false;
						this._blinkWait = blinkWaitCount;
						this._blinkInterval = 0;
						break;
					case 2:
						this._spriteBlink.visible = false;
						this._spriteBlink2.visible = true;
						this._blinkWait = blinkWaitCount;
						this._blinkInterval = 0;
						break;
					default:
						this._spriteBlink.visible = false;
						this._spriteBlink2.visible = false;
						this._blinkWait = blinkWaitCount;
						this._blinkInterval = Math.randomInt(blinkInterval * 2);
						break;
				}
			}
		} else {
			this._blinkInterval--;
		}
	};

	Sprite_LL_SPicture.prototype.setPicture = function(sPicture) {
		// ベース画像
		this.bitmap = null;
		this.bitmap = loadJimaPicture(sPicture.imageName);
		// 瞬き1
		this._spriteBlink.bitmap = null;
		this._spriteBlink.bitmap = loadJimaPicture(sPicture.imageNameBlink);
		this._spriteBlink.visible = false;
		// 瞬き2
		this._spriteBlink2.bitmap = null;
		this._spriteBlink2.bitmap = loadJimaPicture(sPicture.imageNameBlink2);
		this._spriteBlink2.visible = false;

		this._blinkInterval = Math.randomInt(blinkInterval * 2);
		this._blinkWait = blinkWaitCount;
		this._blinkAnimation = 0;
	};

	Sprite_LL_SPicture.prototype.setBlendColor = function(color) {
		Sprite.prototype.setBlendColor.call(this, color);

		// MZでは不要 (MVでは必要)
		// this._spriteBlink.setBlendColor(this.getBlendColor());
		// this._spriteBlink2.setBlendColor(this.getBlendColor());
	};

	Sprite_LL_SPicture.prototype.setColorTone = function(tone) {
		Sprite.prototype.setColorTone.call(this, tone);

		// MZでは不要 (MVでは必要)
		// this._spriteBlink.setColorTone(this.getColorTone());
		// this._spriteBlink2.setColorTone(this.getColorTone());
	};

	Sprite_LL_SPicture.prototype.setBlendMode = function(mode) {
		this.blendMode = mode;
		this._spriteBlink.blendMode = mode;
		this._spriteBlink2.blendMode = mode;
	};
})();
