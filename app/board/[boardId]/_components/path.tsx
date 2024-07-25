import { getSvgPathFromStroke } from "@/lib/utils";
import getStroke from "perfect-freehand";

interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
}

export const Path = ({ x, y, points, fill, onPointerDown, stroke }: PathProps) => {
    const invertedPoints = points.map(point => [point[0], -point[1]]);

    return (
        <path
            className="drop-shadow-md"
            onPointerDown={onPointerDown}
            d={getSvgPathFromStroke(
                getStroke(invertedPoints, {
                    size: 16,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5
                })
            )}
            style={{
                transform: `translate(${x}px, ${y}px) scale(1, -1)`
            }}
            x={0}
            y={0}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
        />
    )
}