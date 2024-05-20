interface placeReqBody {
	name: string;
	address: string;
}

interface placeResBody extends Required<placeReqBody> {
	id: number;
}
