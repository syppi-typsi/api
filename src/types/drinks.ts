export interface drinkReqBody {
	name: string;
	producer: string;
	brand?: string;
	description?: string;
	product_image?: string;
	category: number;
	rating?: number;
	volumes?: Array<number>;
	abv?: number;
	places?: Array<number>;
	nutritional_value?: {
		serving: number;
		energy: {
			kJ: number;
			kcal: number;
		};
		fat: number;
		sat_fat: number;
		carbs: number;
		sugar: number;
		protein: number;
		fiber: number;
		salt: number;
	};
}

export interface drinkResBody extends Required<drinkReqBody> {
	id: number;
	added_on: string;
}

export enum Ordering {
	Alphabetic = 0,
	TopRated = 1,
	RecentlyAdded = 2,
	MostRelevant = 3,
}

export interface drinkSearchReqBody {
	search: string;
	limit: number;
	page: number;
	filters: {
		categories: number[];
	};
	ordering: Ordering;
}
