/**
 * Pricing Seeder
 */

import { supabase } from '../lib/client.js';
import { loadJson, logSuccess, logError } from '../lib/utils.js';

interface PricingData {
  pricing_config: {
    name: string;
    base_price: number;
    currency: string;
    is_active: boolean;
  };
  promo_codes: Array<{
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    valid_from: string;
    valid_until?: string;
    is_active: boolean;
  }>;
}

export async function seedPricing(): Promise<void> {
  console.log('Seeding pricing and promo codes...');
  const pricingData = loadJson<PricingData>('pricing.json');

  // Update or insert pricing config
  const { error: pricingError } = await supabase
    .from('pricing_config')
    .upsert(pricingData.pricing_config, { onConflict: 'name' });

  if (pricingError) {
    logError(`Error seeding pricing config: ${pricingError.message}`);
  } else {
    logSuccess(`Pricing: ${pricingData.pricing_config.name} (£${pricingData.pricing_config.base_price / 100})`);
  }

  // Seed promo codes
  for (const promoCode of pricingData.promo_codes) {
    const { error } = await supabase
      .from('promo_codes')
      .upsert(promoCode, { onConflict: 'code' });

    if (error) {
      logError(`Error seeding promo code "${promoCode.code}": ${error.message}`);
    } else {
      const discount = promoCode.discount_type === 'percentage'
        ? `${promoCode.discount_value}%`
        : `£${promoCode.discount_value / 100}`;
      logSuccess(`Promo: ${promoCode.code} (${discount} off)`);
    }
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPricing()
    .then(() => {
      console.log('\n✅ Pricing seeded!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
