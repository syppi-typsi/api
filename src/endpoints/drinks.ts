import { Hono } from "hono";
import { query } from "../db";

const app = new Hono();

//app.get("/", (c) => c.json("This is /drinks"));

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM drink", []);
	const drinkPromises = res.rows.map(async (drink) => {
		// Map each row to a promise
		const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [
			drink.id,
		]);
		const ratings = ratingsRes.rows.map((rating) => rating.rating);
		// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
		const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
		drink.rating = avgRating;
		return drink;
	});
	const drinks = await Promise.all(drinkPromises); // Wait for all promises to resolve
	return c.json(drinks);
});

//post
app.post("/", async (c) => {
	const params: drinkReqBody = await c.req.json();
	const res = await query(
		"INSERT INTO drink (name, producer, brand, description, product_image, category, volumes, abv, places, nutritional_value) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
		[
			params.name,
			params.producer,
			params.brand,
			params.description,
			params.product_image,
			params.category,
			params.volumes,
			params.abv,
			params.places,
			params.nutritional_value,
		],
	);
	const drinkPromises = res.rows.map(async (drink) => {
		// Map each row to a promise
		drink.rating = null;
		return drink;
	});
	const drinks = await Promise.all(drinkPromises); // Wait for all promises to resolve
	return c.json(drinks[0]);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM drink WHERE id = $1", [id]);
	const drinkPromise = res.rows.map(async (drink) => {
		// Map each row to a promise
		const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [
			drink.id,
		]);
		const ratings = ratingsRes.rows.map((rating) => rating.rating);
		// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
		const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
		drink.rating = avgRating;
		return drink;
	});
	const drink = await Promise.all(drinkPromise); // Wait for all promises to resolve
	return c.json(drink[0]);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM drink WHERE id = $1 RETURNING *", [id]);
	const drinkPromise = res.rows.map(async (drink) => {
		// Map each row to a promise
		const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [
			drink.id,
		]);
		const ratings = ratingsRes.rows.map((rating) => rating.rating);
		// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
		const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
		drink.rating = avgRating;
		return drink;
	});
	const drink = await Promise.all(drinkPromise); // Wait for all promises to resolve
	return c.json(drink[0]);
});

//patch:id
app.patch("/:id", async (c) => {
	const params: drinkReqBody = await c.req.json();
	const id = c.req.param("id");
	const res = await query(
		"UPDATE drink SET name = $2, producer = $3, brand = $4, description = $5, product_image = $6, category = $7, volumes = $8, abv = $9, places = $10, nutritional_value = $11 WHERE id = $1 RETURNING *",
		[
			id,
			params.name,
			params.producer,
			params.brand,
			params.description,
			params.product_image,
			params.category,
			params.volumes,
			params.abv,
			params.places,
			params.nutritional_value,
		],
	);
	const drinkPromise = res.rows.map(async (drink) => {
		// Map each row to a promise
		const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [
			drink.id,
		]);
		const ratings = ratingsRes.rows.map((rating) => rating.rating);
		// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
		const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
		drink.rating = avgRating;
		return drink;
	});
	const drink = await Promise.all(drinkPromise); // Wait for all promises to resolve
	return c.json(drink[0]);
});

//put:id/rate

export default app;
