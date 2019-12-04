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

eval("Chart.defaults.LineWithLine = Chart.defaults.line;\n\nfunction draw(ease) {\n  Chart.controllers.line.prototype.draw.call(this, ease);\n\n  if (this.chart.tooltip._active && this.chart.tooltip._active.length) {\n    const activePoint = this.chart.tooltip._active[0];\n    const { ctx } = this.chart;\n    const { x } = activePoint.tooltipPosition();\n    const topY = this.chart.scales[\"y-axis-0\"].top;\n    const bottomY = this.chart.scales[\"y-axis-0\"].bottom;\n\n    // draw line\n    ctx.save();\n    ctx.beginPath();\n    ctx.moveTo(x, topY);\n    ctx.lineTo(x, bottomY);\n    ctx.lineWidth = 1;\n    ctx.strokeStyle = \"#555\";\n    ctx.stroke();\n    ctx.restore();\n  }\n}\n\nChart.controllers.LineWithLine = Chart.controllers.line.extend({\n  draw\n});\n\nChart.Tooltip.positioners.nearPointer = (elements, eventPosition) => {\n  // const tooltip = this;\n\n  return {\n    x: eventPosition.x,\n    y: eventPosition.y\n  };\n};\n\n\n//# sourceURL=webpack:///./ChartWithLine.js?");

/***/ }),

/***/ "./chart.js":
/*!******************!*\
  !*** ./chart.js ***!
  \******************/
