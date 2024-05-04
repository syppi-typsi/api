import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

app.get("/", (c) => c.json("This is /places"));
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM places WHERE id = $1", [id]);
	return c.json(res);
});

export default app;
