/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['knockout', 'ojs/ojmodel', 'ojs/ojknockouttemplateutils', 
        'ojs/ojcollectiondatagriddatasource', 
        'ojs/ojdatagrid', "ojs/ojbutton"], 
    
function (ko, Model, KnockoutTemplateUtils, collectionModule) {
    /**
     * The view model for the main content view template
     */        
    function feesViewModel(params) {
        
        var self = this;        
        
        self.pivoted = ko.observable(false);
        
        self.KnockoutTemplateUtils = KnockoutTemplateUtils;
                             
        self.dataSource = ko.computed(function () {
            
            //console.log(JSON.stringify(params));            
            if (typeof params.yearModel() === 'undefined') {
                return;
            }                                                                                                           
            
            var year = params.yearModel().get('year');                                                                 
 
            var collection = new Model.Collection(null, {
              url: "http://192.168.0.6:8080/IncomeService/api/fees/" + year
            });
            
            console.log(collection);

            return new collectionModule.CollectionDataGridDataSource(collection,
                    { rowHeader: 'house' }
                );
        });
        
        self.columnHeaderRenderer = function (headerContext) {
            console.log(JSON.stringify(headerContext.keys()));
            var column;
            $(headerContext.keys).each(function(k, v) {
                console.log(JSON.stringify(v["column"]));
                column = v["column"];
                return false;
            });  
            return {insert: column};
        };

        self.setCellStyleClass = function (cellContext) {
            var row = cellContext.indexes.row;
            if ((row + 1) % 5 === 0) {
              return 'demo-cell-total oj-helper-justify-content-right';
            }
            return 'oj-helper-justify-content-right';
        };
            
            
        self.getCellClassName = function (cellContext) {
            var key = cellContext.keys.column;
            return 'oj-helper-justify-content-center';                        
        };            
       
        
        self.submitPayment = function (event, data) {
            

        }
                                   
    }  
       
    return feesViewModel;
});