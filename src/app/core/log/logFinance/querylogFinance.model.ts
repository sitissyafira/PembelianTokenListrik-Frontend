export class QueryLogFinanceModel {
	search: any;
	page: number;
	limit: number;

	constructor(
		search: any,
		page: number = 1,
		limit: number = 10)
	{
		this.search = search;
		this.page = page;
		this.limit = limit;
	}
}
