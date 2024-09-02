"""
uv run uvicorn main:app --reload
"""

import csv
import io
import sqlite3

from logger import get_logger

from fastapi.responses import StreamingResponse
from fasthtml.common import *

app, rt = fast_app()
logger = get_logger("fasthtml", "INFO")


# Database setup
def init_db():
    conn = sqlite3.connect("database.db")
    conn.close()


init_db()


@rt("/")
def index():
    inp = Input(
        type="file",
        name="csv_file",
        accept=".csv",
        multiple=False,
        required=True,
    )
    upload_button = Button("Upload CSV", cls="btn")
    download_button = A("Download CSV", href="/download", cls="btn download-btn")

    add = Form(
        Group(inp, upload_button, download_button),
        hx_post="/upload",
        hx_target="#data-table",
        hx_swap="innerHTML",
        enctype="multipart/form-data",
    )

    # Check if there's data in the database
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='data'")
    table_exists = cursor.fetchone() is not None

    if table_exists:
        cursor.execute("SELECT COUNT(*) FROM data")
        row_count = cursor.fetchone()[0]
        if row_count > 0:
            data_table = get_data()
        else:
            data_table = P("No data available. Please upload a CSV file.")
    else:
        data_table = P("No data available. Please upload a CSV file.")

    conn.close()

    return Title("Look at Your Data"), Main(
        Link(rel="stylesheet", href="/static/style.css"),
        H1("Look at Your Data"),
        add,
        Div(data_table, cls="table-container", style="width: 100%;"),
        cls="container-fluid",
    )


@rt("/upload")
async def upload_csv(csv_file: UploadFile):
    contents = await csv_file.read()
    decoded_content = contents.decode("utf-8").splitlines()
    csv_reader = csv.DictReader(decoded_content)

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names from the CSV
    columns = csv_reader.fieldnames

    if not columns:
        return P("Error: CSV file is empty or has no headers")

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

    return get_data()


def create_table(columns, data):
    table = Table(
        Thead(
            Tr(
                *[Th(col, cls=f"col-{getColumnClass(col)}") for col in columns]
                + [Th("Actions")]
            )
        ),
        Tbody(
            *[
                Tr(
                    *[
                        Td(str(row[i]), cls=f"col-{getColumnClass(str(row[i]))}")
                        if i == 0
                        else Td(
                            Textarea(
                                str(row[i]),
                                name=f"{columns[i]}_{row[0]}",
                                cls=f"textarea-{getColumnClass(str(row[i]))}",
                            ),
                            cls=f"col-{getColumnClass(str(row[i]))}",
                        )
                        for i in range(len(columns))
                    ]
                    + [
                        Td(
                            Button(
                                "Update",
                                hx_post=f"/update/{row[0]}",
                                hx_include="closest tr",
                                hx_target="closest tr",
                                cls="btn",
                            ),
                            Button(
                                "Delete",
                                hx_delete=f"/delete/{row[0]}",
                                hx_target="#data-table",
                                cls="btn",
                            ),
                        )
                    ]
                )
                for row in data
            ]
        ),
        cls="table",
    )
    return Div(table, cls="table-container")


def getColumnClass(value):
    if len(value) <= 5:
        return "narrow"
    elif len(value) <= 200:
        return "medium"
    else:
        return "wide"


@rt("/data")
def get_data():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]
    logger.info(f"Columns: {columns}")

    # Get data
    cursor.execute("SELECT * FROM data")
    data = cursor.fetchall()
    logger.info(f"Data: {data[0]}")
    conn.close()

    table = create_table(columns, data)

    return table


@rt("/update/{id}", methods=["POST"])
def update(id: int, form_data: dict):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]

    # Filter out the 'id' column and prepare the update data
    update_data = {col: form_data.get(f"{col}_{id}") for col in columns if col != "id"}

    # Prepare the SQL update statement
    update_sql = f"UPDATE data SET {', '.join([f'{col}=?' for col in update_data.keys()])} WHERE id=?"

    # Execute the update
    cursor.execute(update_sql, (*update_data.values(), id))
    conn.commit()

    # Fetch the updated row
    cursor.execute("SELECT * FROM data WHERE id=?", (id,))
    updated_row = cursor.fetchone()
    conn.close()

    # Create and return the updated table row contents
    return [
        Td(str(updated_row[i]), cls=f"col-{getColumnClass(str(updated_row[i]))}")
        if i == 0
        else Td(
            Textarea(
                str(updated_row[i]),
                name=f"{columns[i]}_{updated_row[0]}",
                cls=f"textarea-{getColumnClass(str(updated_row[i]))}",
            ),
            cls=f"col-{getColumnClass(str(updated_row[i]))}",
        )
        for i in range(len(columns))
    ] + [
        Td(
            Button(
                "Update",
                hx_post=f"/update/{updated_row[0]}",
                hx_include="closest tr",
                hx_target="closest tr",
                cls="btn",
            ),
            Button(
                "Delete",
                hx_delete=f"/delete/{updated_row[0]}",
                hx_target="#data-table",
                cls="btn",
            ),
        )
    ]


@rt("/delete/{id}", methods=["DELETE"])
def delete(id: int):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM data WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return get_data()


@rt("/download")
def download_csv():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]

    # Fetch all data
    cursor.execute("SELECT * FROM data")
    data = cursor.fetchall()

    conn.close()

    # Create a CSV string
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(columns)

    # Write data
    writer.writerows(data)

    # Create a StreamingResponse
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=data.csv"

    return response


serve()
