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
        
        self.number = ko.observable();    
        
        self.datetime = ko.observable();
        
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
            //params.selectedPayment([payment.id]);
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
            self.neighbor(null);
            
            var url = "http://192.168.0.5:8080/IncomeService/api/payments/new/" + params.feeModel().id;                                                                         
            
            try {
                var paymentId = params.paymentModel().get('id');    
                url = "http://192.168.0.5:8080/IncomeService/api/payments/" + params.selectedPayment();                                                 
            }                        
            catch(err) {                
                
            }
            
            $.getJSON(url).then(function (payment) {                                       
                //alert(payment.number);
                console.log(JSON.stringify(payment));                                      
                //self.paymentModel(payment);                                  
                self.id(payment.id);                                           
                self.number(payment.number);                
                self.datetime(payment.datetime);  
                
                if(payment.neighbor) {
                    self.neighbor(payment.neighbor.id);                                
                }                                                
                
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
            
            $("#amount").prop( "disabled", false );
            
            neighbor.validate().then((result3) => {   
                
                amount.validate().then((result4) => {                                         
            
                    if(result3 === 'invalid' || result4 === 'invalid') {
                        $("#amount").prop( "disabled", true );
                        return false;
                    }                                        

                    var payment = {};                                

                    payment.id = self.id();
                    payment.neighbor = self.getNeighborById(self.neighbor());
                    payment.amount = self.amount(); 
                    payment.number = self.number();

                    params.feeModel().payments.push(payment);                   

                    $.ajax({                    
                        type: "POST",
                        url: "http://192.168.0.5:8080/IncomeService/api/fees/save",                                        
                        dataType: "json",      
                        data: JSON.stringify(params.feeModel()),			  		 
                        //crossDomain: true,
                        contentType : "application/json",                    
                        success: function(fee) {                                            
                            self.messages([{severity: 'confirmation', summary: 'Succesful Action', detail: "payment saved successfuly", autoTimeout: 5000}]);                                                    
                            //params.paymentList(fee.payments);                            
                            //params.selectedPayment([self.getPaymentByNumber(fee, self.number()).id]); 
                            self.refreshPaymentList(self.getPaymentByNumber(fee, self.number()));
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
        
        self.removePayment = function (event, data) {             
            
            var id = self.id();
            
            self.deletePayment(id);
            
            alert(JSON.stringify(params.feeModel().payments));
                        
            
            $.ajax({                    
                type: "POST",
                url: "http://192.168.0.5:8080/IncomeService/api/fees/save",                                        
                dataType: "json",      
                data: JSON.stringify(params.feeModel()),			  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function(fee) {                                            
                    self.messages([{severity: 'info', summary: 'Succesful Action', detail: "payment removed successfuly", autoTimeout: 5000}]);
                    self.removeFromPaymentList(id);        
                },
                error: function (request, status, error) {
                    //alert(JSON.stringify(request));                          
                    //alert(request.responseText);     
                    self.messages([{severity: 'error', summary: 'Service Error', detail: request.responseText, autoTimeout: 5000}]);
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
        
        self.getPaymentByNumber = (fee, number) => {                      
            
            var toReturn; 
                 
            $(fee.payments).each(function(key,value) {                                 
                
                if(value.number === number) {                    
                    toReturn = value;
                    return false;
                }                
            });                        
            
            return toReturn;                                                                           
        };
        
        self.deletePayment = (key) => {                                       
                 
            var index = 0;
            var found = false;

            $(params.feeModel().payments).each(function(k,value) {                 
                if(value.id === key) {                    
                    found = true;
                    return false;
                }          
                index++;
            }); 
            
            alert(found);
            
            if(found) {
                params.feeModel().payments.splice(index,1);                
            }            
        };

                                            
    }        
       
    return houseContentViewModel;
});
