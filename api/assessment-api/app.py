from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os
from questioning import generate_topics, convert_to_json, get_mcqs
import pathlib
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.utils import get_user_data, save_user_data, initialize_json_files

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/assessment/*": {
        "origins": [
            "http://localhost:5173",
            "https://techtunes-*.vercel.app"  # Wildcard for all Vercel preview deployments
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

@app.route('/api/assessment/generate', methods=['POST'])
def generate_assessment():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        user_id = data.get('userId')
        instrument = data.get('instrument')
        grade = data.get('grade')
        question_count = data.get('questionCount', 5)  # Default to 5 questions
        
        if not all([user_id, instrument, grade]):
            return jsonify({"error": "Missing required fields"}), 400
        
        print(f"Generating assessment for {instrument} grade {grade} with {question_count} questions")
        
        # Generate topics and MCQs with the specified question count
        try:
            topics_response = generate_topics(instrument, grade, question_count)
            if not topics_response:
                print("Failed to generate topics")
                return jsonify({"error": "Failed to generate topics"}), 500
                
            topics_json = convert_to_json(topics_response)
            if not topics_json:
                print("Failed to convert topics to JSON")
                return jsonify({"error": "Failed to convert topics to JSON"}), 500
                
            mcqs = get_mcqs(topics_json, instrument, grade)
            if not mcqs:
                print("Failed to generate MCQs")
                return jsonify({"error": "Failed to generate MCQs"}), 500
        except Exception as e:
            print(f"Error in assessment generation: {str(e)}")
            return jsonify({"error": f"Assessment generation failed: {str(e)}"}), 500
        
        # Load existing user data
        users_data = get_user_data()
        
        # Initialize user entry if it doesn't exist
        if user_id not in users_data:
            users_data[user_id] = {
                'email': data.get('email'),
                'goals': [],
                'responses': [],
                'proficiency': None,
                'learning_path': None,
                'assessments': []
            }
        
        # Add new assessment
        assessment_data = {
            'instrument': instrument,
            'grade': grade,
            'questionCount': question_count,
            'timestamp': datetime.now().isoformat(),
            'topics': topics_json,
            'mcqs': mcqs
        }
        
        # Add or initialize assessments list
        if 'assessments' not in users_data[user_id]:
            users_data[user_id]['assessments'] = []
        
        users_data[user_id]['assessments'].append(assessment_data)
        save_user_data(users_data)
        
        print("Assessment generated and saved successfully")
        return jsonify({
            "message": "Success",
            "assessment": assessment_data
        }), 200
    except Exception as e:
        print(f"Unexpected error in generate_assessment: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True) 