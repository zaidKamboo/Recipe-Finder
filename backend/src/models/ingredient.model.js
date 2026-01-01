
const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    synonyms: [String],
    category: String,
  },
  { timestamps: true }
);

ingredientSchema.index({ name: "text", synonyms: "text" });

module.exports = mongoose.model("Ingredient", ingredientSchema);
