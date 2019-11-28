/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./ChartWithLine.js":
/*!**************************!*\
  !*** ./ChartWithLine.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("Chart.defaults.LineWithLine = Chart.defaults.line;\r\nChart.controllers.LineWithLine = Chart.controllers.line.extend({\r\n   draw: function(ease) {\r\n      Chart.controllers.line.prototype.draw.call(this, ease);\r\n\r\n      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {\r\n         var activePoint = this.chart.tooltip._active[0],\r\n             ctx = this.chart.ctx,\r\n             x = activePoint.tooltipPosition().x,\r\n             topY = this.chart.scales['y-axis-0'].top,\r\n             bottomY = this.chart.scales['y-axis-0'].bottom;\r\n\r\n         // draw line\r\n         ctx.save();\r\n         ctx.beginPath();\r\n         ctx.moveTo(x, topY);\r\n         ctx.lineTo(x, bottomY);\r\n         ctx.lineWidth = 1;\r\n         ctx.strokeStyle = '#555';\r\n         ctx.stroke();\r\n         ctx.restore();\r\n      }\r\n   }\r\n});\r\n\r\nChart.Tooltip.positioners.nearPointer = function(elements, eventPosition) {\r\n    var tooltip = this;\r\n\r\n    return {\r\n        x: eventPosition.x,\r\n        y: eventPosition.y\r\n    };\r\n};\r\n\n\n//# sourceURL=webpack:///./ChartWithLine.js?");

/***/ }),

