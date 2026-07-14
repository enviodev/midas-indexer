/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import { indexer } from "envio";

/* ============================
   Config for decimals per chain
   ============================ */
const DETAILS: Record<
  string,
  {
    name: string;
    decimal: number;
    oracle: { address: string; decimal: number };
  }
> = {
  "0xDD629E5241CbC5919847783e6C96B2De4754e438-1": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0x056339C044055819E8Db84E71f5f2E1F536b2E5b",
      decimal: 8,
    },
  },
  "0xDD629E5241CbC5919847783e6C96B2De4754e438-8453": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0x70E58b7A1c884fFFE7dbce5249337603a28b8422",
      decimal: 18,
    },
  },
  "0xDD629E5241CbC5919847783e6C96B2De4754e438-23294": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0xF76d11D4473EA49a420460B72798fc3B38D4d0CF",
      decimal: 8,
    },
  },
  "0xE85f2B707Ec5Ae8e07238F99562264f304E30109-98866": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0xb701ABEA3E4b6EAdAc4F56696904c5F551d2617b",
      decimal: 8,
    },
  },
  "0xDD629E5241CbC5919847783e6C96B2De4754e438-30": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0x0Ca36aF4915a73DAF06912dd256B8a4737131AE7",
      decimal: 8,
    },
  },
  "0xDD629E5241CbC5919847783e6C96B2De4754e438-42793": {
    name: "mTBILL",
    decimal: 18,
    oracle: {
      address: "0x80dA45b66c4CBaB140aE53c9accB01BE4F41B7Dd",
      decimal: 8,
    },
  },
  "0x2a8c22E3b10036f3AEF5875d04f8441d4188b656-1": {
    name: "mBASIS",
    decimal: 18,
    oracle: {
      address: "0xE4f2AE539442e1D3Fb40F03ceEbF4A372a390d24",
      decimal: 8,
    },
  },
  "0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2-8453": {
    name: "mBASIS",
    decimal: 18,
    oracle: {
      address: "0x6d62D3C3C8f9912890788b50299bF4D2C64823b6",
      decimal: 8,
    },
  },
  "0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2-98866": {
    name: "mBASIS",
    decimal: 18,
    oracle: {
      address: "0x6d62D3C3C8f9912890788b50299bF4D2C64823b6",
      decimal: 8,
    },
  },
  "0x2247B5A46BB79421a314aB0f0b67fFd11dd37Ee4-42793": {
    name: "mBASIS",
    decimal: 18,
    oracle: {
      address: "0x31D211312D9cF5A67436517C324504ebd5BD50a0",
      decimal: 8,
    },
  },
  "0x007115416AB6c266329a03B09a8aa39aC2eF7d9d-1": {
    name: "mBTC",
    decimal: 8,
    oracle: {
      address: "0xA537EF0343e83761ED42B8E017a1e495c9a189Ee",
      decimal: 8,
    },
  },
  "0xEF85254Aa4a8490bcC9C02Ae38513Cae8303FB53-30": {
    name: "mBTC",
    decimal: 8,
    oracle: {
      address: "0xa167BFbeEB48815EfB3E3393d91EC586c2421821",
      decimal: 8,
    },
  },
  "0xbB51E2a15A9158EBE2b0Ceb8678511e063AB7a55-1": {
    name: "mEDGE",
    decimal: 18,
    oracle: {
      address: "0x698dA5D987a71b68EbF30C1555cfd38F190406b7",
      decimal: 8,
    },
  },
  "0x69020311836D29BA7d38C1D3578736fD3dED03ED-98866": {
    name: "mEDGE",
    decimal: 18,
    oracle: {
      address: "0x7D5622Aa8Cc259Ae39fBA51f3C1849797FB7e82D",
      decimal: 8,
    },
  },
  "0xA1027783fC183A150126b094037A5Eb2F5dB30BA-16661": {
    name: "mEDGE",
    decimal: 18,
    oracle: {
      address: "0xC0a696cB0B56f6Eb20Ba7629B54356B0DF245447",
      decimal: 8,
    },
  },
  "0xb64C014307622eB15046C66fF71D04258F5963DC-1": {
    name: "mevBTC",
    decimal: 18,
    oracle: {
      address: "0xffd462e0602Dd9FF3F038fd4e77a533f8c474b65", // mevBTC/BTC Oracle
      decimal: 8,
    },
  },
  "0x030b69280892c888670EDCDCD8B69Fd8026A0BF3-1": {
    name: "mMEV",
    decimal: 18,
    oracle: {
      address: "0x5f09Aff8B9b1f488B7d1bbaD4D89648579e55d61",
      decimal: 8,
    },
  },
  "0x5542F82389b76C23f5848268893234d8A63fd5c8-42793": {
    name: "mMEV",
    decimal: 18,
    oracle: {
      address: "0x077670B2138Cc23f9a9d0c735c3ae1D4747Bb516",
      decimal: 8,
    },
  },
  "0x0c78Ca789e826fE339dE61934896F5D170b66d78-98866": {
    name: "mBASIS",
    decimal: 18,
    oracle: {
      address: "0x01D169AAB1aB4239D5cE491860a65Ba832F72ef2",
      decimal: 8,
    },
  },
  "0x87C9053C819bB28e0D73d33059E1b3DA80AFb0cf-1": {
    name: "mRe7YIELD",
    decimal: 18,
    oracle: {
      address: "0x0a2a51f2f206447dE3E3a80FCf92240244722395",
      decimal: 8,
    },
  },
  "0x733d504435a49FC8C4e9759e756C2846c92f0160-42793": {
    name: "mRe7YIELD",
    decimal: 18,
    oracle: {
      address: "0x1989329b72C1C81E5460481671298A5a046f3B8E",
      decimal: 8,
    },
  },
  "0x9FB442d6B612a6dcD2acC67bb53771eF1D9F661A-1": {
    name: "mRe7BTC",
    decimal: 18,
    oracle: {
      address: "0x9de073685AEb382B7c6Dd0FB93fa0AEF80eB8967",
      decimal: 8,
    },
  },
  "0xC6135d59F8D10c9C035963ce9037B3635170D716-747474": {
    name: "mRe7SOL",
    decimal: 8,
    oracle: {
      address: "0x3E4b4b3Aed4c51a6652cdB96732AC98c37b9837B",
      decimal: 8,
    },
  },
  "0x238a700eD6165261Cf8b2e544ba797BC11e466Ba-1": {
    name: "mFONE",
    decimal: 18,
    oracle: {
      address: "0x8D51DBC85cEef637c97D02bdaAbb5E274850e68C",
      decimal: 8,
    },
  },
  "0x20226607b4fa64228ABf3072Ce561d6257683464-1": {
    name: "msyrupUSD",
    decimal: 18,
    oracle: {
      address: "0x41c60765fA36109b19B21719F4593F19dDeFa663",
      decimal: 8,
    },
  },
  "0x2fE058CcF29f123f9dd2aEC0418AA66a877d8E50-1": {
    name: "msyrupUSDp",
    decimal: 18,
    oracle: {
      address: "0x337d914ff6622510FC2C63ac59c1D07983895241",
      decimal: 8,
    },
  },
  "0x7CF9DEC92ca9FD46f8d86e7798B72624Bc116C05-1": {
    name: "mAPOLLO",
    decimal: 18,
    oracle: {
      address: "0x84303e5568C7B167fa4fEBc6253CDdfe12b7Ee4B",
      decimal: 8,
    },
  },
  "0xA19f6e0dF08a7917F2F8A33Db66D0AF31fF5ECA6-1": {
    name: "mFARM",
    decimal: 18,
    oracle: {
      address: "0x65df7299A9010E399A38d6B7159d25239cDF039b",
      decimal: 8,
    },
  },
  "0x9b5528528656DBC094765E2abB79F293c21191B9-1": {
    name: "mHyper",
    decimal: 18,
    oracle: {
      address: "0x43881B05C3BE68B2d33eb70aDdF9F666C5005f68",
      decimal: 8,
    },
  },
  "0x605A84861EE603e385b01B9048BEa6A86118DB0a-1": {
    name: "mWildUSD",
    decimal: 18,
    oracle: {
      address: "0xb70eCe4F1a87c419E1082691Bb9a49eb7CaAe6a6",
      decimal: 8,
    },
  },
  "0x06e0B0F1A644Bb9881f675Ef266CeC15a63a3d47-1440000": {
    name: "mXRP",
    decimal: 18,
    oracle: {
      address: "0xFF64785Ee22D764F8E79812102d3Fa7f2d3437Af",
      decimal: 8,
    },
  },
};

