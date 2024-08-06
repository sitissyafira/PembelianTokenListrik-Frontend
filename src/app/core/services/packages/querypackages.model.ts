export class QueryPackagesModel {
	// fields
	filter: any;
	page: number;
	limit: number;

	// constructor overrides
	constructor(
		filter: any,
		page: number = 1,
		limit: number = 10)
	{
		this.filter = filter;
		this.page = page;
		this.limit = limit;
	}
}
