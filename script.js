CONFIG = (function(){  

	//self invoking config function

	var conf_info = {};
	conf_info["url"] = 'https://calm-eyrie-69052.herokuapp.com/';
	conf_info["dataType"] = 'json';
	conf_info["fbAppId"] = "800728840030941";
	return{    
	  getValue : function(param){
	    return conf_info[param];
	  }
	}
})();

$(document).ready(function() {
	var chartString = '';
	var img;
	var symbol;
	var name;
	var price;
	var change;
	var changePercent;
	var marketCap;
	var link;
	$("#refresh").bootstrapToggle("off");
	$(function(){
		if(localStorage.getItem("symbol") != null){
			var refreshedSymbols = JSON.parse(localStorage.getItem("symbol"));
			var tab = $("#favoriteTable tbody");
			for(var j= 0;j<refreshedSymbols.length+1;j++){
				var row = $("<tr></tr>");
				tab.append(row);
			}
			for(var i = 0;i<refreshedSymbols.length;i++){
				var storedSymbol = refreshedSymbols[i];
				buildTable(storedSymbol, i+1);	
			}
		}	
	})

	function buildTable(storedSymbol, i){
		$.ajax({
			url: CONFIG.getValue('url'),
			dataType: CONFIG.getValue('dataType'),
			type: 'GET',
			data:{
				name: storedSymbol
			},
			success: function(output){
				var fancyChange = parseFloat(output.Change).toFixed(2) +' ('+ parseFloat(output.ChangePercent).toFixed(2)+'%)';
				if(output.Change>0){
					$("#favoriteTable tr").eq(i).html('<td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'" style="color:green">'+fancyChange+'<img src="images/up.png"</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td>') ;
				}
				else if(output.Change<0){
					$("#favoriteTable tr").eq(i).html('<td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'" style="color:red">'+fancyChange+'<img src="images/down.png"</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td>');
				}
				else{
					$("#favoriteTable tr").eq(i).html('<td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'>'+fancyChange+'</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td>') ;
				}
			} 
		});		
	}

	function formatFunction(number){

		//formatting market capitalization into Billions and Millions 

		var billionThreshold = Math.floor(number/1000000000);
        var formattedMarketCapBillion = number/1000000000;
        var millionThreshold = Math.floor(number/1000000);
        var formattedMarketCapMillion =  number/1000000;
                 
		if(billionThreshold>0){
			 var fixedValue=parseFloat(formattedMarketCapBillion).toFixed(2)+" Billion";
		}
		else if(millionThreshold>0){
			var fixedValue = parseFloat(formattedMarketCapMillion).toFixed(2)+" Million";
		}
		else {
			var fixedValue = parseFloat(number).toFixed(2);
		}
		return fixedValue;
	}


	$(document).on('click','#favoriteTableLink', function(e){

		//fetching all details, char and news for a saved stock

		symbol = $('td:first',$(this).closest('tr')).text();
		getNews(symbol);
		getChart(symbol);
		e.preventDefault();
		var checkSymbols = JSON.parse(localStorage.getItem("symbol"));
		if(checkSymbols != null){
			if(checkSymbols.indexOf(symbol)!=-1){
				//changing the color of a star to yellow if it's already in local storage
				$("#saveButton").css('color','yellow');
			}
		}
		$("#rightButton").removeAttr('disabled');
		$.ajax({
			url: CONFIG.getValue('url'),
			dataType: CONFIG.getValue('dataType'),
			type: 'GET',
			data:{
				name: symbol
			},
			success: function(output){
				//current stock image
				if(output.Message != undefined){
					showErrorMessage();
				}
				else {
					$("#myCarousel").carousel("next");
					renderTable(symbol, output);
				}
			}
		});	
	})

	$('#name').autocomplete({

		//jQueryui autocomplete

		source: function(request, response){
			$.ajax({
				url: CONFIG.getValue('url'),
				dataType: CONFIG.getValue('dataType'),
				type: 'GET',
				data:{
					action: request.term
				},
				success: function(output){
					response($.map(output, function(item){
						return {
							//names rendered for each field in autocomplete
							label: item.Symbol +' - '+ item.Name+' ('+item.Exchange+')',
							value: item.Symbol
						}
					}));
					},
				error: function(error){
					alert(error);
				}	
			});
		}
	});

	function showErrorMessage(){
		$("#error").css('visibility','visible');
	}

	function hideErrorMessage(){
		$("#error").css('visibility','hidden');
	}

	$(function(){
		//clear button
		$("#clear").on('click',function(){
			$("#name").val("");
			$("#rightButton").attr('disabled','true');
			hideErrorMessage();
		});
	})

	$(function(){
		$("#inputForm").submit(function(event){
			symbol = $("#name").val();
			event.preventDefault();
			var checkSymbols = JSON.parse(localStorage.getItem("symbol"));
			if(checkSymbols != null){
				if(checkSymbols.indexOf(symbol)!=-1){
					$("#saveButton").css('color','yellow');
				}
				else $("#saveButton").css('color','white');
			}
			$.ajax({
				url: CONFIG.getValue('url'),
				dataType: CONFIG.getValue('dataType'),
				type: 'GET',
				data:{
					name: symbol
				},
				success: function(output){
					//current stock image
					if(output.Status == "Failure|APP_SPECIFIC_ERROR"){
						$("#error").text("Data Not Available");
						$("#error").show();
					}
					else{
						if(output.Message != undefined){
							showErrorMessage();
						}
						else {
							$("#rightButton").removeAttr('disabled');
							$("#myCarousel").carousel("next");
							renderTable(symbol, output);
						}
					}
				}
			});	
		});
	})	

	function getNews(symbol){
		$.ajax({
			url: CONFIG.getValue('url'),
			dataType: CONFIG.getValue('dataType'),
			type: 'GET',
			data:{
				company: symbol
			},
			success: function(output){
				$("#newsFeedBody").empty();
				var output = output.value;
				var len = (output).length;
				for(var i=0;i<len;i++){
					var div = document.createElement('div');
					var $newDiv = $("<div/>").addClass("well well-sm").css('width','98%').css('margin','auto').css('margin-top','20px');

					//contents of each div
					var formattedTitle = output[i].name;
					var publisher = output[i].provider[0].name;
					var formattedLinkTitle = formattedTitle.link(output[i].url);	 
					var formattedTime =	moment(output[i].datePublished).format('DD MMMM YYYY hh:mm:ss '); 

					$newDiv.html(formattedLinkTitle+"<br/><br/>" +output[i].description+"<br/><br/>"+"<strong>Publisher: "+publisher+"</strong><br/><br/><strong>Date: "+formattedTime+"</strong><br/><br/>");	
					$('#newsFeedBody').append($newDiv);
				}
			}				
		});	
	}

	function savedTableUpdate(){
		var savedSymbols = JSON.parse(localStorage.getItem("symbol"));
		// make ajax requests for all saved stocks one by one
		if(savedSymbols != null){
			for(var i = 0; i<savedSymbols.length; i++){
				$.ajax({
					type:'GET',
					url: CONFIG.getValue('url'),
					dataType: CONFIG.getValue('dataType'),
					data:{
						name: savedSymbols[i]
					},
					success: function(output){
						var newValue = parseFloat(output.Change).toFixed(2) +' ('+ parseFloat(output.ChangePercent).toFixed(2) +'%)';
						$("#price"+output.Symbol).html('$ '+output.LastPrice);
						if(output.Change>0)
							$("#change"+output.Symbol).html(newValue+"<img src='images/up.png'>");
						else if(output.change<0)
							$("#change"+output.Symbol).html(newValue+"<img src='images/down.png'>");
					}
				});
			}
		} 
	}

	function autoRefresh(checked) {
		var time;
		if(checked){
			time = setTimeout(function(){
				autoRefresh($("#refresh").is(":checked"));
			}, 5000);
			savedTableUpdate();
		}
		else {
			clearTimeout(time);
		}
	}

	$("#selfRefresh").click(function(e) {
		savedTableUpdate();
	});

	$("#refresh").change(function(e) {
		var checked = $("#refresh").is(":checked");
		autoRefresh(checked);
	});

	$("#historicalCharts").on('click', function(){
		if(chartString != $('#name').val()){
			var chart = $('##historicalChartsBody').highcharts();
			chart.destroy();
			chartString = $('#name').val();
			getChart(chartString);
		}
	});

	function getChart(symbol){
		$.ajax({
			url: CONFIG.getValue('url'),
			dataType: CONFIG.getValue('dataType'),
			type: 'GET',
			data:{
				chart: symbol
			},
			success: function(output){
				var dataArray = [];
        		for (var i = 0; i < output.Dates.length; i++) {
                    	var d = new Date(output.Dates[i] + 'Z');
          	    	dataArray.push([d.getTime(), output.Elements[0].DataSeries.close.values[i]]);
        		}
        		render(dataArray);
			}
		});	
	}

	function render(chart) {
		// split the data set into ohlc and volume
		var ohlc = chart;

		// create the chart
		$('#historicalChartsBody').highcharts('StockChart', {
			
			rangeSelector: {
				selected: 0,
				buttons: [{
            		type: 'week',
	                count: 1,
	                text: '1w'
	            }, {
            		type: 'month',
	                count: 1,
	                text: '1m'
	            }, {
            		type: 'month',
	                count: 3,
	                text: '3m'
	            }, {
            		type: 'month',
	                count: 6,
	                text: '6m'
	            },{
            		type: 'ytd',
	                text: 'YTD'
	            },{
            		type: 'year',
	                count: 1,
	                text: '1y'
	            },{
	                type: 'all',
	                text: 'All'
	            }]

				//enabled: false
			},

			title: {
				text: symbol + ' Stock Value'
			},
			exporting: {
				enabled: false
			},

			yAxis: {
				min:0,
				title: {
					text: 'Stock Value'
				}
			},
			
			series: [{
				type: 'area',
				name: symbol,
				data: chart,
				threshold: null,
				tooltip : {
					valueDecimals : 2,
					valuePrefix: '$'
				},
				fillColor : {
					linearGradient : {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1
					},
					stops : [
						[0, Highcharts.getOptions().colors[0]],
						[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
					]
				}
			}],
		});
	}

	window.fbAsyncInit = function() {
		FB.init({
	      appId      : CONFIG.getValue["fbAppId"],
	      xfbml      : true,
	      version    : 'v2.5'
		});
	};

	//code from facebook sdk
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {
			return;
		}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	$(document).on('click','#shareButton',function(e){
		
		e.preventDefault();
		FB.ui({
			// sharing screen on facebook
			method: 'share',
			title: 'Current Stock Price of '+name+' is '+price,
			href: 'http://dev.markitondemand.com/MODApis/',
			picture: $('#rightImageBody').children('img').attr('src'),
			caption: 'Last Traded Price: $ '+price+', CHANGE: '+change+'( '+changePercent+'%)',
			description: "STOCK INFORMATION OF "+name+" ("+symbol+")",
		},

		function(response) {
				if(response && !response.error_message) {
					alert('Posted successfully');
				}
				else {
					alert('Not Posted');
				}
			}
		);		
	});

	$('#favoriteTable').on('click', '.trash', function() {

		//delete from table
		$(this).closest('tr').remove();		
		var sym = $('td:first',$(this).closest('tr')).text();
		deleteFromLocalStorage(sym);
	});


	$(function(){
		$("#saveButton").click(function(e){
			var currentColor = $("#saveButton").css('color');
			if(currentColor == "rgb(255, 255, 0)"){
				$("#saveButton").css('color','white');
				deleteFromTable(symbol);
			}
			else{
				var retrievedSymbols = JSON.parse(localStorage.getItem("symbol"));
				if(retrievedSymbols == null){
					retrievedSymbols = [];
					$("#saveButton").css('color','white');
				}
				if( retrievedSymbols == null || retrievedSymbols.length == 0 || retrievedSymbols.indexOf(symbol) == -1){
					retrievedSymbols.push(symbol);
					localStorage.setItem("symbol", JSON.stringify(retrievedSymbols));	
					$("#saveButton").css('color','yellow');

					$.ajax({
						url: CONFIG.getValue('url'),
						dataType: CONFIG.getValue('dataType'),
						type: 'GET',
						data:{
							name: symbol
						},
						success: function(output){
							//formatting fields in fav table
							var fancyChange = parseFloat(output.Change).toFixed(2) +' ('+ parseFloat(output.ChangePercent).toFixed(2)+'%)';
							if(output.Change>0){
								$("#favoriteTable").append('<tr><td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'" style="color:green">'+fancyChange+'<img src="images/up.png"</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td></tr>') ;
							}
							else if(output.Change<0){
								$("#favoriteTable").append('<tr><td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'" style="color:red">'+fancyChange+'<img src="images/down.png"</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
							}
							else
								$("#favoriteTable").append('<tr><td><a href="" id="favoriteTableLink">'+output.Symbol+"<a href=''>"+'</td><td>'+output.Name+'</td><td id="price'+output.Symbol+'">'+'$ '+output.LastPrice+'</td><td id="change'+output.Symbol+'>'+fancyChange+'</td><td>'+formatFunction(output.MarketCap)+'</td><td><button class="btn btn-default trash" id="trash"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
						} 
					});		
				}
				
				else if(retrievedSymbols.indexOf(symbol)!=-1 && currentColor == "rgb(255, 255, 0)"){
					deleteFromLocalStorage(symbol);
				}
			}
		});
	})
	function deleteFromLocalStorage(symb){
		var toBeDeletedArray = JSON.parse(localStorage.getItem("symbol"));
		var index = toBeDeletedArray.indexOf(symb);
		toBeDeletedArray.splice(index, 1);
		localStorage.clear();
		localStorage.setItem("symbol",JSON.stringify(toBeDeletedArray));
	}
	function deleteFromTable(symb){
		var tableData = document.getElementById("favoriteTable");
		var tabId = '#favoriteTable tr';
		var rowcount = $(tabId).length;         
		for (var i = 0; i < rowcount; i++) {
			var sym = $(tabId).eq(i).children('td').eq(0).text();
			if (null != sym && symb == sym) {
				tableData.deleteRow(i);
				break;
			}
		}
		deleteFromLocalStorage(symb);
	}

	function renderTable(symbol, output){
		getNews(symbol);
		getChart(symbol);
		hideErrorMessage();
		var pic = document.getElementById("rightImage");
		pic.src = 'http://chart.finance.yahoo.com/t?s='+symbol+'&lang=en-US&width=400&height=300';
		var table = $("<table class = \"table table-striped\">").attr("id","mytable");
		$("#rightBody").append(table);
		var tr="<tr>";
		var ntr="</tr>";
		var th="<th>";
		var nth="</th>";
		var td="<td>";
		var ntd="</td>";
	    var nameField=tr+th+"Name"+nth+td+output.Name+ntd+ntr;
	    name = output.Name;
	    var symbolField=tr+th+"Symbol"+nth+td+output.Symbol+ntd+ntr;
	     
	    var roundedLastPrice = Math.round(output.LastPrice * 100) / 100;
	    price = roundedLastPrice;

		var lastPriceField=tr+th+"Last Price"+nth+td+"$ "+roundedLastPrice+ntd+ntr;

		var roundedChange = Math.round(output.Change * 100) / 100;
		change = roundedChange;
		var roundedChangePercent = Math.round(output.ChangePercent * 100) / 100;
		changePercent = roundedChangePercent;
		
		if(roundedChange>0){
			var changeField=tr+th+"Change (Change Percent)"+nth+"<td style='color: green;'>"+roundedChange+" ("+roundedChangePercent+"%) "+"<img src='images/up.png'>"+ntd+ntr;
		}
		else{
			var changeField=tr+th+"Change (Change Percent)"+nth+"<td style='color: red;'>"+roundedChange+" ("+roundedChangePercent+"%) "+"<img src='images/down.png'>"+ntd+ntr;
		}

		var formattedTime =	moment(output.Timestamp).format('DD MMMM YYYY, h:mm:ss a'); 

		var timeField=tr+th+"Timestamp"+nth+td+formattedTime+ntd+ntr;

		var marketCapField=tr+th+"Market Cap"+nth+td+formatFunction(output.MarketCap)+ntd+ntr;
		marketCap = output.MarketCap;
		var volumeField=tr+th+"Volume"+nth+td+output.Volume+ntd+ntr;
		var roundedChangeYTD = Math.round(output.ChangeYTD * 100) / 100;
		var roundedChangePercentYTD = Math.round(output.ChangePercentYTD * 100) / 100;

		if(roundedChangePercentYTD>0){

			var ytdField = tr+th+"Change YTD (Change Percent YTD)"+nth+"<td style='color: green;'>"+roundedChangeYTD+" ("+roundedChangePercentYTD+"%) "+"<img src='images/up.png'>"
			+ntd+ntr;

		} else {

			ytdField = tr+th+"Change YTD (Change Percent YTD)"+nth+"<td style='color: red;'>"+roundedChangeYTD+" ("+roundedChangePercentYTD+"%) "+"<img src='images/down.png'>"+ntd+ntr;
		
		}	
		var highField=tr+th+"High"+nth+td+"$ "+(Math.round(output.High*100)/100)+ntd+ntr;
		var lowField=tr+th+"Low"+nth+td+"$ "+(Math.round(output.Low*100)/100)+ntd+ntr;
		var openField=tr+th+"Open"+nth+td+"$ "+(Math.round(output.Open*100)/100)+ntd+ntr;

		$("#mytable").html(nameField+symbolField+lastPriceField+changeField+timeField+marketCapField+volumeField+ytdField+highField+lowField+openField);
		$("#rightBody").append("</table>");

	}

	$("#rightButton").click(function() {
		$('.carousel').carousel('next');
	})
    $("#leftButton").click(function() {
        $('.carousel').carousel('prev');
    })

});		