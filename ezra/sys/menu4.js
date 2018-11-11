//------------------------------------------------------------------------------------
var DB3=new Array();
var DBFix=new Array();
var Menu4_YearMonth;
var Menu4_Page=0;
var Menu4_Newest;
var Report=new Array();
var MENU4Top=0;
Report[0]=new Array();
Report[1]=new Array();
var ReportMax=new Array();
var ReportX=new Array();
var ReportY=new Array();
var ReportRange=new Object();
//	現在のターゲット年(tym)の算出
var today=new Date();
var ty=today.getFullYear();
var tm=today.getMonth()+1;
var td=today.getDate();
if (td<10)
	{
	tm--;
	if (tm==0) {tm=12;ty--;}
	}
var tym=ty,tymExist=false;
if (tm>=9) tym++;
Menu4_YearMonth=tym;
//------------------------------------------------------------------------------------
function GetReport(yearmonth)
	{
	var result="";
	var filename=ReportFolder()+yearmonth+".csv";
	var data=ReadFile(filename);
	if (data=="") return "";
	var spr,i,j,dtl,yyyymm,code,num,yyyy,mm,seq,nend;
	var pos,page,code,name,l;
	Report[0]=new Array();
	Report[1]=new Array();

	spr=data.split("\r\n");
	for(i in spr)
		{
		spr[i]+=",end,end,end";
		dtl=spr[i].split(",");
		if (dtl[0]=="*")
			{
			page=parseInt(dtl[1],10);
			ReportMax[page]=parseInt(dtl[2],10);
			ReportX[page]=eval(dtl[3]);
			ReportY[page]=eval(dtl[4]);
			continue;
			}
		if (dtl[0]=="end") break;
		if (dtl[1]=="end") break;
		if (dtl[2]=="end") break;
		page=parseInt(dtl[0],10);
		pos=parseInt(dtl[1],10);
		Report[page][pos]=new Object();
		code=dtl[2];
		Report[page][pos].品目=code;
		Report[page][pos].エラー=false;
		if (code=="????") Report[page][pos].エラー=true;
		if (code in DB) name=DB[code].品目名;
		else	{
				name="???";
				AutoAddMaster(code);
				if (code in DB) name=DB[code].品目名;
				}
		Report[page][pos].品目名=name;
		if (name=="???") Report[page][pos].エラー=true;
		}
	return true;
	}
//------------------------------------------------------------------------------------
function SetReport(yearmonth)
	{
	var s,i,p;
	var folder=ReportFolder();
	var filename=folder+yearmonth+".csv";
	var f=fso.CreateTextFile(filename,true);
	for(p=0;p<=1;p++)
		{
		s="*,"+p+","+ReportMax[p]+","+ReportX[p]+","+ReportY[p];
		f.WriteLine(s);
		for(i=0;i<ReportMax[p];i++)
			{
			if (!(i in Report[p])) continue;
			if (Report[p][i]=="") continue;
			s=p+","+i+","+Report[p][i].品目;
			f.WriteLine(s);
			}
		}
	f.close();
	}
//------------------------------------------------------------------------------------
function ChangeMenu4(num)
	{
	Menu4_YearMonth=num;
	MENU4();
	}
function ChangeMenu4Page(num)
	{
	Menu4_Page=num;
	MENU4();
	}
function MENU4_YearMonth_Sort(a,b)
	{
	return b-a;
	}
function MENU4_AdSort(a,b)
	{
	return a-b;
	}
