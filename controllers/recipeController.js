const Recipe = require("../models/recipe");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numRecipes,
    ] = await Promise.all([
        Recipe.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Recipe Home",
        recipe_count: numRecipes,
    });
});

// Display list of all recipes.
exports.recipe_list = asyncHandler(async (req, res, next) => {
    const allRecipes = await Recipe.find({}, "title description instructions ingredients").exec();
    res.render("recipe_list", { title: "Recipe List", recipe_list: allRecipes });
});

// Display detail page for a specific recipe.
exports.recipe_detail = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec();

    if (recipe === null) {
        // No results.
        const err = new Error("Recipe not found");
        err.status = 404;
        return next(err);
    }

    res.render("recipe_detail", {
        title: "Recipe Details",
        recipe: recipe,
    });
});

// Display recipe create form on GET.
exports.recipe_create_get = asyncHandler(async (req, res, next) => {
    res.render("recipe_form", {
        title: "Create Recipe"
    });
});

// Handle recipe create on POST.
exports.recipe_create_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.ingredients)) {
            req.body.ingredients =
                typeof req.body.ingredients === "undefined" ? [] : [req.body.ingredients];
        }
        next();
    },

    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must be longer.")
        .trim()
        .isLength({ min: 10 })
        .escape(),
    body("instructions", "Instructions must be longer.")
        .trim()
        .isLength({ min: 10 })
        .escape(),
    body("ingredients.*").escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Recipe object with escaped and trimmed data.
        const recipe = new Recipe({
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            ingredients: req.body.ingredients,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render("recipe_form", {
                title: "Create Recipe",
                recipe: recipe,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save recipe.
            await recipe.save();
            res.redirect(`/catalog/recipe${recipe.url}`);
        }
    }),
];

// Display recipe delete form on GET.
exports.recipe_delete_get = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec();

    if (recipe === null) {
        // No results.
        res.redirect("/catalog/recipes");
    }

    res.render("recipe_delete", {
        title: "Delete Recipe",
        recipe: recipe,
    });
});

// Handle recipe delete on POST.
exports.recipe_delete_post = asyncHandler(async (req, res, next) => {
    await Recipe.findByIdAndDelete(req.body.recipeid);
    res.redirect("/catalog/recipes");
});

// Display recipe update form on GET.
exports.recipe_update_get = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec();

    if (recipe === null) {
        // No results.
        const err = new Error("Recipe not found");
        err.status = 404;
        return next(err);
    }

    res.render("recipe_form", {
        title: "Update Recipe",
        recipe: recipe,
    });
});

// Handle recipe update on POST.
exports.recipe_update_post = [
    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('instructions', 'Instructions must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('ingredients.*').escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Recipe object with escaped/trimmed data and old id.
        const recipe = new Recipe({
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            ingredients: req.body.ingredients,
            _id: req.params.id, // This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('recipe_form', {
                title: 'Update Recipe',
                recipe: recipe,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, recipe, {});
            // Redirect to recipe detail page.
            res.redirect(`/catalog/recipe/${updatedRecipe._id}`);
        }
    }),
];
