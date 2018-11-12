//------------------------------------------------------------------------------------
var Sortkey=new Array();
var Menu1_Filter_status="";
var Menu1_Filter_kubun="";
var Menu1_Filter_kubuncount=0;
var Menu1_Sortkey="区域番号";
var FLD=new Array();
var kbn=new Array();
var sts=new Array();
var FLDFocus=0;
var FLDATTR=new Array();
var UPAD=new Array();
var UPAD2=new Array();
var MapZoom;
var MapSize;
var nums="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
var PickFrom;
var Menu1_AutoEndSpan;
var Placenum,Placeseq,Placename;
//------------------------------------------------------------------------------------
function MENU1()
	{
	SetOverflow("y");
	var s;
	var logline=new Array();
	var now=new Date();
	var today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
	var kubun;
	PickFrom="List";
	ClearKey();
	ClearLayer("Stage");
	s="<form>"+SysImage("cwministry.png")+"<br>";
	s+="<span class=size3>メインメニュー＞区域一覧</span><br>"+hr();
	WriteLayer("Stage",s);
	AddKey("Stage",1,"新しい区域の追加","MENU1A()");
	AddKey("Stage",2,"全体図の参照","All(false)");
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
	Keys[11]="MainMenu()";
	for(i in kbn) delete kbn[i];
	kbn["すべて"]=0;
	kubuncount=1;
	Menu1_Filter_kubuncount=0;
	
	//	SQliteテーブルの読込--------------------------------------------------------------
	var cwhere="congnum="+congnum;
	var corder="num";
	var clast;
	var cobj;
	var ctbl=SQ_Read("PublicList",cwhere,"");

	//	使用状況を配列オブジェクトに追加する---------------------------------------------
	for(i=0;i<ctbl.length;i++)
		{
		cobj=ctbl[i];
		num=cobj.num;
		kubun=cobj.kubun;
		if (!(kubun in kbn))
			{
			Menu1_Filter_kubuncount++;
			kbn[kubun]=Menu1_Filter_kubuncount;
			}
		if ((Menu1_Filter_kubun!="")&&(Menu1_Filter_kubun!=kubun)){ctbl.splice(i,1);i--;continue;}

		if (cobj.inuse=="true")
			{
			cobj.Lastuse=cobj.startday;
			cobj.Blank=CalcDays(cobj.startday,"");					//	使用日数
			cobj.Avail="false";										//	使用可能＝Ｎｏ
			cobj.Status="使用中("+cobj.userid+"："+cobj.startday.substring(4,6)+"/"+cobj.startday.substring(6,8)+"～）";
			}
		else{
			cobj.Lastuse=cobj.endday;
			cobj.Blank=CalcDays(cobj.endday,"");					//	使用日数
			if (isCampeign(today))			//	キャンペーン中
				{
				if (cobj.Blank<ConfigAll.BlankCampeign) cobj.Avail="disable";else cobj.Avail="true";
				}
			else{
				if (isAfterCampeign(today))	//	ｷｬﾝﾍﾟｰﾝ期間後30日
					{
					if (cobj.Blank<ConfigAll.BlankAfterCampeign) cobj.Avail="disable";else cobj.Avail="true";
					}
				else{						//	通常の期間
					if ((cobj.Blank<ConfigAll.BlankMin)&&(cobj.Blank!=-1)) cobj.Avail="disable";else cobj.Avail="true";
					}
				}
			cobj.Status="未使用("+cobj.Blank+"日前)";
			if (isBeforeCampeign(today))
				{
				cobj.Status="ｷｬﾝﾍﾟｰﾝ準備期間("+cobj.Blank+"日前)";
				cobj.Avail="false";
				}
			}

		//	フィルターによる表示制御
		if ((Menu1_Filter_status=="使用可能")&&(cobj.Avail!="true"))
			{
			ctbl.splice(i,1);i--;continue;
			}
		if ((Menu1_Filter_status=="未使用")&&(cobj.inuse=="true"))
			{
			ctbl.splice(i,1);i--;continue;
			}
		if ((Menu1_Filter_status=="使用中")&&(cobj.inuse!="true"))
			{
			ctbl.splice(i,1);i--;continue;
			}
		}
	//	ソートキー-----------------------------------------------------------------
	s="<br>並び順：<select size=1 onChange='MENU1_Sort_Change(this.selectedIndex)'>";
	if (Menu1_Sortkey=="区分順") s+="<option selected>";else s+="<option>";
	s+="区分順</option>";
	if (Menu1_Sortkey=="区域番号") s+="<option selected>";else s+="<option>";
	s+="区域番号</option>";
	if (Menu1_Sortkey=="未使用日数順") s+="<option selected>";else s+="<option>";
	s+="未使用日数順</option>";
	if (Menu1_Sortkey=="使用開始日順") s+="<option selected>";else s+="<option>";
	s+="使用開始日順</option>";
	s+="</select><br>";
	//	一覧表---------------------------------------------------------------------
	s+="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=50>区域番号</td>";
	s+="<td align=center class=size2 width=200>区域名</td>";
	s+="<td align=center class=size2 width=100>区分<br>";
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

	s+="<td align=center class=size2 width=50>分割数</td>";
	s+="<td align=center class=size2 width=50>特記件数</td>";
	s+="<td align=center class=size2 width=100>集合住宅</td>";
	s+="<td align=center class=size2 width=150>現在の状態<br>";
	s+="<select size=1 onChange='MENU1_status_Change(this.selectedIndex)'>";
	if (Menu1_Filter_status=="") s+="<option selected>";else s+="<option>";
	s+="すべて</option>";
	if (Menu1_Filter_status=="使用可能") s+="<option selected>";else s+="<option>";
	s+="使用可能のみ</option>";
	if (Menu1_Filter_status=="未使用") s+="<option selected>";else s+="<option>";
	s+="未使用のみ</option>";
	if (Menu1_Filter_status=="使用中") s+="<option selected>";else s+="<option>";
	s+="使用中のみ</oprion>";
	s+="</select></td>";
	s+="</tr>";
	//ソートキーの作成------------------------------------------------------------ 
	maxsort=0;
	SumMaps=0;SumRefuses=0;SumUsing=0;SumFree=0;SumTotal=0;SumBuildings=0;SumHouses=0;
	for(i in Sortkey) delete Sortkey[i];
	for(i in ctbl)
		{
		num=ctbl[i].num;
		if (ctbl[i].Status.indexOf("使用中",0)!=-1) SumUsing++;
		if (ctbl[i].Status.indexOf("未使用",0)==0) SumFree++;
		SumBuildings+=parseInt(ctbl[i].buildings,10);
		SumHouses+=parseInt(ctbl[i].persons,10);
		SumTotal++;
		SumMaps+=parseInt(ctbl[i].maps,10);
		SumRefuses+=parseInt(ctbl[i].refuses,10);
		Sortkey[maxsort]=new Object();
		Sortkey[maxsort].num=num;
		Sortkey[maxsort].i=i;
		Sortkey[maxsort].lastuse=ctbl[i].Lastuse;
		Sortkey[maxsort].kubun=ctbl[i].kubun;
		maxsort++;
		}
	Sortkey.sort(cmp_sort);
	s+="<tr><td colspan=3 bgcolor='#009900' style='font-size:12px;color:#ffffff;font-weight:bold;'>";
	s+="表示数("+SumTotal+")----使用中("+SumUsing+")/未使用("+SumFree+")</td>";
	s+="<td bgcolor='#009900' align=right style='font-size:12px;color:#ffffff;font-weight:bold;'>"+SumMaps+"</td>";
	s+="<td bgcolor='#009900' align=right style='font-size:12px;color:#ffffff;font-weight:bold;'>"+SumRefuses+"</td>";
	s+="<td bgcolor='#009900' nowrap align=right style='font-size:12px;color:#ffffff;font-weight:bold;'>"+SumBuildings+"軒("+SumHouses+"世帯)</td>";
	s+="<td bgcolor='#009900' align=right style='font-size:11px;color:#ffffff;font-weight:bold;'>";
	s+="　</td></tr>";
	for(j=0;j<maxsort;j++)
		{
		i=Sortkey[j].i;
		num=ctbl[i].num;
		s+="<tr>";
		s+="<td style='cursor:pointer' title='詳細情報を修正します' onClick='MENU1B("+num+")' align=right>"+num+"</td>";				//	区域番号
		s+="<td style='cursor:pointer' title='地図の一覧表示を行います' onClick='MENU1P("+num+")'>"+ctbl[i].name+"</td>";							//	区域名
		s+="<td style='cursor:pointer' title='地図の一覧表示を行います' onClick='MENU1P("+num+")'>"+ctbl[i].kubun+"</td>";						//	区分名
		s+="<td style='cursor:pointer' title='地図の一覧表示を行います' onClick='MENU1P("+num+")' align=right>"+ctbl[i].maps+"</td>";			//	分割数
		s+="<td align=right style='cursor:pointer' title='特記事項を修正します' onClick='Maint_Refuses("+num+")'>"+ctbl[i].refuses+"</td>";		//	特記件数
		s+="<td nowrap style='cursor:pointer;font-size:12px;' title='地図の一覧表示を行います' onClick='MENU1P("+num+")'";
		if (ctbl[i].buildings!=0)
			{
			s+=" align=right>";
			s+=ctbl[i].buildings+"軒("+ctbl[i].persons+"世帯)";
			}
		else s+=" align=center>-";
		s+="</td>";

		//	右端セルの表示
		if (ctbl[i].Status.indexOf("使用中",0)!=-1)
			{
			s+="<td style='cursor:pointer;white-space:nowrap;' title='使用終了情報の入力を行います' onClick='MENU1E_End("+num+")'";
			s+=" bgcolor='#ffff00'";
			}
		else{
			if (ctbl[i].Avail=="true")
				{
				s+="<td style='cursor:pointer;white-space:nowrap;' title='新規使用開始の入力を行います' onClick='MENU1E_Start("+num+")'";
				s+=" bgcolor='#aaffff'";
				}
			else{
				s+="<td style='white-space:nowrap;'";
				s+=" bgcolor='#ffaaaa'";
				}
			}
		s+=">"+ctbl[i].Status+"</td>";	//	使用状況
		s+="</tr>";
		}
	s+="</table></form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}
function cmp_sort(a, b)
	{
	if (Menu1_Sortkey=="区分順")
		{
		if (a.kubun<b.kubun) return -1;
		if (a.kubun>b.kubun) return 1;
		return a.num-b.num;
		}
	if (Menu1_Sortkey=="区域番号")		return a.num-b.num;
	if (Menu1_Sortkey=="未使用日数順")	return a.lastuse-b.lastuse;
	if (Menu1_Sortkey=="使用開始日順")	return b.lastuse-a.lastuse;
	return 0;
	}
 
// ---------------------------------------------------------------------------------------
function MENU1_Sort_Change(num)
	{
	if (num==0) Menu1_Sortkey="区分順";
	if (num==1) Menu1_Sortkey="区域番号";
	if (num==2) Menu1_Sortkey="未使用日数順";
	if (num==3) Menu1_Sortkey="使用開始日順";
	MENU1();
	}
function MENU1_status_Change(num)
	{
	if (num==0) Menu1_Filter_status="";
	if (num==1) Menu1_Filter_status="使用可能";
	if (num==2) Menu1_Filter_status="未使用";
	if (num==3) Menu1_Filter_status="使用中";
	MENU1();
	}
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
function Field(num,size,imemode,attr,id1,id2)	//	attr=0-2(0:なし 1:氏名 2:日付)
	{
	var s;
	s="<input type=text size="+size+" style='ime-mode:";
	if (imemode) s+="active;'";else s+="disabled;'";
	if (id1!=undefined) s+=" "+id1;
	if (id2!=undefined) s+=" "+id2;
	s+=" onfocus='FLDFocus="+num+"'>";
	FLDATTR[num]=attr;
	return s;
	}

function MENU1A()
	{
	var s,ymd;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU1()";
	s="<div class=size5>新しい区域の追加</div>"+hr();
	s+="<div class=size3><form onsubmit='MENU1A_Exec();return false;'>";
	s+="区域番号："+Field(0,8,false,0)+"(1～)<br>";
	s+="区域名称："+Field(1,40,true,0)+"<br>";
	s+="区域区分："+Field(2,20,true,0)+"(群れ名など)<br>";
	s+="分割数："+Field(3,8,false,0)+"(1～)<br>";
	s+="規定の終了日数："+Field(4,8,false,0)+"(省略すると全体の既定値と同じ)<br>";
	s+="区域地図の種類：<select size=1>";
	s+="<option>通常（住宅地図）</option>";
	s+="<option>広域（全体図）</option>";
	s+="</select><br>";
	s+="日付記入欄：<select size=1>";
	s+="<option>なし</option>";
	s+="<option>用途別</option>";
	s+="<option>回数別</option>";
	s+="</select><br>";
	s+=hr()+"<input type=button value='登録' onClick='MENU1A_Exec()'>";
	s+="<input type=button value='戻る' onClick='MENU1()'></form>";
	WriteLayer("Stage",s);
	Focus(0);
	window.scrollTo(0,0);
	}

function MENU1A_Exec()
	{
	var s,num,name,kubun,count,f,obj,spanDays,maptype,headertype;
	num=document.forms[0].elements[0].value;
	if ((num=="")||(isNaN(num))||(num<1))
		{
		alert("区域番号が正しくありません（１以上の数字を指定してください）");
		return;
		}
	num=parseInt(num,10);
	if (fso.FolderExists(NumFolder(num)))
		{
		alert("その区域番号はすでに存在します。追加できません。");
		return;
		}

	name=document.forms[0].elements[1].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("区域名が入力されていません。");
		return;
		}

	kubun=document.forms[0].elements[2].value;
	kubun=kubun.trim();

	count=document.forms[0].elements[3].value;
	if ((count=="")||(isNaN(count))||(count<1))
		{
		alert("分割数が正しくありません（１以上の数字を指定してください）");
		return;
		}
	spanDays=document.forms[0].elements[4].value+"";
	spanDays=spanDays.trim();
	if (spanDays!="")
		{
		if (isNaN(spanDays))
			{
			alert("規定の終了日数が正しくありません（空欄にするか、数字を指定してください）");
			return;
			}
		spanDays=parseInt(spanDays,10);
		if (spanDays<=0)
			{
			alert("規定の終了日数が正しくありません（１より小さい値にすることはできません）");
			return;
			}
		}
	else{
		spanDays=0;
		}
	maptype=document.forms[0].elements[5].selectedIndex;
	headertype=document.forms[0].elements[5].selectedIndex;

	fso.CreateFolder(NumFolder(num));
	Cards[num]=new Object();
	Cards[num].name=name;
	Cards[num].count=count;
	Cards[num].kubun=kubun;
	Cards[num].RTB=new Array();
	if (spanDays!=0)	Cards[num].spanDays=spanDays;
	Cards[num].MapType=maptype;
	Cards[num].HeaderType=headertype;
	SaveConfig(num);
	obj=LoadLog(num);
	SaveLog(obj,num);
	AllMaps=new Array();
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1();
	}
