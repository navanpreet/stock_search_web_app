<?php
	header("Access-Control-Allow-Origin: *");
	if(isset($_GET["action"])) { 
	    $symbol = $_GET["action"];
	    $json = json_decode(file_get_contents('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input='.urlencode($symbol)));
	    echo json_encode($json);
	}  
	else if(isset($_GET["name"])){
		$symbol = $_GET["name"];
		$json = file_get_contents('http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol='.urlencode($symbol));
		echo $json;
	}
	else if(isset($_GET["company"])){
		$symbol = $_GET["company"];
	    $json = json_decode(file_get_contents('https://ajax.googleapis.com/ajax/services/search/news?v=1.0&q='.urlencode($symbol).'&userip=68.181.195.44'));
	    echo json_encode($json);
	}
	else if(isset($_GET["chart"])){
		$symbol = $_GET["chart"];
		$json = file_get_contents('http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters={"Normalized":false,"NumberOfDays":1095,"DataPeriod":"Day","Elements":[{"Symbol":"'.urlencode($symbol).'","Type":"price","Params":["ohlc"]}]}');
		$jsonEncoded = json_encode($json);
		echo $json;
	}
?>
