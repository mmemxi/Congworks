//------------------------------------------------------------------------------------
var Menu2_Filter_kubuncount=group.length;
var Menu2_Filter_kubun="";
var Menu2_Filter_status="";
var Menu2_Year;
var MENU2Top=0;
var Arrival_Year;
var Sortkey2=new Array();
var maxsort2;
var Arrival=new Array();
var maxArrival=0;
var DB2=new Array();
//------------------------------------------------------------------------------------
function GetArrival(year)
	{
	var folder=basepath+"\\data\\arrival\\";
	var filename=folder+year+".csv";
	var data=ReadFile(filename);
	var spr,i,j,dtl,yyyymm,code,num,yyyy,mm,seq,nend;
	Arrival=new Array();
	maxArrival=0;
	j=0;
	if (data!="")
		{
		spr=data.split("\r\n");
		for(i in spr)
			{
			spr[i]+=",end,end,end";
			dtl=spr[i].split(",");
			if (dtl[0]=="end") break;
			if (dtl[1]=="end") break;
			if (dtl[2]=="end") break;
			yyyymm=dtl[0];
			yyyy=parseInt(yyyymm.substring(0,4),10);
			mm=parseInt(yyyymm.substring(4,6),10);
			nend=yyyy;if (mm>=9) nend++;
			code=dtl[1];
			num=parseInt(dtl[2],10);
			if (mm>=9) seq=mm-8;else seq=mm+4;
			seq=13-seq;
			if (seq<10) seq="0"+seq;else seq+="";
			seq+=code;
			Arrival[j]=new Object();
			Arrival[j].順序=seq;
			Arrival[j].年月=yyyy+"/"+mm;
			Arrival[j].年度=nend;
			Arrival[j].月=yyyymm;
			Arrival[j].品目=code;
			if (code in DB)	Arrival[j].品目名=DB[code].品目名;
					else	Arrival[j].品目名="?????";
			Arrival[j].数量=num;
			j++;
			}
		}
	maxArrival=j;
	Arrival.sort(MENU2_Sort);
	}
function SetArrival(year)
	{
	var s;
	var folder=basepath+"\\data\\arrival\\";
	var filename=folder+year+".csv";
	if (Arrival.length==0)
		{
		if (fso.FileExists(filename)) fso.DeleteFile(filename,true);
		return;
		}
	var f=fso.CreateTextFile(filename,true);
	for(i in Arrival)
		{
		s=Arrival[i].月+","+Arrival[i].品目+","+Arrival[i].数量;
		f.WriteLine(s);
		}
	f.close();
	//	もし新年度の最初の入荷なら、DBがなければ造る
	if (!fso.FileExists(DBFile(year)))
		{
		CreateNewDB(year);
		}
	}
function MENU2_Sort(a,b)
	{
	var aa,bb;
	aa=a.順序;
	bb=b.順序;
	if (aa<bb) return -1;
	if (aa>bb) return 1;
	return 0;
	}
function ChangeMenu2(num)
	{
	Menu2_Year=num;
	MENU2Top=0;
	MENU2();
	}
function MENU2_Years_Sort(a,b)
	{
	return b-a;
	}