//------------------------------------------------------------------------------------
//	区域の修正
//------------------------------------------------------------------------------------
function MENU1B(num)
	{
	var s,ymd,i,sc,cm;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU1()";
	s="<div class=size5>区域№"+num+"の詳細情報：</div>"+hr();
	s+="<div class=size3><form onsubmit='MENU1B_Exec("+num+");return false;'>";
	s+="区域名称："+Field(0,40,true,0)+"<br>";
	s+="区域区分："+Field(1,20,true,0)+"(群れ名など)<br>";
	s+="分割数："+Field(2,8,false,0)+"(1～)<br>";
	s+="規定の終了日数："+Field(3,8,false,0)+"(省略すると全体の既定値と同じ)<br>";
	s+="区域地図の種類：<select size=1>";
	s+="<option>通常（住宅地図）</option>";
	s+="<option>広域（全体図）</option>";
	s+="</select><br>";
	s+="日付記入欄：<select size=1>";
	s+="<option>なし</option>";
	s+="<option>用途別</option>";
	s+="<option>回数別</option>";
	s+="</select><br>"+hr();
	if (Cards[num].Comments.length>0)
		{
		s+="<table border=1 cellpadding=0 cellspacing=0>";
		for(i=0;i<Cards[num].Comments.length;i++)
			{
			cm=Cards[num].Comments[i];
			cm.Top=parseInt(cm.Top,10);
			cm.Left=parseInt(cm.Left,10);
			cm.Size=parseInt(cm.Size,10);
			while(1==1)
				{
				if (cm.Text.indexOf("@br@",0)==-1) break;
				cm.Text=cm.Text.replace("@br@","\r\n");
				}
			s+="<tr><td><textarea name='CM"+i+"' cols=80 rows=4>"+cm.Text+"</textarea>";
			s+="</td>";
			s+="<td><input type=button style='width:120px;' value='位置指定(";
			if (cm.Top==-1) s+="未設定";else s+="設定済み";
			s+=")' onclick='PlaceComment("+num+","+i+")'><br>";
			s+="<input type=button style='width:120px;' value='コメント削除' onclick='RemoveComment("+num+","+i+")'></td>";
			s+="</tr>";
			}
		s+="</table>";
		}
	s+="<input type=button value='コメント追加' onClick='AddComment("+num+")'><br>"+hr();
	s+="<input type=button value='更新' onClick='MENU1B_Exec("+num+")'>";
	s+="<input type=button value='地図一覧へ' onClick='MENU1P("+num+")'>";
	s+="<input type=button value='この区域を削除する' onClick='MENU1Del("+num+")'><br>";
	s+="<input type=button value='戻る' onClick='LoadCard("+num+");MENU1()'></form>";
	WriteLayer("Stage",s);
	document.forms[0].elements[0].value=Cards[num].name;
	document.forms[0].elements[1].value=Cards[num].kubun;
	document.forms[0].elements[2].value=Cards[num].count;
	if ("spanDays" in Cards[num])
		{
		if (Cards[num].spanDays!=0) document.forms[0].elements[3].value=Cards[num].spanDays;
		}
	document.forms[0].elements[4].selectedIndex=Cards[num].MapType;
	document.forms[0].elements[5].selectedIndex=Cards[num].HeaderType;
	Focus(0);
	window.scrollTo(0,0);
	}

function MENU1B_Store(num)
	{
	var i,s;
	var cd=Cards[num];
	cd.name=document.forms[0].elements[0].value;
	cd.kubun=document.forms[0].elements[1].value;
	cd.count=document.forms[0].elements[2].value;
	cd.spanDays=document.forms[0].elements[3].value;
	cd.MapType=document.forms[0].elements[4].selectedIndex;
	cd.HeaderType=document.forms[0].elements[5].selectedIndex;
	for(i=0;i<Cards[num].Comments.length;i++)
		{
		s=document.forms[0].elements["CM"+i].value;
		while(1==1)
			{
			if (s.indexOf("\r\n",0)==-1) break;
			s=s.replace("\r\n","@br@");
			}
		cd.Comments[i].Text=s;
		}
	}

function MENU1B_Exec(num)
	{
	var s,name,kubun,count,f,spanDays,maptype,headertype;
	MENU1B_Store(num);
	cd=Cards[num];
	cd.name=cd.name.trim();
	if ((cd.name=="")||(cd.name==null))
		{
		alert("区域名が入力されていません。");
		return;
		}
	cd.kubun=cd.kubun.trim();
	if ((cd.count=="")||(isNaN(cd.count))||(cd.count<1))
		{
		alert("分割数が正しくありません（１以上の数字を指定してください）");
		return;
		}
	if (cd.spanDays!="")
		{
		if (isNaN(cd.spanDays))
			{
			alert("規定の終了日数が正しくありません（空欄にするか、数字を指定してください）");
			return;
			}
		cd.spanDays=parseInt(cd.spanDays,10);
		if (cd.spanDays<=0)
			{
			alert("規定の終了日数が正しくありません（１より小さい値にすることはできません）");
			return;
			}
		}
	else{
		cd.spanDays=0;
		}
	s="("+num+")"+Cards[num].name+"→"+name;
	s+="、分割数＝"+Cards[num].count+"→"+count+"、区分＝"+Cards[num].kubun+"→"+kubun;
	if (cd.spanDays==0)
		{
		delete cd.spanDays;
		}
	SaveConfig(num);
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1();
	}

function MENU1Del(num)
	{
	var s;
	var a=confirm("区域番号"+num+"を削除します。\n一度削除すると、地図データおよび使用履歴、特記事項などすべてが消えてしまいます。\n実行してよろしいですか？");
	if (!a) return;
	var fdir=NumFolderPath(num);
	fso.DeleteFolder(fdir,true);
	s="("+num+")"+Cards[num].name;
	s+="、分割数＝"+Cards[num].count+"、区分＝"+Cards[num].kubun;
	delete Cards[num];
	AllMaps=new Array();
	MENU1();
	alert("区域番号"+num+"を削除しました。");
	}
