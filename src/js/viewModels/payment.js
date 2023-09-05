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
        
        self.hasDebts = ko.observable(false);      
        
        self.selectedFees = ko.observableArray([]);
        self.selectedFeeModel = ko.observable();
        self.feeList = ko.observable();
        
        self.selectedDebts = ko.observableArray([]);
        self.selectedDebtModel = ko.observable();
        self.debtList = ko.observable();
        
        self.feeModel = ko.observable();
        self.paymentModel = ko.observable();
        
        self.fees_arr = ko.observableArray([]);
        
        self.debts_arr = ko.observableArray([]);
        
        self.messages = ko.observableArray();
  
        self.messagesDataprovider = new ArrayDataProvider(self.messages);                
        
        self.removeMsgs = function (event) {            
            self.messages([]);                        
        }
        
        self.refreshPayments = (payment) => {                            
            params.feeModel(self.feeModel());
            params.paymentList([]);                                                                    
            self.sleep(1000).then(() => {                
                params.paymentList().push(payment);
                self.sleep(1000).then(() => {                     
                    params.selectedPayment([payment.id]);                                        
                    //$(".oj-listview-item").firs().trigger("click");
                }); 
            });                                             
            
        };
        
        self.removeFromPaymentList = (id) => {                         
            params.paymentList([]);                                                                  
            self.sleep(500).then(() => {                   
                params.paymentList().pop();          
                params.selectedPayment([-1]);                
                self.sleep(500).then(() => {                       
                    params.feeModel(self.feeModel());                
                    //$(".oj-listview-item").firs().trigger("click");
                }); 
            }); 
        };
        
        ko.computed(function () {             
            
            if(params.feeModel() === undefined) {                
                return;
            }                
            
            self.feeModel(params.feeModel()); 
            
            rootViewModel.selectedYear(self.feeModel().year.id);                        
            
            var url = self.baseUrl + "payments/new/" + params.feeModel().id;              
                            
            try {
                if (params.paymentModel().id !== -1) {
                    url = self.baseUrl + "payments/" + params.paymentModel().id;                                                 
                }                
            }                                    
            catch(err) {                
                 console.log(err);
            }                        
                        
            $.getJSON(url).then(function (payment) {                                
                console.log(JSON.stringify(payment));                                      
                
                self.paymentModel(payment);                                  
                                
                self.id(payment.id);                                           
                self.number(payment.number);                
                self.datetime(payment.datetime); 
                self.amount(payment.amount);
                
                self.house(params.feeModel().house.number);
                
                self.neighbors(new ArrayDataProvider(
                    params.feeModel().house.neighbors,
                    {idAttribute: 'id'}));
                
                if(payment.neighbor) {
                    self.neighbor(payment.neighbor.id);                                
                }                                                
                
                if(payment.persisted) {                     
                    $("#deleteButton").show();
                    self.disabled(true);
                }
                else {
                    $("#deleteButton").hide();
                    self.disabled(false);
                }                
              
            });                                           
            
            var url2 = self.baseUrl + "fees/unpaid/" + params.feeModel().id;    
            
            try {
                if (params.paymentModel().id !== -1) {
                    url2 = self.baseUrl + "fees/payment/" + params.paymentModel().id;                                                 
                }                
            }    
            catch (e) {
                console.log(e);
            }
                          
            $.getJSON(url2).then(function (fees) {                                                                                  
                //self.paymentModel(payment);
                var feesIds = [];
                self.fees_arr([]);
                               
                fees.forEach((fee) => {   
                    //alert(JSON.stringify("fee = " + JSON.stringify(fee)));
                    var fee_obj = {};
                    fee_obj.value = fee.id;
                    fee_obj.label = fee.year.year + "/" + fee.month.name;
                    fee_obj.amount = fee.amount;                    
                    self.fees_arr().push(fee_obj);                    
                    feesIds.push(fee.id);
                });                   
                
                //alert(JSON.stringify(self.fees_arr()));
                
                if (params.feeModel().payment) {
                    self.selectedFees(feesIds);                                        
                }
                else {
                    self.selectedFees([]);                    
                }
                                
                self.feeList(new ArrayDataProvider(self.fees_arr(), { keyAttributes: "value" }));                                             
            });
            
            var paymentId = -1;
            
            if (params.paymentModel()) {
                paymentId = params.paymentModel().id;
            }
            
            var url3 = self.baseUrl + "debts/house/" + params.feeModel().house.number + "/payment/" + paymentId;                            
            
            
            $.getJSON(url3).then(function (debts) {                 
                //alert(payment.number);                                                   
                //self.paymentModel(payment);
                
                var debtsIds = [];
                self.debts_arr([]);
                var hasPayment = false;
                
                debts.forEach((debt) => {   
                    //alert(JSON.stringify("debt = " + JSON.stringify(debt)));
                    var debt_obj = {};
                    debt_obj.value = debt.id;
                    debt_obj.label = debt.amount;
                    debt_obj.amount = debt.amount;                    
                    self.debts_arr().push(debt_obj);                    
                    if (debt.payment) {
                        hasPayment = true;
                    }
                    debtsIds.push(debt.id);
                });                  
                
                //alert(JSON.stringify(self.debts_arr()));
                
                if (hasPayment) {                                      
                    self.selectedDebts(debtsIds);
                }
                else {                    
                    self.selectedDebts([]);
                }
                
                //alert(JSON.stringify(self.paymentModel()));
                
                if (hasPayment || (self.paymentModel().new && self.debts_arr().length > 0)) {                    
                    self.hasDebts(true);
                }   
                else {
                    self.hasDebts(false);
                }
                                
                self.debtList(new ArrayDataProvider(self.debts_arr(), { keyAttributes: "value" }));
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
                    
                    var debtsIds = "";
                    
                    $(self.selectedDebts()).each(function(key, value) {                                                                          
                        debtsIds = debtsIds +  "&debts=" + value;
                    });                                          
                    
                    debtsIds.replace("&debts=","");                                         
                                                              
                    $.ajax({                    
                        type: "POST",
                        url: self.baseUrl + "payments/save?fees=" + feesIds + debtsIds,                                        
                        dataType: "json",      
                        data: JSON.stringify(payment),			  		 
                        //crossDomain: true,
                        contentType : "application/json",                    
                        success: function(payment) {                                            
                            self.messages([{severity: 'info', summary: 'Succesful Action', detail: "payment saved successfuly", autoTimeout: 5000}]);                                                    
                            self.feeModel().payment = payment;                                
                            self.refreshPayments(payment);                                                             
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
            
            //self.deletePayment(id);
 
            $.ajax({                    
                type: "DELETE",
                url: self.baseUrl + "payments/delete/" + id,                                        
                dataType: "json",      
                //data: JSON.stringify(params.feeModel()),			  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function(id) {                                            
                    self.messages([{severity: 'info', summary: 'Succesful Action', detail: "payment removed successfuly", autoTimeout: 5000}]);                      
                    params.feeModel().payment = null;     
                    params.paymentModel().id = -1;
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
                
        self.totalAmount = ko.computed(() => {                                    
            
            var totalAmount = 0;            
                 
            $(self.selectedFees()).each(function(key, value) {                                  
                
                //var payment = self.getPaymentById(value);
         
                totalAmount = totalAmount + self.feeModel().amount;
                
            });   
            
            $(self.selectedDebts()).each(function(key, value) {                                  
                
                var debt = self.getDebtById(value);
                
                //alert(JSON.stringify(debt));
                
                if (debt) {
                    totalAmount = totalAmount + debt.amount;                    
                }                         
                
            });  
                        
            return totalAmount;                        
        });
        
        self.getDebtById = (id) => {
            
            var toReturn; 
                 
            $(self.debts_arr()).each(function(key,value) {   
                
                if(value.value === id) {                    
                    toReturn = value;
                    return false;
                }                
            });                        
            
            return toReturn;
        }
        
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
        
        
        self.goToFees = (event, data) => {                            
            var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                                    
            rootViewModel.router.go({path: 'dashboard'});        
        };  

                                            
    }          
    
       
    return houseContentViewModel;
});
