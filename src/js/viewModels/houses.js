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
     
    function housesViewModel() {
        
        var self = this;
       
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                
        
        self.isAdmin = ko.observable(rootViewModel.isAdmin());
        
        self.baseUrl = rootViewModel.incomeServiceBaseUrl(); 
        
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
        self.selectedHouse = ko.observable();
        self.selectedHouseModel = ko.observable();
        self.houseList = ko.observable();        
        
        self.selectionRequired = ko.observable(false);
        
        self.pagingLayout = { layout: ['nav'], maxPageLinks: 5 };
        
        /* Tab Component */
        self.tabData = ko.observableArray([]);
        self.tabBarDataSource = new oj.ArrayTableDataSource(self.tabData, { idAttribute: 'id' });
        
        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        /* List selection listener */        
        self.houseListSelectionChanged = function () {                         
                        
            self.selectedHouseModel(self.houseList().get(self.selectedHouse()));                        
                                                              
            // Check if the selected ticket exists within the tab data
            var match = ko.utils.arrayFirst(self.tabData(), function (item) {
              return item.id === self.selectedHouse();
            });
            
            console.log(JSON.stringify(self.houseList()));

            if (!match) { 
                
                while(self.tabData().length > 0) {                    
                    self.tabData.pop();
                }                    

                var name = "New House";
                    
                console.log(self.houseList().get(self.selectedHouse()));
                
                if(self.selectedHouse() && self.selectedHouse() != -1) {                                        
                    name = "House " + self.houseList().get(self.selectedHouse()).get("number");
                }
                
                self.tabData.push({
                  "house": name,
                  "id": self.selectedHouse()
                });
                                
            }
            
            self.selectedTabItem(self.selectedHouse());                        
        }; 
        
        self.houseListDataSource = ko.computed(function () {
           /* List View Collection and Model */
            var houseModelItem = oj.Model.extend({
                idAttribute: 'id'
            });

            var houseListCollection = new oj.Collection(null, {
                url: self.baseUrl + "houses/",
                model: houseModelItem
            });                        

            self.houseList = ko.observable(houseListCollection);  
            
            self.sleep(500).then(() => {
                if(self.houseList().length === 0) {  
                    $("#newButton").trigger("click");
                }
            });            

            //self.backTestListDataSource(new oj.CollectionTableDataSource(self.backTestList()));   
            return new PagingDataProviderView(new CollectionDataProvider(self.houseList()));
            //return new CollectionDataProvider(self.houseList());
        });  
        
        
        /* New house listener */        
        self.newHouse = function () {
            
            self.sleep(500).then(() => {                
                $(".oj-pagingcontrol-nav-last").removeClass("oj-disabled");
                self.sleep(500).then(() => {                    
                    $(".oj-pagingcontrol-nav-last").trigger("click");  
                });                
            });
            
            var house = {};                        
            
            house.id = -1;
            house.number = "New";
            house.debts = [];
            house.neighbors = [];       
            
            self.houseList().push(house)
            
            console.log(self.houseList());                                    
             
            self.selectedHouseModel(house);                        
            
            self.selectedHouse([-1]);                            
                                                                              
        };                         

        self.deleteTab = function (id) {                        
            
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
                  if(id === self.selectedHouse() || self.selectedHouse() !== self.selectedTabItem()){                         
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
            self.selectedHouseModel(self.houseList().get(self.selectedTabItem())); 
            self.tabBarDataSource.reset();
        } 
        

                
    }
        
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return housesViewModel;
        
});
