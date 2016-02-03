/**
 * Kérdések tesztelésével kapcsolatos feltételkezelés
 */

QuestioApp.service('TestConditionFunctions', ['TestUtilFunctions', 'TestViewFunctions', 'TestConditionTargetFunctions', 'TestAnswerFunctions',
    function(TestUtilFunctions, TestViewFunctions, TestConditionTargetFunctions, TestAnswerFunctions) {

    this.updateConditionEffects = function (template) {
        if(QuestioApp.Util.isInitialized(template.questions) && QuestioApp.Util.isInitialized(template.conditions)) {
            this.markConditionsWithFulfilledItems(template);
            TestConditionTargetFunctions.updateConditionTargetEffects(template);
        }
    }

    this.markConditionsWithFulfilledItems = function (template) {
        var conditionFunctions = this;
        var currentQuestion = TestUtilFunctions.getActiveQuestion(template);
        if(currentQuestion == null){
            currentQuestion = new QuestionEditorDTO();
            currentQuestion.index = template.questions.length;
        }
        var conditionFunctions = this;
        angular.forEach(template.conditions, function (value, index) {
            conditionFunctions.handleIfConstructOfOtherDimensionOrValue(template, value, currentQuestion);
            value.fulfilled = conditionFunctions.isConditionFulfilled(value, template, null);
        });
    };

    this.handleIfConstructOfOtherDimensionOrValue = function(template, condition, currentQuestion){
        if(QuestioApp.Util.isDefinedAndNotNull(condition.generated) && condition.generated == true){
            var constructedTitle = null;
            // Construct by value
            if(QuestioApp.Util.isInitialized(condition.parts) &&
                QuestioApp.Util.isDefinedAndNotNull(condition.parts[0].constructSource) &&
                condition.parts[0].constructSource == 'Values'){
                var itemQuestion = TestUtilFunctions.getQuestionById(template, condition.parts[0].questionId);
                var answers = TestAnswerFunctions.getNotNullAnswersForQuestion(itemQuestion);
                if(QuestioApp.Util.isInitialized(answers)){
                    for(var i = 0; i < answers.length; i++){
                        if((!QuestioApp.Util.isDefinedAndNotNull(answers[i].rowId) || answers[i].rowId == condition.parts[0].rowIds[0]) &&
                            (!QuestioApp.Util.isDefinedAndNotNull(answers[i].columnId) || answers[i].columnId == condition.parts[0].columnIds[0])){
                            constructedTitle = answers[i].value;
                            break;
                        }
                    }
                }
            }
            // Construct by otherDimension
            else {
                var itemQuestion = TestUtilFunctions.getQuestionById(template, condition.parts[0].questionId);
                if (QuestioApp.Util.isDefinedAndNotNull(itemQuestion) && itemQuestion.index <= currentQuestion.index) {
                    var row = TestUtilFunctions.getByIdFromList(itemQuestion.rowList, condition.parts[0].rowIds[0]);
                    if (QuestioApp.Util.isDefinedAndNotNull(row) && QuestioApp.Util.isDefinedAndNotNull(row.otherDimension) && row.otherDimension == true) {
                        var otherDimensionTexts = TestUtilFunctions.getOtherDimensionTexts(itemQuestion);
                        if (QuestioApp.Util.isInitialized(otherDimensionTexts)) {
                            for (var i = 0; i < otherDimensionTexts.length; i++) {
                                if (otherDimensionTexts[i].rowId == row.id) {
                                    constructedTitle = otherDimensionTexts[i].text;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // Construction
            if(constructedTitle != null && QuestioApp.Util.isInitialized(condition.targets)){
                for(var i = 0; i < condition.targets.length; i++) {
                    var targetQuestion = TestUtilFunctions.getQuestionById(template, condition.targets[i].questionId);
                    if (QuestioApp.Util.isInitialized(condition.targets[i].rowIds && condition.targets[i].rowIds.length == 1)) {
                        var rowIndex = TestUtilFunctions.getIndexOfElementInDimensionList(targetQuestion.rowList, condition.targets[i].rowIds[0]);
                        if (QuestioApp.Util.isDefinedAndNotNull(rowIndex)) {
                            targetQuestion.rowList[rowIndex].title = constructedTitle;
                        }
                    }
                    else if (QuestioApp.Util.isInitialized(condition.targets[i].columnIds && condition.targets[i].columnIds.length == 1)) {
                        var columnIndex = TestUtilFunctions.getIndexOfElementInDimensionList(targetQuestion.columnList, condition.targets[i].columnIds[0]);
                        if (QuestioApp.Util.isDefinedAndNotNull(columnIndex)) {
                            targetQuestion.columnList[columnIndex].title = constructedTitle;
                        }
                    }
                }
            }
        }
    }

    //
    //  Ha currentQuestion == null: globális kiértékelés, nem csak az aktuális kérdésig
    //
    this.isConditionFulfilled = function (condition, template, currentQuestion) {
        var conditionFunctions = this;
        if(QuestioApp.Util.isInitialized(condition.parts)){
            var conditionResult = false;
            for(var i = 0; i < condition.parts.length; i++){
                var partResult = this.isConditionPartFulfilled(condition.parts[i], template, currentQuestion, conditionFunctions);
                // null: még nem értük el az összes érintett kérdést
                if(partResult == null){
                    return false;
                }
                // Legkülső part-ok között vagy kapcsolat
                else if(partResult == true){
                    conditionResult = true;
                }
            }
            return conditionResult;
        }
        return false;
    }

    this.isConditionPartFulfilled = function (part, template, currentQuestion, conditionFunction) {
        if(part.type == 'AndGroup'){
            if(QuestioApp.Util.isInitialized(part.parts)){
                var partResult = true;
                for(var i = 0; i < part.parts.length; i++){
                    var childResult = conditionFunction.isConditionPartFulfilled(part.parts[i], template, currentQuestion, conditionFunction);
                    // null: még nem értük el az összes érintett kérdést
                    if(childResult == null){
                        return null;
                    }
                    if(!childResult){
                        partResult = false;
                    }
                }
                return partResult;
            }
            return false;
        }
        else if(part.type == 'Bracket'){
            if(QuestioApp.Util.isInitialized(part.parts)){
                var partResult = false;
                for(var i = 0; i < part.parts.length; i++){
                    var childResult = conditionFunction.isConditionPartFulfilled(part.parts[i], template, currentQuestion, conditionFunction);
                    // null: még nem értük el az összes érintett kérdést
                    if(childResult == null){
                        return null;
                    }
                    if(childResult == true){
                        partResult = true;
                    }
                }
                return partResult;
            }
            return false;
        }
        else if(part.type == 'Item'){
            var conditionQuestion = TestUtilFunctions.getQuestionById(template, part.questionId);
            if(conditionQuestion != null){
                //
                //  Ha currentQuestion == null: globális kiértékelés, nem csak az aktuális kérdésig
                //
                if(currentQuestion != null && conditionQuestion.index > currentQuestion.index){
                    return null;
                }
                else{
                    return conditionFunction.isConditionItemFulfilled(part, conditionQuestion);
                }
            }
        }
        return false;
    }

    this.isConditionItemFulfilled = function (item, question) {
        if(question.questionType == "SimpleChoice" || this.isSpecialQuestionWithSelect(question)){
            if(question.answerMap[0][0] == item.rowIds[0] && item.conditionValueType == "Selected" ||
                question.answerMap[0][0] != item.rowIds[0] && item.conditionValueType == "Unselected"){
                    return true;
            }
        }
        else if(question.questionType == "Matrix" || question.questionType == "FreeText"){
            if(QuestioApp.Util.isInitialized(item.rowIds) && QuestioApp.Util.isInitialized(item.columnIds) &&
                QuestioApp.Util.isInitialized(question.rowList) && QuestioApp.Util.isInitialized(question.columnList)){
                for(var i = 0; i < item.rowIds.length; i++){
                    for(var j = 0; j < item.columnIds.length; j++){
                        var result = this.getElementFromAnswerMap(item.rowIds[i], item.columnIds[j], question, null, null);
                        if(question.questionType == "Matrix" && !this.isCheckBoxConditionFulfilled(result, item.conditionValueType)){
                            return false;
                        }
                        else if(question.questionType == "FreeText" && !this.isValueConditionFulfilled(result, item.conditionValueType, item.value)){
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        else if(question.questionType == "SharedNumeric" || question.questionType == "ScrollbarQuestion"){
            if(QuestioApp.Util.isInitialized(item.rowIds) && QuestioApp.Util.isInitialized(question.rowList)){
                for(var i = 0; i < item.rowIds.length; i++){
                    var result = this.getElementFromAnswerMap(item.rowIds[i], null, question, null, 0);
                    if(!this.isValueConditionFulfilled(result, item.conditionValueType, item.value)){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(question.questionType == "Comment" || (question.questionType == "SpecialQuestion"
            && !this.isSpecialQuestionWithSelect(question))){

            var result = this.getElementFromAnswerMap(null, null, question, 0, 0);
            if(!this.isValueConditionFulfilled(result, item.conditionValueType, item.value)){
                return false;
            }
            return true;
        }
        return false;
    }

    this.getElementFromAnswerMap = function(rowId, columnId, question, rowIndex, columnIndex){
        if(rowIndex == null) {
            for (var i = 0; i < question.rowList.length; i++) {
                if (question.rowList[i].id == rowId) {
                    rowIndex = i;
                    break;
                }
            }
        }

        if(columnIndex == null) {
            for (var i = 0; i < question.columnList.length; i++) {
                if (question.columnList[i].id == columnId) {
                    columnIndex = i;
                    break;
                }
            }
        }

        if(rowIndex != null && columnIndex != null){
            return question.answerMap[rowIndex][columnIndex];
        }
        return null;
    }

    this.isCheckBoxConditionFulfilled = function(value, conditionValueType){
        return (!QuestioApp.Util.isDefined(value) || value == false || value == null) && conditionValueType == "Unselected" ||
            value == true && conditionValueType == "Selected";

    }

    this.isValueConditionFulfilled = function(value, conditionValueType, compareValue){
        if(QuestioApp.Util.isDefined(compareValue)){
            var val = QuestioApp.Util.isDefinedAndNotNull(value) ? value.toString().trim().toLowerCase() : "";
            var comp = QuestioApp.Util.isDefinedAndNotNull(compareValue) ? compareValue.toString().trim().toLowerCase() : "";
            if(conditionValueType == "Equal"){
                return val == comp;
            }
            else if(conditionValueType == "NotEqual" && val != null){
                return val == null || val != comp;
            }
            else if(conditionValueType == "Like" && val != null){
                return val.indexOf(comp) > -1;
            }
            else if(conditionValueType == "NotLike"){
                return val == null || val.indexOf(comp) == -1;
            }
            else if (val != null && comp != null){
                if((!isNaN(val) && !isNaN(comp)) || val.length == comp.length){
                    if(QuestioApp.Util.isNormalInteger(val) && QuestioApp.Util.isNormalInteger(comp)) {
                        val = parseInt(val);
                        comp = parseInt(comp);
                    }
                    if (conditionValueType == "Greater") {
                        return val > comp;
                    }
                    else if (conditionValueType == "Less") {
                        return val < comp;
                    }
                    else if (conditionValueType == "Min") {
                        return val >= comp;
                    }
                    else if (conditionValueType == "Max") {
                        return val <= comp;
                    }
                }
                else{
                    if (conditionValueType == "Greater" || conditionValueType == "Min") {
                        return val.length > comp.length;
                    }
                    else if (conditionValueType == "Less" || conditionValueType == "Max") {
                        return val.length < comp.length;
                    }
                }
            }
        }
        return false;
    }

    this.isSpecialQuestionWithSelect = function(question){
        return QuestioApp.Util.isDefinedAndNotNull(question) &&
            QuestioApp.Util.isEqual(question.questionType, "SpecialQuestion") &&
            (
                QuestioApp.Util.isEqual(question.itemType, "RadioButtonColumn") ||
                QuestioApp.Util.isEqual(question.itemType, "Gender") ||
                QuestioApp.Util.isEqual(question.itemType, "CityType") ||
                QuestioApp.Util.isEqual(question.itemType, "County") ||
                QuestioApp.Util.isEqual(question.itemType, "Region") ||
                QuestioApp.Util.isEqual(question.itemType, "City")
                );
    }
}]);