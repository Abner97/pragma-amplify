// api.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export type UserData = {
  data: Schema["User"]["type"];
};

export type TodoWithUserData = Schema["Todo"]["type"] & {
  userData: UserData;
};

async function mapTodoWithUser(todo: Schema["Todo"]["type"]): Promise<TodoWithUserData> {
  const user = await todo.user() as UserData;
  return { ...todo, userData: user };
}

export async function fetchTodos(): Promise<Array<TodoWithUserData>> {
  try {
    const todos = await new Promise<Array<Schema["Todo"]["type"]>>((resolve, reject) => {
      client.models.Todo.observeQuery({
        authMode: 'userPool',
      }).subscribe({
        next: (data) => resolve(data.items),
        error: (err) => reject(err),
      });
    });

    return Promise.all(todos.map(mapTodoWithUser));
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function createTodo(): Promise<void> {
  const content = window.prompt("Todo content");
  if (content) {
    await client.models.Todo.create({ content }, { authMode: 'userPool' });
  }
}
