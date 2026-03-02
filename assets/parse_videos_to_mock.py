"""
Parse Videos.txt and Generate Mock Data
解析视频文件列表并生成 mock.js 数据
"""

import os
import json
from pathlib import Path

def parse_videos_file(videos_file):
    """解析视频文件"""
    dramas = []
    
    with open(videos_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_drama = None
    current_episodes = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 检查是否是剧集标题行
        if line.startswith('===') and line.endswith('==='):
            # 保存上一个剧集
            if current_drama and current_episodes:
                dramas.append({
                    'name': current_drama,
                    'episodes': current_episodes,
                    'episode_count': len(current_episodes)
                })
            
            # 开始新剧集
            current_drama = line[3:-3].strip()
            current_episodes = []
        elif line.startswith('https://'):
            # 添加视频链接
            current_episodes.append(line)
    
    # 保存最后一个剧集
    if current_drama and current_episodes:
        dramas.append({
            'name': current_drama,
            'episodes': current_episodes,
            'episode_count': len(current_episodes)
        })
    
    return dramas

def find_poster(drama_name, base_dir):
    """查找剧集海报"""
    # 移除特殊字符，匹配文件夹名
    import re
    drama_clean = re.sub(r'[^\w\s\-]', '', drama_name).strip()
    
    # 尝试匹配文件夹
    for root, dirs, files in os.walk(base_dir):
        for dirname in dirs:
            # 简单的模糊匹配
            dir_clean = re.sub(r'[^\w\s\-]', '', dirname).strip().lower()
            name_clean = drama_clean.lower()
            
            if name_clean in dir_clean or dir_clean in name_clean:
                # 在该文件夹下查找海报
                poster_dir = os.path.join(root, dirname)
                if os.path.isdir(poster_dir):
                    # 查找 poster 或 posters 文件夹
                    for subfolder in ['posters', 'poster', 'images', '']:
                        search_path = os.path.join(poster_dir, subfolder) if subfolder else poster_dir
                        if os.path.isdir(search_path):
                            # 查找 jpg/png 文件
                            for file in os.listdir(search_path):
                                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                                    return os.path.join(search_path, file)
    return None

def generate_mock_data(dramas, base_dir):
    """生成 mock.js 数据"""
    categories = [
        'romance', 'drama', 'comedy', 'action', 'thriller', 'sci-fi', 'fantasy'
    ]
    
    mock_dramas = []
    
    for i, drama in enumerate(dramas):
        drama_id = i + 1
        
        # 查找海报
        poster = find_poster(drama['name'], base_dir)
        if poster:
            # 转换为相对路径
            poster = os.path.relpath(poster, str(base_dir).replace('assets', '')).replace('\\', '/')
        else:
            # 默认海报
            poster = f'assets/CodeBubbyAssets/3052_654/{(i % 8) + 2}.png'
        
        # 生成剧集列表
        episodes_list = []
        for j, url in enumerate(drama['episodes']):
            episodes_list.append({
                'id': f'{drama_id}-{j}',
                'dramaId': drama_id,
                'number': j,
                'title': f'Episode {j}',
                'desc': f'Watch episode {j} of this exciting series.',
                'videoUrl': url,
                'thumbnail': poster,
                'duration': f'{(j % 3) + 1}m'
            })
        
        mock_dramas.append({
            'id': drama_id,
            'title': drama['name'].replace('_', ' '),
            'year': '2024',
            'episodes': drama['episode_count'],
            'rating': round(8.0 + (i % 20) / 10, 1),
            'category': categories[i % len(categories)],
            'seasons': 1,
            'image': poster,
            'backdrop': poster,
            'badge': 'NEW' if i < 3 else ('TRENDING' if i < 6 else ''),
            'desc': f'Watch {drama["name"]}, an exciting short drama series with {drama["episode_count"]} episodes.',
            'episodesList': episodes_list
        })
    
    return mock_dramas

def main():
    base_dir = Path(__file__).parent
    videos_file = base_dir / 'GoMaxShort_Videos.txt'
    assets_dir = base_dir
    
    print("=" * 60)
    print("Parse Videos.txt and Generate Mock Data")
    print("=" * 60)
    
    # 解析视频文件
    print(f"\n正在解析: {videos_file}")
    dramas = parse_videos_file(videos_file)
    print(f"找到 {len(dramas)} 个剧集")
    
    # 生成 mock 数据
    print("\n正在生成 mock 数据...")
    mock_dramas = generate_mock_data(dramas, assets_dir)
    
    # 输出 JSON 格式
    output_file = base_dir / 'mock_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(mock_dramas, f, indent=4, ensure_ascii=False)
    
    print(f"\n数据已保存到: {output_file}")
    
    # 显示统计信息
    print("\n统计信息:")
    print(f"  总剧集数: {len(mock_dramas)}")
    print(f"  总视频数: {sum(len(d['episodes']) for d in dramas)}")
    print(f"  找到海报: {sum(1 for d in mock_dramas if d['image'] and '3052_654' not in d['image'])}")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
