import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;

  columns = [
    { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true, typeAttributes: {maximumFractionDigits: 0} },
  { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true, typeAttributes: {maximumFractionDigits: 2} },
  { label: 'Description', fieldName: 'Description__c', type: 'currency', editable: true }
  ];

  boatTypeId = '';
  boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats({ error, data }) { 
    if (data) {
			this.boats = data;
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
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api 
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
   }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api 
  async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
   }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId

    const payload = { boatId: boatId };

    publish(this.messageContext, BOATMC, payload);
    
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {
      this.dispatchEvent(
				new ShowToastEvent({
					title: SUCCESS_TITLE,
					message: MESSAGE_SHIP_IT,
					variant: SUCCESS_VARIANT
				})
			);
      this.refresh();
    })
    .catch(error => {
      this.dispatchEvent(
				new ShowToastEvent({
					title: ERROR_TITLE,
					message: error.body.message,
					variant: ERROR_VARIANT
				})
			);
    })
    .finally(() => {
      this.isLoading = false;
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this.isLoading = isLoading;
    if(isLoading) {
      const evt = new CustomEvent("loading", {
        bubbles: true
      });
      this.dispatchEvent(evt);
    }
    else {
      const evt = new CustomEvent("doneloading", {
        bubbles: true
      });
      this.dispatchEvent(evt);
    }
  }

  hasBoats() {
    if(this.boats) {
      return true;
    }
    return false;
  }

}