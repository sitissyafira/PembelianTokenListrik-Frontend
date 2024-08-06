export class QueryWaterTransactionModel {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	page: number;
	limit: number;
	fromDate: any;
	toDate: any;
	date: any;


	// constructor overrides
	constructor(_filter: any,
		_fromDate = undefined,
		_toDate = undefined,
		_date = undefined,
		_sortOrder: string = 'desc',
		_sortField: string = '',
		_page: number = 1,
		_limit: number = 10) {
		this.filter = _filter;
		this.fromDate = _fromDate;
		this.toDate = _toDate;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.page = _page;
		this.limit = _limit;
		this.date = _date;

	}
}