const Post = require("../models/post");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numPosts,
    ] = await Promise.all([
        Post.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Local Library Home",
        post_count: numPosts,
    });
});

// Display list of all posts.
exports.post_list = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post list");
});

// Display detail page for a specific post.
exports.post_detail = asyncHandler(async (req, res, next) => {
    res.send(`NOT IMPLEMENTED: Post detail: ${req.params.id}`);
});

// Display post create form on GET.
exports.post_create_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post create GET");
});

// Handle post create on POST.
exports.post_create_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post create POST");
});

// Display post delete form on GET.
exports.post_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post delete GET");
});

// Handle post delete on POST.
exports.post_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post delete POST");
});

// Display post update form on GET.
exports.post_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post update GET");
});

// Handle post update on POST.
exports.post_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Post update POST");
});
