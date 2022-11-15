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
        
        self.number = ko.observable(null);
                                            
        self.debts = ko.observableArray();
        
        self.houseModel = ko.observable();
              
        self.dataProvider = ko.observableArray();                
        
        self.tabs = ko.observableArray();        
        
        self.selectedItem = ko.observable("neighbors-tab");                  
        
        ko.computed(function () {
            
            console.log(JSON.stringify(params));            
            var url = "http://192.168.0.5:8080/IncomeService/api/houses/new";                                                 
            
            try {
                var houseId = params.houseModel().get('id');    
                url = "http://192.168.0.5:8080/IncomeService/api/houses/" + houseId;                                                 
            }                        
            catch(err) {

            }
            
            $.getJSON(url).then(function (house) {                       
                console.log(JSON.stringify(house));
                self.houseModel(house);                                       
                self.id(house.id)
                self.number(house.number);                
                if(house.debts.length > 0) {                    
                    self.debts(house.debts);                    
                } 
                else {
                    self.debts(ko.observableArray());                    
                }              
            });
                 
            self.tabs([{ name: "Neighbors", id: "neighbors-tab" }, { name: "Debts", id: "debts-tab" }]);  
        });
        
        self.dataProvider = new ArrayDataProvider(self.tabs, { keyAttributes: "id" });
         
        self.submitHouse = function (event, data) {
            
            let number = document.getElementById("number");
            
            number.validate().then((result3) => { 
                
                if(result3 === 'invalid') {
                    return false;
                }
                
                if(self.houseModel().neighbors.length === 0) {
                    self.openDialog();
                    return false;
                }
                
                var house = {};                                

                house.id = self.id();
                house.number = self.number();
                house.debts = self.debts();
                house.neighbors = self.houseModel().neighbors;   
                

                let name = document.getElementById("name");
                let lastname = document.getElementById("lastname");                                  
                let email = document.getElementById("email");
                let phone = document.getElementById("phone");            

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
                
            });
                        
        }
        
        self.closeDialog = function(event) {
            document.getElementById("dialogMsg").close();
        }
        
        self.openDialog = function(event) {
            document.getElementById("dialogMsg").open();            
        }
                                            
    }    
       
    return houseContentViewModel;
});
