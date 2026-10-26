(function () {
  'use strict';

  var COLORS = {
    '成交': '#c4555f',
    '流拍': '#7d7263',
    '未提供': '#a98f6b',
    '未提交': '#6f8176',
    '未著录': '#5d574f'
  };
  var PAPER = '#eee2ce';
  var PAPER_SOFT = '#d8c8ae';
  var MUTED = '#a79882';
  var LINE = 'rgba(238,226,206,.14)';
  var PANEL = '#28231e';

  function readData(id, fallback) {
    var node = document.getElementById(id);
    if (!node) {
      return fallback;
    }
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error('无法读取图表数据：' + id, error);
      return fallback;
    }
  }

  function init(id) {
    var dom = document.getElementById(id);
    return dom && window.echarts ? window.echarts.init(dom) : null;
  }

  function tooltip() {
    return {
      backgroundColor: 'rgba(29,26,23,.96)',
      borderColor: 'rgba(238,226,206,.25)',
      borderWidth: 1,
      padding: 12,
      textStyle: { color: PAPER, fontSize: 12 },
      extraCssText: 'box-shadow:0 14px 34px rgba(0,0,0,.34);'
    };
  }

  function axisStyle(rotate) {
    return {
      axisLine: { lineStyle: { color: LINE } },
      axisTick: { show: false },
      axisLabel: {
        color: MUTED,
        fontSize: 10,
        rotate: rotate || 0,
        hideOverlap: true
      },
      splitLine: { lineStyle: { color: LINE, type: 'dashed' } }
    };
  }

  function renderYear() {
    var chart = init('year-chart');
    if (!chart) {
      return;
    }
    var data = readData('year-data', { years: [], series: [] });
    chart.setOption({
      color: data.series.map(function (item) { return COLORS[item.name] || '#a79882'; }),
      tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, tooltip()),
      legend: {
        top: 2,
        right: 4,
        textStyle: { color: MUTED, fontSize: 10 },
        itemWidth: 9,
        itemHeight: 9
      },
      grid: { left: 46, right: 18, top: 48, bottom: 42 },
      xAxis: Object.assign({
        type: 'category',
        data: data.years
      }, axisStyle()),
      yAxis: Object.assign({
        type: 'value',
        name: '记录数',
        nameTextStyle: { color: MUTED, fontSize: 10 },
        minInterval: 1
      }, axisStyle()),
      series: data.series.map(function (item) {
        return {
          name: item.name,
          type: 'bar',
          stack: 'records',
          barMaxWidth: 25,
          data: item.values,
          itemStyle: {
            color: COLORS[item.name] || '#a79882',
            borderColor: PANEL,
            borderWidth: 1
          },
          emphasis: { focus: 'series' }
        };
      })
    });
  }

  function renderStatus() {
    var chart = init('status-chart');
    if (!chart) {
      return;
    }
    var data = readData('status-data', []);
    chart.setOption({
      tooltip: Object.assign({
        trigger: 'item',
        formatter: '{b}<br/>{c} 条 · {d}%'
      }, tooltip()),
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'center',
        textStyle: { color: MUTED, fontSize: 10 },
        itemWidth: 9,
        itemHeight: 9
      },
      series: [{
        name: '成交状态',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['36%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: PANEL,
          borderWidth: 3
        },
        label: {
          show: true,
          color: PAPER_SOFT,
          fontSize: 10,
          formatter: '{c}'
        },
        labelLine: {
          length: 8,
          length2: 7,
          lineStyle: { color: LINE }
        },
        data: data.map(function (item) {
          return {
            name: item.name,
            value: item.value,
            itemStyle: { color: COLORS[item.name] || '#a79882' }
          };
        })
      }]
    });
    chart.on('click', function (params) {
      window.location.href = 'browse.html?status=' + encodeURIComponent(params.name);
    });
  }

  function renderCompanies() {
    var chart = init('company-chart');
    if (!chart) {
      return;
    }
    var data = readData('company-data', []);
    var names = data.map(function (item) { return item.name; }).reverse();
    var sold = data.map(function (item) { return item.sold; }).reverse();
    var others = data.map(function (item) { return item.total - item.sold; }).reverse();
    chart.setOption({
      tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, tooltip()),
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: MUTED, fontSize: 10 },
        itemWidth: 9,
        itemHeight: 9
      },
      grid: { left: 88, right: 16, top: 32, bottom: 26 },
      xAxis: Object.assign({ type: 'value', minInterval: 1 }, axisStyle()),
      yAxis: Object.assign({
        type: 'category',
        data: names,
        axisLabel: {
          color: PAPER_SOFT,
          fontSize: 10,
          width: 76,
          overflow: 'truncate'
        }
      }, axisStyle()),
      series: [
        {
          name: '成交',
          type: 'bar',
          stack: 'company',
          barMaxWidth: 13,
          data: sold,
          itemStyle: { color: COLORS['成交'] }
        },
        {
          name: '其他状态',
          type: 'bar',
          stack: 'company',
          barMaxWidth: 13,
          data: others,
          itemStyle: { color: '#655d53' }
        }
      ]
    });
  }

  function renderPrice() {
    var chart = init('price-chart');
    if (!chart) {
      return;
    }
    var data = readData('price-data', { labels: [], values: [], count: 0 });
    chart.setOption({
      tooltip: Object.assign({
        trigger: 'axis',
        formatter: function (items) {
          var item = items[0];
          return item.name + '<br/>' + item.value + ' 条有效成交记录';
        }
      }, tooltip()),
      grid: { left: 42, right: 14, top: 24, bottom: 38 },
      xAxis: Object.assign({
        type: 'category',
        data: data.labels
      }, axisStyle()),
      yAxis: Object.assign({
        type: 'value',
        minInterval: 1
      }, axisStyle()),
      series: [{
        type: 'bar',
        data: data.values,
        barMaxWidth: 38,
        itemStyle: {
          color: '#a98f6b',
          borderRadius: [2, 2, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: PAPER_SOFT,
          fontSize: 10
        }
      }]
    });
  }

  function renderSizes() {
    var chart = init('size-chart');
    if (!chart) {
      return;
    }
    var data = readData('size-data', []);
    var statuses = ['成交', '流拍', '未提供', '未提交', '未著录'];
    var series = statuses.map(function (status) {
      return {
        name: status,
        type: 'scatter',
        symbolSize: function (value, params) {
          return params.data.price ? 13 : 9;
        },
        data: data.filter(function (item) { return item.status === status; }).map(function (item) {
          return {
            name: item.name,
            value: item.value,
            status: item.status,
            price: item.price,
            itemStyle: { color: COLORS[status] || '#a79882' }
          };
        }),
        emphasis: {
          scale: 1.6,
          itemStyle: {
            borderColor: PAPER,
            borderWidth: 1
          }
        }
      };
    });
    chart.setOption({
      tooltip: Object.assign({
        trigger: 'item',
        formatter: function (params) {
          var item = params.data;
          return '<strong>' + item.name + '</strong><br/>' +
            '高 ' + item.value[0] + ' cm · 宽 ' + item.value[1] + ' cm<br/>' +
            item.status + (item.price ? ' · RMB ' + Number(item.price).toLocaleString() : '');
        }
      }, tooltip()),
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: MUTED, fontSize: 10 },
        itemWidth: 9,
        itemHeight: 9
      },
      grid: { left: 48, right: 22, top: 46, bottom: 48 },
      xAxis: Object.assign({
        type: 'value',
        name: '高 / cm',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: MUTED, fontSize: 10 },
        scale: true
      }, axisStyle()),
      yAxis: Object.assign({
        type: 'value',
        name: '宽 / cm',
        nameTextStyle: { color: MUTED, fontSize: 10 },
        scale: true
      }, axisStyle()),
      series: series
    });
    chart.on('click', function (params) {
      if (params.data && params.data.value && params.data.value[2]) {
        window.location.href = 'items/' + params.data.value[2] + '.html';
      }
    });
  }

  function renderEra() {
    var chart = init('era-chart');
    if (!chart) {
      return;
    }
    var data = readData('era-data', []);
    chart.setOption({
      tooltip: Object.assign({
        trigger: 'axis',
        formatter: '{b}<br/>{c} 条记录'
      }, tooltip()),
      grid: { left: 42, right: 14, top: 28, bottom: 42 },
      xAxis: Object.assign({
        type: 'category',
        data: data.map(function (item) { return item.name; })
      }, axisStyle(24)),
      yAxis: Object.assign({
        type: 'value',
        minInterval: 1
      }, axisStyle()),
      series: [{
        type: 'bar',
        data: data.map(function (item) { return item.value; }),
        barMaxWidth: 34,
        itemStyle: {
          color: '#7ca58c',
          borderRadius: [2, 2, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: PAPER_SOFT,
          fontSize: 10
        }
      }]
    });
  }

  function renderAll() {
    renderYear();
    renderStatus();
    renderCompanies();
    renderPrice();
    renderSizes();
    renderEra();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }

  window.addEventListener('resize', function () {
    ['year-chart', 'status-chart', 'company-chart', 'price-chart', 'size-chart', 'era-chart'].forEach(function (id) {
      var dom = document.getElementById(id);
      var chart = dom && window.echarts && window.echarts.getInstanceByDom(dom);
      if (chart) {
        chart.resize();
      }
    });
  });
})();
