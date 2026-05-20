import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(dbname='postgres', user='postgres', host='localhost', port='5433', password='1234')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("CREATE DATABASE casefactory;")
    print("Database created successfully")
    cur.close()
    conn.close()
except psycopg2.errors.DuplicateDatabase:
    print("Database already exists")
except Exception as e:
    print(f"Error: {e}")
