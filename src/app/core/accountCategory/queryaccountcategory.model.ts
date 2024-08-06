export class QueryAccountCategoryModel {
	// fields
	search: any;
	page: number;
	limit: number;
	type: string;

	// constructor overrides
	constructor(
		search: any,
		page: number = 1,
		limit: number = 10,
		type: string = "") {
		this.search = search;
		this.page = page;
		this.limit = limit;
		this.type = type
	}
}
