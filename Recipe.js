
/**
 * A Recipe is responsible for specifying the amount of each ingredient that should be used.
 */
var Recipe = function(soylent, ingredientAmounts) {

    this.soylent = soylent;

    if (ingredientAmounts) {
        this.ingredientAmounts = ingredientAmounts;
    }
    else {
        this.ingredientAmounts = [];

        // Initialize the recipe with random amounts of each ingredient.
        for (var i = 0; i < this.soylent.ingredients.length; i++){
            this.ingredientAmounts.push(Math.random() * this.soylent.ingredients[i].maxAmount);
        }
    }

    this.calculateCompleteness();
};

/**
 * This function 'mates' two recipes, producing a 'child' recipe.
 * The child recipe contains most of it's parents chromosomes, with a few of them mutated slightly.
 */
Recipe.prototype.createChildWith = function(mate) {

    // Pick random ingredient amounts from each parent.
    var pos = Math.floor(Math.random() * this.soylent.ingredients.length);
    var childIngredientAmounts = [];this.ingredientAmounts.slice(0, pos).concat(mate.ingredientAmounts.slice(pos));
    for (var i=0; i< this.soylent.ingredients.length; i++) {
        var randomParent = Math.random() > 0.5 ? this : mate;
        childIngredientAmounts.push(randomParent.ingredientAmounts[i]);
    }

    // Pick some random ingredient in the recipe to mutate.
    // A mutation is defined as increasing or decreasing the amount of an ingredient by the mutationMultiplier.
    while (Math.random() < this.soylent.mutationProbability){
        var ingredientToMutate = Math.floor(Math.random() * this.soylent.ingredients.length);
        var mutationMultiplier = Math.random() > 0.5 ? (1 - this.soylent.mutationMultiplier) : (1 + this.soylent.mutationMultiplier);
        childIngredientAmounts[ingredientToMutate] = Math.min(childIngredientAmounts[ingredientToMutate] * mutationMultiplier, this.soylent.ingredients[ingredientToMutate].maxAmount);
    }

    return new Recipe(this.soylent, childIngredientAmounts);
};

/**
 * Sets the current nutrient totals for the recipe.
 */
Recipe.prototype.calculateTotalNutrients = function() {

    var nutrients = _.keys(this.soylent.targetNutrients);
    this.nutrientTotals = {};

    _.each(this.soylent.ingredients, function(ingredient, idx) {
        _.each(nutrients, function(nutrient) {
            var ingredientNutrient = ingredient[nutrient] * this.ingredientAmounts[idx];
            this.nutrientTotals[nutrient] = this.nutrientTotals[nutrient] || 0;
            this.nutrientTotals[nutrient] += ingredientNutrient;
        }, this);
    }, this);
};

/**
 * Returns the recipes score. The closer the number is to 0, the better.
 *
 * If the nutrientCompleteness is less than the min, compare to that.
 * If it is higher than the max, compare to that.
 * If it is between them, completeness = 0.
 */
Recipe.prototype.calculateCompleteness = function() {

    var nutrients = _.keys(this.soylent.targetNutrients);
    this.calculateTotalNutrients();
    this.nutrientCompleteness = {};

    var nutrientCompleteness = 0;
    _.each(nutrients, function(nutrient) {
        var completeness = 0;
        if (this.nutrientTotals[nutrient] < this.soylent.targetNutrients[nutrient].min) {
            completeness = 100 - (this.nutrientTotals[nutrient] / this.soylent.targetNutrients[nutrient].min * 100);
        }
        else if (this.nutrientTotals[nutrient] > this.soylent.targetNutrients[nutrient].max) {
            completeness = (this.nutrientTotals[nutrient] / this.soylent.targetNutrients[nutrient].max * 100) - 100;
        }
        else {
            completeness = 0;
        }
        //console.log(nutrient + ": " + completeness);
        nutrientCompleteness += completeness;
        this.nutrientCompleteness[nutrient] = completeness;
    }, this);

    this.completenessScore = -nutrientCompleteness;
};


