<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<script type="text/javascript" src="cookie.js"></script>
<title>Congworks for Public Preaching-新規使用可能区域の一覧</title>
<?php
if (isset($_COOKIE['CWPP_UserID']))	$UID=$_COOKIE["CWPP_UserID"];
	else $UID="";
$UID=mb_convert_encoding($UID,"SJIS-WIN","UTF8");
if (isset($_COOKIE['CWPP_congnum']))	$congnum=$_COOKIE["CWPP_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPP_congname']))	$congname=$_COOKIE["CWPP_congname"];
	else $congname="";
?>
</head>
<body onload="DrawList()">
<div style="width:100%;margin:0 auto;text-align:left;">
<img src="../img/icons/cwpreaching.png"><img src="../img/buttons/会衆の区域.png"><br>
<script language="JavaScript">
var congnum=Cookies["CWPP_congnum"];
var congname=Cookies["CWPP_congname"];
var UserID=Cookies["CWPP_UserID"];
var CWToken=Cookies["CWToken"];
document.write(congname+"("+congnum+")");
document.write("／ユーザー名："+UserID+"<br>");
</script>
<img src="../img/lines/ライン１.png"><br>
</div>
<div id="LayerO" style="visibility:hidden;width:1px;height:1px;"><?php
echo "<textarea id=\"PHP1\">";
$cwpath=dirname(dirname(__FILE__)) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "newlist.wsf\" $congnum $UID  //Nologo",$out);
for($i=0;$i<count($out);$i++)
	{
	$body=mb_convert_encoding($out[$i],"UTF8","SJIS-WIN");
	echo $body . "\n";
	}
echo "</textarea>";
?></div>
<div id="MAIN"></div>
<img src="../img/lines/ライン１.png"><br><br>
<a href="javascript:location.replace('index.php')"><img src="../img/buttons/back.png"></a><br>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/JavaScript">
var SelectedKubun="";
var preload=false;
function DrawList()
	{
	var body="";
	var get,text,lines,fmt;
	var i,j,obj;
	var tbl1=new Array();
	var tbl2=new Array();
	var kubun;
	get=document.getElementById("PHP1");
	if (!get)	text="";
		else	text=get.value;
	kubun=new Array();
	//---------------------------------------------------------------
	body="●新しい区域の貸出<br>";
	if (text=="")
		{
		body+="使用できる新しい区域はありません。<br>";
		}
	else{
		lines=text.split(/\n/);
		for(i=0;i<lines.length;i++)
			{
			if (lines[i]=="") continue;
			lines[i]+=",,,,,";
			fmt=lines[i].split(",");
			if (fmt[4]!="*") continue;
			obj=new Object();
			obj.num=parseInt(fmt[0],10);
			obj.name=fmt[1];
			obj.kubun=fmt[2];
			obj.lastuse=fmt[3];
			tbl1.push(obj);
			}
		if (tbl1.length==0)
			{
			body+="使用できる新しい区域はありません。<br>";
			}
		else{
			tbl1.sort(DrawList_Sort);
			for(i=0;i<tbl1.length;i++)
				{
				j=tbl1[i].kubun;
				if (!(j in kubun)) kubun[j]=true;
				}
			body+="<table border=1 cellpadding=3 cellspacing=0>";
			body+="<tr style='background-color:#22ee66;'><td align=center>区域番号</td>";
			body+="<td align=center style='width:240px;'>区域名</td>";
			body+="<td align=center style='width:200px;'>";
			body+="<form>区分<br><select size=1 onchange='ChangeKubun()'>";
			body+="<option value=''";
			if (SelectedKubun=="") body+=" selected";
			body+=">すべて</option>";
			for(i in kubun)
				{
				body+="<option value='"+i+"'";
				if (i==SelectedKubun) body+=" selected";
				body+=">"+i+"</option>";
				}
			body+="</select></form>";
			body+="</td>";
			body+="<td align=center>前回の使用</td>";
			body+="<td align=center>操作</td></tr>";
			for(i=0;i<tbl1.length;i++)
				{
				if ((SelectedKubun!="")&&(tbl1[i].kubun!=SelectedKubun)) continue;
				body+="<tr>";
				body+="<td align=right>"+tbl1[i].num+"</td>";
				body+="<td align>"+tbl1[i].name+"</td>";
				body+="<td>"+tbl1[i].kubun+"</td>";
				body+="<td align=right>"+tbl1[i].lastuse+"</td>";
				body+="<td style='cursor:pointer;' onclick='RentIt("+tbl1[i].num+")'><img src=\"../img/buttons/rent.png\"></td>";
				body+="</tr>";
				}
			body+="</table><br>";
			}
		}
	body+="<img src=\"../img/lines/ライン１.png\"><br>";
	//---------------------------------------------------------------
	body+="●現在借りている区域<br>";
	if (text=="")
		{
		body+="現在借りている区域はありません。<br>";
		}
	else{
		for(i=0;i<lines.length;i++)
			{
			if (lines[i]=="") continue;
			lines[i]+=",,,,,";
			fmt=lines[i].split(",");
			if (fmt[4]=="*") continue;
			obj=new Object();
			obj.num=parseInt(fmt[0],10);
			obj.name=fmt[1];
			obj.kubun=fmt[2];
			obj.lastuse=fmt[3];
			tbl2.push(obj);
			}
		if (tbl2.length==0)
			{
			body+="現在借りている区域はありません。<br>";
			}
		else{
			tbl2.sort(DrawList_Sort);
			body+="<table border=1 cellpadding=3 cellspacing=0>";
			body+="<tr style='background-color:#22ee66;'><td align=center>区域番号</td>";
			body+="<td align=center style='width:240px;'>区域名</td>";
			body+="<td align=center style='width:100px;'>区分</td>";
			body+="<td align=center>使用開始日</td>";
			body+="<td align=center>操作</td></tr>";
			for(i=0;i<tbl2.length;i++)
				{
				body+="<tr>";
				body+="<td align=right>"+tbl2[i].num+"</td>";
				body+="<td align>"+tbl2[i].name+"</td>";
				body+="<td>"+tbl2[i].kubun+"</td>";
				body+="<td align=right>"+tbl2[i].lastuse+"</td>";
				body+="<td style='cursor:pointer;' onclick='CancelIt("+tbl2[i].num+",\""+tbl2[i].name+"\")'>";
				body+="<img src=\"../img/buttons/cancel.png\"></td>";
				body+="</tr>";
				}
			body+="</table><br>";
			}
		}
	document.getElementById("MAIN").innerHTML=body;
	}

function DrawList_Sort(a,b)
	{
	if (a.num<b.num) return -1;
	if (a.num>b.num) return 1;
	return 0;
	}

function ChangeKubun()
	{
	SelectedKubun=document.forms[0].elements[0].value;
	DrawList();
	}
//-------------------------------------------------------------------------
function RentIt(num)
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	setCookie("CWPP_num",num);
	location.replace("verify.php");
	}
//-------------------------------------------------------------------------
function CancelIt(num,name)
	{
	if (preload) return;
	var c=confirm(num+":"+name+"の貸出を取り消します。よろしいですか？");
	if (!c) return;
	preload=true;
	PleaseWait();
	setCookie("CWPP_num",num);
	location.replace("cancelpp.php");
	}
//-------------------------------------------------------------------------
function PleaseWait()
	{
	var x=document.body.clientWidth;
	var y=window.innerHeight;
	var s;
	var ty=document.body.scrollTop;
	s="<img src='../img/black.gif' width="+x+" height="+y+">";
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

