//------------------------------------------------------
String.prototype.trim = function()
	{
    return this.replace(/^[ ]+|[ ]+$/g, '');
	}
var d$=function(id){return document.getElementById(id)};
//------------------------------------------------------
var nowmode="";
var basepath;
var preload=false;
var meditor_okfunc,meditor_cancelfunc;
var meditor_editedItem;
//------------------------------------------------------
var group=new Array(
"選択してください",
"年ごとの品目","聖書","書籍","書籍－大文字版","ブロシュアーと小冊子",
"パンフレット","オーディオ","ビデオ／ＤＶＤ","用紙類",
"索引","Watchtower Library","定期刊行物");
//------------------------------------------------------------------------------------------
var DB=new Array();
var IME=true;
var wx,wy,ww,wh;
//------------------------------------------------------------------------------------------
function splitCml(cml)
	{
	var res, reg, mat;
	reg = /"([^"]+)"|([^ ]+)/g;
	res = [];
	while (mat = reg.exec(cml))
		res[res.length] = mat[1] || mat[2];
	return res.slice(1);
	}
//------------------------------------------------------------------------------------------
function WriteLayer(Layer,str)
	{
	var l=document.getElementById(Layer);
	l.innerHTML=str;
	}

function ClearLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.innerHTML="";
	l.style.top="0px";
	l.style.left="0px";
	}

function HideLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.style.visibility="hidden";
	}

function ShowLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.style.visibility="visible";
	}
//------------------------------------------------------------------------------------------
function my_alert(msg,nextfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	ShowLayer("MASK");
	nextfunc="my_dialog_close();"+nextfunc;
	s="<div class=dialog><br><br>";
	s+=msg+"<br><br><div width=100% align=center>";
	s+=my_button("OK",nextfunc);
	s+="</div></div><br><br>";
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
	nowmode="dialog";
	}
//------------------------------------------------------------------------------------------
function my_confirm(msg,okfunc,ngfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	var okfunc,ngfunc;
	ShowLayer("MASK");
	okfunc="my_dialog_close();"+okfunc;
	ngfunc="my_dialog_close();"+ngfunc;
	s="<div class=dialog><br><br>";
	s+=msg+"<br><br><table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td width=50% align=center>"+my_button("OK",okfunc)+"</td>";
	s+="<td width=50% align=center>"+my_button("Cancel",ngfunc)+"</td>";
	s+="</tr></table></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<300) dx=400;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	nowmode="dialog";
	}
//------------------------------------------------------------------------------------------
function my_prompt(msg,val,nextfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	var okfunc,ngfunc;
	ShowLayer("MASK");
	okfunc="my_prompt_exec(\""+nextfunc+"\")";
	ngfunc="my_dialog_close()";
	s="<div class=dialog><br>";
	s+="<div align=left>"+msg+"<br><br>";
	s+="<form onsubmit='return false'><input type=number class=tbox style='width:200px;' value=\""+val+"\" onfocus='this.select()'>";
	s+="<input type=text style='display:none;'></form></div>";
	s+="<br><table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td align=right><table border=0 cellspacing=0 cellpadding=0><tr><td>"+my_button("OK",okfunc)+"</td>";
	s+="<td><img src='./img/blank.gif' width=8></td><td>"+my_button("Cancel",ngfunc)+"</td></tr></table></td>";
	s+="</table></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<300) dx=400;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	document.forms[0].elements[0].select();
	nowmode="dialog";
	}
function my_prompt_exec(nextfunc)
	{
	var r;
	my_dialog_close();
	r=document.forms[0].elements[0].value;
	eval(nextfunc+"(\""+r+"\")");
	}
function my_button(msg,nextfunc)
	{
	var s;
	s="<div class=button>";
	s+=msg+"</div>";
	TEST.innerHTML=s;
	dx=TEST.offsetWidth;
	dy=TEST.offsetHeight;
	if (dx<80) dx=80;
	if (dy<30) dy=30;
	s="<div class=button style='width:"+dx+"px;height:"+dy+"px;' onclick='"+nextfunc+"'>";
	s+="<table border=0 cellpadding=0 cellspacing=0><tr><td width="+dx+" height="+dy+" valign=middle>"+msg+"</td></tr></table></div>";
	return s;
	}
function my_dummybutton(msg)
	{
	var s;
	s="<div class=button>";
	s+=msg+"</div>";
	TEST.innerHTML=s;
	dx=TEST.offsetWidth;
	dy=TEST.offsetHeight;
	if (dx<80) dx=80;
	if (dy<30) dy=30;
	s="<div class=buttondisabled style='width:"+dx+"px;height:"+dy+"px;'>";
	s+="<table border=0 cellpadding=0 cellspacing=0><tr><td width="+dx+" height="+dy+" valign=middle>"+msg+"</td></tr></table></div>";
	return s;
	}
function my_dialog_close()
	{
	HideLayer("MASK");
	HideLayer("DIALOG");
	nowmode="";
	}