//------------------------------------------------------------------------------------
function MENU4()
	{
	var i,j,o,s,ss,file,yearnum,obj,filename,basename,ext;
	var x,y,pos,code,name;
	var yearsExist=false;
	var years=new Array();
	nowmode="MENU4";
	ClearKey();
	ClearLayer("Stage");
	if (fso.FileExists(SysFolder()+"preview.jpg"))
		{
		fso.DeleteFile(SysFolder()+"preview.jpg");
		}
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞月ごとの文書移動表：");
	yearnum=0;

	//	レポートファイルの検索
	var folder=ReportFolder();
	if (!fso.FolderExists(folder)) fso.CreateFolder(folder);
	var dir=fso.GetFolder(ReportFolder());
	var files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		ext=fso.GetExtensionName(filename).toLowerCase();
		if (ext!="csv") continue;
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		yearnum++;
		i=parseInt(basename,10);
		if (i==tym) tymExist=true;
		years.push(i);
		}
	if (!tymExist)	{years.push(tym);yearnum++;}

	ss="<select onchange='ChangeMenu4(this.value)'>";
	years.sort(MENU4_YearMonth_Sort);
	for(i=0;i<yearnum;i++)
		{
		ss+="<option value="+years[i];
		if (years[i]==Menu4_YearMonth)
			{
			ss+=" selected";
			yearsExist=true;
			}
		ss+=">"+years[i]+"</option>";
		}
	ss+="</select>年度：";
	if (!yearsExist) Menu4_YearMonth=years[0];
	OpenDB(Menu4_YearMonth);

	ss+="<select onchange='ChangeMenu4Page(this.selectedIndex)'>";
	if (Menu4_Page==0)
		{
		ss+="<option selected>表面</option>";
		ss+="<option>裏面</option>";
		}
	else{
		ss+="<option>表面</option>";
		ss+="<option selected>裏面</option>";
		}
	ss+="</select></span><br><hr align=left width=80%>";
	WriteLayer("Stage",ss);
	Menu4_Newest=tym;
	var filename=ReportFolder+tym+".csv";
	AddKey("Stage",1,"文書移動表(PDF)を取り込む","MENU4C()");
	r=GetReport(Menu4_YearMonth);
	if (r!="")
		{
		AddKey("Stage",2,"この文書移動表を印刷する","MENU4B()");
		AddKey("Stage",3,"文書移動表を表示する","MENU4D()");
		}
	Keys[11]="MainMenu()";
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
	WriteLayer("Stage","<div id='HLIST'></div>");
	if (r!="")
		{
		DrawHList();
		window.scrollTo(0,MENU4Top);
		LoadCanvas(Menu4_YearMonth,Menu4_Page);
		}
	else{
		ClearLayer("HLIST");
		s="<hr width=100%>";
		s+="この年の文書移動表はまだ作成されていません。<br>";
		s+="「１：文書移動表(PDF)を取り込む」をクリックしてください。";
		WriteLayer("HLIST",s);
		MENU4Top=0;
		}
	}
function DrawHList()
	{
	var s,i,code,name;
	ClearLayer("HLIST");
	s="<hr width=100%>";
	s+="<table border=1 cellpadding=2 cellspacing=0>";
	s+="<tr class=HEAD><td width=80 nowrap align=center>品目番号</td><td width=500 align=center>品目名</td></tr>";
	for(i=0;i<ReportMax[Menu4_Page];i++)
		{
		if (!(i in Report[Menu4_Page]))
			{
			code="　";
			name="　";
			}
		else{
			code=Report[Menu4_Page][i].品目;
			name=Report[Menu4_Page][i].品目名;
			}
		if ((name=="???")||(code=="????"))
			{
			s+="<tr bgcolor=yellow>";
			}
		else s+="<tr>";
		s+="<td align=center nowrap text='品目番号を直接入力します' style='cursor:hand;' onClick='InputReport("+i+")'";
		s+=" onmousedown='pos4down("+i+")' onmouseup='pos4up("+i+")'>";
		s+=code+"</td>";
		if ((name=="???")&&(code!="????"))
			{
			s+="<td nowrap style='cursor:hand;' text='品目を登録します' onClick='AddReport("+code+","+i+")'";
			}
		else{
			s+="<td nowrap style='cursor:hand;' text='品目をメニューから選択します' onClick='EditReport("+i+")'";
			}
		s+=" onmousedown='pos4down("+i+")' onmouseup='pos4up("+i+")'>";
		s+=name+"</td></tr>";
		}
	s+="</table>";
	WriteLayer("HLIST",s);
	}

function pos4down(pos)
	{
	MouseDownPos=pos;
	}

