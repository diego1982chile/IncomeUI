/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
        'ojs/ojoffcanvas', 'ojs/ojmodule-element', 'ojs/ojknockout', 'ojs/ojarraytabledatasource'],
  function(ko, Context, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider, OffcanvasUtils) {

     function ControllerViewModel() {

      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      this.manner = ko.observable('polite');
      this.message = ko.observable();
      announcementHandler = (event) => {
          this.message(event.detail.message);
          this.manner(event.detail.manner);
      };

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);


      // Media queries for repsonsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

      let navData = [
        { path: '', id: 'login', detail: { label: 'Login', iconClass: 'oj-ux-ico-information-s' }, redirect: 'login' },
        { path: 'login', id: 'login', detail: { label: 'Login', iconClass: 'oj-ux-ico-information-s' } }, 
        { path: 'dashboard', id: 'dashboard', detail: { label: 'Dashboard', iconClass: 'oj-ux-ico-bar-chart' } },
        { path: 'houses', id: 'houses', detail: { label: 'Houses', iconClass: 'oj-ux-ico-fire' } },                     
        { path: 'payments', id: 'payments', detail: { label: 'Payments', iconClass: 'oj-ux-ico-fire' } },          
        { path: 'about', id: 'about', detail: { label: 'About', iconClass: 'oj-ux-ico-information-s' } }
      ];

      // Router setup
      this.router = new CoreRouter(navData, {
        urlAdapter: new UrlParamAdapter()
      });
      
      this.router.sync();

      this.moduleAdapter = new ModuleRouterAdapter(this.router);

      this.selection = new KnockoutRouterAdapter(this.router);

      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      //this.navDataProvider = new ArrayDataProvider(navData.slice(1), {keyAttributes: "path"});
      
      this.navDataProvider = new oj.ArrayTableDataSource(navData.slice(0,1), {idAttribute: 'id'});

      // Drawer
      // Close offcanvas on medium and larger screens
      this.mdScreen.subscribe(() => {OffcanvasUtils.close(this.drawerParams);});
      this.drawerParams = {
        displayMode: 'push',
        selector: '#navDrawer',
        content: '#pageContent'
      };
      
      // Called by navigation drawer toggle button and after selection of nav drawer item
      this.toggleDrawer = () => {
        this.navDrawerOn = true;
        return OffcanvasUtils.toggle(this.drawerParams);
      }
      
      $(document).ready(function() {         
         $('#ui-id-17').hide();
      });

      // Header            
      // Application Name used in Branding Area
      this.appName = ko.observable("App Name");
      // User Info used in Global Navigation area
      this.userLogin = ko.observable("Not yet logged in");
      
      this.userLoggedIn = ko.observable("N");
      
      this.incomeServiceBaseUrl = ko.observable("http://192.168.0.5:8080/IncomeService/api/");
      
      this.tokenServiceBaseUrl = ko.observable("http://192.168.0.5:8181/TokenService/rest/");

      this.token = ko.observable("placeholderForToken");      

      this.authorize = () => {                
        if(this.userLoggedIn() === "N") {
            alert("Recurso no autorizado!");
            this.router.go({path: 'login'});        
        }      
        else {                         
            this.navDataProvider.reset(navData.slice(2), {idAttribute: 'id'});                                    
            //this.router.go({path: 'accounts'});                            
        }
      }
      
      this.unauthorize = () => {          
        if(this.userLoggedIn() === "Y") {
            this.router.go({path: 'accounts'});
        }      
        else {            
        }
      }
      
      this.menuItemAction = (event) => {        
        if (event.target.textContent.trim() === "Sign Out") {
            this.userLoggedIn("N");
            this.userLogin("Not yet logged in");                                                            
            
            this.navDataProvider.reset(navData.slice(0,1), {idAttribute: 'id'});                                             
            this.router.go({path: 'login'});   
            
        }
       }

      // Footer
      this.footerLinks = [
        {name: 'About Oracle', linkId: 'aboutOracle', linkTarget:'http://www.oracle.com/us/corporate/index.html#menu-about'},
        { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
        { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
        { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
        { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
      ];
     }
     // release the application bootstrap busy state
     Context.getPageContext().getBusyContext().applicationBootstrapComplete();

     return new ControllerViewModel();
  }
);
