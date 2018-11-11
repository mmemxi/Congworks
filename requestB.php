<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<script type="text/javascript" src="./pp/cookie.js"></script>
<title>Congworks for Personal-長期留守宅の区域</title>
<?php
if (isset($_COOKIE['CWPerson_UserID']))	$UID=$_COOKIE["CWPerson_UserID"];
	else $UID="";
$UIDS=mb_convert_encoding($UID,"SJIS-WIN","UTF8");
if (isset($_COOKIE['CWPerson_congnum']))	$congnum=$_COOKIE["CWPerson_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPerson_congname']))	$congname=$_COOKIE["CWPerson_congname"];
	else $congname="";
?>
</head>
<body>
<div style="width:100%;margin:0 auto;text-align:left;">
<img src='./img/icons/cwpersonal.png'><br>
<script language="JavaScript">
var congnum=Cookies["CWPerson_congnum"];
var congname=Cookies["CWPerson_congname"];
var UserID=Cookies["CWPerson_UserID"];
document.write(congname+"("+congnum+")");
document.write("／ユーザー名："+UserID+"<br>");
</script>
<img src='./img/lines/ライン１.png'><br>
</div>
<div>
<?php
$cwpath=dirname(__FILE__) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "requestB.wsf\" $congnum $UIDS //Nologo",$out);
$body=mb_convert_encoding($out[0],"UTF8","SJIS-WIN");
if ($body == "No System")
	{
	echo "Quickyシステムが起動していません。<br>区域係の兄弟にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
else{
	$tbl=explode("<br>",$body);
	print "●長期留守宅の区域：<br>";
	print "<div align=right><a href=\"javascript:BackToMenu()\"><img src=\"./img/buttons/back.png\"></a></div><br><br>";
	if (count($tbl)<2)
		{
		print "貸し出しできる区域はありません。<br>";
		}
	else{
		$s="<table border=1 cellpadding=4 cellspacing=0><tr style='background-color:#22ee66;'>";
		$s=$s."<td align=center>区域番号</td>";
		$s=$s."<td align=center>地図番号</td>";
		$s=$s."<td align=center>区域名</td>";
		$s=$s."<td align=center>件数</td>";
		$s=$s."<td align=center>有効期限</td>";
		$s=$s."<td align=center>操　作</td>";
		$s=$s."</tr>";
		for($i=0;$i<count($tbl)-1;$i++)
			{
			$line=explode(",",$tbl[$i].",dummy");
			$s=$s."<tr>";
			$s=$s."<td align=center>$line[0]</td>";
			$s=$s."<td align=center>$line[1]</td>";
			$s=$s."<td>$line[2]</td>";
			$s=$s."<td align=right>$line[3]</td>";
			$ymd=substr($line[4],0,4)."/".substr($line[4],4,2)."/".substr($line[4],6,2);
			$s=$s."<td align=center>$ymd</td>";
			$s=$s."<td><a href=\"javascript:Preview($line[0],$line[1],'$line[2]')\"><img src=\"./img/buttons/view.png\"></a></td>";
			$s=$s."</tr>";
			}
		$s=$s."</table><br>";
		print $s;
		}
	}
?>
<img src="./img/lines/ライン１.png"><br><br>
<a href="javascript:BackToMenu()"><img src="./img/buttons/back.png"></a><br>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/javascript">
var preload=false;
var uid,cid,cname;
function Preview(num,seq,name)
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	setCookie("CWPerson_num",num);
	setCookie("CWPerson_seq",seq);
	setCookie("CWPerson_name",name);
	window.location.replace("viewB.php");
	}
function BackToMenu()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	window.location.replace("mylist.php");
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

