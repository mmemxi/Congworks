<?php
if (isset($_COOKIE['CWPP_congnum']))	$congnum=$_COOKIE["CWPP_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPP_num']))		$num=$_COOKIE["CWPP_num"];
	else $num="";
if (isset($_COOKIE['CWPP_start']))		$startday=$_COOKIE["CWPP_start"];
	else $startday="";
if (isset($_COOKIE['CWPP_mapuser']))	$mapuser=$_COOKIE["CWPP_mapuser"];
	else $mapuser="";
$mapuser=mb_convert_encoding($mapuser,"SJIS-WIN","UTF8");

// -----------------------------------------------------
//	(1)区域を取得する
// -----------------------------------------------------
$cwpath=dirname(dirname(__FILE__)) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "rent.wsf\" $congnum $num $startday $mapuser //Nologo",$out);
$body=mb_convert_encoding($out[0],"UTF8","SJIS-WIN");
// -----------------------------------------------------
//	(2)取得成功したら、区域を印刷する
// -----------------------------------------------------
if ($body == "ok")
	{
	exec("cscript \"" . $cwpath . "printpublic.wsf\" $congnum $num //Nologo",$out);
	header("Location:newlist.php");
	exit();
	}
else{
	header("Location:fault.php");
	exit();
	}
?>
