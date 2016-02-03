/**
 * Kérdések tesztelésével kapcsolatos segédfunkciók
 */

QuestioApp.service('TestQuestionFunctions', [ 'TestViewFunctions', 'TestConditionFunctions', 'TestUtilFunctions', 'TestQuotaFunctions',

    function(TestViewFunctions, TestConditionFunctions, TestUtilFunctions, TestQuotaFunctions){

    this.initQuestionsForTest = function(template){
        var questionFunctions = this;
        if(QuestioApp.Util.isInitialized(template.questions)){
            angular.forEach(template.questions, function (value, index) {
                questionFunctions.initQuestionsDimensionLists(value);
                questionFunctions.initQuestionsAnswers(value);
                questionFunctions.setLocalizedTexts(value);
            });
        }
    };

    this.initActiveQuestion = function(template){
        var indexOfActive = 0;
        for(var i = 0; i < template.questions.length; i++){
            if((!QuestioApp.Util.isDefined(template.questions[i].visible) || template.questions[i].visible == true) &&
                QuestioApp.Util.isEqual(template.questions[i].hasAnswer, true)
                && this.hasQuestionVisibleFields(template.questions[i])){
                indexOfActive = i;
            }
        }
        if(indexOfActive != 0){
            template.questions[indexOfActive].active = true;
            template.notStarted = false;
            template.finished = false;
        }
        else{
            template.notStarted = true;
        }
        this.setVisitedStates(template);
    };

    this.setVisitedStates = function(template){
        var hasActive = false;
        for(var i = template.questions.length -1; i > -1; i--) {
            if (hasActive) {
                template.questions[i].visited = true;
            }
            else {
                template.questions[i].visited = false;
                if (template.questions[i].active == true) {
                    hasActive = true;
                }
            }
        }
    }

    this.initQuestionsDimensionLists = function(question){
        var questionFunctions = this;
        question.rowList = null;
        question.columnList = null;
        if(QuestioApp.Util.isInitialized(question.rows)) {
            question.rowList = questionFunctions.getOrderedDimensionList(question.rows);
            question.otherDimensionTitles = new Array(question.rowList.length);
            //TODO teszt
//            angular.forEach(question.rowList, function (value, index) {
//                if(index % 2 != 0) {
//                    value.visible = false;
//                }
//            });
        }
        if(QuestioApp.Util.isInitialized(question.columns)) {
            question.columnList = questionFunctions.getOrderedDimensionList(question.columns);
        }
    };

    this.getOrderedDimensionList = function(dimensionList){
        var rotatedList = dimensionList.filter(function(value){return value.rotated});
        var fixedList = dimensionList.filter(function(value){return !value.rotated});
        rotatedList = QuestioApp.Util.shuffleArray(rotatedList);
        fixedList.sort(function(a, b){return a.index - b.index});
        var dimensionList = rotatedList;
        angular.forEach(fixedList, function (value, index) {
            if(value.index < dimensionList.length) {
                dimensionList.splice(value.index, 0, value);
            }
            else{
                dimensionList.push(value);
            }
        });
        return dimensionList;
    };

    this.initQuestionsAnswers = function(question){
        var rowCnt = 1;
        var columnCnt = 1;

        if(QuestioApp.Util.isInitialized(question.rowList)) {
            rowCnt = question.rowList.length;
        }
        if(QuestioApp.Util.isInitialized(question.columnList)) {
            columnCnt = question.columnList.length;
        }
        question.answerMap = QuestioApp.Util.create2dArray(rowCnt, columnCnt);
        this.initDefaultAnswerValues(question);
    };

    this.initDefaultAnswerValues = function(question){
        if(QuestioApp.Util.isEqual(question.questionType,'ScrollbarQuestion') ||
            QuestioApp.Util.isEqual(question.questionType,'SharedNumeric')){
            for(var i = 0; i < question.answerMap.length; i++){
                question.answerMap[i][0] = 0;
            }
        }
        else if(QuestioApp.Util.isEqual(question.questionType,'SpecialQuestion') &&
            QuestioApp.Util.isEqual(question.itemType,'TextTime')){
                question.answerMap[0][0] = '08:00';
        }
    }

    this.setLocalizedTexts = function(question){
        question.localozedType = QuestioApp.Util.getHungarianQuestionType(question.questionType);
        question.localozedItemType = QuestioApp.Util.getHungarianItemType(question.itemType);
    }

    this.validateSharedNumericAnswers = function(question, index){
        var cnt = 0;
        var otherCnt = 0;
        for(var i = 0; i < question.answerMap.length; i++){
            if(QuestioApp.Util.isDefined(question.answerMap[i][0]) && QuestioApp.Util.isNumber(question.answerMap[i][0])){
                cnt += parseFloat(question.answerMap[i][0]);
                if(i != index){
                    otherCnt += parseFloat(question.answerMap[i][0]);
                }
            }
        }
        if(cnt > question.maxIntValue &&
            QuestioApp.Util.isDefined(question.answerMap[index][0]) &&
            QuestioApp.Util.isNumber(question.answerMap[index][0]) &&
            parseFloat(question.answerMap[index][0]) > 0
            ){
                question.answerMap[index][0] = question.maxIntValue - otherCnt >= 0 ? question.maxIntValue - otherCnt : 0;
            //question.sharedNumericError = true;
        }
//        else{
//            question.sharedNumericError = false;
//        }
    }

    this.getArray = function(cnt){
        return new Array(cnt);
    };

    this.getYearArray = function(){
        var array = [];
        for(var i = 0; i < 150; i++){
            array.push(2050 - i);
        }
        return array;
    };

    this.isLastQuestionEditable = function(question, template){
        var ret = QuestioApp.Util.isDefined(question.active) && question.active == true && question.canStepBack == true;
        if(ret){
            var loopReturnVal = null;
            angular.forEach(template.questions, function (value, index) {
                if (loopReturnVal == null) {
                    if (!QuestioApp.Util.isDefined(value.visible) || value.visible == true) {
                        if (question.id != value.id) {
                            loopReturnVal = true;
                        }
                        else {
                            loopReturnVal = false;
                        }
                    }
                }
            });
            if(loopReturnVal != null){
                return loopReturnVal;
            }
        }
        return false;
    }

    this.getLastQuestion = function(template){
        TestUtilFunctions.saveTableOtherDimensionTexts(template);
        var lastQuestion = null;
        var keepGoing = true;
        angular.forEach(template.questions, function (value, index) {
            if (keepGoing && (!QuestioApp.Util.isDefined(value.visible) || value.visible == true)) {
                if (QuestioApp.Util.isDefined(value.active) && value.active == true && lastQuestion != null) {
                    value.active = false;
                    lastQuestion.active = true;
                    keepGoing = false;
                    // (egy lapra renderelt kérdéssor esetén)
                    // TestViewFunctions.scrollToElement('#anchor' + lastQuestion.id, 500);
                }
                else {
                    lastQuestion = value;
                }
            }
        });
        this.setVisitedStates(template);
    }

    this.setHasAnswerForActualQuestion = function(template){
        angular.forEach(template.questions, function (value, index) {
            if (QuestioApp.Util.isDefined(value.active) && value.active == true) {
                value.hasAnswer = true;
            }
        });
    }

    this.getNextQuestion = function(template){
        TestUtilFunctions.saveTableOtherDimensionTexts(template);
        TestConditionFunctions.updateConditionEffects(template);
        var nextQuestion = false;
        var keepGoing = true;
        var lastActiveIndex = null;
        var noMoreQuestion = true;
        angular.forEach(template.questions, function (value, index) {
            if (keepGoing) {
                if (nextQuestion  && (!QuestioApp.Util.isDefined(value.visible) || value.visible == true)) {
                    value.active = true;
                    noMoreQuestion = false;
                    keepGoing = false;
                    // (egy lapra renderelt kérdéssor esetén)
                    //TestViewFunctions.gotoAnchor(value.id);
                    //TestViewFunctions.changeQuestionInputStates(value.id, false);
                    //TestViewFunctions.scrollToElement('#anchor' + value.id, 500);
                }
                else if (QuestioApp.Util.isDefined(value.active) && value.active == true) {
                    nextQuestion = true;
                    lastActiveIndex = index;
                    // (egy lapra renderelt kérdéssor esetén)
                    //TestViewFunctions.changeQuestionInputStates(value.id, true);
                }
            }
        });
        if(lastActiveIndex != null && noMoreQuestion == false){
            template.questions[lastActiveIndex].active = false;
        }
        this.setVisitedStates(template);
        return noMoreQuestion;
    }

    this.getQuestionById = function(template, questionId){
        if(QuestioApp.Util.isDefinedAndNotNull(template) && QuestioApp.Util.isDefinedAndNotNull(tempalte.questions) &&
            QuestioApp.Util.isDefinedAndNotNull(questionId)){
            for(var i = 0; i < tempalte.questions.length; i++ ){
                if(template.questions[i].id == questionId){
                    return template.questions[i];
                }
            }
        }
        return null;
    }

    this.hasQuestionInstructions = function(question){
        return QuestioApp.Util.isDefinedAndNotNull(question.questionTextForInterviewer) && question.questionTextForInterviewer.trim() != "";
    }

    this.rotateQuestions = function(template){
        var rotatedQuestions = [];
        var rotatedQuestionPlace = {rotatedQuestionPlace: true};
        for(var i = 0; i < template.questions.length; i++){
            if(template.questions[i].rotated == true){
                rotatedQuestions.push(template.questions[i]);
                template.questions.splice(i, 1, rotatedQuestionPlace);
            }
        }
        if(rotatedQuestions.length > 0){
            QuestioApp.Util.shuffleArray(rotatedQuestions);
            rotatedQuestions.sort(function(a, b){return b.hasAnswersAfterLoading - a.hasAnswersAfterLoading});
            var inserted = 0;
            for(var i = 0; i < template.questions.length; i++) {
                if (QuestioApp.Util.isDefinedAndNotNull(template.questions[i].rotatedQuestionPlace) &&
                    template.questions[i].rotatedQuestionPlace == true) {
                    template.questions.splice(i, 1, rotatedQuestions[inserted++]);
                }
            }
        }
    }

    // angular cannot handle two state radiobuttons -,-
    this.radioAnswerChecked = function(question){
        for(var i = 0; i < question.rowList.length; i++){
            for(var j = 0; j < question.columnList.length; j++){
                question.answerMap[i][j] = $(".radio-" + question.id + "-" + i + "-" + j).is(":checked");
            }
        }
    }

    this.hasQuestionVisibleFields = function(question){
        if(QuestioApp.Util.isInitialized(question.rowList)){
            if(!this.hasDimensionListVisibleElement(question.rowList)){
                return false;
            }
        }
        if(QuestioApp.Util.isInitialized(question.columnList)){
            if(!this.hasDimensionListVisibleElement(question.columnList)){
                return false;
            }
        }
        return true;
    }

    this.hasDimensionListVisibleElement = function(dimensionList){
        for(var i = 0; i < dimensionList.length; i++){
            if(!QuestioApp.Util.isDefined(dimensionList[i].visible) || dimensionList[i].visible == true){
                return true;
            }
        }
    }

    this.isTerminationAllowed = function(counters, termination, template){
        if(TestQuotaFunctions.hasExceededCounter(counters) != QuestioApp.Util.isEqual(termination.terminationType, 'QuotaExceeded') ||
            termination.terminationType == 'Successful' && !this.isLastQuestionActive(template)){
            return false;
        }
        return true;
    }

    this.getShortName = function(terminationName, length){
        if (terminationName.length > length) {
           return terminationName.substr(0,length-3)+"...";
        }
        return terminationName;
    }

    this.isLastQuestionActive = function(template){
        for(var i = template.questions.length - 1; i > -1; i--){
            if(QuestioApp.Util.isEqual(template.questions[i].active, true)){
                return true;
            }
            else if(!QuestioApp.Util.isEqual(template.questions[i].visible, false)){
                return false;
            }
        }
        return false;
    }

    this.isSelectedTerminationValid = function(counters, template, selectedTermination){
        if(QuestioApp.Util.isInitialized(selectedTermination) && QuestioApp.Util.isEqual(selectedTermination[0].terminationType, 'Successful')){
            return this.isLastQuestionActive(template);
        }
        else if(QuestioApp.Util.isInitialized(selectedTermination) && QuestioApp.Util.isEqual(selectedTermination[0].terminationType, 'QuotaExceeded')){
            return TestQuotaFunctions.hasExceededCounter(counters);
        }
        return true;
    }
}]);