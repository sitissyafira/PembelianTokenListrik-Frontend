export class QueryAccountHistoryModel {
	// fields
	search: any;
	page: number;
	limit: number;
	fromDate: string;
	toDate: string;
	sortOrder: string; // asc || desc
	sortField: string;


	// constructor overrides
	constructor(
		search: any,
		page: number = 1,
		limit: number = 10,
		fromDate: string = undefined,
		toDate: string = undefined,
		sortOrder: string = 'desc',
		sortField: string = 'id'

	) {
		this.search = search;
		this.page = page;
		this.limit = limit;
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.sortOrder = sortOrder;
		this.sortField = sortField;
	}
}
