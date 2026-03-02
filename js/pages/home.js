/**
 * 首页逻辑 - Home Page Module
 */

const HomePage = {
    // 初始化
    init() {
        this.renderHeroCards();
        this.renderPopularDramas();
        this.bindEvents();
    },

    // 绑定事件
    bindEvents() {
        // Hero 卡片点击
        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', () => {
                // 根据卡片类型执行不同操作
                const title = card.querySelector('.hero-card-title').textContent;
                if (title === 'Episodes') {
                    Router.navigateTo('discover');
                } else if (title === 'Trailers') {
                    // 可以跳转到预告片页面
                    console.log('Trailers clicked');
                } else if (title === 'More Like This') {
                    Router.navigateTo('discover');
                }
            });
        });
    },

    // 渲染 Hero 卡片（已经在 HTML 中静态定义）
    renderHeroCards() {
        // Hero 内容已经在 HTML 中静态渲染
        console.log('Hero cards loaded');
    },

    // 渲染热门剧集
    renderPopularDramas() {
        const grid = document.getElementById('popular-dramas');
        if (!grid) return;

        const dramas = MockData.getPopularDramas().slice(0, 4);
        grid.innerHTML = dramas.map(drama => this.createDramaCard(drama)).join('');

        // 绑定点击事件
        grid.querySelectorAll('.home-drama-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 如果点击的是按钮，不触发卡片点击
                if (e.target.closest('.action-btn')) return;
                Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
            });
        });

        // 绑定按钮事件
        grid.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dramaId = btn.dataset.dramaId;
                if (dramaId) {
                    Router.navigateTo('detail', { dramaId });
                } else {
                    // 添加到收藏
                    const card = btn.closest('.home-drama-card');
                    MockData.toggleFavorite(parseInt(card.dataset.dramaId));
                }
            });
        });
    },

    // 创建剧集卡片
    createDramaCard(drama) {
        const badge = drama.badge ? `<span class="card-badge">${drama.badge}</span>` : '';
        const metaInfo = drama.seasons ? `${drama.seasons} Seasons` : `${drama.episodes} Episodes`;
        const category = MockData.categories.find(c => c.id === drama.category);
        const categoryName = category ? category.name : drama.category;

        return `
            <div class="home-drama-card" data-drama-id="${drama.id}" data-focusable="true">
                <div class="card-poster">
                    <img class="card-image" src="https://dramavibe.sfo3.cdn.digitaloceanspaces.com/${drama.title}/poster.jpg" alt="${drama.title}" onerror="this.src='assets/CodeBubbyAssets/3052_654/2.png'">
                    ${badge}
                </div>
                <div class="card-content">
                    <h3 class="card-title">${drama.title}</h3>
                    <div class="card-meta">
                        <span>${metaInfo}</span>
                        <span>${categoryName}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn primary" data-drama-id="${drama.id}">Watch Now</button>
                    <button class="action-btn secondary">+</button>
                </div>
            </div>
        `;
    }
};

// 导出模块
window.HomePage = HomePage;