//------------------------------------------------------------------------------------
//	区域の一覧表示
//------------------------------------------------------------------------------------
function MENU1P(num)
	{
	var s,i,j,k,jc,x,found;
	var d1,d2;
	var vtb,vroom;
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	s="<form><div class=size5>№"+num+"「"+Cards[num].name+"」の地図一覧：</div>"+hr();
	WriteLayer("Stage",s);
	if (Cards[num].MapType==0)
		{
		AddKey("Stage",1,"地図メンテナンス","MoveMap("+num+")");
		AddKey("Stage",2,"地図の保存","SaveMapImages("+num+")");
		AddKey("Stage",3,"地図の復帰","RestoreMapImages("+num+")");
		AddKey("Stage",4,"区域全図に記入","ClipAllArea("+num+",0)");
		}
	AddKey("Stage",0,"区域一覧へ戻る","MENU1()");
	Keys[11]="MENU1()";
	x=0;
	ReadBuilding(num);

	s="";
	switch(Cards[num].MapType)
		{
		case 0:		//	画像地図
			s=hr()+"<table border=2 cellpadding=12 cellspacing=0>";
			for(i=1;i<=Cards[num].count;i++)
				{
				CheckImageSet(num,i);
				if (x==0) s+="<tr>";
				s+="<td class=size6>";
				found=fso.FileExists(PNGFile(num,i));
				if (found)
					{
					s+="<img src='"+ThumbFile(num,i)+NoCache()+"' width=320 height=200 style='cursor:pointer' onClick='MENU1PBig("+num+","+i+")'>";
					}
				else{
					s+="<img src='./sys/noimage.jpg' width=320 height=200 style='cursor:pointer' onClick='MENU1CreatePNG("+num+","+i+")'>";
					}
				ch=nums.charAt(i-1);
				s+="<span style='position:relative;top:-170px;left:-320px;color:#0000ff;font-weight:bold;'>"+ch+"</span></td>";
				if (x==1) s+="</tr>";
				x++;
				if (x==2) x=0;
				}
			if (x==1) s+="<td></td></tr>";
			s+="</table>";
			break;
		case 1:		//	広域地図
			s=hr()+"<table border=2 cellpadding=12 cellspacing=1>";
			for(i=1;i<=Cards[num].count;i++)
				{
				ch=nums.charAt(i-1);
				s+="<tr style='cursor:pointer;' onclick='MENU1PBig("+num+","+i+")'>";
				s+="<td valign=middle style='font-size:20px;color:#0000ff;font-weight:bold;'>"+ch+"</td>";
				s+="<td valign=middle style='font-size:12px;color:#000000;'>";
				k=0;vroom=0;
				for(j=0;j<Building.building.length;j++)
					{
					if (Building.building[j].map!=i) continue;
					k++;
					s+=Building.building[j].id;
					vtb=SearchCondominium(Building.building[j],num,i);
					if (vtb.floors.length>0) s+="("+vtb.floors.join(",")+")";
					vroom+=vtb.rooms;
					s+="<br>";
					}
				if (vroom!=0) s+="<div style='text-align:right;color:#ff0000;font-size:16px;'>計："+vroom+"世帯</div>";
				if (k==0) s+="（対象の集合住宅が登録されていません）";
				s+="</td></tr>";
				}
			s+="</table>";
			break;
			}
	s+="</form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}
function MENU1CreatePNG(num,seq)
	{
	var s="この地図の白紙データ("+seq+".png)を新規作成します。\nよろしいですか？";
	var r=confirm(s);
	if (!r) return;
	fso.CopyFile(BlankPNG(),PNGFile(num,seq),true);
	s="("+num+")"+Cards[num].name;
	s+="、地図番号＝"+seq;
	MENU1P(num);
	}
//------------------------------------------------------------------------------------
//	地図の拡大表示
//------------------------------------------------------------------------------------
function MENU1PBig(num,seq)
	{
	var s,i,j,x,found,file;
	var d1,d2,cm,cms;
	var r,rmap,Bmap="",sb,sobj;
	var scr="";
	var vml=new Poly();
	var BTB;
	var mapimage;
	var rcolor;
	vml.mapsize=1;
	SetOverflow("");
	if (Cards[num].MapType==0)
		{
		mapimage=PNGFile(num,seq);
		}
	else{
		mapimage=BlankPNG();
		}
	r=GetImageInfo(mapimage);
	ClearKey();
	ClearLayer("Stage");
	MapZoom=false;
	file=fso.FileExists(mapimage);
	s="<div style='width:"+MaxWidth+"px;text-align:center;' class=size5>№"+num+"「"+Cards[num].name+"」"+nums.charAt(seq-1)+"</div>";
	WriteLayer("Stage",s);

	s="<form>";
	if (file) s+=AddKeys(1,"印刷","CloseFloatings();PrintMap("+num+","+seq+");MENU1PBig("+num+","+seq+");");
	if (Cards[num].MapType==0) s+=AddKeys(2,"画像を取り込む","ImportImage("+num+","+seq+")");
	if ((file)&&(Cards[num].MapType==0)) s+=AddKeys(3,"ﾍﾟｲﾝﾄﾂｰﾙで開く","ExecMapEditor("+num+","+seq+")");
	s+=AddKeys(5,"裏面の表示","CloseFloatings();MENU1PRev("+num+","+seq+")");
	s+=AddKeys(6,"特記情報の追加","CloseFloatings();AddRefuses("+num+","+seq+")");
	if (Cards[num].MapType==0) s+=AddKeys(7,"アパートの追加","AddBuilding("+num+","+seq+")");
	if (Cards[num].MapType==1) s+=AddKeys(7,"集合住宅の編集","CloseFloatings();EditCondominium("+num+","+seq+")");
	s+=AddKeys(0,"戻る","CloseFloatings();MENU1P("+num+")");
	s+="</form>";
	FloatingMenu.Title="メニュー";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,250);
	Keys[11]="CloseFloatings();MENU1P("+num+")";

	s="";	//	"<div style='position:absolute;top:0px;left:0px;'>";
	if (file)
		{
		s+="<img src='"+mapimage+NoCache()+"' onload='ImageMap.Adjust()'>";
		}
	else s+="（画像データがありません）";
//	s+="</div>";
	//	マーカー情報の合成
	Markers=LoadMarker(num);
	if (seq in Markers.Map) s+=DrawMarker(Markers,seq,1,1,0);
	//	画像サイズの取得
	Imgx=r.x;
	Imgy=r.y;
	vml.width=r.x;
	vml.height=r.y;
	BTB=Cards[num].RTB;
	BTB=CheckRefusesStatus(num,seq,BTB);
	SetRefusesToBuilding(0,BTB,num,true);	//	ビル情報に特記情報を反映させる
	SetMarkersToBuilding(0,Markers,0);		//	ビル情報にマーカーを反映させる
	RefuseExit=seq;
	for(i in BTB)
		{
		if (BTB[i].Num!=seq) continue;
		//	網掛けの合成
		if (BTB[i].Position!="")
			{
			rcolor="";
			switch (BTB[i].KBN1)
				{
				case "拒否":
					rcolor="#ff0000";
					break;
				case "確認":
					rcolor="#ffff00";
					break;
				case "間隔":
					rcolor="#00ffff";
					break;
				default:
					rcolor="#88ff88";
					break;
				}
			vcmd="CloseFloatings();PreEditRefuses("+num+","+i+")";
			vtitle=BTB[i].Name+"("+BTB[i].KBN1+")";
			vml.AddObject(BTB[i].Position,vcmd,vtitle,1,1,rcolor);
			}
		if (BTB[i].Writing!="")
			{
			ss=BTB[i].Writing+",,,,";
			rx=ss.split(",");
			wstr=rx[0];
			wsize=parseInt(rx[1],10);
			x1=parseInt(rx[2],10);
			y1=parseInt(rx[3],10);
			
			s+="<div style='cursor:pointer;position:absolute;z-index:6;font-size:"+wsize+"px;white-space:nowrap;color:#0000ff;";
			s+="left:"+x1+"px;top:"+y1+"px;' ";
			s+="onClick='CloseFloatings();PreEditRefuses("+num+","+i+")' title='"+BTB[i].Name+"("+BTB[i].KBN1+")'>"+wstr+"</div>";
			if (rx[4]!="")
				{
				ss=rx[4];
				while(1==1)
					{
					if (ss.indexOf("&",0)==-1) break;
					ss=ss.replace("&",",");
					}
				vml.AddArrow(ss,1,1,false);
				}
			}
		}
	//	コメント情報の合成
	for(i=0;i<Cards[num].Comments.length;i++)
		{
		cm=Cards[num].Comments[i];
		if (cm.Top==-1) continue;
		s+="<div style='position:absolute;z-index:2;font-size:"+cm.Size+"px;color:#0000ff;";
		s+="left:"+cm.Left+"px;top:"+cm.Top+"px;'>";
		cms=cm.Text;
		while(1==1)
			{
			if (cms.indexOf("@br@",0)==-1) break;
			cms=cms.replace("@br@","<br>");
			}
		s+=cms+"</div>";
		}

	//	ビル情報を重ねる
	if (Building!="")
		{
		BuildingNum=num;
		BuildingSeq=seq;
		for(i in Building.building)
			{
			rmap=parseInt(Building.building[i].map,10);
			if (rmap!=seq) continue;
			s+=CreateBuildingImage(num,seq,0,i,"",1,1,0);
			sobj=CreateBuildingImage(num,seq,0,i,"",1,1,4);

			Bmap+="<area shape='poly' nohref onClick='CloseFloatings();";
			Bmap+="BuildingNamesChanged=new Array();EditBuilding("+i+")'";
			Bmap+=" coords='";
			Bmap+=sobj.x+","+sobj.y+","+(sobj.x+sobj.width)+","+sobj.y+",";
			Bmap+=(sobj.x+sobj.width)+","+(sobj.y+sobj.height)+",";
			Bmap+=sobj.x+","+(sobj.y+sobj.height)+","+sobj.x+","+sobj.y;
			Bmap+="' onmouseover='VMLShape_MouseOver(\"この物件を編集します\")'";
			Bmap+=" onmousemove='VMLShape_MouseOver(\"この物件を編集します\")'";
			Bmap+=" onmouseout='VMLShape_MouseOut()'";
			Bmap+="'>";
			}
		}
	ImageMap.Content=SetContent(s,vml,Imgx,Imgy,Bmap);
	ImageMap.Create("MAP",window["Stage"],MaxWidth-40,MaxHeight-50);
	window.scrollTo(0,0);
	document.body.focus();
	SetOverflow("");
	}

function PlaceCondominium(inx)
	{
	ReturntoBuildingFrom="MENU1PBig";
	PlaceBuilding(0,inx);
	}

function SetContent(s,vmlobj,width,height,buildingmap)
	{
	a=vmlobj.Draw(false,true);		//	20180320
	s+=a;
	s+="<div style='position:absolute;top:0px;left:0px;z-index:5;'>";
	s+="<img src='"+BlankGIF()+"' width="+width+" height="+height+" border=0 usemap='#IM' ";
	s+="onmousedown='mapfield_mousedown()' onmouseup='mapfield_mouseup()' onmousemove='mapfield_mousemove()'";
	s+=">";
	s+="<map name='IM'>";
	s+=vmlobj.Imap();
	s+=buildingmap;
	s+="</map></div>";
	return s;
	}

function CloseFloatings()
	{
	FloatingMenu.Close();
	ImageMap.Close();
	ClearLayer("Popup");
	}
function ExecMapEditor(num,seq)
	{
	var s,s1,s2,editorname;
	editorname=ConfigLocal.MapEditor;
	if (editorname=="") editorname=basepath+qt+"azpainter"+qt+"AzPainter2.exe";
	if (!fso.FileExists(editorname))
		{
		alert("地図編集アプリケーションの設定が正しくありません。\nメインメニュー→メンテナンス→環境設定\nから設定してください。");
		return;
		}
	s1=fso.GetParentFolderName(editorname);
	s2=fso.GetFileName(editorname);
	WshShell.CurrentDirectory=s1;
	s="\""+s2+"\" "+PNGFile(num,seq);
	WshShell.Run(s,true);
	CloseFloatings();
	alert("編集が終わったらOKをクリックしてください。\n画像をリロードします。");
	s="("+num+")"+Cards[num].name;
	s+="、地図番号＝"+seq;
	CheckImageSet(num,seq);
	MENU1PBig(num,seq)
	}
//------------------------------------------------------------------------------------
//	区域の利用状況更新
//------------------------------------------------------------------------------------
function MENU1E(num)
	{
	var s,a;
	var now=new Date();
	if (Cards[num].Available=="false")
		{
		window.scrollTo(0,0);
		MENU1E_End(num);
		}
	else{
		if (Cards[num].Available=="disable")
			{
			s="前回の終了からの最低日数を満たしていないので、使用開始できません。\n";
			s+="ロールバックしますか？";
			a=confirm(s);
			if (!a) return;
			MENU1E_Start_RollBack(num);
			return;
			}
		window.scrollTo(0,0);
		MENU1E_Start(num);
		}
	}

function MENU1E_Start(num)
	{
	window.scrollTo(0,0);
	var s,ymd;
	var today=new Date();
	if ("spanDays" in Cards[num])		//	カードごとの自動終了日数が設定されている？
		{
		Menu1_AutoEndSpan=parseInt(Cards[num].spanDays,10);
		}
	else{
		Menu1_AutoEndSpan=parseInt(ConfigAll.AutoEndDefault,10);
		}
	var LimitStartDay=GetAvailableDate(num);	//	この日以降が使用可能である日付を取得
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MENU1EExit()";
	s="<div class=size5>№"+num+"「"+Cards[num].name+"」の使用開始</div>"+hr();
	s+="<div class=size3><form onsubmit='MENU1E_Start_Exec("+num+");return false;'>";
	s+="使用者名："+Field(0,30,true,1)+"<br>";
	s+="貸出日：<input type=text size=12 style='ime-mode:disabled;' onfocus='FLDFocus=1' onChange='CalcOverDay(document.forms[0].elements[1].value,true)'><br>";
	FLDATTR[1]=3;
	s+="<div class=size2 id=OVERRAY>終了期限：-</div><br>";
	s+="<input type=button value='使用開始' onClick='MENU1E_Start_Exec("+num+")'>";
	s+="<input type=button value='ロールバック' onClick='MENU1E_Start_RollBack("+num+")'>";
	s+="<input type=button value='戻る' onClick='MENU1EExit();'></form>";
	WriteLayer("Stage",s);
	s=DrawCalender(true,LimitStartDay);
	WriteLayer("Stage",s);
	s=MakeLogs(num);
	WriteLayer("Stage",s);
	ymd=(today.getMonth()+1)+"/"+today.getDate();
	document.forms[0].elements[1].value=ymd;
	s=UserPad();
	WriteLayer("Stage",s);
	Focus(0);
	}
