<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<script type="text/javascript" src="cookie.js"></script>
<title>Congworks for Public Preaching-新規使用開始日付の指定</title>
<?php
if (isset($_COOKIE['CWPP_UserID']))	$UID=$_COOKIE["CWPP_UserID"];
	else $UID="";
if (isset($_COOKIE['CWPP_congnum']))	$congnum=$_COOKIE["CWPP_congnum"];
	else $congnum="";
if (isset($_COOKIE['CWPP_congname']))	$congname=$_COOKIE["CWPP_congname"];
	else $congname="";
if (isset($_COOKIE['CWPP_num']))		$num=$_COOKIE["CWPP_num"];
	else $num="";
?>
</head>
<body onload="Boot()">
<div style="width:100%;margin:0 auto;text-align:left;">
<img src="../img/icons/cwpreaching.png"><img src="../img/buttons/会衆の区域.png"><br>
<script language="JavaScript">
var congnum=Cookies["CWPP_congnum"];
var congname=Cookies["CWPP_congname"];
var UserID=Cookies["CWPP_UserID"];
var num=Cookies["CWPP_num"];
document.write(congname+"("+congnum+")");
document.write("／ユーザー名："+UserID+"<br>");
</script>
<img src="../img/lines/ライン１.png"><br>
</div>
<div id="LayerO" style="visibility:hidden;width:1px;height:1px;"><?php
echo "<textarea id=\"PHP1\">";
$cwpath=dirname(dirname(__FILE__)) . "\\quicky\\congworks\\";
exec("cscript \"" . $cwpath . "verify.wsf\" $congnum $num //Nologo",$out);
for($i=0;$i<count($out);$i++)
	{
	$out[$i]=mb_convert_encoding($out[$i],"UTF8","SJIS-WIN");
	}
echo $out[0];
echo "</textarea>";
echo "<textarea id=\"PHP4\">";
echo $out[1];
echo "</textarea>";
?></div>
<?php
print "<b>" . $out[0] . "の貸し出し:</b><br>";
?>
<table style="width:400px;margin:20px;" border=0 cellspacing=0 cellpadding=0>
<tr><td valign=middle style="border:2px dashed red;padding:6px;height:50px;">
<form>使用者：<select size=1>
<?php
print "<option value=''>自分（今操作しているあなた）</option>";
for($i=3;$i<count($out);$i++)
	{
	print "<option value='" . $out[$i] . "'>" . $out[$i] . "</option>";
	}
?>
</select></form></td></tr>
<tr><td valign=middle id="MAIN" style="border:2px dashed red;padding:6px;height:50px;">開始日付をカレンダーから選択してください。</td></tr>
</table>
<div id="DRAW"></div>
<img src="../img/lines/ライン１.png"><br><br>
<?php
print "<a href=\"javascript:BacktoMenu('" . $UID . "')\"><img src=\"../img/buttons/back.png\"></a><br>";
?>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/JavaScript">
var preload=false;
var Gnum,Gstartday;
var Campeigns;
function Boot()
	{
	var s,s0;
	var tbl,obj;
	s=document.getElementById("PHP4").value;
	if (s!="")	tbl=s.split(",");else tbl=new Array();
	Campeigns=new Array();
	for(i=0;i<tbl.length;i++)
		{
		s0=tbl[i].split("-");
		obj=new Object();
		obj.Start=s0[0];
		obj.End=s0[1];
		Campeigns.push(obj);
		}
	s=DrawCalender();
	document.getElementById("DRAW").innerHTML=s;
	Gnum=num;
	Gstartday="";
	}
