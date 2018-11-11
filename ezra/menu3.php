<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<link rel=stylesheet href="ezra.css">
<title>Congworks for Publications-在庫調査用紙</title>
<?php
$cwpath=dirname(__FILE__) . "\\congworks\\";
$nenget=$_GET['nenget'];
if ($nenget == "")
	{
	$year=date('Y');
	$month=date('n');
	$day=date('j');
	if ($day <= 15) {$month--;if ($month==0){$year--;$month=12;}}
	if ($month>=10) {$nenget=$year . $month;}
			else	{$nenget=$year . "0" . $month;}
	}
$year9=intval(substr($nenget,0,4));
$month9=intval(substr($nenget,4,2));
if ($month9 >= 9)
	{
	$year9=$year9+1;
	}
$nendo=$year9;
?>
<script type="text/javascript">
var nenget="<?= $nenget; ?>";
var nendo="<?= $nendo; ?>";
</script>
<script tyle="text/javascript" src="meditor.js"></script>
</head>

<body onload="boot()" onresize="resize()" style="overflow:hidden;">
<div id="LayerO" style="position:absolute;visibility:hidden;width:1px;height:1px;z-index:0;"><?php
// 品目ＤＢの読込
echo "<textarea id=PHP1>";
exec("cscript \"" . $cwpath . "menu1.wsf\" $nendo //Nologo",$out);
for($i=0;$i<count($out);$i++)
	{
	echo mb_convert_encoding($out[$i],"UTF8","SJIS-WIN") . "\n";
	}
echo "</textarea>";

// ラックＤＢの読込
echo "<textarea id=PHP2>";
exec("cscript \"" . $cwpath . "menu3.wsf\" $nenget //Nologo",$out2);
for($i=0;$i<count($out2);$i++)
	{
	echo mb_convert_encoding($out2[$i],"UTF8","SJIS-WIN") . "\n";
	}
echo "</textarea>";
?></div>

<div id="HEAD" style="position:absolute;top:0px;left:0px;z-index:2;">
<table border=0 cellpadding=0 cellspacing=0>
<tr><td><img src="./img/cwpublications.png"></td>
<td valign=middle><img src="../img/buttons/文書係.png"></td></tr>
<tr><td>在庫調査用紙（対象年月＝<span id="YLIST"></span>）</td>
<td align=right><a href="index.php"><img src="../img/buttons/back.png"></a></td></tr>
</table>
<img src="../img/lines/ライン１.png">
</div>

<div id="DEBUG" style="position:absolute;top:0px;left:0px;z-index:5;"></div>

<div id="THEAD1" style="position:absolute;top:164px;left:0px;width:2400px;height:30px;overflow:hidden;z-index:1;">
<div id="THEAD1Body" style="position:absolute;top:0px;left:0px;"></div>
</div>

<div id="THEAD2" style="position:absolute;top:184px;left:0px;width:50px;height:1200px;overflow:hidden;z-index:1;">
<div id="THEAD2Body" style="position:absolute;top:0px;left:0px;"></div>
</div>

<div id="MAIN" style="position:absolute;top:184px;left:50px;width:2400px;height:1200px;overflow:scroll;z-index:1;" onscroll="ScrollMAIN()"></div>
<div id="MASK" style="position:absolute;top:0px;left:0px;overflow:none;z-index:2;filter:alpha(opacity=50);-moz-opacity: 0.5;opacity: 0.5;visibility:hidden;"><img src='./img/black.gif' id="MASK0" style="width:1px;height:1px;"></div>
<div id="DIALOG" style="position:absolute;top:0px;left:0px;overflow:none;z-index:3;visibility:hidden;"></div>
<div id="TEST" style="visibility:hidden;width:1px;height:1px;position:absolute;top:0px;left:0px;z-index:0;"></div>
<iframe name="RUNPHP" style="visibility:hidden;width:1px;height:1px;position:absolute;top:0px;left:0px;z-index:0;"></iframe>

<script type="text/javascript">
//------------------------------------------------------------------------------------
var Rack=new Array();
var NowPos=0;
var NowCode="";
var NowKubun="";
var NowSuryo=0;
var OldCode="";
var MouseDownPos=0;
var MouseUpPos=0;
var AddNewMonth=false;
//------------------------------------------------------------------------------------
function boot()
	{
	OpenDB();
	GetRack();
	MENU3();
	resize();
	if (AddNewMonth)
		{
		setTimeout("boot_alert()",10);
		}
	}

