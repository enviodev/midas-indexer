// App.jsx — Sleek Minimal Modern UI
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

const GRAPHQL_ENDPOINT = "https://indexer.dev.hyperindex.xyz/b440b06/v1/graphql";

const CHAIN_NAMES = {
    1: "Ethereum",
    8453: "Base",
    23294: "Oasis",
    98866: "Plume",
    30: "Rootstock",
    42793: "Etherlink",
};

const CHAIN_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
    "#6366f1",
    "#84cc16",
    "#f97316",
];

function App() {
    const [symbols, setSymbols] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [aggData, setAggData] = useState(null);
    const [dailyData, setDailyData] = useState({});
    const [chainIds, setChainIds] = useState([]);

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
                minHeight: "100%",
                background: "linear-gradient(135deg, #f9fafb, #e5e7eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 10px",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "950px",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    padding: "35px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        marginBottom: "28px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Chain NAV Dashboard
                    </h1>
                    <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            background: "#f9fafb",
                            fontSize: "15px",
                            fontWeight: 500,
                            color: "#111827",
                            outline: "none",
                            transition: "all 0.2s ease",
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
                    <div style={{ marginBottom: "20px" }}>
                        <h2
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {aggData.symbol} {" "}
                            {formatUSD(parseFloat(aggData.usdValue))}
                        </h2>
                        <p
                            style={{
                                color: "#6b7280",
                                fontSize: "14.5px",
                                marginTop: "4px",
                            }}
                        >
                            {parseFloat(
                                aggData.normalizedTotalSupply
                            ).toLocaleString()}{" "}
                            tokens · ${parseFloat(aggData.price).toFixed(2)}{" "}
                            each
                        </p>
                    </div>
                )}

                {/* Chain Legend */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "16px",
                    }}
                >
                    {chainIds.map((id, i) => (
                        <div
                            key={id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: `${
                                    CHAIN_COLORS[i % CHAIN_COLORS.length]
                                }15`,
                                color: CHAIN_COLORS[i % CHAIN_COLORS.length],
                                padding: "6px 10px",
                                borderRadius: "9999px",
                                fontSize: "13px",
                                fontWeight: 500,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            <div
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        CHAIN_COLORS[i % CHAIN_COLORS.length],
                                    marginRight: "6px",
                                }}
                            />
                            {CHAIN_NAMES[id] || `Chain ${id}`}
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div
                    style={{
                        width: "100%",
                        height: 420,
                        borderRadius: "14px",
                        // overflow: "hidden",
                        background: "#fff",
                    }}
                >
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart
                            data={chartData()}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 20,
                                bottom: 40,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f3f4f6"
                            />

                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9ca3af"
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd" // prevents crowding
                                minTickGap={40} // adds breathing room between ticks
                                height={40} // gives space for labels
                            />

                            <YAxis
                                stroke="#9ca3af"
                                tickFormatter={formatUSD}
                                tickLine={false}
                                axisLine={false}
                                width={80} // ensures labels like $16.0M are fully visible
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    formatUSD(value),
                                    CHAIN_NAMES[name.split("-")[1]] || name,
                                ]}
                                labelFormatter={(label) =>
                                    new Date(label).toDateString()
                                }
                                contentStyle={{
                                    background: "rgba(255,255,255,0.95)",
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                    fontSize: "13px",
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
                                    strokeWidth={2.4}
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
