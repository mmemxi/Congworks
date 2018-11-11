<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<link rel=stylesheet href="ezra.css">
<title>Congworks for Publications-品目リスト</title>
<?php
$cwpath=dirname(__FILE__) . "\\congworks\\";
$nendo=$_GET['nendo'];
if ($nendo == "")
	{
	$year=intval(date('Y'));
	$month=intval(date('n'));
	if ($month >= 9)
		{
		$year=$year+1;
		}
	$nendo=strval($year);
	}
?>
<script type="text/javascript">
var nendo="<?= $nendo; ?>";
</script>
<script type="text/javascript" src="meditor.js"></script>
</head>

<body onload="boot()" onresize="resize()" style="overflow:hidden;">
<div id="LayerO" style="visibility:hidden;width:1px;height:1px;"><textarea id="PHP1"><?php
//	年度のリストを取得する
exec("cscript \"" . $cwpath . "menu1.wsf\" $nendo //Nologo",$out);
for($i=0;$i<count($out);$i++)
	{
	echo mb_convert_encoding($out[$i],"UTF8","SJIS-WIN") . "\n";
	}
?></textarea></div>

<div id="HEAD" style="position:absolute;top:0px;left:0px;overflow:hidden;z-index:1;">
<table border=0 cellpadding=0 cellspacing=0>
<tr><td><img src="./img/cwpublications.png"></td>
<td valign=middle><img src="../img/buttons/文書係.png"></td></tr>
<tr><td>品目リスト（<span id="YLIST"></span>）</td>
<td align=right><a href="index.php"><img src="../img/buttons/back.png"></a></td></tr>
<tr><td colspan=2><a href="JavaScript:menu1_additem()">新しい品目の追加</a></td></tr>
</table>
<img src="../img/lines/ライン１.png">
</div>

<div id="MAIN" style="position:absolute;top:160px;left:0px;width:600px;height:400px;overflow:scroll;z-index:1;"></div>
<div id="MASK" style="position:absolute;top:0px;left:0px;overflow:none;z-index:2;filter:alpha(opacity=50);-moz-opacity: 0.5;opacity: 0.5;visibility:hidden;"><img src='./img/black.gif' id="MASK0" style="width:1px;height:1px;"></div>
<div id="DIALOG" style="position:absolute;top:0px;left:0px;overflow:none;z-index:3;visibility:hidden;"></div>
<div id="TEST" style="visibility:hidden;width:1px;height:1px;position:absolute;top:0px;left:0px;z-index:0;"></div>
<iframe name="RUNPHP" style="visibility:hidden;width:1px;height:1px;position:absolute;top:0px;left:0px;z-index:0;"></iframe>

<script type="text/javascript">
//------------------------------------------------------------------------------------
var kbn=new Array();
var kubunccount=0;
var Menu1_Filter_kubuncount=0;
var Menu1_Filter_kubun="";
var Menu1_Filter_status="";
var Menu1_Year=0;
var MENU1Top=0;
var Sortkey=new Array();
var maxsort;
var pushscreen=new Array();
var pushBack=new Array();
//------------------------------------------------------------------------------------
function boot()
	{
	OpenDB();
	MENU1();
	resize();
	}
