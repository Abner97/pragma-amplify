// App.tsx
"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import { fetchTodos, createTodo, TodoWithUserData } from "./api";
import "./../app/app.css";

Amplify.configure(outputs);

function TodoList({ todos }: { todos: Array<TodoWithUserData> }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.content} {todo.userData.data.name}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Array<TodoWithUserData>>([]);

  useEffect(() => {
    const loadTodos = async () => {
      const todos = await fetchTodos();
      setTodos(todos);
    };
    loadTodos();
  }, []);

  const handleCreateTodo = async () => {
    await createTodo();
    const todos = await fetchTodos();
    setTodos(todos);
  };

  return (
    <Authenticator signUpAttributes={['name']}>
      <main>
        <h1>My todos</h1>
        <button onClick={handleCreateTodo}>+ new</button>
        <TodoList todos={todos} />
        <div>
          🥳 App successfully hosted. Try creating a new todo.
          <br />
          <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
            Review next steps of this tutorial.
          </a>
        </div>
      </main>
    </Authenticator>
  );
}
