<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
Spot情報をJSONテーブルから取得して表示するテスト<br>
<hr>
<?php
$pdo = new PDO('sqlite:congworks.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
$sql = "select * from JSON where key1='34173' and key2='spots';";
foreach ($pdo->query($sql) as $line)
	{
	$j=$line['body'];
	$j=str_replace("'","\"",$j);
	$jobj=json_decode($j);
	for($i=0;$i<count($jobj);$i++)
		{
		print "{$jobj[$i]->name}({$jobj[$i]->x},{$jobj[$i]->y})<br>";
		}
	}
?>
</body>
</html>
