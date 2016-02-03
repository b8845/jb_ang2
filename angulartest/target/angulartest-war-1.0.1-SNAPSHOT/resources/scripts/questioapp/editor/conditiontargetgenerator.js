/**
 * Kérdések klónozásának segédosztálya
 */

ConditionTargetGenerator = function () {

    this.questions = [];

    this.selectedQuestions = [];

    this.targetTypes = [];

    this.selectedTargetType = [];

    this.initForTemplate = function(template){
        this.questions = [];
        this.selectedQuestions = [];
        this.targetTypes = [];
        this.selectedTargetType = [];

        if(QuestioApp.Util.isInitialized(template.questions)){
            for(var i = 0; i < template.questions.length; i++){
                var questionVM = {
                    id: template.questions[i].id,
                    letter: template.questions[i].letter,
                    localizedType: template.questions[i].localizedType,
                    ticked: false
                };
                this.questions.push(questionVM);
            }
        }

        this.targetTypes.push({value:"Show", name:"Megjelenít"});
        this.targetTypes.push({value:"Hide", name:"Elrejt"});
    }

    this.generateConditionTargets = function(condition){
        if(QuestioApp.Util.isInitialized(this.selectedQuestions) && QuestioApp.Util.isInitialized(this.selectedTargetType)){
            if(!QuestioApp.Util.isDefinedAndNotNull(condition.targets)){
                condition.targets = [];
            }
            for(var i = 0; i < this.selectedQuestions.length; i++){
                var newTarget = new ConditionTargetEditorDTO();
                newTarget.id =  QuestioApp.Util.generateId(condition.targets);
                newTarget.index = condition.targets.length;
                newTarget.type = this.selectedTargetType;
                newTarget.questionId.push(this.selectedQuestions[i]);
                condition.targets.push(newTarget);
            }
            return true;
        }
        return false;
    }
};

