QuestioApp = QuestioApp ? QuestioApp : {};
QuestioApp.UrlUtil = {

    isPartOfPath: function (name) {
        return location.href.indexOf(name) > -1;
    },

    getUrlParameterValue: function (name) {
        url = location.href;
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( url );
        return results == null ? null : results[1];
    }
};