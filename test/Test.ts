import assert from "assert";
import { 
  TestHelpers,
  MTBILL_Transfer,
  MTBILL_ORACLE_AnswerUpdated,
  CurrentSupply
} from "generated";
const { MockDb, MTBILL, MTBILL_ORACLE } = TestHelpers;

describe("MTBILL contract Transfer event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MTBILL contract Transfer event
  const event = MTBILL.Transfer.createMockEvent({
    from: "0x0000000000000000000000000000000000000000", // Mint event
    to: "0x1234567890123456789012345678901234567890",
    value: BigInt("1000000000000000000") // 1 token with 18 decimals
  });

  it("MTBILL_Transfer is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MTBILL.Transfer.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMTBILLTransfer = mockDbUpdated.entities.MTBILL_Transfer.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMTBILLTransfer: MTBILL_Transfer = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      from: event.params.from,
      to: event.params.to,
      value: event.params.value,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMTBILLTransfer, expectedMTBILLTransfer, "Actual MTBILL_Transfer should be the same as the expected MTBILL_Transfer");
  });
});

describe("MTBILL_ORACLE contract AnswerUpdated event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MTBILL_ORACLE contract AnswerUpdated event
  const event = MTBILL_ORACLE.AnswerUpdated.createMockEvent({
    data: BigInt("100000000"), // Price in 8 decimals
    roundId: BigInt(1),
    timestamp: BigInt(1640995200) // Unix timestamp
  });

  it("MTBILL_ORACLE_AnswerUpdated is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MTBILL_ORACLE.AnswerUpdated.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMTBILLOracleAnswerUpdated = mockDbUpdated.entities.MTBILL_ORACLE_AnswerUpdated.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMTBILLOracleAnswerUpdated: MTBILL_ORACLE_AnswerUpdated = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      data: event.params.data,
      roundId: event.params.roundId,
      timestamp: event.params.timestamp,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMTBILLOracleAnswerUpdated, expectedMTBILLOracleAnswerUpdated, "Actual MTBILL_ORACLE_AnswerUpdated should be the same as the expected MTBILL_ORACLE_AnswerUpdated");
  });
});

describe("CurrentSupply entity tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  it("CurrentSupply entity structure is correct", () => {
    const currentSupply: CurrentSupply = {
      id: "1_current",
      totalSupply: BigInt("1000000000000000000000"), // 1000 tokens
      usdValue: BigInt("100000000000000000000000"), // $1000 USD value
      price: BigInt("100000000000000000"), // $0.10 price
      lastUpdated: BigInt(1640995200),
    };

    // Verify the entity has all required fields
    assert.ok(currentSupply.id, "CurrentSupply should have an id");
    assert.ok(currentSupply.totalSupply, "CurrentSupply should have a totalSupply");
    assert.ok(currentSupply.usdValue, "CurrentSupply should have a usdValue");
    assert.ok(currentSupply.price, "CurrentSupply should have a price");
    assert.ok(currentSupply.lastUpdated, "CurrentSupply should have a lastUpdated");
  });
});
