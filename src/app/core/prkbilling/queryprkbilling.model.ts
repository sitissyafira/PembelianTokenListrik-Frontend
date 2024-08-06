export class QueryPrkbillingModel {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	limit: number;

	// constructor overrides
	constructor(_filter: any,
				_sortOrder: string = 'asc',
				_sortField: string = '',
				_pageNumber: number = 1,
				_limit: number = 10) {
		this.filter = _filter;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
	}
}