function pos4up(pos)
	{
	var a,b;
	MouseUpPos=pos;
	if (MouseUpPos==MouseDownPos) return;
	if (!(MouseDownPos in Report[Menu4_Page])) return;
	if (MouseUpPos in Report[Menu4_Page]) return;
	a=MouseDownPos;
	b=MouseUpPos;
	Report[Menu4_Page][b]=new Object();
	Report[Menu4_Page][b].品目=Report[Menu4_Page][a].品目;
	Report[Menu4_Page][b].品目名=Report[Menu4_Page][a].品目名;
	delete Report[Menu4_Page][a];
	SetReport(Menu4_YearMonth);
	MENU4Top=document.body.scrollTop;
	DrawHList();
	}

function AddReport(num,pos)
	{
	var s,ymd,i,sel,alter;
	Help=12;
	MENU4Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	s="<div class=size5>品目番号"+num+"の新規登録：</div><hr align=left width=100%>";

	var vx1,vy1,vx2,vy2;
	var file=SysFolder()+"preview.jpg";
	vx1=Matrix.left;
	vy1=Matrix.hline[pos]+2;
	vx2=Matrix.vline[1]-2;
	vy2=Matrix.hline[pos+1]-2;
	IM_cutImage(vx1,vy1,vx2-vx1,vy2-vy1,file);
	s+="<img src='"+SysFolder()+"preview.jpg"+NoCache()+"'><br>";

	s+="<div class=size3><form onsubmit='AddReport_Exec(\""+num+"\");return false;'><table border=1 cellspacing=0 cellpadding=8>";
	s+="<tr><td>品目名：</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>分類：</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option>";
		if (i==0)
			{
			s+="分類を選択してください</option>";
			}
		else{
			s+=group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	alter="same";
	s+="<tr><td>集計先：</td><td><div id='LISTS'>"+ItemList(sel,alter,0)+"</div></td></tr></table><br>";
	s+="<input type=button value='更新' onClick='AddReport_Exec(\""+num+"\")'>";
	s+="<input type=button value='戻る' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	document.forms[0].elements[0].value="";
	}

function AddReport_Exec(num)
	{
	var s,name,kubun,alter,f;
	name=document.forms[0].elements[0].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("品目名が入力されていません。");
		return;
		}
	kubun=document.forms[0].elements[1].selectedIndex;
	kubun=group[kubun];

	alter=document.forms[0].elements[2].selectedIndex;
	if (alter<0)
		{
		alert("集計先を選択してください。");
		return;
		}
	alter=document.forms[0].elements[2].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	DB[num]=new Object();
	DB[num].品目名=name;
	DB[num].分類=kubun;
	DB[num].集計先=alter;
	UpdateDB();
	MENU4();
	}

function AutoAddMaster(num)
	{
	var s=num+"";
	var n1=s.substring(0,2);
	var n2=s.substring(2,4);
	var nen=2000+parseInt(n2,10);
	var result=false;
	var name,kubun,alter;
	switch(n1)
		{
		case "72":
					name=nen+" カレンダー";
					kubun="年ごとの品目";
					alter=num;
					result=true;
					break;
		case "69":
					name="聖書を調べる－"+nen;
					kubun="年ごとの品目";
					alter=num;
					result=true;
					break;
		case "57":
					name="「目ざめよ！」製本　"+nen;
					kubun="年ごとの品目";
					alter=num;
					result=true;
					break;
		case "56":
					name="「ものみの塔」製本　"+nen;
					kubun="年ごとの品目";
					alter=num;
					result=true;
					break;
		case "59":
					name=nen+" 年鑑";
					kubun="年ごとの品目";
					alter=num;
					result=true;
					break;
		case "25":
					name="Watchtower Library-"+nen;
					kubun="Watchtower Library";
					alter=num;
					result=true;
					break;
		}
	if (result)
		{
		DB[num]=new Object();
		DB[num].品目名=name;
		DB[num].分類=kubun;
		DB[num].集計先=alter;
		}
	}

