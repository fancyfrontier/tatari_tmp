/*:
 * @target MZ
 * @plugindesc v2.0.0 斜放手機標題：透視選單、上下鍵與精準滑鼠點選。
 * @author ChatGPT
 *
 * @param BackgroundImage
 * @text 手機背景圖
 * @type file
 * @dir img/titles1/
 * @default PhoneTitle_Test
 *
 * @param TopLeftX
 * @text 螢幕左上角 X
 * @type number
 * @min 0
 * @default 418
 *
 * @param TopLeftY
 * @text 螢幕左上角 Y
 * @type number
 * @min 0
 * @default 64
 *
 * @param TopRightX
 * @text 螢幕右上角 X
 * @type number
 * @min 0
 * @default 610
 *
 * @param TopRightY
 * @text 螢幕右上角 Y
 * @type number
 * @min 0
 * @default 128
 *
 * @param BottomRightX
 * @text 螢幕右下角 X
 * @type number
 * @min 0
 * @default 431
 *
 * @param BottomRightY
 * @text 螢幕右下角 Y
 * @type number
 * @min 0
 * @default 505
 *
 * @param BottomLeftX
 * @text 螢幕左下角 X
 * @type number
 * @min 0
 * @default 215
 *
 * @param BottomLeftY
 * @text 螢幕左下角 Y
 * @type number
 * @min 0
 * @default 423
 *
 * @param HeaderText
 * @text 螢幕標題文字
 * @type string
 * @default 主選單
 *
 * @param RevealFrames
 * @text 亮屏淡入幀數
 * @type number
 * @min 0
 * @max 120
 * @default 30
 *
 * @help PhoneTitleMZ.js v2.0.0
 * 適用 RPG Maker MZ，無需其他插件或外加函式庫。
 * 本版對應測試包內「斜放手機」圖片，背景與 JS 請一起覆蓋。
 *
 * 1. 本檔放到 js/plugins/PhoneTitleMZ.js，勿改檔名。
 * 2. 斜放背景放到 img/titles1/PhoneTitle_Test.png。
 * 3. 插件管理員將 PhoneTitleMZ 設 ON，其餘標題／略過標題插件先關閉。
 * 4. 參數維持預設即可；遊戲畫面維持 816 x 624。
 * 5. 關閉舊測試視窗，儲存後重新啟動測試。
 *
 * 開始／繼續／設定／結束均保留。上下鍵、Enter、滑鼠、觸控可操作。
 * 無存檔時「繼續」停用；「結束」只在 NW.js 桌面版啟用。
 * 讀檔及設定仍為 MZ 原生畫面。本版沒有手放手機或鏡頭動畫。
 *
 * 文字、反白與操作說明使用相同透視；滑鼠反向映射至相同的按鈕。
 * 背景會自動縮放到遊戲畫布，不會修改專案解析度。
 * 更換不同構圖時，以「遊戲畫面」816 x 624 為基準設定螢幕四角。
 * 左上／右上／右下／左下是以手機本身的閱讀方向判斷。
 * 四角請沿著螢幕內緣向內縮，並依此順序形成不交叉的凸四邊形。
 * v1 的 ScreenX/Y/Width/Height/MenuOffsetY 已不使用。
 * 關閉本插件並重開遊戲即可還原資料庫原本的標題。
 * 程式碼授權：MIT，詳見套件 LICENSE.txt。
 */

