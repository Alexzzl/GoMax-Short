/**
 * 遥控器交互模块 - Remote Control Module
 * 处理Samsung TV遥控器按键事件
 */

const Remote = {
    // 遥控器按键码
    KEYS: {
        ENTER: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        BACK: 10009,
        EXIT: 10182,
        COLOR_F0: 403,  // 红色
        COLOR_F1: 404,  // 绿色
        COLOR_F2: 405,  // 黄色
        COLOR_F3: 406,  // 蓝色
        VOLUME_UP: 447,
        VOLUME_DOWN: 448,
        MUTE: 449,
        PLAY: 415,
        PAUSE: 19,
        STOP: 413,
        FAST_FORWARD: 417,
        REWIND: 412,
        CHANNEL_UP: 427,
        CHANNEL_DOWN: 428
    },

    // 当前焦点元素
    currentFocus: null,
    focusableElements: [],
    focusHistory: [],

    // 初始化
    init() {
        this.scanFocusableElements();
        this.bindEvents();
        console.log('Remote controller initialized');
    },

    // 扫描可聚焦元素
    scanFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll('[data-focusable="true"]'));
    },

    // 绑定事件
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        // 监听DOM变化重新扫描
        const observer = new MutationObserver(() => {
            this.scanFocusableElements();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    // 处理按键事件
    handleKeyDown(event) {
        const keyCode = event.keyCode || event.which;

        // 阻止默认行为（除了普通文本输入）
        if (!this.isInputFocused()) {
            event.preventDefault();
        }

        switch (keyCode) {
            case this.KEYS.UP:
                this.navigateUp();
                break;
            case this.KEYS.DOWN:
                this.navigateDown();
                break;
            case this.KEYS.LEFT:
                this.navigateLeft();
                break;
            case this.KEYS.RIGHT:
                this.navigateRight();
                break;
            case this.KEYS.ENTER:
                this.confirm();
                break;
            case this.KEYS.BACK:
            case this.KEYS.EXIT:
                this.handleReturnKey();
                break;
            case this.KEYS.PLAY:
            case this.KEYS.PAUSE:
                this.togglePlayPause();
                break;
            case this.KEYS.FAST_FORWARD:
                this.fastForward();
                break;
            case this.KEYS.REWIND:
                this.rewind();
                break;
            default:
                break;
        }

        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('remote-key', {
            detail: { keyCode, remote: this }
        }));
    },

    // 检查是否在输入框中
    isInputFocused() {
        const tag = document.activeElement?.tagName?.toLowerCase();
        return tag === 'input' || tag === 'textarea';
    },

    // 获取当前焦点索引
    getCurrentIndex() {
        if (!this.currentFocus) {
            return -1;
        }
        return this.focusableElements.indexOf(this.currentFocus);
    },

    // 向上导航
    navigateUp() {
        const currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            this.setFocus(0);
            return;
        }

        // 计算网格列数
        const columns = this.calculateColumns();
        let newIndex = currentIndex - columns;

        if (newIndex >= 0) {
            this.setFocus(newIndex);
        }
    },

    // 向下导航
    navigateDown() {
        const currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            this.setFocus(0);
            return;
        }

        const columns = this.calculateColumns();
        let newIndex = currentIndex + columns;

        if (newIndex < this.focusableElements.length) {
            this.setFocus(newIndex);
        }
    },

    // 向左导航
    navigateLeft() {
        const currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            this.setFocus(0);
            return;
        }

        let newIndex = currentIndex - 1;
        if (newIndex >= 0) {
            this.setFocus(newIndex);
        }
    },

    // 向右导航
    navigateRight() {
        const currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            this.setFocus(0);
            return;
        }

        let newIndex = currentIndex + 1;
        if (newIndex < this.focusableElements.length) {
            this.setFocus(newIndex);
        }
    },

    // 计算网格列数（基于CSS grid）
    calculateColumns() {
        const container = this.currentFocus?.closest('.drama-grid, .categories-grid, .episodes-grid, .nav-menu');
        if (!container) return 1;

        const style = window.getComputedStyle(container);
        const gridTemplate = style.getPropertyValue('grid-template-columns');
        if (gridTemplate && gridTemplate !== 'none') {
            return 1; // 单列
        }

        // 尝试获取flex布局的列数
        const flexWrap = style.getPropertyValue('flex-wrap');
        if (flexWrap === 'wrap') {
            const containerWidth = container.offsetWidth;
            const childWidth = this.currentFocus?.offsetWidth || 200;
            return Math.max(1, Math.floor(containerWidth / (childWidth + 20)));
        }

        return 1;
    },

    // 确认选择
    confirm() {
        if (this.currentFocus) {
            // 触发点击事件
            this.currentFocus.click();

            // 触发自定义确认事件
            this.currentFocus.dispatchEvent(new CustomEvent('remote-confirm', {
                bubbles: true,
                detail: { element: this.currentFocus }
            }));
        }
    },

    // 返回
    goBack() {
        // 触发自定义返回事件
        document.dispatchEvent(new CustomEvent('remote-back', {
            detail: { remote: this }
        }));

        // 如果有历史记录则返回
        if (this.focusHistory.length > 0) {
            const lastFocus = this.focusHistory.pop();
            if (document.contains(lastFocus)) {
                this.setFocus(lastFocus);
            }
        }
    },

    // 处理Return/Exit键（遵循三星返回键策略）
    handleReturnKey() {
        const currentPage = window.Router ? Router.getCurrentPage() : 'home';

        // 如果当前在主页，显示退出确认弹窗
        if (currentPage === 'home') {
            this.showExitConfirmation();
        } else {
            // 在其他页面，执行返回操作
            this.goBack();
        }
    },

    // 退出应用
    exitApp() {
        if (typeof tizen !== 'undefined') {
            tizen.application.getCurrentApplication().exit();
        } else {
            console.log('Exit app (simulated in web)');
        }
    },

    // 显示退出确认弹窗
    showExitConfirmation() {
        // 创建退出确认弹窗
        const exitModal = document.createElement('div');
        exitModal.id = 'exit-confirmation-modal';
        exitModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        exitModal.innerHTML = `
            <div class="exit-confirmation-dialog" style="
                background-color: var(--bg-card);
                padding: 40px;
                border-radius: 12px;
                text-align: center;
                min-width: 400px;
                border: 2px solid var(--primary-color);
            ">
                <h2 style="color: var(--text-primary); margin-bottom: 20px;">Exit Application</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 18px;">
                    Are you sure you want to exit GoMax Short?
                </p>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="exit-cancel-btn" data-focusable="true" style="
                        padding: 12px 24px;
                        background-color: var(--bg-hover);
                        color: var(--text-primary);
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        min-width: 100px;
                    ">Cancel</button>
                    <button id="exit-confirm-btn" data-focusable="true" style="
                        padding: 12px 24px;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        min-width: 100px;
                    ">Exit</button>
                </div>
            </div>
        `;

        document.body.appendChild(exitModal);

        // 绑定事件
        const cancelBtn = exitModal.querySelector('#exit-cancel-btn');
        const confirmBtn = exitModal.querySelector('#exit-confirm-btn');

        cancelBtn.addEventListener('click', () => {
            this.hideExitConfirmation();
        });

        confirmBtn.addEventListener('click', () => {
            this.hideExitConfirmation();
            this.exitApp();
        });

        // 设置焦点到取消按钮
        setTimeout(() => {
            this.setFocus(cancelBtn);
        }, 100);

        // 监听返回键关闭弹窗
        const handleModalKeydown = (e) => {
            const keyCode = e.keyCode || e.which;
            if (keyCode === this.KEYS.BACK) {
                e.preventDefault();
                this.hideExitConfirmation();
                document.removeEventListener('keydown', handleModalKeydown);
            }
        };

        document.addEventListener('keydown', handleModalKeydown);
    },

    // 隐藏退出确认弹窗
    hideExitConfirmation() {
        const modal = document.getElementById('exit-confirmation-modal');
        if (modal) {
            modal.remove();
        }

        // 重新扫描可聚焦元素并设置焦点
        this.scanFocusableElements();
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    },

    // 播放/暂停
    togglePlayPause() {
        const video = document.getElementById('video-player');
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    },

    // 快进
    fastForward() {
        const video = document.getElementById('video-player');
        if (video) {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
        }
    },

    // 快退
    rewind() {
        const video = document.getElementById('video-player');
        if (video) {
            video.currentTime = Math.max(0, video.currentTime - 10);
        }
    },

    // 设置焦点
    setFocus(elementOrIndex) {
        // 移除当前焦点
        if (this.currentFocus) {
            this.currentFocus.classList.remove('focused');
            this.focusHistory.push(this.currentFocus);
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        }

        // 设置新焦点
        if (typeof elementOrIndex === 'number') {
            this.currentFocus = this.focusableElements[elementOrIndex];
        } else {
            this.currentFocus = elementOrIndex;
        }

        if (this.currentFocus) {
            this.currentFocus.classList.add('focused');
            this.currentFocus.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    },

    // 清除焦点
    clearFocus() {
        if (this.currentFocus) {
            this.currentFocus.classList.remove('focused');
            this.currentFocus = null;
        }
    },

    // 导航到指定页面时重置焦点
    resetForPage(pageId) {
        this.focusHistory = [];
        this.scanFocusableElements();

        // 默认聚焦第一个元素
        const firstElement = this.focusableElements.find(el =>
            el.closest(`#${pageId}-page`) || el.closest('#main-nav')
        );

        if (firstElement) {
            this.setFocus(firstElement);
        }
    }
};

// 导出模块
window.Remote = Remote;