function InputReport(pos)
	{
	var r="";
	MENU4Top=document.body.scrollTop;
	if (pos in Report[Menu4_Page])
		{
		r=Report[Menu4_Page][pos].品目;
		}
	r=prompt("品目番号を入力してください。",r);
	if (r==null) return;
	r=r.trim();
	if (r=="")
		{
		delete Report[Menu4_Page][pos];
		SetReport(Menu4_YearMonth);
		DrawHList();
		return;
		}
	if (!(r in DB))
		{
		alert("品目番号が正しくないか、登録されていません。");
		return;
		}
	Report[Menu4_Page][pos]=new Object();
	Report[Menu4_Page][pos].品目=r;
	Report[Menu4_Page][pos].品目名=DB[r].品目名;
	SetReport(Menu4_YearMonth);
	DrawHList();
	}

function EditReport(pos)
	{
	var s,ymd,i,j,x,y;
	var y,m,d,ay,am,py,pm,sur,bunrui;
	var today=new Date();
	var Ary=new Array();
	var label=new Array("表面","裏面");
	var Exist=false;
	MENU4Top=document.body.scrollTop;
	Help=12;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";

	var vx1,vy1,vx2,vy2;
	var file=SysFolder()+"preview.jpg";
	vx1=Matrix.left;
	vy1=Matrix.hline[pos]+2;
	vx2=Matrix.vline[1]-2;
	vy2=Matrix.hline[pos+1]-2;
	IM_cutImage(vx1,vy1,vx2-vx1,vy2-vy1,file);

	s="<div class=size5>";
	s+=label[Menu4_Page]+"-"+(pos+1)+"行目の品目情報</div>";
	s+="<hr align=left width=100%>";
	s+="<img src='"+SysFolder()+"preview.jpg"+NoCache()+"'><br>";
	s+="<div class=size3><form onsubmit='EditReport_Exec("+pos+");return false;'><table border=1 cellspacing=0 cellpadding=8 width=80%>";
	s+="<tr><td width=100>品目：</td><td>";
	s+="<select size=1 onChange='ChangeItemList(this.selectedIndex)'>";
	if (pos in Report[Menu4_Page]) Exist=true;
	if (Exist)
		{
		i=Report[Menu4_Page][pos].品目;
		if (i in DB)
			{
			j=DB[i].分類;
			bunrui=BunruiToNum(j);
			}
		else bunrui=0;
		}
	else{
		bunrui=0;
		}
	for(i=0;i<group.length;i++)
		{
		s+="<option value="+i;
		if (i==bunrui) s+=" selected";
		s+=">";
		if (i==0) s+="すべて";else s+=group[i];
		s+="</option>";
		}
	s+="</select><input type=button value='新しい品目の追加' onClick='StoreScreen(\"MENU1A(4)\")'><br>";
	s+="<div id='LISTS'>";
	if (!Exist)
		{
		s+=ItemList(bunrui,"",1);
		}
	else{
		s+=ItemList(bunrui,Report[Menu4_Page][pos].品目,1);
		}
	s+="</div></td></tr></table><br>";
	s+="<input type=button value='登録' onClick='EditReport_Exec("+pos+")'>";
	s+="<input type=button value='挿入（後ろへずらす）' onClick='EditReport_Insert("+pos+")'><br>";
	s+="<input type=button value='消去' onClick='EditReport_Del("+pos+")'>";
	s+="<input type=button value='削除（前へ詰める）' onClick='EditReport_Remove("+pos+")'><br>";
	s+="<input type=button value='戻る' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	}

function EditReport_Exec(pos)
	{
	var code,name;
	code=document.forms[0].elements[2].selectedIndex;
	if (code<0)
		{
		alert("品目を選択してください。");
		return;
		}
	code=document.forms[0].elements[2].value;
	Report[Menu4_Page][pos]=new Object();
	Report[Menu4_Page][pos].品目=code;
	if (code in DB) name=DB[code].品目名;else name="???";
	Report[Menu4_Page][pos].品目名=name;
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Insert(pos)
	{
	var code,name,a,max0;
	code=document.forms[0].elements[2].selectedIndex;
	if (code<0)
		{
		alert("品目を選択してください。");
		return;
		}
	if (Menu4_Page==0)
		{
		max0=ReportMax[0]-1;
		if (max0 in Report[0])
			{
			Report[1].splice(0,0,Report[0][max0]);
			}
		else{
			Report[1].splice(0,0,"");
			}
		}
	code=document.forms[0].elements[2].value;
	Report[Menu4_Page].splice(pos,0,new Object());
	Report[Menu4_Page][pos].品目=code;
	if (code in DB) name=DB[code].品目名;else name="???";
	Report[Menu4_Page][pos].品目名=name;
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Del(pos)
	{
	var a=confirm("この行を消去してもよろしいですか？\n（以降の行を前に詰めることはしません）");
	if (!a) return;
	Report[Menu4_Page][pos]="";
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Remove(pos)
	{
	var a=confirm("この行を削除して、以降の行を前に詰めてもよろしいですか？");
	var i;
	var max0,max1;
	if (!a) return;
	Report[Menu4_Page].splice(pos,1);
	if (Menu4_Page==0)
		{
		max0=ReportMax[0]-1;
		if (0 in Report[1]) Report[0][max0]=Report[1][0];
		Report[1].splice(0,1);
		}
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function MENU4B()
	{
	var s,y,m,d,i,ym,todayy,todaym,todayd;
	var startym,endym;
	var years=new Array();

	j=false;
	for(i in Report[Menu4_Page])
		{
		if (Report[Menu4_Page][i].エラー) j=true;
		}
	if (j)
		{
		alert("文書移動表の中にエラーがあります。\n黄色で表示されている行がエラーです。\nエラーを修正してから印刷してください。");
		return;
		}

	var today=new Date;
	todayy=today.getFullYear();
	todaym=today.getMonth()+1;
	todayd=today.getDate();
	if (todayd<10) {todaym--;if (todaym<1) {todaym=12;todayy--;}}
	MENU4Top=document.body.scrollTop;
	Help=12;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	s="<div class=size5>文書移動表の印刷（"+Menu4_YearMonth+"年度：";
	if (Menu4_Page==0) s+="表面";else s+="裏面";
	s+="）</div>";
	s+="<hr align=left width=100%>";
	s+="<div class=size3><form><table border=1 cellspacing=0 cellpadding=8>";
	s+="<tr><td nowrap>印刷範囲（１～６ヶ月）：</td>";
	s+="<td><div id='M4PULL'></div>";
	s+="</td></tr></table><br>";
	s+="<input type=button value='印刷' onClick='MENU4B_Check(true)'>";
	s+="<input type=button value='戻る' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	DrawMENU4BPulldown(0,0);
	}

function DrawMENU4BPulldown(startym,endym)
	{
	var dir,files,obj,filename,basename,fyearmonth,fyear,fmonth;
	var i,j,k,s,firstym;
	var years=new Array();

	dir=fso.GetFolder(RackFolder());
	files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		fyearmonth=parseInt(basename,10);
		years.push(fyearmonth);
		}
	years.sort(MENU4_AdSort);

	if ((startym!=0)&&(endym==0))
		{
		for(i=0;i<years.length;i++)
			{
			if (years[i]==startym) break;
			}
		for(j=i;j<years.length;j++)
			{
			if ((j-i)==5) break;
			}
		if (j==years.length) j=years.length-1;
		endym=years[j];
		}
	if ((startym==0)&&(endym!=0))
		{
		fyear=Math.floor(endym/100);
		fmonth=endym % 100;
		if ((fmonth>=3)&&(fmonth<=8))
			{
			startym=fyear*100+3;
			}
		else{
			if (fmonth<=2)
				{
				startym=(fyear-1)*100+9;
				}
			else{
				startym=fyear*100+9;
				}
			}
		}
	//	開始年月・終了年月ともに０（自動設定）
	if ((startym==0)&&(endym==0))
		{
		i=years.length-1;
		fyearmonth=years[i];
		endym=fyearmonth;
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		if ((fmonth>=3)&&(fmonth<=8))
			{
			startym=fyear*100+3;
			}
		else{
			if (fmonth<=2)
				{
				startym=(fyear-1)*100+9;
				}
			else{
				startym=fyear*100+9;
				}
			}
		}
	s="<select size=1 onChange='MENU4B_Change1()'>";
	firstym=0;
	for(i=0;i<years.length;i++)
		{
		fyearmonth=years[i];
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		if ((fmonth!=9)&&(fmonth!=3)) continue;
		if (firstym==0) firstym=fyearmonth;
		s+="<option ";
		if (fyearmonth==startym) s+="selected "
		s+="value="+fyearmonth+">"+fyear+"年"+fmonth+"月</option>";
		}
	s+="</select>～<select size=1 onChange='MENU4B_Change2()'>";
	for(i=0;i<years.length;i++)
		{
		fyearmonth=years[i];
		if (fyearmonth<firstym) continue;
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		s+="<option ";
		if (fyearmonth==endym) s+="selected "
		s+="value="+fyearmonth+">"+fyear+"年"+fmonth+"月</option>";
		}
	s+="</select>";
	ClearLayer("M4PULL");
	WriteLayer("M4PULL",s);
	}

function MENU4B_Change1()
	{
	var a=document.forms[0].elements[0].value;
	DrawMENU4BPulldown(a,0)
	}

function MENU4B_Change2()
	{
	var a=document.forms[0].elements[1].value;
	DrawMENU4BPulldown(0,a)
	}

function MENU4B_Check(mode)
	{
	var start,end,months;
	var i,j;

	start=document.forms[0].elements[0].value;
	end=document.forms[0].elements[1].value;

	if (start>end)
		{
		alert("印刷範囲の指定が正しくありません。\n（終了月が開始月より前になっています）");
		return;
		}
	months=(Math.floor(end/100)*12+(end % 100))-(Math.floor(start/100)*12+(start % 100));
	if (months>=6)
		{
		alert("印刷範囲の指定が正しくありません。\n（最大６ヶ月分までです）");
		return;
		}

	i=start % 100;
	j=end % 100;
	if ((i>=9)||(i<=2))
		{
		if ((j>2)&&(j<9))
			{
			alert("印刷範囲の指定が正しくありません。\n（上半期と下半期は別ページになります）");
			return;
			}
		}
	ClearKey();
	ClearLayer("Stage");
	if (mode) WriteLayer("Stage","印刷処理中です…");
	if (!mode) WriteLayer("Stage","プレビュー画像の準備中です…");
	setTimeout("MENU4B_Exec("+mode+","+start+","+end+")",100);
	}

function MENU4B_Exec(mode,start,end)
	{
	var s,a,side,code;
	var workbook,worksheet;
	var x,y,i,j,k,l,b0,b1y,b1m,ym;
	var width,height;
	var StartColumn,ReportCount;
	var ReportArray;
	var sur1,sur2,sur3;
	var result;
	var jfolder;

	DBFix=new Array();
	i=start % 100;
	j=end % 100;
	if (i>=9)
		{
		StartColumn=i-9;
		if (j>=9)	ReportCount=j-i+1;
			else	ReportCount=(13-i)+j;
		}
	if (i<=2)
		{
		StartColumn=i+4;
		ReportCount=j-i+1;
		}
	if ((i>=3)&&(i<=8))
		{
		StartColumn=i-3;
		ReportCount=j-i+1;
		}
	for(l=0;l<=1;l++)
		{
		ReportArray=new Array();
		LoadCanvas(Menu4_YearMonth,l);
		b0=StartColumn;
		b1y=Math.floor(start/100);
		b1m=start % 100;
		for(k=0;k<ReportCount;k++)
			{
			ReportArray[k]=new Object();
			ReportArray[k].Column=b0;
			ReportArray[k].YearMonth=b1y*100+b1m;
			b0++;
			b1m++;
			if (b1m>12) {b1m=1;b1y++;}
			}
		/*	明細内容をセット	*/
		for(i=0;i<ReportCount;i++)
			{
			x=ReportArray[i].Column;
			y=ReportArray[i].YearMonth;
			result=GetAllDetail(y);
			if (!result)
				{
				alert("在庫があるのに、集計先が表にない品目があります。\n修正してから印刷してください。");
				MENU4_FixMaster();
				return;
				}
			/*	期頭の行である場合、前期末在庫を印字	*/
			if (x==0)
				{
				for(j=0;j<ReportMax[l];j++)
					{
					if (!(j in Report[l])) continue;
					if (Report[l][j]=="") continue;
					code=Report[l][j].品目;
					if (!(code in DB3)) continue;
					sur2=DB3[code].前月在庫;
					if (sur2!=0)
						{
						DrawCanvas(0,j,sur2);
						}
					}
				}
			for(j=0;j<ReportMax[l];j++)
				{
				if (!(j in Report[l])) continue;
				if (Report[l][j]=="") continue;
				code=Report[l][j].品目;
				if (!(code in DB3)) continue;
				sur1=DB3[code].入荷数;
				sur2=DB3[code].在庫数;
				sur3=DB3[code].提供数;
				if (sur1==0) sur1="";
				if (sur3==0) sur3="";
				if ((sur1=="")&&(sur2==0)&&(sur3=="")) sur2="";
				DrawCanvas(x*3+1,j,sur1);
				DrawCanvas(x*3+2,j,sur2);
				DrawCanvas(x*3+3,j,sur3);
				}
			}
		SaveCanvas(l);
		}
	/*	印刷出力--------------------------------------	*/
	tfolder=TempFolder();
	WshShell.CurrentDirectory=tfolder;
	cmd="magick printout0.jpg printout1.jpg printout.pdf";
	WshShell.Run(cmd,0,true);
	PDFPrint(tfolder+"printout.pdf");
	WshShell.CurrentDirectory=basepath;
	MENU4();
	}

function GetAllDetail(yearmonth)
	{
	var i,j,sur1,sur2,sur3,init,alter;
	var code,sumto;
	var bRack=new Array();
	var year,month,beforey,beforem,beforeym;
	var result=true;

	DB3=new Array();
	init=0;
	for(i in DB)
		{
		DB3[i]=new Object();
		DB3[i].前月在庫=init;
		DB3[i].入荷数=init;
		DB3[i].在庫数=init;
		DB3[i].提供数=init;
		DB3[i].集計先=DB[i].集計先;
		DB3[i].表=false;
		}

	for(i in Report)
		{
		for(j in Report[i])
			{
			code=Report[i][j].品目;
			if ((code in DB3)==false) continue;
			DB3[code].表=true;
			}
		}

	year=Math.floor(yearmonth/100);
	month=yearmonth%100;
	if (month>=9)
		{
		yearp=year+1;
		}
	else{
		yearp=year;
		}
	GetArrival(yearp);		//	今月入荷の取得(年度なので2015/9-2016/8は2016.csvに入っている)

	beforey=year;
	beforem=month-1;
	if (beforem==0) {beforem=12;beforey--;}
	beforeym=beforey*100+beforem;
	GetRack(beforeym);		//	前月末在庫の取得
//	alert(yearmonth+"\n"+year+"\n"+beforeym);
	for(i in Rack)
		{
		bRack[i]=new Object();
		bRack[i].品目=Rack[i].品目;
		bRack[i].数量=Rack[i].数量;
		}
	GetRack(yearmonth);		//	今月在庫
	/*	入荷情報を更新する-------------------------------------------------	*/
	for(j=0;j<maxArrival;j++)
		{
		if (Arrival[j].月!=yearmonth) continue;
		code=Arrival[j].品目;
		if (!(code in DB)) continue;
		alter=DB[code].集計先;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].入荷数+=Arrival[j].数量;
		}
	/*	在庫情報を更新する-------------------------------------------------	*/
	for(i=0;i<=249;i++)
		{
		if (!(i in Rack)) continue;
		if (Rack[i]=="") continue;
		code=Rack[i].品目;
		if (!(code in DB)) continue;
		alter=DB[code].集計先;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].在庫数+=Rack[i].数量;
		}
	/*	前月末在庫を更新する-----------------------------------------------	*/
	for(i=0;i<=249;i++)
		{
		if (!(i in bRack)) continue;
		if (bRack[i]=="") continue;
		code=bRack[i].品目;
		if (!(code in DB)) continue;
		alter=DB[code].集計先;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].前月在庫+=bRack[i].数量;
		}
	/*	今月移動数の計算----------------------------------------------------*/
	for(i in DB3)
		{
		DB3[i].提供数=(DB3[i].前月在庫-DB3[i].在庫数)+DB3[i].入荷数;
		//	もしマイナスになっていれば、返品もしくは数え忘れの分を入荷数に足す
		if (DB3[i].提供数<0)
			{
			DB3[i].入荷数+=Math.abs(DB3[i].提供数);
			DB3[i].提供数=0;
			}
		}
	/*	集計先のない品目がある？--------------------------------------------*/
	for(i in DB3)
		{
		if ((DB3[i].提供数==0)&&(DB3[i].前月在庫==0)&&(DB3[i].入荷数==0)&&(DB3[i].在庫数==0)) continue;
		if (DB3[i].表==false)
			{
			if (!(i in DBFix))	DBFix.push(i);
			result=false;
			}
		}
	return result;
	}

function MENU4_FixMaster()
	{
	var str,i,j,b,bnr,c,il;
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞月ごとの文書移動表＞印刷＞品目情報の修正</span><br>");
	Keys[11]="MENU4()";
	s="<hr><form><table border=1 cellspacing=0>";
	s+="<tr class=HEAD><td width=80 nowrap align=center>品目番号</td><td width=300 align=center>品目名</td>";
	s+="<td width=200 align=center>集計先</td></tr>";
	c=0;
	for(i in DBFix)
		{
		j=DBFix[i];
		s+="<tr><td align=center>"+j+"</td>";
		s+="<td>"+DB[j].品目名+"</td>";
		b=DB[j].分類;
		bnr=BunruiToNum(b);
		s+="<td>";
		il=ItemList(bnr,DB[j].集計先,2);
		s+=il;
		s+="<input type=button value='更新' onClick='MENU4_FixMasterUpdate("+i+","+j+","+c+")'>";
		s+="</td></tr>";
		c+=2;
		}
	s+="</table></form>";
	if (c==0) {MENU4();return;}
	WriteLayer("Stage",s);
	AddKey("Stage",0,"戻る","MENU4()");
	}

function MENU4_FixMasterUpdate(num,code,elem)
	{
	var e=document.forms[0].elements[elem].value;
	if (e=="none") e="DUMMY";
	if (e=="same") e=code;
	DB[code].集計先=e;
	UpdateDB();
	delete DBFix[num];
	MENU4_FixMaster();
	}

function MENU4C()
	{
	MENU4Top=document.body.scrollTop;
	var s="<form><input type=file value=''></form>";
	ClearLayer("Stage");
	WriteLayer("Stage",s);
	setTimeout("MENU4C_Click()",5);
	}

function MENU4C_Click()
	{
	var s,ext;
	document.forms[0].elements[0].click();
	s=document.forms[0].elements[0].value;
	if (s=="") {MENU4();return;}
	if (!fso.FileExists(s)) return;
	ext=fso.GetExtensionName(s).toLowerCase();
	if (ext!="pdf")
		{
		alert("指定されたファイルはPDF文書ではありません。");
		MENU4();
		return;
		}
	ImportPDF(s);
	}

function NoCache()
	{
	var d=new Date();
	var t=d.getTime();
	return "?"+t+"";
	}

function MENU4D()
	{
	MENU4Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞月ごとの文書移動表＞文書移動表の表示＞");
	if (Menu4_Page==0)	{WriteLayer("Stage","表面<br>");AddKey("Stage",1,"裏面へ","MENU4DChange(1)");}
	if (Menu4_Page==1)	{WriteLayer("Stage","裏面<br>");AddKey("Stage",1,"表面へ","MENU4DChange(0)");}
	AddKey("Stage",0,"戻る","MENU4()");
	var s="<hr><img src='"+ReportFolder()+Menu4_YearMonth;
	if (Menu4_Page==0) s+="P1";else s+="P2";
	s+=".jpg"+NoCache();
	s+="'><hr>";
	WriteLayer("Stage",s);
	}

function MENU4DChange(num)
	{
	Menu4_Page=num;
	MENU4D();
	}
