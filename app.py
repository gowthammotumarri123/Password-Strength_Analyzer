from flask import Flask, request, jsonify, render_template
from analyzer import analyze_password
import database

app = Flask(__name__)

# Initialize database
database.init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({
            "score": 0,
            "label": "",
            "feedback": [],
            "suggestions": []
        })
        
    result = analyze_password(password)
    return jsonify(result)

@app.route('/api/save', methods=['POST'])
def save():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400
        
    if database.is_password_used(username, password):
        return jsonify({"success": False, "message": "This password has been previously used. Please choose a new one."}), 400
        
    # Check if the new password is strong enough before saving
    analysis = analyze_password(password)
    if analysis['score'] < 3:
        return jsonify({"success": False, "message": "Password is too weak. Please choose a stronger password."}), 400
        
    database.save_password(username, password)
    return jsonify({"success": True, "message": "Password saved successfully!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
