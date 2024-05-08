interface drinkReqBody {
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
        },
        fat: number;
        sat_fat: number;
        carbs: number;
        sugar: number;
        protein: number;
        fiber: number;
        salt: number;
      };
}

interface drinkResBody extends Required<drinkReqBody>{
  id: number;
  added_on: string;
}
