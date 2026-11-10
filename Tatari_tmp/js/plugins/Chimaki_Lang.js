/*:zh_TW
 * @target MZ
 * @plugindesc 多語系MZ進化版3.1.1（預設含简体中文）
 * @author Chimaki
 * 
 * 
 * @command chageLang
 * @text 修改語系
 * @desc 修改語系
 * 
 * @arg lang
 * @type string
 * @default tw
 * @text 輸入要切換的語系
 * @desc 輸入要切換的語系
 *
 * @command playVoiceSe
 * @text 播放 voice_se 音效
 * @desc 播放 audio/voice_se 目錄下的音效，音量會跟語音主音量同步。
 *
 * @arg name
 * @type string
 * @default
 * @text 音效檔名
 * @desc audio/voice_se 下的檔名，可含子資料夾，不需要副檔名。
 *
 * @arg volume
 * @type number
 * @min 0
 * @max 100
 * @default 100
 * @text 音量
 * @desc 會再乘上語音主音量。
 *
 * @arg pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * @text 音高
 *
 * @arg pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @text 聲道
 *
 * @arg loop
 * @type boolean
 * @default false
 * @text 是否循環播放
 * @desc 開啟後會在播放完畢後自動 loop。
 *
 * @command stopVoiceSe
 * @text 停止 voice_se 音效
 * @desc 停止所有由 playVoiceSe 播放的 voice_se 音效。
 * 
 * @param defaultLang
 * @text 預設語系(對應csv上的設定)
 * @type string
 * @default tw
 *
 * @param allLang
 * @text 你要支援的語系(對應csv上的設定)
 * @type string[]
 * @default ["tw","cn","en","jp"]
 * 
 * 
 * @param allLangShow
 * @text 選單上顯示的語系
 * @type string[]
 * @default ["繁體中文","简体中文","English","日本語"]
 * 
 * @param langTitle
 * @text 選單上title明稱
 * @type string
 * @default Language
 * 
 * 
 * @param loadfileName
 * @text 你要讀取的csv 檔案名稱
 * @type array
 * @default ['UI'] 
 * 
 * @help Chimaki_Lang.js
 * v3.1.1 簡體選項更新：
 * 預設提供 tw=繁體中文、cn=简体中文、en=English、jp=日本語。
 * 已有專案的 allLang 若沒有 cn，執行時會自動補入简体中文選項。
 * 既有語言順序與自訂名稱會保留；新補入的 cn 會放在清單最後。
 * 此補入只套用於執行時，不會改寫專案的 js/plugins.js。
 * CSV 仍須有 cn 欄與簡體譯文；不會自動翻譯原本文字。
 * window.LANG_LIST / window.LANG_SHOW 會提供補齊後的語言清單／名稱。
 *
 * itch : https://conviction-srpg.itch.io/
 * webside : https://www.chimakier.com
 * 
 * how to use 
 * 事前準備：
 * 專案底下新增 csv 資料夾
 * 第一列的格式分別為 id,who(使用者用來備註用), tw ,en ... 從tw開始，可以自由新增語系欄位
 * ex： 假設你想要新增一個語言叫做 jp, 你的第一列就會變成
 * id , who , tw, en ,jp ...
 * 
 * 別忘也要到插件參數中新增jp 對應的文字
 * 
 * 使用：
 * 1. 在對話事件中輸入 \T[你的文本編號] 即可自動轉換成多語系
 * 2. 在資料庫中輸入 \T[你的文本編號] 即可自動轉換成多語系
 * 
 * P.S. 如果使用exl輸出csv, 請注意編碼要是utf8(輸出後用txt打開即可確認), 建議使用百度雲or goolge drive 
 * 下載成csv檔案，編碼就不會有問題
 * 
 * 若使用exl 輸出請按照下方流程
 * 1. 另存新檔
 * 2. web 選項
 * 3  到編碼中選則utf-8 按下確認
 * 4. 輸出成 CSV(*.csv utf-8)
 *

 */

