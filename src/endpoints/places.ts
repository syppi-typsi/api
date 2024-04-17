import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json("This is /places"));

export default app;
