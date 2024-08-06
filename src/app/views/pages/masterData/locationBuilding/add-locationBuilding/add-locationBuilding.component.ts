import {ChangeDetectorRef, Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {LocationBuildingModel} from "../../../../../core/masterData/locationBuilding/locationBuilding.model";
import {
	selectLocationBuildingActionLoading,
	selectLocationBuildingById
} from "../../../../../core/masterData/locationBuilding/locationBuilding.selector";
import {LocationBuildingService} from '../../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryDepartmentModel } from '../../../../../core/masterData/department/querydepartment.model';
import { SelectionModel } from '@angular/cdk/collections';
import { DepartmentService } from '../../../../../core/masterData/department/department.service';
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls, Zoom } from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Geometry } from 'ol/geom';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate';


interface LocationSuggestion {
	display_name: string;
	lat: string;
	lon: string;
  }

@Component({
  selector: 'kt-add-locationBuilding',
  templateUrl: './add-locationBuilding.component.html',
  styleUrls: ['./add-locationBuilding.component.scss']
})
export class AddLocationBuildingComponent implements OnInit, AfterViewInit, OnDestroy {
	datauser = localStorage.getItem("user");
	locationBuilding: LocationBuildingModel;
	LocationBuildingId$: Observable<string>;
	selection = new SelectionModel<LocationBuildingModel>(true, []);
	oldLocationBuilding: LocationBuildingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	locationBuildingForm: FormGroup;
	departmentResult: any[] = [];
	hasFormErrors = false;
	loading : boolean = false;

	@ViewChild('searchInput', { static: false, read: ElementRef }) searchInput: ElementRef<HTMLInputElement>;

	//map layer
	map: Map
	marker: Feature;
	markerSource = new VectorSource();
	markerLayer = new VectorLayer({
		source: this.markerSource
	});

	overlayPopup: Overlay;
  	popupContentElement: HTMLElement;
	popupCloser: HTMLElement;
	popupContainer: HTMLElement;

	currentLong: Number = 106.82692390440403;
	currentLat: Number = -6.175355829857239;

	private loadingData = {
		department: false,
	}

