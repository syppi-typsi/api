import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

//app.get("/", (c) => c.json("This is /users"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM users", []);
	return c.json(res);
});

//post

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM users WHERE id = $1", [id]);
	return c.json(res);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM users WHERE id = $1", [id]);
	return c.json(res);
});

//patch:id

export default app;
