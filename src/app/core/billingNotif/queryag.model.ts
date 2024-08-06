export class QuerybillingNotifModel {
	// fields
	search: any;
	page: number;
	limit: number;
	noId:string;
	type_notif:string
	sortOrder: string;
	sortField: string;

	// constructor overrides
	constructor(
		search: any,
		sortOrder: string,
		sortField: string,
		page: number = 1,
		limit: number = 10,
		noId:string = undefined,
		type_notif:string = undefined
	) {
		this.search = search;
		this.sortOrder = sortOrder;
		this.sortField = sortField;
		this.page = page;
		this.limit = limit;
		this.noId = noId;
		this.type_notif = type_notif;
	}
}
