#!/bin/bash

# PDF 提取服务启动脚本

echo "正在启动 PDF 提取服务..."

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查是否在 pdf_service 目录
if [ ! -f "app.py" ]; then
    echo "错误: 请在 pdf_service 目录下运行此脚本"
    exit 1
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "安装依赖包..."
pip install -r requirements.txt

# 启动服务
echo ""
echo "=========================================="
echo "PDF 提取服务已启动"
echo "地址: http://localhost:5001"
echo "健康检查: http://localhost:5001/health"
echo "=========================================="
echo ""

python app.py
