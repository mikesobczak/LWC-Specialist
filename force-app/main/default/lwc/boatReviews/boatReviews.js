import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// imports
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api get recordId() {
      return this.boatId;
     }

    set recordId(value) {
      //sets boatId attribute
      this.boatId = value;

      //sets boatId assignment

      //get reviews associated with boatId
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
      if(this.boatReviews !== null) {
        return true;
      }
      return false;
     }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api refresh() {
      this.getReviews();
     }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
      this.isLoading = true;
      getAllReviews({boatId: this.boatId})
            .then(result => {
                this.boatReviews = result;
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.isLoading = false;
            });
     }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
      event.preventDefault();
      event.stopPropagation();
      const recordId = event.target.dataset.id;

      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: recordId,
            objectApiName: 'User',
            actionName: "view"
        },
      });
    }

  }
  