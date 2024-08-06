export class QueryVoidBillModel {
	// fields
	filter: any;
	page: number;
	limit: number;
	sortOrder: string; // asc || desc
	sortField: string;

	// constructor overrides
	constructor(
		filter: any,
		page: number = 1,
		limit: number = 10,
		_sortOrder: string = 'desc',
		_sortField: string = ''
	) {
		this.filter = filter;
		this.page = page;
		this.limit = limit;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
	}
}
