from flask import Flask, render_template, redirect, url_for
from flask_clerk import ClerkFlask
import os

app = Flask(__name__)
app.config['CLERK_API_KEY'] = 'your_clerk_api_key'  # Replace with your actual Clerk API key
clerk = ClerkFlask(app)

@app.route('/')
def home():
    return render_template('signin.html')

@app.route('/dashboard')
@clerk.protected
def dashboard():
    user = clerk.current_user()
    return f'Welcome {user.first_name}!'

if __name__ == '__main__':
    app.run(debug=True) 