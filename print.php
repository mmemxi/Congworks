<?php
// 引数取得
$pdf=$_GET['PDF'];			//	対象となるPDFファイル

// Cookie取得
if (isset($_COOKIE['CWPerson_congnum']))	$congnum=$_COOKIE["CWPerson_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPerson_UserID']))		$userid=$_COOKIE["CWPerson_UserID"];
	else $userid="";
$userids=mb_convert_encoding($userid,"SJIS-WIN","UTF8");

// 印刷処理実行
$cwpath=dirname(__FILE__) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "print.wsf\" $congnum $userids $pdf //Nologo",$out);

// 印刷結果確認
$body=mb_convert_encoding($out[0],"UTF8","SJIS-WIN");
if ($body == "Error:NoQue")
	{
	echo "印刷フォルダが存在しません。<br>管理者にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
if ($body == "Error:NoPrintSystem")
	{
	echo "印刷用システムが起動していません。<br>管理者にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
if ($body == "Error:NoPrintFile")
	{
	echo "印刷するファイルが見つかりません。<br>管理者にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
if ($body == "Error:PleaseWait")
	{
	echo "現在印刷待ち中です。しばらくお待ちください。<br><br>";
	print "<a href='javascript:location.replace(\"mylist.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
if ($body == "OK")
	{
	header("Location:mylist.php");
	exit();
	}
?>
