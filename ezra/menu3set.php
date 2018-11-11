<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<?php
$cwpath=dirname(__FILE__) . "\\congworks\\";
$nenget=$_GET['nenget'];
$pos=$_GET['pos'];
$code=$_GET['code'];
$suryo=$_GET['suryo'];

exec("cscript \"" . $cwpath . "menu3set.wsf\" $nenget $pos $code $suryo //Nologo",$out);
header("Location:none.php");
exit();
?>
</head>
</html>

