export class QueryBillingModel {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	limit: number;

	// constructor overrides
	constructor(_filter: any,
		_sortOrder: string = 'desc',
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
export class QueryBillingModelUpd {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	limit: number;
	payCond: any;
	date: string;
	isPaid:any;
	paymentStatus:any;

	// constructor overrides
	constructor(
		_filter: any,
		_sortOrder: string = 'desc',
		_sortField: string = 'id',
		_pageNumber: number = 1,
		_limit: number = 10,
		_payCond: "",
		_date: any,
		_isPaid:string,
		_paymentSTatus:string

	) {
		this.filter = _filter;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
		this.payCond = _payCond
		this.date = _date;
		this.isPaid = _isPaid;
		this.paymentStatus = _paymentSTatus
	}
}