//------------------------------------------------------------------------------------
function resize()
	{
	var x=window.innerWidth;
	var y=window.innerHeight;
	MAIN.style.width=x+"px";
	MAIN.style.height=(y-160)+"px";
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
//------------------------------------------------------------------------------------
function MENU1()
	{
	var logline=new Array();
	var i,o,alter,s;
	for(i in kbn) delete kbn[i];
	kbn["すべて"]=0;
	kubuncount=1;
	Menu1_Filter_kubuncount=0;
	
	for(i in DB)
		{
		o=DB[i];
		if (!(o.分類 in kbn))
			{
			Menu1_Filter_kubuncount++;
			kbn[o.分類]=Menu1_Filter_kubuncount;
			}
		//	フィルターによる表示制御-----------------------------------------------------------------
		DB[i].visible=true;
		if ((Menu1_Filter_kubun!="")&&(DB[i].分類!=Menu1_Filter_kubun)) 
			{
			DB[i].visible=false;
			}
		}
	//	一覧表---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=120>分類<br>";
	s+="<select size=1 onChange='MENU1_kubun_Change(this.selectedIndex)'>";
	for(i in kbn)
		{
		if (i=="すべて")
			{
			if (Menu1_Filter_kubun=="") s+="<option selected>";else s+="<option>";
			s+="すべて</option>";
			}
		else{
			if (Menu1_Filter_kubun==i) s+="<option selected>";else s+="<option>";
			s+=i+"</option>";
			}
		}
	s+="</select></td>";
	s+="<td align=center class=size2 width=50>品目番号</td>";
	s+="<td align=center class=size2 width=350>品目名<br>";
	s+="<td align=center class=size2 width=80>集計先</td>";
	s+="</tr>";
	//ソートキーの作成------------------------------------------------------------ 
	maxsort=0;
	for(i in Sortkey) delete Sortkey[i];
	for(i in DB)
		{
		if (!DB[i].visible) continue;
		Sortkey[maxsort]=new Object();
		Sortkey[maxsort].分類=DB[i].分類;
		Sortkey[maxsort].品目=i;
		maxsort++;
		}
	Sortkey.sort(cmp_sort);
	for(j=0;j<maxsort;j++)
		{
		i=Sortkey[j].品目;
		switch (DB[i].コード種別)
			{
			case "old":
						s+="<tr bgcolor='#cccccc'>";
						break;
			case "new":
						s+="<tr bgcolor='#ffff99'>";
						break;
			default:
					if (DB[i].集計種別=="sum") s+="<tr bgcolor='#ffccff'>";
					else s+="<tr>";
					break;
			}

		s+="<td class=size2 style='cursor:pointer;' title='品目情報を編集します' onClick='menu1_edit(\""+i+"\")'>"+DB[i].分類+"</td>";
		s+="<td class=size2 style='cursor:pointer;' title='品目情報を編集します' onClick='menu1_edit(\""+i+"\")'>"+i+"</td>";
		s+="<td class=size2 style='cursor:pointer;' title='品目情報を編集します' onClick='menu1_edit(\""+i+"\")'>"+DB[i].品目名+"</td>";
		vs=DB[i].集計先;
		if (vs==i) {vs="-";alter="品目番号と同じ";}
		else
			{
			if (vs=="DUMMY")
				{
				vs="(集計しない)";
				alter="集計しない";
				}
			else{
				try	{
					alter=DB[vs].品目名;
					}
				catch(e)
					{
					alert(vs+"\nの品目名が取得できません。");
					alter="";
					}
				}
			}
		s+="<td class=size2 align=center style='cursor:pointer;' title='"+alter+"' onClick='menu1_edit(\""+i+"\")'>"+vs+"</td>";
		s+="</tr>";
		}
	s+="</table>";
	MAIN.innerHTML=s;
	}
//------------------------------------------------------------------------------------
function MENU1_kubun_Change(num)
	{
	var i;
	if (num==0) Menu1_Filter_kubun="";
	else{
		for (i in kbn)
			{
			if (kbn[i]==num) break;
			}
		Menu1_Filter_kubun=i;
		}
	MENU1();
	}
function ChangeDBList(year)
	{
	if (preload) return;
	preload=true;
	location.replace("menu1.php?nendo="+year);
	}
//------------------------------------------------------------------------------------
function menu1_additem()
	{
	meditor_edititem(nendo,"","MENU1()","");
	}
//------------------------------------------------------------------------------------
function menu1_edit(num)
	{
	meditor_edititem(nendo,num,"MENU1()","");
	}
//------------------------------------------------------------------------------------
function BunruiToNum(bnr)
	{
	var r,i;
	r=99;
	for(i in group)
		{
		if (group[i]==bnr)
			{
			r=i;
			break;
			}
		}
	return r;
	}
function cmp_sort(a, b)
	{
	var aa,bb;
	aa=BunruiToNum(a.分類);
	bb=BunruiToNum(b.分類);
	if (aa!=bb) return aa-bb;
	if (a.品目>b.品目) return 1;
	if (a.品目<b.品目) return -1;
	return 0;
	}
//------------------------------------------------------------------------------------
</script>
</body>
</html>