/* ============================
   Transfer Handler
   ============================ */
indexer.onEvent(
  { contract: "Mtokens", event: "Transfer" },
  async ({ event, context }) => {
  const { from, to, value } = event.params;
  const contractAddress = event.srcAddress;
  const chainId = event.chainId.toString();

  const key = `${contractAddress}-${chainId}`;
  const details = DETAILS[key];
  if (!details) return;

  const { name, decimal } = details;

  // --- CurrentSupply per chain ---
  const currentId = `current-supply-${name}-${chainId}`;
  const current = await context.CurrentSupply.getOrCreate({
    id: currentId,
    symbol: name,
    totalSupply: BigInt(0),
    normalizedTotalSupply: 0.0,
    usdValue: 0.0,
    price: 0.0,
    lastUpdated: BigInt(0),
    chainId,
  });

  let newCurrentTotal = current.totalSupply;

  if (from === "0x0000000000000000000000000000000000000000") {
    newCurrentTotal += value;
  } else if (to === "0x0000000000000000000000000000000000000000") {
    newCurrentTotal -= value;
  }

  const normalizedCurrent = Number(newCurrentTotal) / 10 ** decimal;
  const usdValueCurrent = normalizedCurrent * current.price;

  await context.CurrentSupply.set({
    ...current,
    totalSupply: newCurrentTotal,
    normalizedTotalSupply: normalizedCurrent,
    usdValue: usdValueCurrent,
    lastUpdated: BigInt(Date.now()),
  });

  // --- AggCurrentSupply across all chains ---
  const aggId = `agg-current-supply-${name}`;
  const agg = await context.AggCurrentSupply.getOrCreate({
    id: aggId,
    symbol: name,
    totalSupply: BigInt(0),
    normalizedTotalSupply: 0.0,
    usdValue: 0.0,
    price: 0.0,
    lastUpdated: BigInt(0),
  });

  let newAggTotal = agg.totalSupply;
  if (from === "0x0000000000000000000000000000000000000000") {
    newAggTotal += value;
  } else if (to === "0x0000000000000000000000000000000000000000") {
    newAggTotal -= value;
  }

  const normalizedAgg = Number(newAggTotal) / 10 ** decimal;
  const usdValueAgg = normalizedAgg * agg.price;

  await context.AggCurrentSupply.set({
    ...agg,
    totalSupply: newAggTotal,
    normalizedTotalSupply: normalizedAgg,
    usdValue: usdValueAgg,
    lastUpdated: BigInt(Date.now()),
  });

  // --- Daily snapshots ---
  const timestamp = event.block.timestamp; // BigInt
  const today = new Date(timestamp * 1000).toISOString().split("T")[0];

  // Per-chain DailySnapshot
  const dailyId = `daily-${name}-${chainId}-${today}`;
  await context.DailySnapshot.set({
    id: dailyId,
    symbol: name,
    date: today,
    totalSupply: newCurrentTotal,
    normalizedTotalSupply: normalizedCurrent,
    usdValue: usdValueCurrent,
    price: current.price,
    timestamp: BigInt(timestamp),
    chainId,
  });

  // Aggregate Daily Snapshot
  const aggDailyId = `agg-daily-${name}-${today}`;
  await context.AggDailySnapshot.set({
    id: aggDailyId,
    symbol: name,
    date: today,
    totalSupply: newAggTotal,
    normalizedTotalSupply: normalizedAgg,
    usdValue: usdValueAgg,
    price: agg.price,
    timestamp: BigInt(timestamp),
  });
}
);

