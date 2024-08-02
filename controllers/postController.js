const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numPosts,
    ] = await Promise.all([
        Post.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Recipe Home",
        post_count: numPosts,
    });
});

// Display list of all posts.
exports.post_list = asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find({}, "title description instructions ingredients").exec();
    res.render("post_list", { title: "Post List", post_list: allPosts });
});

// Display detail page for a specific post.
exports.post_detail = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        // No results.
        const err = new Error("Post not found");
        err.status = 404;
        return next(err);
    }

    res.render("post_detail", {
        title: "Post Details",
        post: post,
    });
});

// Display post create form on GET.
exports.post_create_get = asyncHandler(async (req, res, next) => {
    res.render("post_form", {
        title: "Create Recipe"
    });
});

// Handle post create on POST.
exports.post_create_post = [
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

        // Create a Post object with escaped and trimmed data.
        const post = new Post({
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            ingredients: req.body.ingredients,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render("post_form", {
                title: "Create Recipe",
                post: post,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save post.
            await post.save();
            res.redirect(`/catalog/post${post.url}`);
        }
    }),
];

// Display post delete form on GET.
exports.post_delete_get = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        // No results.
        res.redirect("/catalog/posts");
    }

    res.render("post_delete", {
        title: "Delete Post",
        post: post,
    });
});

// Handle post delete on POST.
exports.post_delete_post = asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.body.postid);
    res.redirect("/catalog/posts");
});

// Display post update form on GET.
exports.post_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post update GET");
});

// Handle post update on POST.
exports.post_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post update POST");
});
