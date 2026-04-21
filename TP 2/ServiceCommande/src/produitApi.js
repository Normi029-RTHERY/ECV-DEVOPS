import axios from 'axios';

export const getProduitsByIds = async (ids) => {
    const URL = process.env.SERVICE_PRODUIT_URL + '/produits/acheter';
    try {
        const response = await axios.post(URL, { ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.info('Produits récupérés :', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error.message);
        throw new Error('Erreur lors de la récupération des produits');
    }
}