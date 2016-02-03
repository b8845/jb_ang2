QuestioApp.service('ModalFunctions', ['$uibModal', function($uibModal) {

    this.createDeleteDialog = function (resultCallBack, resultCallBackParams, dialogText, dialogHeader) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/Questio/resources/composite/ngdeletedialogmodal.xhtml',
            controller: 'EditorModalController',
            resolve: {
                dialogText: function () {
                    return dialogText;
                },
                dialogHeader: function () {
                    return dialogHeader;
                }
            }
        });

        modalInstance.result.then(function () {
            resultCallBack(resultCallBackParams);
        }, function () {});
    }
}]);