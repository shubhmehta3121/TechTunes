from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os
import pathlib
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.utils import get_user_data, save_user_data, initialize_json_files

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/progress/*": {
        "origins": [
            "http://localhost:5173",
            "https://tech-tunes-*.vercel.app"  # Wildcard for all Vercel preview deployments
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 600  # Cache preflight requests for 10 minutes
    }
})

BASE_DIR = pathlib.Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'

# Ensure the data directory exists
if not os.path.exists('data'):
    os.makedirs('data')

@app.route('/api/progress/save-answer', methods=['POST'])
def save_answer():
    try:
        data = request.json
        user_id = data.get('userId')
        
        # Load existing user data
        users_data = get_user_data()
        
        # Initialize user entry if it doesn't exist
        if user_id not in users_data:
            return jsonify({"error": "User not found"}), 404
        
        # Add or initialize answers list
        if 'answers' not in users_data[user_id]:
            users_data[user_id]['answers'] = []
        
        # Add new answer
        users_data[user_id]['answers'].append({
            'questionNumber': data.get('questionNumber'),
            'topicNumber': data.get('topicNumber'),
            'selectedAnswer': data.get('selectedAnswer'),
            'correctAnswer': data.get('correctAnswer'),
            'isCorrect': data.get('isCorrect'),
            'timestamp': data.get('timestamp')
        })
        
        # Save updated data
        save_user_data(users_data)
        
        return jsonify({"message": "Success"}), 200
        
    except Exception as e:
        print("Error in save_answer:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/progress/complete-assessment', methods=['POST'])
def complete_assessment():
    try:
        data = request.json
        user_id = data.get('userId')
        
        # Load existing user data
        users_data = get_user_data()
        
        if user_id not in users_data:
            return jsonify({"error": "User not found"}), 404
        
        # Add assessment results
        if 'assessment_results' not in users_data[user_id]:
            users_data[user_id]['assessment_results'] = []
        
        users_data[user_id]['assessment_results'].append({
            'score': data.get('score'),
            'answers': data.get('answers'),
            'timestamp': data.get('timestamp')
        })
        
        # Save updated data
        save_user_data(users_data)
        
        return jsonify({"message": "Success"}), 200
        
    except Exception as e:
        print("Error in complete_assessment:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/progress/get-latest', methods=['POST'])
def get_latest_assessment():
    try:
        data = request.json
        user_id = data.get('userId')
        
        # Load existing user data
        users_data = get_user_data()
        
        if user_id not in users_data:
            return jsonify({"error": "User not found"}), 404
        
        # Get the latest assessment result
        if 'assessment_results' in users_data[user_id] and users_data[user_id]['assessment_results']:
            latest_assessment = users_data[user_id]['assessment_results'][-1]  # Get the most recent
            return jsonify({
                "message": "Success",
                "assessment": latest_assessment
            }), 200
        else:
            return jsonify({
                "message": "No assessments found",
                "assessment": None
            }), 200
        
    except Exception as e:
        print("Error in get_latest_assessment:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5003, debug=True) 