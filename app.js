/**
 * Controllers for the buttons and variables.
 */
$(function(){
    $('.start-genetic-algorithm').click(function(){
        $(this).hide();
        $('.pause-genetic-algorithm').show();
        testGeneticSoylent.autoGenerate = true;
        testGeneticSoylent.nextGeneration();
        return false;
    });

    $('.pause-genetic-algorithm').click(function(){
        testGeneticSoylent.autoGenerate = false;
        $(this).hide();
        $('.start-genetic-algorithm').show();
        return false;
    });

    $('.step-genetic-algorithm').click(function(){
        testGeneticSoylent.nextGeneration();
        return false;
    });

    $('.reset-genetic-algorithm').click(function(){
        testGeneticSoylent.reset();
        testGeneticSoylent.render();
        return false;
    });

    $('.death-rate').change(function(){
        testGeneticSoylent.deathRate = Number($(this).val());
    });

    $('.population').change(function(){
        testGeneticSoylent.populationSize = Number($(this).val());
    });

    $('.mutation-probability').change(function(){
        testGeneticSoylent.mutationProbability = Number($(this).val());
    });

    $('.mutation-multiplier').change(function(){
        testGeneticSoylent.mutationMultiplier = Number($(this).val());
    });

    $('#inputJSON').change(function(){
        var jsonToRun = $.parseJSON(this.value);
        var newNutrition = convertJSONNutritionToGeneticNutrition(jsonToRun.nutrientTargets);
        testGeneticSoylent = new GeneticSoylent({
                    ingredients: convertJSONIngredientsToGeneticIngredients(jsonToRun.ingredients),
                    targetNutrients: newNutrition
        });
        testGeneticSoylent.reset();
        testGeneticSoylent.render();
    });

    function convertJSONIngredientsToGeneticIngredients(ingredients){
        $.each(ingredients, function(key, value){
            ingredients[key]["maxAmount"] = 500;
        });
        return ingredients;
    }

    function convertJSONNutritionToGeneticNutrition(nutrition){
        var newNutrition = [];
        $.each(nutrition, function(key, value){
            var trueKey = key.replace("_max","");
            if (!newNutrition[trueKey]){
                newNutrition[trueKey] = {};
            }

            if (key.indexOf("_max") >= 0){
                newNutrition[trueKey.replace("_max","")]["max"] = value;
            }
            else {
                newNutrition[trueKey]["min"] = value;
                newNutrition[trueKey]["importanceFactor"] = 1;
                if (!newNutrition[trueKey]["max"]){
                    newNutrition[trueKey]["max"] = newNutrition[trueKey]["min"] * 10;
                }
            }
        });
        return newNutrition;
    }

    testGeneticSoylent.render();
});
