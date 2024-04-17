import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json("This is /users"));

export default app;
