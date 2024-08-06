export class QueryApModel {
	filter: any;
	pageNumber: number;
	limit: number;
	fromDate: any;
	toDate: any;
	sortOrder: string; // asc || desc
	sortField: string;

	constructor(
		_filter: any,
		pageNumber: number = 1,
		limit: number = 10,
		fromDate = undefined,
		toDate = undefined,
		_sortOrder: string = 'asc',
		_sortField: string = '',
		)
	{
		this.filter = _filter;
		this.pageNumber = pageNumber;
		this.limit = limit;
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
	}
}
