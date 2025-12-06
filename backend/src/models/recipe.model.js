// models/Recipe.js
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,
    instructions: String,
    cuisine: String,
    category: String,
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    ingredients: [
      {
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
        name: String,
        qty: Number,
        unit: String,
        notes: String,
      },
    ],
    images: [{ type: String, required: true }],
  },
  { timestamps: true }
);

recipeSchema.index({
  title: "text",
  description: "text",
  instructions: "text",
});

module.exports = mongoose.model("Recipe", recipeSchema);
