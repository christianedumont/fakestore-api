// js/utils.js
export function sanitizeString(str) {
	if (str == null) return '';
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function validateInput({ name, price }) {
	if (!name || String(name).trim().length < 2) return { ok: false, reason: 'Le nom doit contenir au moins 2 caractères' };
	const outputPrice = Number(String(price).replace(',', '.'));
	if (Number.isNaN(outputPrice) || outputPrice < 0.1) return { ok: false, reason: 'Le prix doit être supérieur à 0' };
	return { ok: true, data: { name: String(name).trim(), price: +outputPrice } };
}

export function formatPriceEuro(num) {
	return Number(num).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
