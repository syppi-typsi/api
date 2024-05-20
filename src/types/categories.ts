interface categoryReqBody {
	name: string;
	alcoholic: boolean;
	parent?: number;
}

interface categoryResBody extends Required<categoryReqBody> {
	id: number;
}
