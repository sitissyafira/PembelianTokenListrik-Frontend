export class QueryLogactionModel {
	// fields
	filter: any;
	fromDate: string;
	toDate: string;
	pageNumber: number;
	limit: number;

	// constructor overrides
	constructor(
		_filter: any,
		_fromDate = undefined,
		_toDate = undefined,
		_pageNumber = 0,
		_limit = 10
	) {
		this.filter = _filter;
		this.fromDate = _fromDate;
		this.toDate = _toDate;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
	}
}
