from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from jinja2 import Environment, FileSystemLoader
import sys

# Get the directory containing the script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Set up the Jinja2 environment with the correct path
env = Environment(loader=FileSystemLoader(current_dir))

try:
    # Load the templates with proper path handling
    mcqs_prompt = env.get_template('templates/mcqs prompt.txt')
    topics_prompt = env.get_template('templates/topics prompt 5q.txt')
except Exception as e:
    print(f"Error loading templates: {e}")
    print(f"Current directory: {current_dir}")
    print(f"Available templates: {env.list_templates()}")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Initialize the OpenAI client with your API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("Error: OPENAI_API_KEY not found in environment variables")
    sys.exit(1)

client = OpenAI(api_key=api_key)

def generate_topics(instrument, grade, n=5):
    try:
        # Create the messages array for OpenAI
        data = {'instrument': instrument, 'grade': grade, 'n': n}
        prompt_template = topics_prompt.render(data)
        messages = json.loads(prompt_template)
        
        print(f"Generating topics for {instrument} grade {grade} with {n} questions")
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating topics: {str(e)}")
        return None

def convert_to_json(response_string):
    try:
        if not response_string:
            print("Error: Empty response string")
            return None
            
        # Split the response into lines and remove empty lines
        lines = [line.strip() for line in response_string.split('\n') if line.strip()]
        
        # Create a dictionary to store topics
        topics_dict = {}
        
        # Process each line
        for line in lines:
            if line.startswith('Topic'):
                # Split at first colon to separate topic number and content
                topic_num, content = line.split(':', 1)
                topics_dict[topic_num.strip()] = content.strip()
        
        if not topics_dict:
            print("Error: No topics found in response")
            return None
            
        # Create the final JSON structure
        json_response = {
            "Topics": topics_dict
        }
        
        return json_response
    except Exception as e:
        print(f"Error converting to JSON: {str(e)}")
        return None

def get_mcqs(topics_json, instrument, grade):
    """
    Generate MCQs for each topic based on the instrument and grade level.
    Ensures one MCQ per topic.
    """
    try:
        topics = topics_json.get('Topics', {})
        if not topics:
            print("Error: No topics found in topics_json")
            return None
            
        mcqs = {"MCQs": {}}
        failed_topics = []
        
        for topic_num, topic_text in topics.items():
            max_retries = 3  # Try up to 3 times per topic
            success = False
            
            for attempt in range(max_retries):
                try:
                    data = {'instrument': instrument, 'grade': grade, 'topic': topic_text}
                    prompt_template = mcqs_prompt.render(data)
                    messages = json.loads(prompt_template)
                    
                    print(f"Generating MCQ for {topic_num} (Attempt {attempt + 1})")
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=messages
                    )
                    
                    question_json = json.loads(response.choices[0].message.content)
                    mcqs["MCQs"][topic_num] = [question_json]
                    success = True
                    break
                except Exception as e:
                    print(f"Attempt {attempt + 1} failed for {topic_num}: {str(e)}")
                    if attempt == max_retries - 1:
                        failed_topics.append(topic_num)
            
            if not success:
                print(f"Failed to generate MCQ for {topic_num} after {max_retries} attempts")
        
        # If any topics failed, don't return partial results
        if failed_topics:
            print(f"Failed to generate MCQs for topics: {failed_topics}")
            return None
            
        # Verify we have MCQs for all topics
        if len(mcqs["MCQs"]) != len(topics):
            print(f"Mismatch: Generated {len(mcqs['MCQs'])} MCQs for {len(topics)} topics")
            return None
            
        return mcqs
        
    except Exception as e:
        print(f"Error in get_mcqs: {str(e)}")
        return None

# Example usage
if __name__ == "__main__":
    try:
        response = generate_topics("Ukulele", 7, 6)
        if response:
            print("Topics generated:")
            print(response)
            print("-" * 80)
            
            json_response = convert_to_json(response)
            if json_response:
                print("Topics converted to JSON:")
                print(json_response)
                print("-" * 80)
                
                mcq_response = get_mcqs(json_response, "Ukulele", 7)
                if mcq_response:
                    print("MCQs generated:")
                    print(mcq_response)
                else:
                    print("Failed to generate MCQs")
            else:
                print("Failed to convert topics to JSON")
        else:
            print("Failed to generate topics")
    except Exception as e:
        print(f"Error in main: {str(e)}")
