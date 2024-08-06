export class QueryCashbModel {
	// fields
	acct: any;
	fromDate: string;
	toDate: string;
	pageNumber: number;
	limit: number;

	// constructor overrides
	constructor(
		_acct = undefined,
		_fromDate = undefined,
		_toDate = undefined,
		_pageNumber = 0,
		_limit = 10
	) {
		this.acct = _acct;
		this.fromDate = _fromDate;
		this.toDate = _toDate;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
	}
}