/* ============================
   Oracle AnswerUpdated Handler
   ============================ */
// Define your custom oracles and related mapping somewhere globally or above the handler
const CUSTOM_ORACLES: Record<string, { decimal: number; name: string }> = {
  // BTC/USD example
  "0x4a3411ac2948B33c69666B35cc6d055B27Ea84f1": {
    decimal: 8,
    name: "BTC/USD",
  },
};

const RELATED_ORACLES: Record<string, { relatedCustomOracle: string }> = {
  // mevBTC/BTC → BTC/USD
  "0xffd462e0602Dd9FF3F038fd4e77a533f8c474b65": {
    relatedCustomOracle: "BTC/USD",
  },
  // mRe7BTC/BTC → BTC/USD
  "0x9de073685AEb382B7c6Dd0FB93fa0AEF80eB8967": {
    relatedCustomOracle: "BTC/USD",
  },
};

// ----------------------------------------------------
// 1️⃣ ChainLinkOracles (standard feed handler)
// ----------------------------------------------------
indexer.onEvent(
  { contract: "ChainLinkOracles", event: "AnswerUpdated" },
  async ({ event, context }) => {
    const { data } = event.params;
    const oracleAddress = event.srcAddress;
    const chainId = event.chainId.toString();

    // --- Skip if custom oracle (handled separately) ---
    if (CUSTOM_ORACLES[oracleAddress]) return;

    // --- Check if oracle is related to custom oracle ---
    const relatedEntry = RELATED_ORACLES[oracleAddress];
    let relatedCustomPrice: number | null = null;

    if (relatedEntry) {
      const relatedName = relatedEntry.relatedCustomOracle;
      const relatedCustom = Object.entries(CUSTOM_ORACLES).find(
        ([, info]) => info.name === relatedName,
      );

      if (relatedCustom) {
        const [relatedAddress] = relatedCustom;
        const stored = await context.CustomOracle.get(relatedAddress);
        if (stored) relatedCustomPrice = stored.price;
      }
    }

    // --- Normal token logic ---
    const tokenEntry = Object.entries(DETAILS).find(
      ([_, t]) => t.oracle.address === oracleAddress,
    );
    if (!tokenEntry) return;

    const [tokenContract, details] = tokenEntry;
    const { name, decimal } = details;

    const basePrice = Number(data) / 10 ** details.oracle.decimal;
    const price = relatedCustomPrice
      ? basePrice * relatedCustomPrice
      : basePrice;

    console.log(
      `price: ${price}, relatedCustomPrice: ${relatedCustomPrice}, timestamp: ${event.block.timestamp}`,
    );

    // --- Update aggregate USD value ---
    const aggId = `agg-current-supply-${name}`;
    const agg = await context.AggCurrentSupply.getOrCreate({
      id: aggId,
      symbol: name,
      totalSupply: BigInt(0),
      normalizedTotalSupply: 0.0,
      usdValue: 0.0,
      price: 0.0,
      lastUpdated: BigInt(0),
    });

    const normalizedAgg = Number(agg.totalSupply) / 10 ** decimal;
    const usdValueAgg = normalizedAgg * price;

    await context.AggCurrentSupply.set({
      ...agg,
      price,
      usdValue: usdValueAgg,
      lastUpdated: BigInt(Date.now()),
    });

    // --- Per-chain CurrentSupply USD value ---
    const currentId = `current-supply-${name}-${chainId}`;
    const current = await context.CurrentSupply.getOrCreate({
      id: currentId,
      symbol: name,
      totalSupply: BigInt(0),
      normalizedTotalSupply: 0.0,
      usdValue: 0.0,
      price: 0.0,
      lastUpdated: BigInt(0),
      chainId,
    });

    const normalizedCurrent = Number(current.totalSupply) / 10 ** decimal;
    const usdValueCurrent = normalizedCurrent * price;

    await context.CurrentSupply.set({
      ...current,
      price,
      usdValue: usdValueCurrent,
      lastUpdated: BigInt(Date.now()),
    });

    // --- Daily snapshots ---
    const timestamp = event.block.timestamp;
    const today =
      new Date(Number(timestamp) * 1000).toISOString().split("T")[0];

    const dailyId = `daily-${name}-${chainId}-${today}`;
    await context.DailySnapshot.set({
      id: dailyId,
      symbol: name,
      date: today,
      totalSupply: current.totalSupply,
      normalizedTotalSupply: normalizedCurrent,
      usdValue: usdValueCurrent,
      price,
      timestamp: BigInt(timestamp),
      chainId,
    });

    const aggDailyId = `agg-daily-${name}-${today}`;
    await context.AggDailySnapshot.set({
      id: aggDailyId,
      symbol: name,
      date: today,
      totalSupply: agg.totalSupply,
      normalizedTotalSupply: normalizedAgg,
      usdValue: usdValueAgg,
      price,
      timestamp: BigInt(timestamp),
    });
  }
);

