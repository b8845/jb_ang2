
QuestioApp = QuestioApp ? QuestioApp : {};
QuestioApp.Util = {
    // Serialize an object into json, but ingore the listed properites from all objects in the object tree.
    stringify: function (obj, ignore) {

        if (typeof ignore === "string") {
            ignore = new Array(ignore);
        } else if (ignore === undefined) {
            ignore = new Array();
        }

        ignore.push("$$hashKey");

        return JSON.stringify(obj, function (key, value) {
            if (ignore.indexOf(key) > -1) {
                return undefined;
            }
            return value;
        });
    },

    generateId: function (array) {
        var id = 0;
        $.each(array, function( index, value ) {
            id = value.id >= id ? value.id + 1 : id;
        });
        return id;
    },

    reInitIndexes: function (array) {
        $.each(array, function( index, value ) {
            value.index = index;
        });
    },

    isInitialized: function(data) {
        return typeof data != 'undefined' && data != null && data != '' && (data.constructor !== Array || data.length != 0);
    },

    isDefined: function(value){
        return typeof value !== 'undefined';
    },

    //////////////////////////////////////////////////////////////////////////////////////
    //  Equal (==) : same value, no type or reference comparison ( 0 == '0' : true )
    //  Identical (===) : both operands reference the same object,
    //                    or in case of value types, have the same value and type.
    //////////////////////////////////////////////////////////////////////////////////////
    isEqual: function(first, second){
        if(this.isDefined(first) && this.isDefined(second)){
            if(first == null && second == null){
                return true;
            }
            if(first != null && second != null){
                return first == second;
            }
        }
        return false;
    },

    isIdentical: function(first, second){
        if(this.isDefinedAndNotNull(first) && this.isDefinedAndNotNull(second)){
            return first === second;
        }
        return false;
    },
    //////////////////////////////////////////////////////////////////////////////////////

    isDefinedAndNotNull: function(value){
        return typeof value !== 'undefined' && value != null;
    },

    hasValue: function(value){
        return typeof value !== 'undefined' && value != null && value.toString().trim() != '';
    },

    isNumber: function(n){
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    isNormalInteger: function(n){
        return /^\+?(0|[1-9]\d*)$/.test(n);
    },

    getIgnoreList: function(dataSetName) {
        if(dataSetName == 'questionnaireTemplate'){
            return ["templateHelper", "viewHelper", "hovered", "localizedType",
                "itemHelper", "viewOpened", "downloadLink", "cloneQuestionHelper",
                "dimensionAdditionHelper", "quotaEditorHelper"];
        }
    },

    create2dArray: function(rows, columns){
        var arr = new Array(rows);

        for (var i=0;i<rows;i++) {
            arr[i] = new Array(columns);
        }
        return arr;
    },

    shuffleArray: function(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    getHungarianQuestionType: function(questionType){
        if(questionType == null){
            return "Új kérdés"
        }
        if(questionType == 'SimpleChoice'){
            return "Egyszerű választó"
        }
        if(questionType == 'Matrix'){
            return "Mátrix"
        }
        if(questionType == 'SharedNumeric'){
            return "Felosztó numerikus"
        }
        if(questionType == 'FreeText'){
            return "Szabadszavas"
        }
        if(questionType == 'OrderQuestion'){
            return "Sorrendező"
        }
        if(questionType == 'GroupQuestion'){
            return "Csoportosító"
        }
        if(questionType == 'ScrollbarQuestion'){
            return "Csúszka"
        }
        if(questionType == 'Comment'){
            return "Komment"
        }
        if(questionType == 'SpecialQuestion'){
            return "Speciális"
        }
    },

    getHungarianItemType: function(itemType){
        if(itemType == "ComboBox"){
            return "Legördülős választó";
        }
        if(itemType == "CheckBox"){
            return "Többválasztós";
        }
        if(itemType == "RadioButtonRow"){
            return "Egyválasztós(sor)";
        }
        if(itemType == "RadioButtonColumn"){
            return "Egyválasztós(oszlop)";
        }
        if(itemType == "Number"){
            return "Szám";
        }
        if(itemType == "TextBox"){
            return "Szöveg";
        }
        if(itemType == "ScrollBar"){
            return "Csúszka";
        }
        if(itemType == "TextBox"){
            return "Szöveg";
        }
        if(itemType == "TextBoxWithoutNumber"){
            return "Szöveg számok nélkül";
        }
        if(itemType == "TextDate"){
            return "Dátum";
        }
        if(itemType == "TextYear"){
            return "Év";
        }
        if(itemType == "TextTime"){
            return "Időpont";
        }
        if(itemType == "TextEmail"){
            return "Email";
        }
        if(itemType == "TextZip"){
            return "Irányítószám";
        }
        if(itemType == "Gender"){
            return "Nem";
        }
        if(itemType == "CityType"){
            return "Várostípus";
        }
        if(itemType == "County"){
            return "Megye";
        }
        if(itemType == "Region"){
            return "Régió";
        }
        if(itemType == "City"){
            return "Város";
        }
        return "";
    }
};