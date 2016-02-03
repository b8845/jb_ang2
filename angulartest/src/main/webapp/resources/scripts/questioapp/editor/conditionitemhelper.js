/**
 * Feltételek szerkesztéséhez szükséges segédadatok
 */

ConditionItemHelper = function () {

    this.questions = [];

    this.conditionType = null;

    this.rows = [];

    this.columns = [];

    this.valueEnabled = false;

    this.rowSelectionEnabled = false;

    this.columnSelectionEnabled = false;

    this.constructSourcesEnabled = false;

    this.itemOrTarget = null;

    this.valueTypes = [];

    this.constructSources = [];

    this.targetTypes = [];

    this.selectedQuestionType = '';

    this.selectedItemType = '';

    this.dimensionSelectionMode = 'multiple';

    this.initQuestions = function(template, item){
        this.questions = [];
        for(var i = 0; i < template.questions.length; i++){
            if(template.questions[i].questionType != null &&
                template.questions[i].questionType != 'Új kérdés"' &&
                ((template.questions[i].questionType != 'OrderQuestion' &&
                template.questions[i].questionType != 'GroupQuestion') || this.itemOrTarget == 'Target')) {
                var questionVM = {
                    id: template.questions[i].id,
                    letter: template.questions[i].letter,
                    localizedType: template.questions[i].localizedType,
                    ticked: false
                };
                if (QuestioApp.Util.isInitialized(item.questionId) && item.questionId.length != 0 &&
                    item.questionId[0].id == template.questions[i].id) {
                    this.selectedQuestionType = template.questions[i].questionType;
                    this.selectedItemType = template.questions[i].itemType;
                    questionVM.ticked = true;
                    this.initForSelectedQuestion(template, item, template.questions[i]);
                }
                this.questions.push(questionVM);
            }
        }
    }

    this.initForSelectedQuestion = function(template, item, question) {
        if (question == null && item.questionId.length != 0) {
            for (var i = 0; i < template.questions.length; i++) {
                if (template.questions[i].id == item.questionId[0].id) {
                    question = template.questions[i];
                    this.selectedQuestionType = question.questionType;
                    this.selectedItemType = question.itemType;
                    break;
                }
            }
        }
        if (question != null) {
            this.setDimensionSelectionType(question);
            if(this.itemOrTarget == 'Item' || this.conditionType == 'Visibility'){
                this.initRowsIfNeeded(template, item, question);
                this.initColumnsIfNeeded(template, item, question);
            }
            if (this.conditionType == 'Construct') {
                this.initConstructIfNeeded(template, item, question);
            }

            if(this.itemOrTarget == 'Item'){
                this.initValueTypesIfNeeded(template, item, question);
            }
            else if(this.itemOrTarget == 'Target'){
                this.initTargetTypes(template, item, question);
            }
        }
    }

    this.initRowsIfNeeded = function(template, item, question){

        this.rows = [];
        this.rowSelectionEnabled = false;

        if(question.questionType == 'SimpleChoice' ||
            question.questionType == 'Matrix' ||
            question.questionType == 'SharedNumeric' ||
            question.questionType == 'FreeText' ||
            question.questionType == 'OrderQuestion' ||
            question.questionType == 'GroupQuestion' ||
            question.questionType == 'ScrollbarQuestion' ||
            (this.isSpecialQuestionWithSelect(question))
            ){

            this.rowSelectionEnabled = true;
            for(var i = 0; i < question.rows.length; i++){
                var dimensionVM = {
                    id: question.rows[i].id,
                    valueID: question.rows[i].valueID + '',
                    title: question.rows[i].title,
                    ticked: false
                };
                if(QuestioApp.Util.isInitialized(item.rowIds)) {
                    for (var j = 0; j < item.rowIds.length; j++) {
                        if (item.rowIds[j].id == question.rows[i].id) {
                            dimensionVM.ticked = true;
                        }
                    }
                }
                this.rows.push(dimensionVM);
            }
        }
    }

    this.initColumnsIfNeeded = function(template, item, question){

        this.columns = [];
        this.columnSelectionEnabled = false;

        if(question.questionType == 'Matrix' ||
            question.questionType == 'GroupQuestion' ||
            question.questionType == 'FreeText'
            ){

            this.columnSelectionEnabled = true;
            for(var i = 0; i < question.columns.length; i++){
                var dimensionVM = {
                    id: question.columns[i].id,
                    valueID: question.columns[i].valueID,
                    title: question.columns[i].title,
                    ticked: false
                };
                if(QuestioApp.Util.isInitialized(item.columnIds)) {
                    for (var j = 0; j < item.columnIds.length; j++) {
                        if (item.columnIds[j].id == question.columns[i].id) {
                            dimensionVM.ticked = true;
                        }
                    }
                }
                this.columns.push(dimensionVM);
            }
        }
    }

    this.initValueTypesIfNeeded = function(template, item, question) {
        this.valueEnabled = false;
        this.valueTypes = [];


        // selection types
        if (question.questionType == 'SimpleChoice' ||
            question.questionType == 'Matrix' ||
            this.isSpecialQuestionWithSelect(question)
            ) {
            this.valueTypes.push({value:"Selected", name:"Kiválasztva"});
            this.valueTypes.push({value:"Unselected", name:"Nincs kiválasztva"});

            if(item.conditionValueType != null && item.conditionValueType.length != 0){
                if(item.conditionValueType[0].value == 'Selected'){
                    this.valueTypes[0].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Unselected'){
                    this.valueTypes[1].ticked = true;
                }
            }
        }
        else {
            this.valueEnabled = true;

            this.valueTypes.push({value:"Equal", name:"Egyenlő"});
            this.valueTypes.push({value:"NotEqual", name:"Nem egyenlő"});
            this.valueTypes.push({value:"Like", name:"Tartalmazza"});
            this.valueTypes.push({value:"NotLike", name:"Ne tartalmazza"});
            if(this.isItemTypeSortable(this.selectedItemType)){
                this.valueTypes.push({value:"Greater", name:"Nagyobb"});
                this.valueTypes.push({value:"Less", name:"Kisebb"});
                this.valueTypes.push({value:"Min", name:"Nagyobb vagy egyenlő"});
                this.valueTypes.push({value:"Max", name:"Kisebb vagy egyenlő"});
            }

            if(item.conditionValueType != null && item.conditionValueType.length != 0){
                if(item.conditionValueType[0].value == 'Equal'){
                    this.valueTypes[0].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'NotEqual'){
                    this.valueTypes[1].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Like'){
                    this.valueTypes[2].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'NotLike'){
                    this.valueTypes[3].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Greater' && this.isItemTypeSortable(this.selectedItemType)){
                    this.valueTypes[4].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Less' && this.isItemTypeSortable(this.selectedItemType)){
                    this.valueTypes[5].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Min' && this.isItemTypeSortable(this.selectedItemType)){
                    this.valueTypes[6].ticked = true;
                }
                else if(item.conditionValueType[0].value == 'Max' && this.isItemTypeSortable(this.selectedItemType)){
                    this.valueTypes[7].ticked = true;
                }
                else{
                    item.conditionValueType = [];
                }
            }
        }
    }

    this.initConstructIfNeeded = function(template, item, question){
        this.constructSourcesEnabled = true;
        this.constructSources = [];

        if(question.questionType == 'SimpleChoice' ||
            question.questionType == 'Matrix' ||
            question.questionType == 'SharedNumeric' ||
            question.questionType == 'FreeText' ||
            question.questionType == 'ScrollbarQuestion' ||
            this.isSpecialQuestionWithSelect(question)
            ){
            this.constructSources.push({value:"Rows", name:"Sorok nevei"});
        }
        if(question.questionType == 'Matrix' ||
            question.questionType == 'FreeText'
            ){
            this.constructSources.push({value:"Columns", name:"Oszlopok nevei"});
        }
        if (!(question.questionType == 'SimpleChoice' ||
            question.questionType == 'Matrix' ||
            this.isSpecialQuestionWithSelect(question)
            )) {
            this.constructSources.push({value:"Values", name:"Válaszok"});
        }
        if(item.constructSource != null && item.constructSource.length != 0){
            for(var i = 0; i < this.constructSources.length; i++){
                if(this.constructSources[i].value == item.constructSource[0].value){
                    this.constructSources[i].ticked = true;
                }
            }
        }
    }

    this.initTargetTypes = function(template, item, question){
        this.targetTypes = [];
        if(this.conditionType == 'Construct'){
            var text = question.questionType == 'GroupQuestion' ? "Csoportosítandó elemeket" : "Sorokat";
            this.targetTypes.push({value:"ConstructRows", name: text + " bővíti"});
            this.targetTypes.push({value:"DeconstructRows", name: text + " szűkíti"});

            if(item.type != null && item.type.length != 0){
                if(item.type[0].value == 'ConstructRows'){
                    this.targetTypes[0].ticked = true;
                }
                else if(item.type[0].value == 'DeconstructRows'){
                    this.targetTypes[1].ticked = true;
                }
            }
            if(question.questionType == 'Matrix' ||
                question.questionType == 'GroupQuestion' ||
                question.questionType == 'FreeText'
                ){
                var text = question.questionType == 'GroupQuestion' ? "Csoportokat" : "Oszlopokat";
                this.targetTypes.push({value:"ConstructColumns", name: text + " bővíti"});
                this.targetTypes.push({value:"DeconstructColumns", name: text + " szűkíti"});

                if(item.type != null && item.type.length != 0){
                    if(item.type[0].value == 'ConstructColumns'){
                        this.targetTypes[2].ticked = true;
                    }
                    else if(item.type[0].value == 'DeconstructColumns'){
                        this.targetTypes[3].ticked = true;
                    }
                }
            }
        }
        else{
            this.targetTypes.push({value:"Show", name:"Megjelenít"});
            this.targetTypes.push({value:"Hide", name:"Elrejt"});

            if(item.type != null && item.type.length != 0){
                if(item.type[0].value == 'Show'){
                    this.targetTypes[0].ticked = true;
                }
                else if(item.type[0].value == 'Hide'){
                    this.targetTypes[1].ticked = true;
                }
            }
        }
    }

    this.isSpecialQuestionWithSelect = function(question){
        return question.questionType == 'SpecialQuestion' &&
            (question.itemType == 'RadioButtonColumn' ||
                question.itemType == 'Gender' ||
                question.itemType == 'CityType' ||
                question.itemType == 'County' ||
                question.itemType == 'Region' ||
                question.itemType == 'City'
                );
    }

    this.setDimensionSelectionType = function(question) {
        if(question.questionType == 'SimpleChoice' ||
            this.isSpecialQuestionWithSelect(question)){
            this.dimensionSelectionMode = 'single';
        }
        else{
            this.dimensionSelectionMode = 'multiple';
        }
    }

    this.isSimpleTextValue = function(){
        return this.selectedItemType != 'TextTime' && this.selectedItemType != 'TextDate';
    }

    this.isItemTypeSortable = function(itemType) {
        return !QuestioApp.Util.isEqual(itemType, "TextEmail");
    }
};