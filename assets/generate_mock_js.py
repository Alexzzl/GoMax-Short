"""
Generate mock.js from JSON data
从 JSON 数据生成 mock.js 文件
"""

import json
from pathlib import Path

def format_js_object(data, indent=4):
    """将 Python 对象格式化为 JavaScript 对象"""
    if isinstance(data, dict):
        items = []
        for key, value in data.items():
            formatted_value = format_js_object(value, indent)
            items.append(f"{indent * ' '}{json.dumps(key)}: {formatted_value}")
        return "{\n" + ",\n".join(items) + "\n" + (indent - 4) * ' ' + "}"
    elif isinstance(data, list):
        items = []
        for item in data:
            formatted_item = format_js_object(item, indent + 4)
            # 如果是对象数组，不要每项都换行
            if isinstance(item, dict):
                items.append(formatted_item)
            else:
                items.append(formatted_item)
        if items and isinstance(items[0], str) and '\n' in items[0]:
            return "[\n" + ",\n".join(items) + "\n" + indent * ' ' + "]"
        else:
            return "[" + ", ".join(items) + "]"
    elif isinstance(data, str):
        # 检查是否是 URL，如果是就不加引号（需要单独处理）
        if data.startswith('http'):
            return f"'{data}'"
        return json.dumps(data)
    else:
        return str(data)

