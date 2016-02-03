/**
 * Kvóták monitorozását segítő objektum
 */
QuotaCounter = function () {

    this.quotaId = null;
    this.quotaName = "";
    this.quotaType = "";
    this.fulfilled = false;
    this.fulfilledByLastSave = false;
    this.quantity = 0;
    this.counter = 0;
    this.exceeded = false;
    this.parts = [];
};