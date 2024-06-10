import React from "react";
import { format } from "d3-format";

const SingleValueTooltip = ({
    forSeries,
    label,
    valueFormat = format(".2f"),
    origin = [0, 0],
}) => {
    if (!forSeries) return null;

    const { open, high, low, close } = forSeries;

    return (
        <g transform={`translate(${origin[0]}, ${origin[1]})`}>
            <text x={0} y={0} className="single-value-tooltip">
                {`${label}`}
            </text>
            <rect x={0} y={15} width={100} height={80} fill="#fff" stroke="#000" />
            <text x={5} y={30}>{`Open: ${valueFormat(open)}`}</text>
            <text x={5} y={50}>{`High: ${valueFormat(high)}`}</text>
            <text x={5} y={70}>{`Low: ${valueFormat(low)}`}</text>
            <text x={5} y={90}>{`Close: ${valueFormat(close)}`}</text>
        </g>
    );
};

export default SingleValueTooltip;
