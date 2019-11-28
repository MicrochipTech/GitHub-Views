Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw: function(ease) {
    Chart.controllers.line.prototype.draw.call(this, ease);

    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
        ctx = this.chart.ctx,
        x = activePoint.tooltipPosition().x,
        topY = this.chart.scales["y-axis-0"].top,
        bottomY = this.chart.scales["y-axis-0"].bottom;

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
});

Chart.Tooltip.positioners.nearPointer = function(elements, eventPosition) {
  var tooltip = this;

  return {
    x: eventPosition.x,
    y: eventPosition.y
  };
};
