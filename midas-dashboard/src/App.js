// App.jsx
import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8080/v1/graphql";
const CHAIN_IDS = ["1", "8453", "23294", "98866", "30", "42793"];

const SNAPSHOT_QUERY = (chainId) => `
query DailySnapshotQuery {
  DailySnapshot(where: {chainId: {_eq: "${chainId}"}}, order_by: {date: asc}) {
    chainId
    date
    usdValue
    price
    normalizedTotalSupply
  }
}
`;

const AGG_QUERY = `
query AggQuery {
  AggCurrentSupply {
    price
    normalizedTotalSupply
    totalSupply
    usdValue
    lastUpdated
  }
}
`;

function App() {
    const [dailyData, setDailyData] = useState({});
    const [aggData, setAggData] = useState(null);

    useEffect(() => {
        // Fetch aggregate data
        fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: AGG_QUERY }),
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
                            query: SNAPSHOT_QUERY(chainId),
                        }),
                    });
                    const result = await res.json();
                    const snapshots = result.data?.DailySnapshot || [];

                    if (snapshots.length === 0) {
                        allData[chainId] = [];
                        continue;
                    }

                    const filledData = [];
                    let lastSnapshot = null;
                    const startDate = new Date(snapshots[0].date);
                    const endDate = new Date(
                        snapshots[snapshots.length - 1].date
                    );

                    for (
                        let d = new Date(startDate);
                        d <= endDate;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const dateStr = d.toISOString().split("T")[0];
                        const snap = snapshots.find((s) => s.date === dateStr);
                        if (snap) lastSnapshot = snap;

                        if (lastSnapshot) {
                            filledData.push({
                                date: dateStr,
                                usdValue: parseFloat(lastSnapshot.usdValue),
                                price: parseFloat(lastSnapshot.price),
                                normalizedTotalSupply: parseFloat(
                                    lastSnapshot.normalizedTotalSupply
                                ),
                            });
                        }
                    }

                    allData[chainId] = filledData;
                } catch (err) {
                    console.error(
                        `Error fetching snapshots for chain ${chainId}:`,
                        err
                    );
                    allData[chainId] = [];
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
                const dayData = dailyData[chainId].find((d) => d.date === date);
                point[`chain-${chainId}`] = dayData ? dayData.usdValue : null;
            });
            return point;
        });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div
            style={{
                padding: "30px",
                fontFamily: "Arial, sans-serif",
                background: "#f5f5f5",
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "#333",
                }}
            >
                mTBILL Token Info
            </h1>

            {aggData && (
                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        justifyContent: "center",
                        marginBottom: "40px",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            minWidth: "150px",
                        }}
                    >
                        <h4>USD Value</h4>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                            ${parseFloat(aggData.usdValue).toLocaleString()}
                        </p>
                    </div>
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            minWidth: "150px",
                        }}
                    >
                        <h4>Price</h4>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                            ${parseFloat(aggData.price).toFixed(4)}
                        </p>
                    </div>
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            minWidth: "180px",
                        }}
                    >
                        <h4>Normalized Supply</h4>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                            {parseFloat(
                                aggData.normalizedTotalSupply
                            ).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            <div
                style={{
                    width: "100%",
                    height: 500,
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
            >
                <ResponsiveContainer>
                    <LineChart data={chartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#555"
                        />
                        <YAxis stroke="#555" />
                        <Tooltip
                            formatter={(value) =>
                                value ? value.toLocaleString() : "N/A"
                            }
                        />
                        <Legend />
                        {CHAIN_IDS.map((chainId, idx) => (
                            <Line
                                key={chainId}
                                type="monotone"
                                dataKey={`chain-${chainId}`}
                                stroke={
                                    [
                                        "#8884d8",
                                        "#82ca9d",
                                        "#ffc658",
                                        "#ff7300",
                                        "#00c49f",
                                        "#a4de6c",
                                    ][idx]
                                }
                                name={`Chain ${chainId}`}
                                connectNulls={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default App;