// ----------------------------------------------------
// 2️⃣ ChainLinkOracle2 (custom oracle handler)
// ----------------------------------------------------
indexer.onEvent(
  { contract: "AggregatedOracles", event: "AnswerUpdated" },
  async ({ event, context }) => {
    const { current } = event.params;
    const oracleAddress = event.srcAddress;

    const oracle = CUSTOM_ORACLES[oracleAddress];
    if (!oracle) return; // safety check

    const price = Number(current) / 10 ** oracle.decimal;

    await context.CustomOracle.set({
      id: oracleAddress,
      address: oracleAddress,
      price,
      lastUpdated: BigInt(event.block.timestamp),
    });
  }
);

indexer.onEvent(
  { contract: "ScribeOracles", event: "Poked" },
  async ({ event, context }) => {
  const { val } = event.params;
  const oracleAddress = event.srcAddress;
  const chainId = event.chainId.toString();

  const tokenEntry = Object.entries(DETAILS).find(
    ([_, t]) => t.oracle.address === oracleAddress,
  );
  if (!tokenEntry) return;

  const [tokenContract, details] = tokenEntry;
  const { name, decimal } = details;

  const price = Number(val) / 10 ** details.oracle.decimal;

  // --- Update aggregate supply USD value ---
  const aggId = `agg-current-supply-${name}`;
  const agg = await context.AggCurrentSupply.getOrCreate({
    id: aggId,
    symbol: name,
    totalSupply: BigInt(0),
    normalizedTotalSupply: 0.0,
    usdValue: 0.0,
    price: 0.0,
    lastUpdated: BigInt(0),
  });

  const normalizedAgg = Number(agg.totalSupply) / 10 ** decimal;
  const usdValueAgg = normalizedAgg * price;

  await context.AggCurrentSupply.set({
    ...agg,
    price,
    usdValue: usdValueAgg,
    lastUpdated: BigInt(Date.now()),
  });

  // --- Update per-chain CurrentSupply USD value ---
  const currentId = `current-supply-${name}-${chainId}`;
  const current = await context.CurrentSupply.getOrCreate({
    id: currentId,
    symbol: name,
    totalSupply: BigInt(0),
    normalizedTotalSupply: 0.0,
    usdValue: 0.0,
    price: 0.0,
    lastUpdated: BigInt(0),
    chainId,
  });

  const normalizedCurrent = Number(current.totalSupply) / 10 ** decimal;
  const usdValueCurrent = normalizedCurrent * price;

  await context.CurrentSupply.set({
    ...current,
    price,
    usdValue: usdValueCurrent,
    lastUpdated: BigInt(Date.now()),
  });

  // --- Daily snapshots ---
  const timestamp = event.block.timestamp; // BigInt
  const today = new Date(timestamp * 1000).toISOString().split("T")[0];

  // Per-chain DailySnapshot
  const dailyId = `daily-${name}-${chainId}-${today}`;
  await context.DailySnapshot.set({
    id: dailyId,
    symbol: name,
    date: today,
    totalSupply: current.totalSupply,
    normalizedTotalSupply: normalizedCurrent,
    usdValue: usdValueCurrent,
    price,
    timestamp: BigInt(timestamp),
    chainId,
  });

  // Aggregate Daily Snapshot
  const aggDailyId = `agg-daily-${name}-${today}`;
  await context.AggDailySnapshot.set({
    id: aggDailyId,
    symbol: name,
    date: today,
    totalSupply: agg.totalSupply,
    normalizedTotalSupply: normalizedAgg,
    usdValue: usdValueAgg,
    price,
    timestamp: BigInt(timestamp),
  });
}
);
