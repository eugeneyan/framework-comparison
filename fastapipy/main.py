import csv
import sqlite3

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from logger import get_logger

app = FastAPI()
logger = get_logger("fastapi", "INFO")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Database setup
def init_db():
    conn = sqlite3.connect("database.db")
    conn.close()


init_db()


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    decoded_content = content.decode("utf-8").splitlines()
    csv_reader = csv.DictReader(decoded_content)

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names from the CSV
    columns = csv_reader.fieldnames

    if not columns:
        return {"message": "Error: CSV file is empty or has no headers"}

    # Create table based on CSV columns
    create_table_sql = f"""CREATE TABLE IF NOT EXISTS data (
        {', '.join([f'{col} TEXT' for col in columns])}
    )"""
    cursor.execute(create_table_sql)

    # Insert data
    placeholders = ", ".join(["?" for _ in columns])
    insert_sql = f"INSERT INTO data ({', '.join(columns)}) VALUES ({placeholders})"

    for row in csv_reader:
        cursor.execute(insert_sql, [row[col] for col in columns])

    conn.commit()
    conn.close()

    return {"message": "CSV uploaded and database initialized"}


@app.get("/data")
async def get_data():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]

    # Get data
    cursor.execute("SELECT * FROM data")
    data = cursor.fetchall()

    conn.close()
    logger.info("Columns: %r, Data: %r", columns, data[0])
    return {"columns": columns, "data": data}


@app.post("/update")
async def update_data(
    id: int = Form(...), name: str = Form(...), value: str = Form(...)
):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE data SET name = ?, value = ? WHERE id = ?", (name, value, id)
    )
    conn.commit()
    conn.close()
    return {"message": "Data updated successfully"}
