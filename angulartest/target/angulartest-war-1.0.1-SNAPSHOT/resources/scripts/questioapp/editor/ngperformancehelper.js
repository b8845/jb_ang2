/**
 * Angular performancia problémákat segítő helper
 */

NgPerformanceHelper = function () {

    this.defaultSimpleChoiceRowLimit = 100;

    this.simpleChoiceRowLimitStepSize = 500;

    this.currentSimpleChoiceRowLimit = 100;

    this.reinitLimits = function(){
        this.currentSimpleChoiceRowLimit = this.defaultSimpleChoiceRowLimit;
    }

    this.increaseSimpleChoiceLimit = function(){
        this.currentSimpleChoiceRowLimit += this.simpleChoiceRowLimitStepSize;
    }

    this.isSimpleChoiceLimitIncreaseButtonVisible = function(rowCnt){
        return this.currentSimpleChoiceRowLimit < rowCnt;
    }
};