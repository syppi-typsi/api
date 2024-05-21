import { Hono } from "hono";
import { query } from "../db/index.js";
import {
	Ordering,
	type drinkReqBody,
	type drinkSearchReqBody,
} from "../types/drinks.js";

const app = new Hono();

// async function ratingPromise(drink) {
// 	// get the average of the drink
// 	const ratingsRes = await query(
// 		"SELECT ROUND(AVG(rating)) AS average FROM ratings WHERE drink = $1",
// 		[drink.id],
// 	);

// 	drink.rating = ratingsRes.rows[0].average;
// 	return drink;
// }

function orderDrinks(ordering: Ordering) {
	// choosing correct ordering
	switch (ordering) {
		case Ordering.Alphabetic:
			return "name ASC";
		case Ordering.RecentlyAdded:
			return "added_on DESC";
		case Ordering.TopRated:
			return "rating DESC";
		case Ordering.MostRelevant:
			return "rank DESC";
	}
}

function customSearch(searchInput: string) {
	let out = searchInput.trim().split(/\s+/);
	while (out[0] === "or" || out[0] === "-") {
		out.shift();
	}
	while (out[out.length - 1] === "or" || out[out.length - 1] === "-") {
		out.pop();
	}
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
	const res = await query(
		"SELECT *, (SELECT ROUND(AVG(rating)) FROM ratings WHERE drink = d.id) AS rating FROM drink as d",
	);
	return c.json(res.rows);
});

//post/search
app.post("/search", async (c) => {
	const params: drinkSearchReqBody = await c.req.json();
	const offset = (params.page - 1) * params.limit;

	if (params.search === undefined) params.search = "";

	const searchFormatted = customSearch(params.search);

	const countData = await query(
		"SELECT count(*)::int AS count FROM drink WHERE ($1 = '' OR search @@ to_tsquery('simple',$1)) AND category = ANY($2) AND ((abv = 0 OR abv IS NULL) OR $3::boolean)",
		[searchFormatted, params.filters.categories, params.filters.alcohol],
	);

	let drinks;

	if (countData.rows[0].count > offset) {
		const res = await query(
			`SELECT *, ts_rank(search, to_tsquery('simple',$1)) AS rank, (SELECT ROUND(AVG(rating)) FROM ratings WHERE drink = d.id) AS rating FROM drink as d WHERE ($1 = '' OR search @@ to_tsquery('simple',$1)) AND category = ANY($4) AND ((abv = 0 OR abv IS NULL) OR $5::boolean) ORDER BY ${orderDrinks(
				params.ordering,
			)} LIMIT $2 OFFSET $3`,
			[
				searchFormatted,
				params.limit,
				offset,
				params.filters.categories,
				params.filters.alcohol,
			],
		);
		drinks = res.rows;
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
	const res = await query(
		"SELECT *, (SELECT ROUND(AVG(rating)) FROM ratings WHERE drink = $1) AS rating FROM drink WHERE id = $1",
		[id],
	);
	return c.json(res.rows[0]);
});

//delete:id
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const res = await query(
		"DELETE FROM drink WHERE id = $1 RETURNING *, (SELECT ROUND(AVG(rating)) FROM ratings WHERE drink = $1) AS rating",
		[id],
	);
	return c.json(res.rows[0]);
});

//patch:id

// !!!!!!!
// needs to be rewritten, doesn't conform to API spec
// !!!!!!!

// app.patch("/:id", async (c) => {
// 	const params: drinkReqBody = await c.req.json();
// 	const id = c.req.param("id");
// 	const res = await query(
// 		"UPDATE drink SET name = $2, producer = $3, brand = $4, description = $5, product_image = $6, category = $7, volumes = $8, abv = $9, places = $10, nutritional_value = $11 WHERE id = $1 RETURNING *, (SELECT ROUND(AVG(rating)) FROM ratings WHERE drink = $1) AS rating",
// 		[
// 			id,
// 			params.name,
// 			params.producer,
// 			params.brand,
// 			params.description,
// 			params.product_image,
// 			params.category,
// 			params.volumes,
// 			params.abv,
// 			params.places,
// 			params.nutritional_value,
// 		],
// 	);
// 	return c.json(res.rows[0]);
// });

//**********************************************//
//																							//
//				HARDCODED DEMOUSER										//
//			THIS IS A TEMPORARY SOLUTION						//
//																							//
//**********************************************//

//get:id/rate
app.get("/:id/rate", async (c) => {
	const id = c.req.param("id");
	const res = await query(
		'SELECT * FROM ratings WHERE "user" = 1 AND "drink" = $1',
		[id],
	);
	return c.json(res.rows[0]);
});

//put:id/rate
app.put("/:id/rate", async (c) => {
	const id = c.req.param("id");
	const params: RateReqBody = await c.req.json();

	const res_info = await query(
		'SELECT id FROM ratings WHERE "user" = 1 AND drink = $1',
		[id],
	);

	if (res_info.rows[0] === undefined) {
		// if user doesn't have a rating for the drink
		const res = await query(
			'INSERT INTO ratings ("user", drink, rating) VALUES (1, $1, $2) RETURNING *',
			[id, params.rating],
		);
		return c.json(res.rows[0]);
	} else {
		const res = await query(
			"UPDATE ratings SET rating = $2 WHERE id = $1 RETURNING *",
			[res_info.rows[0].id, params.rating],
		);
		console.log(res);
		return c.json(res.rows[0]);
	}
});

//delete:id/rate
app.delete("/:id/rate", async (c) => {
	const id = c.req.param("id");
	const res_info = await query(
		'SELECT id FROM ratings WHERE "user" = 1 AND drink = $1',
		[id],
	);

	if (res_info.rows.length === 0) {
		return c.body(null);
	}
	const res = await query("DELETE FROM ratings WHERE id = $1 RETURNING *", [
		res_info.rows[0].id,
	]);
	return c.json(res.rows[0]);
});

export default app;