//------------------------------------------------------------------------------------------
function OpenDB()
	{
	var lines=new Array();
	var fmt,key;
	var i,j;
	DB=new Array();

	var get=document.getElementById("PHP1");
	if (!get)	text="";
		else	text=get.value;
	if (text!="")
		{
		lines=text.split(/\n/);
		YLIST.innerHTML=lines[0];
		for(i=1;i<lines.length;i++)
			{
			if (lines[i]=="") continue;
			lines[i]+=",,,,,";
			fmt=lines[i].split(",");
			key=fmt[0];
			DB[key]=new Object();
			DB[key].品目番号=key;
			DB[key].分類=fmt[1];
			DB[key].品目名=fmt[2];
			DB[key].集計先=fmt[3];
			DB[key].コード種別=fmt[4];
			DB[key].集計種別=fmt[5];
			}
		}
	}
//------------------------------------------------------------------------------------------
function meditor_edititem_SumSelect()
	{
	var s,i;
	i=document.forms[0].MEkubun.selectedIndex;
	if (i==0)
		{
		LISTS.innerHTML="分類を選択してください";
		return;
		}
	s=ItemList(i,"same");
	LISTS.innerHTML=s;
	}
//------------------------------------------------------------------------------------------
function ItemList(num,code)
	{
	var s,cc;
	s="<select id=MEalter size=1 style='width:300px;' class=tpulldown>";
	s+="<option value='same'";
	if (code=="same") s+=" selected";
	s+=">品目番号と同じ</option>";
	s+="<option value='none'";
	if (code=="none") s+=" selected";
	s+=">集計しない</option>";
	if (num!=0)
		{
		for(i in DB)
			{
			if (DB[i].分類!=group[num]) continue;
			if (DB[i].集計種別!="sum") continue;
			s+="<option value='"+DB[i].品目番号+"'";
			if (DB[i].品目番号==code) s+=" selected";
			s+=">("+DB[i].品目番号+"):"+DB[i].品目名+"</option>";
			}
		}
	s+="</select>";
	return s;
	}
//------------------------------------------------------------------------------------------
function ChangeItemListA(num)
	{
	var s,l;
	if (num==0)
		{
		LISTS.innerHTML="分類を選択してください";
		return;
		}
	s=ItemList(num,"");
	LISTS.innerHTML=s;
	}
//------------------------------------------------------------------------------------------
function meditor_edititem(nendo,code,okfunc,cancelfunc)
	{
	var s,ymd,i,j,k,sel,alter,neighbor,codetype,sumtype;

	var wx=window.innerWidth;
	var wy=window.innerHeight;
	meditor_okfunc=okfunc;
	meditor_cancelfunc=cancelfunc;
	ShowLayer("MASK");

	s="<div class=dialog><br><div align=left>";
	if (code=="")
		{
		s+="新しい品目の追加";
		}
	else{
		s+="品目の編集";
		}
	s+="<br><br><form onsubmit='return false'>";

	s+="<table border=0 cellspacing=2 cellpadding=0>";
	s+="<tr><td>品目番号</td>";
	s+="<td><input id=MEcode type=number class=tbox style='width:200px;'"
	if (code!="") s+=" disabled value='"+code+"'";
	s+="></td></tr>";
	s+="<tr><td>品目名</td>";
	s+="<td><input id=MEname type=text class=tbox style='width:300px;'";
	if (code!="") s+="value='"+DB[code].品目名+"'";
	s+="></td></tr>";

	s+="<tr><td>分類</td><td><select id=MEkubun class=tpulldown onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option";
		if (code=="")
			{
			if (i==0){sel=i;s+=" selected";}
			}
		else{
			if (group[i]==DB[code].分類){sel=i;s+=" selected";}
			}
		s+=">"+group[i]+"</option>";
		}
	s+="</select></td></tr>";

	s+="<tr><td>集計先：</td><td><div id='LISTS'>";
	if (code!="")
		{
		alter=DB[code].集計先;
		if (alter==code) alter="same";
		if (alter=="DUMMY") alter="none";
		s+=ItemList(sel,alter);
		}
	else{
		s+="分類を選択してください";
		}
	s+="</div></td></tr>";

	s+="<tr><td>品目番号タイプ</td><td class=size2>";
	s+="<select size=1 id=MEcodetype class=tpulldown>";
	if (code!="")
		{
		codetype=DB[code].コード種別;
		}
	else codetype="normal";
	s+="<option value='normal'";
	if ((codetype!="old")||(codetype!="new")) s+=" selected";
	s+=">通常（正式な品目番号）</option>";
	s+="<option value='old'";
	if (codetype=="old") s+=" selected";
	s+=">旧品目（正式な品目番号が分からない、過去の品目）</option>";
	s+="<option value='new'";
	if (codetype=="new") s+=" selected";
	s+=">新品目（正式な品目番号が分からない、新しい品目）</option>";
	s+="</select></td></tr>";

	
	s+="<tr><td>集計先タイプ</td><td class=size2>";
	s+="<select id=MEsumtype size=1 class=tpulldown>";
	if (code!="")
		{
		sumtype=DB[code].集計種別;
		}
	else sumtype="normal";
	s+="<option value='normal'";
	if (sumtype!="sum") s+=" selected";
	s+=">通常の品目</option>";
	s+="<option value='sum' onclick='meditor_edititem_SumSelect()'";
	if (sumtype=="sum") s+=" selected";
	s+=">その他の品目（集計先としてのみ使われる品目）</option>";
	s+="</select>";

	s+="</td></tr>";
	s+="</table></form></div>";
	s+="<table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td align=right nowrap><table border=0><tr>";
	if (code=="")	s+="<td>"+my_button("追加の実行","meditor_edititem_exec(0)")+"</td>";
			else{
				s+="<td>"+my_button("編集の実行","meditor_edititem_exec(1)")+"</td>";
				s+="<td><img src='./img/blank.gif' width=8></td>";
				s+="<td>"+my_button("削除","meditor_edititem_delete("+nendo+","+code+")")+"</td>";
				}
	s+="<td><img src='./img/blank.gif' width=8></td>";
	s+="<td>"+my_button("中止","meditor_edititem_cancel()")+"</td>";
	s+="</tr></table></div><br><br>";
	WriteLayer("DIALOG",s);
	var dx=DIALOG.offsetWidth;
	var dy=DIALOG.offsetHeight;
	if (dx<500) dx=500;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	nowmode="dialog";
	}
