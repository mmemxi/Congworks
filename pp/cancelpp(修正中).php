<?php
if (isset($_COOKIE['CWPP_congnum']))	$congnum=$_COOKIE["CWPP_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPP_num']))		$num=$_COOKIE["CWPP_num"];
	else $num="";

// (0)PDOの準備---------------------------------------------------
$pdo = new PDO('sqlite:../congworks.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
// (1)ConfigAllの取得---------------------------------------------
$sql = "select body from JSON where key1='" . $congnum . "' and key2='config' and key3='all';";
$data=$pdo->query($sql)->fetchAll();
$body=$data[0]['body'];
$js=str_replace("'","\"",$body);
$ConfigAll=json_decode($js);
// (2)カード情報の取得--------------------------------------------
$sql = "select * from Cards where congnum=$congnum and num=$num;";
$Cards=$pdo->query($sql)->fetchAll();
// (3)ログ情報の取得----------------------------------------------
$sql = "select * from PublicLogs where congnum=$congnum and num=$num;";
$Log=$pdo->query($sql)->fetchAll();
if ($Log[0]['status'] != "Using")
	{

	}

if (obj.Status!="Using")		//	使用中でない
	{
	WScript.StdOut.Write("ng");
	WScript.quit();
	}
var l=obj.History.length;
if (l==0)
	{
	WScript.StdOut.Write("ng");
	WScript.quit();	//	ログが無い
	}
var startday=obj.Latest.Rent;		//	キャンセルしたい貸出日をキープ
obj.History.splice(l-1,1);
SetLogSummary(obj);
SaveLog(obj,congnum,num);


$cwpath=dirname(dirname(__FILE__)) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "cancelpp.wsf\" $congnum $num //Nologo",$out);
header("Location:newlist.php");
exit();
?>
