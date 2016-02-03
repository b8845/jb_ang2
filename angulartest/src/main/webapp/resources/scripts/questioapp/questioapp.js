
QuestioApp = angular.module('QuestioApp', ['ngRoute', 'ngSanitize' , 'ui.bootstrap', 'isteven-multi-select', 'ui.sortable', 'editorControllers', 'testControllers', 'services']);

QuestioApp.config(['$routeProvider','$locationProvider',
    function($routeProvider, $locationProvider) {
        // angular belső navigációja, Breadcrumb számára láthatatlan (jelenleg nem használjuk)
        QuestioApp.initAngularBasedNavigation($routeProvider);
        // jsf-es navigációval előhívott angular kezdőoldalak, Breadcrumb számára látható
        QuestioApp.initDefaultPathBasedNavigation($routeProvider);
    }
]);


QuestioApp.Constants = {
    NOT_ALLOWED_SELECTION : [ "", ".", "!", "?", ":", "," ],
    baseUrl : _contextPath,
    placeholder: '#'
};

QuestioApp.run(function() {
    initTimeTools();
});

QuestioApp.initAngularBasedNavigation = function($routeProvider) {
    // minta angular-os navigációhoz
//    $routeProvider.when('/edit', {
//            templateUrl: _contextPath+'/resources/composite/questionnairetemplateeditorcomposite.xhtml',
//            controller: 'EditorController'
//    });
};

QuestioApp.initDefaultPathBasedNavigation = function($routeProvider) {
    $routeProvider.otherwise(QuestioApp.getDefaultPageByPath());
};

QuestioApp.getDefaultPageByPath = function() {
    if(QuestioApp.UrlUtil.isPartOfPath('questionnairetemplateeditor')) {
        return {
            templateUrl: _contextPath + '/resources/composite/questionnairetemplateeditorcomposite.xhtml',
            controller: 'EditorController'
        }
    }
    else if(QuestioApp.UrlUtil.isPartOfPath('questionnairetemplatetest')) {
        return {
            templateUrl: _contextPath+'/resources/composite/questiotest/questionnairetemplatetestcomposite.xhtml',
            controller: 'TestController',
            reloadOnSearch: false
        }
    }
    else if(QuestioApp.UrlUtil.isPartOfPath('phoneinterview')) {
        return {
            templateUrl: _contextPath+'/resources/composite/questiotest/questionnairetemplatetestcomposite.xhtml',
            controller: 'TestController',
            reloadOnSearch: false
        }
    }
    return {};
};

$(document).ready(function() {
    if($('.ng-app-wrapper').length){
        angular.bootstrap(document, ['QuestioApp']);
    }
});

angular.module('ui.bootstrap').controller('QuestioDatepickerController', function ($scope) {
    $scope.open = function($event) {
        $scope.status.opened = true;
    };

    $scope.status = {
        opened: false
    };
});

angular.module('ui.bootstrap').controller('QuestionIdDialog', function ($scope, $uibModal) {
    $scope.open = function (template, question) {
        if (question.cloneQuestionHelper.selectedQuestion.length != 1) {
            return;
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'idDialogTemplate.html',
            controller: 'ModalInstanceCtrl'
        });

        modalInstance.result.then(function (letter) {
            question.cloneQuestionHelper.cloneSelectedQuestion(template, question, letter)
        });
    };

});

angular.module('ui.bootstrap').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
    $scope.letter = "";
    $scope.showErrorMessage = false;

    $scope.ok = function () {
        if ($scope.letter.length > 0) {
            $uibModalInstance.close($scope.letter);
        } else {
            $scope.showErrorMessage = true;
        }
    };
});