(function (){
    // 祖師婆專用
    function isOldKGame () {
        
        return [45894353].find( id => {
            return id == $dataSystem.advanced.gameId;
        })
    }

    const LangpluginName = "Chimaki_Lang";
    const chimaki_params = PluginManager.parameters(LangpluginName);
    const defaultLang = chimaki_params["defaultLang"] || 'tw';
    
    // Metadata defaults alone do not update an existing project's parameters.
    // Also include cn at runtime so replacing the plugin enables the option.
    const DEFAULT_LANG_LIST = ["tw", "cn", "en", "jp"];
    const DEFAULT_LANG_NAMES = {
        tw: "繁體中文", cn: "简体中文", en: "English", jp: "日本語",
        ja: "日本語", ru: "Русский", th: "ไทย"
    };
    const configuredLangs = eval(chimaki_params["allLang"]);
    const configuredNames = eval(chimaki_params["allLangShow"]);
    const LANG_LIST = Array.isArray(configuredLangs) && configuredLangs.length
        ? configuredLangs.slice() : DEFAULT_LANG_LIST.slice();
    const LANG_SHOW = LANG_LIST.map((lang, index) =>
        (Array.isArray(configuredNames) && configuredNames[index]) ||
        DEFAULT_LANG_NAMES[lang] || lang);
    if (!LANG_LIST.includes("cn")) {
        LANG_LIST.push("cn");
        LANG_SHOW.push("简体中文");
    }
    const simplifiedIndex = LANG_LIST.indexOf("cn");
    if (LANG_SHOW[simplifiedIndex] === "簡體中文") {
        LANG_SHOW[simplifiedIndex] = "简体中文";
    }
    const LANG_TITLE = chimaki_params["langTitle"] || "Language";
    // console.error(`LANG_TITLE ${LANG_TITLE}`)
    var LOAD_CSV = eval(chimaki_params["loadfileName"]) || ['UI'];
    ConfigManager.lang = defaultLang;
    let langMap = {};
    LANG_LIST.forEach((lang, index) => {
        langMap[`${lang}`] = LANG_SHOW[`${index}`];
    })    
    // console.error(`langMap`, langMap)
    
    


    let alias_mutilLang_config_make = ConfigManager.makeData;
    ConfigManager.makeData = function (config) {
        config = alias_mutilLang_config_make.call(this, config);
        config = config || {};
        config.lang = this.lang;
        return config;
    
    };    
    let alias_mutilLang_config_apply = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
        alias_mutilLang_config_apply.call(this, config);
        this.lang = this.readLang(config);
    };    
    ConfigManager.readLang = function (config) {
        return config['lang'] || defaultLang;
    };
    
    

    PluginManager.registerCommand(LangpluginName, "chageLang", args => {
        const lang = args.lang;
        ConfigManager.lang = lang;
    
    });

    PluginManager.registerCommand(LangpluginName, "playVoiceSe", args => {
        AudioManager.playVoiceSe({
            name: args.name,
            volume: Number(args.volume || 100),
            pitch: Number(args.pitch || 100),
            pan: Number(args.pan || 0),
            loop: args.loop === true || args.loop === "true"
        });
    });

    PluginManager.registerCommand(LangpluginName, "stopVoiceSe", () => {
        AudioManager.stopVoiceSe();
    });

    class LangManager {
        static _data = {};
        static _loadedCsv = {}
        static _loadEnd = false;
        static get loadedCsv() {
            return this._loadedCsv
        }
        static set loadedCsv(csv) {
            this._loadedCsv = csv;
        }
    
    
        static get data() {
            return this._data || {};
        }
        static set data(value) {
    
            for (let key in value) {
                this._data[key] = value[key];
            }
        }
        static loadCsv(filename) {
            
            return new Promise((res, rej) => {
                this._loadEnd = false;
                if (!filename) {
                    this._loadEnd = true;
                    console.warn('no file name')
                    res(1);
                    return;
                }
                filename = filename
                
    
                AssetsManager.loadCsv(filename, true).then(data => {

                    let mergeHash = this.mergeHash(this.data, data)
                    this.data = mergeHash;
                    
                    let csvlist = LangManager.loadedCsv;
                    csvlist[filename] = 1;
                    LangManager.loadedCsv = csvlist;
                    this._loadEnd = true;
                    res(1)
    
                }).catch(e => {
                    // console.error(e);
                    this._loadEnd = true;
                    res(0)
                })
            })
        }
        static mergeHash(hash1, hash2) {
            if (Object.keys(hash1).length <= 0) {
                return hash2;
            }
            let map = hash1;
            /** 第一層 */
            for (let i in hash1) {
                if (hash2[i]) {
                    let codeHash = hash2[i];
                    for (let j in codeHash) {
                        map[i] = map[i] || {};
                        map[i][j] = codeHash[j];
                    }
                }
            }
            return map;
    
        }        
        static isReady() {
            return this._loadEnd
        }
        static className(index) {
            let lang = ConfigManager.lang;
            return this.data[lang][`class_${index}`];
        }
        static talentName(index) {
            let lang = ConfigManager.lang;
            return this.data[lang][`talent_${index}`];
        }
        static name(index) {
            let lang = ConfigManager.lang;
            return this.data[lang][`name_${index}`];
        }
        static text(index) {
            // return `${index}`;
            // console.error(index);
            let lang = ConfigManager.lang;
            let text = index;
            try {
                text = this.data[lang][index];
            }
            catch (e) {
                // console.log(`${index} 沒多語系`);
                text = index

                return text;
            }
            if (!text) {
                // console.log(`${index} 沒多語系`);
                text = index
            }
            
            return text;
        };
    
        static textList(arr) {
            let result = {}
            let lang = ConfigManager.lang;
            arr.forEach(str => {
                result[str] = this.data[lang][str];
            })
    
            return result;
        }
       
    
    }

/**
 * 讀取資源取消fs 
 */
    class AssetsManager {

        static loadStage(url) {
            return new Promise((res, rej) => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.overrideMimeType("application/json;charset=utf-8");
                xhr.onload = (e) => {
                    let json = xhr.responseText;
                    res(json);
                    xhr = null;
                }
                xhr.onerror = (e) => {
                    rej(e);
                    console.error(`load stage error`, e);
                    xhr = null;
                    // xh
                }
                xhr.send();
            })

        }


        static loadCsv(url, isLang = false) {
            return new Promise((res, rej) => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", `./csv/${url}.csv`, true);
                xhr.overrideMimeType("text/csv;charset=utf-8");
                xhr.onload = (e) => {
                    let text = xhr.responseText;

                    let map = isLang ? this.parseLang(text) : this.parseCsv(text);
                    res(map);
                    xhr = null;
                }
                xhr.onerror = (e) => {
                    rej(e)
                    xhr = null;
                }
                xhr.send();
            })
        }

        static parseCsv(text) {
            let map = {};
            let mapping = {};

            let arr = text.split(/\r/);
            let header = arr.shift().split(",");
               
            for (let i = 0; i < arr.length; i++) {
                /** insert key */
                let l = arr[i].split(',')
                let key = l[0].trim();
                map[key] = {};
            }

            for (let i = 0; i < header.length; i++) {
                let key = header[i].trim();
                mapping[key] = i;
            }

            for (let i = 0; i < arr.length; i++) {
                let arr2 = arr[i].split(',');

                for (let j = 0; j < arr2.length; j++) {
                    let d = arr2[j].trim();

                    if (j == 0 && map[d]) {
                        for (let k in mapping) {
                            if (arr2[0] && arr2[mapping['id']] && arr2[mapping[k]]) {                                
                                map[d][k] = arr2[mapping[k]].trim();
                            }

                        }

                    }
                }
            }
            return map;

        }
        static parseLang(text) {
            let langListMappping = {};
            let map = {};
            LANG_LIST.forEach(lang => {
                map[`${lang}`] = {};
            })
            let mapping = {}


            let temp = this.CSVToArray(text);
    
            
            let keyMapping = temp[0]

            keyMapping.forEach((key, index) => {   
                let isMapping = LANG_LIST.find(lang => lang === key);
                if (isMapping) {
                    mapping[`${key}`] = index;
                }

            })

            // return;
            /** DEUBG PLAY TEST LANG */
            let allArr = [];
            // console.error(`temp`, temp)
            for (let i = 0; i < temp.length; i ++) {
     
                let row = temp[i];

                let arr = []
                for (let j = 0; j < row.length; j ++) {
                    

                    arr.push(row[j]);
                }
                allArr.push(arr);
            }

            
            // console.error(`allArr`, allArr);
            // log(map , mapping)
            for (let i = 0; i < allArr.length; i++) {
                let arr = allArr[i];
                if (i == 0) {
                    // 用來mapping index
                    for (let j = 0; j < arr.length; j++) {  
                        // console.error(`arr[j]`, arr[j])
                        let langKey = arr[j];
                        if (mapping[langKey] != undefined) {
                            langListMappping[langKey] = mapping[langKey];
                        }



                    }
                    console.error(`langListMappping`, langListMappping);
                    continue;
                }
                
                for (let j = 0; j < arr.length; j++) {

                    let text = arr[j];
                    // 編號設定正確
                    if (j == 0) {
                        for (let k in map) {                                                        
                            map[k][text] = ""; // 設定每個語系title
                        }
                    }
                    else {
                        for (let k in map) {
                            if (mapping[k] == j) {
                                if (arr[0] == "") continue
                                let index = langListMappping[k];
                                
                                let text = arr[index];
                                
                                // console.error(`map k `, arr)
                                map[k][arr[0]] = text;

                            }
                            // k = tw / en / cn

                            // console.error(`map k `, arr[0])
                            
                        }
                        // console.error(`arr[0]`, arr);
                    }
    
                }
            }


 

            // log(map)
            return map
        
        }
        static CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
            );

            var arrData = [[]];


            var arrMatches = null;


            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                ) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);

                }

                var strMatchedValue;

                if (arrMatches[2]) {

                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );

                } else {

                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];

                }

                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            return (arrData);
        }


    } 
    window.AssetsManager = AssetsManager;
    function checkLangText(text) {
        
        if (!text) return text;
        text += "";
        text = text.replace(/\\/g, "\x1b");
        text = text.replace(/\x1b\x1b/g, "\\");

        text = text.replace(/\x1bT\[(.+?)\]/gi, (_, p1) => {
            
            if ($gameTemp.isVoiceExist(p1)) {
                window.tempVoicePlay = true;
                AudioManager.stopVoice();

                AudioManager.playVoice({ name: $gameTemp.voiceName(p1), volume: 100, pitch:100, pan:0});
            }
            else {
                window.tempVoicePlay = false;
            }
            return LangManager.text(p1);
        });

        return text;
    }
    Window_Base.prototype.drawItemName = function(item, x, y, width) {
        if (item) {
            const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
            const textMargin = ImageManager.iconWidth + 4;
            const itemWidth = Math.max(0, width - textMargin);
            this.resetTextColor();
            this.drawIcon(item.iconIndex, x, iconY);
            this.drawText(LangManager.text(item.name), x + textMargin, y, itemWidth);
        }
    };
    /**
     * @override 處理字串
     * @param 
     */
    Game_Message.prototype.add = function (text) {
        while (text.match(/\\V\[(\d+)\]/gi)) {            
            text = text.replace(/\\V\[(\d+)\]/gi, (_, p1) =>
                $gameVariables.value(parseInt(p1))
            );
        }

  
        
        this._texts.push(this.processLangChange(text));

    };

    Game_Message.prototype.processLangChange = function (text) {
        return checkLangText(text);
    }
    /**
     * 頭圖名字多語系
     */
    Game_Message.prototype.setSpeakerName = function (speakerName) {
        this._lastSpeakerName = speakerName;  
        this._speakerName = checkLangText(speakerName)
    };

    /**
     * @override 處理選項
     * @param {} params 
     */
    Game_Interpreter.prototype.setupChoices = function (params) {
        const choices = params[0].clone();
        for (let i = 0; i < choices.length; i++) {
            $gameSystem.setChoiceKey(i, choices[i]);
            choices[i] = $gameMessage.processLangChange(choices[i]);
        };
        const cancelType = params[1] < choices.length ? params[1] : -2;
        const defaultType = params.length > 2 ? params[2] : 0;
        const positionType = params.length > 3 ? params[3] : 2;
        const background = params.length > 4 ? params[4] : 0;
        $gameMessage.setChoices(choices, defaultType, cancelType);
        $gameMessage.setChoiceBackground(background);
        $gameMessage.setChoicePositionType(positionType);
        $gameMessage.setChoiceCallback(n => {
            this._branch[this._indent] = n;
        });
    };
    Game_System.prototype.setChoiceKey = function(index, key) {
        this._choiceKeyMap = this._choiceKeyMap || [];
        this._choiceKeyMap[index] = key;
    }

    Game_System.prototype.getChoiceKey = function(index, key) {
        this._choiceKeyMap = this._choiceKeyMap || [];
        return this._choiceKeyMap;
        
        
    }    
    Game_System.prototype.clearChoiceKey = function(index, key) {
        this._choiceKeyMap.length = 0;
        
    }        

    Window_Base.prototype.drawTextEx = function (text, x, y, width) {
    
        if (text == null)return;        
        text = checkLangText(text);
        this.resetFontSettings();
        const textState = this.createTextState(text, x, y, width);
        this.processAllText(textState);
        return textState.outputWidth;
    };

    Window_Help.prototype.setText = function (text) {
        text = checkLangText(text);
        if (this._text !== text) {
            this._text = text;
            this.refresh();
        }
    };
    Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align) {
        text = checkLangText(text);

        const context = this.context;
        const alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        let tx = x;
        let ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
        if (align === "center") {
            tx += maxWidth / 2;
        }
        if (align === "right") {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = "alphabetic";
        context.globalAlpha = 1;
        if (this.outlineWidth > 0) {
            this._drawTextOutline(text, tx, ty, maxWidth);
        }
        else {
            // 祖師婆專用
            if (isOldKGame()) {
                context.fillStyle = "rgba(0, 0, 0, 0.7)"; // 半透明黑色
                context.fillText(text, tx + 2, ty + 2); // 右下偏移2像素            
            }


        }
        
        context.globalAlpha = alpha;
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._baseTexture.update();
    };

    window.LangManager = LangManager;
    LOAD_CSV.forEach( s => {
        
        LangManager.loadCsv(s, true).then( () => {

        })
    })
    window.LANG_LIST = LANG_LIST;
    window.LANG_SHOW = LANG_SHOW;
   window.checkLangText = checkLangText;



/**
 * window options
 */

let _window_option_mak_cmd = Window_Options.prototype.makeCommandList;
Window_Options.prototype.makeCommandList = function () {
   
    _window_option_mak_cmd.call(this);
    this.addLangOptions()
};


Window_ChoiceList.prototype.makeCommandList = function() {
    const choices = $gameMessage.choices();    
    for (let choice of choices) {
        while (choice.match(/\x1bV\[(\d+)\]/gi)) {
            choice = choice.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
                $gameVariables.value(parseInt(p1))
            );
        }
        this.addCommand(choice, "choice");
    }
};




