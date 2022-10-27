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
define(["knockout", 'ojs/ojmodel', "ojs/ojarraydataprovider", "ojs/ojtable", 
        "ojs/ojbutton", "ojs/ojformlayout"],

 function(ko, Model, ArrayDataProvider) {
     
    function housesViewModel() {
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information.

        var self = this;        
        
        self.filter = ko.observable("");
        
        self.data = ko.observableArray();
        
        self.dataSource = ko.computed(function () {
            
            $.getJSON("http://192.168.0.6:8080/IncomeService/api/houses").
                then(function (houses) {                                        
                    self.data(houses);                                        
            }); 
            
            var collection = new Model.Collection(null, {
              url: "http://192.168.0.6:8080/IncomeService/api/houses"
            });
            
            return new ArrayDataProvider(self.data, {
                  keyAttributes: "HouseId",
                  implicitSort: [{ attribute: "HouseId", direction: "ascending" }],
              });

        });
                
    }
        
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return housesViewModel;
        
});
