import sqlite3

def inspect_db():
    conn = sqlite3.connect('VehicleMakesDB.sqlite')
    cursor = conn.cursor()
    
    tables = ['Makes', 'MakeModels', 'VehicleDetails', 'Bodies', 'DriveTypes']
    
    for table in tables:
        print(f"--- {table} ---")
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
        print("\n")
# 
if __name__ == "__main__":
    inspect_db()
