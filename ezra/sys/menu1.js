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
var group=new Array(
"選択してください",
"年ごとの品目","聖書","書籍","書籍－大文字版","ブロシュアーと小冊子",
"パンフレット","オーディオ","ビデオ／ＤＶＤ","用紙類",
"索引","Watchtower Library","定期刊行物");
//------------------------------------------------------------------------------------
function StoreScreen(nextfunc)
	{
	var s=window["Stage"].innerHTML;
	var k=Keys[11];
	pushscreen.push(s);
	pushBack.push(k);
	eval(nextfunc);
	}
function RestoreScreen(num)
	{
	var b,bnum;
	var s=pushscreen.pop();
	Keys[11]=pushBack.pop();
	window["Stage"].innerHTML=s;
	if (num!="")
		{
		b=DB[num].分類;
		bnum=BunruiToNum(b);
		document.forms[0].elements[2].selectedIndex=bnum;
		s=ItemList(bnum,num,1);
		LISTS.innerHTML=s;
		}
	}
//------------------------------------------------------------------------------------
function MENU1()
	{
	var logline=new Array();
	var today=new Date();
	var i,o,alter,s;
	nowmode="MENU1()";
	Help=11;
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞品目リスト＞");
	s=CreateDBList(Menu1_Year);
	WriteLayer("Stage",s);
	WriteLayer("Stage","</span><br><hr align=left width=80%>");
	AddKey("Stage",1,"新しい品目の追加","MENU1A(1)");
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
	Keys[11]="MainMenu()";
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

		s+="<td class=size2 style='cursor:hand' title='品目情報を訂正します' onClick='MENU1B(\""+i+"\")'>"+DB[i].分類+"</td>";
		s+="<td class=size2 style='cursor:hand' title='品目情報を訂正します' onClick='MENU1B(\""+i+"\")'>"+i+"</td>";
		s+="<td class=size2 style='cursor:hand' title='品目情報を訂正します' onClick='MENU1B(\""+i+"\")'>"+DB[i].品目名+"</td>";
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
		s+="<td class=size2 align=center style='cursor:hand' title='"+alter+"' onClick='MENU1B(\""+i+"\")'>"+vs+"</td>";
		s+="</tr>";
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,MENU1Top);
	}
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
 
// ---------------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------------
//	区域の追加
//------------------------------------------------------------------------------------
function Field(size,imemode,intval)
	{
	var s;
	s="<input type=text size="+size+" style='ime-mode:";
	if (imemode) s+="active;'";else s+="disabled;'";
	if (intval!="") s+="value='"+intval+"'";
	s+=">";
	return s;
	}
