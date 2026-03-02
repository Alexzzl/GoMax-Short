/**
 * 路由管理 - Router Module
 * 页面导航管理
 */

const Router = {
    // 当前页面
    currentPage: 'home',

    // 页面堆栈
    pageStack: [],

    // 初始化
    init() {
        this.bindNavigationEvents();
        this.navigateTo('home');
    },

    // 绑定导航事件
    bindNavigationEvents() {
        // 导航菜单点击
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page, {}, item);
            });
        });

        // 遥控器返回事件
        document.addEventListener('remote-back', () => {
            this.goBack();
        });
    },

    // 导航到指定页面
    navigateTo(page, params = {}, newFocus = null) {
        // 保存当前页面到堆栈
        if (this.currentPage !== page) {
            this.pageStack.push({
                page: this.currentPage,
                params: this.getCurrentParams()
            });
            if (this.pageStack.length > 10) {
                this.pageStack.shift();
            }
        }

        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 更新导航状态
        this.updateNavState(page);

        // 设置当前页面
        this.currentPage = page;

        // 保存参数
        this.currentParams = params;

        // 重置遥控器焦点
        if (window.Remote) {
            if (newFocus) {
                Remote.setFocus(newFocus);
            } else {
                Remote.resetForPage(page);
            }
        }

        // 触发页面切换事件
        document.dispatchEvent(new CustomEvent('page-change', {
            detail: { page, params }
        }));
    },

    // 返回上一页
    goBack() {
        if (this.pageStack.length > 0) {
            const last = this.pageStack.pop();
            this.navigateTo(last.page, last.params);
        }
    },

    // 更新导航状态
    updateNavState(activePage) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    // 获取当前参数
    getCurrentParams() {
        return this.currentParams || {};
    },

    // 获取当前页面
    getCurrentPage() {
        return this.currentPage;
    }
};

// 导出模块
window.Router = Router;
