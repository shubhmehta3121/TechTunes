from app import app
from flask import jsonify

# Add error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found", "status": 404}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "status": 500}), 500

# This is important for Vercel
app = app

if __name__ == "__main__":
    app.run()