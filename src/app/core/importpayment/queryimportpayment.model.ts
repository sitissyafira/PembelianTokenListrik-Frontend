export class QueryImportpaymentModel {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	limit: number;
	// Date (Start)
	startDate: any
	endDate: any
	// Date (End)

	// constructor overrides
	constructor(
		_filter: any,
		_sortOrder: string = 'asc',
		_sortField: string = 'id',
		// _sortOrder: string = 'asc',
		// _sortField: string = '',
		_pageNumber: number = 1,
		_limit: number = 10,
		_startDate: any = "",
		_endDate: any = "",
	) {
		this.filter = _filter;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
		this.startDate = _startDate;
		this.endDate = _endDate;
	}
}
