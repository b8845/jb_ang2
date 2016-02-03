
editorControllers.controller('EditorModalController', [ '$scope', '$uibModalInstance', 'dialogText', 'dialogHeader',
    function ($scope, $uibModalInstance, dialogText, dialogHeader) {

    $scope.dialogText = QuestioApp.Util.isInitialized(dialogText) ? dialogText : '';

    $scope.dialogHeader = QuestioApp.Util.isInitialized(dialogHeader) ? dialogHeader : '';

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