/**
 * new 
 */
Window_Options.prototype.addLangOptions = function () {

    // this.addCommand(OPTION_TEXT, "lang");
    this.addCommand(LANG_TITLE, "lang");
}
Window_Options.prototype.langStatusText = function (current) {
    return langMap[`${current}`];
};
Window_Options.prototype.isLangSymbol = function (symbol) {
    return symbol == "lang";
}
/**
 * @todo 用index 處理next lang
 */
Window_Options.prototype.changeLang = function (symbol, add) {
    let nowLang = ConfigManager[symbol];
    let index = LANG_LIST.indexOf(nowLang);
    index += add ? 1 : -1;
    index %= LANG_LIST.length;
    if (index < 0) index = LANG_LIST.length - 1;
    this.changeValue(symbol, LANG_LIST[index]);

}




Window_Options.prototype.statusText = function (index) {
    const symbol = this.commandSymbol(index);
    const value = this.getConfigValue(symbol);
    if (this.isVolumeSymbol(symbol)) {
        return this.volumeStatusText(value);
    } else if (this.isLangSymbol(symbol)) {
        return this.langStatusText(value);
    } else {
        return this.booleanStatusText(value);
    }
};
Window_Options.prototype.getConfigValue = function (symbol) {
    return ConfigManager[symbol];
};

