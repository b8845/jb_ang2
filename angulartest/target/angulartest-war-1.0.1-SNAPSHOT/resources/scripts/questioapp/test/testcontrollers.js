var testControllers = angular.module('testControllers', []);


testControllers.controller('TestController',
    ['$scope', '$location', '$rootScope', 'QuestionnaireTestService', 'PhoneInterviewService', 'PhoneInterviewDeleteService',
        'TestQuestionFunctions', 'TestViewFunctions', 'MessageFunctions', 'TestUtilFunctions',
        'TestConditionFunctions', 'TestQuotaFunctions', 'TestConditionTargetFunctions', "TestAnswerFunctions", "TestValidationFunctions"
    ,function ($scope, $location, $rootScope, QuestionnaireTestService, PhoneInterviewService, PhoneInterviewDeleteService,
               TestQuestionFunctions, TestViewFunctions,MessageFunctions, TestUtilFunctions,
               TestConditionFunctions, TestQuotaFunctions, TestConditionTargetFunctions, TestAnswerFunctions, TestValidationFunctions) {

    /**
     * Services
     */
    $scope.questionFunctions = TestQuestionFunctions;
    $scope.viewFunctions = TestViewFunctions;
    $scope.messageFunctions = MessageFunctions;
    $scope.utilFunctions = TestUtilFunctions;
    $scope.answerFunctions = TestAnswerFunctions;
    $scope.quotaFunctions = TestQuotaFunctions;
    $scope.validationFunctions = TestValidationFunctions;

    $scope.tableHelper = new TableHelper();
    $scope.progressBarHelper = new ProgressBarHelper();

    $scope.templateId = QuestioApp.UrlUtil.getUrlParameterValue('id');
    $scope.questionnaireId = QuestioApp.UrlUtil.getUrlParameterValue('questionnaireId');

    $scope.selectedTermination = [];
    $scope.saveProcessActive = false;

    $scope.quotaCounters = null;

    $scope.lastSaveTime = null;

    $scope.templateState = '';

    $scope.templateHelper = new TemplateViewHelper();

    $scope.util = QuestioApp.Util;

    $scope.personalData = {};

    $scope.mediaPath = _contextPath + "/rest/editorrestservice/persistedmedia/";

    if(!QuestioApp.Util.isDefinedAndNotNull($scope.questionnaireId)){
        $scope.questionnaireId = -1;
    }

    $scope.test = true;
    if(QuestioApp.UrlUtil.isPartOfPath("questionnairetemplatetest")){
        $scope.mainService = QuestionnaireTestService;
    }
    else if(QuestioApp.UrlUtil.isPartOfPath("phoneinterview")){
        $scope.test = false;
        $scope.mainService = PhoneInterviewService;
    }

    if ($scope.mainService) {
        $scope.mainService.get({templateId : $scope.templateId, questionnaireId : $scope.questionnaireId}).$promise.then(function(data) {
            if($scope.checkNumberOfQuestionnaireInstancesExceed(data)){
                return;
            }
            $scope.reInitWithTestDto(data);
            if(!$scope.test){
                TestQuotaFunctions.initCounters($scope);
            }
        }, function(error) {
            if(QuestioApp.Util.isDefinedAndNotNull(error.data) && error.data.length == 1){
                $scope.messageFunctions.showServerValidationMessages(error.data);
            }
        });
    }

    $scope.initForQuestionnaire = function (data) {
        var questionnaire = JSON.parse(JSON.stringify(data));
        if (QuestioApp.Util.isDefinedAndNotNull(questionnaire.id)) {
            $scope.updateQuestionnaireId({questionnaireId: questionnaire.id});
        }
        $scope.template = questionnaire.questionnaireTemplateData;
        if (QuestioApp.Util.isDefinedAndNotNull(questionnaire.questionnaireTermination)) {
            $scope.selectedTermination[0] = questionnaire.questionnaireTermination;
        }
        $scope.initPersonalData(questionnaire);
        $scope.template.test = $scope.test;
        $scope.initTemplateState();
        $scope.questionFunctions.initQuestionsForTest($scope.template);
        $scope.answerFunctions.loadPersistedAnswersIntoAnswerMaps($scope.template, data.answers);
        $scope.questionFunctions.rotateQuestions($scope.template);
        TestConditionTargetFunctions.initConditionEffects($scope.template);
        TestConditionFunctions.updateConditionEffects($scope.template);
        $scope.questionFunctions.initActiveQuestion($scope.template);
        $scope.progressBarHelper.refreshState($scope.template);
    }

    $scope.getNextQuestion = function () {
        if(TestValidationFunctions.currentQuestionRequirementsFulfilled($scope.template)) {
            $scope.persistState();
            var noMoreQuestion = $scope.questionFunctions.getNextQuestion($scope.template);
            if (noMoreQuestion) {
                $scope.template.finished = true;
            }
            $scope.progressBarHelper.refreshState($scope.template);
            if (!TestQuestionFunctions.isSelectedTerminationValid($scope.quotaCounters, $scope.template, $scope.selectedTermination)) {
                $scope.selectedTermination.splice(0, 1);
            }
        }
    }

    $scope.getLastQuestion = function () {
        $scope.persistState();
        $scope.questionFunctions.getLastQuestion($scope.template);
        $scope.progressBarHelper.refreshState($scope.template);
    }

    $scope.getPrologue = function () {
        $scope.persistState();
        $scope.template.notStarted = true;
        $scope.template.finished = false;
    }


    $scope.getEpilogue = function () {
        $scope.persistState();
        if(!TestQuestionFunctions.isSelectedTerminationValid($scope.quotaCounters, $scope.template, $scope.selectedTermination)){
            $scope.selectedTermination.splice(0,1);
        }
        $scope.template.finished = true;
        $scope.template.notStarted = false;
    }

    $scope.persistState = function () {
        $scope.questionFunctions.setHasAnswerForActualQuestion($scope.template);
        if(!$scope.test){
            TestQuotaFunctions.updateFulfulledStates($scope.template, $scope.quotaCounters);
        }
        $scope.saveQuestionnaire(true);
        if(!TestUtilFunctions.isTerminationEmpty($scope) && $scope.selectedTermination[0].terminationType != 'QuotaExceeded' && TestQuotaFunctions.hasExceededCounter($scope.quotaCounters)){
            $scope.selectedTermination[0] = TestQuotaFunctions.getQuotaExceededTermination($scope.template.terminations);
        }
    }

    $scope.saveQuestionnaire = function (automaticSave) {

        var saveDTO = $scope.answerFunctions.getSaveDTO(
            $scope.template,
            $scope.questionnaireId,
            $scope.templateId,
            $scope.lastSaveTime);

        saveDTO.nameOfRespondent = $scope.personalData.nameOfRespondent;
        saveDTO.phoneOfRespondent = $scope.personalData.phoneOfRespondent;

        if(!automaticSave){
            saveDTO.termination = JSON.parse($scope.selectedTermination[0]);
            saveDTO.phoneDenied = $scope.templateHelper.phoneDenied;
        }
        if(QuestioApp.Util.isInitialized($scope.quotaCounters) && !automaticSave){
            TestQuotaFunctions.prepareSaveDTO($scope, saveDTO);
        }
        $scope.saveAnswers(saveDTO, automaticSave);
    }

    $scope.saveButtonClicked = function(){
        if ($scope.saveProcessActive != true) {
            if(TestUtilFunctions.isTerminationEmpty($scope)){
                $scope.messageFunctions.showSingleMessageById("terminationRequired", null, "alert");
                return;
            }
            $scope.saveQuestionnaire(false);
        }
    }

    $scope.deleteQuestionnaire = function () {
        if(!$scope.test){
            var deleteDTO = TestQuotaFunctions.prepareDeleteDTO($scope);
            PhoneInterviewDeleteService.delete(deleteDTO).$promise.then(function(data) {
                $scope.reinitScopeData();
                if($scope.checkNumberOfQuestionnaireInstancesExceed(data)){
                    return;
                }
                $scope.reInitWithTestDto(data);
                TestQuotaFunctions.initCounters($scope);
            }, function(error) {
                $scope.messageFunctions.showServerValidationMessages(error.data);
            });
        }
        else{
            $scope.mainService.delete({templateId: $scope.templateId, questionnaireId: $scope.questionnaireId}).$promise.then(function (data) {
                $scope.reinitScopeData();
                $scope.reInitWithTestDto(data);
            }, function (error) {
                if (error.data.length == 1) {
                    $scope.messageFunctions.showServerValidationMessages(error.data);
                }
            });
        }
    }

    $scope.reinitScopeData = function () {
        $scope.templateId = QuestioApp.UrlUtil.getUrlParameterValue('id');
        $scope.questionnaireId = -1;
        $location.search('questionnaireId', null);

        $scope.selectedTermination = [];
        $scope.saveProcessActive = false;
    }

    $scope.startFirstQuestion = function () {
        if(!QuestioApp.Util.isDefinedAndNotNull($scope.template.questions[0].visited) || $scope.template.questions[0].visited == false) {
            $scope.template.questions[0].active = true;
        }
        $scope.template.notStarted = false;
        $scope.template.finished = false;
        $scope.progressBarHelper.refreshState($scope.template);
    }

    $scope.questionTabClicked = function (question) {
        if(!QuestioApp.Util.isDefinedAndNotNull(question.visible) || question.visible == true) {
            $scope.template.notStarted = false;
            $scope.template.finished = false;
            if (!QuestioApp.Util.isDefinedAndNotNull(question.active) || question.active == false) {
                for(var i = 0; i < $scope.template.questions.length; i++){
                    $scope.template.questions[i].active = i == question.index;
                    $scope.template.questions[i].visited = i < question.index;
                }
            }
        }
    }

    $scope.hideEpilogue = function(){
        $scope.template.finished = false;
        var activeQuestion = TestUtilFunctions.getActiveQuestion($scope.template);
        if(!QuestioApp.Util.isDefinedAndNotNull(activeQuestion)){
            TestUtilFunctions.activateLastVisibleQuestion($scope.template);
        }
    }

    $scope.isQuestionBodyVisible = function (question) {
        if(QuestioApp.Util.isDefinedAndNotNull(question.active) && question.active == true){
            return !QuestioApp.Util.isEqual($scope.template.notStarted, true) && !QuestioApp.Util.isEqual($scope.template.finished, true);
        }
    }

    $scope.saveAnswers = function (saveDTO, automaticSave) {
        if (!automaticSave) {
            $scope.messageFunctions.toggleSaveScreen(true);
            $scope.saveProcessActive = true
        }
        var saveDTO = JSON.parse(JSON.stringify(saveDTO));
        $scope.mainService.save(saveDTO).$promise.then(function(data) {
            $scope.updateLastSaveTime(data);
            if (!automaticSave) {
                $scope.messageFunctions.toggleSaveScreen(false);
                $scope.messageFunctions.showSaveSuccess($scope);
                $scope.reinitScopeData();
                if($scope.checkNumberOfQuestionnaireInstancesExceed(data)){
                    return;
                }
                $scope.reInitWithTestDto(data);
                if (!$scope.test) {
                    TestQuotaFunctions.initCounters($scope);
                }
            }
            else{
                $scope.updateQuestionnaireId(data);
                TestQuotaFunctions.updateCounterAfterSave($scope, data.quotas);
            }
        }, function(error) {
            $scope.messageFunctions.toggleSaveScreen(false);
            $scope.messageFunctions.showSaveFailed($scope);
            $scope.saveProcessActive = false;
            if (QuestioApp.Util.isDefinedAndNotNull(error.data) && QuestioApp.Util.isDefinedAndNotNull(error.data.questionnaire) &&
                QuestioApp.Util.isDefinedAndNotNull(error.data.errorType)) {
                if(error.data.errorType == 'QuotaExceed'){
                    TestQuotaFunctions.initCounters($scope);
                    TestQuotaFunctions.updateCounterAfterSave($scope, error.data.questionnaire.questionnaireTemplateData.quotas);
                    MessageFunctions.showSingleMessageById("terminationNotAllowedByQuotaExceed", null, "alert");
                }
                else{
                    $scope.reinitScopeData();
                    $scope.reInitWithTestDto(error.data);
                    TestQuotaFunctions.initCounters($scope);
                    if(error.data.errorType == 'NotFound') {
                        MessageFunctions.showSingleMessageById("questionnaireNotFoundBySave", null, "alert");
                    }
                    else if(error.data.errorType == 'Terminated'){
                        MessageFunctions.showSingleMessageById("questionnaireAlreadyTerminated", null, "alert");
                    }
                }
            }
            else {
                if (!automaticSave) {
                    $scope.messageFunctions.toggleSaveScreen(false);
                    $scope.messageFunctions.showSaveFailed($scope);
                }
                var messages = [];
                messages.push("Mentés sikertelen!");
                if (error.data.length != 0) {
                    for (var i = 0; i < error.data.length; i++) {
                        messages.push(error.data[i]);
                    }
                }
                $scope.messageFunctions.showServerValidationMessages(messages);
            }
        });
    }

    $scope.updateQuestionnaireId = function (saveDTO) {
        if((!QuestioApp.Util.hasValue($scope.questionnaireId) || $scope.questionnaireId == -1)
            && QuestioApp.Util.hasValue(saveDTO.questionnaireId)){
            $location.search('questionnaireId', saveDTO.questionnaireId);
            $scope.questionnaireId = saveDTO.questionnaireId;
        }
    }

    $scope.reInitWithTestDto = function(testDTO){
        $scope.initForQuestionnaire(testDTO.questionnaire);
        $scope.lastSaveTime = testDTO.lastSaveTime;
    }

    $scope.updateLastSaveTime = function(testDTO){
        if(QuestioApp.Util.isDefinedAndNotNull(testDTO) && QuestioApp.Util.isDefinedAndNotNull(testDTO.lastSaveTime)){
            $scope.lastSaveTime = testDTO.lastSaveTime;
        }
    }

    $scope.$on('ngTableRenderFinished', function(ngRenderFinishedEvent) {
        $scope.tableHelper.initTables();
    });

    $scope.$on('timePickerRendered', function(ngRenderFinishedEvent) {
        initTimeTools();
    });

    $scope.initTemplateState = function(){
        $scope.templateState = '';
        if(QuestioApp.UrlUtil.isPartOfPath("/researcher/")){
            $scope.templateState += 'researcher';
        }
        if(QuestioApp.Util.isEqual($scope.test, true)){
            if(QuestioApp.Util.isDefinedAndNotNull($scope.template) &&
                QuestioApp.Util.isDefinedAndNotNull($scope.template.questionnaireTemplate) &&
                (
                    QuestioApp.Util.isEqual($scope.template.questionnaireTemplate.questionnaireTemplateState, 'Published') ||
                    QuestioApp.Util.isEqual($scope.template.questionnaireTemplate.questionnaireTemplateState, 'Archived')
                    )
                ){
                $scope.templateState += 'publishedTest';
            }
            else{
                $scope.templateState += 'test';
            }
        }
        else{
            $scope.templateState = 'phoneInterview';
        }
    }

    $scope.checkNumberOfQuestionnaireInstancesExceed = function(questionnaireTestDTO){
        if(QuestioApp.Util.isEqual(questionnaireTestDTO.errorType, 'NumberOfQuestionnaireInstancesExceed')){
            $scope.numberOfQuestionnaireInstancesExceed = true;
            $scope.templateState = 'phoneInterview';
            return true;
        }
        return false;
    }

    $scope.initPersonalData = function(questionnaire){
        $scope.personalData = {};
        $scope.personalData.nameOfRespondent = '';
        $scope.personalData.phoneOfRespondent = '';
        if (QuestioApp.Util.isDefinedAndNotNull(questionnaire.nameOfRespondent)) {
            $scope.personalData.nameOfRespondent = questionnaire.nameOfRespondent;
        }
        if (QuestioApp.Util.isDefinedAndNotNull(questionnaire.phoneOfRespondent)) {
            $scope.personalData.phoneOfRespondent = questionnaire.phoneOfRespondent;
        }
    }

    $scope.testasd = 2;

    $scope.testEvent = function () {
        // TODO test
        var asd = 0;
    }
}]);