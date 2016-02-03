/**
 * Válaszokkal kapcsolatos műveletek
 */

QuestioApp.service('TestAnswerFunctions', ['TestUtilFunctions',  function(TestUtilFunctions) {

    this.getSaveDTO = function(template, questionnaireId, templateId, lastSaveTime){
        var saveDTO = new QuestionnaireTestDTO;
        saveDTO.templateId = templateId;
        saveDTO.termination = null;
        saveDTO.lastSaveTime = lastSaveTime;

        if(QuestioApp.Util.hasValue(questionnaireId) && questionnaireId != -1){
            saveDTO.questionnaireId = questionnaireId;
        }

        this.fillQuestionAnswers(template, saveDTO);
        return saveDTO;
    }

    this.fillQuestionAnswers = function(template, saveDTO){
        for(var i = 0; i < template.questions.length; i++){
            if((!QuestioApp.Util.isDefined(template.questions[i].visible) || template.questions[i].visible == true) &&
                QuestioApp.Util.isEqual(template.questions[i].hasAnswer, true) ) {
                saveDTO.questionAnswers.push(this.getAnswersForQuestion(template.questions[i]));
            }
        }
    }

    this.getAnswersForQuestion = function(question){
        var questionAnswersDTO = new QuestionAnswersDTO();
        questionAnswersDTO.questionId = question.id;
        questionAnswersDTO.questionType = question.questionType;
        questionAnswersDTO.itemType = question.itemType;
        if(QuestioApp.Util.isInitialized(question.rowList)) {
            questionAnswersDTO.visibleRowIds = this.getVisibleDimensionIds(question.rowList);
        }
        if(QuestioApp.Util.isInitialized(question.columnList)) {
            questionAnswersDTO.visibleColumnIds = this.getVisibleDimensionIds(question.columnList);
        }
        questionAnswersDTO.notNullAnswers = this.getNotNullAnswersForQuestion(question);
        questionAnswersDTO.otherDimensionTexts = TestUtilFunctions.getOtherDimensionTexts(question);
        return questionAnswersDTO;
    }

    this.getVisibleDimensionIds = function(dimensionList){
        var ids = [];
        for(var i = 0; i < dimensionList.length; i++){
            if(!QuestioApp.Util.isDefined(dimensionList[i].visible) || dimensionList[i].visible == true){
                ids.push(dimensionList[i].id);
            }
        }
        return ids;
    }

    this.getNotNullAnswersForQuestion = function(question){
        if(question.questionType == "Matrix" || question.questionType == "FreeText" ){
            return this.getAnswersForMatrixTypeQuestion(question);
        }
        else if(question.questionType == "SimpleChoice" ||
            this.isSpecialQuestionWithSelect(question)){
            return this.getAnswersForSimpleChoiceQuestion(question);
        }
        else if(question.questionType == "SharedNumeric" || question.questionType == "ScrollbarQuestion"){
            return this.getAnswersForNumericTypeQuestion(question);
        }
        else if(question.questionType == "OrderQuestion"){
            return this.getAnswersForOrderTypeQuestion(question);
        }
        else if(question.questionType == "GroupQuestion"){
            return this.getAnswersForGroupTypeQuestion(question);
        }
        else if(question.questionType == "Comment" || question.questionType == 'SpecialQuestion'){
            return this.getAnswersForSingleTypeQuestion(question);
        }
    }

    this.getAnswersForMatrixTypeQuestion = function(question){
        var notNullAnswers = [];
        if(QuestioApp.Util.isInitialized(question.rowList) && QuestioApp.Util.isInitialized(question.columnList)){
            for(var i = 0; i < question.rowList.length; i++){
                if(!QuestioApp.Util.isDefined(question.rowList[i].visible) || question.rowList[i].visible == true){
                    for(var j = 0; j < question.columnList.length; j++){
                        if(!QuestioApp.Util.isDefined(question.columnList[j].visible) || question.columnList[j].visible == true
                            && QuestioApp.Util.isDefinedAndNotNull(question.answerMap[i][j]) &&
                            (
                                (question.questionType == "Matrix" && question.answerMap[i][j] == true) ||
                                (question.questionType == "FreeText" && question.answerMap[i][j].toString().trim() != "")
                            )){
                            var answer = new AnswersDTO;
                            answer.rowId = question.rowList[i].id;
                            answer.columnId = question.columnList[j].id;
                            answer.value = question.answerMap[i][j];
                            notNullAnswers.push(answer);
                        }
                    }
                }
            }
        }
        return notNullAnswers;
    }

    this.getAnswersForSimpleChoiceQuestion = function(question){
        var notNullAnswers = [];
        if(QuestioApp.Util.isDefined(question.answerMap[0][0]) && question.answerMap[0][0].toString().trim() != ''){
            var answer = new AnswersDTO;
            answer.rowId = question.answerMap[0][0];
            answer.value = "true";
            notNullAnswers.push(answer);
        }
        return notNullAnswers;
    }

    this.getAnswersForNumericTypeQuestion = function(question){
        var notNullAnswers = [];
        if(QuestioApp.Util.isInitialized(question.rowList)){
            for(var i = 0; i < question.rowList.length; i++){
                if(!QuestioApp.Util.isDefined(question.rowList[i].visible) || question.rowList[i].visible == true
                    && QuestioApp.Util.isDefinedAndNotNull(question.answerMap[i][0]) && question.answerMap[i][0].toString().trim() != ''){

                    var answer = new AnswersDTO;
                    answer.rowId = question.rowList[i].id;
                    answer.value = question.answerMap[i][0];
                    notNullAnswers.push(answer);
                }
            }
        }
        return notNullAnswers;
    }

    this.getAnswersForOrderTypeQuestion = function(question){
        var notNullAnswers = [];
        var cnt = 0;
        if(QuestioApp.Util.isInitialized(question.rowList)){
            for(var i = 0; i < question.rowList.length; i++){
                if(!QuestioApp.Util.isDefined(question.rowList[i].visible) || question.rowList[i].visible == true){
                    var answer = new AnswersDTO;
                    answer.rowId = question.rowList[i].id;
                    answer.value = cnt;
                    cnt++;
                    notNullAnswers.push(answer);
                }
            }
        }
        return notNullAnswers;
    }

    this.getAnswersForGroupTypeQuestion = function(question){
        var notNullAnswers = [];
        if(QuestioApp.Util.isInitialized(question.rowList) && QuestioApp.Util.isInitialized(question.columnList)){
            for(var i = 0; i < question.columnList.length; i++){
                if(!QuestioApp.Util.isDefined(question.columnList[i].visible) || question.columnList[i].visible == true
                    && QuestioApp.Util.isDefined(question.answerMap[0][i]) && question.answerMap[0][i].toString().trim() != ''){
                    var answer = new AnswersDTO;
                    answer.rowId = question.answerMap[0][i];
                    answer.columnId = question.columnList[i].id;
                    answer.value = "true";
                    notNullAnswers.push(answer);
                }
            }
        }
        return notNullAnswers;
    }

    this.getAnswersForSingleTypeQuestion = function(question){
        var notNullAnswers = [];
        var answerValue = '';
        if(QuestioApp.Util.isDefined(question.answerMap[0][0])) {
            if (question.itemType == 'TextDate') {
                answerValue = this.removeTimeZoneInformation(question.answerMap[0][0]);
            } else {
                answerValue = question.answerMap[0][0];
            }
        }
        var answer = new AnswersDTO;
        if(question.itemType == 'Gender'){
            answer.rowId = answerValue;
            answer.value = true;
        }
        else{
            answer.value = answerValue;
        }
        notNullAnswers.push(answer);
        return notNullAnswers;
    }

    this.loadPersistedAnswersIntoAnswerMaps = function(template, answers){
        if(QuestioApp.Util.isDefined(answers) && answers.length > 0){
            var questionAnswerMaps = this.initAnswerMaps(template);
            this.sortAnswersIntoAnswerMaps(questionAnswerMaps, answers);
            this.updateQuestionAnserMaps(questionAnswerMaps);
        }
    }

    this.initAnswerMaps = function(template){
        var questionAnswerMaps = [];
        for(var i = 0; i < template.questions.length; i++){
            var answerMap = new QuestionAnswersMappingDTO();
            answerMap.question = template.questions[i];
            questionAnswerMaps.push(answerMap);
        }
        return questionAnswerMaps;
    }

    this.sortAnswersIntoAnswerMaps = function(questionAnswerMaps, answers){
        for(var i = 0; i < answers.length; i++){
            for(var j = 0; j < questionAnswerMaps.length; j++){
                if(questionAnswerMaps[j].question.id == answers[i].questionId){
                    questionAnswerMaps[j].answers.push(answers[i]);
                    questionAnswerMaps[j].question.hasAnswer = true;
                    break;
                }
            }
        }
    }

    this.updateQuestionAnserMaps = function(questionAnswerMaps){
        for(var i = 0; i < questionAnswerMaps.length; i++){
            if(questionAnswerMaps[i].answers.length > 0) {
                questionAnswerMaps[i].question.hasAnswersAfterLoading = 1;
                if (questionAnswerMaps[i].question.questionType == "Matrix" || questionAnswerMaps[i].question.questionType == "FreeText") {
                    this.updateQuestionAnserMapsForMatrixTypeQuestion(questionAnswerMaps[i]);
                }
                else if (questionAnswerMaps[i].question.questionType == "SimpleChoice" ||
                    this.isSpecialQuestionWithSelect(questionAnswerMaps[i].question)) {
                    this.updateQuestionAnserMapsForSimpleChoiceQuestion(questionAnswerMaps[i]);
                }
                else if(questionAnswerMaps[i].question.questionType == "SharedNumeric" ||
                        questionAnswerMaps[i].question.questionType == "ScrollbarQuestion"){
                    this.updateQuestionAnserMapsForNumericTypeQuestion(questionAnswerMaps[i]);
                }
                else if(questionAnswerMaps[i].question.questionType == "OrderQuestion"){
                    this.updateQuestionAnserMapsForOrderTypeQuestion(questionAnswerMaps[i]);
                }
                else if(questionAnswerMaps[i].question.questionType == "GroupQuestion"){
                    this.updateQuestionAnserMapsForGroupTypeQuestion(questionAnswerMaps[i]);
                }
                else if(questionAnswerMaps[i].question.questionType == "Comment" ||
                        questionAnswerMaps[i].question.questionType == 'SpecialQuestion'){
                    this.updateQuestionAnserMapsForSingleTypeQuestion(questionAnswerMaps[i]);
                }
            }
            else{
                questionAnswerMaps[i].question.hasAnswersAfterLoading = 0;
            }
        }
    }

    this.updateQuestionAnserMapsForMatrixTypeQuestion = function(questionAnswerMap){
        for(var i = 0; i < questionAnswerMap.answers.length; i++){
            var rowIndex = TestUtilFunctions.getIndexOfElementInDimensionList(questionAnswerMap.question.rowList, questionAnswerMap.answers[i].rowId);
            var columnIndex = TestUtilFunctions.getIndexOfElementInDimensionList(questionAnswerMap.question.columnList, questionAnswerMap.answers[i].columnId);
            if(questionAnswerMap.question.questionType == "Matrix"){
                questionAnswerMap.question.answerMap[rowIndex][columnIndex] = questionAnswerMap.answers[i].bool;
            }
            else{
                if(QuestioApp.Util.isEqual(questionAnswerMap.question.itemType, 'Number')){
                    questionAnswerMap.question.answerMap[rowIndex][columnIndex] = questionAnswerMap.answers[i].number;
                }
                else{
                    questionAnswerMap.question.answerMap[rowIndex][columnIndex] = questionAnswerMap.answers[i].text;
                }
            }
            if(QuestioApp.Util.hasValue(questionAnswerMap.answers[i].otherDimensionTitle)){
                questionAnswerMap.question.otherDimensionTitles[rowIndex] = questionAnswerMap.answers[i].otherDimensionTitle;
            }
        }
    }

    this.updateQuestionAnserMapsForSimpleChoiceQuestion = function(questionAnswerMap){
        for(var i = 0; i < questionAnswerMap.answers.length; i++){
            if(questionAnswerMap.answers[i].bool == true){
                questionAnswerMap.question.answerMap[0][0] = questionAnswerMap.answers[i].rowId;
            }
        }
    }

    this.updateQuestionAnserMapsForOrderTypeQuestion = function(questionAnswerMap){
        for(var i = 0; i < questionAnswerMap.answers.length; i++){
            var rowIndex = TestUtilFunctions.getIndexOfElementInDimensionList(questionAnswerMap.question.rowList, questionAnswerMap.answers[i].rowId);
            if(rowIndex != null){
                questionAnswerMap.question.rowList[rowIndex].newIndex = questionAnswerMap.answers[i].number;
            }
        }
        questionAnswerMap.question.rowList.sort(this.compareRowsByNewIndexes);
    }

    this.updateQuestionAnserMapsForGroupTypeQuestion = function(questionAnswerMap){
        for(var i = 0; i < questionAnswerMap.answers.length; i++){
            if(questionAnswerMap.answers[i].bool == true) {
                var columnIndex = TestUtilFunctions.getIndexOfElementInDimensionList(questionAnswerMap.question.columnList, questionAnswerMap.answers[i].columnId);
                questionAnswerMap.question.answerMap[0][columnIndex] = questionAnswerMap.answers[i].rowId;
            }
        }
    }

    this.updateQuestionAnserMapsForNumericTypeQuestion = function(questionAnswerMap){
        for(var i = 0; i < questionAnswerMap.answers.length; i++){
            var rowIndex = TestUtilFunctions.getIndexOfElementInDimensionList(questionAnswerMap.question.rowList, questionAnswerMap.answers[i].rowId);
            if(rowIndex != null){
                questionAnswerMap.question.answerMap[rowIndex][0]  = questionAnswerMap.answers[i].number;
                if(QuestioApp.Util.hasValue(questionAnswerMap.answers[i].otherDimensionTitle)){
                    questionAnswerMap.question.otherDimensionTitles[rowIndex] = questionAnswerMap.answers[i].otherDimensionTitle;
                }
            }
        }
    }

    this.updateQuestionAnserMapsForSingleTypeQuestion = function(questionAnswerMap){
        if(questionAnswerMap.answers.length == 1){
            if(questionAnswerMap.question.itemType == 'TextYear'){
                questionAnswerMap.question.answerMap[0][0] = parseInt(questionAnswerMap.answers[0].text);
            }
            else if(questionAnswerMap.question.itemType == 'TextDate') {
                questionAnswerMap.question.answerMap[0][0] = this.removeTimeZoneInformation(questionAnswerMap.answers[0].text);
            }
            else {
                questionAnswerMap.question.answerMap[0][0] = questionAnswerMap.answers[0].text;
            }
        }
    }

    this.removeTimeZoneInformation = function(input)
    {
        if (input === 'undefined' || input === "") {
            return input;
        }

        // undo the timezone adjustment we did during the formatting
        input.setMinutes(input.getMinutes() - input.getTimezoneOffset());
        // we just want a local date in ISO format
        return input.toISOString().substring(0, 10);
    }
    
    this.compareRowsByNewIndexes = function (a, b) {
        if(QuestioApp.Util.isDefined(a.newIndex) && QuestioApp.Util.isDefined(b.newIndex)){
            return a.newIndex - b.newIndex;
        }
        else if (QuestioApp.Util.isDefined(a.newIndex)){
            return -1;
        }
        else if (QuestioApp.Util.isDefined(b.newIndex)){
            return 1;
        }
        return 0;
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