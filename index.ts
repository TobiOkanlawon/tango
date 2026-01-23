import { Database, Statement } from 'bun:sqlite';

// setup

const db = new Database("./todo.db", { create: true });

db.run(`CREATE TABLE IF NOT EXISTS todos (
 id INTEGER UNIQUE PRIMARY KEY ASC AUTOINCREMENT NOT NULL,
 name TEXT NOT NULL,
 date TEXT NOT NULL DEFAULT current_timestamp
)
`)

const Controller = (conn: Database) => {
  return {
    addTodo: (todo: string) => {
      // adds a new todo to the database

      // TODO: figure out an appropriate error response or something idk
      if(todo == "") return;

      const sql = 'INSERT INTO todos (name) VALUES ($name)'
      
      const result = conn.query(sql)

      console.log("todo created: ", result.get(todo));
    },
    listTodo: () => {
      const sql = 'SELECT * FROM todos'
      const result = conn.query(sql);

      console.log("all todos", result.all())
    },
    
    deleteTodo: (id: string) => {
      const sql = 'DELETE FROM todos WHERE id = $id'
      const result = conn.query(sql);

      console.log("todo deleted: ", result.get(id))
    },
  }
}

const c = Controller(db)
// c.addTodo("some todo")
// c.listTodo()
// c.deleteTodo(4)
