/*:
 * @target MZ
 * @plugindesc v1.2.0 預設含简体中文；Logo 後選語言與驚嚇設定，再進入手機標題。
 * @author JIMA / ChatGPT
 * @orderAfter Chimaki_Lang
 * @orderAfter PhoneTitleMZ
 * @orderAfter JIMA_StartupLogoMZ
 *
 * @help
 * JIMA_StartupOptionsMZ.js v1.2.0
 *
 * 【安裝】
 * 將本檔放進 js/plugins/，在插件管理員新增並設為 ON。
 * 建議插件排列（由上到下）：
 *   Chimaki_Lang
 *   PhoneTitleMZ
 *   JIMA_StartupLogoMZ
 *   JIMA_StartupOptionsMZ（本插件放在上述兩支下方）
 *
 * 實際畫面順序：
 *   JIMA Logo → 語言選擇 → 是否關閉驚嚇？ → PhoneTitle 手機主選單
 * 不必修改原本兩支插件，不需要額外圖片。
 * 每次重新開啟遊戲都會詢問；同次執行回到標題不會再問。
 * Logo 跳過仍會詢問。戰鬥測試／事件測試不會詢問或覆寫資料。
 *
 * 【Chimaki_Lang 串接】
 * 預設語言選項：繁體中文、简体中文、English、日本語。
 * 請搭配此次更新的 Chimaki_Lang.js 3.1.1。
 * 舊的「語言選項」參數若缺少簡體中文，也會自動補入 cn。
 * 預設直接讀取 Chimaki_Lang 的 allLang／allLangShow。
 * 原插件有提供 LANG_SHOW 時，優先使用其執行時的語言顯示名稱。
 * 只顯示該插件已支援的語言，代碼完全沿用 CSV 欄名，不另外創建語系。
 * 玩家選擇語言時，直接更新 ConfigManager.lang。
 * 完成兩頁詢問後呼叫 ConfigManager.save() 保存語系。
 * 下次仍會詢問，游標預設放在已儲存的語言；不會略過詢問畫面。
 * 原有的對話、選項、資料庫文字，繼續由 Chimaki_Lang 的 \T[id] 取 CSV。
 * 本插件不複製 CSV 解析器，也不改寫 Chimaki_Lang 的語音功能。
 *
 * 常見代碼：tw=繁中、cn=簡中、en=英文、jp=日文。
 * jp 或 ja 以 Chimaki_Lang 實際設定及 CSV 欄名為準。
 * 「自動讀取 Chimaki 語言清單」為 ON 時，選項名稱與順序由該插件決定；
 * 本插件「語言選項」仍可指定對應的數值與詢問介面語言。
 * OFF 時可自訂顯示清單，但仍只接受 Chimaki_Lang 已支援的語言。
 * 舊版 zh-TW／zh-CN／ja 設定會比對到對應的 tw／cn／jp。
 *
 * 【開關與選填變數】
 * 「關閉驚嚇開關」請選一個未使用的開關，預設 0=不綁定。
 * 「語言變數」可保持 0；實際翻譯使用 ConfigManager.lang，不依賴變數。
 * 若有設定語言變數，預設值為：1=tw、2=en、3=jp、4=cn、5=ru、6=th。
 * 其他語言自動分配不重複數值；亦可在「語言選項」指定。
 * 透過原插件的設定選單改語言，也會同步選填的語言變數。
 *
 * 關閉驚嚇開關：
 *   是，關閉驚嚇 → ON / true
 *   否，保留驚嚇 → OFF / false
 * 這個開關的意義是「已關閉驚嚇」，不是「啟用驚嚇」。
 *
 * 【在事件中使用】
 * 對話翻譯：沿用原插件的 \T[文本編號] 與既有 CSV。
 * 驚嚇演出：只有在「關閉驚嚇」開關為 OFF 時播放。
 * 尚未使用 CSV 文本的硬編碼文字（例如目前 PhoneTitle 的中文選項），
 * 仍需另外改成多語文本；本插件不會自行辨認／刪除驚嚇事件。
 *
 * 【詢問文字的 CSV 自訂（選用）】
 * 預設內建繁中、簡中、英文、日文，不新增 CSV 也能顯示。
 * 如需改文字，可將以下 id 加入原本已載入的 CSV，各語言欄填入譯文：
 * JIMA_STARTUP_QUESTION / JIMA_STARTUP_DESCRIPTION / JIMA_STARTUP_DETAIL
 * JIMA_STARTUP_DISABLE / JIMA_STARTUP_ENABLE / JIMA_STARTUP_BACK
 * JIMA_STARTUP_HINT / JIMA_STARTUP_POINTER
 * 透過 LangManager.text(id) 取字；沒有譯文時採用內建文字。
 * 其他語言若沒有設定詢問介面語言或 CSV 譯文，詢問頁預設顯示英文。
 *
 * 【新遊戲／讀檔】
 * 本次選擇在確認後寫入指定變數／開關。
 * 新遊戲重新建立物件後、讀檔載入物件後，會再次套用本次驚嚇設定。
 * 語言以 ConfigManager.lang 為準，不讓舊存檔或舊的啟動選擇蓋回語系。
 * 遊戲執行中不會每幀強制寫入；事件仍可改動這些變數／開關。
 * 若事件重設全部變數／開關，請呼叫本插件指令「重新套用本次選擇」。
 * 語言會記憶；驚嚇選擇只保留本次執行，下次重新詢問。
 *
 * 【腳本 API（不設變數／開關也能讀取）】
 * JIMA_StartupOptionsMZ.languageCode       // 與 ConfigManager.lang 相同的 CSV 代碼
 * JIMA_StartupOptionsMZ.languageValue      // 1=繁中 / 2=英文 / 3=日文 / 4=簡中
 * JIMA_StartupOptionsMZ.scareDisabled      // true = 關閉驚嚇
 * JIMA_StartupOptionsMZ.confirmed          // 已完成本次詢問
 * JIMA_StartupOptionsMZ.applyToGame()      // 依目前語系再次寫入變數／開關
 *
 * 語言頁：上下鍵選擇、Enter／空白鍵確定，也可滑鼠／觸控。
 * 驚嚇頁：Esc／右鍵，或選擇「返回語言選擇」，可回到上一頁。
 * 不會變更遊戲解析度、手機背景、手機螢幕四角或 Logo 素材。
 * 授權：MIT，可修改、可商用。
 *
 * @param LanguageVariableId
 * @text 語言變數
 * @desc 選填。0=不綁定；實際切換使用 ConfigManager.lang。1=繁中、2=英文、3=日文、4=簡中。
 * @type variable
 * @default 0
 *
 * @param DisableScaresSwitchId
 * @text 關閉驚嚇開關
 * @desc 選一個未使用的開關。ON=關閉驚嚇，OFF=保留驚嚇。0=不綁定。
 * @type switch
 * @default 0
 *
 * @param UseChimakiLanguages
 * @text 自動讀取 Chimaki 語言清單
 * @desc ON=讀取 Chimaki_Lang 的語言清單、顯示名稱及順序。建議維持 ON。
 * @type boolean
 * @default true
 *
 * @param Languages
 * @text 語言選項
 * @desc 可設定對應數值／詢問語言。自動清單 ON 時，選項名稱與順序以 Chimaki_Lang 為準。
 * @type struct<JimaStartupLanguage>[]
 * @default ["{\"Label\":\"繁體中文\",\"Code\":\"tw\",\"Value\":\"1\",\"UiLanguage\":\"zh-TW\"}","{\"Label\":\"简体中文\",\"Code\":\"cn\",\"Value\":\"4\",\"UiLanguage\":\"zh-CN\"}","{\"Label\":\"English\",\"Code\":\"en\",\"Value\":\"2\",\"UiLanguage\":\"en\"}","{\"Label\":\"日本語\",\"Code\":\"jp\",\"Value\":\"3\",\"UiLanguage\":\"ja\"}"]
 *
 * @param DefaultLanguage
 * @text 預設聚焦語言代碼
 * @desc 留空=以 ConfigManager.lang（已儲存的語言）聚焦。亦可填 tw、en、jp 等實際代碼。
 * @type string
 * @default
 *
 * @param DefaultDisableScares
 * @text 預設聚焦「關閉驚嚇」
 * @desc ON 時游標預設放在「是，關閉驚嚇」。玩家仍須手動確認。
 * @type boolean
 * @on 是，關閉驚嚇
 * @off 否，保留驚嚇
 * @default true
 *
 * @param FadeFrames
 * @text 畫面淡入淡出幀數
 * @desc 60 幀約 1 秒；0=不淡入淡出。不影響 Logo 或手機自己的淡入。
 * @type number
 * @min 0
 * @max 120
 * @default 24
 *
 * @command ApplyChoices
 * @text 重新套用本次選擇
 * @desc 將已確認的語言與關閉驚嚇設定，再次寫入指定變數／開關。
 */

