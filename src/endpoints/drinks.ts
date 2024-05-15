import { Hono } from "hono";
import { query } from "../db";
import {
	Ordering,
	type drinkReqBody,
	type drinkSearchReqBody,
} from "../types/drinks";

const app = new Hono();

async function ratingPromise(drink) {
	// Map each row to a promise
	const ratingsRes = await query("SELECT * FROM ratings WHERE drink = $1", [
		drink.id,
	]);
	const ratings = ratingsRes.rows.map((rating) => rating.rating);
	// Reduces the array to a sum of all ratings, then divides by the number of ratings to get the average
	const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
	drink.rating = avgRating;
	return drink;
}

function orderDrinks(drinks, ordering: Ordering) {
	// choosing correct ordering
	switch (ordering) {
		case Ordering.Alphabetic:
			drinks.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});
			break;
		case Ordering.RecentlyAdded:
			drinks.sort((a, b) => {
				return new Date(b.added_on) - new Date(a.added_on);
			});
			break;
		case Ordering.TopRated:
			drinks.sort((a, b) => {
				if (Number.isNaN(a.rating)) return 1;
				if (Number.isNaN(b.rating)) return -1;
				return b.rating - a.rating;
			});
			break;
		case Ordering.MostRelevant:
			break;
	}
}

function customSearch(searchInput: string) {
	let out = searchInput.trim().split(/\s+/);
	out = out.map((x) => (x === "or" ? "|" : x));
	out = out.map((x) => (x?.startsWith("-") ? x.replace("-", "!") : x));
	return out
		.join(" ")
		.replaceAll(/(?<!\|)\s(?!\|)/gi, " & ")
		.replaceAll(/\b([^\s]+)/gi, "'$1'")
		.replaceAll(/(?<!\s)'(?=\s|$)/gi, "':*");
}

//get
app.get("/", async (c) => {
	const res = await query("SELECT * FROM drink", []);
	const drinkPromises = res.rows.map(ratingPromise);
	const drinks = await Promise.all(drinkPromises); // Wait for all promises to resolve
	return c.json(drinks);
});

//post/search
app.post("/search", async (c) => {
	const params: drinkSearchReqBody = await c.req.json();
	const offset = (params.page - 1) * params.limit;

	if (params.search === undefined) params.search = "";

	console.log(customSearch(params.search));

	const countData = await query(
		"SELECT count(*)::int AS count FROM drink WHERE ($1 = '' OR search @@ to_tsquery('simple',$1)) AND category = ANY($2)",
		[customSearch(params.search), params.filters.categories],
	);

	let drinks;

	if (countData.rows[0].count > offset) {
		const res = await query(
			"SELECT *, ts_rank(search, websearch_to_tsquery('simple',$1)) as rank FROM drink WHERE ($1 = '' OR search @@ to_tsquery('simple',$1)) AND category = ANY($4) ORDER BY rank DESC LIMIT $2 OFFSET $3",
			[
				customSearch(params.search),
				params.limit,
				offset,
				params.filters.categories,
			],
		);
		const drinkPromises = res.rows.map(ratingPromise);
		drinks = await Promise.all(drinkPromises); // Wait for all promises to resolve
		orderDrinks(drinks, params.ordering);
	} else {
		drinks = [];
	}

	const result = {
		totalPages: Math.ceil(countData.rows[0].count / params.limit),
		totalResults: countData.rows[0].count,
		currentPage: params.page,
		limit: params.limit,
		result: drinks,
	};

	return c.json(result);
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
	const drinks = res.rows.map((drink) => {
		drink.rating = null;
		return drink;
	});
	return c.json(drinks[0]);
});

//get:id
app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("SELECT * FROM drink WHERE id = $1", [id]);
	const drinkPromise = res.rows.map(ratingPromise);
	const drink = await Promise.all(drinkPromise); // Wait for all promises to resolve
	return c.json(drink[0]);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query("DELETE FROM drink WHERE id = $1 RETURNING *", [id]);
	const drinkPromise = res.rows.map(ratingPromise);
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
	const drinkPromise = res.rows.map(ratingPromise);
	const drink = await Promise.all(drinkPromise); // Wait for all promises to resolve
	return c.json(drink[0]);
});

//put:id/rate

export default app;
