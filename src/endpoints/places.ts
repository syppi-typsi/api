import { Hono } from "hono";
import { query } from "../db/index.js";

const app = new Hono();

//app.get("/", (c) => c.json("This is /places"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM places", []);
	return c.json(res.rows);
});

//post
app.post("/", async (c) => {
	const params: placeReqBody = await c.req.json();
	const res = await query(
		"INSERT INTO places (name, address) VALUES ($1, $2) RETURNING *",
		[params.name, params.address],
	);
	return c.json(res.rows[0]);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM places WHERE id = $1", [id]);
	return c.json(res.rows[0]);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM places WHERE id = $1 RETURNING *", [id]);
	return c.json(res.rows[0]);
});

//patch:id
app.patch("/:id", async (c) => {
	const params: placeReqBody = await c.req.json();
	const id = c.req.param("id");
	const res = await query(
		"UPDATE places SET name = $2, address = $3 WHERE id = $1 RETURNING *",
		[id, params.name, params.address],
	);
	return c.json(res.rows[0]);
});

export default app;
