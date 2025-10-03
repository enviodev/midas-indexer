/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  MTBILL,

  MTBILL_ORACLE,

  MTBILL_ORACLE_AnswerUpdated,

  MTBILL_Transfer,

  CurrentSupply,
  DailySnapshot,
  MonthlySnapshot,
  QuarterlySnapshot,

} from "generated";

// Helper function to normalize oracle price from 8 decimals to 18 decimals
function normalizeOraclePrice(price: bigint): bigint {
  // Oracle price is in 8 decimals, we need to convert to 18 decimals
  // Multiply by 10^10 to go from 8 to 18 decimals
  return price * BigInt(10 ** 10);
}

// Helper function to calculate USD value
function calculateUSDValue(totalSupply: bigint, price: bigint): bigint {
  // Both totalSupply and price are in 18 decimals
  // Result will be in 36 decimals, so we divide by 10^18 to get 18 decimals
  return (totalSupply * price) / BigInt(10 ** 18);
}

// Helper function to get date string (YYYY-MM-DD)
function getDateString(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().split('T')[0];
}

// Helper function to get year and month
function getYearMonth(timestamp: bigint): { year: number; month: number } {
  const date = new Date(Number(timestamp) * 1000);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // getMonth() returns 0-11, we want 1-12
  };
}

// Helper function to get year and quarter
function getYearQuarter(timestamp: bigint): { year: number; quarter: number } {
  const date = new Date(Number(timestamp) * 1000);
  const month = date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
  const quarter = Math.ceil(month / 3);
  return {
    year: date.getFullYear(),
    quarter,
  };
}

// Helper function to update or create snapshots
async function updateSnapshots(
  context: any,
  totalSupply: bigint,
  price: bigint,
  timestamp: bigint
) {
  const usdValue = calculateUSDValue(totalSupply, price);
  
  // Update current supply
  const currentSupply: CurrentSupply = {
    id: "current",
    totalSupply,
    usdValue,
    price,
    lastUpdated: timestamp,
  };
  context.CurrentSupply.set(currentSupply);

  // Create/update daily snapshot
  const dateString = getDateString(timestamp);
  const dailySnapshot: DailySnapshot = {
    id: `daily_${dateString}`,
    date: dateString,
    totalSupply,
    usdValue,
    price,
    timestamp,
  };
  context.DailySnapshot.set(dailySnapshot);

  // Create/update monthly snapshot
  const { year, month } = getYearMonth(timestamp);
  const monthlySnapshot: MonthlySnapshot = {
    id: `monthly_${year}_${month}`,
    year,
    month,
    totalSupply,
    usdValue,
    price,
    timestamp,
  };
  context.MonthlySnapshot.set(monthlySnapshot);

  // Create/update quarterly snapshot
  const { year: qYear, quarter } = getYearQuarter(timestamp);
  const quarterlySnapshot: QuarterlySnapshot = {
    id: `quarterly_${qYear}_${quarter}`,
    year: qYear,
    quarter,
    totalSupply,
    usdValue,
    price,
    timestamp,
  };
  context.QuarterlySnapshot.set(quarterlySnapshot);
}

MTBILL.Transfer.handler(async ({ event, context }) => {
  const entity: MTBILL_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
  };

  context.MTBILL_Transfer.set(entity);

  // Track total supply changes
  // Get current supply or initialize if it doesn't exist
  let currentSupply = await context.CurrentSupply.get("current");
  
  if (!currentSupply) {
    // Initialize with zero supply and zero price
    currentSupply = {
      id: "current",
      totalSupply: BigInt(0),
      usdValue: BigInt(0),
      price: BigInt(0),
      lastUpdated: BigInt(event.block.timestamp),
    };
  }

  // Update total supply based on transfer
  // Mint: from is zero address, add to total supply
  // Burn: to is zero address, subtract from total supply
  let newTotalSupply = currentSupply.totalSupply;
  
  if (event.params.from === "0x0000000000000000000000000000000000000000") {
    // Mint - add to total supply
    newTotalSupply = currentSupply.totalSupply + event.params.value;
  } else if (event.params.to === "0x0000000000000000000000000000000000000000") {
    // Burn - subtract from total supply
    newTotalSupply = currentSupply.totalSupply - event.params.value;
  }

  // Update current supply with new total supply
  const usdValue = currentSupply.price > BigInt(0) 
    ? calculateUSDValue(newTotalSupply, currentSupply.price)
    : BigInt(0);

  const updatedCurrentSupply: CurrentSupply = {
    id: "current",
    totalSupply: newTotalSupply,
    usdValue,
    price: currentSupply.price,
    lastUpdated: BigInt(event.block.timestamp),
  };

  context.CurrentSupply.set(updatedCurrentSupply);
});


MTBILL_ORACLE.AnswerUpdated.handler(
  async ({ event, context }) => {
    const entity: MTBILL_ORACLE_AnswerUpdated = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      data: event.params.data,
      roundId: event.params.roundId,
      timestamp: event.params.timestamp,
    };

    context.MTBILL_ORACLE_AnswerUpdated.set(entity);

    // Normalize oracle price from 8 decimals to 18 decimals
    const normalizedPrice = normalizeOraclePrice(event.params.data);
    
    // Get current supply to calculate USD value
    let currentSupply = await context.CurrentSupply.get("current");
    
    if (!currentSupply) {
      // Initialize with zero supply if it doesn't exist
      currentSupply = {
        id: "current",
        totalSupply: BigInt(0),
        usdValue: BigInt(0),
        price: normalizedPrice,
        lastUpdated: BigInt(event.block.timestamp),
      };
    } else {
      // Update price and recalculate USD value
      const usdValue = calculateUSDValue(currentSupply.totalSupply, normalizedPrice);
      
      currentSupply = {
        ...currentSupply,
        price: normalizedPrice,
        usdValue,
        lastUpdated: BigInt(event.block.timestamp),
      };
    }

    context.CurrentSupply.set(currentSupply);

    // Create snapshots with the new price and current total supply
    await updateSnapshots(
      context,
      currentSupply.totalSupply,
      normalizedPrice,
      BigInt(event.block.timestamp)
    );
  },
);