/*! exports provided: createChart, createChartElements, removeFromAggregateChart, aggregateTwoCharts, chartUpdate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createChart\", function() { return createChart; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createChartElements\", function() { return createChartElements; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"removeFromAggregateChart\", function() { return removeFromAggregateChart; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"aggregateTwoCharts\", function() { return aggregateTwoCharts; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"chartUpdate\", function() { return chartUpdate; });\n/* harmony import */ var _chartOptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chartOptions */ \"./chartOptions.js\");\n/* harmony import */ var _repo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./repo */ \"./repo.js\");\n/* harmony import */ var _listeners__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./listeners */ \"./listeners.js\");\n\r\n\r\n\r\n\r\nfunction generateRandomColour() {\r\n  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;\r\n}\r\n\r\nfunction createChart(ctx, labels, views, uniques) {\r\n  /* eslint-disable no-new */\r\n  new Chart(ctx, {\r\n    /* The type of chart we want to create */\r\n    type: \"LineWithLine\",\r\n\r\n    /* The data for our dataset */\r\n    data: {\r\n      labels,\r\n      datasets: [\r\n        {\r\n          label: \"Views\",\r\n          fill: false,\r\n          backgroundColor: \"#603A8B\",\r\n          borderColor: \"#603A8B\",\r\n          data: views\r\n        },\r\n        {\r\n          label: \"Unique Views\",\r\n          fill: false,\r\n          backgroundColor: \"#FDCB00\",\r\n          borderColor: \"#FDCB00\",\r\n          data: uniques\r\n        }\r\n      ]\r\n    },\r\n\r\n    /* Configuration options go here */\r\n    options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\r\n  });\r\n}\r\n\r\nfunction createChartElements(createdChartId) {\r\n  const nameofChart = `chart${window.aggregateChartArray.length}`;\r\n\r\n  /* Create HTML elements */\r\n  const div = document.createElement(\"div\");\r\n  div.id = nameofChart;\r\n\r\n  const rawDiv = document.createElement(\"div\");\r\n  rawDiv.className = \"row\";\r\n\r\n  const h3 = document.createElement(\"h3\");\r\n  h3.innerHTML = nameofChart;\r\n  h3.className = \"repo-title\";\r\n\r\n  const allignToRight = document.createElement(\"div\");\r\n  allignToRight.className = \"actionButtons\";\r\n\r\n  const editButton = document.createElement(\"button\");\r\n  editButton.setAttribute(\"data-target\", \"#editModal\");\r\n  editButton.className = \"margin-8 add-btn btn btn-outline-dark\";\r\n  editButton.innerHTML = `<i class=\"fas fa-edit\"></i>`;\r\n  editButton.id = createdChartId;\r\n  editButton.addEventListener(\"click\", _listeners__WEBPACK_IMPORTED_MODULE_2__[\"chartEditListener\"]);\r\n\r\n  const deleteButton = document.createElement(\"button\");\r\n  deleteButton.className = \"margin-8 add-btn btn btn-outline-dark\";\r\n  deleteButton.innerHTML = '<i class=\"fas fa-trash\"></i>';\r\n  deleteButton.setAttribute(\"data-chartId\", createdChartId);\r\n  deleteButton.addEventListener(\"click\", _listeners__WEBPACK_IMPORTED_MODULE_2__[\"chartDeleteListener\"]);\r\n\r\n  const canv = document.createElement(\"canvas\");\r\n  canv.height = 100;\r\n\r\n  rawDiv.appendChild(h3);\r\n\r\n  allignToRight.appendChild(editButton);\r\n  allignToRight.appendChild(deleteButton);\r\n  rawDiv.appendChild(allignToRight);\r\n\r\n  div.appendChild(rawDiv);\r\n  div.appendChild(canv);\r\n  document.getElementById(\"customCharts\").appendChild(div);\r\n\r\n  /* Creating the chart */\r\n  const ctx = canv.getContext(\"2d\");\r\n\r\n  const chartToEdit = new Chart(ctx, {\r\n    // The type of chart we want to create\r\n    type: \"LineWithLine\",\r\n\r\n    // Configuration options go here\r\n    options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\r\n  });\r\n\r\n  /* Local save for the new chart */\r\n  window.aggregateChartArray.push({\r\n    chartToEdit,\r\n    repoArray: [],\r\n    name: canv.id,\r\n    id: createdChartId\r\n  });\r\n}\r\n\r\nwindow.addCustomChart = async () => {\r\n  const createResponse = await $.ajax({\r\n    url: `/aggCharts/create`,\r\n    type: `GET`\r\n  });\r\n\r\n  const createdChartId = createResponse._id;\r\n  /* Create DOM elements for chart */\r\n  createChartElements(createdChartId);\r\n\r\n  /* Show the modal for editing the creating chart */\r\n  window.chartIdToEdit = createdChartId;\r\n  window.chartIndexToEdit = window.aggregateChartArray.length - 1;\r\n\r\n  const repoStates = document.querySelectorAll(\"#fullRepoNames input\");\r\n  for (let i = 0; i < repoStates.length; i += 1) {\r\n    repoStates[i].checked = false;\r\n  }\r\n\r\n  $(\"#editModal\").modal(\"show\");\r\n};\r\n\r\nfunction chartUpdate(index) {\r\n  window.aggregateChartArray[index].chartToEdit.data.labels = [];\r\n  window.aggregateChartArray[index].chartToEdit.data.datasets = [];\r\n\r\n  if (window.aggregateChartArray[index].repoArray.length === 0) {\r\n    window.aggregateChartArray[index].chartToEdit.update();\r\n    return;\r\n  }\r\n\r\n  /* Find the repo wih the oldest timestamp */\r\n  if (window.aggregateChartArray[index].repoArray.length === 0) {\r\n    return;\r\n  }\r\n\r\n  let repoWithMinTimestamp = window.aggregateChartArray[index].repoArray[0];\r\n\r\n  window.aggregateChartArray[index].repoArray.forEach(repo => {\r\n    const minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n    const repoStartDate = new Date(repo.views[0].timestamp);\r\n\r\n    if (repoStartDate.getTime() < minStartDate.getTime()) {\r\n      repoWithMinTimestamp = repo;\r\n    }\r\n  });\r\n\r\n  /* Get the oldest date */\r\n  const startDate = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n\r\n  /* Adding dummy data to all repos to start from the oldest date */\r\n  window.aggregateChartArray[index].repoArray.map(repo => {\r\n    const repoStartDate = new Date(repo.views[0].timestamp);\r\n\r\n    const days =\r\n      Math.abs(repoStartDate.getTime() - startDate.getTime()) /\r\n      (1000 * 3600 * 24);\r\n\r\n    if (days !== 0) {\r\n      const time = new Date(repoWithMinTimestamp.views[0].timestamp);\r\n      for (let i = 0; i < days; i += 1) {\r\n        repo.views.splice(i, 0, {\r\n          timestamp: time.toISOString(),\r\n          count: 0,\r\n          uniques: 0\r\n        });\r\n        time.setUTCDate(time.getUTCDate() + 1);\r\n      }\r\n    }\r\n\r\n    return undefined;\r\n  });\r\n\r\n  window.aggregateChartArray[\r\n    index\r\n  ].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h =>\r\n    moment(h.timestamp).format(\"DD MMM YYYY\")\r\n  );\r\n\r\n  window.aggregateChartArray[index].repoArray.forEach(repo => {\r\n    const uvColor = generateRandomColour();\r\n    const vColor = generateRandomColour();\r\n\r\n    window.aggregateChartArray[index].chartToEdit.data.datasets.push({\r\n      label: `${repo.reponame.split(\"/\")[1]} - Unique Views`,\r\n      fill: false,\r\n      backgroundColor: uvColor,\r\n      borderColor: uvColor,\r\n      data: repo.views.map(h => h.uniques)\r\n    });\r\n\r\n    window.aggregateChartArray[index].chartToEdit.data.datasets.push({\r\n      label: `${repo.reponame.split(\"/\")[1]} - Views`,\r\n      fill: false,\r\n      backgroundColor: vColor,\r\n      borderColor: vColor,\r\n      data: repo.views.map(h => h.count)\r\n    });\r\n  });\r\n\r\n  window.aggregateChartArray[index].chartToEdit.update();\r\n}\r\n\r\nwindow.saveChartToDatabase = async () => {\r\n  const repoList = window.aggregateChartArray[\r\n    window.chartIndexToEdit\r\n  ].repoArray.map(repo => {\r\n    return repo._id;\r\n  });\r\n\r\n  const dataJSON = {\r\n    chartId: window.chartIdToEdit,\r\n    repoList\r\n  };\r\n\r\n  await $.ajax({\r\n    url: `/aggCharts/update`,\r\n    type: `GET`,\r\n    dataType: `application/json`,\r\n    data: dataJSON\r\n  });\r\n};\r\n\r\nfunction removeFromAggregateChart(chartIndex, reponame) {\r\n  for (let i = 0; i < window.aggregateChartArray.length; i += 1) {\r\n    for (\r\n      let j = 0;\r\n      j < window.aggregateChartArray[i].repoArray.length;\r\n      j += 1\r\n    ) {\r\n      if (window.aggregateChartArray[i].repoArray[j].reponame === reponame) {\r\n        window.aggregateChartArray[i].repoArray.splice(j, 1);\r\n\r\n        break;\r\n      }\r\n    }\r\n  }\r\n\r\n  chartUpdate(chartIndex);\r\n}\r\n\r\nfunction aggregateTwoCharts(chartIndex, reponame) {\r\n  /* Searching in data for the repo */\r\n  const repoToAdd = Object(_repo__WEBPACK_IMPORTED_MODULE_1__[\"getRepoFromData\"])(reponame);\r\n\r\n  /* Add the repo to the chart structure */\r\n  window.aggregateChartArray[chartIndex].repoArray.push(repoToAdd);\r\n  chartUpdate(chartIndex);\r\n}\r\n\r\n\r\n\n\n//# sourceURL=webpack:///./chart.js?");

