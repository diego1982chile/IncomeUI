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
        
        self.amount = ko.observable();
                    
        self.editedData = ko.observable("");
        
        self.dataDebts = ko.observableArray();  
        
        self.filter = ko.observable("");
        
        self.editRow = ko.observable();    
        
        self.datasource = ko.computed(function () {      
            
            console.log(params.houseModel());            
            
            let filterCriterion = null;  
            
            if(params.houseModel()) {
                
                self.dataDebts(params.houseModel().debts);                                           

                if (self.filter() && self.filter() != "") {
                    filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                        filterDef: { text: self.filter() },                    
                        //filterOptions: {textFilterAttributes: ["client"]}
                    });                
                }   
                
            }                                             
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.dataDebts(),
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
            
            let amount = document.getElementById("amount");
                                                           
            amount.validate().then((result3) => {                               
                    
                if(result3 === 'invalid') {
                    return false;
                }

                var debt = {};

                debt.id = self.getRndInteger(1000,100000);
                debt.amount = self.amount();

                params.houseModel().debts.push(debt);           
                self.dataDebts(params.houseModel().debts);                        
                self.clearPlaceHolders();               

            });
            
            //console.log(JSON.stringify(params.conceptModel().validDescriptionsButFSNandFavorite));
        };
        
        self.clearPlaceHolders = () => {
            self.amount(null);            
        }       
        
        self.updateItem = (key, data) => {                                       
                 
            console.log(key);                            
            
            self.dataDebts()[key] = data;
                        
            console.log(JSON.stringify(self.dataDebts()));
                                
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
            params.houseModel().debts.splice(context.index, 1);
            self.dataDebts(params.houseModel().debts);
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
