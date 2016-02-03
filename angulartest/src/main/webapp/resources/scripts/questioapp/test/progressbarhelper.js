/**
 * Kvóták monitorozását segítő objektum
 */
ProgressBarHelper = function () {

    this.currentIndex = 0;
    this.maxIndex = 0;
    this.currentPercent = 0;

    this.refreshState = function(template){
        this.currentIndex = 0;
        this.maxIndex = 0;

        if(QuestioApp.Util.isDefinedAndNotNull(template) && QuestioApp.Util.isInitialized(template.questions)){
            this.maxIndex = template.questions.length;
            for(var i = 0; i < this.maxIndex; i++){
                if(QuestioApp.Util.isEqual(template.questions[i].active, true)){
                    this.currentIndex = i + 1;
                    this.currentPercent = this.currentIndex*100/this.maxIndex;
                    return;
                }
            }
        }
        this.currentPercent = 0;
    }

    this.getPerCentStyle = function(){
        return this.currentPercent + '%';
    }
};