//------------------------------------------------------------------------------------
function MENU2()
	{
	var i,j,o,s,ss,file,yearnum,obj,filename,basename;
	var yearsExist=false;
	var years=new Array();
	nowmode="MENU2";
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞入荷品目の処理：");
	i=todayYear+1;
	yearnum=0;

	var folder=basepath+"\\data\\arrival";
	if (!fso.FolderExists(folder))
			{
			fso.CreateFolder(basepath+"\\data\\arrival");
			}
	var dir=fso.GetFolder(basepath+"\\data\\arrival");
	var files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		yearnum++;
		i=parseInt(basename,10);
		years.push(i);
		}
	if (yearnum==0) ss="";
	else{
		ss="<select onchange='ChangeMenu2(this.value)'>";
		years.sort(MENU2_Years_Sort);
		for(i=0;i<yearnum;i++)
			{
			ss+="<option value="+years[i];
			if (years[i]==Menu2_Year)
				{
				ss+=" selected";
				yearsExist=true;
				}
			ss+=">"+years[i]+"年度</option>";
			}
		ss+="</select>";
		if (!yearsExist) Menu2_Year=years[0];
		}
	OpenDB(Menu2_Year);
	s=ss;
	s+="</span><br><hr align=left width=80%>";
	WriteLayer("Stage",s);
	AddKey("Stage",1,"新しい入荷の入力","MENU2A(\"\")");
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
	Keys[11]="MainMenu()";
	window.scrollTo(0,0);
	if (yearnum==0)
		{
		WriteLayer("Stage","<br><span class=size3>過去の入荷品目はありません。</span>");
		return;
		}
	GetArrival(Menu2_Year);
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=70>入荷年月</td>";
	s+="<td align=center class=size2 width=70>品目番号</td>";
	s+="<td align=center class=size2 width=350>品目名<br>";
	s+="<td align=center class=size2 width=100>数量</td></tr>";
	for(j=0;j<maxArrival;j++)
		{
		s+="<tr>";
		s+="<td style='cursor:hand' title='入荷情報を修正します' onClick='MENU2A(\""+j+"\")'>"+Arrival[j].年月+"</td>";
		s+="<td style='cursor:hand' title='入荷情報を修正します' onClick='MENU2A(\""+j+"\")'>"+Arrival[j].品目+"</td>";
		s+="<td style='cursor:hand' title='入荷情報を修正します' onClick='MENU2A(\""+j+"\")'>"+Arrival[j].品目名+"</td>";
		s+="<td style='cursor:hand' title='入荷情報を修正します' onClick='MENU2A(\""+j+"\")' align=right>"+Arrival[j].数量+"</td>";
		s+="</tr>";
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,MENU2Top);
	}

function MENU2A(num)
	{
	var s,ymd,i,j,code,bpos,numx;
	var y,m,d,ay,am,py,pm,sur;
	MENU2Top=document.body.scrollTop;
	var today=new Date();
	var Ary=new Array();
	y=today.getFullYear();
	m=today.getMonth()+1;
	d=today.getDate();
	numx=num;if (numx=="") numx=-1;
	if (d<10)
		{
		m--;
		if (m==0) {m=12;y--;}
		}

	Help=12;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU2()";
	Ary[0]=y+1;
	Ary[1]=y;
	Ary[2]=y-1;
	if (num!="")
		{
		ay=Arrival[num].月.substring(0,4);
		am=Arrival[num].月.substring(4,6);
		ay=parseInt(ay,10);
		am=parseInt(am,10);
		if (ay==(y+1)) py=0;
		if (ay==y) py=1;
		if (ay==(y-1)) py=2;
		pm=am;
		}
	else{
		py=1;
		pm=m;
		}
	if (num=="")
		{
		s="<div class=size5>新しい入荷の入力</div>";
		bpos=0;
		}
	else{
		s="<div class=size5>入荷情報の訂正</div>";
		code=Arrival[num].品目;
		bpos=BunruiToNum(DB[code].分類);
		}
	s+="<hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='MENU2A_Exec("+num+");return false;'><table border=1 cellspacing=0 cellpadding=8 width=80%>";
	s+="<tr><td width=100>入荷年月：</td><td>";
	if (num=="")	s+="<select size=1 onChange='MENU2A_CheckDate()'>";
			else	s+="<select size=1 disabled>";
	for(i=0;i<=2;i++)
		{
		s+="<option value="+Ary[i];
		if (i==py) s+=" selected";
		s+=">"+Ary[i]+"</option>";
		}
	s+="</select>年";
	if (num=="")	s+="<select size=1 onChange='MENU2A_CheckDate()'>";
			else	s+="<select size=1 disabled>";
	for(i=1;i<=12;i++)
		{
		s+="<option";if (i==pm) s+=" selected";
		s+=">"+i+"</option>";
		}
	s+="</select>月</td></tr>";
	s+="<tr><td>入荷品目：</td><td>";
	s+="<select size=1 onChange='ChangeItemList(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option value=i";
		if (i==bpos) s+=" selected";
		if (i==0)	s+=">すべて</option>";
			else	s+=">"+group[i]+"</option>";
		}
	s+="</select><input type=button value='新しい品目の追加' onClick='MENU2A_Add()'><br>";
	s+="<br>";
	s+="<div id='LISTS'>";
	if (num=="")
		{
		s+=ItemList(0,"",1);
		}
	else{
		s+=ItemList(bpos,Arrival[num].品目,1);
		}
	s+="</div></td></tr>";
	if (num=="") sur="";else sur=Arrival[num].数量;
	s+="<tr><td>入荷数量：</td><td>"+Field(8,false,sur)+"</td></tr></table><br>";
	if (num=="")
		{
		s+="<input type=button value='登録' onClick='MENU2A_Exec(-1)'>";
		}
	else{
		s+="<input type=button value='更新' onClick='MENU2A_Exec("+num+")'>";
		s+="<input type=button value='削除' onClick='MENU2A_Del("+num+")'>";
		}
	s+="<input type=button value='戻る' onClick='MENU2()'></form>";
	WriteLayer("Stage",s);
	}

