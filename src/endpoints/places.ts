import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

//app.get("/", (c) => c.json("This is /places"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM places", []);
	return c.json(res);
});

//post
app.post("/", async (c) => {
	const params: placeReqBody = await c.req.json();
	const res = await query("INSERT INTO places (name, address) VALUES ($1, $2)", [params.name, params.address]);
	return c.json(res);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM places WHERE id = $1", [id]);
	return c.json(res);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM places WHERE id = $1", [id]);
	return c.json(res);
});

//patch:id
app.patch("/:id", async (c) => {
	const params: placeReqBody = await c.req.json();
	const id = c.req.param("id");
	const res = await query("UPDATE places name = $2, address = $3 WHERE id = $1", [id, params.name, params.address]);
	return c.json(res);
});

export default app;
