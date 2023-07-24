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
               
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                
        
        self.isAdmin = ko.observable(rootViewModel.isAdmin());
        
        self.baseUrl = rootViewModel.incomeServiceBaseUrl(); 
        
        /* Variables */
        self.id = ko.observable(null);
        
        self.house = ko.observable();
        
        self.year = ko.observable();        
        
        self.neighbors = ko.observableArray();
        
        self.number = ko.observable();    
        
        self.datetime = ko.observable();
        
        self.neighbor = ko.observable();        
        
        self.amount = ko.observable();
        
        self.totalAmount = ko.observable();
        
        self.disabled = ko.observable(true);
                                                    
        self.feeModel = ko.observable();  
        
        self.selectedFees = ko.observableArray([]);
        self.selectedFeeModel = ko.observable();
        self.feeList = ko.observable();
        
        self.paymentModel = ko.observable();
        
        self.fees_arr = ko.observableArray([]);
        
        self.messages = ko.observableArray();
  
        self.messagesDataprovider = new ArrayDataProvider(self.messages);                
        
        self.removeMsgs = function (event) {            
            self.messages([]);                        
        }
        
        self.refreshPayments = (payment) => {                                     
            /*
            params.paymentList().pop();                                                   
            params.paymentList().push(payment);                               
            params.selectedPayment([payment.id]);            
            */
            params.refreshPaymentList(params.feeModel().id);
        };
        
        self.removeFromPaymentList = (id) => {                         
            params.paymentList().remove(id);
            params.selectedPayment([]);
            self.sleep(500).then(() => {   
                if(params.paymentList().length === 0) { 
                    $("#newButton").trigger("click");  
                }
            }); 
        };
        
        self.refreshPayment = () => { 
            
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
                
            self.amount(0); 
            self.neighbor(null);
            
            var url = self.baseUrl + "payments/new/" + params.feeModel().id;                             
                            
            if (params.feeModel().payment) {
                url = self.baseUrl + "payments/" + params.feeModel().payment.id;                                                 
            }                                    
                        
            $.getJSON(url).then(function (payment) {                 
                //alert(payment.number);
                console.log(JSON.stringify(payment));                                      
                //self.paymentModel(payment);                                  
                self.id(payment.id);                                           
                self.number(payment.number);                
                self.datetime(payment.datetime); 
                self.amount(payment.amount);
                
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
            
            var url2 = self.baseUrl + "fees/unpaid/" + params.feeModel().id;    
            
            if (params.feeModel().payment) {
                url2 = self.baseUrl + "fees/payment/" + params.feeModel().payment.id;                                                 
            }                        
            
            $.getJSON(url2).then(function (fees) {                 
                //Walert(payment.number);                                                   
                //self.paymentModel(payment);
                var feesIds = [];
                self.fees_arr([]);
                
                fees.forEach((fee) => {                    
                    var fee_obj = {};
                    fee_obj.value = fee.id;
                    fee_obj.label = fee.year.year + "/" + fee.month.name;
                    fee_obj.amount = fee.amount;                    
                    self.fees_arr().push(fee_obj);                    
                    feesIds.push(fee.id);
                });                                                               
                
                if (params.feeModel().payment) {
                    self.selectedFees(feesIds);
                }                
                
                self.feeList(new ArrayDataProvider(self.fees_arr(), { keyAttributes: "value" }));
            });
        };
                        
        ko.computed(function () {                                       
            
            self.refreshPayment();                                                                                                                           
                             
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
                    
                    var payment = self.getPaymentByNumber(params.feeModel(), self.number());
                                     
                    if (!payment) {
                        payment = {};                                          
                        payment.id = self.id();
                        payment.neighbor = self.getNeighborById(self.neighbor());
                        payment.amount = self.totalAmount(); 
                        payment.number = self.number();                        
                    }     
                    else {
                        payment.neighbor = self.getNeighborById(self.neighbor());
                        payment.amount = self.totalAmount(); 
                        payment.id = self.id();
                    }
                    
                    var feesIds = "";
                    
                    $(self.selectedFees()).each(function(key, value) {                                                                          
                        feesIds = feesIds +  "&fees=" + value;
                    });                                          
                    
                    feesIds.replace("&fees=","");                                        
                                                              
                    $.ajax({                    
                        type: "POST",
                        url: self.baseUrl + "payments/save?fees=" + feesIds,                                        
                        dataType: "json",      
                        data: JSON.stringify(payment),			  		 
                        //crossDomain: true,
                        contentType : "application/json",                    
                        success: function(payment) {                                            
                            self.messages([{severity: 'confirmation', summary: 'Succesful Action', detail: "payment saved successfuly", autoTimeout: 5000}]);                                                    
                            //params.paymentList(fee.payments);                            
                            //params.selectedPayment([self.getPaymentByNumber(fee, self.number()).id]); 
                            //self.feeModel(fee);
                            params.feeModel().payment = payment;                            
                            self.refreshPayment();                                                        
                            params.refreshPaymentList(params.feeModel().id);
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
 
            $.ajax({                    
                type: "DELETE",
                url: self.baseUrl + "payments/delete/" + id,                                        
                dataType: "json",      
                //data: JSON.stringify(params.feeModel()),			  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function() {                                            
                    self.messages([{severity: 'info', summary: 'Succesful Action', detail: "payment removed successfuly", autoTimeout: 5000}]);
                    self.removeFromPaymentList(id);  
                    params.feeModel().payment = null;                            
                    self.refreshPayment();                                                        
                    params.refreshPaymentList(params.feeModel().id);
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
                
        self.totalAmount = ko.computed(() => {                                    
            
            var totalAmount = 0;            
                 
            $(self.selectedFees()).each(function(key, value) {                                  
                
                //var payment = self.getPaymentById(value);
         
                totalAmount = totalAmount + self.feeModel().amount;
                
            });                                                
                        
            return totalAmount;                        
        });    
        
        self.getPaymentById = (id) => {
            
            var toReturn; 
                 
            $(self.fees_arr()).each(function(key,value) {   
                
                if(value.value === id) {                    
                    toReturn = value;
                    return false;
                }                
            });                        
            
            return toReturn;
        }
        
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
    
    this.goToFees = (event, data) => {                            
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                                    
        rootViewModel.router.go({path: 'dashboard'});        
    };
       
    return houseContentViewModel;
});
