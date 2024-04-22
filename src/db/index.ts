import pg from "pg";
const { Pool } = pg;

const pool = new Pool();

export const query = async (
	text: string | pg.QueryArrayConfig<any>,
	params: string[],
) => {
	const res = await pool.query(text, params);
	return res;
};