Window_Options.prototype.processOk = function () {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, true, true);
    } else if (this.isLangSymbol(symbol)) {
        this.changeLang(symbol, true);
    } else {
        this.changeValue(symbol, !this.getConfigValue(symbol));
    }
};

Window_Options.prototype.cursorRight = function () {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, true, false);
    } else if (this.isLangSymbol(symbol)) {
        this.changeLang(symbol, true);
    } else {
        this.changeValue(symbol, true);
    }
};

Window_Options.prototype.cursorLeft = function () {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, false, false);
    } else if (this.isLangSymbol(symbol)) {
        this.changeLang(symbol, false);
    } else {
        this.changeValue(symbol, false);
    }
};   

})();
function log(){};












(() => {

    
var _fpsLock = Graphics._createPixiApp;
Graphics._createPixiApp = function() {
    _fpsLock.call(this)
    this._app.ticker.maxFPS = 62;

};


    let _create = Scene_Base.prototype.create;
    Scene_Base.prototype.create = function() {
        _create.call(this);;
        this._soundMap = {};

        let fs = require('fs');
        let path = require('path');
        let base = path.dirname(process.mainModule.filename);
        let p = path.join(base, 'audio/voice');
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }

        try {
            let allfile = [];
            const collectFiles = dir => {
                fs.readdirSync(dir).forEach(name => {
                    const fullPath = path.join(dir, name);
                    if (fs.statSync(fullPath).isDirectory()) {
                        collectFiles(fullPath);
                    } else {
                        allfile.push(path.relative(p, fullPath).replace(/\\/g, '/'));
                    }
                });
            };
            collectFiles(p);
            // console.error(`file `, allfile)
            allfile.forEach( name => {
                
                if (name.match(/\.(ogg_?|enc)$/i)) {
                    let n = name.replace(/\.(ogg_?|enc)$/i, '');
    
                    
                    this._soundMap[n] = n;
                    const fileName = path.basename(n);
                    if (!this._soundMap[fileName]) {
                        this._soundMap[fileName] = n;
                    }
                }
            })   
            // console.error(`soundMap `, this._soundMap)
        }
        catch (e) {
            console.error(`Scene_Base.prototype.create`, e)
        }

    };

    Game_Temp.prototype.isVoiceExist = function(name) {
        let result =  !!this.voiceName(name);
        if (result ) {
            this._lastPlayVoiceName = name;
        } 
        else {
            this._lastPlayVoiceName = null;
        }
        return result;
    }

    Game_Temp.prototype.voiceName = function(name) {
        return SceneManager._scene._soundMap[name];
    }

    AudioManager._voiceSeBuffers = [];

    AudioManager.normalizeVoiceSeName = function(name) {
        return String(name || "")
            .replace(/\\/g, "/")
            .replace(/^\/+/, "")
            .replace(/^audio\/voice_se\//, "")
            .replace(/\.(ogg|m4a|mp3|wav)_?$/i, "");
    };

    AudioManager.playVoiceSe = function(se) {
        se = se || {};
        se.name = this.normalizeVoiceSeName(se.name);
        if (!se.name) {
            return;
        }

        this.cleanupVoiceSe();
        console.log(`[Chimaki_Lang] playVoiceSe: ${se.name}`);
        const buffer = this.createBuffer("voice_se/", se.name);
        this.updateVoiceSeParameters(buffer, se);
        buffer.play(!!se.loop);
        buffer.name = se.name;
        buffer.voiceSe = se;
        this._voiceSeBuffers.push(buffer);

        buffer.addStopListener(() => {
            this.cleanupVoiceSe();
        });
    };

    AudioManager.updateVoiceSeParameters = function(buffer, se) {
        const voiceVolume = this._voiceVolume != null ? this._voiceVolume : 100;
        this.updateBufferParameters(buffer, voiceVolume, se);
    };

    AudioManager.updateVoiceSeBuffers = function() {
        this._voiceSeBuffers = this._voiceSeBuffers || [];
        for (const buffer of this._voiceSeBuffers) {
            if (buffer.isPlaying() && buffer.voiceSe) {
                this.updateVoiceSeParameters(buffer, buffer.voiceSe);
            }
        }
    };

    AudioManager.cleanupVoiceSe = function() {
        this._voiceSeBuffers = this._voiceSeBuffers || [];
        for (const buffer of this._voiceSeBuffers) {
            if (!buffer.isPlaying()) {
                buffer.destroy();
            }
        }
        this._voiceSeBuffers = this._voiceSeBuffers.filter(buffer => buffer.isPlaying());
    };

    AudioManager.stopVoiceSe = function() {
        this._voiceSeBuffers = this._voiceSeBuffers || [];
        for (const buffer of this._voiceSeBuffers.slice()) {
            buffer.destroy();
        }
        this._voiceSeBuffers = [];
    };

    const _voiceSeSceneManagerUpdateMain = SceneManager.updateMain;
    SceneManager.updateMain = function() {
        _voiceSeSceneManagerUpdateMain.call(this);
        AudioManager.updateVoiceSeBuffers();
    };

    AudioManager._voiceBuffers = [];
    AudioManager.setMessageWindowHasSound = function() {
        const messageWindow = SceneManager._scene && SceneManager._scene._messageWindow;
        if (messageWindow) {
            messageWindow._hasSound = true;
            messageWindow._voiceEnd = false;
        }
    };
    // override
    AudioManager.playVoice = function(se) {
        if (se.name) {
         
            const latestBuffers = this._seBuffers.filter(
                buffer => buffer.frameCount === Graphics.frameCount
            );


            if (latestBuffers.find(buffer => buffer.name === se.name)) {
                return;
            }
            this.setMessageWindowHasSound();

            
            const buffer = this.createBuffer("voice/", se.name);
            this.updateSeParameters(buffer, se);
            buffer.play(false);
            buffer.name = se.name;
            this._voiceBuffers.push(buffer);
            this.cleanupVoice();

            buffer.addStopListener(() => {
                this._voiceBuffers = this._voiceBuffers.filter(buffer => buffer.isPlaying());
                if ($gameSystem.isAutoMsg && ($gameSystem.isAutoMsg() || $gameSystem.isSpeedMsg()) && SceneManager._scene && SceneManager._scene._messageWindow && this._voiceBuffers.every(buffer => !buffer.isPlaying())) {
                    SceneManager._scene._messageWindow.setEndVoice(true)
                }
            })                      
            
        }
    };    
    AudioManager.cleanupVoice = function() {
        for (const buffer of this._voiceBuffers) {
            if (!buffer.isPlaying()) {
                buffer.destroy();
            }
        }
        this._voiceBuffers = this._voiceBuffers.filter(buffer => buffer.isPlaying());
    };    
    AudioManager.stopVoice = function() {
        for (const buffer of this._voiceBuffers) {
            buffer.destroy();
        }
        this._voiceBuffers = [];
    };


    AudioManager.updateVoiceParameters = function(buffer, se) {
        this.updateBufferParameters(buffer, this._seVolume, se);
    };


    AudioManager.loadStaticVoice = function(se) {
        if (se.name && !this.isStaticVoice(se)) {
            const buffer = this.createBuffer("voice/", se.name);
            this._voiceBuffers.push(buffer);
        }
    };
    AudioManager.isVoicePlaying = function() {
        this.cleanupVoice();
        return this._voiceBuffers.some(buffer => buffer.isPlaying());
    };    
    
    AudioManager.isStaticVoice = function(se) {
        for (const buffer of this._voiceBuffers) {
            if (buffer.name === se.name) {
                return true;
            }
        }
        return false;
    };    


    let _temp = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function() {
        AudioManager.stopVoice();
        _temp.call(this)
        
    };    

   

})();
window.isElectron = window.isElectron || false;

