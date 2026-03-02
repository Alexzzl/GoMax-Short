/**
 * 发现页逻辑 - Discover Page Module
 */

const DiscoverPage = {
    // 初始化
    init() {
        this.renderCategories();
        this.renderTrending();
        this.renderQuickWatch();
        this.renderNewReleases();
        this.bindEvents();
    },

    // 绑定事件
    bindEvents() {
        // 免费观看按钮
        const freeBtn = document.querySelector('.free-banner-btn');
        if (freeBtn) {
            freeBtn.addEventListener('click', () => {
                Router.navigateTo('home');
            });
        }

        // View All 按钮
        document.querySelectorAll('.view-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 跳转到详情或显示更多
                console.log('View all clicked:', e.target.textContent);
            });
        });
    },

    // 渲染分类卡片
    renderCategories() {
        const grid = document.getElementById('discover-categories');
        if (!grid) return;

        // 获取每个分类的剧集数量
        const categoryCounts = {};
        MockData.categories.forEach(cat => {
            const count = MockData.getDramasByCategory(cat.id).length;
            categoryCounts[cat.id] = count;
        });

        // 按数量排序
        const sortedCategories = [...MockData.categories]
            .filter(cat => categoryCounts[cat.id] > 0)
            .slice(0, 4);

        grid.innerHTML = sortedCategories.map(cat => `
            <div class="category-card" data-category="${cat.id}" data-focusable="true">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${categoryCounts[cat.id]} Series</div>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                // 可以跳转到该分类的详情页或过滤显示
                console.log('Category clicked:', card.dataset.category);
            });
        });
    },

    // 渲染 Trending
    renderTrending() {
        const grid = document.getElementById('trending-dramas');
        if (!grid) return;

        const dramas = MockData.getPopularDramas().slice(0, 6);

        grid.innerHTML = dramas.map(drama => this.createTrendingCard(drama)).join('');

        // 绑定点击事件
        grid.querySelectorAll('.trending-card').forEach(card => {
            card.addEventListener('click', () => {
                Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
            });

            // Watch 按钮事件
            const watchBtn = card.querySelector('.card-watch-btn');
            if (watchBtn) {
                watchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
                });
            }
        });
    },

    // 渲染 Quick Watch
    renderQuickWatch() {
        const grid = document.getElementById('quick-watch-dramas');
        if (!grid) return;

        // 获取剧集数少的剧集（适合快速观看）
        const quickDramas = [...MockData.dramas]
            .filter(d => d.episodes <= 20)
            .slice(0, 8);

        grid.innerHTML = quickDramas.map((drama, index) => this.createQuickWatchCard(drama, index)).join('');

        // 绑定点击事件
        grid.querySelectorAll('.quick-watch-card').forEach(card => {
            card.addEventListener('click', () => {
                Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
            });
        });
    },

    // 渲染 New Releases
    renderNewReleases() {
        const grid = document.getElementById('new-releases-dramas');
        if (!grid) return;

        const dramas = MockData.getLatestDramas().slice(0, 6);

        grid.innerHTML = dramas.map(drama => this.createTrendingCard(drama)).join('');

        // 绑定点击事件
        grid.querySelectorAll('.new-release-card').forEach(card => {
            card.addEventListener('click', () => {
                Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
            });

            const watchBtn = card.querySelector('.card-watch-btn');
            if (watchBtn) {
                watchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    Router.navigateTo('detail', { dramaId: card.dataset.dramaId });
                });
            }
        });
    },

    // 创建 Trending 卡片
    createTrendingCard(drama) {
        const badge = drama.badge || 'NEW';
        const metaInfo = drama.seasons ? `${drama.seasons} Seasons` : `${drama.episodes} Eps`;
        const category = MockData.categories.find(c => c.id === drama.category);
        const categoryName = category ? category.name : drama.category;

        return `
            <div class="${this.isTrendingSection(drama) ? 'trending-card' : 'new-release-card'}" data-drama-id="${drama.id}" data-focusable="true">
                <div class="card-poster">
                    <img src="${drama.image}" alt="${drama.title}" onerror="this.src='assets/CodeBubbyAssets/3052_654/2.png'">
                    <span class="card-badge">${badge}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${drama.title}</h3>
                    <p class="card-meta">${categoryName} · ${metaInfo}</p>
                    <button class="card-watch-btn">Watch</button>
                </div>
            </div>
        `;
    },

    // 创建 Quick Watch 卡片
    createQuickWatchCard(drama, index) {
        // 模拟不同时长
        const minutes = [5, 6, 7, 8, 5, 6, 7, 8];
        const duration = minutes[index % minutes.length];

        return `
            <div class="quick-watch-card" data-drama-id="${drama.id}" data-focusable="true">
                <div class="quick-time-badge">${duration} min</div>
                <div class="quick-thumbnail">
                    <img src="${drama.image}" alt="${drama.title}" onerror="this.src='assets/CodeBubbyAssets/3052_654/2.png'">
                </div>
                <h3 class="quick-title">${drama.title}</h3>
            </div>
        `;
    },

    // 判断是否是 Trending Section
    isTrendingSection(drama) {
        const trendingIds = MockData.getPopularDramas().slice(0, 6).map(d => d.id);
        return trendingIds.includes(drama.id);
    }
};

// 导出模块
window.DiscoverPage = DiscoverPage;
