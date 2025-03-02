
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import jwt
import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Secret key for JWT
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure key in production

# Database setup
DB_PATH = 'database.db'

def init_db():
    """Initialize the database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create portfolio table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        shares REAL NOT NULL,
        avg_price REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, symbol)
    )
    ''')
    
    conn.commit()
    conn.close()

# Authentication middleware
def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            
            # Get user info from database
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (data['user_id'],))
            current_user = dict(cursor.fetchone())
            conn.close()
            
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated

# API Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get user by email
    cursor.execute("SELECT * FROM users WHERE email = ?", (data.get('email'),))
    user = cursor.fetchone()
    
    conn.close()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    user_dict = dict(user)
    
    # Check password
    if check_password_hash(user_dict['password'], data.get('password')):
        # Generate token
        token = jwt.encode({
            'user_id': user_dict['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_dict['id'],
                'username': user_dict['username'],
                'email': user_dict['email']
            }
        }), 200
    
    return jsonify({'message': 'Invalid password'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Hash password
    hashed_password = generate_password_hash(data.get('password'))
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (data.get('username'), data.get('email'), hashed_password)
        )
        conn.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Username or email already exists'}), 409
    
    finally:
        conn.close()

@app.route('/api/portfolio/<int:user_id>', methods=['GET'])
@token_required
def get_portfolio(current_user, user_id):
    # Check if the current user is requesting their own portfolio
    if current_user['id'] != user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get portfolio items for the user
    cursor.execute("""
        SELECT p.symbol, p.name, p.shares, p.avg_price, m.current_price 
        FROM portfolio p
        JOIN (
            -- This would be a real market data source in production
            VALUES 
                ('AAPL', 182.63),
                ('MSFT', 325.42),
                ('GOOGL', 142.65),
                ('AMZN', 152.33),
                ('TSLA', 174.50)
        ) AS m(symbol, current_price)
        ON p.symbol = m.symbol
        WHERE p.user_id = ?
    """, (user_id,))
    
    portfolio = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(portfolio), 200

@app.route('/api/market/data', methods=['GET'])
def get_market_data():
    # In a real implementation, this would fetch data from a market API
    market_data = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 182.63, "change": 2.4},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 325.42, "change": 1.2},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 142.65, "change": 0.8},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 152.33, "change": -0.5},
        {"symbol": "TSLA", "name": "Tesla Inc.", "price": 174.50, "change": -3.2},
        {"symbol": "META", "name": "Meta Platforms Inc.", "price": 347.22, "change": 1.7},
        {"symbol": "NVDA", "name": "NVIDIA Corp.", "price": 475.38, "change": 5.2},
        {"symbol": "BRK.B", "name": "Berkshire Hathaway Inc.", "price": 408.15, "change": 0.3},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": 183.27, "change": -0.2},
        {"symbol": "V", "name": "Visa Inc.", "price": 235.45, "change": 0.6}
    ]
    
    return jsonify(market_data), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
