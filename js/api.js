// js/api.js
// URL de base de l'API
const API_BASE = 'https://fakestoreapi.com';
// Récupération des produits
export const Api = {
	async fetchProducts() {
		const res = await fetch(`${API_BASE}/products`);
		if (!res.ok) throw new Error('Erreur lors de la récupération des produits : ' + res.status);
		console.log(res);
		return await res.json();
	},

	// NOTE: fakestore accepte la méthode POST mais ne conserve pas les données réelles pour tout le monde.
	// Création d'un nouveau produit (méthode POST)
	async createProduct(payload) {
		const res = await fetch(`${API_BASE}/products`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error('Erreur création: ' + res.status);
		return await res.json();
	},

	// Mise à jour d'un produit (méthode PUT)
	async updateProduct(id, payload) {
		const res = await fetch(`${API_BASE}/products/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error('Erreur update: ' + res.status);
		return await res.json();
	},

	// Suppression d'un produit (méthode DELETE)
	async deleteProduct(id) {
		const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });

		if (!res.ok) {
			throw new Error('Erreur delete: ' + res.status);
		}

		// On lit le corps de la réponse en texte brut
		const text = await res.text();

		// Si la réponse contient quelque chose, on tente de parser
		return text ? JSON.parse(text) : { success: true };
	}

};
