import sqlite3

def drop_table():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS resume_analyses")
    conn.commit()
    conn.close()
    print("Table dropped successfully")

if __name__ == "__main__":
    drop_table()
