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
<body onload="CreateList()">
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
<?php
echo "<script type='text/javascript'>";
$pdo = new PDO('sqlite:../congworks.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    

$sql = "select * from JSON where key1='" . $congnum . "' and key2='config' and key3='all';";
foreach ($pdo->query($sql) as $line)
	{
	echo "var ConfigString=\"" . $line['body'] . "\";";
	break;
	}
echo "</script>";
?>
<div id="LayerO" style="visibility:hidden;width:1px;height:1px;"><?php
echo "<textarea id=\"PHP1\">";
$sql = "select num,name,kubun,inuse,userid,startday,endday,limitday from PublicList where congnum='" . $congnum . "' order by num;";
foreach ($pdo->query($sql) as $line)
	{
	for($i=0;$i<=7;$i++)
		{
		if ($i>0) echo ",";
		echo "$line[$i]";
		}
	echo "\n";
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
var PublicList=new Array();
var kubun=new Array();
var ConfigAll;
//===================================================================================
//	区域リストの作成
//===================================================================================
function CreateList()
	{
	var get,text,lines;
	var i,fmt,s;
	var card,num,nisu;
	var now=new Date();
	var today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();

	ConfigAll=ExecJsonParse(ConfigString);

	PublicList=new Array();
	kubun=new Array();
	get=document.getElementById("PHP1");
	if (!get)
		{
		DrawList();
		return;
		}
	text=get.value;
	lines=text.split(/\n/);
	for(i=0;i<lines.length;i++)
		{
		if (lines[i]=="") continue;
		lines[i]+=",,,,,,,,,";
		fmt=lines[i].split(",");
		if (fmt[0]=="") continue;
		s=fmt[2];
		if (!(s in kubun)) kubun[s]=true;	//	区分テーブルに追加
		obj=new Object();
		obj.num=parseInt(fmt[0],10);	//	区域番号
		obj.name=fmt[1];				//	区域名
		obj.kubun=fmt[2];				//	区分
		obj.inuse=fmt[3];				//	使用中
		obj.userid=fmt[4];				//	使用者名
		obj.startday=fmt[5];			//	開始日
		obj.endday=fmt[6];				//	終了日
		obj.limitday=fmt[7];			//	期限
		if ((obj.inuse=="true")&&(obj.userid!=UserID)) continue;		//	他のユーザーが使用中の区域は無視する
		if ((obj.inuse=="true")&&(obj.userid==UserID))	obj.group=2;	//	自分が使用中の区域はグループ２
												else	obj.group=1;	//	それ以外の区域はグループ１
		if (obj.group==1)	//	未使用の区域は、日数十分か確認
			{
			nisu=CalcDays(obj.endday,"");
			if (isCampeign(today))		//	キャンペーン期間中
				{
				if (nisu<ConfigAll.BlankCampeign) continue;
				}
			else{
				if (isAfterCampeign(today))		//	ｷｬﾝﾍﾟｰﾝ後30日
					{
					if (nisu<ConfigAll.BlankAfterCampeign) continue;
					}
				else{							//	通常期間
					if (nisu<ConfigAll.BlankMin) continue;
					}
				}
			obj.lastuse=nisu+"日前";
			}
		else{			//	使用中である区域
			obj.lastuse=SplitDate(obj.startday)+"～";
			
			}
		PublicList.push(obj);
		}
	DrawList();
	}
//===================================================================================
function DrawList()
	{
	var body="";
	var i,j;
	//---------------------------------------------------------------
	body="●新しい区域の貸出<br>";
	var tbl1=new Array();
	for(i=0;i<PublicList.length;i++)
		{
		if (PublicList[i].group!=1) continue;
		tbl1.push(PublicList[i]);
		}
	if (tbl1.length==0)
		{
		body+="使用できる新しい区域はありません。<br>";
		}
	else{
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
	body+="<img src=\"../img/lines/ライン１.png\"><br>";
	//---------------------------------------------------------------
	body+="●現在借りている区域<br>";
	var tbl2=new Array();
	for(i=0;i<PublicList.length;i++)
		{
		if (PublicList[i].group!=2) continue;
		tbl2.push(PublicList[i]);
		}
	if (tbl2.length==0)
		{
		body+="現在借りている区域はありません。<br>";
		}
	else{
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
			body+="<td style='white-space:nowrap;'>"+tbl2[i].kubun+"</td>";
			body+="<td align=right>"+tbl2[i].lastuse+"</td>";
			body+="<td style='cursor:pointer;' onclick='CancelIt("+tbl2[i].num+",\""+tbl2[i].name+"\")'>";
			body+="<img src=\"../img/buttons/cancel.png\"></td>";
			body+="</tr>";
			}
		body+="</table><br>";
		}
	document.getElementById("MAIN").innerHTML=body;
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
//-------------------------------------------------------------------------
function ExecJsonParse(jsonstr)
	{
	var s=jsonstr.replace(/'/g,"\"");
	return JSON.parse(s);
	}
//-------------------------------------------------------------------------
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
function isCampeign(day)
	{
	var i,r=false;
	if (!("Campeigns" in ConfigAll)) return false;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if ((ConfigAll.Campeigns[i].Start<=day)&&(ConfigAll.Campeigns[i].End>=day)){r=true;break;}
		}
	return r;
	}
//-------------------------------------------------------------------------
function isAfterCampeign(today)
	{
	var i,r=false,nisu;
	if (!("Campeigns" in ConfigAll)) return false;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (today<=ConfigAll.Campeigns[i].End) continue;
		nisu=CalcDays(ConfigAll.Campeigns[i].End,today);
		if ((nisu>0)&&(nisu<=30)) {r=true;break;}
		}
	return r;
	}

</script>
</body>
</html>

