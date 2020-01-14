export default {
  tooltips: {
    intersect: false,
    mode: "label",
    position: "nearPointer"
  },
  scales: {
    xAxes: [
      {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true
        }
      }
    ]
  },
  elements: {
    line: {
      tension: 0
    }
  }
};