function CalcOverDay(date,mode)
	{
	var d,overcampeign,comment="";
	var tbl,yyyy,mm,dd;
	if (date.indexOf("/",0)!=-1)
		{
		tbl=date.split("/");
		if (tbl.length==3)
			{
			if ((!isNaN(tbl[0]))&&(!isNaN(tbl[1]))&&(!isNaN(tbl[2])))
				{
				yyyy=parseInt(tbl[0],10);
				mm=parseInt(tbl[1],10);
				dd=parseInt(tbl[2],10);
				date=(yyyy*10000+mm*100+dd)+"";
				}
			}
		}
	if ((date.length!=8)||(isNaN(date)))
		{
		OVERRAY.innerHTML="終了期限：-";
		}
	if (mode)	//	(1)会衆の区域の場合
		{
		d=AddDays(date,Menu1_AutoEndSpan);
		// 2018/1/19追加 -----------------------------------
		overcampeign=isOverCampeign(date,d);		//	終了日がキャンペーン日をまたいでいる？
		if (overcampeign ==-1)	comment="(キャンペーン前の新規開始禁止期間）";
		if (overcampeign > 0)	d=overcampeign;		//	キャンペーン前日で終了する
		// 2018/1/19追加 -----------------------------------
		// 2018/5/21追加 -----------------------------------
		if (isCampeign(date))	d=AddDays(date,ConfigAll.AutoEndCampeign);	//	ｷｬﾝﾍﾟｰﾝ期間中の自動終了日数
		// 2018/5/21追加 -----------------------------------
		}
	else{		//	(2)集中インターホンの場合
		d=AddDays(date,ConfigAll.AutoEndApart);
		}
	OVERRAY.innerHTML="終了期限："+SplitDate(d)+comment;
	}
function CheckUser(str)
	{
	str=str.trim();
	if (str=="")
		{
		alert("使用者の名前を入力してください。");
		return true;
		}
	return false;
	}
function CheckDate(label,b)
	{
	var today=new Date();
	var bcnt,bp,bp2,ymd;
	b=b+"";
	b=b.trim();
	if ((b.indexOf("/",0)==-1)&&(b.length==8))
		{
		if (b.length==8)
			{
			b=b.substring(0,4)+"/"+b.substring(4,6)+"/"+b.substring(6,8);
			}
		}
	if (b.indexOf("/",0)==-1)
		{
		alert(label+"の入力が正しくありません。\n年・月・日は「/」で区切ってください。。");
		return true;
		}
	bcnt=0;bp=0;
	while(1==1)
		{
		if (b.indexOf("/",bp)==-1) break;
		bp=b.indexOf("/",bp);
		bp++;
		bcnt++;
		}
	if (bcnt>2)
		{
		alert(label+"の入力が正しくありません。\n日付形式が正しくありません。");
		return true;
		}
	switch(bcnt)
		{
		case 1:	bp=b.indexOf("/",0);
				mm=b.substring(0,bp);
				dd=b.substring(bp+1,b.length);
				if ((isNaN(mm))||(isNaN(dd))||(mm<1)||(mm>12)||(dd<1)||(dd>31))
					{
					alert(label+"の入力が正しくありません。\n日付形式が正しくありません。");
					return true;
					}
				if ((mm<3)&&((today.getMonth()+1)>=11)) yy=today.getFullYear()+1;
				else if ((mm>=11)&&((today.getMonth()+1)<3)) yy=today.getFullYear()-1;
				else yy=today.getFullYear();
				break;
		case 2:	bp=b.indexOf("/",0);
				yy=b.substring(0,bp);
				bp2=b.indexOf("/",bp+1);
				mm=b.substring(bp+1,bp2);
				dd=b.substring(bp2+1,b.length);
				if ((isNaN(yy))||(isNaN(mm))||(isNaN(dd))||(mm<1)||(mm>12)||(dd<1)||(dd>31))
					{
					alert(label+"の入力が正しくありません。\n日付形式が正しくありません。");
					return true;
					}
				yy=parseInt(yy,10);
				if (yy<100) yy+=2000;
				if (Math.abs(today.getFullYear()-yy)>10)
					{
					alert(label+"の年が10年以上過去または未来です。");
					return true;
					}
				break;
		}
	mm=parseInt(mm,10);
	dd=parseInt(dd,10);
	ymd=yy*10000+mm*100+dd;
	return ymd;
	}

function MENU1E_Start_Exec(num)
	{
	var a,b,ymd;
	var stream,text,s;
	var overday;
	var LimitStartDay=GetAvailableDate(num);	//	この日以降が使用可能である日付を取得
	var cmd,cmf,cmp;

	a=document.forms[0].elements[0].value;	//　使用者
	b=document.forms[0].elements[1].value;	//	貸出日

	//	使用者チェック
	if (CheckUser(a)) return;

	//	貸し出し日チェック
	ymd=CheckDate("貸出日",b);
	if (ymd==true) return;
	if (ymd<LimitStartDay)
		{
		alert("この区域は"+SplitDate(LimitStartDay)+"以降使用可能です。");
		return;
		}

	//	終了日の計算
	overday=AddDays(ymd,Menu1_AutoEndSpan);
	//	2018/1/19 キャンペーンルール改修
	overcampeign=isOverCampeign(ymd,overday);		//	終了日がキャンペーン日をまたいでいる？
	if (overcampeign ==-1)
		{
		alert("キャンペーン期間の２週間前からは新規開始できません。");
		return;
		}

	//	貸し出し処理（外部プログラム）
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="rent.wsf "+congnum+" "+num+" "+ymd+" "+a+" "+cmp;
	var objResult=RunWSF(cmd);
	if (objResult!="ok")
		{
		alert("貸し出し処理中にエラーが発生し、貸出処理が失敗しました。");
		LoadCard(num);
		MENU1EExit();
		return;
		}

	//	印刷する？
	cmf=confirm("№"+num+"「"+Cards[num].name+"」の地図をすべて印刷しますか？");
	if (cmf)
		{
		cmd="printpublic.wsf "+congnum+" "+num;
		objResult=RunWSF(cmd);
		}
	LoadCard(num);
	MENU1EExit();
	}


function MENU1E_Start_RollBack(num)
	{
	var a,b,s,cnf,err;
	var i,text,maxlogs,lastdata;
	var obj,l;
	var lines=new Array();
	var logline=new Array();
	cnf=confirm("№"+num+"「"+Cards[num].name+"」の状態を、前回の使用完了直前の状態に戻します。よろしいですか？");
	if (!cnf) return;
	obj=LoadLog(num);
	l=obj.History.length;
	if (l==0)
		{
		alert("これ以上前に戻せません。");
		return;
		}
	l--;
	if (obj.History[l].Compress==1)
		{
		alert("過去の使用状況は再編成済みなので、ロールバックできません。");
		return;
		}

	RollBackLog(obj,num);
	SaveLog(obj,num);
	s="("+num+")"+Cards[num].name;
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1EExit();
	}

function MENU1E_End(num)
	{
	window.scrollTo(0,0);
	var i,j,text,maxlogs,seq,obj,l;
	var lines=new Array();
	for(i in sts) delete sts[i];
	obj=LoadLog(num);
	l=obj.History.length;
	if (l==0)
		{
		alert("ログ情報が異常です。\n処理できません。");
		return;
		}
	l--;
	for(i in obj.History[l].Map)
		{
		j=parseInt(obj.History[l].Map[i].Sequence,10);
		sts[j]=new Object();
		sts[j].user=obj.History[l].User;
		sts[j].rent=obj.History[l].Rent;
		sts[j].start=obj.History[l].Map[i].Start;
		sts[j].end=obj.History[l].Map[i].End;
		}
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MENU1EExit()";
	s="<div class=size5>№"+num+"「"+Cards[num].name+"」の使用状況</div>"+hr();
	s+="<div class=size3><form onsubmit='MENU1E_End_Exec("+num+");return false;'>";
	s+="使用者名："+Field(0,30,true,1)+"<br>";
	s+="貸出日："+Field(1,12,false,2)+"<br>";
	s+="終了期限："+Field(2,12,false,2)+"<br>";
	s+="<table border=1 cellpadding=5 cellspacing=0>";
	s+="<tr><td class=HEAD>番号</td>";
	s+="<td class=HEAD>網羅開始日</td>";
	s+="<td class=HEAD>網羅終了日</td></tr>";
	for (i in sts)
		{
		i=parseInt(i,10);
		s+="<tr><td align=right>"+i+"</td>";
		s+="<td>"+Field((3+(i-1)*2),12,false,2,"MapNo="+i,"FieldType='Start'")+"</td>";
		s+="<td>"+Field((4+(i-1)*2),12,false,2,"MapNo="+i,"FieldType='End'")+"</td>";
		}
	s+="</table>";
	s+="<input type=button value='更新' onClick='MENU1E_End_Exec("+num+")'>";
	s+="<input type=button value='完了する' onClick='MENU1E_Complete_Exec("+num+")'>";
	s+="<input type=button value='ロールバック' onClick='MENU1E_End_Cancel("+num+")'>";
	s+="<input type=button value='戻る' onClick='MENU1EExit()'></form>";
	WriteLayer("Stage",s);
	s=DrawCalender(true,obj.History[l].Rent);
	WriteLayer("Stage",s);

	s="<div style='position:absolute;top:80px;left:360px;z-index:2;'>";
	s+=MakeLogs(num)+"</div>";
	WriteLayer("Stage",s);
	
	document.forms[0].elements[0].value=obj.History[l].User;	//	使用者
	document.forms[0].elements[1].value=SplitDate(obj.History[l].Rent);	//	貸し出し日
	document.forms[0].elements[2].value=SplitDate(obj.History[l].Limit);	//	終了期限
	for(i in sts)
		{
		i=parseInt(i,10);
		j=3+(i-1)*2;
		if (sts[i].start!=0) document.forms[0].elements[j].value=SplitDate(sts[i].start);
		if (sts[i].end!=0) document.forms[0].elements[j+1].value=SplitDate(sts[i].end);
		}
	Focus(4);
	}

