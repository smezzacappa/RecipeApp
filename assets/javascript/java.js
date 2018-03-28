$("#food-drink-view").hide();
// Initialize Firebase
var config = {
    apiKey: "AIzaSyDFxvI2pF2TVAL8YxlTKiIJsA3zAT8wT1I",
    authDomain: "dinetime-c2874.firebaseapp.com",
    databaseURL: "https://dinetime-c2874.firebaseio.com",
    projectId: "dinetime-c2874",
    storageBucket: "",
    messagingSenderId: "647476940046"
};
firebase.initializeApp(config);
var database = firebase.database();

$("#drink-history").hide();
$("#dish-history").hide();
var drinkHist = false;
var dishHist = false;
// Food Search
$("#search-food").on("click", function (event) {
    event.preventDefault();
    var food = $("#food-input").val().trim();
    var ingredient = $("#ingredient").val().trim();

    if (food !=="" || ingredient !== ""){
        $("#food-input").val("")
        foodSearch(food);
        $("#ingredient").val("")

        foodSearch(ingredient);   

    //alert if search box empty
    }else {
        swal("You left the search box empty");
    }
    }) // End of $("#search-food").on("click", function (event) {}

// Drink Search
$("#search-drink").on("click", function (event) {
    event.preventDefault();
    var drink = $("#drink-input").val().trim();
    if (drink !== "") {
        $("#drink-input").val("")
        drinkSearch(drink);
    }
    //alert if search box empty
    else {
        swal("You left the search box empty");
    }

}) // End of $("#search-food").on("click", function (event) {}


// Food search function
function foodSearch(food) {
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
    var API_KEY = "bf3c7683b861847f86f4ee05390e4c05";
    var APP_ID = "b81e67c4";
    var corsProxy = "https://cors-anywhere.herokuapp.com/";
    var apiUrl = "https://api.edamam.com/search?app_id=" + APP_ID + "&app_key=" + API_KEY + "&q=" + food;
    var searchTermURL = corsProxy + apiUrl;
    $.ajax({
        url: searchTermURL,
        method: 'GET',
    }).then(function (data) {
        $("#food-drink-view").empty();
        var results = [];
        for (var i = 0; i < data.hits.length; i++) {
            var resultItem = {
                image: data.hits[i].recipe.image,
                dishName: data.hits[i].recipe.label,
                ingredients: data.hits[i].recipe.ingredientLines,
                calories: data.hits[i].recipe.calories,
                recipe: data.hits[i].recipe.url,
            }
            results.push(resultItem);
        }
        database.ref(food).set({
            searchTerm: food,
            results: results,
        });
    })
    // .fail(function () {
    //     swal("No recipes found");
    // })
} //  End of function foodSearch(food){}

// Drink search function
function drinkSearch(drink) {
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
    var searchTermURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + drink;
    // API response function
    $.ajax({
        url: searchTermURL,
        method: 'GET',
    }).then(function (response) {
        
        var results = [];
        for (var i = 0; i < response.drinks.length; i++) {
            var drinkObj = response.drinks[i];
            var ingredients = [];
            var measurements = [];
            for (var j = 9; j < 23; j++) {
                var ingredient = drinkObj[Object.keys(drinkObj)[j]];
                var measurement = drinkObj[Object.keys(drinkObj)[j + 15]];
                if (ingredient !== "") {
                    ingredients.push(ingredient);
                    measurements.push(measurement);
                }
            }
            var resultItem = {
                drinkName: drinkObj.strDrink,
                ID: drinkObj.idDrink,
                ingredients: ingredients,
                measurements: measurements,
                type: drinkObj.strAlcoholic,
                picture: drinkObj.strDrinkThumb,
                instructions: drinkObj.strInstructions,
            }
            results.push(resultItem);
        }
        database.ref(drink).set({
            searchTerm: drink,
            results: results,
        });
    })
     // End of the response function

} //  End of function foodSearch(food){}


