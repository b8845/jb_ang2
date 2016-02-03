/**
 * Kérdések klónozásának segédosztálya
 */

QuotaEditorHelper = function () {

    this.quotaTypes = [];

    this.selectedQuotaType = [];

    this.initQuotaTypeHelper = function(quota){
        this.quotaTypes = [];

        var globalQuota = {};
        globalQuota.name = 'Global';
        globalQuota.localizedName = 'Teljes';
        globalQuota.ticked = QuestioApp.Util.isEqual(quota.quotaType, 'Global');
        this.quotaTypes.push(globalQuota);

        var dailyQuota = {};
        dailyQuota.name = 'Daily';
        dailyQuota.localizedName = 'Napi';
        dailyQuota.ticked = QuestioApp.Util.isEqual(quota.quotaType, 'Daily');
        this.quotaTypes.push(dailyQuota);

        if(QuestioApp.Util.isDefinedAndNotNull(quota.quotaType)){
            if(QuestioApp.Util.isEqual(quota.quotaType, globalQuota.name)){
                this.selectedQuotaType.push(globalQuota);
            }
            else if(QuestioApp.Util.isEqual(quota.quotaType, dailyQuota.name)){
                this.selectedQuotaType.push(dailyQuota);
            }
        }
    }

    this.updateQuotaType = function(quota){
        quota.quotaType = null;
        if(QuestioApp.Util.isInitialized(this.selectedQuotaType)){
            quota.quotaType = this.selectedQuotaType[0].name;
        }
    }
};