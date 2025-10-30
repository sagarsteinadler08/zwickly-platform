#!/usr/bin/env python3
"""
Importer for the exported supabase SQL/JSON files.
Usage:
  python3 scripts/import_supabase.py --dir supabase_export_20251028_150354
"""
import os
import argparse
import psycopg2
import json

def run_sql_file(conn, path):
    with open(path, 'r', encoding='utf-8') as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)
        conn.commit()

def import_json_table(conn, json_path, table_name):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if not data:
        return
    # Insert rows using simple column / value extraction
    with conn.cursor() as cur:
        cols = list(data[0].keys())
        col_sql = ",".join(cols)
        placeholders = ",".join(["%s"] * len(cols))
        insert_sql = f"INSERT INTO {table_name} ({col_sql}) VALUES ({placeholders}) ON CONFLICT DO NOTHING;"
        for row in data:
            values = [row.get(c) for c in cols]
            cur.execute(insert_sql, values)
        conn.commit()

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dir", required=True, help="Directory with exported SQL/JSON files")
    args = p.parse_args()
    d = args.dir

    DATABASE_URL = os.environ.get("DATABASE_URL")
    if not DATABASE_URL:
        # fallback
        DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/app"
    conn = psycopg2.connect(DATABASE_URL)

    # First run any create table SQL files if present (search for "CREATE TABLE")
    files = sorted(os.listdir(d))
    for fname in files:
        if fname.endswith('.sql'):
            path = os.path.join(d, fname)
            with open(path, 'r', encoding='utf-8') as f:
                if "CREATE TABLE" in f.read().upper():
                    print("Applying CREATEs from:", fname)
                    run_sql_file(conn, path)

    # Then run all other SQL files (inserts). Use ON CONFLICT DO NOTHING in importer if duplicates.
    for fname in files:
        if fname.endswith('.sql'):
            path = os.path.join(d, fname)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if "CREATE TABLE" in content.upper():
                continue
            print("Applying other SQL from:", fname)
            try:
                run_sql_file(conn, path)
            except Exception as e:
                print("SQL error (continuing):", e)

    # JSON mapping to tables (if JSON exists)
    mapping = {
        'events.json': 'events',
        'timetable.json': 'timetable',
        'whz_news.json': 'whz_news',
        'mensa_menu.json': 'mensa_menu',
        'exams.json': 'exams',
        'german_culture_interactions.json': 'german_culture_interactions'
    }
    for jf, table in mapping.items():
        path = os.path.join(d, jf)
        if os.path.exists(path):
            print("Importing JSON ->", table)
            try:
                import_json_table(conn, path, table)
            except Exception as e:
                print("JSON import error:", e)
    conn.close()
    print("Import done.")

if __name__ == '__main__':
    main()
