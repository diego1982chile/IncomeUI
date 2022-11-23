/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['knockout',
        'ojs/ojarraydataprovider',           
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        "ojs/ojasyncvalidator-regexp",
        "ojs/ojselectsingle",
        'ojs/ojinputtext',
        "ojs/ojradioset",
        'ojs/ojbufferingdataprovider',        
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        'ojs/ojbutton',
        'ojs/ojselectcombobox',
        'ojs/ojlistitemlayout',        
        'ojs/ojformlayout'        
        ],   
    
function (ko, ArrayDataProvider, ListDataProviderView, ojdataprovider_1, AsyncRegExpValidator) {
    /**
     * The view model for the main content view template
     */        
    function neighborsContentViewModel(params) {
        
        var self = this;        
             
    
        /* Variables */
        self.id = ko.observable(1);
        
        self.name = ko.observable("");
        self.lastname = ko.observable("");
        self.email = ko.observable("");
        self.phone = ko.observable("");
                    
        self.editedData = ko.observable("");
        
        self.dataNeighbors = ko.observableArray();  
        
        self.filter = ko.observable("");
        
        self.editRow = ko.observable();    
        
        self.emailPatternValidator = ko.observableArray([
            new AsyncRegExpValidator({
                pattern: "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
                hint: "enter a valid email format",
                messageDetail: "Not a valid email format",
            }),
        ]);
        
        self.phonePatternValidator = ko.observableArray([
            new AsyncRegExpValidator({
                pattern: "^(\\+?56)?(\\s?)*(0?9)(\\s?)*[98765432]\\d{7}(\\s?)*",
                //pattern: "^(\\s?)*[98765432]\\d{7}(\\s?)*",
                hint: "enter a valid phone format",
                messageDetail: "Not a valid phone format",
            }),
        ]);
        
        self.datasource = ko.computed(function () {      
            
            console.log(params.houseModel());            
            
            let filterCriterion = null;  
            
            if(params.houseModel()) {
                
                self.dataNeighbors(params.houseModel().neighbors);                                           

                if (self.filter() && self.filter() != "") {
                    filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                        filterDef: { text: self.filter() },                    
                        //filterOptions: {textFilterAttributes: ["client"]}
                    });                
                }   
                
            }                                             
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.dataNeighbors(),
                {idAttribute: 'id'}
            ); 

            return new ListDataProviderView(arrayDataProvider, {filterCriterion: filterCriterion});                                                                                    
            
        });    
        
        self.getItemText = function (itemContext) {
            console.log(itemContext);
            return itemContext.data.name;
        };
        
        self.beforeRowEditListener = (event) => {
              self.cancelEdit = false;
              const rowContext = event.detail.rowContext;
              //console.log(rowContext.status);
              //console.log(self.data()[rowContext.status.rowIndex]);             
              
              //console.log(rowContext.item.data);
              
              self.originalData = Object.assign({}, rowContext.item.data);
              self.rowData = Object.assign({}, rowContext.item.data);
              
              //console.log(self.rowData);
        };
        
        // handle validation of editable components and when edit has been cancelled
        self.beforeRowEditEndListener = (event) => {
            console.log(event);
            self.editedData("");            
            const detail = event.detail; 
            if (!detail.cancelEdit && !self.cancelEdit) {
                if (self.hasValidationErrorInRow(document.getElementById("table"))) {
                    event.preventDefault();
                }
                else {
                    if (self.isRowDataUpdated()) {
                        const key = detail.rowContext.status.rowIndex;
                        self.submitRow(key);
                    }
                }
            }
        };
        
        self.addRow = (key) => {                                       
                 
            console.log(key);   
            
            let name = document.getElementById("name");
            let lastname = document.getElementById("lastname");                                  
            let email = document.getElementById("email");
            let phone = document.getElementById("phone");
                                                           
            name.validate().then((result3) => {                
                lastname.validate().then((result4) => { 
                    email.validate().then((result5) => {                
                        phone.validate().then((result6) => {
                    
                            if(result3 === 'invalid' || result4 === 'invalid' ||
                                    result5 === 'invalid' || result6 === 'invalid') {
                                return false;
                            }

                            var neighbor = {};

                            neighbor.id = self.getRndInteger(1000,100000);
                            neighbor.name = self.name();
                            neighbor.lastname = self.lastname();
                            neighbor.email = self.email();
                            neighbor.phone = self.phone();

                            var result = self.itemExists(neighbor);

                            if (!result) {
                                params.houseModel().neighbors.push(neighbor);           
                                self.dataNeighbors(params.houseModel().neighbors);                        
                                self.clearPlaceHolders();
                            }
                            else {
                                alert("this neighbor already exists");
                            }                              
                            
                            
                        });
                    });
                });
            }); 
            
            //console.log(JSON.stringify(params.conceptModel().validDescriptionsButFSNandFavorite));
        };
        
        self.clearPlaceHolders = () => {
            self.name("");
            self.lastname("");
            self.email("");
            self.phone("");
        }       
        
        self.itemExists = (data) => {
            var result = false;
            
            $(self.dataNeighbors()).each(function(key,value) { 
                console.log("value = " + JSON.stringify(value));
                console.log("data = " + JSON.stringify(data));
                if(value.name === data.name && 
                    value.lastname === data.lastname &&
                    value.email === data.email && 
                    value.phone === data.phone) {                    
                    result = true;
                }                
            });
            return result;
        }
        
        self.updateItem = (key, data) => {                                       
                 
            console.log(key);    
            
            var result = self.itemExists(data);
            
            if (!result) {
                self.dataNeighbors()[key] = data;
            }        
            else {
                alert("ya existe una descripción con estas características");
            }
            
            console.log(JSON.stringify(self.dataNeighbors()));
                                
        };
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);

            self.updateItem(key, self.rowData);             
                                                                           
        };
        
        self.isRowDataUpdated = () => {
            const propNames = Object.getOwnPropertyNames(self.rowData);
            for (let i = 0; i < propNames.length; i++) {
                if (self.rowData[propNames[i]] !== self.originalData[propNames[i]]) {
                    return true;
                }
            }
            return false;
        };
        
        // checking for validity of editables inside a row
        // return false if one of them is considered as invalid
        self.hasValidationErrorInRow = (table) => {
            const editables = table.querySelectorAll(".editable");
            for (let i = 0; i < editables.length; i++) {
                const editable = editables.item(i);
                /*
                editable.validate();
                // Table does not currently support editables with async validators
                // so treating editable with 'pending' state as invalid
                if (editable.valid !== "valid") {
                    return true;
                }
                */
            }
            return false;
        };
        
        self.handleUpdate = (event, context) => {
            console.log(context.row);
            self.editRow({ rowKey: context.row.id });
        };
        
        self.handleDone = () => {
            self.editRow({ rowKey: null });
        };
        
        self.handleCancel = () => {                                                                 
            self.cancelEdit = true;
            self.editRow({ rowKey: null });                      
        };
        
        self.handleValueChanged = () => {
            self.filter(document.getElementById("filter").rawValue);
        };       
        
        self.removeRow = (event, context) => {
            params.houseModel().neighbors.splice(context.index, 1);
            self.dataNeighbors(params.houseModel().neighbors);
        };
        
        self.getRndInteger = (min, max) => {
            return Math.floor(Math.random() * (max - min) ) + min;
        }
        
        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
                            
    }
    
    
       
    return neighborsContentViewModel;
});
