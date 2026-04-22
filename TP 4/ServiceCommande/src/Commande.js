import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema(
    {
        email_utilisateur: {
            type: String,
            required: true
        },
        produits: {
            type: [String],
            required: true
        },
        prix_total: {
            type: Number,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);

export default Commande;