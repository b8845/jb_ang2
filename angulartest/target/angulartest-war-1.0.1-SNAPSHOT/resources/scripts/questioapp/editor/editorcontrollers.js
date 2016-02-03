var editorControllers = angular.module('editorControllers', []);


editorControllers.controller('EditorController', ['$scope', '$location', '$routeParams', 'QuestionnaireTemplateService',
    'TerminationService', 'DataTablesService', 'MatrixFunctions',
    'QuestionFunctions', 'ConditionFunctions', 'ConditionGenerationFunctions', 'MessageFunctions', 'MultimediaFunctions'
    ,function ($scope, $location, $routeParams, QuestionnaireTemplateService, TerminationService, DataTablesService,
               MatrixFunctions, QuestionFunctions, ConditionFunctions, ConditionGenerationFunctions,
               MessageFunctions, MultimediaFunctions) {

    /**
     * Services
     */
    $scope.questionFunctions = QuestionFunctions;
    $scope.matrixFunctions = MatrixFunctions;
    $scope.conditionFunctions = ConditionFunctions;
    $scope.conditionGenerationFunctions = ConditionGenerationFunctions;
    $scope.messageFunctions = MessageFunctions;
    $scope.multimediaFunctions = MultimediaFunctions;

    $scope.template = {};
    $scope.terminations = null;

    $scope.usermode = '';

    if (QuestionnaireTemplateService) {
        QuestionnaireTemplateService.get({templateId : QuestioApp.UrlUtil.getUrlParameterValue('id')}).$promise.then(function(data) {
            $(".hide-questio-editor-wrapper").addClass("display-none");
            $scope.templateHelper = new TemplateViewHelper();
            $scope.ngPerformanceHelper = new NgPerformanceHelper();
            $scope.conditionGenerationFunctions.clearGeneratedData(data);
            $scope.initForTemplate(data);
            $scope.initTerminations();
            $scope.setUserMode();
        }, function(error) {
            switch(error.status){
                case 403:
                    // forbidden
                    break;
                case 404:
                    // not found
                    break;
            }
            if(error.data.length > 0) {
                $(".hide-questio-editor-wrapper").html(error.data.join("<br>"));
            }
        });
    }

    $scope.save = function () {
        if(!$scope.templateHelper.saveProcessActive) {
            $scope.templateHelper.saveProcessActive = true;

            $scope.messageFunctions.toggleSaveScreen(true);
            $scope.saveStateBeforeSave();

//            var payload = jQuery.extend(true, {}, $scope.template);
            $scope.templateHelper.terminationHelper.updateTerminationsInTemplate($scope.template);
            $scope.templateHelper.initQuotasForSave($scope.template);

            var saveDTO = new QuestionnaireTemplateSaveDTO();
            saveDTO.template = $scope.template;
            saveDTO.template.buildConditionDirty = true;
            saveDTO.deletedMediaIdList = $scope.templateHelper.deletedMediaIdList;
            var payload = JSON.parse(JSON.stringify(saveDTO));

            $scope.conditionFunctions.initTemplateForSave(payload.template);
            QuestionnaireTemplateService.save(payload).$promise.then(function (data) {
                $scope.initForTemplate(data);
                $scope.initTerminations();
                $scope.restoreStateAfterSave();
                $scope.messageFunctions.toggleSaveScreen(false);
                $scope.messageFunctions.showSaveSuccess($scope.templateHelper);
                $scope.messageFunctions.hideServerResponseMessages();
                $scope.templateHelper.deletedMediaIdList = [];

            }, function (error) {
                $scope.messageFunctions.toggleSaveScreen(false);
                $scope.messageFunctions.showSaveFailed($scope.templateHelper);

                if(!Array.isArray(error.data)){
                    $scope.messageFunctions.showSingleMessageById('exceptionBySave', null, 'alert');
                }
                else if (error.data.length != 0) {
                    var messages = [];
                    for (var i = 0; i < error.data.length; i++) {
                        messages.push(error.data[i]);
                    }
                    $scope.messageFunctions.showServerValidationMessages(messages);
                    var i = 0;
                    for (i = 0; i < $scope.template.questions.length && !$scope.template.questions[i].viewHelper.openedForEdit; ++i);
                    if ($scope.template.questions[i].viewHelper.openedForEdit) {
                        $scope.template.questions[i].viewHelper.toggleSettingsPanel('errordialog');
                    }
                }
            });
        }
    };

    $scope.initForTemplate = function (data) {
        if(QuestioApp.Util.isInitialized(data.questions)) {
            angular.forEach(data.questions, function (value, index) {
                value.viewHelper = new QuestionViewHelper();
                value.viewHelper.openedForEdit = index == 0;
                value.viewHelper.itemTypes = $scope.questionFunctions.getItemTypesForQuestion(value.questionType);
                value.localizedType = $scope.questionFunctions.getHungarianQuestionType(value.questionType);
                if(value.viewHelper.openedForEdit && value.questionType == 'SpecialQuestion'){
                    $scope.initDataTables();
                }
            });
        }
        $scope.conditionFunctions.initTemplateForView(data);
        $scope.multimediaFunctions.initTemplateForView(data);
        $scope.templateHelper.initQuotaHelpers(data);
        $scope.template = data;

        $scope.questionFunctions.orderQuestions($scope.template);
        $scope.templateHelper.focusedQuestion = -1;
    };

    $scope.initTerminations = function () {
        if($scope.terminations == null){
            if (TerminationService) {
                TerminationService.get().$promise.then(function(data) {
                    $scope.templateHelper.terminationHelper = new TerminationHelper();
                    $scope.terminations = data.terminations;
                    $scope.templateHelper.terminationHelper.initTerminations($scope.template, data.terminations);
                }, function(error) {
                    // error handler
                });
            }
        }
        else{
            $scope.templateHelper.terminationHelper = new TerminationHelper();
            $scope.templateHelper.terminationHelper.initTerminations($scope.template, $scope.terminations);
        }
    };

    $scope.initDataTables = function (questionType) {
        if($scope.templateHelper.dataTablesHelper == null
            && (!QuestioApp.Util.isDefined(questionType) ||
                (QuestioApp.Util.isDefinedAndNotNull(questionType) && questionType == 'SpecialQuestion'))){
            if (DataTablesService) {
                $scope.messageFunctions.toggleLoadScreen(true);
                DataTablesService.get().$promise.then(function(data) {
                    $scope.templateHelper.dataTablesHelper = new DataTablesHelper();
                    $scope.templateHelper.dataTablesHelper.cityTypes = data.cityTypes;
                    $scope.templateHelper.dataTablesHelper.counties = data.counties;
                    $scope.templateHelper.dataTablesHelper.regions = data.regions;
                    $scope.templateHelper.dataTablesHelper.cities = data.cities;
                    $scope.messageFunctions.toggleLoadScreen(false);
                }, function(error) {
                    $scope.messageFunctions.toggleLoadScreen(false);
                    $scope.messageFunctions.showSingleMessageById('dataTablesNotFound', null, 'alert');
                });
            }
        }
    };

    $scope.saveStateBeforeSave = function () {
        if(QuestioApp.Util.isInitialized($scope.template.questions)) {
            angular.forEach($scope.template.questions, function (value, index) {
                if(value.viewHelper.openedForEdit == true){
                    $scope.openedQuestionIndex = index;
                    return;
                }
            });
        }
    };

    $scope.restoreStateAfterSave = function () {
        if(QuestioApp.Util.isDefined($scope.openedQuestionIndex) && QuestioApp.Util.isInitialized($scope.template.questions)
            && $scope.openedQuestionIndex < $scope.template.questions.length){
            $scope.questionFunctions.openQuestionForEdit($scope.ngPerformanceHelper, $scope.template, $scope.openedQuestionIndex);
        }
    };

    $scope.setUserMode = function () {
        $scope.usermode = 'admin';
        if(QuestioApp.UrlUtil.isPartOfPath("/researcher/")){
            $scope.usermode = 'researcher';
        }
    };
}]);