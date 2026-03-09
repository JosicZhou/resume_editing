from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import io

app = Flask(__name__)
CORS(app)  # 允许 Next.js 跨域请求

@app.route('/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({'status': 'ok'})

@app.route('/extract', methods=['POST'])
def extract_pdf():
    """提取 PDF 文字"""
    try:
        # 检查是否有文件
        if 'file' not in request.files:
            return jsonify({'error': '未提供文件'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400

        # 读取 PDF
        pdf_bytes = file.read()
        pdf_file = io.BytesIO(pdf_bytes)

        # 使用 pdfplumber 提取文字
        text_parts = []
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        full_text = '\n\n'.join(text_parts)

        if not full_text.strip():
            return jsonify({
                'error': 'PDF 中未提取到文字',
                'detail': '可能是扫描版或图片版 PDF'
            }), 400

        return jsonify({
            'text': full_text,
            'pages': len(text_parts),
            'length': len(full_text)
        })

    except Exception as e:
        return jsonify({
            'error': 'PDF 解析失败',
            'detail': str(e)
        }), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    print(f'PDF 提取服务启动在 http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=False)
