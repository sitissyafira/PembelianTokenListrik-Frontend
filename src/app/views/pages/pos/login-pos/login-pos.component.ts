import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Animaton Start
// import the required animation functions from the angular animations module
import { trigger, animate, transition, style } from '@angular/animations';

export const fadeInAnimation =
	// trigger name for attaching this animation to an element using the [@triggerName] syntax
	trigger('fadeInAnimation', [

		// route 'enter' transition
		transition(':enter', [

			// css styles at start of transition
			style({ opacity: 0 }),

			// animation and styles at end of transition
			animate('.3s', style({ opacity: 1 }))
		]),
	]);
// Animaton End

@Component({
	selector: 'kt-login-pos',
	templateUrl: './login-pos.component.html',
	styleUrls: ['./login-pos.component.scss'],
	animations: [fadeInAnimation],
	host: { '[@fadeInAnimation]': '' }
})
export class LoginPosComponent implements OnInit {
	posForm: FormGroup;
	nameCashierBMS: string = JSON.parse(localStorage.getItem('currentUser')).first_name

	cekLogin: boolean = true

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private posFB: FormBuilder,

	) { }

	ngOnInit() {
		const checkLoginPOS = localStorage.getItem('loginPOS')
		const checkCashierRecord = localStorage.getItem('isCashierRecord')
		const url = `/pos/cashier`;
		if (checkLoginPOS && checkCashierRecord) return this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		this.createForm()
	}

	createForm() {
		this.posForm = this.posFB.group({
			admName: [{ value: this.nameCashierBMS ? this.nameCashierBMS : "", disabled: false }]
		});
	}

	onSubmit() {
		const controls = this.posForm.controls
		const url = `/pos/openCash`;
		if (controls.admName.value) {
			localStorage.setItem('loginPOS', JSON.stringify(controls.admName.value))
			localStorage.setItem('loginDate', JSON.stringify(Date.now()))
			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			return
		} else {
			this.cekLogin = false
		}
		setTimeout(() => {
			this.cekLogin = true
		}, 1000);
	}
}