function MENU1E_End_Exec(num)
	{
	var a,b,c,cnf,c1,c2,d1,d2,s,ymd,cnf;
	var i,j,text,maxlogs,seq;
	var obj,l;
	var lines=new Array();
	var sts=new Array();
	var cmpday1,cmpday2;
	cmpday1=99999999;cmpday2=0;

	obj=LoadLog(num);
	l=obj.History.length;
	if (l==0)
		{
		alert("ログ情報が異常です。\n処理できません。");
		return;
		}
	l--;
	a=document.forms[0].elements[0].value;	//	使用者
	b=document.forms[0].elements[1].value;	//	貸出日
	c=document.forms[0].elements[2].value;	//	終了期限
	if (CheckUser(a)) return;
	ymd=CheckDate("貸出日",b);
	if (ymd==true) return;
	overday="";
	if (c!="")
		{
		overday=CheckDate("終了期限",c);
		if (overday==true) return;
		}
	for(i in obj.History[l].Map)
		{
		j=3+(parseInt(obj.History[l].Map[i].Sequence,10)-1)*2;
		c1=document.forms[0].elements[j].value;
		c2=document.forms[0].elements[j+1].value;
		c1=c1.trim();
		c2=c2.trim();
		if (c1=="")	d1="00000000";
			else	{
					d1=CheckDate("網羅開始日("+obj.History[l].Map[i].Sequence+")",c1);
					if (d1==true) return;
					if (d1<ymd)
						{
						alert("網羅開始日が貸し出し日より前になっています。");
						return;
						}
					}
		if (c2=="")	d2="00000000";
			else	{
					d2=CheckDate("網羅終了日("+obj.History[l].Map[i].Sequence+")",c2);
					if (d2==true) return;
					if (d2<d1)
						{
						alert("網羅終了日が網羅開始日より前になっています。");
						return;
						}
					if (d2<ymd)
						{
						alert("網羅終了日が貸し出し日より前になっています。");
						return;
						}
					}
		if (d1!="00000000")
			{
			if (d1<cmpday1) cmpday1=d1;
			}
		if (d2!="00000000")
			{
			cmp=true;
			if (d2>cmpday2) cmpday2=d2;
			}
		sts[i]=new Object();
		sts[i].day1=d1;
		sts[i].day2=d2;
		}
	for(i in sts)
		{
		obj.History[l].Map[i].Start=sts[i].day1;
		obj.History[l].Map[i].End=sts[i].day2;
		}
	obj.History[l].User=a;
	obj.History[l].Rent=ymd;
	obj.History[l].Limit=overday;
	SetLogSummary(obj);
	SaveLog(obj,num);
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1EExit();
	}

function MENU1E_Complete_Exec(num)
	{
	var i,j,a,b,ymd,cmp,cmpday1,cmpday2;
	var obj,l;
	cmp=false;
	cmpday1=99999999;cmpday2=0;
	a=document.forms[0].elements[0].value;
	b=document.forms[0].elements[1].value;
	if (CheckUser(a)) return;
	ymd=CheckDate("貸出日",b);
	if (ymd==true) return;
	for(i=1;i<=Cards[num].count;i++)
		{
		j=2+(i-1)*2+1;
		c1=document.forms[0].elements[j].value;
		c2=document.forms[0].elements[j+1].value;
		c1=c1.trim();
		c2=c2.trim();
		if (c1=="")	d1="00000000";
			else	{
					d1=CheckDate("網羅開始日("+i+")",c1);
					if (d1==true) return;
					}
		if (c2=="")	d2="00000000";
			else	{
					d2=CheckDate("網羅終了日("+i+")",c2);
					if (d2==true) return;
					}
		if (d1!="00000000")
			{
			if (d1<cmpday1) cmpday1=d1;
			}
		if (d2!="00000000")
			{
			cmp=true;
			if (d2>cmpday2) cmpday2=d2;
			}
		sts[i]=new Object();
		sts[i].day1=d1;
		sts[i].day2=d2;
		}
	if (!cmp)
		{
		alert("完了させるには、最低１箇所は網羅終了日を入力してください。");
		Focus(3);
		return;
		}
	cnf=confirm("№"+num+"「"+Cards[num].name+"」の使用をこの状態で完了します。よろしいですか？");
	if (!cnf) return;
	obj=LoadLog(num);
	l=obj.History.length;
	if (l==0)
		{
		alert("ログ情報が異常です。\n処理できません。");
		return;
		}
	l--;
	for(i in sts)
		{
		if (sts[i].day1=="00000000")
			{
			if (cmpday1!=99999999) sts[i].day1=cmpday1;
			else sts[i].day1=ymd;
			}
		if (sts[i].day2=="00000000")
			{
			sts[i].day2=cmpday2;
			}
		if (i in obj.History[l].Map)
			{
			obj.History[l].Map[i].Start=sts[i].day1;
			obj.History[l].Map[i].End=sts[i].day2;
			}
		}
	FinishLog(obj,num,true);
	SaveLog(obj,num);
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1EExit();
	}

function MENU1E_End_Cancel(num)
	{
	var a,cmd;
	a=confirm("№"+num+"「"+Cards[num].name+"」の使用中状態を取り消します。よろしいですか？");
	if (!a) return;

	//	外部プログラムとして呼び出す
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="cancelpp.wsf "+congnum+" "+num;
	var objResult=RunWSF(cmd);
	if (objResult!="ok")
		{
		alert("ロールバック処理中にエラーが発生し、ロールバック処理が失敗しました。");
		}

	LoadCard(num);
	CreateSummaryofPerson(num,true);
	MENU1EExit();
	}

function MENU1EExit()
	{
	if (PickFrom=="List") MENU1();
	else All(false);
	}
