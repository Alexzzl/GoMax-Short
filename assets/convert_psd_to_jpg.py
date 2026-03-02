"""
PSD to JPG Converter Script
将 assets 文件夹中的所有 .psd 文件转换为 .jpg 格式

依赖安装:
    pip install Pillow psd-tools

使用方法:
    python convert_psd_to_jpg.py
"""

import os
from pathlib import Path
from PIL import Image

def convert_psd_to_jpg(psd_path, quality=95):
    """
    将单个 PSD 文件转换为 JPG
    
    Args:
        psd_path: PSD 文件路径
        quality: JPG 质量 (1-100), 默认 95
    """
    try:
        # 打开 PSD 文件
        img = Image.open(psd_path)
        
        # 转换为 RGB 模式 (JPG 不支持透明通道)
        if img.mode in ('RGBA', 'LA', 'P'):
            # 创建白色背景
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 生成 JPG 文件路径
        jpg_path = Path(psd_path).with_suffix('.jpg')
        
        # 保存为 JPG
        img.save(jpg_path, 'JPEG', quality=quality, optimize=True)
        
        print(f"[OK] {psd_path} -> {jpg_path}")
        return True
        
    except Exception as e:
        print(f"[ERROR] {psd_path}: {e}")
        return False

def find_psd_files(root_dir):
    """
    递归查找所有 PSD 文件
    
    Args:
        root_dir: 根目录路径
    """
    root_path = Path(root_dir)
    psd_files = list(root_path.rglob("*.psd"))
    return psd_files

def main():
    """主函数"""
    # 获取脚本所在目录 (assets 文件夹)
    script_dir = Path(__file__).parent.resolve()
    
    print("=" * 60)
    print("PSD to JPG Converter")
    print("=" * 60)
    print(f"工作目录: {script_dir}")
    
    # 查找所有 PSD 文件
    psd_files = find_psd_files(script_dir)
    
    if not psd_files:
        print("\n未找到任何 .psd 文件")
        return
    
    print(f"\n找到 {len(psd_files)} 个 .psd 文件")
    print("-" * 60)
    
    # 统计
    success_count = 0
    error_count = 0
    
    # 转换每个文件
    for psd_file in psd_files:
        if convert_psd_to_jpg(str(psd_file)):
            success_count += 1
        else:
            error_count += 1
    
    # 输出结果
    print("-" * 60)
    print(f"\n转换完成!")
    print(f"  成功: {success_count} 个")
    print(f"  失败: {error_count} 个")
    print("=" * 60)

if __name__ == "__main__":
    main()
