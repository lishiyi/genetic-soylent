/**
 * GeneticSoylent should be initialized with a target nutrient profile and a list of ingredients.
 */
var GeneticSoylent = function(opts) {
    opts = opts || {};

    this.populationSize = opts.populationSize || 100;
    this.mutationProbability = opts.mutationProbability || 0.7;
    this.mutationMultiplier = opts.mutationMultiplier || 0.1;
    this.deathRate = opts.deathRate || 0.3;

    this.ingredients = opts.ingredients;
    this.targetNutrients = opts.targetNutrients;

    this.reset();
};

/**
 * Randomly generate new recipes. The number of recipes to generate is defined by populationSize
 */
GeneticSoylent.prototype.reset = function() {
    this.currentGeneration = 0;
    this.recipes = [];
    this.recipes.push(new Recipe(this, _.map(this.ingredients, function() { return 1; })));
    for (var i = 1; i < this.populationSize; i++){
        this.recipes.push(new Recipe(this));
    }
};

GeneticSoylent.prototype.nextGeneration = function() {

    // Throw out the worst performing recipes. The % thrown out is defined by the deathRate variable.
    var recipesToKeep = Math.floor(this.recipes.length * (1 - this.deathRate));
    this.recipes = this.recipes.slice(0, recipesToKeep);

    // Pick two random recipes from the remaining list and 'mate' them, to produce a child recipe.
    for (var popIndex = 0; this.recipes.length < this.populationSize; popIndex++) {
        var parentOne = this.recipes[Math.floor(Math.random() * recipesToKeep)];
        var parentTwo = this.recipes[Math.floor(Math.random() * recipesToKeep)];
        var childRecipe = parentOne.createChildWith(parentTwo);

        this.recipes.push(childRecipe);
    }

    this.sortRecipes();
    this.currentGeneration++;
    this.render();

    if (this.autoGenerate) {
        var self = this;
        setTimeout(function() {
            self.nextGeneration();
        }, 100);
    }
};

/**
 * Sort the recipes from best to worst
 */
GeneticSoylent.prototype.sortRecipes = function(a, b) {
    this.recipes.sort(function(a, b) {
        if (b.completenessScore < a.completenessScore) {
            return -1;
        }
        else if (a.completenessScore < b.completenessScore) {
            return 1;
        }
        else {
            return 0;
        }
    });
};