(() => {
    "use strict";

    const parameters = PluginManager.parameters("PhoneTitleMZ");
    const UI_WIDTH = 320;
    const UI_HEIGHT = 640;
    const MENU_TOP = 202;
    const ROW_HEIGHT = 76;
    const numberParameter = (key, fallback) => {
        const raw = parameters[key];
        const value = raw === undefined || raw === "" ? fallback : Number(raw);
        return Number.isFinite(value) ? Math.max(0, value) : fallback;
    };
    const settings = {
        image: parameters.BackgroundImage || "PhoneTitle_Test",
        header: parameters.HeaderText === undefined ? "主選單" : parameters.HeaderText,
        revealFrames: Math.min(120, numberParameter("RevealFrames", 30)),
        corners: [
            [numberParameter("TopLeftX", 418), numberParameter("TopLeftY", 64)],
            [numberParameter("TopRightX", 610), numberParameter("TopRightY", 128)],
            [numberParameter("BottomRightX", 431), numberParameter("BottomRightY", 505)],
            [numberParameter("BottomLeftX", 215), numberParameter("BottomLeftY", 423)]
        ]
    };

    // Map the entire virtual display onto the measured phone display corners.
    function makeProjection() {
        const points = settings.corners.map(point => ({
            x: point[0] * Graphics.width / 816,
            y: point[1] * Graphics.height / 624
        }));
        let winding = 0;
        for (let i = 0; i < 4; i++) {
            const p = points[i];
            const q = points[(i + 1) % 4];
            const r = points[(i + 2) % 4];
            const cross = (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x);
            if (Math.abs(cross) < 0.001 || (winding && Math.sign(cross) !== winding)) {
                throw new Error("PhoneTitleMZ：請依左上、右上、右下、左下，設定不交叉的螢幕四角。");
            }
            winding = Math.sign(cross);
        }
        const [p0, p1, p2, p3] = points;
        const dx1 = p1.x - p2.x;
        const dx2 = p3.x - p2.x;
        const dx3 = p0.x - p1.x + p2.x - p3.x;
        const dy1 = p1.y - p2.y;
        const dy2 = p3.y - p2.y;
        const dy3 = p0.y - p1.y + p2.y - p3.y;
        const denominator = dx1 * dy2 - dx2 * dy1;
        if (Math.abs(denominator) < 0.001) {
            throw new Error("PhoneTitleMZ：手機螢幕四角無法形成有效範圍。");
        }
        const g = (dx3 * dy2 - dx2 * dy3) / denominator;
        const h = (dx1 * dy3 - dx3 * dy1) / denominator;
        const matrix = [
            p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x,
            p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y,
            g, h, 1
        ];
        const [a, b, c, d, e, f, j, k, l] = matrix;
        const determinant = a * (e * l - f * k) - b * (d * l - f * j) + c * (d * k - e * j);
        if (Math.abs(determinant) < 0.001) {
            throw new Error("PhoneTitleMZ：手機螢幕範圍過小，請重新設定四角。");
        }
        const inverse = [
            e * l - f * k, c * k - b * l, b * f - c * e,
            f * j - d * l, a * l - c * j, c * d - a * f,
            d * k - e * j, b * j - a * k, a * e - b * d
        ].map(value => value / determinant);
        const transform = (m, x, y) => {
            const w = m[6] * x + m[7] * y + m[8];
            return Math.abs(w) < 1e-10 ? null : {
                x: (m[0] * x + m[1] * y + m[2]) / w,
                y: (m[3] * x + m[4] * y + m[5]) / w
            };
        };
        return {
            forward(u, v) {
                return transform(matrix, u, v);
            },
            local(x, y) {
                const point = transform(inverse, x, y);
                if (!point || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
                    return null;
                }
                return {x: point.x * UI_WIDTH, y: point.y * UI_HEIGHT};
            }
        };
    }

    function makeDisplayMesh(bitmap, projection) {
        // MZ's bundled PixiJS renderer needs no external projection plugin.
        const columns = 16;
        const rows = 32;
        const vertices = new Float32Array((columns + 1) * (rows + 1) * 2);
        const uvs = new Float32Array(vertices.length);
        const indices = new Uint16Array(columns * rows * 6);
        let vertex = 0;
        let triangle = 0;
        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= columns; x++) {
                const u = x / columns;
                const v = y / rows;
                const point = projection.forward(u, v);
                vertices[vertex] = point.x;
                uvs[vertex++] = u;
                vertices[vertex] = point.y;
                uvs[vertex++] = v;
                if (x < columns && y < rows) {
                    const topLeft = y * (columns + 1) + x;
                    const bottomLeft = topLeft + columns + 1;
                    indices[triangle++] = topLeft;
                    indices[triangle++] = topLeft + 1;
                    indices[triangle++] = bottomLeft;
                    indices[triangle++] = topLeft + 1;
                    indices[triangle++] = bottomLeft + 1;
                    indices[triangle++] = bottomLeft;
                }
            }
        }
        const texture = new PIXI.Texture(bitmap.baseTexture);
        const mesh = new PIXI.SimpleMesh(texture, vertices, uvs, indices, PIXI.DRAW_MODES.TRIANGLES);
        mesh.autoUpdate = false;
        return {mesh, texture};
    }

    class Window_PhoneTitleCommand extends Window_TitleCommand {
        initialize(rect) {
            super.initialize(rect);
            // Retain MZ's command/input lifecycle. Only the projected mesh is visible.
            this.opacity = 0;
            this.backOpacity = 0;
            this.alpha = 0;
            this.refresh();
        }

        contentsWidth() { return UI_WIDTH; }
        contentsHeight() { return UI_HEIGHT; }
        itemHeight() { return ROW_HEIGHT; }
        maxCols() { return 1; }
        isWheelScrollEnabled() { return false; }
        isTouchScrollEnabled() { return false; }

        makeCommandList() {
            this.addCommand("開始", "newGame", true);
            this.addCommand("繼續", "continue", this.isContinueEnabled());
            this.addCommand("設定", "options", true);
            this.addCommand("結束", "phoneExit", Utils.isNwjs());
        }

        itemRect(index) {
            return new Rectangle(24, MENU_TOP + index * ROW_HEIGHT, UI_WIDTH - 48, ROW_HEIGHT);
        }

        select(index) {
            const previous = this.index();
            super.select(index);
            if (previous !== index && this.contents && this._list) {
                this.paint();
            }
        }

        refreshCursor() { this.setCursorRect(0, 0, 0, 0); }
        drawItemBackground() { }

        paint() {
            if (!this.contents) return;
            const bitmap = this.contents;
            bitmap.clear();
            this.contentsBack.clear();
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.outlineWidth = 0;
            bitmap.fillRect(0, 0, UI_WIDTH, UI_HEIGHT, "rgba(16,35,55,0.18)");
            bitmap.fontSize = 18;
            bitmap.textColor = "#8ea8bd";
            bitmap.drawText("M A I N  M E N U", 16, 64, UI_WIDTH - 32, 32, "center");
            bitmap.fontSize = 38;
            bitmap.textColor = "#eaf6ff";
            bitmap.drawText(settings.header, 16, 103, UI_WIDTH - 32, 58, "center");
            bitmap.fillRect(42, 181, UI_WIDTH - 84, 1, "rgba(132,195,221,0.32)");
            this.drawAllItems();
            bitmap.fontSize = 21;
            bitmap.outlineWidth = 0;
            bitmap.textColor = "#8fa9bd";
            bitmap.drawText("↑ ↓ 選擇　Enter 確定", 8, 545, UI_WIDTH - 16, 34, "center");
            bitmap.fontSize = 16;
            bitmap.textColor = "#6b859a";
            bitmap.drawText(Utils.isNwjs() ? "也可使用滑鼠點選" : "網頁版無法使用「結束」", 8, 584, UI_WIDTH - 16, 30, "center");
        }

        drawItem(index) {
            const rect = this.itemRect(index);
            const selected = index === this.index();
            const enabled = this.isCommandEnabled(index);
            const bitmap = this.contents;
            if (selected) {
                bitmap.fillRect(rect.x, rect.y + 6, rect.width, rect.height - 12,
                    enabled ? "rgba(75,173,213,0.27)" : "rgba(116,130,148,0.18)");
                bitmap.fillRect(rect.x, rect.y + 6, 3, rect.height - 12, enabled ? "#8de4ff" : "#617184");
            }
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.fontSize = 38;
            bitmap.outlineWidth = 0;
            bitmap.textColor = enabled ? (selected ? "#c4f4ff" : "#e5eaf2") : "#66788d";
            bitmap.drawText(this.commandName(index), rect.x + 12, rect.y + 8, rect.width - 24, 60, "center");
        }

        pointerPosition() {
            return this._phoneProjection ? this._phoneProjection.local(TouchInput.x, TouchInput.y) : null;
        }

        isTouchedInsideFrame() { return !!this.pointerPosition(); }

        hitIndex() {
            const point = this.pointerPosition();
            if (point) {
                for (let i = 0; i < this.maxItems(); i++) {
                    if (this.itemRect(i).contains(point.x, point.y)) return i;
                }
            }
            return -1;
        }

        processTouch() {
            if (!this.isOpenAndActive()) return;
            const index = this.hitIndex();
            if (index < 0) return;
            if (TouchInput.isHovered() || TouchInput.isClicked()) {
                if (index !== this.index()) {
                    this.select(index);
                    this.playCursorSound();
                }
                if (TouchInput.isClicked()) this.processOk();
            }
        }
    }

    Scene_Title.prototype.createBackground = function() {
        this._backSprite1 = new Sprite(ImageManager.loadTitle1(settings.image));
        this._backSprite2 = new Sprite();
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
        this._backSprite1.bitmap.addLoadListener(() => this.adjustBackground());
    };

    Scene_Title.prototype.adjustBackground = function() {
        const sprite = this._backSprite1;
        if (sprite && sprite.bitmap && sprite.bitmap.width > 0 && sprite.bitmap.height > 0) {
            sprite.anchor.set(0, 0);
            sprite.x = 0;
            sprite.y = 0;
            sprite.scale.x = Graphics.width / sprite.bitmap.width;
            sprite.scale.y = Graphics.height / sprite.bitmap.height;
        }
    };

    Scene_Title.prototype.createForeground = function() {
        // Header, commands, highlight, and hints share one projected texture.
    };

    Scene_Title.prototype.createCommandWindow = function() {
        const padding = $gameSystem.windowPadding();
        this._commandWindow = new Window_PhoneTitleCommand(new Rectangle(0, 0,
            UI_WIDTH + padding * 2, UI_HEIGHT + padding * 2));
        this._commandWindow._phoneProjection = makeProjection();
        this._commandWindow.setHandler("newGame", this.commandNewGame.bind(this));
        this._commandWindow.setHandler("continue", this.commandContinue.bind(this));
        this._commandWindow.setHandler("options", this.commandOptions.bind(this));
        this._commandWindow.setHandler("phoneExit", this.commandPhoneExit.bind(this));
        this.addWindow(this._commandWindow);
        const display = makeDisplayMesh(this._commandWindow.contents, this._commandWindow._phoneProjection);
        this._phoneScreenMesh = display.mesh;
        this._phoneScreenTexture = display.texture;
        this._phoneScreenMesh.alpha = 0;
        this.addChild(this._phoneScreenMesh);
    };

    Scene_Title.prototype.commandPhoneExit = function() {
        if (Utils.isNwjs()) {
            this._commandWindow.close();
            this.fadeOutAll();
            SceneManager.exit();
        }
    };

    const originalStart = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        originalStart.call(this);
        this.adjustBackground();
        this._phoneRevealFrame = 0;
        this._phoneRevealProgress = settings.revealFrames > 0 ? 0 : 1;
        this._phoneRevealing = settings.revealFrames > 0;
        if (this._phoneRevealing) this._commandWindow.deactivate();
    };

    const originalUpdate = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        originalUpdate.call(this);
        if (this._phoneRevealing && !this.isFading()) {
            this._phoneRevealFrame += 1;
            this._phoneRevealProgress = Math.min(1, this._phoneRevealFrame / settings.revealFrames);
            if (this._phoneRevealProgress >= 1) {
                this._phoneRevealing = false;
                this._commandWindow.activate();
            }
        }
        if (this._phoneScreenMesh) {
            this._phoneScreenMesh.alpha = this._phoneRevealProgress * this._commandWindow.openness / 255;
        }
    };

    const originalTerminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        // Capture MZ's transition snapshot before releasing the projection resources.
        originalTerminate.call(this);
        if (this._phoneScreenMesh) {
            this.removeChild(this._phoneScreenMesh);
            this._phoneScreenMesh.destroy({children: true});
            this._phoneScreenMesh = null;
        }
        if (this._phoneScreenTexture) {
            this._phoneScreenTexture.destroy(false);
            this._phoneScreenTexture = null;
        }
    };
})();
