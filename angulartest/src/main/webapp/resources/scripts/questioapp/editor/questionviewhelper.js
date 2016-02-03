/**
 *   Kérdésekkel kapcsolatos segédszkriptek
 */

QuestionViewHelper = function () {

    //this.headerTabFocused = false;

    this.openedForEdit = false;

    this.settingsPanelOpened = false;

    this.imported = false;

    this.itemTypes = [];

    this.localizedType = '';
};

QuestionViewHelper.prototype.toggleSettingsPanel = function(panel){
    if(this.settingsPanelOpened != panel) {
        this.settingsPanelOpened = panel;
    }
    else{
        this.settingsPanelOpened = false;
    }
};

QuestionViewHelper.prototype.isFiltered = function(question, filter) {
    if (QuestioApp.Util.isDefinedAndNotNull(filter)) {
        var filterArray = filter.toLowerCase().replace(".", "").split(" ");
        if (QuestioApp.Util.isInitialized(filter)) {
            for (var i = 0; i < filterArray.length; i++) {
                if (QuestioApp.Util.isDefinedAndNotNull(question.letter) && question.letter.toLowerCase().indexOf(filterArray[i]) > -1) {
                    continue;
                }
                if (QuestioApp.Util.isDefinedAndNotNull(question.localizedType) && question.localizedType.toLowerCase().indexOf(filterArray[i]) > -1) {
                    continue;
                }
                return false;
            }
        }
    }
    return true;
};