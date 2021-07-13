import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
	boatTypeId;
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
					message: ERROR_VARIANT,
					variant: "error"
				})
			);
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
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;

				// Add Latitude and Longitude to the markers list.
				this.mapMarkers = [{
					location: {
						Latitude: latitude,
						Longitude: longitude
					},
					icon: ICON_STANDARD_USER,
					title: LABEL_YOU_ARE_HERE
				}];
				this.zoomlevel = "4";
			});
		}
	}

	// Creates the map markers
	createMapMarkers(boatData) {
		// const newMarkers = boatData.map(boat => {...});
		// newMarkers.unshift({...});
	}
}
