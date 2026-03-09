# PDF 提取服务使用说明

## 快速启动

### 1. 启动 PDF 服务（终端 1）

```bash
cd pdf_service
./start.sh
```

如果遇到权限问题：
```bash
chmod +x start.sh
./start.sh
```

**或者手动启动：**
```bash
cd pdf_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

看到以下输出表示成功：
```
PDF 提取服务已启动
地址: http://localhost:5001
```

### 2. 启动 Next.js 应用（终端 2）

```bash
npm run dev
```

### 3. 测试

访问 http://localhost:3000/upload，上传 PDF 简历即可。

---

## 服务说明

### 端口
- PDF 服务：`http://localhost:5001`
- Next.js：`http://localhost:3000`

### API 接口

#### 健康检查
```bash
curl http://localhost:5001/health
```

#### 提取 PDF 文字
```bash
curl -X POST http://localhost:5001/extract \
  -F "file=@resume.pdf"
```

---

## 环境变量配置（可选）

在 `.env.local` 中配置 PDF 服务地址：

```env
PDF_SERVICE_URL=http://localhost:5001
```

生产环境可以改为：
```env
PDF_SERVICE_URL=https://your-pdf-service.com
```

---

## 依赖说明

### Python 依赖
- `flask` - Web 框架
- `flask-cors` - 跨域支持
- `pdfplumber` - PDF 文字提取（基于 pdfminer.six）

### 优势
- ✅ 稳定可靠，Python PDF 生态最成熟
- ✅ 支持复杂 PDF 布局
- ✅ 提取质量高
- ✅ 与 Next.js 完全解耦

---

## 故障排查

### 问题 1：Python 未安装
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3 python3-pip python3-venv
```

### 问题 2：端口 5001 被占用
修改 `app.py` 最后一行：
```python
app.run(host='0.0.0.0', port=5002, debug=True)  # 改为 5002
```

同时修改 Next.js 的 `.env.local`：
```env
PDF_SERVICE_URL=http://localhost:5002
```

### 问题 3：Next.js 连接失败
确保：
1. PDF 服务正在运行（访问 http://localhost:5001/health 检查）
2. 防火墙未阻止 5001 端口
3. 两个服务都在运行

---

## 生产部署建议

### 方案 1：Docker 部署
创建 `pdf_service/Dockerfile`：
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

### 方案 2：独立服务器
将 PDF 服务部署到独立服务器，Next.js 通过环境变量配置地址。

### 方案 3：Serverless
使用 AWS Lambda + API Gateway 或 Google Cloud Functions 部署 Python 函数。
