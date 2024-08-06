// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectVehicleTypeInStore, selectVehicleTypePageLoading, selectVehicleTypeShowInitWaitingMessage } from './vehicletype.selector';


export class VehicleTypeDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectVehicleTypePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVehicleTypeShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVehicleTypeInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
