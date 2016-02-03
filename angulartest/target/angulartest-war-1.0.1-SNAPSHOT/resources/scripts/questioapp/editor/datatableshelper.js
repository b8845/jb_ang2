/**
 * Kérdések klónozásának segédosztálya
 */

DataTablesHelper = function () {

    this.cityTypes = [];

    this.counties = [];

    this.regions = [];

    this.cities = [];

    this.initDimensionsForDataTable = function(dataTableType){
        var dimensionList = [];
        var tables = [];
        if(dataTableType == 'CityType'){
            tables = this.cityTypes;
        }
        else if(dataTableType == 'County'){
            tables = this.counties;
        }
        else if(dataTableType == 'Region'){
            tables = this.regions;
        }
        else if(dataTableType == 'City'){
            tables = this.cities;
        }

        for(var i = 0; i < tables.length; i++){
            var dimension = new ItemDimensionEditorDTO();
            dimension.id = i;
            dimension.index = i;
            dimension.valueID = i + 1;
            dimension.title = tables[i];
            dimensionList.push(dimension);
        }
        return dimensionList;
    }
};