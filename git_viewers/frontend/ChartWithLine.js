Chart.defaults.LineWithLine = Chart.defaults.line;

function draw(ease) {
  Chart.controllers.line.prototype.draw.call(this, ease);

  if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
    const activePoint = this.chart.tooltip._active[0];
    const { ctx } = this.chart;
    const { x } = activePoint.tooltipPosition();
    const topY = this.chart.scales["y-axis-0"].top;
    const bottomY = this.chart.scales["y-axis-0"].bottom;

    // draw line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";
    ctx.stroke();
    ctx.restore();
  }
}

Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw
});

Chart.Tooltip.positioners.nearPointer = (elements, eventPosition) => {
  // const tooltip = this;

  return {
    x: eventPosition.x,
    y: eventPosition.y
  };
};
