import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

//app.get("/", (c) => c.json("This is /categories"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM category", []);
	return c.json(res);
});

//post

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM category WHERE id = $1", [id]);
	return c.json(res);
});

//delete:id

//patch:id

export default app;
