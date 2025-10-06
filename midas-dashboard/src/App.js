// App.jsx (updated legend section + styling)
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
const CHAIN_IDS = ["1", "8453", "23294", "98866", "30", "42793"];

// 👇 Add your chain names here
const CHAIN_NAMES = {
    1: "Ethereum",
    8453: "Base",
    23294: "Oasis",
    98866: "Plume",
    30: "Rootstock",
    42793: "Etherlink",
};

// consistent color palette
const CHAIN_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#14b8a6", // teal
];

function App() {
    const [dailyData, setDailyData] = useState({});
    const [aggData, setAggData] = useState(null);

    useEffect(() => {
        fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                query {
                    AggCurrentSupply {
                        price
                        normalizedTotalSupply
                        usdValue
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
    }, []);

    useEffect(() => {
        const fetchSnapshots = async () => {
            const allData = {};
            for (let chainId of CHAIN_IDS) {
                try {
                    const res = await fetch(GRAPHQL_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            query: `
                            query {
                                DailySnapshot(where: {chainId: {_eq: "${chainId}"}}, order_by: {date: asc}) {
                                    chainId
                                    date
                                    usdValue
                                    price
                                    normalizedTotalSupply
                                }
                            }`,
                        }),
                    });
                    const result = await res.json();
                    const snapshots = result.data?.DailySnapshot || [];
                    allData[chainId] = snapshots.map((s) => ({
                        date: s.date,
                        usdValue: parseFloat(s.usdValue),
                    }));
                } catch (err) {
                    console.error(`Error fetching chain ${chainId}`, err);
                }
            }
            setDailyData(allData);
        };
        fetchSnapshots();
    }, []);

    const chartData = () => {
        const allDates = new Set();
        Object.values(dailyData).forEach((chain) =>
            chain.forEach((item) => allDates.add(item.date))
        );
        const sortedDates = Array.from(allDates).sort();

        return sortedDates.map((date) => {
            const point = { date };
            Object.keys(dailyData).forEach((chainId) => {
                const d = dailyData[chainId].find((x) => x.date === date);
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
                {aggData && (
                    <div style={{ marginBottom: "15px" }}>
                        <h2
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            mTBILL NAV {formatUSD(parseFloat(aggData.usdValue))}
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

                {/* Top-left colored chain labels */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "20px",
                    }}
                >
                    {CHAIN_IDS.map((id, i) => (
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
                                    backgroundColor: CHAIN_COLORS[i],
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
                            <YAxis
                                stroke="#6b7280"
                                tickFormatter={(v) => formatUSD(v)}
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
                                    background: "#fff",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                }}
                            />
                            {CHAIN_IDS.map((chainId, idx) => (
                                <Line
                                    key={chainId}
                                    type="monotone"
                                    dataKey={`chain-${chainId}`}
                                    stroke={CHAIN_COLORS[idx]}
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
