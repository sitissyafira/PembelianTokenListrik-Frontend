
export class QueryPublicTicketModel {
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
export class QueryPublicTicketModelUpd {
	// fields
	filter: any;
	sortOrder: string; // asc || desc
	sortField: string;
	pageNumber: number;
	limit: number;
	startDate: String;
	endDate: String;
	isPaid: boolean;
	priority: string;
	status: any;
	handledBy: string;

	// constructor overrides
	constructor(_filter: any,
		_sortOrder: string = 'asc',
		_sortField: string = '',
		_pageNumber: number = 1,
		_limit: number = 10,
		_startDate: string = "",
		_endDate: string = "",
		_isPaid: boolean,
		_status: any,
		_handledBy: string,
		_priority: string = "") {
		this.filter = _filter;
		this.sortOrder = _sortOrder;
		this.sortField = _sortField;
		this.pageNumber = _pageNumber;
		this.limit = _limit;
		this.startDate = _startDate;
		this.endDate = _endDate;
		this.isPaid = _isPaid;
		this.status = _status;
		this.handledBy = _handledBy
		this.priority = _priority;
	}
}
