// src/utils/volumetric.ts

/**
 * Calculates volumetric weight for shipping in kilograms.
 * Standard Air/Express B2B Formula: (Length cm x Width cm x Height cm) / 5000
 */
export const calculateVolumetricWeight = (
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor: number = 5000
): number => {
  if (!lengthCm || !widthCm || !heightCm || lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
    return 0;
  }
  const volWeight = (lengthCm * widthCm * heightCm) / divisor;
  return parseFloat(volWeight.toFixed(2));
};

/**
 * Determines chargeable weight between gross physical weight and volumetric weight.
 */
export const getChargeableWeight = (
  grossWeightKg: number,
  volumetricWeightKg: number
): {
  chargeableWeight: number;
  basis: 'PHYSICAL' | 'VOLUMETRIC';
} => {
  const physical = grossWeightKg || 0;
  const volumetric = volumetricWeightKg || 0;
  if (volumetric > physical) {
    return { chargeableWeight: volumetric, basis: 'VOLUMETRIC' };
  }
  return { chargeableWeight: physical, basis: 'PHYSICAL' };
};
