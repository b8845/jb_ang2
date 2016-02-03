/**
 * Kérdések tesztelésével kapcsolatos feltételek hatásai
 */

QuestioApp.service('TestConditionTargetFunctions', ['TestUtilFunctions', 'TestViewFunctions', function(TestUtilFunctions, TestViewFunctions) {

    this.updateConditionTargetEffects = function (template) {
        this.initConditionEffects(template);
        this.applyNewConditionEffects(template);
        this.hideQueestionsWithInvisibleContent(template);
    }

    this.initConditionEffects = function (template) {
        var conditionTargetFunctions = this;
        angular.forEach(template.questions, function (question, index) {
            question.visible = true;
            conditionTargetFunctions.clearOutDatedConditionDimensionEffects(question.rowList);
            conditionTargetFunctions.clearOutDatedConditionDimensionEffects(question.columnList);
        });
    }

    this.clearOutDatedConditionDimensionEffects = function (dimensionList) {
        if(QuestioApp.Util.isInitialized(dimensionList)) {
            angular.forEach(dimensionList, function (dimension, index) {
                dimension.visible = true;
            });
        }
    }

    this.applyNewConditionEffects = function (template) {
        var conditionTargetFunctions = this;
        angular.forEach(template.conditions, function (condition, index) {
            if(QuestioApp.Util.isInitialized(condition.targets)) {
                angular.forEach(condition.targets, function (target, index) {
                    if(QuestioApp.Util.isDefined(target.questionId) && target.questionId != null){
                        var question = TestUtilFunctions.getQuestionById(template, target.questionId);
                        if(question != null){
                            if(condition.type == 'Jump' && question.visible != false){
                                conditionTargetFunctions.applyConditionEffectsOnElement(condition, target, question);
                            }
                            if(condition.type == 'Visibility'){
                                conditionTargetFunctions.applyVisibilityConditionEffects(condition, target, question);
                            }
                        }
                    }
                });
            }
        });
    }

    this.applyConditionEffectsOnElement = function (condition, target, element) {
        // XOR a^b
        element.visible = condition.fulfilled == (target.type == 'Show');
    }

    this.applyVisibilityConditionEffects = function (condition, target, question) {
        if(QuestioApp.Util.isInitialized(target.rowIds) && QuestioApp.Util.isInitialized(question.rowList)) {
            this.applyVisibilityConditionEffectsInDimensions(condition, target, question.rowList, target.rowIds);
        }
        if(QuestioApp.Util.isInitialized(target.columnIds) && QuestioApp.Util.isInitialized(question.columnList)) {
            this.applyVisibilityConditionEffectsInDimensions(condition, target, question.columnList, target.columnIds);
        }
        if(!QuestioApp.Util.isInitialized(question.rowList) && !QuestioApp.Util.isInitialized(question.columnList)){
            this.applyConditionEffectsOnElement(condition, target, question);
        }
    }

    this.applyVisibilityConditionEffectsInDimensions = function (condition, target, dimensionList, idList) {
        var conditionTargetFunctions = this;
        angular.forEach(dimensionList, function (dimension, index) {
            if(QuestioApp.Util.isDefined(dimension) && dimension != null && dimension.visible != false &&
                QuestioApp.Util.isDefined(dimension.id) && dimension.id != null && idList.indexOf(dimension.id) > -1){
                conditionTargetFunctions.applyConditionEffectsOnElement(condition, target, dimension);
            }
        });
    }

    this.hideQueestionsWithInvisibleContent = function(template){
        var conditionTargetFunctions = this;
        angular.forEach(template.questions, function (question, index) {
            if(QuestioApp.Util.isEqual(question.visible, true)){
                question.visible = conditionTargetFunctions.isDimensionListEmptyOrHasVisibleDimension(question.rowList) &&
                    conditionTargetFunctions.isDimensionListEmptyOrHasVisibleDimension(question.columnList);
            }
        });
    }

    this.isDimensionListEmptyOrHasVisibleDimension = function (dimensionList) {
        if(!QuestioApp.Util.isInitialized(dimensionList)){
            return true;
        }
        for(var i = 0; i < dimensionList.length; i++){
            if(QuestioApp.Util.isEqual(dimensionList[i].visible, true)){
                return true;
            }
        }
        return false;
    }
}]);