function MENU1A(backto)
	{
	var s,ymd,i,alter;
	Help=12;
	if (backto==1) MENU1Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	s="<div class=size5>新しい品目の追加</div><hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='MENU1A_Exec("+backto+");return false;'><table border=1 cellspacing=0 cellpadding=4>";
	s+="<tr><td>品目番号：</td><td>"+Field(8,false,'')+"</td></tr>";
	s+="<tr><td>品目名：</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>分類：</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option";
		if (i==0)
			{
			s+=" selected>分類を選択してください</option>";
			}
		else{
			s+=">"+group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	s+="<tr><td>集計先：</td><td><div id='LISTS'>分類を選択してください</div></td></tr>";

	s+="<tr><td>品目番号タイプ：</td><td><input type='radio' name='codetype' value='normal' checked>通常（正式な品目番号）<br>";
	s+="<input type='radio' name='codetype' value='old'>旧品目（正式な品目番号が分からない、過去の品目）<br>";
	s+="<input type='radio' name='codetype' value='new'>新品目（正式な品目番号が分からない、新しい品目）<br>";
	s+="</td></tr>";
	s+="<tr><td>集計先タイプ：</td><td><input type='radio' name='sumtype' value='normal' checked>通常の品目<br>";
	s+="<input type='radio' name='sumtype' value='sum' onclick='MENU1A_SumSelect()'>その他の品目（集計先としてのみ使われる品目）<br>";
	s+="</td></tr>";

	s+="</table><br>";
	s+="<input type=button value='登録' onClick='MENU1A_Exec("+backto+")'>";
	switch(backto)
		{
		case 1:		s+="<input type=button value='戻る' onClick='MENU1()'></form>";
					Keys[11]="MENU1()";
					break;
		default:	s+="<input type=button value='戻る' onClick='RestoreScreen(\"\")'></form>";
					Keys[11]="RestoreScreen(\"\")";
					break;
		}
	WriteLayer("Stage",s);
	setTimeout("Focus(0)",20);
	}

function MENU1A_SumSelect()
	{
	var s,i;
	i=document.forms[0].elements[2].selectedIndex;
	if (i==0)
		{
		LISTS.innerHTML="分類を選択してください";
		return;
		}
	s=ItemList(i,"same",0);
	LISTS.innerHTML=s;
	}

function MENU1A_Exec(backto)
	{
	var s,num,name,kubun,alter,f;
	var codetype,sumtype;
	num=document.forms[0].elements[0].value+"";
	num=num.trim();
	if (num=="")
		{
		alert("品目番号を入力してください。");
		return;
		}
	if (num in DB)
		{
		alert("その品目番号はすでに存在します。追加できません。");
		return;
		}

	name=document.forms[0].elements[1].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("品目名が入力されていません。");
		return;
		}

	kubun=document.forms[0].elements[2].selectedIndex;
	if (kubun==0)
		{
		alert("分類を選択してください。");
		return;
		}
	kubun=group[kubun];

	alter=document.forms[0].elements[3].selectedIndex;
	if (alter<0)
		{
		alert("集計先を選択してください。");
		return;
		}
	alter=document.forms[0].elements[3].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	for(i=4;i<=6;i++)
		{
		if (document.forms[0].elements[i].checked) codetype=document.forms[0].elements[i].value;
		}
	for(i=7;i<=8;i++)
		{
		if (document.forms[0].elements[i].checked) sumtype=document.forms[0].elements[i].value;
		}
	DB[num]=new Object();
	DB[num].品目名=name;
	DB[num].分類=kubun;
	DB[num].集計先=alter;
	DB[num].コード種別=codetype;
	DB[num].集計種別=sumtype;
	UpdateDB();
	if (backto==1) MENU1();
	else RestoreScreen(num);
	}

