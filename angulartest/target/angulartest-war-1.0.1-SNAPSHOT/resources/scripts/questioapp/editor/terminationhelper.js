/**
 * Kérdések klónozásának segédosztálya
 */

TerminationHelper = function () {

    this.terminations = [];

    this.selectedTerminations = [];

    this.initTerminations = function(template, terminationEntities){
        if(QuestioApp.Util.isInitialized(terminationEntities)){
            this.terminations = terminationEntities;
            this.selectedTerminations = [];
            if(QuestioApp.Util.isInitialized(template.terminations)) {
                for (var i = 0; i < this.terminations.length; i++) {
                    for (var j = 0; j < template.terminations.length; j++) {
                        if(this.terminations[i].id == template.terminations[j].id){
                            this.terminations[i].ticked = true;
                            this.selectedTerminations.push(template.terminations[j]);
                        }
                    }
                }
            }
        }
    }

    this.updateTerminationsInTemplate = function(template){
        template.terminations = [];
        if(this.selectedTerminations.length != 0){
            for(var i = 0; i < this.selectedTerminations.length; i++){
                template.terminations.push({id: this.selectedTerminations[i].id,
                                            terminationName: this.selectedTerminations[i].terminationName,
                                            terminationDescription: this.selectedTerminations[i].terminationDescription,
                                            terminationType: this.selectedTerminations[i].terminationType
                });
            }
        }
    }
};