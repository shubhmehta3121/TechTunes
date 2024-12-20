import json
import os
import pathlib

BASE_DIR = pathlib.Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'

def initialize_json_files():
    DATA_DIR.mkdir(exist_ok=True)
    users_file = DATA_DIR / 'users.json'
    if not users_file.exists() or os.path.getsize(users_file) == 0:
        with open(users_file, 'w') as f:
            json.dump({}, f, indent=2)
            print("Created/initialized users.json with empty object")

def get_user_data():
    users_file = DATA_DIR / 'users.json'
    try:
        with open(users_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_user_data(users_data):
    users_file = DATA_DIR / 'users.json'
    with open(users_file, 'w') as f:
        json.dump(users_data, f, indent=2) 