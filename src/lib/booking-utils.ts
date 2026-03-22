import { differenceInDays, isValid } from 'date-fns';

export interface PriceBreakdown {
  nights: number;
  pricePerNight: number;
  subtotal: number;       // nights × pricePerNight
  cleaningFee: number;
  totalPrice: number;     // subtotal + cleaningFee - discount
  depositAmount: number;  // totalPrice × 0.5 (bonifico)
  balanceAmount: number;  // totalPrice × 0.5 (contanti all'arrivo)
  securityDeposit: number; // caparra danni (contanti, restituita alla partenza)
  discount: number;
}

export function calculateBookingPrice(
  pricePerNight: number,
  cleaningFee: number,
  securityDeposit: number,
  checkIn: Date | undefined,
  checkOut: Date | undefined,
  seasonalPrices: { start_date: string, end_date: string, price: number }[] = []
): PriceBreakdown {
  if (!checkIn || !checkOut || !isValid(checkIn) || !isValid(checkOut) || checkOut <= checkIn) {
    return {
      nights: 0,
      pricePerNight,
      subtotal: 0,
      cleaningFee,
      totalPrice: 0,
      depositAmount: 0,
      balanceAmount: 0,
      securityDeposit,
      discount: 0,
    };
  }

  const nights = differenceInDays(checkOut, checkIn);
  let subtotal = 0;

  // Calculate price night by night
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    // Remove time portion for comparison
    currentDate.setHours(0, 0, 0, 0);

    // Find if the current date falls within any seasonal price
    // We assume start_date and end_date are 'YYYY-MM-DD' strings
    const activeSeason = seasonalPrices.find(season => {
      const start = new Date(season.start_date);
      start.setHours(0,0,0,0);
      const end = new Date(season.end_date);
      end.setHours(23,59,59,999);
      return currentDate >= start && currentDate <= end;
    });

    subtotal += activeSeason ? activeSeason.price : pricePerNight;
  }

  const totalPrice = subtotal + cleaningFee;
  const depositAmount = Math.round(totalPrice * 0.5 * 100) / 100;
  const balanceAmount = totalPrice - depositAmount;

  return {
    nights,
    pricePerNight, // average or base, used for display
    subtotal,
    cleaningFee,
    totalPrice,
    depositAmount,
    balanceAmount,
    securityDeposit,
    discount: 0,
  };
}
