import io
import sqlite3

import pandas as pd
from fasthtml.common import *

app, rt = fast_app()

# Initialize SQLite database
conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()


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
    data_table = Div(id="data-table")
    return Title("CSV Upload and Database Viewer"), Main(
        H1("CSV Upload and Database Viewer"), add, data_table, cls="container"
    )


@rt("/upload")
async def upload(csv_file: UploadFile):
    contents = await csv_file.read()
    stream = io.StringIO(contents.decode("UTF8"), newline=None)
    df = pd.read_csv(stream)

    # Create table based on CSV columns
    columns = [f"{col} TEXT" for col in df.columns]
    create_table_sql = f"""CREATE TABLE IF NOT EXISTS data (
        {', '.join([f'{col} TEXT' for col in columns])}
    )"""
    cursor.execute(create_table_sql)

    # Insert data
    placeholders = ", ".join(["?" for _ in df.columns])
    insert_sql = f"INSERT INTO data ({', '.join(df.columns)}) VALUES ({placeholders})"
    cursor.executemany(insert_sql, df.values.tolist())
    conn.commit()

    return get_table()


@rt("/get-table")
def get_table():
    df = pd.read_sql_query("SELECT * FROM data", conn)
    return Table(
        Thead(Tr([Th(col) for col in df.columns])),
        Tbody(
            [
                Tr(
                    [
                        Td(row["id"]),
                        *[
                            Td(
                                Input(
                                    value=row[col],
                                    name=f"{col}_{row['id']}",
                                    hx_post=f"/update/{row['id']}",
                                    hx_trigger="change",
                                )
                            )
                            for col in df.columns
                            if col != "id"
                        ],
                        Td(
                            Button(
                                "Delete",
                                hx_delete=f"/delete/{row['id']}",
                                hx_target="#data-table",
                            )
                        ),
                    ]
                )
                for _, row in df.iterrows()
            ]
        ),
    )


@rt("/update/<int:id>", methods=["POST"])
def update(id):
    df = pd.read_sql_query("SELECT * FROM csv_data LIMIT 1", conn)
    columns = [col for col in df.columns if col != "id"]
    values = [request.form[f"{col}_{id}"] for col in columns]
    update_sql = (
        f"UPDATE csv_data SET {', '.join([f'{col}=?' for col in columns])} WHERE id=?"
    )
    cursor.execute(update_sql, (*values, id))
    conn.commit()
    return "Updated"


@rt("/delete/<int:id>", methods=["DELETE"])
def delete(id):
    cursor.execute("DELETE FROM csv_data WHERE id=?", (id,))
    conn.commit()
    return get_table()


serve()
serve()
