
QuestioApp.service('TestValidationFunctions', [ 'MessageFunctions', 'TestUtilFunctions', function(MessageFunctions, TestUtilFunctions){

    this.currentQuestionRequirementsFulfilled = function(template){
        var question = TestUtilFunctions.getActiveQuestion(template);
        if(QuestioApp.Util.isDefinedAndNotNull(question) && QuestioApp.Util.isEqual(question.required, true)){
            if(QuestioApp.Util.isEqual(question.questionType, 'SimpleChoice')){
                return this.simpleChoiceRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'Matrix')){
                return this.matrixRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'FreeText')){
                return this.freeTextRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'SharedNumeric')){
                return this.sharedNumericRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'GroupQuestion')){
                return this.groupQuestionRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'ScrollbarQuestion')){
                return this.scrollbarQuestionRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'Comment')){
                return this.commentQuestionRequirementsFulfilled(question);
            }
            else if(QuestioApp.Util.isEqual(question.questionType, 'SpecialQuestion')){
                return this.specialQuestionRequirementsFulfilled(question);
            }
        }
        return true;
    }

    this.simpleChoiceRequirementsFulfilled = function(question){
        if(QuestioApp.Util.isDefined(question.answerMap[0][0]) && question.answerMap[0][0].toString().trim() != ''){
            return true;
        }
        if(QuestioApp.Util.isEqual(question.itemType, "ComboBox")) {
            MessageFunctions.showSingleMessageById("simpleChoiceRequired", null, "alert");
        }
        else if(QuestioApp.Util.isEqual(question.itemType, "RadioButtonColumn")) {
            MessageFunctions.showSingleMessageById("singleAnswerRequired", null, "alert");
        }
        return false;
    }

    this.matrixRequirementsFulfilled = function(question){
        if(QuestioApp.Util.isEqual(question.itemType, "CheckBox")){
            return true;
        }
        else if(QuestioApp.Util.isEqual(question.itemType, "RadioButtonRow")){
            for(var i = 0; i < question.rowList.length; i++){
                if(!QuestioApp.Util.isEqual(question.rowList[i].visible, false) &&
                    (!QuestioApp.Util.isEqual(question.rowList[i].otherDimension, true) || QuestioApp.Util.hasValue(question.otherDimensionTitles[i]))){
                    var found = false;
                    for(var j = 0; j < question.columnList.length; j++){
                        if(!QuestioApp.Util.isEqual(question.columnList[j].visible, false) &&
                            QuestioApp.Util.isEqual(question.answerMap[i][j], true)){
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        MessageFunctions.showSingleMessageById("radioButtonRowRequired", null, "alert");
                        return false;
                    }
                }
            }
            return true;
        }
        else if(QuestioApp.Util.isEqual(question.itemType, "RadioButtonColumn")){
            for(var i = 0; i < question.columnList.length; i++){
                if(!QuestioApp.Util.isEqual(question.columnList[i].visible, false)){
                    var found = false;
                    for(var j = 0; j < question.rowList.length; j++){
                        if(!QuestioApp.Util.isEqual(question.rowList[j].visible, false) &&
                            QuestioApp.Util.isEqual(question.answerMap[j][i], true)){
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        MessageFunctions.showSingleMessageById("radioButtonColumnRequired", null, "alert");
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    this.freeTextRequirementsFulfilled = function(question){
        var found = false;
        var hasMinMax = QuestioApp.Util.hasValue(question.minIntValue) || QuestioApp.Util.hasValue(question.maxIntValue);
        for(var i = 0; i < question.rowList.length; i++){
            if(!QuestioApp.Util.isEqual(question.rowList[i].visible, false) &&
                (!QuestioApp.Util.isEqual(question.rowList[i].otherDimension, true) || QuestioApp.Util.hasValue(question.otherDimensionTitles[i]))){
                for(var j = 0; j < question.columnList.length; j++){
                    var length = QuestioApp.Util.hasValue(question.answerMap[i][j]) ? question.answerMap[i][j].length : 0;
                    found = length != 0 ? true : found;
                    if(QuestioApp.Util.hasValue(question.minIntValue) && length < question.minIntValue){
                        MessageFunctions.showCustomMessageByType("Minden mezőben minimálisan " + question.minIntValue + " karakter megadása kötelező!", null, "alert");
                        return false;
                    }
                    if(QuestioApp.Util.hasValue(question.maxIntValue) && length > question.maxIntValue){
                        MessageFunctions.showCustomMessageByType("Minden mezőben maximálisan " + question.maxIntValue + " karaktert lehet írni!", null, "alert");
                        return false;
                    }
                }
            }
        }
        if(!found){
            MessageFunctions.showSingleMessageById("minOneAnswerRequired", null, "alert");
            return false;
        }
        return true;
    }

    this.sharedNumericRequirementsFulfilled = function(question) {
        for(var i = 0; i < question.rowList.length; i++) {
            if (!QuestioApp.Util.isEqual(question.rowList[i].visible, false) &&
                (!QuestioApp.Util.isEqual(question.rowList[i].otherDimension, true) || QuestioApp.Util.hasValue(question.otherDimensionTitles[i])) &&
                QuestioApp.Util.hasValue(question.answerMap[i][0]) &&
                question.answerMap[i][0] > 0
                ) {
                return true;
            }
        }
        MessageFunctions.showSingleMessageById("minOneNotNullRequired", null, "alert");
        return false;
    }

    this.groupQuestionRequirementsFulfilled = function(question) {
        for(var i = 0; i < question.columnList.length; i++) {
            if (!QuestioApp.Util.isEqual(question.columnList[i].visible, false) &&
                QuestioApp.Util.hasValue(question.answerMap[0][i])
                ) {
                return true;
            }
        }
        MessageFunctions.showSingleMessageById("minOneGroupRequired", null, "alert");
        return false;
    }

    this.scrollbarQuestionRequirementsFulfilled = function(question) {
        if (QuestioApp.Util.isEqual(question.userEventHappened, true)){
            return true;
        }
        MessageFunctions.showSingleMessageById("scrollBarEventRequired", null, "alert");
        return false;
    }

    this.commentQuestionRequirementsFulfilled = function(question) {
        if (QuestioApp.Util.hasValue(question.answerMap[0][0])){
            return true;
        }
        MessageFunctions.showSingleMessageById("minOneCharRequired", null, "alert");
        return false;
    }

    this.specialQuestionRequirementsFulfilled = function(question) {
        if (QuestioApp.Util.hasValue(question.answerMap[0][0])){
            return true;
        }
        MessageFunctions.showSingleMessageById("questionRequired", null, "alert");
        return false;
    }

}]);