function boot_alert()
	{
	alert("今月分の在庫調査用紙はまだ作成されていません。\nこのまま作業すると、前月の在庫調査用紙が消えてしまいます。\n今月分の在庫調査用紙を作るには、「最新月の表を作成する」を実行してください。");
	}
//------------------------------------------------------------------------------------
function GetRack()
	{
	var spr,i,j,dtl;
	var pos,code,name,get;
	var ylists="";
	var today,today_year,today_month,today_date,latest;
	today=new Date();
	today_date=today.getDate();
	if (today_date<=15)
		{
		today_month=today.getMonth();
		if (today_month==0)	{today_year=today.getFullYear()-1;today_month=12;}
					else	{today_year=today.getFullYear();}
		}
	else{
		today_year=today.getFullYear();
		today_month=today.getMonth()+1;
		}
	var latest=today_year*100+today_month;

	//	ラック内容の取得
	Rack=new Array();
	get=document.getElementById("PHP2");
	if (!get)	text="";
		else	text=get.value;

	if (text!="")
		{
		spr=text.split("\n");
		for(i=1;i<spr.length;i++)
			{
			spr[i]+=",end,end,end";
			dtl=spr[i].split(",");
			if (dtl[0]=="end") break;
			if (dtl[1]=="end") break;
			if (dtl[2]=="end") break;
			pos=parseInt(dtl[0],10);		//	位置
			Rack[pos]=new Object();
			Rack[pos].品目=dtl[1];			//	品目ＣＤ
			code=dtl[1];
			if (code in DB) name=DB[code].品目名;else name="???";
			Rack[pos].品目名=name;
			Rack[pos].数量=parseInt(dtl[2],10);
			}
		ylists=spr[0];
		if (spr[0].indexOf("<option value="+latest,0)==-1)
			{
			AddNewMonth=true;
			ylists+="<input type=button value='最新月の表を作成する' onclick='MENU3New()'>";
			}
		YLIST.innerHTML=ylists;
		}
	}
//------------------------------------------------------------------------------------
function MENU3()
	{
	var i,s,y,x,pos;
	//	横見出しの描画
	s="<table border=0 cellpadding=0 cellspacing=0 style='table-layout:fixed;width:2600px;border:0px;padding:0px;margin:0px;'>";
	s+="<tr><td class=HEAD style='width:48px;'>　</td>";
	for(i=0;i<=24;i++)
		{
		s+="<td class=HEAD style='width:102px;'>"+(i+1)+"</td>";
		}
	s+="</tr></table>";
	WriteLayer("THEAD1Body",s);

	//	縦見出しの描画
	s="<table border=0 cellpadding=0 cellspacing=0 style='table-layout:fixed;width:50px;height:1200px;border:0px;padding:0px;margin:0px;'>";
	for(y=0;y<=11;y++)
		{
		s+="<tr style='height:80px;'>";
		s+="<td class=HEAD1 style='width:50px;'>";
		if (y<=7)
			{
			s+=(y+1)+"段目";
			}
		if (y==8) s+="箱下段";
		if (y==9) s+="箱上段";
		if (y==10) s+="その他";
		if (y==11) s+="外国語";
		s+="</td></tr>";
		s+="<tr style='height:30px;'><td class=HEAD2 style='width:50px;'>　</td></tr>";
		}
	s+="</table>";
	WriteLayer("THEAD2Body",s);

	//	表本体の描画
	s="<div id='TABLE' onselectstart='return false;'>";
	s+="<table border=0 cellpadding=0 cellspacing=0 style='table-layout:fixed;width:2600px;border:0px;padding:0px;margin:0px;'>";
	for(y=0;y<=11;y++)
		{
		s+="<tr style='height:80px;'>";
		for(x=0;x<=24;x++)
			{
			pos=y*25+x;
			s+="<td class=rackTop onClick='EditRack("+pos+")'>";
			if ((pos in Rack)&&(Rack[pos]!=""))
				{
				s+=Rack[pos].品目名;
				}
			else s+="　";
			s+="</td>";
			}
		s+="</tr><tr style='height:30px;'>";
		for(x=0;x<=24;x++)
			{
			pos=y*25+x;
			s+="<td class=rackBottom onClick='EditSuryo("+pos+")'>";
			if ((pos in Rack)&&(Rack[pos]!=""))
				{
				s+=Rack[pos].数量;
				}
			else s+="　";
			s+="</td>";
			}
		s+="</tr>";
		}
	s+="</table>";
	WriteLayer("MAIN",s)
	}
