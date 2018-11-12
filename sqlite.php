<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
<?php
$pdo = new PDO('sqlite:congworks.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
$sql = "select * from PublicList order by num;";
foreach ($pdo->query($sql) as $line)
	{
	print "{$line['num']}:{$line['name']}({$line['kubun']})<br>";
	}
/*
$link = sqlite_open('congworks.db', 0666, $sqliteerror);
if (!$link)
	{
	die('接続失敗です。'.$sqliteerror);
	}
$sql = "select * from PublicList where congnum=34173;";
$result = sqlite_query($link, $sql, SQLITE_BOTH, $sqliteerror);
if (!$result)
	{
	die('クエリーが失敗しました。'.$sqliteerror);
	}
for ($i = 0 ; $i < sqlite_num_rows($result) ; $i++)
	{
	$rows = sqlite_fetch_array($result, SQLITE_ASSOC);
	print('num='.$rows['num']);
    print(',name='.$rows['name'].'<br>');
	}
*/
?>
</body>
</html>