database.ref().on("child_added", function (snapshot) {
    var results = snapshot.val().results;
    var resultsView = $('<div>');
    var searchTerm = snapshot.val().searchTerm;
    var histItem = $("<li>");
    var searchTermDiv = $('<div>');
        searchTermDiv.append(searchTerm);
        searchTermDiv.addClass('history');
    var searchTermArray = searchTerm.split("");
        for (let i = 0; i < searchTermArray.length; i++) {
            if (searchTermArray[i] === " ") {
                searchTermArray.splice(i, 1);    
            }   
        }
    var termID = searchTermArray.join("");
    resultsView.attr("id", termID);
    histItem.attr("id", termID + "histdiv");
        if ([Object.keys(results[0])[1]] == "drinkName") {
            searchTermDiv.attr({"id": termID + "-hist", "value": "drink"})
        } else {
            searchTermDiv.attr({"id": termID + "-hist", "value": "dish"})
        }
    var deleteButton = $("<button>")
        deleteButton.addClass("delete");
        deleteButton.attr("value", snapshot.key);
        deleteButton.append("x");
        histItem.append(searchTermDiv);
        histItem.append(deleteButton);
    if ([Object.keys(results[0])[1]] == "drinkName") {    
        $("#drink-history").append(histItem);
    } else {
        $("#dish-history").append(histItem);
    }

    results.forEach(element => {
        if ([Object.keys(element)[1]] == "drinkName") {
            var imageDiv = $('<div>');
            var resultCount = 0;
            imageDiv.addClass('imgClass');
            // Make an image div
            var image = $("<img>");
            image.attr("src", element.picture);
            image.addClass('photo');
            // var pOne = $("<p>").text("Drink-ID: " + element.ID);
            var pTwo = $("<h3>").text(element.drinkName);
            pTwo.attr("id", "item-name");
            pTwo.addClass('drink-name')
            imageDiv.append(pTwo);
            imageDiv.append(image);
            imageDiv.append(pOne);
            var pThree = $("<p>").text(element.type);
            imageDiv.append(pThree);
            var ingredients = element.ingredients;
            var measurements = element.measurements;
            var recipe = $("<ul>");
            recipe.attr("id", "recipe");
            for (let i = 0; i < ingredients.length; i++) {
                $(recipe).append("<li>" + measurements[i] + " " + ingredients[i] + "</li>");
            }
            recipe.addClass('recipe');
            imageDiv.append(recipe);
            
            var pFive = $("<p>").text("Instructions: " + element.instructions);
            pFive.attr("id", "instructions")
            imageDiv.append(pFive);
            resultsView.append(imageDiv);
            $("#food-drink-view").prepend(resultsView);
        } else {
            var imageDiv = $('<div>');
            imageDiv.addClass('imgClass');

            // Make an image div

            var image = $("<img>");
            image.attr("src", element.image);
            var pOne = $("<h3>").text(element.dishName);
            pOne.addClass('dishName');          
            pOne.attr("id", "item-name");
            imageDiv.append(pOne);
            imageDiv.append(image);
            imageDiv.append(pSix);
            var pThree = $("<h4>").text("Calories: " + Math.round(element.calories));
            pThree.addClass('calories');
            imageDiv.append(pThree);
            var pTwo = $("<ul>");
            pTwo.addClass('list');
            var ingredients = element.ingredients;
            for (let i = 0; i < ingredients.length; i++) {
                $(pTwo).append("<li> -" + ingredients[i] + "</li>");
            }

            imageDiv.append(pTwo);
            var pSix = $('<a>');
            pSix.append("Link to Recipe");
            pSix.attr('href', element.recipe);
            imageDiv.append(pSix);

            resultsView.append(imageDiv);
            $("#food-drink-view").prepend(imageDiv);
        }
    });
})


$("#dish-div").on("click", function () {
    if (!dishHist) {
        $("#dish-history").show();
        dishHist = true;
    } else {
        $("#dish-history").hide();
        dishHist = false;
    }
})

$("#drink-div").on("click", function () {
    if (!drinkHist) {
        $("#drink-history").show();
        drinkHist = true;
    } else {
        $("#drink-history").hide();
        drinkHist = false;
    }
});

function deleteHistory() {
    var key = $(this)[0].value;
    database.ref().child(key).remove();
}

database.ref().on('child_removed', function (snapshot) {
    var deletedTerm = snapshot.val().searchTerm;
    var deletedTermArray = deletedTerm.split("");
        for (let i = 0; i < deletedTermArray.length; i++) {
            if (deletedTermArray[i] === " ") {
                deletedTermArray.splice(i, 1);    
            }   
        }
    var deletedID = deletedTermArray.join("");
    $("#" + deletedID).empty();
    $("#" + deletedID + "histdiv").empty();
})

function showHistoryItem() {
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
    var id = $(this).attr("id");
    var value = $(this).attr("value");
    var idSplit = id.split("");
    idSplit.pop(); idSplit.pop(); idSplit.pop(); idSplit.pop(); idSplit.pop();
    var searchTerm = idSplit.join("");
    database.ref(searchTerm).on("value", function (snapshot) {
        var results = snapshot.val().results;
        var resultsView = $('<div>');
        var searchTerm = snapshot.val().searchTerm;
        resultsView.attr("id", searchTerm);
        results.forEach(element => {
            if ([Object.keys(element)[1]] == "drinkName") {
                var imageDiv = $('<div>');
                imageDiv.addClass('imgClass');
                // Make an image div
                var image = $("<img>");
                image.attr({"src": element.picture});
                var pTwo = $("<h3>").text(element.drinkName);
                pTwo.attr("id", "item-name");
                imageDiv.append(pTwo);
                imageDiv.append(image);
                imageDiv.append(pOne);
                var pThree = $("<p>").text("Alcohol: " + element.type);
                imageDiv.append(pThree);
                var ingredients = element.ingredients;
                var measurements = element.measurements;
                var recipe = $("<ul>");
                recipe.attr("id", "recipe");
                for (let i = 0; i < ingredients.length; i++) {
                    $(recipe).append("<li>" + measurements[i] + " " + ingredients[i] + "</li>");
                }
                imageDiv.append(recipe);
                var pFive = $("<p>").text("Instructions: " + element.instructions);
                pFive.attr("id", "instructions");
                imageDiv.append(pFive);
                resultsView.append(imageDiv);
                $("#food-drink-view").prepend(resultsView);
            } else {
                var imageDiv = $('<div>');
                imageDiv.addClass('imgClass');     
                // Make an image div       
                var image = $("<img>");
                image.attr("src", element.image);
                var pOne = $("<h3>").text(element.dishName);
                pOne.attr("id", "item-name");
                imageDiv.append(pOne);
                imageDiv.append(image);
                var pThree = $("<h4>").text("Calories: " + Math.round(element.calories));
                imageDiv.append(pThree);
                var pTwo = $("<ul>");
                var ingredients = element.ingredients;
                for (let i = 0; i < ingredients.length; i++) {
                    $(pTwo).append("<li> -" + ingredients[i] + "</li>");
                }
                imageDiv.append(pTwo);  
                var pSix = $('<a>');
                pSix.append("Link to Recipe");
                pSix.attr('href', element.recipe);
                imageDiv.append(pSix);      
                resultsView.append(imageDiv);
                $("#food-drink-view").prepend(imageDiv);
            }
        });
    })
}
$(document).on("click", ".history", showHistoryItem);
$(document).on("click", ".delete", deleteHistory);


