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

    var html = _.template([
      '<table class="table">',
        '<tr>',
          '<th>Ingredient</th>',
          '<th class="text-center">Amount</th>',
          '<% _.each(nutrientKeys, function(nutrient, index) { %>',
            '<th class="text-center"><%= nutrient %></th>',
          '<% }); %>',
        '</tr>',
        '<% _.each(ingredients, function(ingredient, idx) { %>',
          '<tr>',
            '<td><%= ingredient.name %></td>',
            // amounts[idx] is rounded to the nearest whole since we assume that inputs are
            // given in the smallest measurable units
            '<td class="text-center"><%= Math.round(amounts[idx]) %></td>',
            '<% _.each(nutrientKeys, function(nutrient, index) { %>',
              '<td class="text-center"><%= (ingredient[nutrient] * Math.round(amounts[idx])).toFixed(2) %></td>',
            '<% }); %>',
          '</tr>',
        '<% }); %>',
        '<tr>',
          '<td style="border-top: 1px solid #888">Total</td>',
          '<td style="border-top: 1px solid #888" class="text-center"></td>',
          '<% _.each(nutrientKeys, function(nutrient, index) { %>',
            '<td style="border-top: 1px solid #888" class="text-center"><%= total[nutrient].toFixed(2) %></td>',
          '<% }); %>',
        '</tr>',
        '<tr>',
          '<td>Target</td>',
          '<td class="text-center"></td>',
          '<% _.each(nutrientKeys, function(nutrient, index) { %>',
            '<td class="text-center"><%= targetProfile[nutrient].min %> - <%= targetProfile[nutrient].max %></td>',
          '<% }); %>',
        '</tr>',
        '<tr class="active">',
          '<td>% Deviation</td>',
          '<td class="text-center"></td>',
          '<% _.each(nutrientKeys, function(nutrient, index) { %>',
            '<td class="text-center"><%= nutrientCompleteness[nutrient].toFixed(1) %>%</td>',
          '<% }); %>',
        '</tr>',
      '</table>'
    ].join(''));

    $('#table').html(html({
        total: this.recipes[0].nutrientTotals,
        amounts: this.recipes[0].ingredientAmounts,
        ingredients: this.ingredients,
        targetProfile: this.targetNutrients,
        nutrientCompleteness: this.recipes[0].nutrientCompleteness,
        nutrientKeys: _.keys(this.targetNutrients)
    }));

    $('.generation').val(this.currentGeneration);

};
