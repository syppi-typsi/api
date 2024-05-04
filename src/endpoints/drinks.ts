import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();


//app.get("/", (c) => c.json("This is /drinks"));
app.get("/", async (c) => {
	const res = await query("SELECT * FROM drink", []);
	return c.json(res);
});

app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM drink WHERE id = $1", [id]);
	return c.json(res);
});

export default app;
