import sqlite3
import bcrypt

DB_NAME = "passwords.db"

def init_db():
    """Initializes the database and creates the necessary tables."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_password(username, plain_password):
    """Hashes the password and saves it to the user's history."""
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO password_history (username, password_hash)
        VALUES (?, ?)
    ''', (username, hashed.decode('utf-8')))
    conn.commit()
    conn.close()

def is_password_used(username, plain_password):
    """Checks if the user has previously used the given password."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT password_hash FROM password_history WHERE username = ?
    ''', (username,))
    history = cursor.fetchall()
    conn.close()

    for row in history:
        stored_hash = row[0]
        if bcrypt.checkpw(plain_password.encode('utf-8'), stored_hash.encode('utf-8')):
            return True
    return False

if __name__ == "__main__":
    init_db()
