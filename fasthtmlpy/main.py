import csv
import sqlite3

from fasthtml.common import *

app, rt = fast_app()


# Database setup
def init_db():
    conn = sqlite3.connect("database.db")
    conn.close()


init_db()


@rt("/")
def index():
    inp = Input(
        type="file", name="csv_file", accept=".csv", multiple=False, required=True
    )
    add = Form(
        Group(inp, Button("Upload")),
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
            initial_table = get_data()
        else:
            initial_table = P("No data available. Please upload a CSV file.")
    else:
        initial_table = P("No data available. Please upload a CSV file.")

    conn.close()

    data_table = Div(initial_table, id="data-table")

    return Title("CSV Upload and Database Viewer"), Main(
        H1("CSV Upload and Database Viewer"), add, data_table, cls="container"
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


@rt("/data")
def get_data():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]

    # Get data
    cursor.execute("SELECT * FROM data")
    data = cursor.fetchall()

    conn.close()

    return Table(
        Thead(Tr([Th(col) for col in columns])),
        Tbody(
            [
                Tr(
                    [
                        Td(row[0]),  # Assuming the first column is the ID
                        *[
                            Td(
                                Input(
                                    value=row[i],
                                    name=f"{columns[i]}_{row[0]}",
                                    hx_post=f"/update/{row[0]}",
                                    hx_trigger="change",
                                )
                            )
                            for i in range(1, len(columns))
                        ],
                        Td(
                            Button(
                                "Delete",
                                hx_delete=f"/delete/{row[0]}",
                                hx_target="#data-table",
                            )
                        ),
                    ]
                )
                for row in data
            ]
        ),
    )


@rt("/update/<int:id>", methods=["POST"])
def update(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Get column names
    cursor.execute("PRAGMA table_info(data)")
    columns = [column[1] for column in cursor.fetchall()]

    values = [request.form[f"{col}_{id}"] for col in columns if col != "id"]
    update_sql = f"UPDATE data SET {', '.join([f'{col}=?' for col in columns if col != 'id'])} WHERE id=?"
    cursor.execute(update_sql, (*values, id))
    conn.commit()
    conn.close()
    return "Updated"


@rt("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM data WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return get_data()


serve()