//--------------------------------------------------------------
//	サブルーチン
//--------------------------------------------------------------
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
	while (1==1)
		{
		if ((ty % 4)==0) ds[1]=29;else ds[1]=28;
		if (td<=ds[tm-1]) break;
		td-=ds[tm-1];
		tm++;
		if (tm>12) {ty++;tm=1;}
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

function SaveConfig(num)
	{
	var obj=new Object();
	var i,j;
	obj.name=Cards[num].name;
	obj.count=Cards[num].count;
	obj.kubun=Cards[num].kubun;
	if ("MapType" in Cards[num]) obj.MapType=Cards[num].MapType;
					else	obj.MapType=0;
	if ("HeaderType" in Cards[num]) obj.HeaderType=Cards[num].HeaderType;
					else	obj.HeaderType=0;
	if ("spanDays" in Cards[num]) obj.spanDays=Cards[num].spanDays;
	if ("AllMapPosition" in Cards[num])	obj.AllMapPosition=Cards[num].AllMapPosition;
	if ("AllMapTitle" in Cards[num])	obj.AllMapTitle=Cards[num].AllMapTitle;
	if ("Buildings" in Cards[num])
		{
		obj.Buildings=new Object();
		obj.Buildings.Count=Cards[num].Buildings.Count;
		obj.Buildings.House=Cards[num].Buildings.House;
		}
	if ("Clip" in Cards[num])
		{
		obj.Clip=new Array();
		j=0;
		for(i in Cards[num].Clip)
			{
			obj.Clip[j]=new Object();
			obj.Clip[j].Seq=i;
			obj.Clip[j].Area=Cards[num].Clip[i].Area;
			if ("Zoom" in Cards[num].Clip[i])
				{
				obj.Clip[j].Zoom=Cards[num].Clip[i].Zoom;
				obj.Clip[j].Top=Cards[num].Clip[i].Top;
				obj.Clip[j].Left=Cards[num].Clip[i].Left;
				}
			j++;
			}
		}
	if ("Condominium" in Cards[num])
		{
		obj.Condominium=clone(Cards[num].Condominium);
		}
	if ("Comments" in Cards[num])
		{
		obj.Comments=clone(Cards[num].Comments);
		}
	obj.RTB=clone(Cards[num].RTB);
	WriteXMLFile(obj,ConfigXML(num));
	//	SQlite処理を追加(2018/11/10)
	var sqobj=CreatePublicList_One(num);
	SQ_Replace("PublicList",sqobj);
	}

function GetUpdate(filename)
	{
	var f,s,ymd,i,mm;
	var mon=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
	var tbl=new Array(10);
	if (!fso.FileExists(filename)) return "";
	f = fso.GetFile(filename);
	s=f.DateLastModified+"";
	tbl=s.split(" ");
	ymd=tbl[5];
	for(i=0;i<=11;i++) if (tbl[1]==mon[i]) break;
	mm=i+1;
	if (mm<10) ymd+="0"+mm;else ymd+=""+mm;
	if (tbl[2].length==1) ymd+="0"+tbl[2];else ymd+=""+tbl[2];
	ymd+=tbl[3];
	return ymd;
	}

function Focus(num)
	{
	window.blur();
	setTimeout("FocusIt("+num+")",10);
	}

function FocusIt(num)
	{
	window.focus();
	document.forms[0].elements[num].select();
	}

function UserPad()
	{
	var s,i;
	var usrs=new Array();
	UPAD=new Array();
	s="<div style='position:absolute;top:60px;left:620px;z-index:2;'>";
	s+="<table border=1 cellpadding=4 cellspacing=0 bgcolor='#99ffff' width=200>";
	s+="<tr><td><font color=blue><b>使用者名履歴：</b></font><br>";
	var usrs=SQ_Read("CWUsers","congnum="+congnum+" and authority='publicservice'","userid");
	if (usrs.length>0)
		{
		s+="<form id='UP1'><select id='UPS1' size=22 style='width:200px;' onchange='i=this.selectedIndex;AutoUser(i);'>";
		for(i=0;i<usrs.length;i++)
			{
			UPAD[i]=usrs[i].userid;
			s+="<option>"+usrs[i].userid+"</option>";
			}
		s+="</select><br>";
		s+="<input type=button value='削除' onclick='DeleteUPad1()'></form>";
		}
	else{
		s+="使用者名の履歴がありません。";
		}
	s+="</td></tr></table></div>";
	return s;
	}

function UserPad2()
	{
	var s,i;
	var usrs=new Array();
	UPAD2=new Array();
	s="<div style='position:absolute;top:60px;left:620px;z-index:2;'>";
	s+="<table border=1 cellpadding=4 cellspacing=0 bgcolor='#99ffff' width=200>";
	s+="<tr><td><font color=blue><b>使用者名履歴：</b></font><br>";
	var usrs=SQ_Read("CWUsers","congnum="+congnum+" and authority='personalservice'","userid");
	if (usrs.length>0)
		{
		s+="<form id='UP2'><select id='UPS2' size=22 style='width:200px;' onchange='i=this.selectedIndex;AutoUser2(i);'>";
		for(i=0;i<usrs.length;i++)
			{
			UPAD2[i]=usrs[i].userid;
			s+="<option>"+usrs[i].userid+"</option>";
			}
		s+="</select><br>";
		s+="<input type=button value='削除' onclick='DeleteUPad2()'></form>";
		}
	else{
		s+="使用者名の履歴がありません。";
		}
	s+="</td></tr></table></div>";
	return s;
	}

function DeleteUPad1()
	{
	var select=document.forms["UP1"].UPS1;
	var i=select.selectedIndex;
	SQ_Delete("CWUsers","congnum="+congnum+" and authority='publicservice' and userid='"+UPAD[i]+"';");
	UPAD.splice(i,1);
	select.removeChild(select.options[i]);
	}

function DeleteUPad2()
	{
	var select=document.forms["UP2"].UPS2;
	var i=select.selectedIndex;
	SQ_Delete("CWUsers","congnum="+congnum+" and authority='personalservice' and userid='"+UPAD2[i]+"';");
	UPAD2.splice(i,1);
	select.removeChild(select.options[i]);
	}

function AutoUser(num)
	{
	var f,s;
	f=FLDFocus;
	if (FLDATTR[f]!=1) return;
	s=UPAD[num];
	document.forms[0].elements[f].value=s;
	document.forms[0].elements[f+1].select();
	}

function AutoUser2(num)
	{
	var f,s;
	f=FLDFocus;
	if (FLDATTR[f]!=1) return;
	s=UPAD2[num];
	document.forms[0].elements[f].value=s;
	document.forms[0].elements[f+1].select();
	}

function DrawCalender(mode,startday)
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
		s+="<tr><td bgcolor='#000000' colspan=7 align=center style='color:#ffffff;font-weight:bold'>"+yn+"年"+(mn+1)+"月</td></tr>";
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
				if (cpflag)	s+="cursor:no-drop;' onClick='DateError()'";
					else	s+="cursor:pointer;' onClick='AutoInput(\""+cld+"\","+mode+")'";
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

function AutoInput(days,mode)
	{
	var f,d,dx;
	f=FLDFocus;
	if ((FLDATTR[f]!=2)&&(FLDATTR[f]!=3)) return;
	dx=days+"";
	d=SplitDate(dx);
	document.forms[0].elements[f].value=d;
	if (FLDATTR[f]==3) CalcOverDay(days,mode);
	document.forms[0].elements[f+1].select();
	}
function DateError()
	{
	alert("キャンペーン期間前の２週間は新規区域の貸し出しはできません。");
	}

function MakeLogs(num)
	{
	var logs=new Array();
	var logcnt=0;
	var obj,l;
	var s;
	obj=LoadLog(num);
	l=obj.History.length;
	if (l>0)
		{
		for(i in obj.History)
			{
			if (obj.History[i].Status=="Using") continue;
			logcnt++;
			logs[logcnt]=new Object();
			logs[logcnt].USR=obj.History[i].User;
			logs[logcnt].STR=obj.History[i].Rent;
			logs[logcnt].END=obj.History[i].End;
			}
		}
	s="<div style='width:400px;height:120px;background-color:#ffaaff;overflow-y:scroll;border:ridge 2px black;padding:4px;'>";
	s+="<font color=blue><b>使用履歴：</b></font><br><span style='font-size:14px'>";
	for(i=logcnt;i>=1;i--)
		{
		s+=logs[i].USR+"("+SplitDate(logs[i].STR)+"～"+SplitDate(logs[i].END)+")<br>";
		}
	s+="</span></div>";
	return s;
	}

function ForceEnd()
	{
	var i,s,ss,Id,num,fld,stream,text,maxlogs;
	var obj,l;
	var lines=new Array();
	var logs=new Array();
	var today=new Date();
	var	y2=today.getFullYear();
	var	m2=today.getMonth()+1;
	var	d2=today.getDate();
	var ymd2=(y2*10000+m2*100+d2)+"";

	//	通常区域の強制終了
	var ctbl=SQ_Read("PublicList","congnum="+congnum,"num");
	for(i=0;i<ctbl.length;i++)
		{
		num=ctbl[i].num;
		if (ctbl[i].inuse=="false") continue;		//	使用中でない
		if (ymd2<ctbl[i].limitday) continue;		//	終了日が来ていない
		obj=LoadLog(num);
		FinishLog(obj,num,false);
		SaveLog(obj,num);
		}

	//	集中ｲﾝﾀｰﾎﾝの自動終了
	if (fso.FolderExists(ApartFolder()))
		{
		dir=fso.GetFolder(ApartFolder());
		files=new Enumerator(dir.Files);
		for(; !files.atEnd(); files.moveNext())
			{
			file=files.item().Name+"";
			Id=fso.GetBaseName(file);
			ss=GetApartmentStatus(Id);
			if (ss=="") continue;
			logs=ss.split(",");
			if (logs[2]!="") continue;
			if (ymd2<logs[3]) continue;
			text=ReadFile(ApartFile(Id));
			lines=text.split(/\r\n/);
			maxlogs=lines.length;
			var stream = fso.CreateTextFile(ApartFile(Id),true);
			for(i=0;i<maxlogs;i++)
				{
				if (lines[i]=="") break;
				logs=lines[i].split(",");
				if (logs[2]!="")
					{
					stream.WriteLine(lines[i]);
					continue;
					}
				s=logs[0]+","+logs[1]+","+logs[3]+","+logs[3];
				stream.WriteLine(s);
				}
			stream.close();
			}
		}
	}

var MMPnum;
var MMP;

function MoveMap(num)
	{
	if (Cards[num].NowUsing)
		{
		alert("地図のメンテナンスは、区域の利用中にはできません。\n区域の使用が終了してから使用してください。");
		return;
		}
	MMPnum=num;
	MMP=new Array();
	DrawMoveMap();
	window.scrollTo(0,0);
	}

function PushMoveMap(i)
	{
	if (MMP[i]) MMP[i]=false;
	else MMP[i]=true;
	DrawMoveMap();
	}

function DrawMoveMap()
	{
	var s,i,x,found;
	var d1,d2;
	var num=MMPnum;
	ClearKey();
	ClearLayer("Stage");
	s="<div class=size5>№"+num+"「"+Cards[num].name+"」の地図メンテナンス：</div>"+hr();
	WriteLayer("Stage",s);
	s="メンテナンスしたい地図をクリックして反転させてから、以下のいずれかのボタンをクリックしてください。<br><br>";
	WriteLayer("Stage",s);
	AddKey("Stage",1,"地図番号の入れ替え","ExecChangeMap()");
	AddKey("Stage",2,"地図を別の区域に変更","ExecMoveMap()");
	AddKey("Stage",3,"地図の削除","ExecDeleteMap()");
	AddKey("Stage",0,"キャンセル","MENU1P("+num+")");
	Keys[11]="MENU1P("+num+")";
	s=hr()+"<table border=2 cellpadding=12 cellspacing=0>";
	x=0;
	for(i=1;i<=Cards[num].count;i++)
		{
		if (!(i in MMP))
			{
			MMP[i]=false;
			}
		CheckImageSet(num,i);
		found=fso.FileExists(PNGFile(num,i));
		if (x==0) s+="<tr>";
		s+="<td class=size6>";
		
		if (found)
			{
			s+="<img src='"+ThumbFile(num,i)+"' width=320 height=200 onClick='PushMoveMap("+i+")' ";
			}
		else{
			s+="<img src='./sys/noimage.jpg' width=320 height=200 style='cursor:pointer' onClick='PushMoveMap("+i+")' ";
			}
		s+="style='cursor:pointer;";
		if (MMP[i]) s+="filter:invert();";
		s+="'>";
		ch=nums.charAt(i-1);
		s+="<span style='position:relative;top:-170px;left:-320px;color:#";
		if (MMP[i]) s+="ff0000";else s+="0000ff";
		s+=";font-weight:bold;'>"+ch+"</span></td>";
		if (x==1) s+="</tr>";
		x++;
		if (x==2) x=0;
		}
	if (x==1) s+="<td></td></tr>";
	s+="</table>";
	WriteLayer("Stage",s);
	}
//-------------地図を別の区域に変更--------------------------------------------
function ExecMoveMap()
	{
	var a,b,bc,copy1,copy2,c1,c2;
	var en=0,enc=0;
	var src,dst,BTB;
	var i,j,j1,j2,num,num2;
	var obj,l;
	var newmap=new Array();
	var renames=new Array();

	var p1,p2,p3,a1,a2,a3,a2p;
	var dir,files,obj,file,file2,ext,fh,dpath,cpath;
	num=MMPnum;
	dpath=NumFolder(num);

	for(i in MMP)	if (MMP[i]) enc++;
	if (enc==0)
		{
		alert("変更したい地図をクリックして選択してください。");
		return;
		}
	a=prompt("選択した地図を移動したい区域番号を入力してください。","");
	if (a==null) return;
	if ((isNaN(a))||(a==""))
		{
		alert("区域番号の指定が正しくありません。");
		return;
		}
	num2=parseInt(a,10);
	if (num2==0)
		{
		alert("区域番号の指定が正しくありません。");
		return;
		}
	if (!fso.FolderExists(NumFolder(num2)))
		{
		alert("区域番号"+num2+"は存在しません。\n新しい区域の追加をしてから実行してください。");
		return;
		}
	if (num2==num)
		{
		alert("移動先の区域番号が現在と同じです。\n移動できません。");
		return;
		}
	if (Cards[num2].NowUsing)
		{
		alert("移動先の区域は、現在使用中です。\n移動先の区域の使用が終了してから移動してください。");
		return;
		}
	cpath=NumFolder(num2);

	//	移動先の区域枚数を増やす
	bc=parseInt(Cards[num2].count,10);
	Cards[num2].count=bc+enc;
	j1=0;j2=0;
	for(i=1;i<=Cards[num].count;i++)
		{
		newmap[i]=new Object();
		if (MMP[i])
			{
			j1++;
			newmap[i].move=true;
			newmap[i].changeto=bc+j1;
			continue;
			}
		j2++;
		newmap[i].move=false;
		newmap[i].changeto=j2;
		}

	/*	画像の移動	*/
	dir=fso.GetFolder(dpath);
	files=new Enumerator(dir.Files);

	j=0;
	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		ext=fso.GetExtensionName(file).toLowerCase();
		if ((ext!="jpg")&&(ext!="png")) continue;

		//	サムネイルの場合
		if ((ext=="jpg")&&(file.indexOf("thumb",0)==0))
			{
			p1=5;
			p3=file.indexOf(".jpg",p1);
			if (p3==-1) continue;
			a2=file.substring(p1,p3);
			if (isNaN(a2)) continue;
			a2=parseInt(a2,10);
			if (!a2 in newmap) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="thumb#"+a2+".jpg";
			if (newmap[a2].move)
				{
				obj.dstname="thumb"+newmap[a2].changeto+".jpg";
				fso.CopyFile(dpath+obj.srcname,cpath+obj.dstname,true);
				fso.DeleteFile(dpath+obj.srcname,true);
				continue;
				}
			obj.dstname="thumb"+newmap[a2].changeto+".jpg";
			if (newmap[a2].changeto==a2) continue;
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図原本の場合
		if (ext=="png")
			{
			p2=file.indexOf(".png",0);
			if (p2==-1) p2=file.indexOf(".PNG",0);
			if (p2==-1) continue;
			a2=file.substring(0,p2);
			if (isNaN(a2)) continue;
			a2=parseInt(a2,10);
			if (!a2 in newmap) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="#"+a2+".png";
			if (newmap[a2].move)
				{
				obj.dstname=newmap[a2].changeto+".png";
				fso.CopyFile(dpath+obj.srcname,cpath+obj.dstname,true);
				fso.DeleteFile(dpath+obj.srcname,true);
				continue;
				}
			obj.dstname=newmap[a2].changeto+".png";
			if (newmap[a2].changeto==a2) continue;
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図Jpegの場合
		if (ext=="jpg")
			{
			p2=file.indexOf(".jpg",0);
			if (p2==-1) p2=file.indexOf(".JPG",0);
			if (p2==-1) continue;
			a2=file.substring(0,p2);
			if (a2.indexOf("r",0)==-1)
				{
				a2p="";
				a3=a2;
				}
			else{
				a2p="r";
				a3=a2.substring(0,a2.length-1);
				}
			if (isNaN(a3)) continue;
			a3=parseInt(a3,10);
			if (!a3 in newmap) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="#"+a3+a2p+".jpg";
			if (newmap[a3].move)
				{
				obj.dstname=newmap[a3].changeto+a2p+".jpg";
				fso.CopyFile(dpath+obj.srcname,cpath+obj.dstname,true);
				fso.DeleteFile(dpath+obj.srcname,true);
				continue;
				}
			obj.dstname=newmap[a3].changeto+a2p+".jpg";
			if (newmap[a3].changeto==a3) continue;
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}
		}
	//	画像リネームの実行
	for(i in renames)
		{
		obj=renames[i];
		fh=fso.GetFile(dpath+obj.tempname);
		fh.Name=obj.dstname;
		}
	/*	特記情報の移動	*/
	BTB=Cards[num].RTB;
	var BRTB=new Array();
	var br=0;
	for(i in BTB)
		{
		a1=BTB[i].Num;
		a2=newmap[a1].changeto;
		BTB[i].Num=a2;
		if (newmap[a1].move)
			{
			BRTB[br]=clone(BTB[i]);
			delete BTB[i];
			br++;
			}
		}
	SaveConfig(num);
	BTB=Cards[num2].RTB;
	for(i=0;i<br;i++)
		{
		j1=BTB.length;
		BTB[j1]=clone(BRTB[i]);
		}
	SaveConfig(num2);
	/*	マーカーの移動 */
	Markers=LoadMarker(num);
	if (Markers.Count>0)
		{
		copy1=new Array();
		copy2=new Array();
		c2=0;
		for(i in Markers.Map)
			{
			a2=newmap[i].changeto;
			if (newmap[i].move)	//	別の区域へ移動する地図
				{
				copy2[a2]=clone(Markers.Map[i]);
				c2++;
				}
			else{
				copy1[a2]=clone(Markers.Map[i]);
				}
			}
		Markers.Map=new Array();
		for(i in copy1)	Markers.Map[i]=clone(copy1[i]);
		SaveMarker(num,Markers);
		if (c2>0)
			{
			Markers=LoadMarker(num2);
			for(i in copy2)
				{
				Markers.Map[i]=clone(copy2[i]);
				}
			SaveMarker(num2,Markers);
			}
		}
	/*	物件の移動	*/
	var B1=ReadXMLFile(BuildingFile(num),true);
	if (B1!="")
		{
		var B2=ReadXMLFile(BuildingFile(num2),true);
		if (B2=="")
			{
			B2=new Object();
			B2.building=new Array();
			}
		j=B2.building.length;
		for(i in B1.building)
			{
			a1=parseInt(B1.building[i].map,10);
			a2=newmap[a1].changeto;
			if (newmap[a1].move)	//	今回移動する
				{
				B2.building[j]=clone(B1.building[i]);
				B2.building[j].map=newmap[a1].changeto;
				j++;
				delete B1.building[i];
				}
			else{
				B1.building[i].map=newmap[a1].changeto;
				}
			}
		WriteXMLFile(B1,BuildingFile(num));
		WriteXMLFile(B2,BuildingFile(num2));
		Cards[num].Buildings=GetBuildingSummeryInfo(num);
		Cards[num2].Buildings=GetBuildingSummeryInfo(num2);
		SaveConfig(num);
		SaveConfig(num2);
		Building=ReadXMLFile(BuildingFile(num),true);
		}

	var str="地図（";
	s="";
	enc=0;
	for(i in MMP)
		{
		if (MMP[i])
			{
			if (enc>0) {str+=",";s+=",";}
			str+=i;
			s+=i;
			enc++;
			}
		}
	str+="）を区域"+num2+"に移動しました。";
	s="区域"+num+"-"+s+"→区域"+num2+"へ";
	LoadCard(num);
	LoadCard(num2);
	CreateSummaryofPerson(num,true);
	CreateSummaryofPerson(num2,true);

	Cards[num].count-=enc;
	if (Cards[num].count>0)
		{
		SaveConfig(num);
		MENU1P(num);
		alert(str);
		}
	else{
		var fdir=NumFolderPath(num);
		fso.DeleteFolder(fdir,true);
		s="("+num+")"+Cards[num].name;
		s+="、分割数＝"+Cards[num].count+"、区分＝"+Cards[num].kubun;
		delete Cards[num];
		MENU1();
		str+="\n（区域番号"+num+"は地図が無くなったので、削除されました。）";
		alert(str);
		}
	}
//-------------地図を削除--------------------------------------------
function ExecDeleteMap()
	{
	var a,b;
	var en=0,enc=0;
	var src,dst,copy;
	var i,j,num,BTB;
	var newmap=new Array();
	var renames=new Array();

	var p1,p2,p3,a1,a2,a3,a1p;
	var dir,files,obj,file,file2,ext,fh,dpath;
	num=MMPnum;
	dpath=NumFolder(num);

	for(i in MMP)
		{
		if (MMP[i])
			{
			enc++;
			}
		}
	if (enc==0)
		{
		alert("削除したい地図をクリックして選択してください。");
		return;
		}
	a=confirm("選択した"+enc+"枚の地図を削除します。\n削除する地図にある特記事項や使用履歴、地図データは全て削除されます。\nよろしいですか？");
	if (!a) return;
	j=0;
	for(i=1;i<=Cards[num].count;i++)
		{
		newmap[i]=new Object();
		if (MMP[i])
			{
			newmap[i].del=true;	//	これを削除する
			continue;
			}
		newmap[i].del=false;	//	削除しない
		newmap[i].changeto=j+1;	//	変更後地図番号
		j++;
		}

	/*	画像の削除	*/
	dir=fso.GetFolder(dpath);
	files=new Enumerator(dir.Files);

	j=0;
	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		ext=fso.GetExtensionName(file).toLowerCase();
		if ((ext!="jpg")&&(ext!="png")) continue;

		//	サムネイルの場合
		if ((ext=="jpg")&&(file.indexOf("thumb",0)==0))
			{
			p2=file.indexOf(".jpg",5);
			if (p2==-1) continue;
			a1=file.substring(5,p2);
			if (isNaN(a1)) continue;
			a1=parseInt(a1,10);
			if (!a1 in newmap) continue;
			if (newmap[a1].del)
				{
				fso.DeleteFile(dpath+file,true);
				continue;
				}
			if (newmap[a1].changeto==a1) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="thumb#"+a1+".jpg";
			obj.dstname="thumb"+newmap[a1].changeto+".jpg";
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図原本の場合
		if (ext=="png")
			{
			p2=file.indexOf(".png",0);
			if (p2==-1) p2=file.indexOf(".PNG",0);
			if (p2==-1) continue;
			a1=file.substring(0,p2);
			if (isNaN(a1)) continue;
			a1=parseInt(a1,10);
			if (!a1 in newmap) continue;
			if (newmap[a1].del)
				{
				fso.DeleteFile(dpath+file,true);
				continue;
				}
			if (newmap[a1].changeto==a1) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="#"+a1+".png";
			obj.dstname=newmap[a1].changeto+".png";
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図Jpegの場合
		if (ext=="jpg")
			{
			p2=file.indexOf(".jpg",0);
			if (p2==-1) p2=file.indexOf(".JPG",0);
			if (p2==-1) continue;
			a1=file.substring(0,p2);
			if (a1.indexOf("r",0)==-1)
				{
				a1p="";
				a3=a1;
				}
			else{
				a1p="r";
				a3=a1.substring(0,a1.length-1);
				}
			if (isNaN(a3)) continue;
			a3=parseInt(a3,10);
			if (!a3 in newmap) continue;
			if (newmap[a3].del)
				{
				fso.DeleteFile(dpath+file,true);
				continue;
				}
			if (newmap[a3].changeto==a3) continue;
			obj=new Object();
			obj.srcname=file;
			obj.tempname="#"+a3+a1p+".jpg";
			obj.dstname=newmap[a3].changeto+a1p+".jpg";
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		}
	//	画像リネームの実行
	for(i in renames)
		{
		obj=renames[i];
		fh=fso.GetFile(dpath+obj.tempname);
		fh.Name=obj.dstname;
		}
	/*	特記情報の入れ替え	*/
	BTB=Cards[num].RTB;
	for(i in BTB)
		{
		a1=BTB[i].Num;
		if (newmap[a1].del)
			{
			delete BTB[i];
			continue;
			}
		BTB[i].Num=newmap[a1].changeto;
		}
	SaveConfig(num);
	/*	マーカーの削除 */
	Markers=LoadMarker(num);
	if (Markers.Count>0)
		{
		j=0;
		copy=new Array();
		for(i in Markers.Map)
			{
			if (newmap[i].del)
				{
				delete Markers.Map[i];
				continue;
				}
			a1=newmap[i].changeto;
			copy[a1]=clone(Markers.Map[i]);
			}
		Markers.Map=new Array();
		for(i in copy) Markers.Map[i]=clone(copy[i]);
		SaveMarker(num,Markers);
		}
	/*	物件の削除	*/
	var B1=ReadXMLFile(BuildingFile(num),true);
	if (B1!="")
		{
		for(i in B1.building)
			{
			a1=parseInt(B1.building[i].map,10);
			a2=newmap[a1].changeto;
			if (newmap[a1].del)	//	今回削除する
				{
				delete B1.building[i];
				}
			}
		WriteXMLFile(B1,BuildingFile(num));
		Cards[num].Buildings=GetBuildingSummeryInfo(num);
		SaveConfig(num);
		Building=ReadXMLFile(BuildingFile(num),true);
		}

	var str="地図（";
	enc=0;s="";
	for(i in MMP)
		{
		if (MMP[i])
			{
			if (enc>0) {str+=",";s+=",";}
			str+=i;s+=i;
			enc++;
			}
		}
	str+="）を削除しました。";
	s="区域番号＝"+num+"、地図番号＝"+s;
	LoadCard(num);
	CreateSummaryofPerson(num,true);
	Cards[num].count-=enc;
	if (Cards[num].count>0)
		{
		SaveConfig(num);
		MENU1P(num);
		alert(str);
		}
	else{
		var fdir=NumFolderPath(num);
		fso.DeleteFolder(fdir,true);
		s="("+num+")"+Cards[num].name;
		s+="、分割数＝"+Cards[num].count+"、区分＝"+Cards[num].kubun;
		delete Cards[num];
		MENU1();
		str+="\n（区域番号"+num+"は地図が無くなったので、削除されました。）";
		alert(str);
		}
	}
//-------------地図を入れ替え--------------------------------------------
function ExecChangeMap()
	{
	var en=0,enc=0;
	var src,dst,copy;
	var i,BTB;
	for(i in MMP)
		{
		if (MMP[i])
			{
			enc++;
			if (enc==1) src=i;
			if (enc==2) dst=i;
			}
		}
	if (enc<2)
		{
		alert("番号を入れ替える地図を２つ選択してください。");
		return;
		}

	var renames=new Array();
	var p1,p2,p3,a1,a2,a3,a2p;
	var dir,files,obj,file,file2,ext,fh,dpath;
	dpath=NumFolder(MMPnum);

	/*	画像情報の入れ替え	*/
	dir=fso.GetFolder(dpath);
	files=new Enumerator(dir.Files);

	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		ext=fso.GetExtensionName(file).toLowerCase();
		if ((ext!="jpg")&&(ext!="png")) continue;

		//	サムネイルの場合
		if ((ext=="jpg")&&(file.indexOf("thumb",0)==0))
			{
			p1=5;
			p3=file.indexOf(".jpg",p1);
			if (p3==-1) continue;
			a2=file.substring(p1,p3);
			if (isNaN(a2)) continue;
			a2=parseInt(a2,10);
			if ((a2!=src)&&(a2!=dst)) continue;
			if (a2==src)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="thumb#"+src+".jpg";
				obj.dstname="thumb"+dst+".jpg";
				}
			if (a2==dst)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="thumb#"+dst+".jpg";
				obj.dstname="thumb"+src+".jpg";
				}
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図原本の場合
		if (ext=="png")
			{
			p2=file.indexOf(".png",0);
			if (p2==-1) p2=file.indexOf(".PNG",0);
			if (p2==-1) continue;
			a2=file.substring(0,p2);
			if (isNaN(a2)) continue;
			a2=parseInt(a2,10);
			if ((a2!=src)&&(a2!=dst)) continue;
			if (a2==src)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="#"+src+".png";
				obj.dstname=dst+".png";
				}
			if (a2==dst)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="#"+dst+".png";
				obj.dstname=src+".png";
				}
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}

		//	地図Jpegの場合
		if (ext=="jpg")
			{
			p2=file.indexOf(".jpg",0);
			if (p2==-1) p2=file.indexOf(".JPG",0);
			if (p2==-1) continue;
			a2=file.substring(0,p2);
			if (a2.indexOf("r",0)==-1)
				{
				a2p="";
				a3=a2;
				}
			else{
				a2p="r";
				a3=a2.substring(0,a2.length-1);
				}
			if (isNaN(a3)) continue;
			a3=parseInt(a3,10);
			if ((a3!=src)&&(a3!=dst)) continue;
			if (a3==src)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="#"+src+a2p+".jpg";
				obj.dstname=dst+a2p+".jpg";
				}
			if (a3==dst)
				{
				obj=new Object();
				obj.srcname=file;
				obj.tempname="#"+dst+a2p+".jpg";
				obj.dstname=src+a2p+".jpg";
				}
			fh=fso.GetFile(dpath+obj.srcname);
			fh.Name=obj.tempname;
			renames.push(obj);
			continue;
			}
		}
	//	画像リネームの実行
	for(i in renames)
		{
		obj=renames[i];
		fh=fso.GetFile(dpath+obj.tempname);
		fh.Name=obj.dstname;
		}
	/*	特記情報の入れ替え	*/
	BTB=Cards[MMPnum].RTB;
	for(i in BTB)
		{
		if ((BTB[i].Num!=src)&&(BTB[i].Num!=dst)) continue;
		if (BTB[i].Num==src)	BTB[i].Num=dst;
						else	BTB[i].Num=src;
		}
	SaveConfig(MMPnum);
	/*	マーカーの入れ替え */
	Markers=LoadMarker(MMPnum);
	if (Markers.Count>0)
		{
		if ((src in Markers.Map)&&(dst in Markers.Map))
			{
			copy=clone(Markers.Map[src]);
			Markers.Map[src]=clone(Markers.Map[dst]);
			Markers.Map[dst]=clone(copy);
			}
		else{
			if (src in Markers.Map)
				{
				Markers.Map[dst]=clone(Markers.Map[src]);
				delete Markers.Map[src];
				}
			else{
				if (dst in Markers.Map)
					{
					Markers.Map[src]=clone(Markers.Map[dst]);
					delete Markers.Map[dst];
					}
				}
			}
		SaveMarker(MMPnum,Markers);
		}
	/*	物件の入れ替え	*/
	var B1=ReadXMLFile(BuildingFile(MMPnum),true);
	if (B1!="")
		{
		for(i in B1.building)
			{
			a1=parseInt(B1.building[i].map,10);
			if ((a1!=src)&&(a1!=dst)) continue;
			if (a1==src) B1.building[i].map=dst;
			if (a1==dst) B1.building[i].map=src;
			}
		WriteXMLFile(B1,BuildingFile(MMPnum));
		Building=ReadXMLFile(BuildingFile(MMPnum),true);
		}

	MENU1P(MMPnum);
	s="区域番号＝"+MMPnum+"、地図番号＝"+src+"←→"+dst;
	alert("地図("+src+")と地図("+dst+")を入れ替えました。");
	}
