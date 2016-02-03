/**
*   Kérdőív template-tel kapcsolatos segédszkriptek
*/
TemplateViewHelper = function () {
    this.focusedQuestion = -1;

    this.terminationHelper = null;

    this.dataTablesHelper = null;

    this.saveProcessActive = false;

    this.headerTabOpened = false;

    this.deletedMediaIdList = [];

    this.hoveredQuestion = null;

    this.lastHoveredQuestion = null;

    this.templateEditorCompositeQuestionRowHeaderOpened = false;

    this.templateTestCompositeQuestionRowHeaderOpened = false;

    this.conditionRowHeaderOpened = false;

    this.hoveredMultimediaIndex = null;

    this.hoveredConditionID = null;

    this.hoveredQuotaID = null;

    this.phoneDenied = false;

    this.questionFilterText = "";

    this.conditionFilterText = "";

    this.sampleDate = "2015-01-01";

    this.sampleTime = "08:00";

    this.multiselectTraslation = {
        selectAll: 'Mindegyik',
        selectNone: 'Egyik sem',
        reset: 'Visszaállít',
        search: 'Keresés...',
        nothingSelected: 'Nincs kiválasztott elem'
    }
};

TemplateViewHelper.prototype.questionFocused = function(orderInTemplate){
    this.focusedQuestion = orderInTemplate;
};

TemplateViewHelper.prototype.editorClickEvent = function(template, event){
    if($(event.target).closest('.settings-panel-allowed').length == 0){
        angular.forEach(template.questions, function(value, key) {
            value.viewHelper.settingsPanelOpened = false;
        });
    }
};

//Common item with pop-up button appearance functions
TemplateViewHelper.prototype.hoverIn = function(item,button,hoverClass,nohoverClass,offset){
    if(QuestioApp.Util.isDefinedAndNotNull(nohoverClass)) {
        item.removeClass(nohoverClass);
    }
    if(QuestioApp.Util.isDefinedAndNotNull(hoverClass)) {
        item.addClass(hoverClass);
    }
    button.removeClass("display-none");
    if(QuestioApp.Util.isDefinedAndNotNull(offset)) {
        button.offset(offset);
    }
};

