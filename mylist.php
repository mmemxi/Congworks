<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<script type="text/javascript" src="./pp/cookie.js"></script>
<title>Congworks for Personal-マイリスト</title>
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
exec("cscript \"" . $cwpath . "mylist.wsf\" $congnum $UIDS //Nologo",$out);
$nolist=true;
$body=mb_convert_encoding($out[0],"UTF8","SJIS-WIN");
if ($body == "No System")
	{
	print "Quickyシステムが起動していません。<br>システム管理者にお問い合わせください。<br><br>";
	print "<a href='javascript:location.replace(\"index.php\")'><img src='./img/buttons/back.png'></a><br>";
	exit();
	}
else{
	$tbl=explode("<br>",$body);
	$s1="";$s2="";

	for($i=0;$i<count($tbl)-1;$i++)
		{
		$line=explode(",",$tbl[$i].",dummy");
		$nolist=false;
		if ($line[0]=="A")
			{
			if ($s1=="")
				{
				$s1="●集合住宅<br><br>";
				$s1=$s1."<table border=1 cellpadding=4 cellspacing=0><tr style='background-color:#22ee66;'>";
				$s1=$s1."<td align=center>区域番号</td>";
				$s1=$s1."<td align=center>地図番号</td>";
				$s1=$s1."<td align=center>区域名</td>";
				$s1=$s1."<td align=center>有効期限</td>";
				$s1=$s1."<td align=center>操　作</td>";
				$s1=$s1."</tr>";
				}
			$s1=$s1."<tr>";
			$s1=$s1."<td align=center>$line[1]</td><td align=center>$line[2]</td>";
			$s1=$s1."<td>";
			$s1=$s1."$line[3]</td><td>$line[5]</td>";
			$s1=$s1."<td><a href=\"javascript:DownloadIt('$line[6]')\"><img src='./img/buttons/view.png'></a>";
			$s1=$s1."<a href=\"javascript:PrintIt('$line[6]')\"><img src='./img/buttons/print.png'></a>";
			$s1=$s1."<a href=\"javascript:CancelIt('$line[6]')\"><img src='./img/buttons/cancel.png'></a></td>";
			$s1=$s1."</tr>";
			}
		if ($line[0]=="B")
			{
			if ($s2=="")
				{
				$s2="●長期留守宅<br><br>";
				$s2=$s2."<table border=1 cellpadding=4 cellspacing=0><tr style='background-color:#22ee66;'>";
				$s2=$s2."<td align=center>区域番号</td>";
				$s2=$s2."<td align=center>地図番号</td>";
				$s2=$s2."<td align=center>区域名</td>";
				$s2=$s2."<td align=center>有効期限</td>";
				$s2=$s2."<td align=center>操　作</td>";
				$s2=$s2."</tr>";
				}
			$s2=$s2."<tr>";
			$s2=$s2."<td align=center>$line[1]</td><td align=center>$line[2]</td>";
			$s2=$s2."<td>";
			$s2=$s2."$line[3]</td><td>$line[5]</td>";
			$s2=$s2."<td><a href=\"javascript:DownloadIt('$line[6]')\"><img src='./img/buttons/view.png'></a>";
			$s2=$s2."<a href=\"javascript:PrintIt('$line[6]')\"><img src='./img/buttons/print.png'></a>";
			$s2=$s2."<a href=\"javascript:CancelIt('$line[6]')\"><img src='./img/buttons/cancel.png'></a></td>";
			$s2=$s2."</tr>";
			}
		}
	//	テーブルを閉じる
	if ($s1!="") $s1=$s1."</table><br><img src='./img/lines/ライン１.png'><br><br>";
	if ($s2!="") $s2=$s2."</table><br><img src='./img/lines/ライン１.png'><br><br>";

	//	掲示物欄-------------------------------------------------------------------------
	$dir = "./publish/$congnum" ;
	if( is_dir( $dir ) && $handle = opendir( $dir ) )
		{
		print "●お知らせ<br>";
		echo "<ul>" ;
		while( ($file = readdir($handle)) !== false )
			{
			$path = $dir . "/" . $file;
			if (! is_dir($path))
				{
				$pathU=mb_convert_encoding($path,"UTF8","auto");
				$fileU=mb_convert_encoding(preg_replace("/(.+)(\.[^.]+$)/", "$1", $file),"UTF8","auto");
				echo "<li>" ;
				echo "<a href='" . $pathU . "' target='_blank'>". $fileU . "</a>が公開されました。";
				echo "</li>" ;
				}
			}
		}

	//	個人フォルダのチェック
	$dir = "./publish/$congnum/$UID";
	if( is_dir( $dir ) && $handle = opendir( $dir ) )
		{
		while( ($file = readdir($handle)) !== false )
			{
			if( filetype( $path = $dir . "/" . $file ) == "file" )
				{
				$pathU=mb_convert_encoding($path,"UTF8","auto");
				$fileU=mb_convert_encoding(preg_replace("/(.+)(\.[^.]+$)/", "$1", $file),"UTF8","auto");
				echo "<li>" ;
				echo "<a href='" . $pathU . "' target='_blank'>". $fileU . "</a>をダウンロードできます。";
				echo "</li>" ;
				}
			}
		}
	echo "</ul>" ;
	// ----------------------------------------------------------------------------------
	//	見出し終了
	print "<div align=right><a href=\"javascript:location.replace('index.php')\"><img src=\"./img/buttons/back.png\"></a></div><br>";
	print "<img src='./img/lines/ライン１.png'><br><br>";
	if ($nolist)
		{
		print "借りている区域はありません。<br>";
		}
	else{
		print $s1;
		print $s2;
		}
	print "<a href=\"javascript:RequestA()\">●集合住宅の区域を借りる</a><br><br>";
	print "<a href=\"javascript:RequestB()\">●長期留守宅の区域を借りる</a><br><br>";
	}
?>
<img src="./img/lines/ライン１.png"><br><br>
<a href="javascript:location.replace('index.php')"><img src="./img/buttons/back.png"></a><br>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/javascript">
var preload=false;
var uid,cid,cname;
function DownloadIt(file)
	{
	if (navigator.userAgent.indexOf("Android")>0)
		{
		location.replace("download.php?Target="+file);
		return;
		}
	window.open("download.php?Target="+file);
	}
function PrintIt(file)
	{
	if (preload) return;
	var r=confirm("この地図を印刷します。よろしいですか？");
	if (!r) return;
	preload=true;
	location.replace("print.php?PDF="+file);
	}
function RequestA()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("requestA.php");
	}
function RequestB()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("requestB.php");
	}
function CancelIt(pdf)
	{
	var r=confirm("この区域の貸し出しを取り消しますか？");
	if (!r) return;
	PleaseWait();
	location.replace("cancel.php?Target="+pdf);
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

