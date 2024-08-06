import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectBillComInStore, selectBillComPageLoading, selectBillComShowInitWaitingMessage } from './billCom.selector';


export class BillComDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBillComPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBillComShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBillComInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
