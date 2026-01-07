import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

/**
 * Calculate final price after applying promo code
 */
export function calculateDiscount(
	basePrice: number,
	discountType: 'percentage' | 'fixed',
	discountValue: number
): { discount: number; finalPrice: number } {
	let discount = 0;
	
	if (discountType === 'percentage') {
		discount = Math.round(basePrice * (discountValue / 100));
	} else {
		discount = discountValue;
	}

	// Ensure discount doesn't exceed base price
	discount = Math.min(discount, basePrice);
	
	return {
		discount,
		finalPrice: basePrice - discount
	};
}

/**
 * Format price from pence to display string
 */
export function formatPrice(amountInPence: number, currency = 'gbp'): string {
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: currency.toUpperCase()
	}).format(amountInPence / 100);
}
