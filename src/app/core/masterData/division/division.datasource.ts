import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectDivisionInStore, selectDivisionPageLoading, selectDivisionShowInitWaitingMessage } from './division.selector';


export class DivisionDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDivisionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDivisionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDivisionInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
