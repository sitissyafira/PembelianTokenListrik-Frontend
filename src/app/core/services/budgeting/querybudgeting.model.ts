export class QueryBudgetingModel {
	// fields
	search: any;
	pageNumber: number;
	limit: number;

	// constructor overrides
	constructor(
		search: any,
		pageNumber: number = 1,
		limit: number = 10)
	{
		this.search = search;
		this.pageNumber = pageNumber;
		this.limit = limit;
	}
}
