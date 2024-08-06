export class QueryOpeningBalanceModel {
	// fields
	search: any;
	page: number;
	limit: number;

	// constructor overrides
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