	searchValue: string;
	locationSuggestions: LocationSuggestion[] = [];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private locationBuildingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: LocationBuildingService,
		private departmentService : DepartmentService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectLocationBuildingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectLocationBuildingById(id))).subscribe(res => {
					if (res) {
						this.locationBuilding = res;

						this.oldLocationBuilding = Object.assign({}, this.locationBuilding);
						this.initLocationBuilding();
					}
				});
			} else {
				this.locationBuilding = new LocationBuildingModel();
				this.locationBuilding.clear();
				this.initLocationBuilding();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	ngAfterViewInit() {
		this.initMap()
	}

	getCurrentLocation() {
		//get current location
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(position => {
			  const { latitude, longitude } = position.coords;
			  this.currentLong = longitude
			  this.currentLat = latitude
			//   this.map.getView().setCenter(fromLonLat([longitude, latitude]));
			//   this.map.getView().setZoom(12);
			});
		}
	}

	showToCurrentLocation(){
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(position => {
			  const { latitude, longitude } = position.coords;
			  this.map.getView().setCenter(fromLonLat([longitude, latitude]));
			  this.updateMarker(fromLonLat([longitude, latitude]));
			  this.getDetailLocationOnClick(fromLonLat([longitude, latitude]))
			  this.saveCoordinates(fromLonLat([longitude, latitude]))
			});
		}
	}

	initMap(){

		this.getCurrentLocation()
		

		//set coordinate initial jakarta
		const longCord = this.locationBuildingForm.controls.longitude.value? this.locationBuildingForm.controls.longitude.value : this.currentLong
		const latCord = this.locationBuildingForm.controls.latitude.value? this.locationBuildingForm.controls.latitude.value : this.currentLat


		//init
		this.map = new Map({
			target: 'map',
			controls: defaultControls({
			  attribution: false,
			  zoom: false,
			  rotate: false
			}),
			layers: [
			  new TileLayer({
				source: new OSM()
			  }),
			  new VectorLayer({
				source: new VectorSource()
			  })
			],
			view: new View({
			  center: fromLonLat([longCord, latCord]),
			  zoom: 15
			})
		});

		if(this.locationBuilding._id){
			this.updateMarker(fromLonLat([longCord, latCord]));
			this.getDetailLocationOnClick([this.currentLong, this.currentLat])
			
		}
		if(!this.locationBuilding._id){
			this.showToCurrentLocation()
		}

		//add layer marker
		this.map.addLayer(this.markerLayer);

		// Create the popup content element
		this.popupContentElement = document.getElementById('popup-content');
		this.popupContainer = document.getElementById('popup');

		// Create the overlay popup
		this.overlayPopup = new Overlay({
		  element: this.popupContainer,
		  positioning: 'bottom-center',
		  stopEvent: false,
		  offset: [0, -10],
		});

		 // Add the overlay to the map
		 this.map.addOverlay(this.overlayPopup);

		//on click event
		this.map.on('click', (event) => {

			this.updateMarker(event.coordinate);

			this.getDetailLocationOnClick(event.coordinate)
			this.saveCoordinates(event.coordinate);
		});

		setTimeout(() => {
			const searchInput = this.searchInput.nativeElement;
			fromEvent(searchInput, 'input')
			  .pipe(
				debounceTime(300), // Wait for 300ms of inactivity
				distinctUntilChanged(), // Ignore if the value hasn't changed
				switchMap((event: Event) => {
				  const value = (event.target as HTMLInputElement).value.trim();
				  return this.searchLocation(value);
				})
			  )
			  .subscribe((resp) => {
				this.locationSuggestions = resp.data;

				this.cd.markForCheck()
			  });
		  });
	}

	zoomIn() {
		if (this.map) {
		  const view = this.map.getView();
		  const currentZoom = view.getZoom();
		  view.setZoom(currentZoom + 1);
		}
	  }
	
	  zoomOut() {
		if (this.map) {
		  const view = this.map.getView();
		  const currentZoom = view.getZoom();
		  view.setZoom(currentZoom - 1);
		}
	  }

	showPopupDetailLocation(coordinate, res) {

		
		// Show the popup
		// this.overlayPopup.getElement().style.display = 'block';
		
		const hdms = toStringHDMS(toLonLat(coordinate));
		let addr = res.address
		
		this.popupContentElement.innerHTML = `<p>${addr.village? addr.village: ""}, ${addr.suburb? addr.suburb: ""}, ${addr.city? addr.city: ""}, ${addr.state? addr.state: ""}, ${addr.country? addr.country: ""}, ${addr.postcode? addr.postcode : ""}</p> <p>(${res.lat}, ${res.lon})</p><code>` + hdms +
        '</code>';
		// Set the popup position
		this.overlayPopup.setPosition(coordinate);
	}

	saveCoordinates(coordinate) {
		const [longitude, latitude] = toLonLat(coordinate)
		const controls = this.locationBuildingForm.controls

		controls.longitude.setValue(longitude)
		controls.latitude.setValue(latitude)
	}

	updateMarker(coordinates: number[]) {
		if (this.marker) {
		  // Update existing marker's geometry
		  const markerGeometry = this.marker.getGeometry() as Point;
		  markerGeometry.setCoordinates(coordinates);
		} else {
		  // Create a new marker feature
		  this.marker = new Feature({
			geometry: new Point(coordinates)
		  });
	
		  const markerStyle = new Style({
			image: new Icon({
			  src: '/assets/media/icons/svg/Map/Marker1.svg',
			  scale: 1
			})
		  });
	
		  this.marker.setStyle(markerStyle);
		  this.markerSource.addFeature(this.marker);
		}
	}

	getDetailLocationOnClick(coord) {
		const [longitude, latitude] = toLonLat(coord);

		this.service.getDetailLocationWithOpenStreetMap(longitude, latitude).subscribe(res => {
			this.showPopupDetailLocation(coord, res)

			//set form control
			const controls = this.locationBuildingForm.controls
			const addr = res.address
			controls.location.setValue(`${addr.village? addr.village: ""}, ${addr.suburb? addr.suburb: ""}, ${addr.city? addr.city: ""}, ${addr.state? addr.state: ""}, ${addr.country? addr.country: ""}, ${addr.postcode? addr.postcode : ""} (${res.lat}, ${res.lon})`)
		})
	}

	addMarker(coordinates: number[]) {
		const marker = new Feature({
		  geometry: new Point(coordinates)
		});
	
		const markerStyle = new Style({
		  image: new Icon({
			src: '/assets/media/icons/svg/Map/Marker1.svg',
			scale: 0.5
		  })
		});
	
		marker.setStyle(markerStyle);
		this.markerSource.addFeature(marker);
	}

	onSearchInput(value: string) {
		
		if(value.trim() !== ""){
			this.service.getLocationSuggestionWithOpenStreetMap(value).subscribe(resp => {
				this.locationSuggestions = resp.data

				this.cd.markForCheck()
			})
		}
		else {
			this.locationSuggestions = []
			this.cd.markForCheck()
		}
	}
	
	selectLocation(location: LocationSuggestion) {
		// this.searchInput.nativeElement.value = location.display_name;
		this.locationSuggestions = [];

		const coordinates = [parseFloat(location.lon), parseFloat(location.lat)];
		const marker = new Feature({
			geometry: new Point(fromLonLat(coordinates))
		});
		const searchLayer = this.map.getLayers().getArray().find(layer => layer instanceof VectorLayer);
		if (searchLayer) {
			const searchSource = (searchLayer as VectorLayer<VectorSource<Point>>).getSource();
			searchSource.clear();
			searchSource.addFeature(marker);
			this.map.getView().setCenter(fromLonLat(coordinates));
			this.map.getView().setZoom(15);
		}
	}

	addSearchLayer() {
		const searchSource = new VectorSource();
		const searchLayer = new VectorLayer({
		  source: searchSource
		});
		this.map.addLayer(searchLayer);
	}

	searchLocation(query) {
		if (query !== '') {
			return this.service.getLocationSuggestionWithOpenStreetMap(query);
		  } else {
			return Promise.resolve([]);
		  }
	  }

	initLocationBuilding() {
		this.createForm();
	}

	createForm() {
		if (this.locationBuilding._id){
			console.log(this.locationBuilding, 'location building')
			this.locationBuildingForm = this.locationBuildingFB.group({
				name: [this.locationBuilding.name, Validators.required],
				address: [this.locationBuilding.address, Validators.required],
				radius: [this.locationBuilding.radius, Validators.required],
				created_by: [this.locationBuilding.created_by],
				latitude: [this.locationBuilding.latitude, Validators.required],
				longitude: [this.locationBuilding.longitude, Validators.required],
				location: [{value: this.locationBuilding.location, disabled: true}, Validators.required],
			});
		}else{
			this.locationBuildingForm = this.locationBuildingFB.group({
				name: ["", Validators.required],
				address: ["", Validators.required],
				radius: ["", Validators.required],
				latitude: ["", Validators.required],
				longitude: ["", Validators.required],
				created_by: [{value:this.datauser, disabled:true}],
				location: [{value: this.locationBuilding.longitude, disabled: true}, Validators.required],
			});
		}
		console.log(this.locationBuildingForm, 'form')
	}

	goBackWithId() {
		const url = `/locationBuilding`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshLocationBuilding(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/locationBuilding/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.locationBuildingForm.controls;
		if (this.locationBuildingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedLocationBuilding = this.prepareLocationBuilding();
		console.log(editedLocationBuilding, 'edited')
		if (editedLocationBuilding._id) {
			this.updateLocationBuilding(editedLocationBuilding, withBack);
			return;
		}
		this.addLocationBuilding(editedLocationBuilding, withBack);
	}

	prepareLocationBuilding(): LocationBuildingModel {
		const controls = this.locationBuildingForm.controls;
		const _locationBuilding = new LocationBuildingModel();
		_locationBuilding.clear();
		_locationBuilding._id = this.locationBuilding._id;
		_locationBuilding.name = controls.name.value;
		_locationBuilding.address = controls.address.value;
		_locationBuilding.radius = controls.radius.value;
		_locationBuilding.latitude = controls.latitude.value;
		_locationBuilding.longitude = controls.longitude.value;
		_locationBuilding.status = true;
		_locationBuilding.location = controls.location.value;
		_locationBuilding.created_by = controls.created_by.value;
		return _locationBuilding;
	}

	addLocationBuilding( _locationBuilding: LocationBuildingModel, withBack: boolean = false) {
		const addSubscription = this.service.createLocationBuilding(_locationBuilding).subscribe(
			res => {
				const message = `New locationBuilding successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/locationBuilding`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding locationBuilding | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateLocationBuilding(_locationBuilding: LocationBuildingModel, withBack: boolean = false) {
		const addSubscription = this.service.updateLocationBuilding(_locationBuilding).subscribe(
			res => {
				const message = `LocationBuilding successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/locationBuilding`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding locationBuilding | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Location Building';
		if (!this.locationBuilding || !this.locationBuilding._id) {
			return result;
		}

		result = `Edit Location Building`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		// (e.keyCode >= 48 && e.keyCode <=57) || (e.keyCode >= 96 && e.keyCode <=105))
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key))
	}
}
