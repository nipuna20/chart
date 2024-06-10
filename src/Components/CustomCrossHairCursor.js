import React from 'react';
import { GenericChartComponent, getMouseCanvas } from 'react-financial-charts';

class CustomCrossHairCursor extends React.Component {
    drawOnCanvas = (ctx, moreProps) => {
        const { mouseXY, height, width } = moreProps;

        const [x, y] = mouseXY;

        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    };

    render() {
        return (
            <GenericChartComponent
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={['mousemove', 'pan']}
            />
        );
    }
}

export default CustomCrossHairCursor;
