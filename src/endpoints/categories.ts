import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

//app.get("/", (c) => c.json("This is /categories"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM category", []);
	return c.json(res.rows);
});

//post
app.post("/", async (c) => {
	const params: categoryReqBody  = await c.req.json();
	const res = await query("INSERT INTO category (name, alcoholic, parent) VALUES ($1, $2, $3) RETURNING *", [params.name, params.alcoholic, params.parent]);
	return c.json(res.rows[0]);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM category WHERE id = $1", [id]);
	return c.json(res.rows[0]);
});
	
//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM category WHERE id = $1 RETURNING *", [id]);
	return c.json(res.rows[0]);
});

// !!!!!!!
// needs to be rewritten, doesn't conform to API spec
// !!!!!!!

//patch:id
//app.patch("/:id", async (c) => {
//	const params: categoryReqBody  = await c.req.json();
//	const id = c.req.param("id");
//	const res = await query("UPDATE category SET name = $2, alcoholic = $3, parent = $4 WHERE id = $1 RETURNING *", [id, params.name, params.alcoholic, params.parent]);
//	return c.json(res.rows[0]);
//});

export default app;
