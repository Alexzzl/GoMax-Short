"""
Single PSD to JPG Converter Script
将单个 PSD 文件转换为 JPG 格式

依赖安装:
    pip install Pillow psd-tools

使用方法:
    python convert_single_psd.py <psd_file_path> [quality]
    
示例:
    python convert_single_psd.py image.psd
    python convert_single_psd.py image.psd 90
"""

import sys
from pathlib import Path
from PIL import Image

# 尝试导入 psd-tools
try:
    from psd_tools import PSDImage
    PSD_TOOLS_AVAILABLE = True
except ImportError:
    PSD_TOOLS_AVAILABLE = False
    print("[警告] psd-tools 未安装，将使用 Pillow 直接读取 PSD（可能不支持某些 PSD 文件）")

def convert_psd_to_jpg(psd_path, quality=95):
    """
    将单个 PSD 文件转换为 JPG
    
    Args:
        psd_path: PSD 文件路径
        quality: JPG 质量 (1-100), 默认 95
    
    Returns:
        bool: 转换是否成功
    """
    try:
        # 转换为 Path 对象
        psd_path = Path(psd_path)
        
        # 检查文件是否存在
        if not psd_path.exists():
            print(f"[错误] 文件不存在: {psd_path}")
            return False
        
        # 检查文件扩展名
        if psd_path.suffix.lower() != '.psd':
            print(f"[错误] 文件不是 PSD 格式: {psd_path}")
            return False
        
        # 打开 PSD 文件
        print(f"[信息] 正在打开: {psd_path}")
        
        # 尝试使用 psd-tools 打开（推荐）
        if PSD_TOOLS_AVAILABLE:
            print(f"[信息] 使用 psd-tools 读取 PSD 文件")
            psd = PSDImage.open(psd_path)
            
            # 合并所有图层并转换为 PIL Image
            img = psd.composite()
            
            # 获取图像信息
            print(f"[信息] 图像尺寸: {img.width} x {img.height}")
            print(f"[信息] 图像模式: {img.mode}")
            
            # 转换为 RGB
            if img.mode != 'RGB':
                img = img.convert('RGB')
        else:
            # 使用 Pillow 直接打开（兼容性较差）
            print(f"[信息] 使用 Pillow 直接读取 PSD 文件")
            img = Image.open(psd_path)
            
            # 获取图像信息
            print(f"[信息] 图像尺寸: {img.size[0]} x {img.size[1]}")
            print(f"[信息] 图像模式: {img.mode}")
            
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
        jpg_path = psd_path.with_suffix('.jpg')
        
        # 保存为 JPG
        print(f"[信息] 正在保存: {jpg_path}")
        img.save(jpg_path, 'JPEG', quality=quality, optimize=True)
        # 确保图像是 RGB 模式
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 获取文件大小
        psd_size = psd_path.stat().st_size / (1024 * 1024)  # MB
        jpg_size = jpg_path.stat().st_size / (1024 * 1024)  # MB
        compression_ratio = ((1 - jpg_size / psd_size) * 100) if psd_size > 0 else 0
        
        print(f"[成功] {psd_path.name} -> {jpg_path.name}")
        print(f"[信息] PSD 大小: {psd_size:.2f} MB")
        print(f"[信息] JPG 大小: {jpg_size:.2f} MB")
        print(f"[信息] 压缩率: {compression_ratio:.1f}%")
        return True
        
    except Exception as e:
        print(f"[错误] {psd_path}: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("Single PSD to JPG Converter")
    print("=" * 60)
    
    # 检查命令行参数
    if len(sys.argv) < 2:
        print("\n使用方法:")
        print("  python convert_single_psd.py <psd_file_path> [quality]")
        print("\n参数说明:")
        print("  psd_file_path: PSD 文件路径（必需）")
        print("  quality: JPG 质量 1-100，默认 95（可选）")
        print("\n示例:")
        print("  python convert_single_psd.py image.psd")
        print("  python convert_single_psd.py /path/to/image.psd 90")
        print("=" * 60)
        return
    
    # 获取 PSD 文件路径
    psd_path = sys.argv[1]
    
    # 获取质量参数（可选）
    quality = 95
    if len(sys.argv) >= 3:
        try:
            quality = int(sys.argv[2])
            if quality < 1 or quality > 100:
                print("[错误] 质量参数必须在 1-100 之间")
                return
        except ValueError:
            print("[错误] 质量参数必须是整数")
            return
    
    print(f"质量参数: {quality}")
    print("-" * 60)
    
    # 转换文件
    if convert_psd_to_jpg(psd_path, quality):
        print("\n转换成功!")
    else:
        print("\n转换失败!")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
