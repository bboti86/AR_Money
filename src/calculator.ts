// Constants for 20,000 HUF bill
export const BILL_VALUE = 20000;
export const BILL_LENGTH_M = 0.154; // 15.4 cm
export const BILL_WIDTH_M = 0.070; // 7.0 cm
export const BILL_THICKNESS_M = 0.00011; // 0.11 mm

// Constants for EUR-pallet
export const PALLET_LENGTH_M = 1.20; // 120 cm
export const PALLET_WIDTH_M = 0.80; // 80 cm
export const PALLET_MAX_HEIGHT_M = 1.85; // 1.85 m
export const BILLS_PER_PALLET = 1500000; // 1.5 million bills (max 1500 kg)
export const VALUE_PER_PALLET = BILLS_PER_PALLET * BILL_VALUE; // 30 Billion HUF

export interface CalculationResult {
  totalBills: number;
  fullPallets: number;
  remainderBills: number;
  remainderDimensions: {
    width: number; // m
    length: number; // m
    height: number; // m
  };
  totalWeightKg: number;
}

export function calculateMoneyPhysicalVolume(amountHuf: number): CalculationResult {
  const totalBills = Math.ceil(amountHuf / BILL_VALUE);
  const fullPallets = Math.floor(totalBills / BILLS_PER_PALLET);
  const remainderBills = totalBills % BILLS_PER_PALLET;
  
  // Weight: 1.5 million bills = 1500 kg => 1 bill = 1 gram = 0.001 kg
  const totalWeightKg = totalBills * 0.001;

  // Calculate remainder dimensions
  // Bills are arranged on the pallet. Pallet is 120cm x 80cm.
  // 1 bill is 15.4 x 7.0 cm.
  // Let's approximate: 1.2 / 0.154 ≈ 7.7 (say 7 bills along length)
  // 0.8 / 0.070 ≈ 11.4 (say 11 bills along width)
  // Bills per layer ≈ 7 * 11 = 77 bills per layer (just an approximation)
  // More accurately, total volume of remainder bills:
  
  const billsPerLayer = Math.floor(PALLET_LENGTH_M / BILL_LENGTH_M) * Math.floor(PALLET_WIDTH_M / BILL_WIDTH_M);
  const remainderLayers = Math.ceil(remainderBills / billsPerLayer);
  
  let rHeight = remainderLayers * BILL_THICKNESS_M;
  let rWidth = PALLET_WIDTH_M;
  let rLength = PALLET_LENGTH_M;

  if (remainderBills === 0) {
    rHeight = 0;
    rWidth = 0;
    rLength = 0;
  }

  return {
    totalBills,
    fullPallets,
    remainderBills,
    remainderDimensions: {
      width: rWidth,
      length: rLength,
      height: rHeight
    },
    totalWeightKg
  };
}