/***/ }),

/***/ "./chartOptions.js":
/*!*************************!*\
  !*** ./chartOptions.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  tooltips: {\n    intersect: false,\n    mode: \"label\",\n    position: \"nearPointer\"\n  },\n  scales: {\n    xAxes: [\n      {\n        ticks: {\n          autoSkip: true,\n          maxTicksLimit: 8\n        }\n      }\n    ],\n    yAxes: [\n      {\n        ticks: {\n          beginAtZero: true\n        }\n      }\n    ]\n  },\n  elements: {\n    line: {\n      tension: 0\n    }\n  }\n});\n\n\n//# sourceURL=webpack:///./chartOptions.js?");

/***/ }),

/***/ "./listeners.js":
/*!**********************!*\
  !*** ./listeners.js ***!
  \**********************/
/*! exports provided: chartDeleteListener, addRepoListener, chartEditListener */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"chartDeleteListener\", function() { return chartDeleteListener; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"addRepoListener\", function() { return addRepoListener; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"chartEditListener\", function() { return chartEditListener; });\n/* harmony import */ var _chart__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chart */ \"./chart.js\");\n\r\n\r\nwindow.repoShareListener = e => {\r\n  window.repoIdToShare = e.getAttribute(\"data-repoId\");\r\n};\r\n\r\nasync function chartDeleteListener(e) {\r\n  const button = e.currentTarget;\r\n  const chartId = button.getAttribute(\"data-chartId\");\r\n\r\n  /* Remove from HTML Page */\r\n  const chartToRemove = button.parentElement.parentElement.parentElement;\r\n  chartToRemove.parentElement.removeChild(chartToRemove);\r\n\r\n  /* Remove from aggregateChartArray */\r\n\r\n  /* Remove from database */\r\n  try {\r\n    await $.ajax({\r\n      url: `/aggCharts/delete`,\r\n      type: `GET`,\r\n      dataType: `application/json`,\r\n      data: { chartId }\r\n    });\r\n  } catch (error) {\r\n    console.log(error);\r\n  }\r\n}\r\n\r\nfunction addRepoListener(e) {\r\n  const reponameToAdd = e.currentTarget.id;\r\n  if (e.currentTarget.checked) {\r\n    Object(_chart__WEBPACK_IMPORTED_MODULE_0__[\"aggregateTwoCharts\"])(window.chartIndexToEdit, reponameToAdd);\r\n  } else {\r\n    Object(_chart__WEBPACK_IMPORTED_MODULE_0__[\"removeFromAggregateChart\"])(window.chartIndexToEdit, reponameToAdd);\r\n  }\r\n}\r\n\r\nfunction chartEditListener(e) {\r\n  window.chartIdToEdit = e.currentTarget.id;\r\n\r\n  for (let i = 0; i < window.aggregateChartArray.length; i += 1) {\r\n    if (window.aggregateChartArray[i].id === window.chartIdToEdit) {\r\n      window.chartIndexToEdit = i;\r\n      break;\r\n    }\r\n  }\r\n\r\n  const aggregateChart = window.aggregateChartArray[window.chartIndexToEdit];\r\n  const repoStates = document.querySelectorAll(\"#fullRepoNames input\");\r\n\r\n  for (let i = 0; i < repoStates.length; i += 1) {\r\n    repoStates[i].checked = false;\r\n\r\n    for (let j = 0; j < aggregateChart.repoArray.length; j += 1) {\r\n      if (aggregateChart.repoArray[j].reponame === repoStates[i].id) {\r\n        repoStates[i].checked = true;\r\n      }\r\n    }\r\n  }\r\n\r\n  $(\"#editModal\").modal(\"show\");\r\n}\r\n\r\n\r\n\n\n//# sourceURL=webpack:///./listeners.js?");

