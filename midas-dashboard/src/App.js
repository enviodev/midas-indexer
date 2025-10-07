// App.jsx — Dynamic symbol selection + auto chain legend + dynamic colors
import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8080/v1/graphql";

// Chain name mapping
const CHAIN_NAMES = {
    1: "Ethereum",
    8453: "Base",
    23294: "Oasis",
    98866: "Plume",
    30: "Rootstock",
    42793: "Etherlink",
};

// Color palette (cycled)
const CHAIN_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#14b8a6", // teal
    "#ec4899", // pink
    "#6366f1", // indigo
    "#84cc16", // lime
    "#f97316", // orange
];

function App() {
    const [symbols, setSymbols] = useState([]); // all available symbols
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [aggData, setAggData] = useState(null);
    const [dailyData, setDailyData] = useState({});
    const [chainIds, setChainIds] = useState([]);

    // Fetch all symbols for dropdown
    useEffect(() => {
        fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                query {
                    AggCurrentSupply {
                        symbol
                    }
                }`,
            }),
        })
            .then((res) => res.json())
            .then((result) => {
                const list =
                    result.data?.AggCurrentSupply?.map((d) => d.symbol) || [];
                setSymbols(list);
                if (list.length > 0) setSelectedSymbol(list[0]);
            })
            .catch(console.error);
    }, []);

    // Fetch AggCurrentSupply for selected symbol
    useEffect(() => {
        if (!selectedSymbol) return;

        fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                query {
                    AggCurrentSupply(where: {symbol: {_eq: "${selectedSymbol}"}}) {
                        price
                        normalizedTotalSupply
                        usdValue
                        symbol
                    }
                }`,
            }),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.data?.AggCurrentSupply?.length > 0) {
                    setAggData(result.data.AggCurrentSupply[0]);
                }
            })
            .catch(console.error);
    }, [selectedSymbol]);

    // Fetch all DailySnapshots for the selected symbol (then split by chain)
    useEffect(() => {
        if (!selectedSymbol) return;

        const fetchSnapshots = async () => {
            try {
                const res = await fetch(GRAPHQL_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: `
                        query {
                            DailySnapshot(where: {symbol: {_eq: "${selectedSymbol}"}}, order_by: {date: asc}) {
                                chainId
                                date
                                usdValue
                            }
                        }`,
                    }),
                });
                const result = await res.json();
                const snapshots = result.data?.DailySnapshot || [];

                // Group by chainId
                const grouped = {};
                snapshots.forEach((s) => {
                    if (!grouped[s.chainId]) grouped[s.chainId] = [];
                    grouped[s.chainId].push({
                        date: s.date,
                        usdValue: parseFloat(s.usdValue),
                    });
                });

                setDailyData(grouped);
                setChainIds(Object.keys(grouped));
            } catch (err) {
                console.error("Error fetching DailySnapshot:", err);
            }
        };

        fetchSnapshots();
    }, [selectedSymbol]);

    // Build chart data across all chain IDs
    const chartData = () => {
        const allDates = new Set();
        Object.values(dailyData).forEach((arr) =>
            arr.forEach((item) => allDates.add(item.date))
        );
        const sortedDates = Array.from(allDates).sort();

        return sortedDates.map((date) => {
            const point = { date };
            chainIds.forEach((chainId) => {
                const d = dailyData[chainId]?.find((x) => x.date === date);
                point[`chain-${chainId}`] = d ? d.usdValue : null;
            });
            return point;
        });
    };

    // Helpers
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
        });
    };

    const formatUSD = (v) => {
        if (!v && v !== 0) return "";
        if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
        if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
        return `$${v.toFixed(2)}`;
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f5f9",
                padding: "40px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "30px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
                }}
            >
                {/* Symbol Selector */}
                <div style={{ marginBottom: "25px" }}>
                    <label
                        style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#111827",
                            marginRight: "10px",
                        }}
                    >
                        Select Symbol:
                    </label>
                    <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            fontSize: "15px",
                        }}
                    >
                        {symbols.map((sym) => (
                            <option key={sym} value={sym}>
                                {sym}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Aggregated Data */}
                {aggData && (
                    <div style={{ marginBottom: "15px" }}>
                        <h2
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {aggData.symbol} NAV{" "}
                            {formatUSD(parseFloat(aggData.usdValue))}
                        </h2>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "15px",
                                marginTop: "4px",
                            }}
                        >
                            {parseFloat(
                                aggData.normalizedTotalSupply
                            ).toLocaleString()}{" "}
                            tokens at ${parseFloat(aggData.price).toFixed(2)}{" "}
                            price
                        </p>
                    </div>
                )}

                {/* Dynamic Chain Legend */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "20px",
                    }}
                >
                    {chainIds.map((id, i) => (
                        <div
                            key={id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <div
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        CHAIN_COLORS[i % CHAIN_COLORS.length],
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "14px",
                                    color: "#374151",
                                    fontWeight: 500,
                                }}
                            >
                                {CHAIN_NAMES[id] || `Chain ${id}`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div style={{ width: "100%", height: 450 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData()}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#6b7280"
                                interval="preserveStartEnd"
                            />
                            <YAxis stroke="#6b7280" tickFormatter={formatUSD} />
                            <Tooltip
                                formatter={(value, name) => [
                                    formatUSD(value),
                                    CHAIN_NAMES[name.split("-")[1]] || name,
                                ]}
                                labelFormatter={(label) =>
                                    new Date(label).toDateString()
                                }
                                contentStyle={{
                                    background: "#fff",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                }}
                            />
                            {chainIds.map((chainId, idx) => (
                                <Line
                                    key={chainId}
                                    type="monotone"
                                    dataKey={`chain-${chainId}`}
                                    stroke={
                                        CHAIN_COLORS[idx % CHAIN_COLORS.length]
                                    }
                                    strokeWidth={2.2}
                                    dot={false}
                                    connectNulls={true}
                                    name={`chain-${chainId}`}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default App;