/***/ "./chartOptions.js":
/*!*************************!*\
  !*** ./chartOptions.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\r\n  tooltips: {\r\n    intersect: false,\r\n    mode: 'label',\r\n    position: 'nearPointer',\r\n  },\r\n  scales: {\r\n    xAxes: [{\r\n      ticks: {\r\n        autoSkip: true,\r\n        maxTicksLimit: 8\r\n      }\r\n    }],\r\n    yAxes: [{\r\n      ticks: {\r\n        beginAtZero: true\r\n      }\r\n    }]\r\n  },\r\n  elements: {\r\n    line: {\r\n      tension: 0\r\n    }\r\n  }\r\n});\r\n\n\n//# sourceURL=webpack:///./chartOptions.js?");

/***/ }),

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _chartOptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chartOptions */ \"./chartOptions.js\");\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ChartWithLine */ \"./ChartWithLine.js\");\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ChartWithLine__WEBPACK_IMPORTED_MODULE_1__);\n\r\n\r\n\r\nvar repoId = null;\r\nvar chartIndexToEdit = undefined;\r\n\r\nfunction addRepoInToggleList(repo) {\r\n  let toggleDiv = document.createElement('div');\r\n  toggleDiv.className = 'custom-control custom-switch';\r\n\r\n  let input = document.createElement('input');\r\n  input.type = 'checkbox';\r\n  input.className = 'custom-control-input';\r\n  input.id = repo.reponame;\r\n  input.addEventListener('click', addRepoListener);\r\n\r\n  let label = document.createElement('label');\r\n  label.className = 'custom-control-label';\r\n  label.setAttribute('for', `${repo.reponame}`);\r\n  label.innerText = repo.reponame;\r\n\r\n  toggleDiv.appendChild(input);\r\n  toggleDiv.appendChild(label);\r\n  document.getElementById('fullRepoNames').appendChild(toggleDiv);\r\n}\r\n\r\ndata.userRepos.forEach(userRepo => {\r\n  let repo = prepareRepo(userRepo);\r\n  addRepoInToggleList(repo);\r\n\r\n  var ctx = document.getElementById(repo._id).getContext('2d');\r\n  document.getElementById(repo._id).height = 100;\r\n  var chart = new Chart(ctx, {\r\n      // The type of chart we want to create\r\n      type: 'LineWithLine',\r\n\r\n      // The data for our dataset\r\n      data: {\r\n          labels: repo.views.map(h => moment(h.timestamp).format(\"DD MMM YYYY\")),\r\n          datasets: [{\r\n              label: 'Views',\r\n              fill: false,\r\n              backgroundColor: '#603A8B',\r\n              borderColor: '#603A8B',\r\n              data: repo.views.map(h=>h.count),\r\n          },{\r\n              label: 'Unique Views',\r\n              fill: false,\r\n              backgroundColor: '#FDCB00',\r\n              borderColor: '#FDCB00',\r\n              data: repo.views.map(h=>h.uniques),\r\n          }]\r\n      },\r\n\r\n      // Configuration options go here\r\n      options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\r\n  });\r\n});\r\n\r\ndata.sharedRepos.forEach(sharedRepo => {\r\n  let repo = prepareRepo(sharedRepo);\r\n  addRepoInToggleList(repo);\r\n\r\n  var ctx = document.getElementById(repo._id).getContext('2d');\r\n\r\n  var chart = new Chart(ctx, {\r\n      // The type of chart we want to create\r\n      type: 'LineWithLine',\r\n\r\n      // The data for our dataset\r\n      data: {\r\n          labels: repo.views.map(h=>h.timestamp),\r\n          datasets: [{\r\n              label: 'Unique Views',\r\n              fill: false,\r\n              backgroundColor: '#FDCB00',\r\n              borderColor: '#FDCB00',\r\n              data: repo.views.map(h=>h.uniques),\r\n          }, {\r\n              label: 'Views',\r\n              fill: false,\r\n              backgroundColor: '#603A8B',\r\n              borderColor: '#603A8B',\r\n              data: repo.views.map(h=>h.count),\r\n          }]\r\n      },\r\n\r\n      // Configuration options go here\r\n      options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\r\n  });\r\n});\r\n\r\nfunction prepareRepo(repo) {\r\n  let firstTimestamp = new Date();\r\n  firstTimestamp.setUTCHours(0, 0, 0, 0);\r\n  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);\r\n\r\n  let lastTimestamp = new Date();\r\n  lastTimestamp.setUTCHours(0, 0, 0, 0);\r\n  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);\r\n\r\n  if (repo.views.length != 0) {\r\n    let first = new Date(repo.views[0].timestamp);\r\n    let last = new Date(repo.views[repo.views.length - 1].timestamp);\r\n\r\n    if (first.getTime() < firstTimestamp.getTime()) {\r\n      firstTimestamp = first;\r\n    }\r\n\r\n    if (last.getTime() > lastTimestamp.getTime()) {\r\n      lastTimestamp = last;\r\n    }\r\n  }\r\n\r\n  let index = 0;\r\n  let timeIndex = firstTimestamp;\r\n\r\n  while (timeIndex.getTime() <= lastTimestamp.getTime()) {\r\n    if (repo.views[index] === undefined) {\r\n      repo.views.push({\r\n        timestamp: timeIndex.toISOString(),\r\n        count: 0,\r\n        uniques: 0,\r\n      });\r\n    } else {\r\n      const currentTimestamp = new Date(repo.views[index].timestamp);\r\n\r\n      if (timeIndex.getTime() < currentTimestamp.getTime()) {\r\n        repo.views.splice(index, 0, {\r\n          timestamp: timeIndex.toISOString(),\r\n          count: 0,\r\n          uniques: 0,\r\n        });\r\n      }\r\n    }\r\n\r\n    index += 1;\r\n    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);\r\n  }\r\n\r\n  return repo;\r\n}\r\n\r\nwindow.divSwitcher = (e) => {\r\n  var elements = e.parentElement.children;\r\n\r\n  for (var i = 0; i < elements.length; i++) {\r\n    if(elements[i] == e) {\r\n      elements[i].style.display = 'block';\r\n    } else {\r\n      elements[i].style.display = 'none';\r\n    }\r\n  }\r\n}\r\n\r\nfunction shareRepository() {\r\n  username = document.getElementById('share-with').value;\r\n\r\n  $.ajax({\r\n    url: '/repo/share',\r\n    type: 'POST',\r\n    dataType: 'json',\r\n    data: \"name=get_username\" + \"&repoId=\" + repoId + \"&username=\" + username,\r\n    success: function (data) {\r\n\r\n    },\r\n    error: function () {\r\n\r\n    }\r\n  })\r\n}\r\n\r\nconst aggregateChartArray = [];\r\nlet repoIdToAdd = undefined;\r\n\r\nwindow.addCustomChart = () => {\r\n  var nameofChart = 'chart' + aggregateChartArray.length;\r\n\r\n  /* Create HTML elements */\r\n  var div = document.createElement('div');\r\n  div.id = nameofChart;\r\n\r\n  var rawDiv = document.createElement('div');\r\n  rawDiv.className = 'row';\r\n\r\n  var h3 = document.createElement('h3');\r\n  h3.innerHTML = nameofChart;\r\n  h3.className = 'repo-title';\r\n\r\n  var allignToRight = document.createElement('div');\r\n  allignToRight.className = 'actionButtons';\r\n\r\n  var editButton = document.createElement('button');\r\n  editButton.setAttribute('data-target', '#editModal');\r\n  editButton.className = 'margin-8 add-btn btn btn-outline-dark';\r\n  editButton.innerHTML = `<i class=\"fas fa-edit\"></i>`;\r\n  editButton.id = aggregateChartArray.length;\r\n  editButton.addEventListener('click', chartEditListener);\r\n\r\n  var deleteButton = document.createElement('button');\r\n  deleteButton.className = 'margin-8 add-btn btn btn-outline-dark';\r\n  deleteButton.innerHTML = '<i class=\"fas fa-trash\"></i>';\r\n  deleteButton.addEventListener('click', chartDeleteListener);\r\n\r\n  var canv = document.createElement('canvas');\r\n  canv.height = 100;\r\n\r\n  rawDiv.appendChild(h3);\r\n\r\n  allignToRight.appendChild(editButton);\r\n  allignToRight.appendChild(deleteButton);\r\n  rawDiv.appendChild(allignToRight);\r\n\r\n  div.appendChild(rawDiv);\r\n  div.appendChild(canv);\r\n  document.getElementById('customCharts').appendChild(div);\r\n\r\n  /* Creating the chart */\r\n  var ctx = canv.getContext('2d');\r\n\r\n  const chartToEdit = new Chart(ctx, {\r\n      // The type of chart we want to create\r\n      type: 'LineWithLine',\r\n\r\n      // Configuration options go here\r\n      options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\r\n  });\r\n\r\n  /* Local save for the new chart */\r\n  aggregateChartArray.push({\r\n    chartToEdit: chartToEdit,\r\n    repoArray: [],\r\n    name: canv.id\r\n  });\r\n\r\n  /* Show the modal for editing the creating chart */\r\n  chartIndexToEdit = aggregateChartArray.length - 1;\r\n\r\n  let repoStates = document.querySelectorAll('#fullRepoNames input');\r\n  for (var i = 0; i < repoStates.length; i++) {\r\n    repoStates[i].checked = false;\r\n  }\r\n\r\n  $('#editModal').modal('show');\r\n}\r\n\r\nfunction getRepoFromData(reponame) {\r\n  const fromUserRepo = data.userRepos.filter(repo => (repo.reponame == reponame));\r\n  const fromSharedRepo = data.sharedRepos.filter(repo => (repo.reponame == reponame));\r\n\r\n  if(fromUserRepo.length != 0) {\r\n    return fromUserRepo[0];\r\n  }\r\n\r\n  if(fromSharedRepo.length != 0) {\r\n    return fromSharedRepo[0];\r\n  }\r\n}\r\n\r\nfunction removeFromAggregateChart(chartIndex, reponame) {\r\n  for(var i = 0; i < aggregateChartArray.length; ++i) {\r\n    for(var j = 0; j < aggregateChartArray[i].repoArray.length; ++j) {\r\n      if(aggregateChartArray[i].repoArray[j].reponame == reponame) {\r\n\r\n        aggregateChartArray[i].repoArray.splice(j, 1);\r\n\r\n        break;\r\n      }\r\n    }\r\n  }\r\n\r\n  chartUpdate(chartIndex);\r\n}\r\n\r\nfunction aggregateTwoCharts(chartIndex, reponame) {\r\n  /* Searching in data for the repo */\r\n  const repoToAdd = getRepoFromData(reponame);\r\n\r\n  /* Add the repo to the chart structure */\r\n  aggregateChartArray[chartIndex].repoArray.push(repoToAdd);\r\n  chartUpdate(chartIndex);\r\n}\r\n\r\nfunction chartUpdate(index) {\r\n\r\n  aggregateChartArray[index].chartToEdit.data.labels = [];\r\n  aggregateChartArray[index].chartToEdit.data.datasets = [];\r\n\r\n  if(aggregateChartArray[index].repoArray.length == 0) {\r\n    aggregateChartArray[index].chartToEdit.update();\r\n    return;\r\n  }\r\n\r\n  /* Find the repo wih the oldest timestamp */\r\n  let repoWithMinTimestamp = aggregateChartArray[index].repoArray[0];\r\n\r\n  aggregateChartArray[index].repoArray.forEach(repo => {\r\n    let minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n    let repoStartDate = new Date(repo.views[0].timestamp);\r\n\r\n    if(repoStartDate.getTime() < minStartDate.getTime()) {\r\n      repoWithMinTimestamp = repo;\r\n    }\r\n  });\r\n\r\n  /* Get the oldest date */\r\n  const startDate = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n\r\n  /* Adding dummy data to all repos to start from the oldest date */\r\n  aggregateChartArray[index].repoArray.map(repo => {\r\n\r\n    let repoStartDate = new Date(repo.views[0].timestamp);\r\n\r\n    const days = Math.abs(repoStartDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);\r\n\r\n    if(days != 0) {\r\n      var time = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n      for(var index = 0; index < days; ++index) {\r\n        repo.views.splice(index, 0, { timestamp: time.toISOString(), count: 0, uniques: 0});\r\n        time.setUTCDate(time.getUTCDate() + 1);\r\n      }\r\n    }\r\n  });\r\n\r\n  aggregateChartArray[index].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h => moment(h.timestamp).format(\"DD MMM YYYY\"));\r\n\r\n  aggregateChartArray[index].repoArray.forEach(repo => {\r\n    const uvColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),\r\n        vColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);\r\n    aggregateChartArray[index].chartToEdit.data.datasets.push({\r\n                                      label: `${repo.reponame.split('/')[1]} - Unique Views`,\r\n                                      fill: false,\r\n                                      backgroundColor: uvColor,\r\n                                      borderColor: uvColor,\r\n                                      data: repo.views.map(h=>h.uniques),\r\n                                    });\r\n\r\n    aggregateChartArray[index].chartToEdit.data.datasets.push({\r\n                                      label: `${repo.reponame.split('/')[1]} - Views`,\r\n                                      fill: false,\r\n                                      backgroundColor: vColor,\r\n                                      borderColor: vColor,\r\n                                      data: repo.views.map(h=>h.count),\r\n                                    });\r\n  });\r\n\r\n  aggregateChartArray[index].chartToEdit.update();\r\n}\r\n\r\njQuery(function(){\r\n  $(\"button.share-btn\").on(\"click\", function(){\r\n    repoId = $(this).attr(\"data-repoId\");\r\n  })\r\n});\r\n\r\nfunction chartDeleteListener(e) {\r\n  console.log(\"TODO DELETEING\");\r\n  button = e.currentTarget;\r\n\r\n  /* Remove from database */\r\n\r\n  /* Remove from HTML Page*/\r\n\r\n  /* Remove from aggregateChartArray */\r\n}\r\n\r\nfunction addRepoListener(e) {\r\n  const reponameToAdd = e.currentTarget.id;\r\n  if (e.currentTarget.checked) {\r\n    aggregateTwoCharts(chartIndexToEdit, reponameToAdd);\r\n  } else {\r\n    removeFromAggregateChart(chartIndexToEdit, reponameToAdd);\r\n  }\r\n}\r\n\r\nfunction chartEditListener(e) {\r\n  chartIndexToEdit  = e.currentTarget.id;\r\n  let aggregateChart = aggregateChartArray[chartIndexToEdit];\r\n\r\n  let repoStates = document.querySelectorAll('#fullRepoNames input');\r\n  for (var i = 0; i < repoStates.length; i++) {\r\n    repoStates[i].checked = false;\r\n\r\n    for(var j = 0; j < aggregateChart.repoArray.length; j += 1) {\r\n      if(aggregateChart.repoArray[j].reponame == repoStates[i].id) {\r\n        repoStates[i].checked = true;\r\n      }\r\n    }\r\n  }\r\n\r\n  $('#editModal').modal('show');\r\n}\r\n\n\n//# sourceURL=webpack:///./main.js?");

/***/ })

/******/ });