export class QueryBillComModel {
	search: any;
	pageNumber: number;
	limit: number;

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