TemplateViewHelper.prototype.itemHoverOut = function(event,item,button,hoverClass,nohoverClass){
    if(QuestioApp.Util.isDefinedAndNotNull(button) && !this.itemIsHovered(event,button)) {
        this.hoverOut(item,button,hoverClass,nohoverClass);
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.buttonHoverOut = function(event,item,button,hoverClass,nohoverClass){
    if(QuestioApp.Util.isDefinedAndNotNull(item) && !this.itemIsHovered(event,item)) {
        this.hoverOut(item,button,hoverClass,nohoverClass);
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.hoverOut = function(item,button,hoverClass,nohoverClass) {
    if(QuestioApp.Util.isDefinedAndNotNull(hoverClass)) {
        item.removeClass(hoverClass);
    }
    if(QuestioApp.Util.isDefinedAndNotNull(nohoverClass)){
        item.addClass(nohoverClass);
    }
    this.hideButton(button);
};

TemplateViewHelper.prototype.hideButton = function(button){
    button.addClass("display-none");
};

TemplateViewHelper.prototype.itemIsHovered = function(event,item){
    var itemOffset = item.offset();
    if(!QuestioApp.Util.isDefinedAndNotNull(itemOffset) || !QuestioApp.Util.isDefinedAndNotNull(event)){
        return false;
    }
    var mouseOffset = {top: event.pageY,left: event.pageX};
    var offsetDifference = {
        height: mouseOffset.top - itemOffset.top,
        width: mouseOffset.left - itemOffset.left
    };
    return offsetDifference.height >= 0 && offsetDifference.width >= 0 &&
        offsetDifference.height < item.outerHeight() && offsetDifference.width < item.outerWidth();
};

// Header tab appearance functions
TemplateViewHelper.prototype.headerTabHoverIn = function(index){
    if(this.hoveredQuestion != index) {
        var question = $("#question-" + index).find(".sentinel-bordered-nohover");
        var offset = question.offset();
        var buttonwrapper = $(".questionrowheader-settings-button-wrapper");
        var newOffset = {top: offset.top - buttonwrapper.height(), left: offset.left};
        this.hoverIn(
            question, buttonwrapper, "question-tab-sentinel-hovered", null, newOffset
        );
        this.hoveredQuestion = index;
    }
};

TemplateViewHelper.prototype.headerTabHoverOut = function(event){
    if(this.itemHoverOut(
        event,$(".question-tab-sentinel-hovered"), $(".questionrowheader-settings-button-wrapper"), "question-tab-sentinel-hovered", null
    )){
        this.resetHoveredQuestion();
    }
};

TemplateViewHelper.prototype.settingsButtonWrapperHoverOut = function(event){
    if(this.buttonHoverOut(
        event,$(".question-tab-sentinel-hovered"), $(".questionrowheader-settings-button-wrapper"), "question-tab-sentinel-hovered", null
    )){
        this.resetHoveredQuestion();
    }
};

TemplateViewHelper.prototype.hideSettingsButtonWrapper = function(){
    this.hideButton($(".questionrowheader-settings-button-wrapper"));
    this.resetHoveredQuestion();
}

TemplateViewHelper.prototype.resetHoveredQuestion = function(){
    if(this.hoveredQuestion != null){
        this.lastHoveredQuestion = this.hoveredQuestion;
    }
    this.hoveredQuestion = null;
}

TemplateViewHelper.prototype.getLastHoveredQuestion = function(){
    if(this.hoveredQuestion != null){
        return this.hoveredQuestion;
    }
    return this.lastHoveredQuestion;
}

//Multimedia item appearance functions
TemplateViewHelper.prototype.multimediaHoverIn = function(index){
    if(this.hoveredMultimediaIndex != index) {
        var item = $("#multimedia-item-" + index);
        var offset = item.offset();
        var settingswrapper = $(".multimedia-settings-functions");
        var newOffset = {
            top: offset.top - settingswrapper.outerHeight(),
            left: offset.left + item.outerWidth() - settingswrapper.outerWidth()
        };
        this.hoverIn(item, settingswrapper, "multimedia-header-item-hovered", null, newOffset);
        this.hoveredMultimediaIndex = index;
    }
};

TemplateViewHelper.prototype.multimediaItemHoverOut = function(event) {
    if(this.itemHoverOut(
        event,$('#multimedia-item-' + this.hoveredMultimediaIndex), $('.multimedia-settings-functions'), 'multimedia-header-item-hovered', null
    )){
        this.hoveredMultimediaIndex = null;
    }
};

TemplateViewHelper.prototype.multimediaDeleteButtonHoverOut = function(event){
    if(this.buttonHoverOut(
        event,$('#multimedia-item-' + this.hoveredMultimediaIndex), $('.multimedia-settings-functions'), 'multimedia-header-item-hovered', null
    )){
        this.hoveredMultimediaIndex = null;
    }
};

TemplateViewHelper.prototype.hideMultimediaDeleteButton = function(){
    this.hideButton($(".multimedia-settings-functions"));
    this.hoveredMultimediaIndex = null;
};

//Condition item appearance functions
TemplateViewHelper.prototype.conditionItemHoverIn = function(conditionID){
    if(this.hoveredConditionID != conditionID) {
        this.hoveredConditionID = conditionID;
        var item = $('#condition-item-' + this.hoveredConditionID);
        var offset = item.offset();
        var settingswrapper = $("#condition-settings-buttons");
        var newOffset = {
            top: offset.top - settingswrapper.outerHeight(),
            left: offset.left + item.outerWidth() - settingswrapper.outerWidth()
        };
        this.hoverIn(item, settingswrapper, 'sentinel-bordered-hovered', 'sentinel-bordered-nohover', newOffset);
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.conditionItemHoverOut = function(event) {
    if(this.itemHoverOut(
            event,$('#condition-item-' + this.hoveredConditionID), $('#condition-settings-buttons'), 'sentinel-bordered-hovered', 'sentinel-bordered-nohover'
        )){
        this.hoveredConditionID = null;
    }
};

TemplateViewHelper.prototype.conditionDeleteButtonHoverOut = function(event){
    if(this.buttonHoverOut(
            event,$('#condition-item-' + this.hoveredConditionID), $('#condition-settings-buttons'), 'sentinel-bordered-hovered', 'sentinel-bordered-nohover'
        )){
        this.hoveredConditionID = null;
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.hideConditionDeleteButton = function(){
    this.hideButton($("#condition-settings-buttons"));
    this.hoveredConditionID = null;
};

//Quota item appearance functions
TemplateViewHelper.prototype.quotaItemHoverIn = function(quotaID){
    if(this.hoveredQuotaID != quotaID) {
        this.hoveredQuotaID = quotaID;
        var item = $('#quota-item-' + this.hoveredQuotaID);
        var offset = item.offset();
        var settingswrapper = $("#quota-settings-buttons");
        var newOffset = {
            top: offset.top - settingswrapper.outerHeight(),
            left: offset.left + item.outerWidth() - settingswrapper.outerWidth()
        };
        this.hoverIn(item, settingswrapper, 'sentinel-bordered-hovered', 'sentinel-bordered-nohover', newOffset);
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.quotaItemHoverOut = function(event) {
    if(this.itemHoverOut(
            event,$('#quota-item-' + this.hoveredQuotaID), $('#quota-settings-buttons'), 'sentinel-bordered-hovered', 'sentinel-bordered-nohover'
        )){
        this.hoveredQuotaID = null;
    }
};

TemplateViewHelper.prototype.quotaDeleteButtonHoverOut = function(event){
    if(this.buttonHoverOut(
            event,$('#quota-item-' + this.hoveredQuotaID), $('#quota-settings-buttons'), 'sentinel-bordered-hovered', 'sentinel-bordered-nohover'
        )){
        this.hoveredQuotaID = null;
        return true;
    }
    return false;
};

TemplateViewHelper.prototype.hideQuotaDeleteButton = function(){
    this.hideButton($("#quota-settings-buttons"));
    this.hoveredQuotaID = null;
};

TemplateViewHelper.prototype.conditionIsFiltered = function(condition, filter, conditionFunctions) {
    if (QuestioApp.Util.isDefinedAndNotNull(filter)) {
        var filterArray = filter.toLowerCase().replace(".", "").split(" ");
        if (QuestioApp.Util.isInitialized(filter)) {
            for (var i = 0; i < filterArray.length; i++) {
                if (QuestioApp.Util.isDefinedAndNotNull(condition.name) && condition.name.toLowerCase().indexOf(filterArray[i]) > -1) {
                    continue;
                }
                var cont = false;
                var parts = condition.parts;
                if (QuestioApp.Util.isDefinedAndNotNull(parts)) {
                    for(var j = 0; j < parts.length; ++j) {
                        if (conditionFunctions.conditionPartsFound(parts[j],
                                conditionFunctions.conditionPartIsFiltered,
                                filterArray[i], conditionFunctions)) {
                            cont = true;
                            break;
                        }
                    }
                    if(cont){
                        continue;
                    }
                }
                var targets = condition.targets;
                if (QuestioApp.Util.isDefinedAndNotNull(targets)) {
                    for(var j = 0; j < targets.length; ++j) {
                        var target = targets[j];
                        if (QuestioApp.Util.isDefinedAndNotNull(target.questionId)) {
                            var questionId = target.questionId;
                            for(var k = 0; k < questionId.length; ++k) {
                                var question = questionId[k];
                                if (QuestioApp.Util.isDefinedAndNotNull(question.letter) &&
                                    question.letter.toLowerCase().indexOf(filterArray[i]) > -1) {
                                    cont = true;
                                }
                                if (QuestioApp.Util.isDefinedAndNotNull(question.localizedType) &&
                                    question.localizedType.toLowerCase().indexOf(filterArray[i]) > -1) {
                                    cont = true;
                                }
                            }
                        }
                    }
                    if(cont){
                        continue;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

TemplateViewHelper.prototype.initQuotaHelpers = function(template) {
    if(QuestioApp.Util.isInitialized(template.quotas)){
        for(var i = 0; i < template.quotas.length; i++){
            template.quotas[i].quotaEditorHelper = new QuotaEditorHelper();
            template.quotas[i].quotaEditorHelper.initQuotaTypeHelper(template.quotas[i]);
        }
    }
};

TemplateViewHelper.prototype.initQuotasForSave = function(template) {
    if(QuestioApp.Util.isInitialized(template.quotas)){
        for(var i = 0; i < template.quotas.length; i++){
            template.quotas[i].quotaEditorHelper.updateQuotaType(template.quotas[i]);
        }
    }
};