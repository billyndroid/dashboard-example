//from chartjs.org

const config = {
    type: 'line',
    data: {
      datasets: [{
        borderColor: Utils.CHART_COLORS.red,
        borderWidth: 1,
        radius: 0,
        data: data,
      },
      {
        borderColor: Utils.CHART_COLORS.blue,
        borderWidth: 1,
        radius: 0,
        data: data2,
      }]
    },
    options: {
      animation,
      interaction: {
        intersect: false
      },
      plugins: {
        legend: false
      },
      scales: {
        x: {
          type: 'linear'
        }
      }
    }
  };