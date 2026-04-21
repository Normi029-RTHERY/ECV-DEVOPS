import mongoose from "mongoose";

const produitSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        prix: {
            type: Number,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const Produit = mongoose.model("Produit", produitSchema);

export default Produit;