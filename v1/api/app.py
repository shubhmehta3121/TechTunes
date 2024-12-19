from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os
from questioning import generate_topics, convert_to_json, get_mcqs

app = Flask(__name__)
CORS(app)

# Ensure the data directory exists
if not os.path.exists('data'):
    os.makedirs('data')

# Initialize users.json file with empty object
def initialize_json_files():
    users_file = os.path.join('data', 'users.json')
    if not os.path.exists(users_file):
        with open(users_file, 'w') as f:
            json.dump({}, f)
            print("Created users.json with empty object")

# Initialize JSON files at startup
initialize_json_files()

def get_user_data():
    users_file = 'data/users.json'
    try:
        with open(users_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_user_data(users_data):
    users_file = 'data/users.json'
    with open(users_file, 'w') as f:
        json.dump(users_data, f, indent=2)

@app.route('/api/save-goal', methods=['POST'])
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

@app.route('/api/save-proficiency', methods=['POST'])
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

@app.route('/api/check-user-goals', methods=['POST'])
def check_user_goals():
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
            
        # Load user data
        users_data = get_user_data()
        
        # Check if user has any goals
        has_goals = user_id in users_data and len(users_data[user_id].get('goals', [])) > 0
        
        return jsonify({"hasGoals": has_goals}), 200
        
    except Exception as e:
        print("Error in check_user_goals:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit-questionnaire', methods=['POST'])
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

@app.route('/api/save-learning-path', methods=['POST'])
def save_learning_path():
    try:
        data = request.json
        user_id = data.get('userId')
        print("Received learning path data:", data)
        
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
        
        # Update learning path
        users_data[user_id]['learning_path'] = {
            'path': data.get('learningPath'),
            'questionCount': data.get('questionCount', 5),  # Default to 5 if not specified
            'timestamp': data.get('timestamp')
        }
        
        # Save updated data
        save_user_data(users_data)
        print(f"Saved learning path for user {user_id}")
        
        return jsonify({
            "message": "Success",
            "learning_path": data.get('learningPath')
        }), 200
    
    except Exception as e:
        print("Error in save_learning_path:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-assessment', methods=['POST'])
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

@app.route('/api/save-answer', methods=['POST'])
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

@app.route('/api/complete-assessment', methods=['POST'])
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

@app.route('/api/get-latest-assessment', methods=['POST'])
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
    app.run(port=5000, debug=True) 