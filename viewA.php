<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<script type="text/javascript" src="./pp/cookie.js"></script>
<title>Congworks for Personal-貸出区域の確認</title>
<?php
$UID=$_COOKIE["CWPerson_UserID"];
$UIDS=mb_convert_encoding($UID,"SJIS-WIN","UTF8");
$congnum=$_COOKIE["CWPerson_congnum"];
$congname=$_COOKIE["CWPerson_congname"];
$num=$_COOKIE["CWPerson_num"];
$seq=$_COOKIE["CWPerson_seq"];
$name=$_COOKIE["CWPerson_name"];
$names=mb_convert_encoding($name,"SJIS-WIN","UTF8");
?>
</head>
<body>
<div style="width:100%;margin:0 auto;text-align:left;">
<img src='./img/icons/cwpersonal.png'><br>
<script language="JavaScript">
var congnum=Cookies["CWPerson_congnum"];
var congname=Cookies["CWPerson_congname"];
var UserID=Cookies["CWPerson_UserID"];
var num=Cookies["CWPerson_num"];
var seq=Cookies["CWPerson_seq"];
var name=Cookies["CWPerson_name"];
document.write(congname+"("+congnum+")");
document.write("／ユーザー名："+UserID+"<br>");
</script>
<img src='./img/lines/ライン１.png'><br>
</div>
<?php
print "No." . $num . "-" . $seq . "：「" . $name . "」の詳細<br>";
?>
<div>
<?php
$cwpath=dirname(__FILE__) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "viewA.wsf\" $congnum:$UIDS:$num:$seq:$names //Nologo",$out);
$body=mb_convert_encoding($out[0],"UTF8","SJIS-WIN");
if ($body == "No System")
	{
	echo "Quickyシステムが起動していません。<br>区域係の兄弟にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
else{
	print "<div style='width:600px;text-align:center;'>この区域を借りますか？</div><br>";
	print "<div style='width:600px;text-align:center;'><a href='javascript:RentIt()'><img src=\"./img/buttons/ok.png\"></a>";
	print "<a href=\"javascript:BackPage()\">";
	print "<img src=\"./img/buttons/back.png\"></a></div>";
	print "<img src=\"./img/lines/ライン１.png\"><br>";
	print "<div style='zoom:25%;position:relative;'>$body</div>";
	}
?>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/javascript">
var preload=false;
function RentIt()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("rentA.php");
	}
function BackPage()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("requestA.php");
	}
function PleaseWait()
	{
	var x=document.body.clientWidth;
	var y=window.innerHeight;
	var s;
	var ty=document.documentElement.scrollTop || document.body.scrollTop;
	s="<img src='./img/black.gif' width="+x+" height="+y+">";
	document.getElementById("MASK").style.visibility="visible";
	document.getElementById("MASK").style.top=ty+"px";
	document.getElementById("MASK").innerHTML=s;
	s="<table border=0 cellpadding=0 cellspacing=0>";
	s+="<tr><td><img src='../img/blank.gif' width=1 height="+y+"></td>";
	s+="<td width="+(x-1)+" align=center valign=middle style='color:#ffffff;font-size:24px;font-weight:bold;'>";
	s+="処理中です。しばらくお待ちください。";
	s+="</td></tr></table>";
	document.getElementById("TEROP").style.visibility="visible";
	document.getElementById("TEROP").style.top=ty+"px";
	document.getElementById("TEROP").innerHTML=s;
	}
</script>
</body>
</html>
