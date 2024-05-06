import pg from "pg";
const { Pool } = pg;

const pool = new Pool();

export const query = async (
	text: string,
	params?: any[]
) => {
	const res = await pool.query(text, params);
	return res;
};