//------------------------------------------------------------------------------------
//	品目の修正
//------------------------------------------------------------------------------------
function MENU1B(num)
	{
	var s,ymd,i,j,k,sel,alter,neighbor;
	Help=12;
	MENU1Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU1()";
	s="<div class=size5>品目番号"+num+"の訂正：</div><hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='MENU1B_Exec(\""+num+"\");return false;'><table border=1 cellspacing=0 cellpadding=4>";
	s+="<tr><td size=100>品目番号：</td><td size=400>"+Field(8,false,'')+"</td></tr>";
	s+="<tr><td>品目名：</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>分類：</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option";
		if (group[i]==DB[num].分類)
			{
			sel=i;
			s+=" selected>";
			}
		else{
			s+=">";
			}
		if (i==0)
			{
			s+="分類を選択してください</option>";
			}
		else{
			s+=group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	alter=DB[num].集計先;
	if (alter==num) alter="same";
	if (alter=="DUMMY") alter="none";
	s+="<tr><td>集計先：</td><td><div id='LISTS'>"+ItemList(sel,alter,0)+"</div></td></tr>";

	var codetype=new Array("","","");
	switch(DB[num].コード種別)
		{
		case "old":
					codetype[1]=" checked";
					break;
		case "new":
					codetype[2]=" checked";
					break;
		default:	
					codetype[0]=" checked";
					break;
		}
	s+="<tr><td>品目番号タイプ：</td><td><input type='radio' name='codetype' value='normal'"+codetype[0]+">通常（正式な品目番号）<br>";
	s+="<input type='radio' name='codetype' value='old'"+codetype[1]+">旧品目（正式な品目番号が分からない、過去の品目）<br>";
	s+="<input type='radio' name='codetype' value='new'"+codetype[2]+">新品目（正式な品目番号が分からない、新しい品目）<br>";
	s+="</td></tr>";

	var sumtype=new Array("","");
	switch(DB[num].集計種別)
		{
		case "sum":
					sumtype[1]=" checked";
					break;
		default:	
					sumtype[0]=" checked";
					break;
		}
	s+="<tr><td>集計先タイプ：</td><td><input type='radio' name='sumtype' value='normal'"+sumtype[0]+">通常の品目<br>";
	s+="<input type='radio' name='sumtype' value='sum'"+sumtype[1]+">その他の品目（集計先としてのみ使われる品目）<br>";
	s+="</td></tr>";

	neighbor="";
	for(i in DB)
		{
		if (i==num) continue;
		if (DB[i].集計先==num)
			{
			if (neighbor!="") neighbor+="/";
			neighbor+="<a style='cursor:hand;' onClick='MENU1B("+i+")' title='品目番号："+i+"'>"+DB[i].品目名+"</a>";
			}
		}
	if (neighbor!="")
		{
		s+="<tr><td>所属する他品目：</td><td width=400>"+neighbor;
		s+="</td></tr>";
		}
	s+="</table><br>";
	s+="<input type=button value='更新' onClick='MENU1B_Exec(\""+num+"\")'>";
	s+="<input type=button value='削除' onClick='MENU1B_Delete(\""+num+"\")'>";
	s+="<input type=button value='戻る' onClick='MENU1()'></form>";
	WriteLayer("Stage",s);
	document.forms[0].elements[0].value=num;
	document.forms[0].elements[1].value=DB[num].品目名;
	}

function ChangeItemListA(num)
	{
	var s,l;
	if (num==0)
		{
		LISTS.innerHTML="分類を選択してください";
		return;
		}
	s=ItemList(num,"",0);
	LISTS.innerHTML=s;
	}

function MENU1B_Exec(num)
	{
	var a,s,name,kubun,alter,f,i,j,k,cmpa,cmpb;
	var code,codetype,sumtype,numx;
	var montbl=new Array(9,10,11,12,101,102,103,104,105,106,107,108);
	numx=num+"";
	name=document.forms[0].elements[1].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("品目名が入力されていません。");
		return;
		}
	kubun=document.forms[0].elements[2].selectedIndex;
	kubun=group[kubun];

	alter=document.forms[0].elements[3].selectedIndex;
	if (alter<0)
		{
		alert("集計先を選択してください。");
		return;
		}
	alter=document.forms[0].elements[3].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	for(i=4;i<=6;i++)
		{
		if (document.forms[0].elements[i].checked) codetype=document.forms[0].elements[i].value;
		}
	for(i=7;i<=8;i++)
		{
		if (document.forms[0].elements[i].checked) sumtype=document.forms[0].elements[i].value;
		}
	code=document.forms[0].elements[0].value+"";
	if (code!=numx)
		{
		if (code in DB)
			{
			alert("品目番号"+code+"はすでに存在します。\n品目番号の変更はできません。");
			document.forms[0].elements[0].value=numx;
			return;
			}
		a=confirm("品目番号を"+numx+"→"+code+"\nに変更します。よろしいですか？");
		if (!a) return;
		GetArrival(Menu1_Year);
		for(i in Arrival)
			{
			if (Arrival[i].品目==numx) Arrival[i].品目=code;
			}
		SetArrival(Menu1_Year);
		for(i=0;i<=11;i++)
			{
			j=Menu1_Year*100+montbl[i];
			GetRack(j);
			for(k in Rack)
				{
				if (Rack[k].品目==numx) Rack[k].品目=code;
				}
			SetRack(j);
			}
		if (numx==alter) alter=code;
		delete DB[num];
		num=code;
		DB[num]=new Object();
		}
	DB[num].品目名=name;
	DB[num].分類=kubun;
	DB[num].集計先=alter;
	DB[num].コード種別=codetype;
	DB[num].集計種別=sumtype;
	UpdateDB();
	MENU1();
	}

function MENU1B_Delete(num)
	{
	var a,b;
	b=document.forms[0].elements[0].value;
	b=parseInt(b,10);
	if (b!=num)
		{
		alert("品目番号を変更しているので、削除できません。");
		return;
		}
	a=confirm(num+"「"+DB[num].品目名+"」を削除してもよろしいですか？");
	if (!a) return;
	delete DB[num];
	UpdateDB();
	MENU1();
	}
