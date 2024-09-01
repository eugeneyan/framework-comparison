from fasthtml.common import *
from logger import get_logger

# Import logger
logger = get_logger("fastapi", "INFO")

# Set up fastHTML app
css = Style(":root {--pico-font-size:90%,--pico-font-family: Pacifico, cursive;}")
app = FastHTMLWithLiveReload(hdrs=(picolink, css))

messages = ["This is a message, which will get rendered as a paragraph"]


count = 0


@app.get("/")
def home():
    return Title("Count Demo"), Main(
        H1("Count Demo"),
        P(f"Count is set to {count}", id="count"),
        Button(
            "Increment", hx_post="/increment", hx_target="#count", hx_swap="innerHTML"
        ),
    )


@app.post("/increment")
def increment():
    print("incrementing")
    global count
    count += 1
    return f"Count is set to {count}"


serve()
