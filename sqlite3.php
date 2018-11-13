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
$congnum="34173";
$sql = "select num,name,kubun,inuse,userid,startday,endday,limitday from PublicList where congnum='" . $congnum . "' order by num;";
foreach ($pdo->query($sql) as $line)
	{
	for($i=0;$i<=7;$i++)
		{
		if ($i>0) echo ",";
		echo "$line[$i]";
		}
	echo "<br>";
	}
?>
</body>
</html>
