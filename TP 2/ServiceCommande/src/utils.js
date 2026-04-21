export const calculateTotalPrice = (produits) => {
    const prixTotal = produits.reduce((total, produit) => {
        return total + (produit.prix || 0);
    }, 0);
    return prixTotal;
}