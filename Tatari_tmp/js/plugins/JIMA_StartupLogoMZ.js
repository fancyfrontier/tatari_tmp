/*:
 * @target MZ
 * @plugindesc v1.0.0 遊戲啟動時播放 GIF，可選擇銜接 PNG，最後淡出至黑畫面後進入標題畫面。
 * @author JIMA
 *
 * @help
 * ================================================================
 * JIMA_StartupLogoMZ.js
 * ================================================================
 *
 * 【功能】
 * 遊戲正常啟動時，依照下列順序顯示：
 *
 *   GIF →（可選）PNG → 淡出至黑畫面 → 標題畫面
 *
 * PNG 檔案名稱留空時，順序會變成：
 *
 *   GIF → 淡出至黑畫面 → 標題畫面
 *
 * 戰鬥測試與事件測試不會播放啟動 Logo。
 * 每次開啟遊戲只播放一次；之後回到標題畫面不會重播。
 *
 * ----------------------------------------------------------------
 * 【素材放置位置】
 * ----------------------------------------------------------------
 * GIF 與 PNG 都請放在：
 *
 *   img/system/
 *
 * GIF 參數請輸入包含副檔名的檔名，例如：
 *
 *   TeamLogo.gif
 *
 * PNG 可直接在插件參數中選擇。
 *
 * ----------------------------------------------------------------
 * 【重要：GIF 播放時間】
 * ----------------------------------------------------------------
 * 瀏覽器不會提供「GIF 已播放完畢」事件，因此必須在插件參數中
 * 手動填寫 GIF 的播放秒數。
 *
 * 例如 GIF 長度是 3.5 秒，就將「GIF 播放秒數」設為 3.5。
 *
 * 如果 GIF 本身設定成無限循環也沒關係，時間到後插件仍會切換
 * 至 PNG 或開始淡出。
 *
 * ----------------------------------------------------------------
 * 【讓 GIF → PNG 看起來無縫銜接】
 * ----------------------------------------------------------------
 * 1. PNG 請製作成與 GIF 最後一幀完全相同的畫面。
 * 2. GIF 與 PNG 建議使用相同的長寬。
 * 3. 兩者必須使用相同的「顯示方式」。
 *
 * 插件會先載入 PNG，確認完成後才移除 GIF，以減少閃黑。
 *
 * ----------------------------------------------------------------
 * 【MZ 內建 Splash Screen】
 * ----------------------------------------------------------------
 * 本插件會取代遊戲啟動時的內建 Splash Scene，因此不需要另外
 * 使用 MadeWithMv.js。請勿同時啟用 MadeWithMv.js。
 *
 * ----------------------------------------------------------------
 * 【部署注意事項】
 * ----------------------------------------------------------------
 * GIF 不是 RPG Maker MZ 的標準圖片素材。部署遊戲後，請確認：
 *
 *   img/system/你的GIF檔名.gif
 *
 * 確實存在於部署後的遊戲資料夾。
 * 如果勾選「排除未使用的檔案」而造成 GIF 未被複製，請在部署後
 * 手動把 GIF 複製到上述位置，或部署時不要勾選該選項。
 *
 * 圖片加密功能不會替 GIF 加密，這是 MZ 對非標準素材的限制。
 *
 * ----------------------------------------------------------------
 * 【插件順序】
 * ----------------------------------------------------------------
 * 建議放在會修改啟動流程、跳過標題畫面或修改標題畫面的插件下方。
 *
 * 本插件不提供插件指令。
 *
 * @param GifFile
 * @text GIF 檔案名稱
 * @desc 放在 img/system/ 的 GIF。請包含 .gif，例如 TeamLogo.gif。
 * @type string
 * @default TeamLogo.gif
 *
 * @param GifDuration
 * @text GIF 播放秒數
 * @desc GIF 顯示多久後切換至 PNG 或淡出。可以輸入小數，例如 3.5。
 * @type number
 * @decimals 2
 * @min 0.1
 * @default 3.00
 *
 * @param StillImage
 * @text 銜接 PNG（可留空）
 * @desc GIF 後要顯示的 PNG。留空時使用純 GIF 流程。
 * @type file
 * @dir img/system/
 * @require 1
 * @default
 *
 * @param StillDuration
 * @text PNG 停留秒數
 * @desc PNG 完整顯示多久後開始淡出。可以輸入小數。
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.50
 *
 * @param FadeOutDuration
 * @text 淡出秒數
 * @desc 最後一張畫面淡出至黑色所需時間。0 代表立即消失。
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 *
 * @param BlackDuration
 * @text 黑畫面停留秒數
 * @desc 完全變黑後，等待多久再進入標題畫面。
 * @type number
 * @decimals 2
 * @min 0
 * @default 0.20
 *
 * @param ScaleMode
 * @text 顯示方式
 * @desc GIF 與 PNG 會使用相同的縮放方式。
 * @type select
 * @option 完整顯示（可能留黑邊）
 * @value contain
 * @option 填滿畫面（可能裁切）
 * @value cover
 * @option 拉伸填滿
 * @value stretch
 * @default contain
 *
 * @param AllowSkip
 * @text 允許玩家跳過
 * @desc ON 時可用確定鍵、取消鍵或滑鼠／觸控跳過整段 Logo。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 */

