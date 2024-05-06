import { Hono } from "hono";
import { query } from "../db";
import { error } from "console";

const app = new Hono();

//app.get("/", (c) => c.json("This is /users"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM users");
	return c.json(res);
});

//post
app.post("/", async (c) => {
	const params: UserReqBody = await c.req.json();
	const res = await query("INSERT INTO users (username, first_name, last_name, email) VALUES ($1, $2, $3, $4)", [params.username, params.first_name, params.last_name, params.email]);
	return c.json(res);
});

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
app.patch("/:id", async (c) => {
	const params: UserReqBody = await c.req.json();
	const id = c.req.param("id");
	const res = await query("UPDATE users username = $2, first_name = $3, last_name = $4, email = $5 WHERE id = $1", [id, params.username, params.first_name, params.last_name, params.email]);
	return c.json(res);
});

export default app;
