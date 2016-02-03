QuestioApp.service('ConditionGenerationFunctions', function() {

    this.clearGeneratedData = function(template){
        if(QuestioApp.Util.isInitialized(template.conditions)){
            for(var i = template.conditions.length -1; i >= 0; i--){
                if(QuestioApp.Util.isDefinedAndNotNull(template.conditions[i]) && template.conditions[i].generated == true){
                    template.conditions.splice(i, 1);
                }
            }
        }
        if(QuestioApp.Util.isInitialized(template.questions)){
            for(var i = 0; i < template.questions.length; i++){
                if(QuestioApp.Util.isInitialized(template.questions[i].rows)){
                    for(var j = template.questions[i].rows.length -1; j >= 0; j--){
                        if(QuestioApp.Util.isDefinedAndNotNull(template.questions[i].rows[j].generated) &&
                            template.questions[i].rows[j].generated == true){
                            template.questions[i].rows.splice(j, 1);
                        }
                    }
                }
                if(QuestioApp.Util.isInitialized(template.questions[i].columns)){
                    for(var j = template.questions[i].columns.length -1; j >= 0; j--){
                        if(QuestioApp.Util.isDefinedAndNotNull(template.questions[i].columns[j].generated) &&
                            template.questions[i].columns[j].generated == true){
                            template.questions[i].columns.splice(j, 1);
                        }
                    }
                }
            }
        }
    }
});