function NoCache()
	{
	var d=new Date();
	var t=d.getTime();
	return "?"+t+"";
	}
//--------------------------------------------------------------------------
function SaveMapImages(num)
	{
	var s,s0,s1,s2,i;
	objFolder=Shell.BrowseForFolder(0,"この区域の地図データ（PNGのみ）を保存します。\n保存先を指定してください",1,17);
	if (objFolder==null) return;
	s=objFolder.Items().Item().Path;
	if (s.charAt(s.length-1)!=qt) s+=qt;
	if (!fso.FolderExists(s))
		{
		alert("そこには保存できません。\nファイルを書き込みできるフォルダを指定してください。");
		return;
		}
	if (!fso.FolderExists(s+"quicky"))	fso.CreateFolder(s+"quicky");
	s1=s+"quicky"+qt;
	if (!fso.FolderExists(s1+"data"))	fso.CreateFolder(s1+"data");
	s1+="data"+qt;
	if (!fso.FolderExists(s1+num))	fso.CreateFolder(s1+num);
	s1+=num+qt;
	s0=NumFolder(num);
	for(i=1;i<=Cards[num].count;i++)
		{
		s2=num+"-"+i+".png";
		if (fso.FileExists(PNGFile(num,i)))	fso.CopyFile(PNGFile(num,i),s1+s2,true);
		}
	s="区域番号＝"+num+"、保存先＝"+s1;
	alert(s+"\nにこの地図データを保存しました。");
	}

