/**
 * Kérdések tesztelésével kapcsolatos feltételkezelés
 */

QuestioApp.service('TestQuotaFunctions', ['TestConditionFunctions', 'TestUtilFunctions',
    function(TestConditionFunctions, TestUtilFunctions) {

        this.initCounters = function(scope){
            if(QuestioApp.Util.isInitialized(scope.template.quotas)){
                scope.quotaCounters = [];
                var currentQuestion = TestUtilFunctions.getLastAnsweredQuestion(scope.template);
                if(currentQuestion == null){
                    currentQuestion = new QuestionEditorDTO();
                    currentQuestion.index = -1;
                }
                for(var i = 0; i < scope.template.quotas.length; i++){
                    var counter = new QuotaCounter();
                    counter.quotaId = scope.template.quotas[i].id;
                    counter.quotaName = scope.template.quotas[i].name;
                    counter.quotaType = scope.template.quotas[i].quotaType;
                    counter.quantity = scope.template.quotas[i].quantity;
                    counter.counter =  QuestioApp.Util.isDefinedAndNotNull(scope.template.quotas[i].counter) ? scope.template.quotas[i].counter : 0;
                    counter.parts =  scope.template.quotas[i].parts;

                    counter.fulfilled = TestConditionFunctions.isConditionFulfilled(counter, scope.template, currentQuestion);
                    this.updatefulfilledByLastSaveState(counter, scope);
                    this.updateExceededState(counter);

                    scope.quotaCounters.push(counter);
                }
            }
        }

        this.updateFulfulledStates = function(template, counters){
            var quotaFunctions = this;
            var currentQuestion = TestUtilFunctions.getLastAnsweredQuestion(template);
            if(currentQuestion == null){
                currentQuestion = new QuestionEditorDTO();
                currentQuestion.index = -1;
            }
            angular.forEach(counters, function (value, index) {
                value.fulfilled = TestConditionFunctions.isConditionFulfilled(value, template, currentQuestion);
                quotaFunctions.updateExceededState(value);
            });
        }

        this.updateExceededState = function(counter){
            counter.exceeded = counter.fulfilled && counter.counter >= counter.quantity;
        }

        this.updatefulfilledByLastSaveState = function(counter, scope){
            counter.fulfilledByLastSave = counter.fulfilled &&
                TestUtilFunctions.isTerminationSelected(scope);
            // ne számolja 2x saját magát
            if(counter.fulfilledByLastSave){
                counter.counter--;
            }
        }

        this.prepareSaveDTO = function(scope, saveDTO){
            for(var i = 0; i < scope.quotaCounters.length; i++){
                if(!scope.quotaCounters[i].fulfilledByLastSave && scope.quotaCounters[i].fulfilled){
                    saveDTO.increasedQuotaIds.push(scope.quotaCounters[i].quotaId);
                }
                else if(scope.quotaCounters[i].fulfilledByLastSave && !scope.quotaCounters[i].fulfilled){
                    saveDTO.decreasedQuotaIds.push(scope.quotaCounters[i].quotaId);
                }
            }
        }

        this.prepareDeleteDTO = function(scope){
            var deleteDTO = new QuestionnaireTestDTO();
            deleteDTO.templateId = scope.templateId;

            if(QuestioApp.Util.hasValue(scope.questionnaireId) && scope.questionnaireId != -1){
                deleteDTO.questionnaireId = scope.questionnaireId;
            }

            if(TestUtilFunctions.isTerminationSelected(scope)){
                for(var i = 0; i < scope.quotaCounters.length; i++){
                    if(scope.quotaCounters[i].fulfilledByLastSave){
                        deleteDTO.decreasedQuotaIds.push(scope.quotaCounters[i].quotaId);
                    }
                }
            }
            return deleteDTO;
        }

        this.updateCounterAfterSave = function(scope, savedquotas){
            if(QuestioApp.Util.isInitialized(savedquotas) && QuestioApp.Util.isInitialized(scope.quotaCounters)){
                for(var i = 0; i < scope.quotaCounters.length; i++){
                    for(var j = 0; j < savedquotas.length; j++){
                        if(scope.quotaCounters[i].quotaId == savedquotas[j].id){
                            scope.quotaCounters[i].counter = savedquotas[j].counter;
                            break;
                        }
                    }
                    this.updatefulfilledByLastSaveState(scope.quotaCounters[i], scope);
                    this.updateExceededState(scope.quotaCounters[i]);
                }
            }
        }

        this.hasExceededCounter = function(counters){
            if(QuestioApp.Util.isInitialized(counters)){
                for(var i = 0; i < counters.length; i++){
                    if(QuestioApp.Util.isDefinedAndNotNull(counters[i].exceeded) && counters[i].exceeded == true){
                        return true;
                    }
                }
            }
            return false;
        }

        this.getQuotaExceededTermination = function(terminations){
            if(QuestioApp.Util.isInitialized(terminations)){
                for(var i = 0; i < terminations.length; i++){
                    if(terminations[i].terminationType == 'QuotaExceeded'){
                        return terminations[i];
                    }
                }
            }
            return null;
        }
    }
]);