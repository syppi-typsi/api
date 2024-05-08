import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();


//app.get("/", (c) => c.json("This is /drinks"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM drink", []);
	var drinkPromises = res.rows.map(async (drink) => { // Map each row to a promise
		const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [drink.id]);
		const ratings = ratingsRes.rows.map((rating) => rating.rating);
		// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
		const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
		return {
			added_on: drink.added_on,
			name: drink.name,
			producer: drink.producer,
			brand: drink.brand,
			description: drink.description,
			product_image: drink.product_image,
			category: drink.category,
			rating: avgRating,
			volumes: drink.volumes,
			abv: drink.abv,
			places: drink.places,
			nutritional_value: drink.nutritional_value
		};
	});
	const drinks = await Promise.all(drinkPromises); // Wait for all promises to resolve
	return c.json(drinks);
});

//post
app.post("/", async (c) => {
	const params: drinkReqBody  = await c.req.json();
	const res = await query("INSERT INTO drink (name, producer, brand, description, product_image, category, rating, volumes, abv, places, nutritional_value) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", 
	[params.name, params.producer, params.brand, params.description, params.product_image, params.category, params.rating, 
		params.volumes, params.abv, params.places, params.nutritional_value]);
	return c.json(res);
});



//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM drink WHERE id = $1", [id]);
	return c.json(res);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM drink WHERE id = $1", [id]);
	return c.json(res);
});

//patch:id
app.patch("/:id", async (c) => {
	const params: drinkReqBody  = await c.req.json();
	const id = c.req.param("id");
	const res = await query("UPDATE drink name = $2, producer = $3, brand = $4, description = $5, product_image = $6, category = $7, rating = $8, volumes = $9, abv = $10, places = $11, nutritional_value = $12 WHERE id = $1)", 
	[id, params.name, params.producer, params.brand, params.description, params.product_image, params.category, params.rating, 
		params.volumes, params.abv, params.places, params.nutritional_value]);
	return c.json(res);
});

//put:id/rate

export default app;

