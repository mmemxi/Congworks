<?php
if (isset($_COOKIE['CWPP_congnum']))	$congnum=$_COOKIE["CWPP_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPP_num']))		$num=$_COOKIE["CWPP_num"];
	else $num="";

$cwpath=dirname(dirname(__FILE__)) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "cancelpp.wsf\" $congnum $num //Nologo",$out);
header("Location:newlist.php");
exit();
?>