/***/ }),

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ChartWithLine */ \"./ChartWithLine.js\");\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ChartWithLine__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _repo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./repo */ \"./repo.js\");\n/* harmony import */ var _chart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chart */ \"./chart.js\");\n\n\n\n\nwindow.aggregateChartArray = [];\nwindow.repoIdToShare = undefined;\nwindow.chartIndexToEdit = undefined;\nwindow.chartIdToEdit = undefined;\n\nif (data.userRepos) {\n  data.userRepos.forEach(userRepo => {\n    const repo = Object(_repo__WEBPACK_IMPORTED_MODULE_1__[\"prepareRepo\"])(userRepo);\n    Object(_repo__WEBPACK_IMPORTED_MODULE_1__[\"addRepoInToggleList\"])(repo);\n\n    const labels = repo.views.map(h =>\n      moment(h.timestamp).format(\"DD MMM YYYY\")\n    );\n    const views = repo.views.map(h => h.count);\n    const uniques = repo.views.map(h => h.uniques);\n    const ctx = document.getElementById(repo._id).getContext(\"2d\");\n    document.getElementById(repo._id).height = 100;\n\n    Object(_chart__WEBPACK_IMPORTED_MODULE_2__[\"createChart\"])(ctx, labels, views, uniques);\n  });\n}\n\nif (data.sharedRepos) {\n  data.sharedRepos.forEach(sharedRepo => {\n    const repo = Object(_repo__WEBPACK_IMPORTED_MODULE_1__[\"prepareRepo\"])(sharedRepo);\n    Object(_repo__WEBPACK_IMPORTED_MODULE_1__[\"addRepoInToggleList\"])(repo);\n\n    const labels = repo.views.map(h =>\n      moment(h.timestamp).format(\"DD MMM YYYY\")\n    );\n    const views = repo.views.map(h => h.count);\n    const uniques = repo.views.map(h => h.uniques);\n    const ctx = document.getElementById(repo._id).getContext(\"2d\");\n    document.getElementById(repo._id).height = 100;\n\n    Object(_chart__WEBPACK_IMPORTED_MODULE_2__[\"createChart\"])(ctx, labels, views, uniques);\n  });\n}\n\nif (data.aggregateChart) {\n  data.aggregateCharts.forEach(aggregateChart => {\n    Object(_chart__WEBPACK_IMPORTED_MODULE_2__[\"createChartElements\"])(aggregateChart._id);\n    const c = window.aggregateChartArray[window.aggregateChartArray.length - 1];\n\n    if (aggregateChart.repo_list) {\n      c.repoArray = aggregateChart.repo_list.map(repoId => {\n        const fromUserRepo = data.userRepos.filter(repo => repo._id === repoId);\n        const fromSharedRepo = data.sharedRepos.filter(\n          repo => repo._id === repoId\n        );\n\n        if (fromUserRepo.length !== 0) {\n          return fromUserRepo[0];\n        }\n        if (fromSharedRepo.length !== 0) {\n          return fromSharedRepo[0];\n        }\n        return undefined;\n      });\n    }\n\n    Object(_chart__WEBPACK_IMPORTED_MODULE_2__[\"chartUpdate\"])(window.aggregateChartArray.length - 1);\n  });\n}\n\nwindow.divSwitcher = e => {\n  const elements = e.parentElement.children;\n\n  for (let i = 0; i < elements.length; i += 1) {\n    if (elements[i] === e) {\n      elements[i].style.display = \"block\";\n    } else {\n      elements[i].style.display = \"none\";\n    }\n  }\n};\n\n\n//# sourceURL=webpack:///./main.js?");

