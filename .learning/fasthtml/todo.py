from fasthtml.common import *


def render_todo(todo):
    tid = f"todo-{todo.id}"
    toggle = A("Toggle", hx_get=f"/toggle/{todo.id}", target_id=tid)
    delete = A("Delete", hx_delete=f"/{todo.id}", hx_swap="outerHTML", target_id=tid)
    return Li(toggle, delete, todo.title + (" ✅" if todo.done else ""), id=tid)


app, rt, todos, Todo = fast_app(
    "todos.db", live=True, render=render_todo, id=int, pk="id", title=str, done=bool
)  # Returns a FastHTML app, a router, a todos table, and a Todos class


def make_input():
    return Input(placeholder="Add a todo", id="title", hx_swap_oob="true")


@rt("/")
def get():
    frm = Form(
        Group(make_input(), Button("Add")),
        hx_post="/",
        target_id="todo-list",
        hx_swap="beforeend",
    )
    return Titled("Todos", Card(Ul(*todos(), id="todo-list"), header=frm))


@rt("/{tid}")
def delete(tid: int):
    todos.delete(tid)


@rt("/")
def post(todo: Todo):
    return todos.insert(todo), make_input()


@rt("/toggle/{tid}")
def get(tid: int):
    todo = todos.get(tid)
    todo.done = not todo.done
    return todos.update(todo)


serve()
