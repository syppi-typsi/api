import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { execute } from "./db/tables";
import "dotenv/config";

import users from "./endpoints/users";
import drinks from "./endpoints/drinks";
import places from "./endpoints/places";
import categories from "./endpoints/categories";

const app = new Hono();

execute();

app.use(cors());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.route("/users", users);
app.route("/drinks", drinks);
app.route("/places", places);
app.route("/categories", categories);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