/***/ }),

/***/ "./repo.js":
/*!*****************!*\
  !*** ./repo.js ***!
  \*****************/
/*! exports provided: addRepoInToggleList, prepareRepo, getRepoFromData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"addRepoInToggleList\", function() { return addRepoInToggleList; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"prepareRepo\", function() { return prepareRepo; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getRepoFromData\", function() { return getRepoFromData; });\n/* harmony import */ var _listeners__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./listeners */ \"./listeners.js\");\n\r\n\r\nfunction addRepoInToggleList(repo) {\r\n  const toggleDiv = document.createElement(\"div\");\r\n  toggleDiv.className = \"custom-control custom-switch\";\r\n\r\n  const input = document.createElement(\"input\");\r\n  input.type = \"checkbox\";\r\n  input.className = \"custom-control-input\";\r\n  input.id = repo.reponame;\r\n  input.addEventListener(\"click\", _listeners__WEBPACK_IMPORTED_MODULE_0__[\"addRepoListener\"]);\r\n\r\n  const label = document.createElement(\"label\");\r\n  label.className = \"custom-control-label\";\r\n  label.setAttribute(\"for\", `${repo.reponame}`);\r\n  label.innerText = repo.reponame;\r\n\r\n  toggleDiv.appendChild(input);\r\n  toggleDiv.appendChild(label);\r\n  document.getElementById(\"fullRepoNames\").appendChild(toggleDiv);\r\n}\r\n\r\nfunction prepareRepo(repo) {\r\n  let firstTimestamp = new Date();\r\n  firstTimestamp.setUTCHours(0, 0, 0, 0);\r\n  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);\r\n\r\n  let lastTimestamp = new Date();\r\n  lastTimestamp.setUTCHours(0, 0, 0, 0);\r\n  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);\r\n\r\n  if (repo.views.length !== 0) {\r\n    const first = new Date(repo.views[0].timestamp);\r\n    const last = new Date(repo.views[repo.views.length - 1].timestamp);\r\n\r\n    if (first.getTime() < firstTimestamp.getTime()) {\r\n      firstTimestamp = first;\r\n    }\r\n\r\n    if (last.getTime() > lastTimestamp.getTime()) {\r\n      lastTimestamp = last;\r\n    }\r\n  }\r\n\r\n  let index = 0;\r\n  const timeIndex = firstTimestamp;\r\n\r\n  while (timeIndex.getTime() <= lastTimestamp.getTime()) {\r\n    if (repo.views[index] === undefined) {\r\n      repo.views.push({\r\n        timestamp: timeIndex.toISOString(),\r\n        count: 0,\r\n        uniques: 0\r\n      });\r\n    } else {\r\n      const currentTimestamp = new Date(repo.views[index].timestamp);\r\n\r\n      if (timeIndex.getTime() < currentTimestamp.getTime()) {\r\n        repo.views.splice(index, 0, {\r\n          timestamp: timeIndex.toISOString(),\r\n          count: 0,\r\n          uniques: 0\r\n        });\r\n      }\r\n    }\r\n\r\n    index += 1;\r\n    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);\r\n  }\r\n\r\n  return repo;\r\n}\r\n\r\nwindow.shareRepository = () => {\r\n  const username = document.getElementById(\"share-with\").value;\r\n\r\n  $.ajax({\r\n    url: \"/repo/share\",\r\n    type: \"POST\",\r\n    dataType: \"json\",\r\n    data: `name=get_username&repoId=${window.repoIdToShare}&username=${username}`\r\n  });\r\n};\r\n\r\nfunction getRepoFromData(reponame) {\r\n  const fromUserRepo = data.userRepos.filter(\r\n    repo => repo.reponame === reponame\r\n  );\r\n  const fromSharedRepo = data.sharedRepos.filter(\r\n    repo => repo.reponame === reponame\r\n  );\r\n\r\n  if (fromUserRepo.length !== 0) {\r\n    return fromUserRepo[0];\r\n  }\r\n\r\n  if (fromSharedRepo.length !== 0) {\r\n    return fromSharedRepo[0];\r\n  }\r\n  return undefined;\r\n}\r\n\r\n\r\n\n\n//# sourceURL=webpack:///./repo.js?");

/***/ })

/******/ });