(() => {
    "use strict";

    const script = document.currentScript;
    const pluginName = script
        ? decodeURIComponent(script.src).match(/([^/]+)\.js$/i)?.[1] || "JIMA_StartupLogoMZ"
        : "JIMA_StartupLogoMZ";
    const parameters = PluginManager.parameters(pluginName);

    const toNumber = (value, defaultValue, minimum) => {
        const number = Number(value);
        return Number.isFinite(number)
            ? Math.max(minimum, number)
            : defaultValue;
    };

    const settings = {
        gifFile: String(parameters.GifFile || "").trim(),
        gifDuration:
            toNumber(parameters.GifDuration, 3, 0.1) * 1000,
        stillImage:
            String(parameters.StillImage || "").trim(),
        stillDuration:
            toNumber(parameters.StillDuration, 1.5, 0) * 1000,
        fadeOutDuration:
            toNumber(parameters.FadeOutDuration, 1, 0) * 1000,
        blackDuration:
            toNumber(parameters.BlackDuration, 0.2, 0) * 1000,
        scaleMode:
            ["contain", "cover", "stretch"].includes(parameters.ScaleMode)
                ? parameters.ScaleMode
                : "contain",
        allowSkip:
            String(parameters.AllowSkip || "false") === "true"
    };

    const hasGif = settings.gifFile.length > 0;
    const hasStillImage = settings.stillImage.length > 0;

    let introWasStarted = false;

    function normalizedGifFileName() {
        let fileName = settings.gifFile
            .replace(/\\/g, "/")
            .split("/")
            .pop();

        if (fileName && !/\.gif$/i.test(fileName)) {
            fileName += ".gif";
        }

        return fileName;
    }

    function normalizedStillImageName() {
        return settings.stillImage
            .replace(/\\/g, "/")
            .split("/")
            .pop()
            .replace(/\.png$/i, "");
    }

    function encodedAssetUrl(folder, fileName) {
        return folder +
            fileName
                .split("/")
                .map(encodeURIComponent)
                .join("/");
    }

    function Scene_JimaStartupLogo() {
        this.initialize(...arguments);
    }

    Scene_JimaStartupLogo.prototype =
        Object.create(Scene_Base.prototype);

    Scene_JimaStartupLogo.prototype.constructor =
        Scene_JimaStartupLogo;

    Scene_JimaStartupLogo.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);

        this._phase = "prepare";
        this._phaseStartedAt = 0;
        this._gifElement = null;
        this._gifLoadFailed = false;
        this._stillSprite = null;
        this._stillReady = !hasStillImage;
        this._finishing = false;
    };

    Scene_JimaStartupLogo.prototype.create = function() {
        Scene_Base.prototype.create.call(this);

        this.createBlackBackground();
        this.createStillImage();
    };

    Scene_JimaStartupLogo.prototype.createBlackBackground = function() {
        const bitmap = new Bitmap(
            Graphics.width,
            Graphics.height
        );

        bitmap.fillAll("#000000");

        this._blackSprite = new Sprite(bitmap);
        this.addChild(this._blackSprite);
    };

    Scene_JimaStartupLogo.prototype.createStillImage = function() {
        if (!hasStillImage) {
            return;
        }

        const bitmap = ImageManager.loadSystem(
            normalizedStillImageName()
        );

        const sprite = new Sprite(bitmap);

        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.opacity = 0;

        this._stillSprite = sprite;
        this.addChild(sprite);

        bitmap.addLoadListener(() => {
            if (!this._stillSprite) {
                return;
            }

            this.applyStillImageScale();
            this._stillReady = true;
        });
    };

    Scene_JimaStartupLogo.prototype.applyStillImageScale = function() {
        const sprite = this._stillSprite;
        const bitmap = sprite?.bitmap;

        if (
            !sprite ||
            !bitmap ||
            bitmap.width <= 0 ||
            bitmap.height <= 0
        ) {
            return;
        }

        const scaleX = Graphics.width / bitmap.width;
        const scaleY = Graphics.height / bitmap.height;

        if (settings.scaleMode === "stretch") {
            sprite.scale.x = scaleX;
            sprite.scale.y = scaleY;
        } else {
            const scale =
                settings.scaleMode === "cover"
                    ? Math.max(scaleX, scaleY)
                    : Math.min(scaleX, scaleY);

            sprite.scale.x = scale;
            sprite.scale.y = scale;
        }
    };

    Scene_JimaStartupLogo.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startGif();
    };

    Scene_JimaStartupLogo.prototype.startGif = function() {
        if (!hasGif) {
            if (hasStillImage) {
                this.waitForStillImage();
            } else {
                this.startBlackHold();
            }

            return;
        }

        const image = document.createElement("img");

        image.alt = "Startup logo";
        image.draggable = false;

        image.style.position = "fixed";
        image.style.pointerEvents = "none";
        image.style.userSelect = "none";
        image.style.zIndex = "10000";
        image.style.opacity = "1";
        image.style.objectPosition = "center center";
        image.style.objectFit =
            settings.scaleMode === "stretch"
                ? "fill"
                : settings.scaleMode;

        image.onload = () => {
            if (
                this._gifElement !== image ||
                this._finishing
            ) {
                return;
            }

            this._phase = "gif";
            this._phaseStartedAt = performance.now();
        };

        image.onerror = () => {
            if (
                this._gifElement !== image ||
                this._finishing
            ) {
                return;
            }

            console.error(
                `[${pluginName}] 無法讀取 GIF：img/system/${normalizedGifFileName()}`
            );

            this._gifLoadFailed = true;
            this.removeGifElement();

            if (hasStillImage) {
                this.waitForStillImage();
            } else {
                this.startBlackHold();
            }
        };

        this._gifElement = image;

        this.updateGifElementLayout();
        document.body.appendChild(image);

        this._phase = "loadingGif";

        image.src = encodedAssetUrl(
            "img/system/",
            normalizedGifFileName()
        );
    };

    Scene_JimaStartupLogo.prototype.canvasRectangle = function() {
        const canvas =
            Graphics.app?.view ||
            document.querySelector("canvas");

        return canvas?.getBoundingClientRect() || {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    Scene_JimaStartupLogo.prototype.updateGifElementLayout = function() {
        if (!this._gifElement) {
            return;
        }

        const rect = this.canvasRectangle();

        this._gifElement.style.left = `${rect.left}px`;
        this._gifElement.style.top = `${rect.top}px`;
        this._gifElement.style.width = `${rect.width}px`;
        this._gifElement.style.height = `${rect.height}px`;
    };

    Scene_JimaStartupLogo.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        this.updateGifElementLayout();

        if (
            settings.allowSkip &&
            this.isSkipRequested()
        ) {
            this.skipIntro();
            return;
        }

        const now = performance.now();

        switch (this._phase) {
            case "gif":
                if (
                    now - this._phaseStartedAt >=
                    settings.gifDuration
                ) {
                    if (hasStillImage) {
                        this.waitForStillImage();
                    } else {
                        this.startGifFadeOut();
                    }
                }
                break;

            case "waitingStill":
                if (this._stillReady) {
                    this.primeStillImage();
                }
                break;

            case "primeStill":
                this.removeGifElement();

                this._phase = "still";
                this._phaseStartedAt = now;
                break;

            case "still":
                if (
                    now - this._phaseStartedAt >=
                    settings.stillDuration
                ) {
                    this.startStillFadeOut();
                }
                break;

            case "fadeGif":
                this.updateGifFadeOut(now);
                break;

            case "fadeStill":
                this.updateStillFadeOut(now);
                break;

            case "black":
                if (
                    now - this._phaseStartedAt >=
                    settings.blackDuration
                ) {
                    this.finishIntro();
                }
                break;
        }
    };

    Scene_JimaStartupLogo.prototype.isSkipRequested = function() {
        return (
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel") ||
            TouchInput.isTriggered()
        );
    };

    Scene_JimaStartupLogo.prototype.skipIntro = function() {
        if (
            [
                "fadeGif",
                "fadeStill",
                "black",
                "done"
            ].includes(this._phase)
        ) {
            return;
        }

        if (this._gifElement) {
            this.startGifFadeOut();
        } else if (
            this._stillSprite &&
            this._stillSprite.opacity > 0
        ) {
            this.startStillFadeOut();
        } else {
            this.startBlackHold();
        }
    };

    Scene_JimaStartupLogo.prototype.waitForStillImage = function() {
        this._phase = "waitingStill";

        if (this._stillReady) {
            this.primeStillImage();
        }
    };

    Scene_JimaStartupLogo.prototype.primeStillImage = function() {
        if (!this._stillSprite) {
            this.startGifFadeOut();
            return;
        }

        this._stillSprite.opacity = 255;

        // 讓 PNG 先完整繪製一幀，
        // 再移除位於它上方的 GIF。
        this._phase = "primeStill";
        this._phaseStartedAt = performance.now();
    };

    Scene_JimaStartupLogo.prototype.startGifFadeOut = function() {
        if (
            !this._gifElement ||
            settings.fadeOutDuration <= 0
        ) {
            this.removeGifElement();
            this.startBlackHold();
            return;
        }

        this._phase = "fadeGif";
        this._phaseStartedAt = performance.now();
    };

    Scene_JimaStartupLogo.prototype.updateGifFadeOut = function(now) {
        const progress = Math.min(
            1,
            (now - this._phaseStartedAt) /
                settings.fadeOutDuration
        );

        if (this._gifElement) {
            this._gifElement.style.opacity =
                String(1 - progress);
        }

        if (progress >= 1) {
            this.removeGifElement();
            this.startBlackHold();
        }
    };

    Scene_JimaStartupLogo.prototype.startStillFadeOut = function() {
        if (
            !this._stillSprite ||
            settings.fadeOutDuration <= 0
        ) {
            if (this._stillSprite) {
                this._stillSprite.opacity = 0;
            }

            this.startBlackHold();
            return;
        }

        this._phase = "fadeStill";
        this._phaseStartedAt = performance.now();
    };

    Scene_JimaStartupLogo.prototype.updateStillFadeOut = function(now) {
        const progress = Math.min(
            1,
            (now - this._phaseStartedAt) /
                settings.fadeOutDuration
        );

        if (this._stillSprite) {
            this._stillSprite.opacity =
                Math.round(255 * (1 - progress));
        }

        if (progress >= 1) {
            this._stillSprite.opacity = 0;
            this.startBlackHold();
        }
    };

    Scene_JimaStartupLogo.prototype.startBlackHold = function() {
        this.removeGifElement();

        if (this._stillSprite) {
            this._stillSprite.opacity = 0;
        }

        this._phase = "black";
        this._phaseStartedAt = performance.now();

        if (settings.blackDuration <= 0) {
            this.finishIntro();
        }
    };

    Scene_JimaStartupLogo.prototype.finishIntro = function() {
        if (this._finishing) {
            return;
        }

        this._finishing = true;
        this._phase = "done";

        this.removeGifElement();
        SceneManager.goto(Scene_Title);
    };

    Scene_JimaStartupLogo.prototype.removeGifElement = function() {
        const image = this._gifElement;

        if (!image) {
            return;
        }

        image.onload = null;
        image.onerror = null;
        image.remove();

        this._gifElement = null;
    };

    Scene_JimaStartupLogo.prototype.terminate = function() {
        this.removeGifElement();
        Scene_Base.prototype.terminate.call(this);
    };

    const _SceneManager_goto = SceneManager.goto;

    SceneManager.goto = function(sceneClass) {
        const currentScene = this._scene;

        const isBootScene =
            typeof Scene_Boot !== "undefined" &&
            currentScene instanceof Scene_Boot;

        const isTitleDestination =
            typeof Scene_Title !== "undefined" &&
            sceneClass === Scene_Title;

        const isSplashDestination =
            typeof Scene_Splash !== "undefined" &&
            sceneClass === Scene_Splash;

        const isNormalGame =
            !DataManager.isBattleTest() &&
            !DataManager.isEventTest();

        if (
            !introWasStarted &&
            isBootScene &&
            isNormalGame &&
            (isTitleDestination || isSplashDestination) &&
            (hasGif || hasStillImage)
        ) {
            introWasStarted = true;

            return _SceneManager_goto.call(
                this,
                Scene_JimaStartupLogo
            );
        }

        return _SceneManager_goto.call(
            this,
            sceneClass
        );
    };
})();