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
        testGeneticSoylent = new GeneticSoylent({
                    ingredients: convertJSONIngredientsToGeneticIngredients(jsonToRun.ingredients),
                    targetNutrients: convertJSONNutritionToGeneticNutrition(jsonToRun.nutrientTargets)
        });

        testGeneticSoylent.reset();
        testGeneticSoylent.render();
    });

    function convertJSONIngredientsToGeneticIngredients(ingredients){
        $.each(ingredients, function(key, value){
            // divide each value by serving size to normalize them
            var servingSize = ingredients[key]["serving"];

            // if servingSize = 0, we use amount instead
            if (!servingSize){
                servingSize = ingredients[key]["amount"];
            }

            // if both are 0, we use 1
            if (!servingSize){
                servingSize = 1;
            }

            // set the nutrient value for each nutrient to the amount in
            // 1 unit of this ingredient (usually 1g, 1pill)
            $.each(value, function(ingredientNutrient, ingredientValue){
                if (Number(ingredients[key][ingredientNutrient])) {
                   ingredients[key][ingredientNutrient] = ingredientValue/servingSize;
               }
            });
            // also, for each ingredient, add a maxAmount
            ingredients[key]["maxAmount"] = 500;
            ingredients[key]["minAmount"] =   0;
        });
        return ingredients;
    }

    function convertJSONNutritionToGeneticNutrition(nutrition){
        var newNutrition = [];
        $.each(nutrition, function(key, value){
            // get the name of the trueKey, which doesn't include _max
            // later, we will put the value of _max into the key max of the nutrient trueKey
            var trueKey = key.replace("_max","");

            // if the object for this nutrient doesn't exist yet, add it
            // but only if the value > 0
            if (!newNutrition[trueKey] && value > 0){
                newNutrition[trueKey] = {};
            }

            // if this is a _max nutrition key, add it as the max value to trueKey
            if (key.indexOf("_max") >= 0 && value > 0){
                newNutrition[trueKey.replace("_max","")]["max"] = value;
            }

            // otherwise take this value as the min and set the default importanceFactor
            // but only if the min value is > 0
            else if (value > 0) {
                newNutrition[trueKey]["min"] = value;
                newNutrition[trueKey]["importanceFactor"] = 1;
                // we'll need to add a max for all values, so
                // if it's othrewise undefined, we choose min*10
                if (!newNutrition[trueKey]["max"]){
                    newNutrition[trueKey]["max"] = newNutrition[trueKey]["min"] * 10;
                }
            }
        });

        // we delete "name", since it's not a nutrient
        delete newNutrition["name"];
        return newNutrition;
    }

    testGeneticSoylent.render();
});
