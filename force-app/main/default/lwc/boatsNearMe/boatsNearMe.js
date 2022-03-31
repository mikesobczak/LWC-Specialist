import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
	@api boatTypeId;
	mapMarkers = [];
	isLoading = true;
	isRendered;
	latitude;
	longitude;

	// Add the wired method from the Apex Class
	// Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
	// Handle the result and calls createMapMarkers
	@wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
	wiredBoatsJSON({ error, data }) {
		if (data) {
			this.createMapMarkers(data)
		} else if (error) {
			this.dispatchEvent(
				new ShowToastEvent({
					title: ERROR_TITLE,
					message: error.body.message,
					variant: ERROR_VARIANT
				})
			);

			this.isLoading = false;
		}
	}

	// Controls the isRendered property
	// Calls getLocationFromBrowser()
	renderedCallback() {
		if (this.isRendered) {
			return;
		}
		this.isRendered = true;
		this.getLocationFromBrowser();
	}

	// Gets the location from the Browser
	// position => {latitude and longitude}
	getLocationFromBrowser() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(position => {

				// Get the Latitude and Longitude from Geolocation API
				this.latitude = position.coords.latitude;
				this.longitude = position.coords.longitude;

				this.zoomlevel = '4';
			});
		}
	}

	// Creates the map markers
	createMapMarkers(boatData) {

		// const newMarkers = boatData.map(boat => {...});
		let newMarkers = boatData.map(boat => {
			return {
					location: {
						Latitude: boat.Geolocation__Latitude__s,
						Longitude: boat.Geolocation__Longitude__s
					},
					value: boat.Id,
					title: boat.Name
				};
			
		});

		// newMarkers.unshift({...});
		newMarkers.unshift({
			location: {
				Latitude: this.latitude,
				Longitude: this.longitude
			},
			icon: ICON_STANDARD_USER,
			title: LABEL_YOU_ARE_HERE
		});

		this.mapMarkers = newMarkers;

		this.isLoading = false;
		
	}
}
