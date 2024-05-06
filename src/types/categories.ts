interface categoryReqBody {
    name: string;
    parent?: number;
}

interface categoryResBody extends Required<categoryReqBody>{
    id: number;
}