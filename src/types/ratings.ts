interface RateReqBody {
	user: number;
	drink: number;
	rating: number;
}

interface RateResBody extends Required<RateReqBody>{
	id: number;
  }