function RestoreMapImages(num)
	{
	var s,s0,s1,s2,i,err,r;
	objFolder=Shell.BrowseForFolder(0,"この区域の地図データ（PNGのみ）を復帰します。\n復帰元を指定してください",1,17);
	if (objFolder==null) return;
	s=objFolder.Items().Item().Path;
	if (s.charAt(s.length-1)!=qt) s+=qt;
	s0=s+"quicky"+qt+"data"+qt+num+qt;
	if (!fso.FolderExists(s0))
		{
		alert("指定された場所には保存された地図データがありません。");
		return;
		}
	err=true;
	r=confirm(s+"\nから地図データを復帰してもよろしいですか？");
	if (!r) return;
	s1=NumFolder(num);
	for(i=1;i<=Cards[num].count;i++)
		{
		s2=num+"-"+i+".png";
		if (fso.FileExists(s0+s2))
			{
			fso.CopyFile(s0+s2,PNGFile(num,i),true);err=false;
			}
		}
	if (err)
		{
		alert("指定された場所には保存された地図データがありません。");
		return;
		}
	s="区域番号＝"+num+"、復帰元＝"+s0;
	alert(s+"\nに保存されていた地図データを復帰しました。");
	MENU1P(num);
	}

//	特定のカードの使用状況を更新する------------------------------------------
function CheckCardLog(num)
	{
	var text,f,lines,i,luse,nowstatus;
	var maxlogs,lastuse,lastuser,nowusing,avail;
	var obj,l;
	obj=LoadLog(num);
	l=obj.History.length;

	// 2018/1/19追加 -----------------------------------
	var now=new Date();
	var today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
	// 2018/1/19追加 -----------------------------------

	if (obj.Status=="Using")
		{
		nowusing=true;
		lastuse=obj.Latest.Rent;
		}
	else{
		nowusing=false;
		lastuse=obj.Latest.End;
		}
	lastuser=obj.Latest.User;
	luse=CalcDays(lastuse,"");
	if (!nowusing)
		{
		// 2018/1/19追加 -----------------------------------
		if (isCampeign(today))		//	キャンペーン期間中
			{
			if (luse<ConfigAll.BlankCampeign) avail="disable";else avail="true";
			}
		else{
			if (isAfterCampeign(today))	//	ｷｬﾝﾍﾟｰﾝ期間後30日
				{
				if (luse<ConfigAll.BlankAfterCampeign) avail="disable";else avail="true";
				}
			else{						//	通常の期間
				if ((luse<ConfigAll.BlankMin)&&(luse!=-1)) avail="disable";else avail="true";
				}
			}
		nowstatus="未使用("+luse+"日前)";
		if (isBeforeCampeign(today))
			{
			nowstatus="ｷｬﾝﾍﾟｰﾝ準備期間("+luse+"日前)";
			}
		// 2018/1/19追加 -----------------------------------
		}
	else{
		avail="false";
		nowstatus="使用中("+lastuser+"："+lastuse.substring(4,6)+"/"+lastuse.substring(6,8)+"～）";
		}
	Cards[num].status=nowstatus;
	Cards[num].lastuse=lastuse;
	Cards[num].Available=avail;
	Cards[num].Blank=luse;
	Cards[num].NowUsing=nowusing;
	Cards[num].LastUser=lastuser;
	}
//-----------------------------------------------------------------
function LoadCard(num)
	{
	var text,p1,p2,count,name,kubun;
	var i,j,f,lines,obj,almap,o,s,ovr;
	Cards[num]=new Object();
	obj=new Object();
	obj=ReadXMLFile(ConfigXML(num),false)
	Cards[num].name=obj.name;
	Cards[num].count=obj.count;
	Cards[num].kubun=obj.kubun;
	if ("MapType" in obj) Cards[num].MapType=parseInt(obj.MapType,10);else Cards[num].MapType=0;
	if ("HeaderType" in obj) Cards[num].HeaderType=parseInt(obj.HeaderType,10);else Cards[num].HeaderType=1;
	if ("spanDays" in obj) Cards[num].spanDays=parseInt(obj.spanDays,10);
	if ("AllMapPosition" in obj) Cards[num].AllMapPosition=obj.AllMapPosition;
	if ("AllMapTitle" in obj) Cards[num].AllMapTitle=obj.AllMapTitle;
	if ("RTB" in obj)	Cards[num].RTB=clone(obj.RTB);
				else	Cards[num].RTB=new Array();
	Cards[num].refuses=Cards[num].RTB.length;
	if ("Buildings" in obj)
		{
		Cards[num].Buildings=new Object();
		Cards[num].Buildings.Count=parseInt(obj.Buildings.Count,10);
		Cards[num].Buildings.House=parseInt(obj.Buildings.House,10);
		}
	else{
		Cards[num].Buildings=GetBuildingSummeryInfo(num);
		SaveConfig(num);
		}
	if (Cards[num].MapType==1)	//	集合住宅の場合
		{
		Cards[num].Buildings.Count=Condominiums[num].Buildings;
		Cards[num].Buildings.House=Condominiums[num].Rooms;
		}
	Cards[num].Clip=new Array();
	if ("Clip" in obj)
		{
		for(i=0;i<obj.Clip.length;i++)
			{
			j=parseInt(obj.Clip[i].Seq,10);
			Cards[num].Clip[j]=new Object();
			Cards[num].Clip[j].Area=obj.Clip[i].Area;
			if ("Zoom" in obj.Clip[i])
				{
				Cards[num].Clip[j].Zoom=obj.Clip[i].Zoom;
				Cards[num].Clip[j].Top=obj.Clip[i].Top;
				Cards[num].Clip[j].Left=obj.Clip[i].Left;
				}
			}
		}
	if ("Condominium" in obj)
		{
		Cards[num].Condominium=clone(obj.Condominium);
		}
	else{
		Cards[num].Condominium=new Array();
		}
	if ("Comments" in obj)
		{
		Cards[num].Comments=clone(obj.Comments);
		}
	else{
		Cards[num].Comments=new Array();
		}
	CheckCardLog(num);
	}

function LoadAllCards()
	{
	Cards=new Array();
	var dir,folders,obj,num;
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		obj=folders.item();
		if (isNaN(obj.Name)) continue;
		num=fso.GetBaseName(obj.Name);
		num=parseInt(num,10);
		LoadCard(num);
		}
	CreateSummaryofAllPerson();
	}
//-------------------------------------------------------------------
// 2018/5/23追加　指定された区域またはアパートの最短使用可能日を取得
//-------------------------------------------------------------------
function GetAvailableDate(num)
	{
	var str,sts,atbl,d,i;
	var d0,nisu;
	if (isNaN(num))	//	アパートの場合
		{
		sts=GetApartmentStatus(num);
		if (sts=="")	return "00000000";
		atbl=sts.split(",");
		d=AddDays(atbl[2],ConfigAll.BlankMin);
		return d;
		}

	//	通常の区域の場合
	CheckCardLog(num);
	d=Cards[num].lastuse;				//	最終使用日
	if (Cards[num].NowUsing) return d;	//	使用中の場合は開始日を返す
	d0=d;
	nisu=0;
	while(1==1)
		{
		d0=AddDays(d0,1);
		nisu++;
		if (isBeforeCampeign(d0)) continue;
		if (isCampeign(d0))
			{
			if (nisu>=ConfigAll.BlankCampeign) break;
			continue;
			}
		if (isAfterCampeign(d0))
			{
			if (nisu>=ConfigAll.BlankAfterCampeign) break;
			continue;
			}
		if (nisu>=ConfigAll.BlankMin) break;
		}
	return d0;
	}

