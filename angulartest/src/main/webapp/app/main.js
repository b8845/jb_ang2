System.register(['angular2/platform/browser', './appcomponent'], function(exports_1) {
    var browser_1, appcomponent_1;
    return {
        setters:[
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (appcomponent_1_1) {
                appcomponent_1 = appcomponent_1_1;
            }],
        execute: function() {
            browser_1.bootstrap(appcomponent_1.AppComponent);
        }
    }
});
//# sourceMappingURL=main.js.map