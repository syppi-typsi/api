interface UserReqBody {
	username: string;
	first_name?: string;
	last_name?: string;
	email: string;
}

interface UserResBody extends Required<UserReqBody> {
	id: number;
	registered_on: string;
}
