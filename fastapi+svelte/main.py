import csv
import io
import sqlite3

from logger import get_logger

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()
logger = get_logger("fastapi+svelte", "INFO")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your Svelte app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "database.sqlite"


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        content = await file.read()
        csv_reader = csv.reader(io.StringIO(content.decode("utf-8")))
        headers = next(csv_reader)

        logger.info(f"Received CSV with headers: {headers}")

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        # Drop existing table if it exists
        cursor.execute("DROP TABLE IF EXISTS data")
        logger.info("Dropped existing 'data' table")

        # Create table
        cursor.execute(f"CREATE TABLE data ({', '.join(headers)})")
        logger.info(f"Table created with headers: {headers}")

        # Insert data
        for row in csv_reader:
            if len(row) != len(headers):
                logger.warning(f"Skipping row with incorrect number of fields: {row}")
                continue
            cursor.execute(
                f"INSERT INTO data VALUES ({', '.join(['?' for _ in row])})", row
            )

        conn.commit()
        conn.close()

        logger.info("CSV uploaded and database created successfully")
        return {"message": "CSV uploaded and database created successfully"}
    except Exception as e:
        logger.error(f"Error uploading CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading CSV: {str(e)}")


@app.get("/data")
async def get_data():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM data")
        data = cursor.fetchall()

        if not data:
            return {"headers": [], "data": []}

        headers = [description[0] for description in cursor.description]
        conn.close()
        return {"headers": headers, "data": data}
    except sqlite3.OperationalError:
        # Table doesn't exist, return an empty result
        return {"headers": [], "data": []}
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return {"headers": [], "data": [], "error": str(e)}


@app.put("/update/{row_id}")
async def update_row(row_id: int, updated_data: dict):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    set_clause = ", ".join([f"{key} = ?" for key in updated_data.keys()])
    values = list(updated_data.values())
    values.append(row_id)

    cursor.execute(f"UPDATE data SET {set_clause} WHERE rowid = ?", values)
    conn.commit()
    conn.close()

    return {"message": f"Row {row_id} updated successfully"}


@app.delete("/delete/{row_id}")
async def delete_row(row_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM data WHERE rowid = ?", (row_id,))
    conn.commit()
    conn.close()
    return {"message": f"Row {row_id} deleted successfully"}


@app.get("/download")
async def download_csv():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM data")
    data = cursor.fetchall()
    headers = [description[0] for description in cursor.description]
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(data)

    output.seek(0)

    return FileResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        filename="data.csv",
    )
