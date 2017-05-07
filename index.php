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
		$opts = array(
		  'http'=>array(
		   'method'=>"GET",
		   'header'=> "Ocp-Apim-Subscription-Key: 76d97da5029940e297dafb85894d20fa"
		  )
		);
		$context = stream_context_create($opts);
		$symbol = $_GET["company"];
	    $json = json_decode(file_get_contents('https://api.cognitive.microsoft.com/bing/v5.0/news/search?q='.urlencode($symbol).'&count=10&offset=0&mkt=en-us&safeSearch=Moderate', false, $context);
	    echo json_encode($json);
	}
	else if(isset($_GET["chart"])){
		$symbol = $_GET["chart"];
		$json = file_get_contents('http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters={"Normalized":false,"NumberOfDays":1095,"DataPeriod":"Day","Elements":[{"Symbol":"'.urlencode($symbol).'","Type":"price","Params":["ohlc"]}]}');
		$jsonEncoded = json_encode($json);
		echo $json;
	}
?>
