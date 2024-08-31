import csv
import sqlite3

from fastapi import FastAPI, File, Request, UploadFile
from fastapi.exceptions import HTTPException
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
    logger.debug("Columns: %r, Data: %r", columns, data[0])
    return {"columns": columns, "data": data}


@app.post("/update")
async def update_data(request: Request):
    form_data = await request.form()
    logger.info("Received form data: %r", form_data)

    id = form_data.get("id")
    if not id:
        raise HTTPException(status_code=400, detail="ID is required")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    valid_columns = set(column[1] for column in cursor.fetchall())

    # Prepare the update query
    update_columns = []
    update_values = []
    for key, value in form_data.items():
        if key != "id" and key in valid_columns:
            update_columns.append(f"{key} = ?")
            update_values.append(value)
        elif key != "id":
            logger.warning("Ignoring invalid column: %r", key)

    if not update_columns:
        raise HTTPException(status_code=400, detail="No valid columns to update")

    update_query = f"UPDATE data SET {', '.join(update_columns)} WHERE id = ?"
    update_values.append(id)

    logger.debug("Update query: %r", update_query)
    logger.debug("Update values: %r", update_values)

    try:
        cursor.execute(update_query, update_values)
        conn.commit()
        logger.info("Updated row with id: %r", id)
        return {"message": "Data updated successfully"}
    except sqlite3.Error as e:
        logger.error("Error updating data: %r", e)
        raise HTTPException(status_code=500, detail="Error updating data") from e
    finally:
        conn.close()