/*~struct~JimaStartupLanguage:
 * @param Label
 * @text 顯示名稱
 * @type string
 * @default 繁體中文
 *
 * @param Code
 * @text 語言代碼
 * @type string
 * @default tw
 *
 * @param Value
 * @text 寫入變數的數值
 * @type number
 * @min 1
 * @default 1
 *
 * @param UiLanguage
 * @text 詢問介面語言
 * @desc 第二頁與操作提示使用的語言；不會自動翻譯遊戲內容。
 * @type select
 * @option 繁體中文
 * @value zh-TW
 * @option English
 * @value en
 * @option 简体中文
 * @value zh-CN
 * @option 日本語
 * @value ja
 * @default zh-TW
 */

(() => {
    "use strict";

    if (globalThis.JIMA_StartupOptionsMZ) {
        console.warn("[JIMA_StartupOptionsMZ] 請勿重複啟用本插件。");
        return;
    }

    const source = document.currentScript ? document.currentScript.src : "";
    const match = decodeURIComponent(source).match(/([^/]+)\.js(?:\?.*)?$/i);
    const pluginName = match ? match[1] : "JIMA_StartupOptionsMZ";
    const params = PluginManager.parameters(pluginName);
    const integerParam = (key, fallback, max = Number.MAX_SAFE_INTEGER) => {
        const raw = params[key];
        const value = raw === undefined || raw === "" ? fallback : Number(raw);
        return Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : fallback;
    };
    const defaults = [
        { label: "繁體中文", code: "tw", value: 1, ui: "zh-TW" },
        { label: "简体中文", code: "cn", value: 4, ui: "zh-CN" },
        { label: "English", code: "en", value: 2, ui: "en" },
        { label: "日本語", code: "jp", value: 3, ui: "ja" }
    ];
    const uiKeys = ["zh-TW", "zh-CN", "en", "ja"];
    const canonicalCode = code => {
        const key = String(code || "").toLowerCase().replace(/_/g, "-");
        if (["tw", "zh-tw", "zh-hant"].includes(key)) return "tw";
        if (["cn", "zh-cn", "zh-hans"].includes(key)) return "cn";
        if (["jp", "ja", "ja-jp"].includes(key)) return "jp";
        return key;
    };
    const inferUi = code => ({ tw: "zh-TW", cn: "zh-CN", jp: "ja", en: "en" })[canonicalCode(code)] || "en";
    const chimakiConnected = () => typeof ConfigManager !== "undefined" &&
        typeof globalThis.LangManager === "function" && Array.isArray(globalThis.LANG_LIST);

    function includeSimplifiedChinese(entries) {
        if (entries.some(item => canonicalCode(item.code) === "cn")) return entries;
        let value = 4;
        while (entries.some(item => item.value === value)) value++;
        return entries.concat({ label: "简体中文", code: "cn", value, ui: "zh-CN" });
    }

    function readLanguages() {
        if (!params.Languages) return defaults;
        try {
            const rows = JSON.parse(params.Languages);
            if (!Array.isArray(rows)) throw new Error("語言選項必須是清單");
            const result = [];
            for (const row of rows) {
                const item = typeof row === "string" ? JSON.parse(row) : row;
                const label = String(item && item.Label || "").trim();
                const code = String(item && item.Code || "").trim();
                const value = Number(item && item.Value);
                if (!label || !code || !Number.isSafeInteger(value) || value <= 0 ||
                    result.some(other => other.code === code || other.value === value)) {
                    console.warn(`[${pluginName}] 已略過不完整或重複的語言選項。`);
                    continue;
                }
                const ui = uiKeys.includes(item.UiLanguage) ? item.UiLanguage : inferUi(code);
                result.push({ label, code, value, ui });
            }
            return result.length ? includeSimplifiedChinese(result) : defaults;
        } catch (error) {
            console.warn(`[${pluginName}] 語言參數無效，改用繁中／簡中／英文／日文。`, error);
            return defaults;
        }
    }

    const manualLanguages = readLanguages();
    let languages = manualLanguages;
    let allLanguages = manualLanguages;
    const settings = {
        languageVariableId: integerParam("LanguageVariableId", 0),
        disableScaresSwitchId: integerParam("DisableScaresSwitchId", 0),
        useChimakiLanguages: params.UseChimakiLanguages !== "false",
        defaultLanguage: String(params.DefaultLanguage || "").trim(),
        defaultDisableScares: params.DefaultDisableScares !== "false",
        fadeFrames: integerParam("FadeFrames", 24, 120)
    };
    const session = {
        shown: false,
        confirmed: false,
        language: languages[0],
        scareDisabled: settings.defaultDisableScares
    };

    // Chimaki's editor parameters can be JSON arrays or the single-quoted
    // array literals shown in its help. Parse strings without executing code.
    function readLabelArray(raw) {
        if (Array.isArray(raw)) return raw.map(String);
        const source = String(raw || "").trim();
        try {
            const result = JSON.parse(source);
            if (Array.isArray(result)) return result.map(String);
        } catch (_) { /* Try Chimaki's documented single-quoted array below. */ }
        if (/^\[\s*(?:'(?:[^'\\]|\\.)*'\s*(?:,\s*'(?:[^'\\]|\\.)*'\s*)*,?\s*)?\]$/.test(source)) {
            return (source.match(/'(?:[^'\\]|\\.)*'/g) || []).map(value =>
                value.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\"));
        }
        return [];
    }

    function buildLanguages() {
        if (!chimakiConnected()) {
            console.warn(`[${pluginName}] 未偵測到 Chimaki_Lang，請確認已啟用並放在本插件上方。`);
            return manualLanguages;
        }
        const supported = [...new Set(globalThis.LANG_LIST.filter(code =>
            typeof code === "string" && code.trim().length > 0))];
        if (!supported.length) {
            throw new Error(`[${pluginName}] Chimaki_Lang 的語言清單為空，請先設定 allLang。`);
        }
        const chimakiParams = PluginManager.parameters("Chimaki_Lang");
        const labels = Array.isArray(globalThis.LANG_SHOW)
            ? globalThis.LANG_SHOW : readLabelArray(chimakiParams.allLangShow);
        const names = { tw: "繁體中文", cn: "简体中文", en: "English", jp: "日本語", ru: "Русский", th: "ไทย" };
        const numbers = { tw: 1, en: 2, jp: 3, cn: 4, ru: 5, th: 6 };
        const usedValues = new Set();
        allLanguages = supported.map((code, index) => {
            const manual = manualLanguages.find(item => item.code === code) ||
                manualLanguages.find(item => canonicalCode(item.code) === canonicalCode(code));
            let value = manual ? manual.value : numbers[canonicalCode(code)];
            if (!value || usedValues.has(value)) {
                value = 1;
                while (usedValues.has(value) || Object.values(numbers).includes(value) ||
                    manualLanguages.some(item => item.value === value)) value++;
            }
            usedValues.add(value);
            return {
                label: labels[index] || names[canonicalCode(code)] || code,
                code, value, ui: manual ? manual.ui : inferUi(code)
            };
        });
        if (!settings.useChimakiLanguages) {
            const custom = [];
            for (const item of manualLanguages) {
                const actual = allLanguages.find(other => other.code === item.code) ||
                    allLanguages.find(other => canonicalCode(other.code) === canonicalCode(item.code));
                if (actual && !custom.some(other => other.code === actual.code)) {
                    custom.push({ ...actual, label: item.label, ui: item.ui });
                } else {
                    console.warn(`[${pluginName}] 略過未受 Chimaki_Lang 支援或重複的語言：${item.code}`);
                }
            }
            if (custom.length) return custom;
            console.warn(`[${pluginName}] 自訂清單沒有可用語言，改用 Chimaki_Lang 的清單。`);
        }
        return allLanguages;
    }

    function initialLanguage() {
        const code = settings.defaultLanguage || (chimakiConnected() ? ConfigManager.lang : "");
        return languages.find(item => item.code === code) ||
            languages.find(item => canonicalCode(item.code) === canonicalCode(code)) || languages[0];
    }

    function currentLanguage() {
        if (chimakiConnected()) {
            const current = allLanguages.find(item => item.code === ConfigManager.lang);
            if (current) return current;
        }
        return session.language;
    }

    function setChimakiLanguage(language) {
        if (chimakiConnected() && globalThis.LANG_LIST.includes(language.code)) {
            ConfigManager.lang = language.code;
        }
    }

    function saveChimakiLanguage() {
        if (!chimakiConnected() || typeof ConfigManager.save !== "function") return;
        try {
            // Core versions/plugins differ: save() can return undefined or a
            // Promise. Handle both without blocking the transition to Title.
            const result = ConfigManager.save();
            if (result && typeof result.catch === "function") {
                result.catch(error => console.warn(`[${pluginName}] 語系設定儲存失敗。`, error));
            }
        } catch (error) {
            console.warn(`[${pluginName}] 語系設定儲存失敗。`, error);
        }
    }

    const strings = {
        "zh-TW": {
            question: "是否關閉驚嚇模式？",
            description: "請選擇是否保留突然出現的驚嚇演出。",
            detail: "依照自己的喜好選擇即可。",
            disable: "是，關閉驚嚇",
            enable: "否，保留驚嚇",
            back: "返回語言選擇",
            hint: "↑ ↓ 選擇　Enter 確定　Esc 返回",
            pointer: "也可使用滑鼠或觸控選擇"
        },
        "zh-CN": {
            question: "是否关闭惊吓模式？",
            description: "请选择是否保留突然出现的惊吓演出。",
            detail: "按照自己的喜好选择即可。",
            disable: "是，关闭惊吓",
            enable: "否，保留惊吓",
            back: "返回语言选择",
            hint: "↑ ↓ 选择　Enter 确定　Esc 返回",
            pointer: "也可使用鼠标或触控选择"
        },
        en: {
            question: "Turn off jump scares?",
            description: "Choose whether to keep sudden scare effects.",
            detail: "Select the option you prefer.",
            disable: "Yes, turn off jump scares",
            enable: "No, keep jump scares",
            back: "Back to language selection",
            hint: "↑ ↓ Select   Enter Confirm   Esc Back",
            pointer: "Mouse and touch controls are also available"
        },
        ja: {
            question: "びっくり演出をオフにしますか？",
            description: "突然驚かせる演出を表示するか選んでください。",
            detail: "お好みの設定をお選びください。",
            disable: "はい、びっくり演出をオフ",
            enable: "いいえ、びっくり演出を残す",
            back: "言語選択に戻る",
            hint: "↑ ↓ 選択　Enter 決定　Esc 戻る",
            pointer: "マウス・タッチでも選択できます"
        }
    };

    function questionText(language) {
        const fallback = strings[language.ui] || strings.en;
        const result = { ...fallback };
        if (chimakiConnected() && ConfigManager.lang === language.code) {
            for (const name of Object.keys(result)) {
                const key = `JIMA_STARTUP_${name.toUpperCase()}`;
                const translated = globalThis.LangManager.text(key);
                if (typeof translated === "string" && translated.trim() && translated !== key) {
                    result[name] = translated;
                }
            }
        }
        return result;
    }
    const normalGame = () => !DataManager.isBattleTest() && !DataManager.isEventTest();
    const uiScale = () => Math.min(1.25, Graphics.boxWidth / 816, Graphics.boxHeight / 624);
    const fontFace = () => ($gameSystem ? $gameSystem.mainFontFace() + ", " : "") +
        '"Noto Sans CJK TC", "Noto Sans CJK JP", "Microsoft JhengHei", "Yu Gothic", sans-serif';
    const warnedIds = new Set();

    function validId(id, names, kind) {
        if (id <= 0) return false;
        if (Array.isArray(names) && id < names.length) return true;
        const key = `${kind}:${id}`;
        if (!warnedIds.has(key)) {
            warnedIds.add(key);
            console.warn(`[${pluginName}] ${kind} ${id} 不在資料庫範圍內，請重新選擇編號。`);
        }
        return false;
    }

    function applyLanguageVariable() {
        if (!session.confirmed || !normalGame() || !$dataSystem) return false;
        if ($gameVariables && validId(settings.languageVariableId, $dataSystem.variables, "語言變數")) {
            $gameVariables.setValue(settings.languageVariableId, currentLanguage().value);
        }
        return true;
    }

    function applyToGame() {
        if (!applyLanguageVariable()) return false;
        if ($gameSwitches && validId(settings.disableScaresSwitchId, $dataSystem.switches, "關閉驚嚇開關")) {
            $gameSwitches.setValue(settings.disableScaresSwitchId, session.scareDisabled);
        }
        return true;
    }

    globalThis.JIMA_StartupOptionsMZ = Object.freeze({
        get languageCode() { return currentLanguage().code; },
        get languageValue() { return currentLanguage().value; },
        get scareDisabled() { return session.scareDisabled; },
        get confirmed() { return session.confirmed; },
        applyToGame
    });
    PluginManager.registerCommand(pluginName, "ApplyChoices", applyToGame);

    // Keep the optional numeric mirror in sync with Chimaki's native Options
    // language item. Never restore the old launch language over a later change.
    if (typeof Window_Options !== "undefined" && typeof Window_Options.prototype.changeValue === "function") {
        const previousChangeValue = Window_Options.prototype.changeValue;
        Window_Options.prototype.changeValue = function(symbol, value) {
            const result = previousChangeValue.apply(this, arguments);
            if (symbol === "lang") applyLanguageVariable();
            return result;
        };
    }

    // New Game resets game objects; loading a save replaces them. Mirror the
    // current launch's confirmed preference after either operation has finished.
    const previousSetupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        const result = previousSetupNewGame.apply(this, arguments);
        applyToGame();
        return result;
    };
    const previousExtractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function() {
        const result = previousExtractSaveContents.apply(this, arguments);
        applyToGame();
        return result;
    };

    class Window_JimaStartupChoices extends Window_Command {
        itemHeight() { return Math.round(56 * uiScale()); }
        maxCols() { return 1; }
        isCancelEnabled() { return this._choiceStage === "scares"; }

        makeCommandList() {
            if (this._choiceStage === "scares") {
                const text = this._choiceText || strings["zh-TW"];
                this.addCommand(text.disable, "disable");
                this.addCommand(text.enable, "enable");
                this.addCommand(text.back, "back");
            } else {
                for (const item of languages) this.addCommand(item.label, "language", true, item.code);
            }
        }

        setStage(stage, text, index) {
            this.deactivate();
            this._choiceStage = stage;
            this._choiceText = text;
            this.scrollTo(0, 0);
            this.refresh();
            this.select(index);
            this.ensureCursorVisible(false);
        }

        select(index) {
            const previous = this.index();
            super.select(index);
            if (previous !== index && this.contents && this._list) this.paint();
        }

        refreshCursor() { this.setCursorRect(0, 0, 0, 0); }

        drawItemBackground(index) {
            const rect = this.itemRect(index);
            const selected = index === this.index();
            const gap = Math.max(2, Math.round(4 * uiScale()));
            const y = rect.y + gap;
            const height = rect.height - gap * 2;
            this.contentsBack.fillRect(rect.x, y, rect.width, height,
                selected ? "rgba(71,151,177,0.24)" : "rgba(255,255,255,0.035)");
            if (selected) {
                this.contentsBack.strokeRect(rect.x, y, rect.width, height, "#638f9f");
                this.contentsBack.fillRect(rect.x, y, Math.max(2, Math.round(3 * uiScale())), height, "#a4d8df");
            }
        }

        drawItem(index) {
            const rect = this.itemLineRect(index);
            const isBack = this.commandSymbol(index) === "back";
            this.contents.fontFace = fontFace();
            this.contents.fontSize = Math.round((isBack ? 20 : 26) * uiScale());
            this.contents.outlineWidth = 0;
            this.contents.textColor = index === this.index() ? "#e8fbff" : isBack ? "#93a3b2" : "#bdcbd6";
            this.drawText(this.commandName(index), rect.x, rect.y, rect.width, "center");
        }
    }

    class Scene_JimaStartupOptions extends Scene_Base {
        create() {
            super.create();
            languages = buildLanguages();
            this._stage = "language";
            this._draftLanguage = initialLanguage();
            this._leaving = false;
            this.createBackground();
            this.createHeading();
            this.createWindowLayer();
            this.createChoices();
            this.showLanguage();
        }

        createBackground() {
            this._backgroundBitmap = new Bitmap(Graphics.width, Graphics.height);
            this._backgroundBitmap.gradientFillRect(0, 0, Graphics.width, Graphics.height,
                "#070b11", "#14232e", true);
            this.addChild(new Sprite(this._backgroundBitmap));
        }

        createHeading() {
            this._headingBitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            const sprite = new Sprite(this._headingBitmap);
            sprite.x = (Graphics.width - Graphics.boxWidth) / 2;
            sprite.y = (Graphics.height - Graphics.boxHeight) / 2;
            this.addChild(sprite);
        }

        choiceRect() {
            const s = uiScale();
            const width = Math.round(Math.min(Graphics.boxWidth - 48 * s, 580 * s));
            const rows = Math.min(4, Math.max(3, languages.length));
            const padding = $gameSystem.windowPadding();
            const height = Math.round(rows * Math.round(56 * s) + padding * 2);
            return new Rectangle(Math.round((Graphics.boxWidth - width) / 2),
                Math.round((Graphics.boxHeight - height) / 2 + 32 * s), width, height);
        }

        createChoices() {
            const win = new Window_JimaStartupChoices(this.choiceRect());
            win.opacity = 0;
            win.backOpacity = 0;
            win.deactivate();
            win.setHandler("language", this.chooseLanguage.bind(this));
            win.setHandler("disable", () => this.finish(true));
            win.setHandler("enable", () => this.finish(false));
            win.setHandler("back", this.showLanguage.bind(this));
            win.setHandler("cancel", this.showLanguage.bind(this));
            this._choicesWindow = win;
            this.addWindow(win);
        }

        start() {
            super.start();
            if (settings.fadeFrames > 0) this.startFadeIn(settings.fadeFrames, false);
        }

        showLanguage() {
            this._stage = "language";
            const index = Math.max(0, languages.indexOf(this._draftLanguage));
            this._choicesWindow.setStage("language", null, index);
            this.drawHeading();
            this.waitForRelease();
        }

        chooseLanguage() {
            const code = this._choicesWindow.currentExt();
            this._draftLanguage = languages.find(item => item.code === code) || languages[0];
            setChimakiLanguage(this._draftLanguage);
            this._stage = "scares";
            this._choicesWindow.setStage("scares", questionText(this._draftLanguage),
                settings.defaultDisableScares ? 0 : 1);
            this.drawHeading();
            this.waitForRelease();
        }

        drawHeading() {
            const bitmap = this._headingBitmap;
            const s = uiScale();
            const rect = this.choiceRect();
            const x = Math.round(32 * s);
            const width = Graphics.boxWidth - x * 2;
            const text = questionText(this._draftLanguage);
            const draw = (value, y, size, color, bold = false) => {
                bitmap.fontSize = Math.round(size * s);
                bitmap.textColor = color;
                bitmap.fontBold = bold;
                bitmap.drawText(value, x, Math.round(y), width, Math.round(40 * s), "center");
            };
            bitmap.clear();
            bitmap.fontFace = fontFace();
            bitmap.outlineWidth = 0;
            draw(this._stage === "language" ? "01 / 02" : "02 / 02", rect.y - 184 * s, 16, "#839da9");
            draw(this._stage === "language" ? "選擇語言 / LANGUAGE" : text.question,
                rect.y - 138 * s, 30, "#e6f1f5", true);
            draw(this._stage === "language" ? "言語を選択してください" : text.description,
                rect.y - 84 * s, 20, "#a6bac8");
            if (this._stage === "scares") draw(text.detail, rect.y - 52 * s, 18, "#8298a7");
            bitmap.fillRect(rect.x + 12, Math.round(rect.y - 16 * s), rect.width - 24, 1, "#3b515e");
            draw(this._stage === "language" ? "↑ ↓ 選擇 / Select　Enter 確定 / Confirm" : text.hint,
                rect.y + rect.height + 28 * s, 17, "#a1b4c0");
            draw(this._stage === "language" ? "滑鼠 / Mouse / タッチ" : text.pointer,
                rect.y + rect.height + 62 * s, 15, "#768e9e");
        }

        waitForRelease() {
            // Prevent the Logo skip key or the language confirmation click from
            // also confirming the next page. Require a release before enabling it.
            this._waitingForRelease = true;
            this._inputDelay = 8;
            this._choicesWindow.deactivate();
        }

        update() {
            super.update();
            if (this._leaving || !this._waitingForRelease || this.isFading()) return;
            if (this._inputDelay > 0) {
                this._inputDelay--;
                return;
            }
            if (Input.isPressed("ok") || Input.isPressed("cancel") || TouchInput.isPressed()) return;
            this._waitingForRelease = false;
            this._choicesWindow.activate();
        }

        finish(disabled) {
            if (this._leaving) return;
            this._leaving = true;
            this._choicesWindow.deactivate();
            session.language = this._draftLanguage;
            session.scareDisabled = disabled;
            session.confirmed = true;
            setChimakiLanguage(session.language);
            applyToGame();
            saveChimakiLanguage();
            Input.clear();
            TouchInput.clear();
            if (settings.fadeFrames > 0) this.startFadeOut(settings.fadeFrames, false);
            SceneManager.goto(Scene_Title);
        }

        terminate() {
            super.terminate();
            // These bitmaps belong only to this scene, not ImageManager's cache.
            this._backgroundBitmap.destroy();
            this._headingBitmap.destroy();
        }
    }

    const previousGoto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        const result = previousGoto.apply(this, arguments);
        // Inspect the destination AFTER prior plugins have resolved it. The
        // supplied Logo plugin may turn Boot -> Title into Boot -> Logo here.
        // Replacing only an actual pending Title preserves that Logo transition
        // and avoids creating/playing the PhoneTitle background or BGM early.
        if (sceneClass === Scene_Title && normalGame() && !session.shown &&
            this._nextScene instanceof Scene_Title) {
            session.shown = true;
            this._nextScene = new Scene_JimaStartupOptions();
        }
        return result;
    };
})();
