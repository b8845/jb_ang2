/**
 * Kérdések tesztelésével kapcsolatos feltételkezelés
 */

QuestioApp.service('TestUtilFunctions', function() {

    this.getActiveQuestion = function(template){
        for(var i = 0; i < template.questions.length; i++){
            if(QuestioApp.Util.isEqual(template.questions[i].active, true)){
                return template.questions[i];
            }
        };
        return null;
    }

    this.getLastAnsweredQuestion = function(template){
        for(var i = template.questions.length - 1; i > -1; i--){
            if(QuestioApp.Util.isEqual(template.questions[i].hasAnswer, true)){
                return template.questions[i];
            }
        };
        return null;
    }

    this.activateLastVisibleQuestion = function(template){
        for(var i = template.questions.length -1; i > -1; i--){
            if(!QuestioApp.Util.isDefined(template.questions[i].visible) || template.questions[i].visible == true){
                template.questions[i].active = true;
                break;
            }
        }
    }

    this.getQuestionById = function(template, id){
        for(var i = 0; i < template.questions.length; i++){
            if(template.questions[i].id == id){
                return template.questions[i];
            }
        };
        return null;
    }

    this.getByIdFromList = function(list, id){
        for(var i = 0; i < list.length; i++){
            if(list[i].id == id){
                return list[i];
            }
        };
        return null;
    }

    this.isConditionElementVisible = function(template, element){
        return (QuestioApp.Util.isDefined(template.test) && template.test == true) ||
            !QuestioApp.Util.isDefined(element.visible) || element.visible == true;
    }



    this.isNgRepeatConditionElementVisible = function (template) {
        var utilFunctions = this;
        return function (element) {
            return utilFunctions.isConditionElementVisible(template, element);
        };
    };



    this.saveTableOtherDimensionTexts = function(template){
        var question = this.getActiveQuestion(template);
        if( $('.other-dimesnion-test-input-' + question.id).length > 0 &&
            $('.question-test-wrapper-' + question.id).find('.fht-fixed-column').length > 0){
            $( '.other-dimesnion-test-input-' + question.id ).each(function( index ) {
                if($(this).parents('.fht-fixed-column').length > 0) {
                    question.otherDimensionTitles[$(this).data('rowindex')] = $(this).val();
                }
            });
        }
    }

    this.getOtherDimensionTexts = function(question){
        var otherDimensionTexts = [];
        if(QuestioApp.Util.isInitialized(question.rowList) && QuestioApp.Util.isInitialized(question.otherDimensionTitles)){
            for(var i = 0; i < question.rowList.length; i++){
                if(QuestioApp.Util.isDefinedAndNotNull(question.otherDimensionTitles[i])){
                    otherDimensionTexts.push(this.createOtherDimensionTextDTO(question.rowList[i].id, question.otherDimensionTitles[i]));
                }
            }
        }

        return otherDimensionTexts;
    }

    this.createOtherDimensionTextDTO = function(rowId, text){
        var otherDimensionTextDTO = new OtherDimensionTextDTO;
        otherDimensionTextDTO.rowId = rowId;
        otherDimensionTextDTO.text = text;
        return otherDimensionTextDTO;
    }

    this.getIndexOfElementInDimensionList = function(dimensionList, dimensionId){
        for(var i = 0; i < dimensionList.length; i++){
            if(dimensionList[i].id == dimensionId){
                return i;
            }
        }
        return null;
    }

    this.isTerminationSelected = function(scope){
        // ha van választott termináció, ne lehessen szerkeszteni
        return false;
//        return QuestioApp.Util.isInitialized(scope.selectedTermination) &&
//            QuestioApp.Util.isDefinedAndNotNull(scope.selectedTermination[0]);
    }

    this.isTerminationEmpty = function(scope){
        return !(QuestioApp.Util.isInitialized(scope.selectedTermination) &&
            QuestioApp.Util.isDefinedAndNotNull(scope.selectedTermination[0]));
    }

    this.matrixOtherFieldChanged = function(question, rowIndex){
        if(QuestioApp.Util.isInitialized(question.rowList) && question.rowList.length > rowIndex && QuestioApp.Util.isInitialized(question.columnList)) {
            var visibleColumnIndex = null;
            var visibleColumnCnt = 0;
            for(var i = 0; i < question.columnList.length; i++){
                if(!QuestioApp.Util.isDefinedAndNotNull(question.columnList[i].visible) || question.columnList[i].visible == true){
                    visibleColumnIndex = i;
                    visibleColumnCnt++;
                    if(visibleColumnCnt > 1){
                        return;
                    }
                }
            }
            if(visibleColumnIndex != null){
                $( ".radio-" + question.id + "-" + rowIndex + "-" + visibleColumnIndex ).click();
            }
        }
    }
});