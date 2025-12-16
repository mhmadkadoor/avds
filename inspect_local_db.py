import sqlite3
import os

db_path = 'AVDSBack/db.sqlite3'
if not os.path.exists(db_path):
    print(f"Database file {db_path} not found.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables in db.sqlite3:")
        for table in tables:
            print(table[0])
        
        # Check if 'Makes' table exists and show columns
        if ('Makes',) in tables:
            print("\nColumns in 'Makes' table:")
            cursor.execute("PRAGMA table_info(Makes);")
            columns = cursor.fetchall()
            for col in columns:
                print(col)
        else:
            print("\nTable 'Makes' not found.")
            
        conn.close()
    except Exception as e:
        print(f"Error inspecting database: {e}")