//------------------------------------------------------------------------------------------
function meditor_edititem_cancel()
	{
	my_dialog_close();
	eval(meditor_cancelfunc);
	}
//------------------------------------------------------------------------------------------
function meditor_edititem_delete(nendo,code)
	{
	var uri;
	var r=confirm("この品目を削除してもよろしいですか？");
	if (!r) return;

	//	品目編集の実行
	uri="edititem.php?nendo="+nendo+"&code="+code+"&name=xxx";
	uri+="&kubun=delete";
	uri+="&alter=xxx";
	uri+="&codetype=xxx";
	uri+="&sumtype=xxx";
	RUNPHP.location.replace(uri);
	
	if (code in DB) delete DB[code];

	my_dialog_close();
	meditor_editedItem=code;
	eval(meditor_okfunc);
	}
//------------------------------------------------------------------------------------------
function meditor_edititem_exec(mode)
	{
	var s,code,name,kubun,alter,f;
	var codetype,sumtype,uri;

	//	品目番号
	code=document.forms[0].MEcode.value+"";
	code=code.trim();
	if (code=="")
		{
		alert("品目番号を入力してください。");
		return;
		}
	if (isNaN(code))
		{
		alert("品目番号は数字で指定してください。");
		return;
		}
	if ((code.indexOf(".",0)!=-1)||(code.indexOf("-",0)!=-1)||(code.indexOf(" ",0)!=-1))
		{
		alert("品目番号は数字で指定してください。");
		return;
		}
	if ((mode==0)&&(code in DB))	//	追加モードの場合
		{
		alert("その品目番号はすでに存在します。追加できません。");
		return;
		}

	//	品目名
	name=document.forms[0].MEname.value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("品目名が入力されていません。");
		return;
		}
	if ((name.indexOf("\"",0)!=-1)||(name.indexOf(",",0)!=-1))
		{
		alert("品目名に \" や , は使用できません。");
		return;
		}

	//	分類
	kubun=document.forms[0].MEkubun.selectedIndex;
	if (kubun==0)
		{
		alert("分類を選択してください。");
		return;
		}
	kubun=group[kubun];

	//	集計先
	alter=document.forms[0].MEalter.selectedIndex;
	if (alter<0)
		{
		alert("集計先を選択してください。");
		return;
		}
	alter=document.forms[0].MEalter.value;
	if (alter=="same") alter=code;
	if (alter=="none") alter="DUMMY";

	//	品目タイプ
	codetype=document.forms[0].MEcodetype.value;

	//	集計先タイプ
	sumtype=document.forms[0].MEsumtype.value;

	//	品目編集の実行
	uri="edititem.php?nendo="+nendo+"&code="+code+"&name="+encodeURIComponent(name);
	uri+="&kubun="+encodeURIComponent(kubun);
	uri+="&alter="+alter;
	uri+="&codetype="+codetype;
	uri+="&sumtype="+sumtype;
	RUNPHP.location.replace(uri);

	DB[code]=new Object();
	DB[code].品目番号=code;
	DB[code].分類=kubun;
	DB[code].品目名=name;
	DB[code].集計先=alter;
	DB[code].コード種別=codetype;
	DB[code].集計種別=sumtype;

	my_dialog_close();
	meditor_editedItem=code;
	eval(meditor_okfunc);
	}
