import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComPowerInStore, selectComPowerPageLoading, selectComPowerShowInitWaitingMessage } from './comPower.selector';


export class ComPowerDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComPowerPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComPowerShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComPowerInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
