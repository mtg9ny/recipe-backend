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
    res.json({ recipes: allRecipes });
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
    // Middleware to ensure ingredients is an array
    (req, res, next) => {
        if (!Array.isArray(req.body.ingredients)) {
            req.body.ingredients = typeof req.body.ingredients === "undefined" ? [] : [req.body.ingredients];
        }
        next();
    },

    // Validate and sanitize fields.
    body("title", "Title must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must be longer")
        .trim()
        .isLength({ min: 10 })
        .escape(),
    body("instructions", "Instructions must be longer")
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
            // There are errors. Send error messages back to the frontend.
            return res.status(400).json({
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save recipe to the database.
            await recipe.save();
            // Send a success response back to the frontend.
            res.status(201).json({ message: "Recipe created successfully!", recipe });
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

exports.recipe_update_post = [
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('instructions', 'Instructions must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('ingredients.*').escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        // Ensure the ID is correctly retrieved from the request
        const recipeId = req.body._id;

        const recipe = {
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            ingredients: req.body.ingredients,
        };

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        } else {
            // Use findByIdAndUpdate to update the existing document
            const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, recipe, { new: true });
            if (!updatedRecipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
            res.status(200).json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
        }
    }),
];


// Handle recipe update on PUT.
exports.recipe_update_put = asyncHandler(async (req, res, next) => {
    try {
        const { id, title, description, instructions, ingredients } = req.body;

        // Find and update the recipe by ID
        const updatedRecipe = await Recipe.findByIdAndUpdate(id, {
            title,
            description,
            instructions,
            ingredients,
        }, { new: true });

        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.status(200).json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: 'Failed to update recipe' }] });
    }
});