export class QueryVisitorModel {
	// fields
	filter: any;
	pageNumber: number;
	limit: number;
	fromDate: Date;
	toDate: Date;


	// constructor overrides
	constructor(
		filter?: any,
		// fromDate?: Date,
		// toDate?: Date,
		limit: number = 10,
		pageNumber: number = 1,
	) {
		this.filter = filter;
		// this.fromDate = fromDate;
		// this.toDate = toDate;
		this.limit = limit;
		this.pageNumber = pageNumber;

	}
}
