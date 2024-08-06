import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComUnitInStore, selectComUnitPageLoading, selectComUnitShowInitWaitingMessage } from './comUnit.selector';


export class ComUnitDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComUnitPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComUnitShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComUnitInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
