/**
 * Kérdésekkel kapcsolatos segédfunkciók
 */

QuestioApp.service('QuestionFunctions', function(MatrixFunctions, ConditionFunctions, MessageFunctions, ModalFunctions, TemplateListService, QuestionListService){

    this.square = function(a) { return MathService.multiply(a,a); };
    this.cube = function(a) { return MathService.multiply(a, MathService.multiply(a,a)); };

    this.resetQuestionIndexes = function(template,questionIndex){
        $.each(template.questions, function( index, value ) {
            value.index = index;
        });
    };

    this.deleteQuestionButtonClicked = function(template, templateHelper, event){
        var callBackParams = {
            template: template,
            templateHelper: templateHelper,
            event: event,
            questionFunctions: this,
            ConditionFunctions: ConditionFunctions,
            MessageFunctions: MessageFunctions
        };
        ModalFunctions.createDeleteDialog(this.deleteQuestionCallBack, callBackParams,  "Biztos, hogy törölni szeretné a kérdést?");
    }

    this.deleteQuestionCallBack = function(callBackParams){
        if(QuestioApp.Util.isDefinedAndNotNull(callBackParams) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.template) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.templateHelper) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.event) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.questionFunctions) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.ConditionFunctions) &&
            QuestioApp.Util.isDefinedAndNotNull(callBackParams.MessageFunctions)) {

            var template = callBackParams.template;
            var templateHelper = callBackParams.templateHelper;
            var event = callBackParams.event;
            var questionFunctions = callBackParams.questionFunctions;
            var ConditionFunctions = callBackParams.ConditionFunctions;
            var MessageFunctions = callBackParams.MessageFunctions;

            var questions = template.questions;
            var activeQuestionIndex = questionFunctions.getActiveQuestionIndex(template);
            var hoveredQuestionIndex = templateHelper.getLastHoveredQuestion();
            if (ConditionFunctions.questionHasConditionOrQuota(template, hoveredQuestionIndex, activeQuestionIndex, true)) {
                MessageFunctions.showSingleMessageById('deleteQuestionPreventedByCondition', null, 'alert');
            }
            else if (ConditionFunctions.questionHasConditionOrQuota(template, hoveredQuestionIndex, activeQuestionIndex, false)) {
                MessageFunctions.showSingleMessageById('deleteQuestionPreventedByQuota', null, 'alert');
            }
            else {
                questions.splice(hoveredQuestionIndex, 1);
                questionFunctions.resetQuestionIndexes(template, hoveredQuestionIndex);
                //if(template.questions.length > hoveredQuestionIndex){
                //    template.questions[hoveredQuestionIndex].viewHelper.headerTabFocused = true;
                //}
                if (activeQuestionIndex == hoveredQuestionIndex && template.questions.length != 0) {
                    questions[0].viewHelper.openedForEdit = true;
                    questions[0].viewHelper.settingsPanelOpened = false;
                }
                if (hoveredQuestionIndex == template.questions.length) {
                    templateHelper.hideSettingsButtonWrapper(event);
                }
            }
        }
    };

    this.moveQuestionLeft = function(template,questionIndex){
        if(questionIndex != 0) {
            //template.questions[questionIndex].viewHelper.headerTabFocused = false;
            //template.questions[questionIndex-1].viewHelper.headerTabFocused = true;
            template.questions[questionIndex].index = questionIndex - 1;
            template.questions[questionIndex-1].index = questionIndex;
            var question = template.questions[questionIndex];
            template.questions.splice(questionIndex, 1);
            template.questions.splice(questionIndex - 1, 0, question);
        }
    };

    this.moveQuestionRight = function(template,questionIndex){
        if(questionIndex != template.questions.length - 1) {
            //template.questions[questionIndex].viewHelper.headerTabFocused = false;
            //template.questions[questionIndex+1].viewHelper.headerTabFocused = true;
            template.questions[questionIndex].index = questionIndex + 1;
            template.questions[questionIndex+1].index = questionIndex;
            var question = template.questions[questionIndex];
            template.questions.splice(questionIndex, 1);
            template.questions.splice(questionIndex + 1, 0, question);
        }
    };

    this.openQuestionForEdit = function(ngPerformanceHelper, template,index, newQuestion, initDataTables){
        ngPerformanceHelper.reinitLimits();
        angular.forEach(template.questions, function(value, key) {
            if(newQuestion){
                value.viewHelper.openedForEdit = false;
                if(value.index > index){
                    value.index += 1;
                }
            }
            else {
                value.viewHelper.openedForEdit = value.index == index;
                if(value.index == index &&
                    value.questionType == 'SpecialQuestion' &&
                    QuestioApp.Util.isDefinedAndNotNull(initDataTables)){

                    initDataTables();
                }
            }
            value.viewHelper.settingsPanelOpened = false;
        });
        if(newQuestion){
            var newQuestionTemplate = new QuestionEditorDTO();
            newQuestionTemplate.index = index + 1;
            newQuestionTemplate.letter = newQuestionTemplate.index + 1;
            newQuestionTemplate.viewHelper = new QuestionViewHelper();
            newQuestionTemplate.localizedType = "Új kérdés"
            newQuestionTemplate.viewHelper.openedForEdit = true;

            template.questions.push(newQuestionTemplate);
            this.orderQuestions(template);
        }
    };

    this.setQuestionType = function(template,index, newType){
        var newDto = new QuestionEditorDTO;
        newDto.id = QuestioApp.Util.generateId(template.questions);
        newDto.viewHelper = new QuestionViewHelper();
        newDto.viewHelper.openedForEdit = true;
        newDto.questionType = newType;
        newDto.index = index;
        newDto.letter = index + 1;
        newDto.viewHelper.itemTypes = this.getItemTypesForQuestion(newType);
        newDto.localizedType = this.getHungarianQuestionType(newType);
        template.questions.splice(index, 1, newDto);

        /**
         * Kérdéstípusok szerkesztőinek default tartalma
         */
        if(newType == 'Matrix'){
            MatrixFunctions.addRow(template, index);
            MatrixFunctions.addRow(template,index);
            MatrixFunctions.addColumn(template,index);
            MatrixFunctions.addColumn(template,index);
            template.questions[index].itemType = "CheckBox";
        }
        if(newType == 'SimpleChoice'){
            MatrixFunctions.addRow(template,index);
            template.questions[index].itemType = "RadioButtonColumn";
        }
        if(newType == 'SharedNumeric'){
            MatrixFunctions.addRow(template,index);
            template.questions[index].maxIntValue = 0;
            template.questions[index].itemType = "Number";
        }
        if(newType == 'FreeText'){
            MatrixFunctions.addRow(template,index);
            MatrixFunctions.addColumn(template,index);
            template.questions[index].itemType = "TextBox";
        }
        if(newType == 'OrderQuestion'){
            MatrixFunctions.addRow(template,index);
            template.questions[index].itemType = null;
        }
        if(newType == 'GroupQuestion'){
            MatrixFunctions.addColumn(template,index,null,null);
            MatrixFunctions.addRow(template,index,null,null);
            template.questions[index].itemType = null;
        }
        if(newType == 'ScrollbarQuestion'){
            MatrixFunctions.addRow(template,index);
            template.questions[index].maxIntValue = 0;
            template.questions[index].itemType = "ScrollBar";
        }
        if(newType == 'Comment'){
            template.questions[index].itemType = "TextBox";
        }
        if(newType == 'SpecialQuestion'){
            template.questions[index].itemType = "TextDate";
        }
        initTimeTools();
    };

    this.orderQuestions = function(template){
        template.questions.sort(function (a, b) {
            return a.index - b.index;
        });
    };

    this.getItemTypesForQuestion = function(questionType){
        var array = [];
        if(questionType == 'SimpleChoice'){
            array.push({value:"RadioButtonColumn", name:"Egyválasztós(oszlop)"});
            array.push({value:"ComboBox", name:"Legördülős választó"});
        }
        if(questionType == 'Matrix'){
            array.push({value:"CheckBox", name:"Többválasztós"});
            array.push({value:"RadioButtonRow", name:"Egyválasztós(sor)"});
            array.push({value:"RadioButtonColumn", name:"Egyválasztós(oszlop)"});
        }
        if(questionType == 'SharedNumeric'){
            array.push({value:"Number", name:"Szám"});
        }
        if(questionType == 'FreeText'){
            array.push({value:"TextBox", name:"Szöveg"});
            array.push({value:"Number", name:"Szám"});
            array.push({value:"TextBoxWithoutNumber", name:"Szöveg számok nélkül"});
        }
        if(questionType == 'OrderQuestion'){
            return null;
        }
        if(questionType == 'GroupQuestion'){
            return null;
        }
        if(questionType == 'ScrollbarQuestion'){
            array.push({value:"ScrollBar", name:"Csúszka"});
        }
        if(questionType == 'Comment'){
            array.push({value:"TextBox", name:"Szöveg"});
        }
        if(questionType == 'SpecialQuestion'){
            array.push({value:"TextDate", name:"Dátum"});
            array.push({value:"TextYear", name:"Év"});
            array.push({value:"TextTime", name:"Időpont"});
            array.push({value:"TextEmail", name:"Email"});
            array.push({value:"TextZip", name:"Irányítószám"});
            array.push({value:"RadioButtonColumn", name:"Korcsoport"});
            array.push({value:"Gender", name:"Nem"});
            array.push({value:"CityType", name:"Várostípus(adattábla)"});
            array.push({value:"City", name:"Város(adattábla)"});
            array.push({value:"County", name:"Megye(adattábla)"});
            array.push({value:"Region", name:"Régió(adattábla)"});
        }
        return array;
    };

    this.getArray = function(cnt){
        return new Array(cnt);
    };

    this.getHungarianQuestionType= function(questionType){
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
    };

    this.initCloneQuestionHelper = function(template, question){
        question.cloneQuestionHelper = new CloneQuestionHelper();
        question.cloneQuestionHelper.initQuestions(template);
        this.loadTemplateList(template, question);
    }

    this.templateSelectedForQuestionImport = function(template, question){
        if(QuestioApp.Util.isInitialized(question.cloneQuestionHelper.selectedTemplate) && question.cloneQuestionHelper.selectedTemplate.length == 1 &&
            QuestioApp.Util.isNumber(question.cloneQuestionHelper.selectedTemplate[0].id)){
            this.loadQuestionList(question.cloneQuestionHelper.selectedTemplate[0].id, question);
        }
        else{
            question.cloneQuestionHelper.reinitQuestionList();
        }
    }

    this.dimensionAdditionAllowed = function(question){
        return question.questionType != null && question.questionType != "Comment" && (question.questionType != 'SpecialQuestion' || question.itemType == 'RadioButtonColumn');
    }

    this.initDimensionAdditionHelper = function(question){
        question.dimensionAdditionHelper = new DimensionAdditionHelper();
        question.dimensionAdditionHelper.initDimensions(question);
    }

    this.addMoreDimensions = function(question){
        var result = question.dimensionAdditionHelper.addDimensions(question);
        if(result != null){
            MessageFunctions.showSingleMessageById(result,null,'alert');
        }
        else{
            question.viewHelper.settingsPanelOpened = false;
        }
    }

    this.getActiveQuestionIndex = function(template){
        var i;
        var questions = template.questions;
        var length = questions.length;
        for(i = 0; i < length && !questions[i].viewHelper.openedForEdit; ++i);
        if(i == length){
            return null;
        }
        return i;
    }

    this.itemTypeChanged = function(templateHelper, question){

        MatrixFunctions.resetCheckBoxes(question);

        if(question.questionType == 'SpecialQuestion'){
            question.rows = [];
            if(question.itemType == 'Gender'){
                var maleRow = new ItemDimensionEditorDTO();
                maleRow.id = 0;
                maleRow.index = 0;
                maleRow.valueID = "1";
                maleRow.title = "Férfi";
                question.rows.push(maleRow);

                var femaleRow = new ItemDimensionEditorDTO();
                femaleRow.id = 1;
                femaleRow.index = 1;
                femaleRow.valueID = "2";
                femaleRow.title = "Nő";
                question.rows.push(femaleRow);
            }
            else if( templateHelper.dataTablesHelper != null &&
                (question.itemType == 'CityType' ||
                question.itemType == 'County' ||
                question.itemType == 'Region' ||
                question.itemType == 'City')
                ){
                question.rows = templateHelper.dataTablesHelper.initDimensionsForDataTable(question.itemType);
            }
            else{
                initTimeTools();
            }
        }
    }

    this.loadTemplateList = function(template, question){
        if (TemplateListService) {
            TemplateListService.get().$promise.then(function(data) {
                if(QuestioApp.Util.isDefinedAndNotNull(data)){
                    question.cloneQuestionHelper.initTemplates(template, data);
                }
                else{
                    return null;
                }
            }, function(error) {
                return null;
            });
        }
    }

    this.loadQuestionList = function(templateId, question){
        if (QuestionListService) {
            QuestionListService.get({templateId : templateId}).$promise.then(function(data) {
                if(QuestioApp.Util.isInitialized(data)){
                    question.cloneQuestionHelper.initImportQuestions(data);
                }
                else{
                    return null;
                }
            }, function(error) {
                return null;
            });
        }
    }
});