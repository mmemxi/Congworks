<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<?php
$cwpath=dirname(__FILE__) . "\\congworks\\";
$nenget=$_GET['nenget'];
exec("cscript \"" . $cwpath . "menu3new.wsf\" $nenget //Nologo",$out);
header("Location:menu3.php?nenget=" . $nenget);
exit();
?>
</head>
</html>

