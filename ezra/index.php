<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<meta name="msapplication-config" content="../icons/browserconfig.xml">
<meta name="theme-color" content="#ffffff">
<link rel="apple-touch-icon" sizes="180x180" href="../icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="../icons/android-chrome-192x192.png" sizes="192x192">
<link rel="icon" type="image/png" href="../icons/android-chrome-144x144.png" sizes="144x144">
<link rel="icon" type="image/png" href="../icons/android-chrome-96x96.png" sizes="96x96">
<link rel="icon" type="image/png" href="../icons/android-chrome-72x72.png" sizes="72x72">
<link rel="icon" type="image/png" href="../icons/android-chrome-48x48.png" sizes="48x48">
<link rel="icon" type="image/png" href="../icons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="../icons/favicon-16x16.png" sizes="16x16">
<link rel="mask-icon" href="../icons/safari-pinned-tab.svg" color="#5bbad5">
<link rel="shortcut icon" href="../icons/favicon.ico">
<link rel=stylesheet href="ezra.css">

<title>Congworks for Publications</title>
<?php
if (isset($_COOKIE['username']))
	{
	$user=$_COOKIE["username"];
	}
else $user="";
?>
</head>
<body>
<div style="width:100%;margin:0 auto;text-align:center;">
<img src="../img/icons/congworks.png"><br>
<img src="../img/buttons/文書係.png"><br>
Version 0.1<br>
<img src="../img/lines/ライン１.png"><br>
<a href="javascript:GoMenu1()">品目リスト</a><br><br>
<a href="javascript:GoMenu2()">入荷品目</a><br><br>
<a href="javascript:GoMenu3()">在庫調査用紙</a><br>
<img src="../img/lines/ライン１.png"><br><br>
</div>
<script type="text/javascript">
var preload=false;
function GoMenu1()
	{
	if (preload) return;
	preload=true;
	location.href="menu1.php?nendo=";
	}
function GoMenu2()
	{
	alert("この機能はまだ実装されていません。");
	//if (preload) return;
	//preload=true;
	//location.replace("menu2.php?nenget=");
	}
function GoMenu3()
	{
	if (preload) return;
	preload=true;
	location.href="menu3.php?nenget=";
	}
</script>
</body>
</html>

