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
        "ojs/ojselectsingle", "ojs/ojcheckboxset",
        'ojs/ojconverter-number','ojs/ojchart','ojs/ojformlayout',"ojs/ojinputnumber"], 
    
function (oj, ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, CollectionDataProvider, NumberConverter) {
    /**
     * The view model for the main content view template
     */        
    function houseContentViewModel(params) {
        
        var self = this;                        
        
        /* Variables */
        self.id = ko.observable(null);
        
        self.house = ko.observable();
        
        self.year = ko.observable();        
        
        self.neighbors = ko.observableArray();
        
        self.neighbor = ko.observable();        
        
        self.amount = ko.observable();
        
        self.totalAmount = ko.observableArray(["total"]);
        
        self.disabled = ko.observable(true);
                                                    
        self.feeModel = ko.observable();                            
        
        self.messages = ko.observableArray();
  
        self.messagesDataprovider = new ArrayDataProvider(self.messages);
        
        self.removeMsgs = function (event) {            
            self.messages([]);                        
        }
        
        self.refreshPaymentList = (payment) => {  
            params.paymentList().pop();
            params.paymentList().push(payment);            
            //$(".oj-pagingcontrol-nav-last").trigger("click");
            params.selectedPayment([payment.id]);
        };
        
        self.removeFromPaymentList = (id) => {                         
            params.paymentList().remove(id);
            params.selectedPayhment([]);
            self.sleep(500).then(() => {   
                if(params.paymentList().length == 0) { 
                    $("#newButton").trigger("click");  
                }
            }); 
        };
       
                        
        ko.computed(function () {
            
            if(params.feeModel() === undefined) {                
                return;
            }                        
            
            self.feeModel(params.feeModel());
            
            self.house(params.feeModel().house.number);
            
            self.year(params.feeModel().year.year + " - " + params.feeModel().month.name);
            
            //alert(JSON.stringify(params.feeModel().house.neighbors));                        
            
            self.neighbors(new ArrayDataProvider(
                params.feeModel().house.neighbors,
                {idAttribute: 'id'}));
                
            self.amount(params.feeModel().amount);
            
            //self.month(params.feeModel().month.name);
            
            //alert("self.feeModel().month.name = " + self.feeModel().month.name);
            
            //alert("feeModel = " + JSON.stringify(self.feeModel()));
            
            //self.year = params.feeModel().year.year;
            
            //self.removeMsgs();                                           
            
            var url = "http://192.168.0.9:8080/IncomeService/api/payments/new";                                                 
            
            try {
                var paymentId = params.paymentModel().get('id');    
                url = "http://192.168.0.9:8080/IncomeService/api/payments/" + params.feeModel().id;                                                 
            }                        
            catch(err) {                
                
            }
            
            $.getJSON(url).then(function (payment) {                       
                console.log(JSON.stringify(payment));                
                self.paymentModel(payment);                                       
                self.id(payment.id)                        
                
                alert(JSON.stringify(payment));
                
                if(payment.persisted) {                    
                    $("#deleteButton").show();
                }
                else {
                    $("#deleteButton").hide();
                }                
              
            });
                             
        });   
       
         
        self.submitFee = function (event, data) {
            
            let neighbor = document.getElementById("neighbor");
            
            let amount = document.getElementById("amount");
            
            neighbor.validate().then((result3) => {   
                
                amount.validate().then((result4) => { 
            
                    if(result3 === 'invalid' || result4 === 'invalid') {
                        return false;
                    }

                    var payment = {};                                

                    payment.id = self.id();
                    payment.neighbor = self.getNeighborById(self.neighbor());
                    payment.amount = self.amount(); 

                    params.feeModel().payments.push(payment);

                    alert(JSON.stringify(payment));

                    $.ajax({                    
                        type: "POST",
                        url: "http://192.168.0.9:8080/IncomeService/api/fees/save",                                        
                        dataType: "json",      
                        data: JSON.stringify(params.feeModel()),			  		 
                        //crossDomain: true,
                        contentType : "application/json",                    
                        success: function(newHouse) {                                            
                            self.messages([{severity: 'info', summary: 'Succesful Action', detail: "payment saved successfuly", autoTimeout: 5000}]);
                            self.refreshHouseList(newHouse);                        
                        },
                        error: function (request, status, error) {
                            //alert(JSON.stringify(request));                          
                            //alert(request.responseText);     
                            self.messages([{severity: 'error', summary: 'Service Error', detail: request.responseText, autoTimeout: 5000}]);
                        }                                  
                    });                   
                    
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
        
        self.getItemText = function (itemContext) {
            return itemContext.data.name;
        };

        self.disableControls = ko.computed(() => {
            return self.totalAmount()[0];
        })
        
        self.getNeighborById = (id) => {                      
            
            var toReturn; 
                 
            $(self.feeModel().house.neighbors).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });                        
            
            return toReturn;
                                                                           
        };
                                            
    }        
       
    return houseContentViewModel;
});
