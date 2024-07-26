const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
});

// Virtual for post's URL
PostSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/${this._id}`;
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
