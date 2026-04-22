import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;