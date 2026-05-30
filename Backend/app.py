from flask import Flask, request, jsonify
from flask_cors import CORS
from parse_patient_data import upload_file, extract_patient_data, clean_output, save_output_file
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Get file extension
        file_ext = os.path.splitext(file.filename)[1] or '.pdf'
        
        # Save file temporarily with proper flushing
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        file.save(tmp.name)
        tmp.close()  # Ensure file is fully written
        temp_path = tmp.name
        
        try:
            # Process with OpenAI
            file_id = upload_file(temp_path)
            raw_data = extract_patient_data(file_id)
            cleaned = clean_output(raw_data)
            
            return jsonify(cleaned), 200
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)