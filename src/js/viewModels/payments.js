/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your customer ViewModel code goes here
 */
define(['knockout',     
        'ojs/ojpagingdataproviderview',
        'ojs/ojcollectiondataprovider',                
        'ojs/ojarraydataprovider',
        'ojs/ojarraytabledatasource',
        'ojs/ojpagingcontrol',        
        'ojs/ojinputtext','ojs/ojlistview',
        'ojs/ojlabel','ojs/ojlabelvalue','ojs/ojbutton','ojs/ojselectcombobox',
        'ojs/ojconveyorbelt'],

 function(ko, PagingDataProviderView, CollectionDataProvider) {
     
    function paymentsViewModel(args) {
        
        var self = this;            
        
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                
        
        self.isAdmin = ko.observable(rootViewModel.isAdmin());
        
        self.baseUrl = rootViewModel.incomeServiceBaseUrl(); 
        
        self.feeModel = ko.observable();
        
        self.selectedTabItem = ko.observable();
        
        self.scrollPos = ko.observable({ y: 0 });
        self.scrollPosDetail = ko.observable();
        
        self.handleScrollPositionChanged = function (event) {
            var value = event.detail.value;
            self.scrollPosDetail('x: ' + Math.round(value.x) + ' y: ' + Math.round(value.y) + ' key: ' + value.key + ' index: ' + value.index + ' offsetX: ' + Math.round(value.offsetX) + ' offsetY: ' + Math.round(value.offsetY));
        }.bind(self);
        
        /* Variables */        
        //self.selectedTabItem = ko.observable("settings");
        //self.backTestListDataSource = ko.observable();
        self.selectedPayment = ko.observable();
        self.selectedPaymentModel = ko.observable();
        self.paymentList = ko.observable();        
        
        self.selectionRequired = ko.observable(false);
        
        self.pagingLayout = { layout: ['nav'], maxPageLinks: 5 };
        
        /* Tab Component */
        self.tabData = ko.observableArray([]);
        self.tabBarDataSource = new oj.ArrayTableDataSource(self.tabData, { idAttribute: 'id' });
        
        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        /* List selection listener */        
        self.paymentListSelectionChanged = function () {
            
            if (self.selectedPayment().length === 0) {
                return;
            }            
            
            console.log("self.selectedPayment() = '" +  JSON.stringify(self.selectedPayment()) + "'");
            
            self.selectedPaymentModel(self.paymentList().get(self.selectedPayment()));                        
                                  
            // Check if the selected ticket exists within the tab data
            var match = ko.utils.arrayFirst(self.tabData(), function (item) {
                return item.id === self.selectedPayment();
            });
            
            console.log(JSON.stringify(self.paymentList()));                        

            if (!match) {                                 
                
                while(self.tabData().length > 0) {                    
                    self.tabData.pop();
                }
                
                var name = "";      
                
                if (self.feeModel() &&  self.feeModel().payment) {
                    name = "Payment " + self.feeModel().payment.number;
                }   
                else {                    
                    name = "New Payment";          
                }
                                
                self.tabData.push({
                  "payment": name,
                  "id": self.selectedPayment()
                });
                                
            }
            
            self.selectedTabItem(self.selectedPayment());                        
        };         
        
        self.paymentListDataSource = ko.computed(function () {              
                                    
            var fee = args.params.fee;
            
            /* List View Collection and Model */
            var paymentModelItem = oj.Model.extend({
                idAttribute: 'id'
            });                        
            
            var url = self.baseUrl + "payments/new/list/" + fee;    
                                                                
            try {         
                var paymentId = self.feeModel().payment.id;  
                url = self.baseUrl + "payments/list/" + paymentId;                                   
            }   
            catch (e) {
                console.log(e);
            }   

            var paymentListCollection = new oj.Collection(null, {
                url: url,
                model: paymentModelItem
            });                        

            self.paymentList = ko.observable(paymentListCollection);             
            
            
            self.sleep(500).then(() => {
                if(self.paymentList().length === 0) {  
                    var payment = {};                                    
                    payment.number = "New";                
                    payment.id = -1;            
                    self.paymentList().push(payment)                                     
                    self.selectedPaymentModel(payment);                                    
                    //self.selectedPayment([-1]);    
                }
            });                 

            //self.backTestListDataSource(new oj.CollectionTableDataSource(self.backTestList()));   
            return new PagingDataProviderView(new CollectionDataProvider(self.paymentList()));
            //return new CollectionDataProvider(self.houseList());
        });  
        
        ko.computed(function () {
            
            var feeId = args.params.fee;             
                        
            $.getJSON(self.baseUrl + "fees/" + feeId).then(function (fee) {
                self.feeModel(fee);                
            });
            
            
        });
        
                
        self.deleteTab = function (id) { 
            
            alert("deleteTab");
            
            // Prevent the first item in the list being removed
            //if(id != self.houseList().at(0).id){          
            if(self.tabData.length > 1) {

              var hnavlist = document.getElementById('ticket-tab-bar'),
                items = self.tabData();
              for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                  self.tabData.splice(i, 1);

                 /* Check if the current selected list item matches the open tab,
                    if so, reset to the first index in the list
                  */
                  if(id === self.selectedPayment() || self.selectedPayment() !== self.selectedTabItem()){                         
                        self.selectedTabItem(self.tabData()[0].id);
                  }

                  oj.Context.getContext(hnavlist)
                    .getBusyContext()
                    .whenReady()
                    .then(function () {
                      hnavlist.focus();
                    });
                  break;
                }
              }
            }
        };

        self.onTabRemove = function (event) {
            self.deleteTab(event.detail.key);
            event.preventDefault();
            event.stopPropagation();
        };

        self.tabSelectionChanged = function () {               
            self.selectedPaymentModel(self.paymentList().get(self.selectedTabItem())); 
            self.tabBarDataSource.reset();
        };
        
        /* New house listener */        
        self.newPayment = function () { 
            
            self.sleep(500).then(() => {                
                $(".oj-pagingcontrol-nav-last").removeClass("oj-disabled");
                self.sleep(500).then(() => {                    
                    $(".oj-pagingcontrol-nav-last").trigger("click");  
                });                
            });
            
            var payment = {};                                    
            payment.number = "New";                
            payment.id = -1;            
            self.paymentList().push(payment)                                     
            self.selectedPaymentModel(payment);                                    
            self.selectedPayment([-1]);                            
                                                                              
        };    
                
    }
        
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return paymentsViewModel;
        
});
