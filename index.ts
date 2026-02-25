import { Database } from "bun:sqlite";
import { Command } from "commander";
import { homedir } from "os";
import { mkdirSync } from "fs";
import { join } from "path";

import * as packageJSON from "./package.json";

// setup

// the database will be stored in a different place
// depending on whether we are in testing or production

const environment = process.env.ENVIRONMENT;

let dbLocation;

const dbName = "todo.db";

switch (environment) {
  case "development":
    dbLocation = `./todo.db`;
    break;

  default:
    // defaults to the production database location
    const homeDirectory = homedir();
    const dir = join(homeDirectory, ".local", "share", "tango");
    mkdirSync(dir, { recursive: true });

    dbLocation = join(dir, dbName);
}

const db = new Database(dbLocation, { create: true });

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
    const formatted = new Date(this.date).toLocaleString();
    return `${this.id} ${formatted} - ${this.name}`;
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

    listTodos: () => {
      const sql = "SELECT * FROM todos";
      const result = conn.query(sql).as(Todo);

      const todos = result.all();

      return todos;
    },

    getTodo: (id: string) => {
      const sql = "SELECT * FROM todos WHERE id = $id";
      const result = conn.query(sql).as(Todo);

      const todo = result.get(id);

      return todo;
    },

    deleteTodo: (id: string) => {
      /* deletes the todo with id and then returns that todo as well */

      const todoSQL = "SELECT * FROM todos WHERE id = $id";
      let query = conn.query(todoSQL).as(Todo);

      query.get(id);

      // TODO: need to test that this is failure-protected or something
      const todo = query.all();

      const sql = "DELETE FROM todos WHERE id = $id";
      query = conn.query(sql);

      query.get(id);
      return todo;
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
  .option("-t --today")
  .description("get the todos in the system")
  .action(() => {
    try {
      console.log(formatTodoArray(c.listTodos()));
      // this is set to the running command, which sucks for typescript, but I guess we'll roll with it

      // if (this.opts().today) {
      // 	console.log("today")
      // }
    } catch (e) {
      console.error("An error occurred while trying to list todos");
    }
  });

program
  .command("delete <id>")
  .description(
    "deletes an todo with the marked ID. Prints it out to the screen before deletion",
  )
  .action((id) => {
    try {
      console.log(formatTodoArray(c.deleteTodo(id)));
    } catch (e) {
      console.error("An error occurred while trying to delete the todo");
    }
  });

program
  .command("merge <ids...>")
  .description("merges different todo lines into a single one with a new ID.")
  .action((ids: string[]) => {
    // ids is a string array of all the ids that are passed in as arguments into merge

    if (ids.length == 0) {
      return;
    }

    let mergedString = "";
    // basically, concatenate with an empty line between each entry. If there is an invalid ID, we skip over it (for now, but there should be an error or something later on)

    for (let id of ids) {
      let todo = c.getTodo(id);
      if (!todo) {
        // if returns null then skip the line
        continue;
      }

      mergedString += todo.name;
      mergedString += "\n";
    }

    for (let id of ids) {
      c.deleteTodo(id);
    }

    c.addTodo(mergedString);

    // TODO: this can be improved by listing out the merged todo as a response to the command
  });

program.parse(process.argv);
