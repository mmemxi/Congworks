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
$pdo = new PDO('sqlite:../congworks.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
// (1)区域名の取得-------------------------------------------------
$sql = "select name,kubun from PublicList where congnum=" . $congnum . " and num=" . $num . ";";
foreach ($pdo->query($sql) as $line)
	{
	$title=$line['name'];
	$kubun=$line['kubun'];
	break;
	}
$title="No." . $num . ":" . $title . "(" . $kubun . ")";
// (2)ConfigAllの取得（キャンペーン情報）--------------------------
$sql = "select body from JSON where key1='" . $congnum . "' and key2='config' and key3='all';";
foreach ($pdo->query($sql) as $line)
	{
	$body=$line['body'];
	$js=str_replace("'","\"",$body);
	$jsobj=json_decode($js);
	break;
	}
$BlankMin=$jsobj->BlankMin;
$BlankCampeign=$jsobj->BlankCampeign;
$BlankAfterCampeign=$jsobj->BlankAfterCampeign;
$campeigns="";
for($i=0;$i<count($jsobj->Campeigns);$i++)
	{
	if ($i>0) $campeigns=$campeigns . ",";
	$campeigns=$campeigns . $jsobj->Campeigns[$i]->Start . "-" . $jsobj->Campeigns[$i]->End;
	}
// (3)ユーザー一覧の取得-------------------------------------------
$sql = "select userid from CWUsers where congnum=" . $congnum . " and authority='publicservice' order by userid;";
$userArray=array();
foreach ($pdo->query($sql) as $line)
	{
	$userArray[]=$line['userid'];
	}

// (4)区域ログの取得（前回の終了日を取得）-------------------------
$sql = "select endday from PublicLogs where congnum=" . $congnum . " and num=" . $num . ";";
foreach ($pdo->query($sql) as $line)
	{
	$lastuse=$line['endday'];
	break;
	}
//----------------------------------------------------------------
echo "<script type=\"text/javascript\">";
echo "const_LastUse=" . $lastuse . ";";
echo "const_BlankMin=" . $BlankMin . ";";
echo "const_BlankCampeign=" . $BlankCampeign . ";";
echo "const_BlankAfterCampeign=" . $BlankAfterCampeign . ";";
echo "const_campeigns=\"" . $campeigns . "\";";
$constUsers="const_users=new Array(";
for($i=0;$i<count($userArray);$i++)
	{
	if ($i>0) $constUsers=$constUsers . ",";
	$constUsers=$constUsers . "\"" . $userArray[$i] . "\"";
	}
$constUsers=$constUsers . ");";
echo $constUsers;
echo "</script>";
?></div>
<?php
print "<b>" . $title . "の貸し出し:</b><br>";
?>
<table style="width:400px;margin:20px;" border=0 cellspacing=0 cellpadding=0>
<tr><td valign=middle style="border:2px dashed red;padding:6px;height:50px;">
<div id="userform"></div>
</td></tr>
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
var startday;
function Boot()
	{
	var i,s,s0;
	var tbl,obj;
	var str;
	//	ユーザー一覧の処理
	str="<form>使用者：<select size=1>";
	str+="<option value=''>自分（今操作しているあなた）</option>";
	for(i=0;i<const_users.length;i++)
		{
		str+="<option value='"+const_users[i]+"'>"+const_users[i]+"</option>";
		}
	str+="</select></form>";
	document.getElementById("userform").innerHTML=str;

	//	キャンペーン群の処理
	s=const_campeigns;	//	キャンペーン群
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

	//	前回使用終了日(const_LastUse)から、最短可能日を割り出す

	var d0=const_LastUse;
	var nisu=0;
	while(1==1)
		{
		d0=AddDays(d0,1);
		nisu++;
		if (isBeforeCampeign(d0)) continue;
		if (isCampeign(d0))
			{
			if (nisu>=const_BlankCampeign) break;
			continue;
			}
		if (isAfterCampeign(d0))
			{
			if (nisu>=const_BlankAfterCampeign) break;
			continue;
			}
		if (nisu>=const_BlankMin) break;
		}
	startday=d0;

	s=DrawCalender();
	document.getElementById("DRAW").innerHTML=s;
	Gnum=num;
	Gstartday="";
	}
//--------------------------------------------------------------------
//   カレンダー表示
//--------------------------------------------------------------------
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

			s+="<td align=right style='";

			//	セルの色＆文字の色
			if ((mn==tm)&&(j==td))	s+="color:#ffffff;font-weight:bold;background-color:#009900;";
			else{
				if (isCampeign(cld))
					{
					s+="background-color:#00ffff;color:";
					if (cld<startday)	s+="#77aaaa";else s+="#000000";
					}
				else if (cpflag)
					{
					s+="background-color:#ff0000;color:";
					if (cld<startday)	s+="#aa0000";else s+="#ffffff";
					}
				else{
					s+="background-color:#ffffff;color:";
					if (cld<startday)	s+="#777777";else s+="#000000";
					}
				s+=";"
				}

			//	カーソル＆クリック反応
			if (cld<startday)	s+="cursor:no-drop;'";
			else{
				if (cpflag)	s+="cursor:no-drop;'";
					else	s+="cursor:pointer;' onClick='AutoInput(\""+cld+"\")'";
				}

			s+=">"+j+"</td>";
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
//------------------------------------------------------------------------------------
//	キャンペーン期間中かどうかの判定
//------------------------------------------------------------------------------------
function isCampeign(day)
	{
	var i,r=false;
	if (Campeigns.length<1) return false;
	for(i=0;i<Campeigns.length;i++)
		{
		if ((Campeigns[i].Start<=day)&&(Campeigns[i].End>=day)){r=true;break;}
		}
	return r;
	}
//------------------------------------------------------------------------------------
//	キャンペーン２週間前かどうかの判定
//------------------------------------------------------------------------------------
function isBeforeCampeign(day)
	{
	var i,r=false,nisu;
	if (Campeigns.length<1) return false;
	for(i=0;i<Campeigns.length;i++)
		{
		if (day>=Campeigns[i].Start) continue;
		nisu=CalcDays(day,Campeigns[i].Start);
		if ((nisu>0)&&(nisu<=14)) {r=true;break;}
		}
	return r;
	}
//------------------------------------------------------------------------------------
//	キャンペーン後30日かどうかの判定
//------------------------------------------------------------------------------------
function isAfterCampeign(day)
	{
	var i,r=false,nisu;
	if (Campeigns.length<1) return false;
	for(i=0;i<Campeigns.length;i++)
		{
		if (day<=Campeigns[i].End) continue;
		nisu=CalcDays(Campeigns[i].End,day);
		if ((nisu>0)&&(nisu<=30)) {r=true;break;}
		}
	return r;
	}
//------------------------------------------------------------------------------------
//	日数を加算
//------------------------------------------------------------------------------------
function AddDays(ymd,adds)
	{
	var s;
	var ty,tm,td;
	var tymd=new Array();
	var ds=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	adds=parseInt(adds,10);

	s=ymd+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		}
	else{
		ty=parseInt(s.substring(0,4),10);
		tm=parseInt(s.substring(4,6),10);
		td=parseInt(s.substring(6,8),10);
		}
	td+=adds;

	if (adds>=0)
		{
		while (1==1)
			{
			if ((ty % 4)==0) ds[1]=29;else ds[1]=28;
			if (td<=ds[tm-1]) break;
			td-=ds[tm-1];
			tm++;
			if (tm>12) {ty++;tm=1;}
			}
		}
	else{
		if (td<1)
			{
			while(1==1)
				{
				tm--;
				if (tm==0) {tm=12;ty--;}
				if ((ty % 4)==0) ds[1]=29;else ds[1]=28;
				td+=ds[tm-1];
				if (td>0) break;
				}
			}
		}

	if (s.indexOf("/",0)!=-1)
		{
		s=ty+"/"+tm+"/"+td;
		}
	else{
		s=ty*10000+tm*100+td;
		}
	s+="";
	return s;
	}

</script>
</body>
</html>