function MENU2A_Add()
	{
	var a,b,c,nendo;
	a=document.forms[0].elements[0].value;
	b=document.forms[0].elements[1].selectedIndex+1;
	nendo=a;
	if (b>=9) nendo++;
	if (!fso.FileExists(DBFile(nendo)))
		{
		CreateNewDB(nendo);
		}
	StoreScreen("MENU1A(2)");
	}

function MENU2A_CheckDate()
	{
	var a,b,c,nendo;
	a=document.forms[0].elements[0].value;
	b=document.forms[0].elements[1].selectedIndex+1;
	nendo=a;
	if (b>=9) nendo++;
	Menu2_Year=nendo;
	OpenDB(Menu2_Year);
	c=document.forms[0].elements[2].selectedIndex;
	ChangeItemList(c);
	}

function ItemList(num,code,mode)
	{
	var s,cc;
	if (mode!=2)
		{
		s="<select size=10 style='width:400px;'>";
		}
	else{
		s="<select size=1 style='width:200px;'>";
		}
	if (mode!=1)
		{
		s+="<option value='same'";
		if (code=="same") s+=" selected";
		s+=">品目番号と同じ</option>";
		s+="<option value='none'";
		if (code=="none") s+=" selected";
		s+=">集計しない</option>";
		}
	for(i=0;i<DB2.length;i++)
		{
		if (num!=0)
			{
			if (DB2[i].分類!=group[num]) continue;
			if (mode!=1) if (DB2[i].集計種別!="sum") continue;
//			if (mode==1) if (DB2[i].集計種別=="sum") continue;
			if (mode==2)
				{
				cc=DB2[i].品目番号;
				if (DB3[cc].表==false) continue;
				}
			}
		s+="<option value='"+DB2[i].品目番号+"'";
		if (DB2[i].品目番号==code) s+=" selected";
		s+=">("+DB2[i].品目番号+"):"+DB2[i].品目名+"</option>";
		}
	s+="</select>";
	return s;
	}
function ChangeItemList(num)
	{
	var s=ItemList(num,"",1);
	LISTS.innerHTML=s;
	}
function MENU2A_Del(n)
	{
	var y;
	var a=confirm("この入荷情報を削除してもよろしいですか？");
	if (!a) return;
	y=Arrival[n].年度;
	Arrival.splice(n,1);
	SetArrival(y);
	MENU2();
	}
function MENU2A_Exec(n)
	{
	var y,m,s,i,j,num,name,sur,year;
	var yyyymm;
	num=document.forms[0].elements[4].selectedIndex;
	if (num==-1)
		{
		alert("入荷した品目を選択してください。");
		return;
		}
	i=document.forms[0].elements[4].value;
	sur=document.forms[0].elements[5].value;
	sur=sur.trim();
	if ((isNaN(sur))||(sur==""))
		{
		alert("数量の入力が正しくありません。");
		return;
		}
	sur=parseInt(sur,10);
	name=DB[i].品目名;
	y=document.forms[0].elements[0].value;
	m=document.forms[0].elements[1].selectedIndex+1;
	if (m>=9) year=parseInt(y,10)+1;else year=y;		//	９月以降は翌奉仕年度
	if (m<10) m="0"+m;else m+="";
	yyyymm=y+m;
	if (n==-1)
		{
		GetArrival(year);
		j=maxArrival;
		}
	else j=n;
	Arrival[j]=new Object();
	Arrival[j].品目=i;
	Arrival[j].月=yyyymm;
	Arrival[j].数量=sur;
	SetArrival(year);
	MENU2();
	}

