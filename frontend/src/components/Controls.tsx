import React, { useState } from "react";

interface ControlsProps {
    running: boolean;
    onStrategyChange: (strategy: string) => void;
    onToggleRunning: () => void;
}

const Controls: React.FC<ControlsProps> = ({ running, onStrategyChange, onToggleRunning }) => {
    const [selectedStrategy, setSelectedStrategy] = useState("momentum");

    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const strategy = e.target.value;
        setSelectedStrategy(strategy);
        onStrategyChange(strategy);
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <label htmlFor="strategy" style={{ marginRight: "1rem" }}>
                Strategy:
            </label>
            <select
                id="strategy"
                value={selectedStrategy}
                onChange={handleStrategyChange}
                style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginRight: "1rem"
                }}
            >
                <option value="momentum">Momentum</option>
                <option value="rsi">RSI</option>
                <option value="breakout">Breakout</option>
            </select>

            <button
                onClick={onToggleRunning}
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: running ? "#ef4444" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                {running ? "Pause Bot" : "Start Bot"}
            </button>
        </div>
    );
};

export default Controls;
