# Introduction

Creating a todo application that only allows you to add or remove a todo, and to list all the todos, no edit, no mark as done (remove to mark as done), terminal only because why not.

# How to run

This project uses the just command runner. To run the project in a development environment, run the command `just dev` and to build and update the script system-wide, run the command `just update`.

# TODOs

- [ ] Have tests for each command, with a testing database that is sqlite memory
- [x] Have a command for creating a todo (save the todo in a database)
  - [x] Assign it an ID
- [x] Have a command for listing out all todos
- [x] Have a command to delete todos
- [ ] Have a way to list out todos for only today
- [ ] Have a way to list out todos for a specific day
- [ ] Have a review process for todos (to use it like a GTD inbox)
- [ ] Add a development environment setup command added to the justfile
- [ ] Integrate automerge and use that as the db instead
- [ ] Have this work with tango-web or tango-ios or tango-android and be conflict-free
- [ ] Have the ability to record voice notes
- [ ] Have the ability to ingest inboxes from different sources, for example, while browsing the web.

# Notes

- I added the command to the PATH by creating an executable in bin/ and pointing an alias to it in my .bashrc file. This means that to update the command, we just have to update that executable. This isn't the ideal way, but it's okay for a quick development thing. Once I start to be more robust, I'll need to deliver an executable and have a way to link to it from the proper place that shell scripts should be, or something, I'll figure it out.

- For now, I'll add a small script (update) to build into the bin folder so that the command can be updated after a change.

- To build an executable, I used bun's compile feature with the linux x64 target. Then I linked this to the output dir.

# Usage

Basically, for now, run tango help and you should get some info. When you run the tango list command, the first line is the ID and that's what's used when you want to delete.