//------------------------------------------------------------------------------------
function ScrollMAIN()
	{
	var y = document.getElementById("MAIN").scrollTop;
	var x = document.getElementById("MAIN").scrollLeft;
	document.getElementById("THEAD1Body").style.left=(-1*x)+"px";
	document.getElementById("THEAD2Body").style.top=(-1*y)+"px";
	}

function posdown(pos)
	{
	MouseDownPos=pos;
	}

function EditSuryo(pos)
	{
	var name,suryo;
	suryo=Rack[pos].数量;
	name=Rack[pos].品目名;
	NowPos=pos;
	NowCode=Rack[pos].品目;
	NowSuryo=Rack[pos].数量;
	NowKubun=DB[NowCode].分類;
	OldCode=NowCode;
	my_prompt("「"+name+"」<br>の在庫数を入力してください。",suryo,"EditSuryo_Exec");
	}

function EditSuryo_Exec(suryo)
	{
	var pos=NowPos;
	var code=NowCode;
	if (suryo==null) return;
	suryo=suryo.trim();
	if (suryo=="")
		{
		delete Rack[pos];
		RUNPHP.location.replace("menu3set.php?nenget="+nenget+"&pos="+pos+"&code="+code+"&suryo=none");
		MENU3();
		return;
		}
	if (isNaN(suryo))
		{
		alert("数量は半角数字で入力してください。");
		return;
		}
	suryo=parseInt(suryo,10);
	if (suryo<=0)
		{
		alert("入力された数量が正しくありません。");
		return;
		}
	Rack[pos].数量=parseInt(suryo,10);

	//	数量の書き換え
	if (Rack[pos].数量!=NowSuryo)
		{
		RUNPHP.location.replace("menu3set.php?nenget="+nenget+"&pos="+pos+"&code="+code+"&suryo="+suryo);
		}
	MENU3();
	}

function EditRack(pos)
	{
	NowPos=pos;
	if (pos in Rack)
		{
		NowCode=Rack[pos].品目;
		NowKubun=DB[NowCode].分類;
		NowSuryo=Rack[pos].数量;
		OldCode=NowCode;
		}
	else{
		NowCode="";
		NowKubun="";
		NowSuryo=0;
		OldCode="";
		}
	menu3_prompt();
	}
//------------------------------------------------------------------------------------
function ChangeRackList(nenget)
	{
	if (preload) return;
	preload=true;
	location.replace("menu3.php?nenget="+nenget);
	}
//------------------------------------------------------------------------------------
function menu3_prompt()
	{
	var i,s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	var okfunc,ngfunc;
	ShowLayer("MASK");
	okfunc="menu3_prompt_exec()";
	ngfunc="menu3_prompt_cancel()";
	s="<div class=dialog><br>";
	s+="<div align=left>在庫情報を入力してください<br><br>";
	s+="<form onsubmit='return false'>";
	s+="<table border=0 cellspacing=2 cellpadding=0>";
	s+="<tr><td>分類</td><td><select size=1 onchange='menu3_prompt_change(this.value)' class=tpulldown>";
	for(i=0;i<group.length;i++)
		{
		s+="<option value='"+group[i]+"'";
		if (group[i]==NowKubun) s+=" selected";
		s+=">";
		s+=group[i]+"</option>";
		}
	s+="</select></td></tr>";
	s+="<tr><td rowspan=2>品目名</td><td><span id='menu3code'>";
	s+=menu3_codelist();
	s+="</span></td></tr>";
	s+="<tr><td align=right><input type=button value='新しい品目の追加...' onclick='menu3_additem()'></td></tr>";
	s+="<tr><td>数量</td>";
	s+="<td><input type=number class=tbox style='width:200px;' value=\""+NowSuryo+"\" onfocus='this.select()'>";
	s+="<input type=text style='display:none;'></td></tr></table></form></div>";
	s+="<br><table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td align=right><table border=0 cellspacing=0 cellpadding=0><tr><td>"+my_button("OK",okfunc)+"</td>";
	s+="<td><img src='./img/blank.gif' width=8></td><td>"+my_button("Cancel",ngfunc)+"</td></tr></table></td>";
	s+="</table></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<500) dx=500;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	document.forms[0].elements[3].select();
	}
