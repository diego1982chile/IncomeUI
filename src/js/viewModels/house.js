/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['ojs/ojcore','knockout',
        'ojs/ojresponsiveutils', 
        'ojs/ojresponsiveknockoututils',
        'ojs/ojarraydataprovider',
        "ojs/ojradioset",
        "ojs/ojswitcher",
        'ojs/ojcollapsible',
        'ojs/ojconverter-number','ojs/ojchart','ojs/ojformlayout',"ojs/ojinputnumber"], 
    
function (oj, ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, NumberConverter) {
    /**
     * The view model for the main content view template
     */        
    function houseContentViewModel(params) {
        
        var self = this;                        
        
        /* Variables */
        self.id = ko.observable(null);
        
        self.number = ko.observable(1);
                                            
        self.debts = ko.observableArray();
        
        self.houseModel = ko.observable();
              
        self.dataProvider = ko.observableArray();                
        
        self.tabs = ko.observableArray();        
        
        self.selectedItem = ko.observable("neighbors-tab");                  
        
        ko.computed(function () {
            
            //console.log(JSON.stringify(params));            
            if (typeof params.houseModel() === 'undefined') {
                return;
            }                                                                                                           
            
            var houseId = params.houseModel().get('id');                           

            $.getJSON("http://192.168.0.5:8080/IncomeService/api/houses/" + houseId).
                then(function (house) {                       
                    //console.log(JSON.stringify(concept.validDescriptionsButFSNandFavorite));
                    self.houseModel(house);                                       
                    self.id(house.id)
                    self.number(house.number);
                    self.debts(house.debts);                       
                });                                   
                 
            self.tabs([{ name: "Neighbors", id: "neighbors-tab" }]);  
        });
        
        self.dataProvider = new ArrayDataProvider(self.tabs, { keyAttributes: "id" });
         
        self.submitHouse = function (event, data) {
            
            var house = {};

            house.id = self.id();
            house.number = self.number();
            house.debts = self.debts();
            house.neighbors = self.houseModel().neighbors;            

            $.ajax({                    
                type: "POST",
                url: "http://192.168.0.5:8080/IncomeService/api/houses/save",                                        
                dataType: "json",      
                data: JSON.stringify(house),			  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function() {                    
                    alert("house saved successfuly");                                                           
                },
                error: function (request, status, error) {
                    alert(request.responseText);                          
                }                                  
            });            
        }                   
                                            
    }    
       
    return houseContentViewModel;
});
