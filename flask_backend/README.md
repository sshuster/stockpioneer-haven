
# Flask Backend for StockPioneer

This is the Flask backend for the StockPioneer application. It provides the API for the React frontend.

## Requirements

- Python 3.6+
- SQLite3

## Installation

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
- On Windows:
```
venv\Scripts\activate
```
- On macOS/Linux:
```
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

## Running the Server

1. Start the Flask server:
```
python app.py
```

The server will start on http://localhost:5000 by default.

## API Endpoints

- POST /api/auth/login - Login with email and password
- POST /api/auth/register - Register a new user
- GET /api/portfolio/{user_id} - Get a user's portfolio (requires authentication)
- GET /api/market/data - Get market data

## Database

The application uses SQLite for data storage. The database file will be created automatically at first run.
