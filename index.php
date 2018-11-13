<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<meta name="msapplication-config" content="/icons/browserconfig.xml">
<meta name="theme-color" content="#ffffff">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/icons/android-chrome-192x192.png" sizes="192x192">
<link rel="icon" type="image/png" href="/icons/android-chrome-144x144.png" sizes="144x144">
<link rel="icon" type="image/png" href="/icons/android-chrome-96x96.png" sizes="96x96">
<link rel="icon" type="image/png" href="/icons/android-chrome-72x72.png" sizes="72x72">
<link rel="icon" type="image/png" href="/icons/android-chrome-48x48.png" sizes="48x48">
<link rel="icon" type="image/png" href="/icons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/icons/favicon-16x16.png" sizes="16x16">
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5">
<link rel="shortcut icon" href="/icons/favicon.ico">
<script type="text/javascript" src="./pp/cookie.js"></script>
<title>個人の区域 - Congworks for Personal</title>
<?php
if (isset($_COOKIE['CWPerson_UserID']))		$UIDC=$_COOKIE["CWPerson_UserID"];
	else $UIDC="";
if (isset($_COOKIE['CWPerson_congnum']))	$congnum=$_COOKIE["CWPerson_congnum"];
	else $congnum="";
$qtxt=dirname(__FILE__) . "\\quicky";
$qpath=$qtxt . "\\data";
$cwpath=$qtxt . "\\congworks\\";
$dirs = scandir($qpath);
$conglist="";
$congnames="";
foreach ($dirs AS $dir)
	{
	if ($dir === ".") continue;
	if ($dir === "..") continue;
	if ($conglist !== "")
		{
		$conglist = $conglist . ",";
		$congnames = $congnames . ",";
		}
	$conglist=$conglist . $dir;
	$xmlfile=$qpath . "\\" . $dir . "\\quicky.xml";
	if (file_exists($xmlfile)===false)
		{
		$congnames=$congnames . "?????";
		continue;
		}

	$body=file_get_contents($xmlfile);
	$body=mb_convert_encoding($body,"UTF8","SJIS-WIN");
	$tbl=explode("\n",$body);
	for($i=0;$i<count($tbl)-1;$i++)
		{
		$p1=mb_strpos($tbl[$i],"CongName=\"",0,"UTF-8");
		if ($p1===false) continue;
		$p2=mb_strpos($tbl[$i],"\"",$p1+10,"UTF-8");
		if ($p2===false) continue;
		$plen=($p2-($p1+10));
		$name=mb_substr($tbl[$i],$p1+10,$plen,"UTF-8");
		$congnames=$congnames . $name;
		break;
		}
	}
echo "<script type='text/javascript'>";
echo "defaultcongnum='" . $congnum . "';";
echo "conglist=\"$conglist\";";
echo "congnames=\"$congnames\";";
echo "</script>";

if (isset($_COOKIE['CWToken']))		$CWToken=$_COOKIE["CWToken"];
else	{
		exec("cscript \"" . $cwpath . "getcwtoken.wsf\" //Nologo",$out);
		$CWToken=$out[0];
		}
echo "<script type='text/javascript'>";
echo "CWToken=\"$CWToken\";";
echo "</script>";

?>
</head>
<body onload="document.forms[0].elements[1].focus()">
<div style="width:100%;margin:0 auto;text-align:center;">
<img src="./img/icons/congworks.png"><br>
<img src="./img/buttons/個人の区域.png"><br>
Version 3.04<br>
<img src="./img/lines/ライン１.png"><br><br>
<form onsubmit="GoFoward();return false;">
会衆名：<select name=congnum size=1>
<script type="text/javascript">
var mycong=0;
var arg = new Object;
var pair=location.search.substring(1).split('&');
for(var i=0;pair[i];i++) {
	var kv = pair[i].split('=');
	arg[kv[0]]=kv[1];
	}
if (defaultcongnum!="") mycong=defaultcongnum;
if ("congnum" in arg)	mycong=arg.congnum;
var ccodes=conglist.split(",");
var cnames=congnames.split(",");
for(i=0;i<ccodes.length;i++)
	{
	document.write("<option value='"+ccodes[i]+"'");
	if (ccodes[i]==mycong) document.write(" selected");
	document.write(">"+cnames[i]+"</option>");
	}
</script>
</select><br><br>あなたの名前を入力してください。<br><br>
<?php
print("<input type=text size=20 name=UserID value=\"$UIDC\">");
?>
<br><br>
<a href="javascript:GoFoward()"><img src="./img/buttons/next.png"></a>
</form>
</div>
</div>
<br><br><br><br><br>
<div style="font-size:14px;color:#777777;text-align:right;">
<a href="./pp/index.php">区域係専用</a><br>
<a href="./ezra/index.php">文書係専用</a><br>
</div>
<div style="font-size:6px;color:#cccccc;">
<script type="text/javascript">
document.write(navigator.userAgent+"<br>");
</script>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/javascript">
var preload=false;
function GoFoward()
	{
	var i,cid,uid;
	if (preload) return;
	preload=true;
	i=document.forms[0].congnum.selectedIndex;
	userid=document.forms[0].UserID.value;
	congnum=document.forms[0].congnum.value;
	congname=document.forms[0].congnum.options[i].text;
	//	Cookieに保存
	setCookie("CWPerson_UserID",userid);
	setCookie("CWPerson_congnum",congnum);
	setCookie("CWPerson_congname",congname);
	setCookie("CWToken",CWToken);
	PleaseWait();
	location.replace("mylist.php");
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

