const express = require("express");
const router = express.Router();

// Require controller modules.
const recipe_controller = require("../controllers/recipeController");

/// RECIPE ROUTES ///

// GET catalog home page.
router.get("/", recipe_controller.index);

// GET request for creating a Recipe.
router.get("/recipe/create", recipe_controller.recipe_create_get);

// POST request for creating Recipe.
router.post("/recipe/create", recipe_controller.recipe_create_post);

// GET request to delete Recipe.
router.get("/recipe/:id/delete", recipe_controller.recipe_delete_get);

// POST request to delete Recipe.
router.post("/recipe/:id/delete", recipe_controller.recipe_delete_post);

// GET request to update Recipe.
router.get("/recipe/:id/update", recipe_controller.recipe_update_get);

// POST request to update Recipe.
router.post("/recipe/:id/update", recipe_controller.recipe_update_post);

// GET request for one Recipe.
router.get("/recipe/:id", recipe_controller.recipe_detail);

// GET request for list of all Recipe items.
router.get("/recipes", recipe_controller.recipe_list);

module.exports = router;