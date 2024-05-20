import { Hono } from "hono";
import { query } from "../db/index.js";

const app = new Hono();

//app.get("/", (c) => c.json("This is /users"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM users");
	return c.json(res.rows);
});

//post
app.post("/", async (c) => {
	const params: UserReqBody = await c.req.json();
	const res = await query(
		"INSERT INTO users (username, first_name, last_name, email) VALUES ($1, $2, $3, $4) RETURNING *",
		[params.username, params.first_name, params.last_name, params.email],
	);
	return c.json(res.rows[0]);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM users WHERE id = $1", [id]);
	return c.json(res.rows[0]);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
	return c.json(res.rows[0]);
});

//patch:id
app.patch("/:id", async (c) => {
	const params: UserReqBody = await c.req.json();
	const id = c.req.param("id");
	const res = await query(
		"UPDATE users SET username = $2, first_name = $3, last_name = $4, email = $5 WHERE id = $1 RETURNING *",
		[id, params.username, params.first_name, params.last_name, params.email],
	);
	return c.json(res.rows[0]);
});

export default app;
