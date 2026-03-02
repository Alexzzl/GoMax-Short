"""
Delete Converted PSD Files Script
删除已成功转换为 JPG 的 PSD 文件

依赖安装:
    pip install Pillow psd-tools

使用方法:
    python delete_converted_psd.py
"""

import os
from pathlib import Path
from PIL import Image

def check_jpg_exists_and_valid(psd_path):
    """
    检查对应的 JPG 文件是否存在且有效
    
    Args:
        psd_path: PSD 文件路径
    
    Returns:
        bool: JPG 文件是否存在且有效
    """
    jpg_path = Path(psd_path).with_suffix('.jpg')
    
    # 检查 JPG 文件是否存在
    if not jpg_path.exists():
        return False
    
    # 检查 JPG 文件是否可读取（验证文件完整性）
    try:
        with Image.open(jpg_path) as img:
            img.verify()
        # 重新打开以读取完整信息
        with Image.open(jpg_path) as img:
            _ = img.size
        return True
    except Exception:
        return False

def delete_psd(psd_path):
    """
    删除 PSD 文件
    
    Args:
        psd_path: PSD 文件路径
    
    Returns:
        bool: 删除是否成功
    """
    try:
        os.remove(psd_path)
        print(f"[已删除] {psd_path}")
        return True
    except Exception as e:
        print(f"[删除失败] {psd_path}: {e}")
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
    print("Delete Converted PSD Files")
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
    deleted_count = 0
    kept_count = 0
    invalid_count = 0
    
    # 检查并删除已转换的 PSD
    for psd_file in psd_files:
        if check_jpg_exists_and_valid(psd_file):
            # JPG 存在且有效，删除 PSD
            if delete_psd(str(psd_file)):
                deleted_count += 1
        else:
            # JPG 不存在或无效，保留 PSD
            print(f"[保留] {psd_file} (对应的 JPG 不存在或无效)")
            kept_count += 1
    
    # 输出结果
    print("-" * 60)
    print(f"\n清理完成!")
    print(f"  已删除: {deleted_count} 个 PSD 文件")
    print(f"  已保留: {kept_count} 个 PSD 文件")
    print("=" * 60)

if __name__ == "__main__":
    main()
