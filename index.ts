import { Database } from "bun:sqlite";
import { Command } from "commander";

import * as packageJSON from "./package.json";

// setup

const db = new Database("./todo.db", { create: true });

db.run(`CREATE TABLE IF NOT EXISTS todos (
 id INTEGER UNIQUE PRIMARY KEY ASC AUTOINCREMENT NOT NULL,
 name TEXT NOT NULL,
 date TEXT NOT NULL DEFAULT current_timestamp
)
`);

class Todo {
  id: number;
  name: string;
  date: Date;

  constructor(id: number, name: string, date: Date) {
    this.id = id;
    this.name = name;
    this.date = date;
  }

  toString() {
    return `${this.date} ${this.name}`;
  }
}

const Controller = (conn: Database) => {
  return {
    addTodo: (todo: string) => {
      // adds a new todo to the database

      if (todo == "") throw new Error("todo cannot be empty");

      const sql = "INSERT INTO todos (name) VALUES ($name)";

      const result = conn.query(sql).as(Todo);

      const todoResult = result.get(todo);

      return todoResult;
    },

    listTodo: () => {
      const sql = "SELECT * FROM todos";
      const result = conn.query(sql).as(Todo);

      const todos = result.all();

      return todos;
    },

    deleteTodo: (id: number) => {
      const sql = "DELETE FROM todos WHERE id = $id";
      const query = conn.query(sql);

      query.get(id);
      return;
    },
  };
};

const c = Controller(db);

// next is to take the commands from the command line and link them to the controller methods

const formatTodoArray = (arrOfTodos: Todo[]) => {
  let returnString = "";
  for (let todo of arrOfTodos) {
    returnString += todo.toString();
    returnString += "\n";
  }

  return returnString;
};

const program = new Command();

program
  .name("tango")
  .description(
    "tango is a todo list application written to join with a larger host of personalized self-organization software",
  )
  .version(packageJSON.version);

program
  .command("add <todo>")
  .description("add a single todo to the list")
  .action((todo) => {
    try {
      c.addTodo(todo);
    } catch (e) {
      console.error("An error occurred while trying to add todo", e);
    }
  });

program
  .command("list")
  .description("get the todos in the system")
  .action(() => {
    try {
      console.log(formatTodoArray(c.listTodo()));
    } catch (e) {
      console.error("An error occurred while trying to list todos");
    }
  });

program.parse(process.argv);
