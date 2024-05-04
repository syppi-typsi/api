import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();


//app.get("/", (c) => c.json("This is /drinks"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM drink", []);
	return c.json(res);
});

//post

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM drink WHERE id = $1", [id]);
	return c.json(res);
});

//delete:id

//patch:id

//put:id/rate

export default app;