function DrawCalender()
	{
	var s,i,j,yn,mn,x,xs,maxd;
	var ty,tm,td,cld;
	var cpflag=false;
	var today=new Date();
	var yy=today.getFullYear();
	var mm=today.getMonth();
	ty=today.getFullYear();
	tm=today.getMonth();
	td=today.getDate();
	var ds=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	s="<table border=0 cellpadding=0 cellspacing=8 bgcolor='#ccffbb'><tr>";

	for(i=-1;i<=1;i++)
		{
		yn=yy;
		mn=mm+i;
		if (mn<0)	{mn=11;yn--;}
		if (mn>11)	{mn=0;yn++;}
		today.setFullYear(yn);
		today.setMonth(mn);
		today.setDate(1);
		x=today.getDay();
		maxd=ds[mn];
		if (((yn % 4)==0)&&(mn==1))	maxd++;
		s+="<td valign=top><table border=2 cellpadding=2 cellspacing=1 bgcolor='#ffffff'>";
		s+="<tr><td bgcolor='#000000' colspan=7 align=center style='cursor:default;color:#ffffff;font-weight:bold'>"+yn+"年"+(mn+1)+"月</td></tr>";
		s+="<tr bgcolor='#ffff88' style='cursor:default;'>";
		s+="<td><font color=red>日</td><td>月</td><td>火</td><td>水</td><td>木</td><td>金</td><td>土</td></tr>";
		if (x!=0)
			{
			s+="<tr><td style='cursor:default;' bgcolor='#cccccc' colspan="+x+">　</td>";
			}
		for(j=1;j<=maxd;j++)
			{
			if (x==0) s+="<tr>";
			cld=parseInt(yn,10)*10000+(parseInt(mn,10)+1)*100+parseInt(j,10);

			cpflag=isBeforeCampeign(cld);	//	キャンペーン前の２週間に該当？

			if (cld==Gstartday)
				{
				s+="<td align=right bgcolor='#ff0000' style='color:#ffffff;cursor:pointer;'";
				}
			else{
				if ((mn==tm)&&(j==td))	s+="<td align=right bgcolor='#00bb00' style='color:#ffffff;font-weight:bold;cursor:pointer;'";
								else	s+="<td align=right";
				}
			if (cpflag)	s+=" style='background-color:#0000ff;color:#ffffff;cursor:no-drop;' onClick='DateError()'>";
			else		s+=" style='cursor:pointer;' onClick='AutoInput(\""+cld+"\")'>";
			s+=j+"</td>";
			x++;
			if (x>6)
				{
				s+="</tr>";
				x=0;
				}
			}
		if (x!=0)
			{
			s+="<td bgcolor='#cccccc' style='cursor:default;' colspan="+(7-x)+">　</td></tr>";
			}
		s+="</table></td>";
		}
	s+="</tr></table>";
	return s;
	}
function AutoInput(startday)
	{
	var s;
	var d = new Date(SplitDate(startday));
	var w = ["日","月","火","水","木","金","土"];
	Gstartday=startday;
	s=SplitDate(startday)+"("+w[d.getDay()]+")より開始します。<a href='javascript:RentIt(\""+startday+"\")'><img src='../img/buttons/rent.png'></a>";
	document.getElementById("MAIN").innerHTML=s;
	s=DrawCalender();
	document.getElementById("DRAW").innerHTML=s;
	}
function DateError()
	{
	alert("キャンペーン期間前の２週間は新規区域の貸し出しはできません。");
	}
//-------------------------------------------------------------------------
function RentIt(startday)
	{
	var get,text,ruser;
	if (preload) return;
	preload=true;
	PleaseWait();
	ruser=document.forms[0].elements[0].value;
	if (ruser=="") ruser=UserID;
	setCookie("CWPP_start",startday);
	setCookie("CWPP_mapuser",ruser);
	location.replace("rent.php");
	}
//------------------------------------------------------------------------------------
function SplitDate(dat)
	{
	var s;
	dat=dat+"";
	if (dat=="00000000") return "";
	if (dat=="") return "";
	if (dat.indexOf("/",0)!=-1) return dat;
	s=dat.substring(0,4)+"/"+dat.substring(4,6)+"/"+dat.substring(6,8);
	return s;
	}
//-------------------------------------------------------------------------
function BacktoMenu(uid)
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("newlist.php");
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
//-------------------------------------------------------------------------
function isBeforeCampeign(today)
	{
	var i,r=false,nisu;
	if (Campeigns.length<1) return false;
	for(i=0;i<Campeigns.length;i++)
		{
		if (today>=Campeigns[i].Start) continue;
		nisu=CalcDays(today,Campeigns[i].End);
		if ((nisu>0)&&(nisu<=14)) {r=true;break;}
		}
	return r;
	}
//-------------------------------------------------------------------------
function CalcDays(ymd1,ymd2)
	{
	var y1,m1,d1;
	var y2,m2,d2;
	var today=new Date();
	if (ymd1==0) return "-1";
	ymd1=ymd1+"";
	y1=parseInt(ymd1.substring(0,4),10);
	m1=parseInt(ymd1.substring(4,6),10)-1;
	d1=parseInt(ymd1.substring(6,8),10);
	if (ymd2!="")
		{
		ymd2=ymd2+"";
		y2=parseInt(ymd2.substring(0,4),10);
		m2=parseInt(ymd2.substring(4,6),10)-1;
		d2=parseInt(ymd2.substring(6,8),10);
		}
	else{
		y2=today.getFullYear();
		m2=today.getMonth();
		d2=today.getDate();
		}
	var day1=new Date(y1,m1,d1);
	var day2=new Date(y2,m2,d2);
	var days=Math.ceil((day2.getTime()-day1.getTime())/(24*60*60*1000));
	return days;
	}
//-------------------------------------------------------------------------
</script>
</body>
</html>

