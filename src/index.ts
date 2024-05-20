import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { execute } from "./db/tables.js";
import { auth } from "./security/header.js";
import "dotenv/config";

import users from "./endpoints/users.js";
import drinks from "./endpoints/drinks.js";
import places from "./endpoints/places.js";
import categories from "./endpoints/categories.js";

const app = new Hono();

execute();

app.use(cors());
app.use(auth);

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