function menu3_codelist()
	{
	var r="<select size=1 class=tpulldown>";
	var i,j,kubun,obj,code;
	var tbl=new Array();
	kubun=NowKubun;
	for(i in DB)
		{
		if (DB[i].分類==kubun)
			{
			obj=new Object();
			obj.品目=i;
			obj.品目名=DB[i].品目名;
			tbl.push(obj);
			}
		}
	tbl.sort(menu3_sort);
	r+="<option value=''>選択してください</option>";
	for(i=0;i<tbl.length;i++)
		{
		code=tbl[i].品目;
		r+="<option value='"+code+"'";
		if (code==NowCode) r+=" selected";
		r+=">";
		r+="("+code+")"+DB[code].品目名+"</option>";
		}
	r+="</select>";
	return r;
	}

function menu3_sort(a,b)
	{
	if (a.品目<b.品目) return -1;
	if (a.品目>b.品目) return 1;
	return 0;
	}

function menu3_prompt_change(newkubun)
	{
	NowKubun=newkubun;
	menu3code.innerHTML=menu3_codelist();
	}

function menu3_prompt_exec()
	{
	var r,uri;
	var newkubun=document.forms[0].elements[0].value;
	var newcode=document.forms[0].elements[1].value;
	var newsuryo=document.forms[0].elements[3].value;
	if (newkubun=="選択してください")
		{
		alert("分類を選択してください。");
		return;
		}
	if (newcode=="選択してください")
		{
		alert("品目を選択してください。");
		return;
		}
	newsuryo=newsuryo.trim();
	if ((newsuryo!="")&&(isNaN(newsuryo)))
		{
		alert("数量は半角数字で入力してください。");
		return;
		}
	if ((newsuryo.indexOf(".",0)!=-1)||(newsuryo.indexOf("-",0)!=-1))
		{
		alert("数量は正の整数のみ入力可能です。");
		return;
		}
	my_dialog_close();
	if (newsuryo=="")
		{
		delete Rack[NowPos];
		uri="menu3set.php?nenget="+nenget+"&pos="+NowPos+"&code="+newcode+"&suryo=none";
		RUNPHP.location.replace(uri);
		MENU3();
		return;
		}
	if (!(NowPos in Rack))
		{
		Rack[NowPos]=new Object();
		}
	Rack[NowPos].品目=newcode;
	Rack[NowPos].品目名=DB[newcode].品目名;
	Rack[NowPos].数量=parseInt(newsuryo,10);
	//	品目、数量の書き換え
	uri="menu3set.php?nenget="+nenget+"&pos="+NowPos+"&code="+newcode+"&suryo="+newsuryo;
	RUNPHP.location.replace(uri);
	MENU3();
	}
function menu3_prompt_cancel()
	{
	my_dialog_close();
	if (OldCode=="")
		{
		delete Rack[NowPos];
		}
	else{
		Rack[NowPos].品目=OldCode;
		Rack[NowPos].品目名=DB[OldCode].品目名;
		}
	MENU3();
	}
//------------------------------------------------------------------------------------------
function menu3_additem()
	{
	meditor_edititem(nendo,"","menu3_additem_exec()","menu3_additem_cancel()");
	}
function menu3_additem_exec()
	{
	var code=meditor_editedItem;
	var name=DB[code].品目名;
	Rack[NowPos]=new Object();
	Rack[NowPos].品目=code;
	Rack[NowPos].品目名=name;
	Rack[NowPos].数量=0;
	NowCode=code;
	NowKubun=DB[NowCode].分類;
	NowSuryo=0;
	menu3_prompt();
	}
function menu3_additem_cancel()
	{
	EditRack(NowPos);
	}
//------------------------------------------------------------------------------------------
function resize()
	{
	var x=window.innerWidth;
	var y=window.innerHeight;
	THEAD1.style.width=x+"px";
	THEAD2.style.height=(y-180)+"px";
	MAIN.style.width=(x-50)+"px";
	MAIN.style.height=(y-180)+"px";
	MASK0.style.width=x+"px";
	MASK0.style.height=y+"px";

	if (nowmode=="dialog")
		{
		var dx=DIALOG.offsetWidth;
		var dy=DIALOG.offsetHeight;
		DIALOG.style.left=((x-dx)/2)+"px";
		DIALOG.style.top=((y-dy)/2)+"px";
		}
	}
//------------------------------------------------------------------------------------------
function MENU3New()
	{
	if (preload) return;
	var r=confirm("最新月の表を自動的に作成します。\nよろしいですか？");
	if (!r) return;
	preload=true;
	location.replace("menu3new.php?nenget="+nenget);
	}

</script>
</body>
</html>

