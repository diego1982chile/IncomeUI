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
        'ojs/ojarraydataprovider','ojs/ojcollectiondataprovider',
        "ojs/ojradioset",
        "ojs/ojswitcher",
        'ojs/ojcollapsible',"ojs/ojdialog",'ojs/ojmessages','ojs/ojpopup',
        'ojs/ojconverter-number','ojs/ojchart','ojs/ojformlayout',"ojs/ojinputnumber"], 
    
function (oj, ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, CollectionDataProvider, NumberConverter) {
    /**
     * The view model for the main content view template
     */        
    function houseContentViewModel(params) {
        
        var self = this;                        
        
        /* Variables */
        self.id = ko.observable(null);
        
        self.number = ko.observable(null);
                                                    
        self.houseModel = ko.observable();
              
        self.dataProvider = ko.observableArray();                
        
        self.tabs = ko.observableArray();        
        
        self.selectedItem = ko.observable("neighbors-tab");                
        
        self.messages = ko.observableArray();
  
        self.messagesDataprovider = new ArrayDataProvider(self.messages);
        
        self.dataProvider = new ArrayDataProvider(self.tabs, { keyAttributes: "id" });
        
        self.removeMsgs = function (event) {            
            self.messages([]);                        
        }
        
        self.refreshHouseList = (house) => {  
            params.houseList().pop();
            params.houseList().push(house);            
            //$(".oj-pagingcontrol-nav-last").trigger("click");
            params.selectedHouse([house.id]);
        };
        
        self.removeFromHouseList = (id) => {                         
            params.houseList().remove(id);
            params.selectedHouse([]);
            self.sleep(500).then(() => {   
                if(params.houseList().length == 0) { 
                    $("#newButton").trigger("click");  
                }
            }); 
        };
       
                        
        ko.computed(function () {
            
            //self.removeMsgs();                   
            
            //alert(JSON.stringify(params.houseModel()));
            
            var url = "http://192.168.0.9:8080/IncomeService/api/houses/new";                                                 
            
            try {
                var houseId = params.houseModel().get('id');    
                url = "http://192.168.0.9:8080/IncomeService/api/houses/" + houseId;                                                 
            }                        
            catch(err) {                
                
            }
            
            $.getJSON(url).then(function (house) {                       
                console.log(JSON.stringify(house));                
                self.houseModel(house);                                       
                self.id(house.id)
                self.number(house.number);         
                
                //alert(JSON.stringify(house));
                
                if(house.persisted) {                    
                    $("#deleteButton").show();
                }
                else {
                    $("#deleteButton").hide();
                }                
              
            });
                 
            self.tabs([{ name: "Neighbors", id: "neighbors-tab" }, { name: "Debts", id: "debts-tab" }]);                        
        });   
       
         
        self.submitHouse = function (event, data) {
            
            let number = document.getElementById("number");
            
            number.validate().then((result3) => { 
                
                if(result3 === 'invalid') {
                    return false;
                }
                
                if(self.houseModel().neighbors.length === 0) {                    
                    self.messages([{severity: 'error', summary: 'Invalid Data', detail: 'Must provide at least one neighbor', autoTimeout: 5000}]);                     
                    return false;
                }
                
                var house = {};                                

                house.id = self.id();
                house.number = self.number();
                house.debts = self.houseModel().debts;
                house.neighbors = self.houseModel().neighbors;   
                
                $.ajax({                    
                    type: "POST",
                    url: "http://192.168.0.9:8080/IncomeService/api/houses/save",                                        
                    dataType: "json",      
                    data: JSON.stringify(house),			  		 
                    //crossDomain: true,
                    contentType : "application/json",                    
                    success: function(newHouse) {                                            
                        self.messages([{severity: 'info', summary: 'Succesful Action', detail: "house saved successfuly", autoTimeout: 5000}]);
                        self.refreshHouseList(newHouse);                        
                    },
                    error: function (request, status, error) {
                        //alert(JSON.stringify(request));                          
                        //alert(request.responseText);     
                        self.messages([{severity: 'error', summary: 'Service Error', detail: request.responseText, autoTimeout: 5000}]);
                    }                                  
                });            
                
            });
                        
        }
        
        self.removeHouse = function (event, data) {             
            
            var id = params.houseModel().get("id");
                
            $.ajax({                    
                type: "DELETE",
                url: "http://192.168.0.9:8080/IncomeService/api/houses/delete/" + id,                                        
                dataType: "json",      		  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function(id) {                                        
                    self.messages([{severity: 'info', summary: 'Succesful Action', detail: "house removed successfuly", autoTimeout: 5000}]);
                    self.removeFromHouseList(id);                        
                },
                error: function (request, status, error) {
                    self.messages([{severity: 'error', summary: 'Service Error', detail: request.responseText, autoTimeout: 5000}]);
                    //alert(request.responseText);                          
                }                                  
            });                     
                        
        }
        
        self.closeDialog = function(event) {
            document.getElementById("dialogMsg").close();
        }
        
        self.openDialog = function(event) {
            document.getElementById("dialogMsg").open();            
        }
       
        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
                                            
    }    
       
    return houseContentViewModel;
});
