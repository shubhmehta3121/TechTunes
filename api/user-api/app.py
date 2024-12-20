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
    r"/api/user/*": {
        "origins": [
            "http://localhost:5173",
            "https://techtunes-*.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 600
    }
})

BASE_DIR = pathlib.Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'

# Ensure the data directory exists
if not os.path.exists('data'):
    os.makedirs('data')


@app.route('/api/user/save-goal', methods=['POST'])
def save_goal():
    try:
        data = request.json
        user_id = data.get('userId')
        print("Received goal data:", data)
        
        # Load existing user data
        users_data = get_user_data()
        
        # Initialize user entry if it doesn't exist
        if user_id not in users_data:
            users_data[user_id] = {
                'email': data.get('email'),
                'goals': [],
                'responses': [],
                'proficiency': None,
                'learning_path': None
            }
        
        # Add new goal
        users_data[user_id]['goals'].append({
            'instrument': data.get('goal'),
            'timestamp': data.get('timestamp')
        })
        
        # Save updated data
        save_user_data(users_data)
        print(f"Saved goal for user {user_id}")
        
        return jsonify({"message": "Success"}), 200
    
    except Exception as e:
        print("Error in save_goal:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/save-proficiency', methods=['POST'])
def save_proficiency():
    try:
        data = request.json
        user_id = data.get('userId')
        print("Received proficiency data:", data)
        
        # Load existing user data
        users_data = get_user_data()
        
        # Initialize user entry if it doesn't exist
        if user_id not in users_data:
            users_data[user_id] = {
                'email': data.get('email'),
                'goals': [],
                'responses': [],
                'proficiency': None,
                'learning_path': None
            }
        
        # Update proficiency
        users_data[user_id]['proficiency'] = {
            'level': data.get('proficiencyLevel'),
            'timestamp': data.get('timestamp')
        }
        
        # Save updated data
        save_user_data(users_data)
        print(f"Saved proficiency for user {user_id}")
        
        return jsonify({"message": "Success"}), 200
    
    except Exception as e:
        print("Error in save_proficiency:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/check-user-goals', methods=['POST'])
def check_user_goals():
    try:
        print("Received check-user-goals request")
        data = request.json
        print("Request data:", data)
        
        user_id = data.get('userId')
        if not user_id:
            print("No userId provided")
            return jsonify({"error": "userId is required"}), 400
            
        # Load user data
        users_data = get_user_data()
        print("Loaded users data:", users_data)
        
        # Check if user has any goals
        has_goals = user_id in users_data and len(users_data[user_id].get('goals', [])) > 0
        print(f"User {user_id} has goals: {has_goals}")
        
        return jsonify({"hasGoals": has_goals}), 200
        
    except Exception as e:
        print("Error in check_user_goals:", str(e))
        print("Full error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/submit-questionnaire', methods=['POST'])
def submit_questionnaire():
    try:
        data = request.json
        user_id = data.get('userId')
        print("Received questionnaire data:", data)
        
        # Load existing user data
        users_data = get_user_data()
        
        # Initialize user entry if it doesn't exist
        if user_id not in users_data:
            users_data[user_id] = {
                'email': data.get('email'),
                'goals': [],
                'responses': [],
                'proficiency': None,
                'learning_path': None
            }
        
        # Add new response
        users_data[user_id]['responses'].append({
            'answers': data.get('answers'),
            'timestamp': data.get('timestamp')
        })
        
        # Save updated data
        save_user_data(users_data)
        print(f"Saved questionnaire response for user {user_id}")
        
        return jsonify({"message": "Success"}), 200
    
    except Exception as e:
        print("Error in submit_questionnaire:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True) 