def generate_mock_js(json_file, output_file):
    """生成 mock.js 文件"""
    # 读取 JSON 数据
    with open(json_file, 'r', encoding='utf-8') as f:
        dramas_data = json.load(f)
    
    # 生成 episodesList 的 JavaScript 代码
    dramas_js = []
    for drama in dramas_data:
        episodes_js = []
        for ep in drama['episodesList']:
            episodes_js.append(f"""        {{
            id: '{ep['id']}',
            dramaId: {ep['dramaId']},
            number: {ep['number']},
            title: '{ep['title']}',
            desc: '{ep['desc']}',
            videoUrl: '{ep['videoUrl']}',
            thumbnail: '{ep['thumbnail']}',
            duration: '{ep['duration']}'
        }}""")
        
        episodes_list = f'[\n{",\n".join(episodes_js)}\n    ]'
        
        drama_js = f"""    {{
        id: {drama['id']},
        title: '{drama['title']}',
        year: '{drama['year']}',
        episodes: {drama['episodes']},
        rating: {drama['rating']},
        category: '{drama['category']}',
        seasons: {drama['seasons']},
        image: '{drama['image']}',
        backdrop: '{drama['backdrop']}',
        badge: '{drama['badge']}',
        desc: '{drama['desc']}',
        episodesList: {episodes_list}
    }}"""
        dramas_js.append(drama_js)
    
    # 生成完整的 mock.js 内容
    mock_js_content = f"""/**
 * 模拟数据 - Mock Data
 * 短剧应用模拟数据
 */

const MockData = {{
    // 分类数据
    categories: [
        {{ id: 'romance', name: 'Romance', icon: '💕' }},
        {{ id: 'drama', name: 'Drama', icon: '🎭' }},
        {{ id: 'comedy', name: 'Comedy', icon: '😂' }},
        {{ id: 'action', name: 'Action', icon: '⚡' }},
        {{ id: 'thriller', name: 'Thriller', icon: '🔪' }},
        {{ id: 'sci-fi', name: 'Sci-Fi', icon: '🚀' }},
        {{ id: 'fantasy', name: 'Fantasy', icon: '✨' }}
    ],

    // 轮播数据 - 使用多张背景图
    heroItems: [
        {{
            id: 1,
            title: 'Free Short Drama Series, Anytime, Anywhere!',
            desc: 'Watch quick, addictive, and easy-to-watch short drama episodes completely free',
            year: '2024',
            episodes: 24,
            rating: 9.2,
            category: 'romance',
            images: [
                'assets/CodeBubbyAssets/3052_414/2.png',
                'assets/CodeBubbyAssets/3052_414/3.png',
                'assets/CodeBubbyAssets/3052_414/4.png',
                'assets/CodeBubbyAssets/3052_414/5.png',
                'assets/CodeBubbyAssets/3052_414/6.png'
            ],
            backdrop: 'assets/CodeBubbyAssets/3052_414/2.png'
        }},
        {{
            id: 2,
            title: 'The CEO\\'s Secret',
            desc: 'A powerful CEO falls for his innocent assistant. What secrets lie behind their romance?',
            year: '2024',
            episodes: 20,
            rating: 9.5,
            category: 'romance',
            image: 'assets/CodeBubbyAssets/3052_414/7.png',
            backdrop: 'assets/CodeBubbyAssets/3052_414/7.png'
        }},
        {{
            id: 3,
            title: 'Ultimate Warrior',
            desc: 'A martial arts genius rises from nothing to become the ultimate warrior.',
            year: '2024',
            episodes: 30,
            rating: 9.0,
            category: 'action',
            image: 'assets/CodeBubbyAssets/3052_414/8.png',
            backdrop: 'assets/CodeBubbyAssets/3052_414/8.png'
        }}
    ],

    // 剧集数据
    dramas: [
{',\n'.join(dramas_js)}
    ],

    // 获取热门剧集
    getPopularDramas() {{
        return [...this.dramas].sort((a, b) => b.rating - a.rating).slice(0, 12);
    }},

    // 获取最新剧集
    getLatestDramas() {{
        return [...this.dramas].sort((a, b) => b.year - a.year).slice(0, 12);
    }},

    // 获取分类剧集
    getDramasByCategory(category) {{
        if (category === 'all') return this.dramas;
        return this.dramas.filter(d => d.category === category);
    }},

    // 获取剧集详情
    getDramaById(id) {{
        return this.dramas.find(d => d.id === parseInt(id));
    }},

    // 搜索剧集
    searchDramas(query) {{
        const q = query.toLowerCase();
        return this.dramas.filter(d =>
            d.title.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q)
        );
    }},

    // 历史记录
    watchHistory: [],

    // 添加到历史记录
    addToHistory(dramaId, episodeId) {{
        const existing = this.watchHistory.find(h => h.dramaId === dramaId && h.episodeId === episodeId);
        if (existing) {{
            existing.timestamp = Date.now();
        }} else {{
            this.watchHistory.unshift({{
                dramaId,
                episodeId,
                timestamp: Date.now()
            }});
        }}
        // 保持最多20条记录
        if (this.watchHistory.length > 20) {{
            this.watchHistory.pop();
        }}
    }},

    // 获取历史记录详情
    getHistoryWithDetails() {{
        return this.watchHistory.map(h => {{
            const drama = this.getDramaById(h.dramaId);
            const episode = drama?.episodesList?.find(e => e.id === h.episodeId);
            return {{
                ...h,
                drama,
                episode
            }};
        }});
    }},

    // 收藏
    favorites: [],

    // 切换收藏
    toggleFavorite(dramaId) {{
        const index = this.favorites.indexOf(dramaId);
        if (index > -1) {{
            this.favorites.splice(index, 1);
        }} else {{
            this.favorites.push(dramaId);
        }}
        return this.favorites.includes(dramaId);
    }},

    // 检查是否收藏
    isFavorite(dramaId) {{
        return this.favorites.includes(dramaId);
    }}
}};

// 导出数据
window.MockData = MockData;
"""
    
    # 写入文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(mock_js_content)
    
    print(f"Mock.js 已生成: {output_file}")
    print(f"总剧集数: {len(dramas_data)}")
    print(f"总视频数: {sum(len(d['episodesList']) for d in dramas_data)}")

def main():
    base_dir = Path(__file__).parent
    json_file = base_dir / 'mock_data.json'
    output_file = base_dir / '..' / 'js' / 'data' / 'mock.js'
    
    print("=" * 60)
    print("Generate mock.js from JSON")
    print("=" * 60)
    
    generate_mock_js(json_file, output_file)
    
    print("=" * 60)

if __name__ == "__main__":
    main()