GeneticSoylent.prototype.render = function() {

    var ingredientHtml = _.template([
      '<table class="table table-condensed">',
        '<tr>',
          '<th>Ingredient</th>',
          '<th class="text-center">Min</th>',
          '<th class="text-center">Amount</th>',
          '<th class="text-center">Max</th>',
          // '<% _.each(nutrientKeys, function(nutrient, index) { %>',
          //   '<th class="text-center"><%= nutrient %></th>',
          // '<% }); %>',
        '</tr>',
        '<% _.each(ingredients, function(ingredient, idx) { %>',
          '<tr>',
            '<td class="text-left"><%= ingredient.name %></td>',
            '<td class="text-center"><input name="<%= idx %>_._minAmount" class="ingredientInput" value="<%= ingredient["minAmount"] %>"></input></td>',
            // amounts[idx] is rounded to the nearest whole since we assume that inputs are
            // given in the smallest measurable units
            '<td class="text-center"><%= Math.round(amounts[idx]) %></td>',
            '<td class="text-center"><input name="<%= idx %>_._maxAmount" class="ingredientInput" value="<%= ingredient["maxAmount"] %>"></input></td>',
            // '<% _.each(nutrientKeys, function(nutrient, index) { %>',
            //   '<td class="text-center"><%= (ingredient[nutrient] * Math.round(amounts[idx])).toFixed(2) %></td>',
            // '<% }); %>',
          '</tr>',
        '<% }); %>',
      '</table>',
      '<h3 align="center">Deviation: <%= -completenessScore.toFixed(1) %></h3>',
      '<p align="center">Lower deviations are better.</p>',
    ].join(''));

    var nutrientHtml = _.template([
      '<table class="table table-condensed">',
        '<tr>',
          '<th class="text-left">Nutrient</th>',
          '<th class="text-center">Min</th>',
          '<th class="text-center">Amount</th>',
          '<th class="text-center">Max</th>',
          '<th class="text-center">% Deviation</th>',
          '<th class="text-center">Priority</th>',
        '</tr>',
        '<% _.each(nutrientKeys, function(nutrient, index) { %>',
          '<% if(total[nutrient] != undefined){ %>',
            '<% var classCompleteness = ""; %>',
            // '<% console.log(nutrient + ": " + classCompleteness) %>',
            '<% if(!nutrientCompleteness[nutrient]) { classCompleteness = "success"; } else { classCompleteness = "danger"; } %>',
            '<tr class="<%= classCompleteness %>">',
              '<th class="text-left"><%= nutrient %></th>',
              '<td class="text-center"><input name="<%= nutrient %>_._min" class="nutrientInput" value="<%= targetProfile[nutrient].min %>"></input></td>',
              '<% var tooltip = "" %>',
              '<% _.each(ingredients, function(ingredient, idx) { %>',
                '<% tooltip += (ingredient[nutrient] * Math.round(amounts[idx])).toFixed(2) + "\t" + ingredient["name"] + "\\r" %>',
              '<% }); %>',
              '<td class="text-center" title="<%= tooltip %>"><%= total[nutrient].toFixed(2) %></td>',
              '<td class="text-center"><input name="<%= nutrient %>_._max" class="nutrientInput" value="<%= targetProfile[nutrient].max %>"></input></td>',
              '<td class="text-center"><%= nutrientCompleteness[nutrient].toFixed(1) %>%</td>',
              '<td class="text-center"><input name="<%= nutrient %>_._importanceFactor" class="nutrientInput" value="<%= targetProfile[nutrient].importanceFactor %>"></input>',
            '</tr>',
          '<% }; %>',
        '<% }); %>',
      '</table>'
    ].join(''));

    $('#ingredientTable').html(ingredientHtml({
        total: this.recipes[0].nutrientTotals,
        amounts: this.recipes[0].ingredientAmounts,
        ingredients: this.ingredients,
        targetProfile: this.targetNutrients,
        completenessScore: this.recipes[0].completenessScore,
        nutrientCompleteness: this.recipes[0].nutrientCompleteness,
        nutrientKeys: _.keys(this.targetNutrients)
    }));

    // specify the nutrient keys we want in the second column
    var nutrientTableKeysForFirstColumn = [
        "cost",
        "calories",
        "carbs",
        "protein",
        "fat",
        "omega_3",
        "omega_6",
        "fiber",
        "vitamin_a",
        "vitamin_b6",
        "vitamin_b12",
        "vitamin_c",
        "vitamin_d",
        "vitamin_e",
        "vitamin_k"
    ];

    // put all other nutrient keys into the third column
    var nutrientTableKeysForSecondColumn = _.keys(this.targetNutrients);
    nutrientTableKeysForSecondColumn = $.grep(nutrientTableKeysForSecondColumn, function(value){
      return $.inArray(value, nutrientTableKeysForFirstColumn) + 1;
    }, true);

    $('#nutrientTable').html(nutrientHtml({
        total: this.recipes[0].nutrientTotals,
        amounts: this.recipes[0].ingredientAmounts,
        ingredients: this.ingredients,
        targetProfile: this.targetNutrients,
        nutrientCompleteness: this.recipes[0].nutrientCompleteness,
        //nutrientKeys: _.keys(this.targetNutrients)
        nutrientKeys: nutrientTableKeysForFirstColumn
    }));

    $('#nutrientTableRemainder').html(nutrientHtml({
        total: this.recipes[0].nutrientTotals,
        amounts: this.recipes[0].ingredientAmounts,
        ingredients: this.ingredients,
        targetProfile: this.targetNutrients,
        nutrientCompleteness: this.recipes[0].nutrientCompleteness,
        nutrientKeys: nutrientTableKeysForSecondColumn.sort()
    }));


    $('.nutrientInput').change(function(){
        // split the name of the function by separator "_._"
        // keyInfo[0] is the nutrient name
        // keyInfo[1] is the name of the value for that nutrient
        var keyInfo = this.name.split("_._");
        testGeneticSoylent.targetNutrients[keyInfo[0]][keyInfo[1]] = this.value;
    });

    $('.ingredientInput').change(function(){
        var keyInfo = this.name.split("_._");
        testGeneticSoylent.ingredients[keyInfo[0]][keyInfo[1]] = +this.value;
    });

    $('.generation').val(this.currentGeneration);

};
