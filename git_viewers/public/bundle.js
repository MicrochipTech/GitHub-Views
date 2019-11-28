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

eval("Chart.defaults.LineWithLine = Chart.defaults.line;\nChart.controllers.LineWithLine = Chart.controllers.line.extend({\n  draw: function(ease) {\n    Chart.controllers.line.prototype.draw.call(this, ease);\n\n    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {\n      var activePoint = this.chart.tooltip._active[0],\n        ctx = this.chart.ctx,\n        x = activePoint.tooltipPosition().x,\n        topY = this.chart.scales[\"y-axis-0\"].top,\n        bottomY = this.chart.scales[\"y-axis-0\"].bottom;\n\n      // draw line\n      ctx.save();\n      ctx.beginPath();\n      ctx.moveTo(x, topY);\n      ctx.lineTo(x, bottomY);\n      ctx.lineWidth = 1;\n      ctx.strokeStyle = \"#555\";\n      ctx.stroke();\n      ctx.restore();\n    }\n  }\n});\n\nChart.Tooltip.positioners.nearPointer = function(elements, eventPosition) {\n  var tooltip = this;\n\n  return {\n    x: eventPosition.x,\n    y: eventPosition.y\n  };\n};\n\n\n//# sourceURL=webpack:///./ChartWithLine.js?");

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

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _chartOptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chartOptions */ \"./chartOptions.js\");\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ChartWithLine */ \"./ChartWithLine.js\");\n/* harmony import */ var _ChartWithLine__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ChartWithLine__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\nlet repoId;\nlet chartIndexToEdit;\nlet chartIdToEdit;\nconst aggregateChartArray = [];\nlet repoIdToAdd;\n\nfunction addRepoInToggleList(repo) {\n  const toggleDiv = document.createElement(\"div\");\n  toggleDiv.className = \"custom-control custom-switch\";\n\n  const input = document.createElement(\"input\");\n  input.type = \"checkbox\";\n  input.className = \"custom-control-input\";\n  input.id = repo.reponame;\n  input.addEventListener(\"click\", addRepoListener);\n\n  const label = document.createElement(\"label\");\n  label.className = \"custom-control-label\";\n  label.setAttribute(\"for\", `${repo.reponame}`);\n  label.innerText = repo.reponame;\n\n  toggleDiv.appendChild(input);\n  toggleDiv.appendChild(label);\n  document.getElementById(\"fullRepoNames\").appendChild(toggleDiv);\n}\n\ndata.userRepos.forEach(userRepo => {\n  let repo = prepareRepo(userRepo);\n  addRepoInToggleList(repo);\n\n  var ctx = document.getElementById(repo._id).getContext(\"2d\");\n  document.getElementById(repo._id).height = 100;\n  var chart = new Chart(ctx, {\n    // The type of chart we want to create\n    type: \"LineWithLine\",\n\n    // The data for our dataset\n    data: {\n      labels: repo.views.map(h => moment(h.timestamp).format(\"DD MMM YYYY\")),\n      datasets: [\n        {\n          label: \"Views\",\n          fill: false,\n          backgroundColor: \"#603A8B\",\n          borderColor: \"#603A8B\",\n          data: repo.views.map(h => h.count)\n        },\n        {\n          label: \"Unique Views\",\n          fill: false,\n          backgroundColor: \"#FDCB00\",\n          borderColor: \"#FDCB00\",\n          data: repo.views.map(h => h.uniques)\n        }\n      ]\n    },\n\n    // Configuration options go here\n    options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n  });\n});\n\ndata.sharedRepos.forEach(sharedRepo => {\n  let repo = prepareRepo(sharedRepo);\n  addRepoInToggleList(repo);\n\n  var ctx = document.getElementById(repo._id).getContext(\"2d\");\n\n  var chart = new Chart(ctx, {\n    // The type of chart we want to create\n    type: \"LineWithLine\",\n\n    // The data for our dataset\n    data: {\n      labels: repo.views.map(h => h.timestamp),\n      datasets: [\n        {\n          label: \"Unique Views\",\n          fill: false,\n          backgroundColor: \"#FDCB00\",\n          borderColor: \"#FDCB00\",\n          data: repo.views.map(h => h.uniques)\n        },\n        {\n          label: \"Views\",\n          fill: false,\n          backgroundColor: \"#603A8B\",\n          borderColor: \"#603A8B\",\n          data: repo.views.map(h => h.count)\n        }\n      ]\n    },\n\n    // Configuration options go here\n    options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n  });\n});\n\ndata.aggregateCharts.forEach(aggregateChart => {\n  createChartElements(aggregateChart._id);\n  const c = aggregateChartArray[aggregateChartArray.length - 1];\n  c.repoArray = aggregateChart.repo_list.map((repoId) => {\n    const fromUserRepo = data.userRepos.filter(\n      repo => repo._id === repoId\n    );\n    const fromSharedRepo = data.sharedRepos.filter(\n      repo => repo._id === repoId\n    );\n  \n    if (fromUserRepo.length !== 0) {\n      return fromUserRepo[0];\n    }\n  \n    if (fromSharedRepo.length !== 0) {\n      return fromSharedRepo[0];\n    }\n  });\n  chartUpdate(aggregateChartArray.length - 1);\n});\n\nfunction prepareRepo(repo) {\n  let firstTimestamp = new Date();\n  firstTimestamp.setUTCHours(0, 0, 0, 0);\n  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);\n\n  let lastTimestamp = new Date();\n  lastTimestamp.setUTCHours(0, 0, 0, 0);\n  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);\n\n  if (repo.views.length !== 0) {\n    const first = new Date(repo.views[0].timestamp);\n    const last = new Date(repo.views[repo.views.length - 1].timestamp);\n\n    if (first.getTime() < firstTimestamp.getTime()) {\n      firstTimestamp = first;\n    }\n\n    if (last.getTime() > lastTimestamp.getTime()) {\n      lastTimestamp = last;\n    }\n  }\n\n  let index = 0;\n  const timeIndex = firstTimestamp;\n\n  while (timeIndex.getTime() <= lastTimestamp.getTime()) {\n    if (repo.views[index] === undefined) {\n      repo.views.push({\n        timestamp: timeIndex.toISOString(),\n        count: 0,\n        uniques: 0\n      });\n    } else {\n      const currentTimestamp = new Date(repo.views[index].timestamp);\n\n      if (timeIndex.getTime() < currentTimestamp.getTime()) {\n        repo.views.splice(index, 0, {\n          timestamp: timeIndex.toISOString(),\n          count: 0,\n          uniques: 0\n        });\n      }\n    }\n\n    index += 1;\n    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);\n  }\n\n  return repo;\n}\n\nwindow.divSwitcher = e => {\n  const elements = e.parentElement.children;\n\n  for (let i = 0; i < elements.length; i += 1) {\n    if (elements[i] === e) {\n      elements[i].style.display = \"block\";\n    } else {\n      elements[i].style.display = \"none\";\n    }\n  }\n};\n\nwindow.shareRepository = () => {\n  const username = document.getElementById(\"share-with\").value;\n\n  $.ajax({\n    url: \"/repo/share\",\n    type: \"POST\",\n    dataType: \"json\",\n    data: \"name=get_username\" + \"&repoId=\" + repoId + \"&username=\" + username,\n    success: function(data) {},\n    error: function() {}\n  });\n}\n\nwindow.saveChartToDatabase = async () => {\n  const repoList = aggregateChartArray[chartIndexToEdit].repoArray.map(repo => {\n    return repo._id;\n  });\n\n  const dataJSON = {\n    chartId: chartIdToEdit,\n    repoList\n  };\n\n  const updateResponse = await $.ajax({\n    url: `/aggCharts/update`,\n    type: `GET`,\n    dataType: `application/json`,\n    data: dataJSON\n  });\n};\n\nfunction createChartElements(createdChartId) {\n  const nameofChart = `chart${aggregateChartArray.length}`;\n\n  /* Create HTML elements */\n  const div = document.createElement(\"div\");\n  div.id = nameofChart;\n\n  const rawDiv = document.createElement(\"div\");\n  rawDiv.className = \"row\";\n\n  const h3 = document.createElement(\"h3\");\n  h3.innerHTML = nameofChart;\n  h3.className = \"repo-title\";\n\n  const allignToRight = document.createElement(\"div\");\n  allignToRight.className = \"actionButtons\";\n\n  const editButton = document.createElement(\"button\");\n  editButton.setAttribute(\"data-target\", \"#editModal\");\n  editButton.className = \"margin-8 add-btn btn btn-outline-dark\";\n  editButton.innerHTML = `<i class=\"fas fa-edit\"></i>`;\n  editButton.id = createdChartId;\n  editButton.addEventListener(\"click\", chartEditListener);\n\n  const deleteButton = document.createElement(\"button\");\n  deleteButton.className = \"margin-8 add-btn btn btn-outline-dark\";\n  deleteButton.innerHTML = '<i class=\"fas fa-trash\"></i>';\n  deleteButton.setAttribute(\"data-chartId\", createdChartId);\n  deleteButton.addEventListener(\"click\", chartDeleteListener);\n\n  const canv = document.createElement(\"canvas\");\n  canv.height = 100;\n\n  rawDiv.appendChild(h3);\n\n  allignToRight.appendChild(editButton);\n  allignToRight.appendChild(deleteButton);\n  rawDiv.appendChild(allignToRight);\n\n  div.appendChild(rawDiv);\n  div.appendChild(canv);\n  document.getElementById(\"customCharts\").appendChild(div);\n\n  /* Creating the chart */\n  const ctx = canv.getContext(\"2d\");\n\n  const chartToEdit = new Chart(ctx, {\n    // The type of chart we want to create\n    type: \"LineWithLine\",\n\n    // Configuration options go here\n    options: _chartOptions__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n  });\n\n  /* Local save for the new chart */\n  aggregateChartArray.push({\n    chartToEdit,\n    repoArray: [],\n    name: canv.id,\n    id: createdChartId\n  });\n\n  console.log(aggregateChartArray);\n}\n\nwindow.addCustomChart = async () => {\n  const createResponse = await $.ajax({\n    url: `/aggCharts/create`,\n    type: `GET`\n  });\n\n  const createdChartId = createResponse._id;\n  /* Create DOM elements for chart */\n  createChartElements(createdChartId);\n\n  /* Show the modal for editing the creating chart */\n  chartIdToEdit = createdChartId;\n  chartIndexToEdit = aggregateChartArray.length - 1;\n\n  const repoStates = document.querySelectorAll(\"#fullRepoNames input\");\n  for (let i = 0; i < repoStates.length; i += 1) {\n    repoStates[i].checked = false;\n  }\n\n  $(\"#editModal\").modal(\"show\");\n};\n\nfunction getRepoFromData(reponame) {\n  const fromUserRepo = data.userRepos.filter(\n    repo => repo.reponame === reponame\n  );\n  const fromSharedRepo = data.sharedRepos.filter(\n    repo => repo.reponame === reponame\n  );\n\n  if (fromUserRepo.length !== 0) {\n    return fromUserRepo[0];\n  }\n\n  if (fromSharedRepo.length !== 0) {\n    return fromSharedRepo[0];\n  }\n  return undefined;\n}\n\nfunction removeFromAggregateChart(chartIndex, reponame) {\n  for (let i = 0; i < aggregateChartArray.length; i += 1) {\n    for (let j = 0; j < aggregateChartArray[i].repoArray.length; j += 1) {\n      if (aggregateChartArray[i].repoArray[j].reponame === reponame) {\n        aggregateChartArray[i].repoArray.splice(j, 1);\n\n        break;\n      }\n    }\n  }\n\n  chartUpdate(chartIndex);\n}\n\nfunction aggregateTwoCharts(chartIndex, reponame) {\n  /* Searching in data for the repo */\n  const repoToAdd = getRepoFromData(reponame);\n\n  /* Add the repo to the chart structure */\n  aggregateChartArray[chartIndex].repoArray.push(repoToAdd);\n  chartUpdate(chartIndex);\n}\n\nfunction chartUpdate(index) {\n  aggregateChartArray[index].chartToEdit.data.labels = [];\n  aggregateChartArray[index].chartToEdit.data.datasets = [];\n\n  if (aggregateChartArray[index].repoArray.length === 0) {\n    aggregateChartArray[index].chartToEdit.update();\n    return;\n  }\n\n  /* Find the repo wih the oldest timestamp */\n  if (aggregateChartArray[index].repoArray.length === 0) {\n    return;\n  }\n\n  let repoWithMinTimestamp = aggregateChartArray[index].repoArray[0];\n  console.log(repoWithMinTimestamp);\n\n  aggregateChartArray[index].repoArray.forEach(repo => {\n    const minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);\n    const repoStartDate = new Date(repo.views[0].timestamp);\n\n    if (repoStartDate.getTime() < minStartDate.getTime()) {\n      repoWithMinTimestamp = repo;\n    }\n  });\n\n  /* Get the oldest date */\n  const startDate = new Date(repoWithMinTimestamp.views[0].timestamp);\n\n  /* Adding dummy data to all repos to start from the oldest date */\n  aggregateChartArray[index].repoArray.map(repo => {\n    const repoStartDate = new Date(repo.views[0].timestamp);\n\n    const days =\n      Math.abs(repoStartDate.getTime() - startDate.getTime()) /\n      (1000 * 3600 * 24);\n\n    if (days !== 0) {\n      const time = new Date(repoWithMinTimestamp.views[0].timestamp);\n      for (let i = 0; i < days; i += 1) {\n        repo.views.splice(i, 0, {\n          timestamp: time.toISOString(),\n          count: 0,\n          uniques: 0\n        });\n        time.setUTCDate(time.getUTCDate() + 1);\n      }\n    }\n  });\n\n  aggregateChartArray[\n    index\n  ].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h =>\n    moment(h.timestamp).format(\"DD MMM YYYY\")\n  );\n\n  aggregateChartArray[index].repoArray.forEach(repo => {\n    const uvColor =\n        \"#\" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),\n      vColor =\n        \"#\" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);\n    aggregateChartArray[index].chartToEdit.data.datasets.push({\n      label: `${repo.reponame.split(\"/\")[1]} - Unique Views`,\n      fill: false,\n      backgroundColor: uvColor,\n      borderColor: uvColor,\n      data: repo.views.map(h => h.uniques)\n    });\n\n    aggregateChartArray[index].chartToEdit.data.datasets.push({\n      label: `${repo.reponame.split(\"/\")[1]} - Views`,\n      fill: false,\n      backgroundColor: vColor,\n      borderColor: vColor,\n      data: repo.views.map(h => h.count)\n    });\n  });\n\n  aggregateChartArray[index].chartToEdit.update();\n}\n\njQuery(function() {\n  $(\"button.share-btn\").on(\"click\", function() {\n    repoId = $(this).attr(\"data-repoId\");\n  });\n});\n\nasync function chartDeleteListener(e) {\n  const button = e.currentTarget;\n  const chartId = button.getAttribute(\"data-chartId\");\n  console.log(chartId);\n\n  /* Remove from HTML Page*/\n  let chartToRemove = button.parentElement.parentElement.parentElement;\n  chartToRemove.parentElement.removeChild(chartToRemove);\n\n  /* Remove from aggregateChartArray */\n  \n  /* Remove from database */\n  const deleteResponse = await $.ajax({\n    url: `/aggCharts/delete`,\n    type: `GET`,\n    dataType: `application/json`,\n    data: { chartId }\n  });\n}\n\nfunction addRepoListener(e) {\n  const reponameToAdd = e.currentTarget.id;\n  if (e.currentTarget.checked) {\n    aggregateTwoCharts(chartIndexToEdit, reponameToAdd);\n  } else {\n    removeFromAggregateChart(chartIndexToEdit, reponameToAdd);\n  }\n}\n\nfunction chartEditListener(e) {\n  chartIdToEdit = e.currentTarget.id;\n\n  for (let i = 0; i < aggregateChartArray.length; i += 1) {\n    if (aggregateChartArray[i].id === chartIdToEdit) {\n      chartIndexToEdit = i;\n      break;\n    }\n  }\n\n  const aggregateChart = aggregateChartArray[chartIndexToEdit];\n  const repoStates = document.querySelectorAll(\"#fullRepoNames input\");\n\n  for (let i = 0; i < repoStates.length; i += 1) {\n    repoStates[i].checked = false;\n\n    for (let j = 0; j < aggregateChart.repoArray.length; j += 1) {\n      if (aggregateChart.repoArray[j].reponame === repoStates[i].id) {\n        repoStates[i].checked = true;\n      }\n    }\n  }\n\n  $(\"#editModal\").modal(\"show\");\n}\n\n\n//# sourceURL=webpack:///./main.js?");

/***/ })

/******/ });