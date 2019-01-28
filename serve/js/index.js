var domain = location.search.slice(1);

console.log(domain);

if (domain == "") domain = "hampton.pw"

console.log(domain);

var app = new Vue({
  el: "#app",
  data: {
    reqs: "",
    domain: domain,
    ips: "",
    paths: [],
    browsers: [],
    countries: [],
    os:[],
    hours: 72
  }
});

function hourpochToDate(hours){
  return new Date(hours * 1000 * 60 * 60);
}

function convertMYSQLToJSON(data, hours){
  var basicArray = {};
  
  for (var i in data){
    basicArray[data[i]["time"]] = data[i]["COUNT(time)"];
  }
  
  var currentHour = (Math.floor((new Date() / 1000)/60/60))
  var startingHour = currentHour - hours;
  
  for (var i = startingHour; i < currentHour; i++){
    if (basicArray[i] === undefined){
      basicArray[i] = "";
    }
  }
  
  var data = [
    [],
    []
  ];
  
  for (var i in basicArray){
    data[0].push(hourpochToDate(i));
    data[1].push(basicArray[i]);
  }
  
  return data;
}

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/requests", function( data ) {
  app._data.reqs = data[0]["COUNT(*)"];
});

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/ips", function( data ) {
  app._data.ips = data[0]["COUNT(DISTINCT ip)"];
});

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/paths", function( data ) {
  app._data.paths = data;
});

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/browsers", function( data ) {
  app._data.browsers = data;
});

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/countries", function( data ) {
  app._data.countries = data;
});

$.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/os", function( data ) {
  app._data.os = data;
});

var currentChart = undefined;

function loadRequests(){
  var hours = Number(app._data.hours);
  $.getJSON( "https://a.hampton.pw/api/v1/"+domain+"/requests/" + hours, function( data ) {
    var lineChartData = convertMYSQLToJSON(data, hours);

    currentChart = new Chart(document.getElementById("reqHours"), {
      type: 'line',
      data: {
        labels: lineChartData[0],
        datasets: [{ 
            data: lineChartData[1],
            label: "Request Count",
            borderColor: "#c45850",
            fill: true
          }
        ]
      },
      options: {
        spanGaps: true,
        title: {
          display: true,
          text: 'Request Count Over The Last ' + hours + ' hours'
        },
        scales: {
					xAxes: [{
						type: 'time',
						time: {
							format: 'MM/DD/YYYY HH:mm',
							// round: 'day'
							tooltipFormat: 'll HH:mm'
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'value'
						}
					}]
				}
      }
    });
  });
}