let _isFull = Graphics._isFullScreen;
Graphics._isFullScreen = function() {

    if (isElectron) {
        const { ipcRenderer } = require('electron');
        
        return ipcRenderer.sendSync('callIsScreen');
    }
    else {
        return _isFull.call(this)
    }
    

};
let _requestFul = Graphics._requestFullScreen;
Graphics._requestFullScreen = function() {
    if (isElectron) {
        
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('callFullScreen');
    }
    else {
        _requestFul.call(this)
    }


};
let _cancelFullScreen = Graphics._cancelFullScreen;
Graphics._cancelFullScreen = function() {
    if (isElectron) {
        
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('callCancelFullScreen');
    }
    else {
        _cancelFullScreen.call(this)
    }


};

var a;
(() => {
    Window_BattleLog.prototype.displayChangedStates = function(target) {
        const result = target.result();
        let  states = result.addedStateObjects();        
        if (states.length > 0 ) {
            for (let state of states) {
                state.message1 = checkLangText(state.message1);
                state.message2 = checkLangText(state.message2);
                state.message3 = checkLangText(state.message3);
                state.message4 = checkLangText(state.message4);
            }
        }
    

        this.displayAddedStates(target);
        this.displayRemovedStates(target);
    };


    TextManager.basic = function(basicId) {

        return checkLangText($dataSystem.terms.basic[basicId]) || "";
    };
    
    TextManager.param = function(paramId) {
        return checkLangText($dataSystem.terms.params[paramId]) || "";
    };
    
    TextManager.command = function(commandId) {
        return checkLangText($dataSystem.terms.commands[commandId]) || "";
    };
    
    TextManager.message = function(messageId) {
        return checkLangText($dataSystem.terms.messages[messageId]) || "";
    };
    
    TextManager.getter = function(method, param) {
        return {
            get: function() {
                return checkLangText(this[method](param));
            },
            configurable: true
        };
    };
    
    Object.defineProperty(TextManager, "currencyUnit", {
        get: function() {
            return checkLangText($dataSystem.currencyUnit);
        },
        configurable: true
    });    


    Game_Actor.prototype.name = function() {
        return checkLangText(this._name);
    };


    let _name_set = Window_NameBox.prototype.setName
    Window_NameBox.prototype.setName = function(name) {
        
        
        try {
            name = checkLangText(name);
        }
        catch (e) {

        }
            
        _name_set.call(this, name);
        
    }    
})();
