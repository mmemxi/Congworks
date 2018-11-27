//------------------------------------------------------------------------------------
//	集中インターホンメニュー
//------------------------------------------------------------------------------------
var Apart=new Array();
var ApartName=new Array();
var Menu5_Filter_status="";
var Menu5_Filter_kubun="";
var Menu5_Filter_kubuncount=0;
var Menu5_SortKey="区域番号";
var ABuilding="";
function MENU5()
	{
	HideLayer("BG");
	var logline=new Array();
	var today=new Date();
	var s,ds,sts,asts,text,p1,p2;
	var atbl=new Array();
	var nowstatus,bgc;
	var NameKey;
	var BTB;
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞集中インターホン</span><br>"+hr());
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
	Keys[11]="MainMenu()";
	for(i in kbn) delete kbn[i];
	Menu5_Filter_kubuncount=0;
	kbn["すべて"]=0;
	kubuncount=1;
	for(i in RSortkey) delete RSortkey[i];
	for(i in Apart) delete Apart[i];
	for(i in ApartName) delete ApartName[i];
	maxsort=0;

	var dir=fso.GetFolder(DataFolder());
	var folders=new Enumerator(dir.SubFolders);
	for(num in Cards)
		{
		kubun=Cards[num].kubun;
		if (!(kubun in kbn))
			{
			Menu5_Filter_kubuncount++;
			kbn[kubun]=Menu5_Filter_kubuncount;
			}
		BTB=Cards[num].RTB;
		for(i in BTB)
			{
			if (BTB[i].KBN1!="集中インターホン") continue;
			sds=ApartFile(BTB[i].Name);	//	sds=アパートのログファイル
			if (!fso.FileExists(sds))	//	まだログファイルがないなら作成する
				{
				fso.CreateTextFile(sds,true);
				}
			sts=GetApartmentStatus(BTB[i].Name);	//	物件の使用状況を取得
			if (sts!="")	atbl=sts.split(",");	//	0=使用者名 1=使用開始日 2=使用終了日 3=使用期限
				else {atbl[0]="";atbl[1]="";atbl[2]="";}
			j=maxsort;
			RSortkey[j]=new Object();
			RSortkey[j].num=j;
			switch(Menu5_SortKey)
				{
				case "区域番号":
					RSortkey[j].key=num*10000+(100+BTB[i].Num)*100+i;
					break;
				case "未使用日数順":
					if (sts=="")	//	一度も使っていない
						{
						RSortkey[j].key="a"+(num*10000+(100+BTB[i].Num)*100+i);
						}
					else{
						if (atbl[2]!="")	RSortkey[j].key="b"+(atbl[2]);		//	未使用
								else		RSortkey[j].key="c"+(atbl[1]);		//	使用中
						}
					break;
				case "使用開始日順":
					if (sts=="")	//	一度も使っていない
						{
						RSortkey[j].key="c"+(num*10000+(100+BTB[i].Num)*100+i);
						}
					else{
						if (atbl[2]!="")	RSortkey[j].key="b"+(99999999-atbl[2]);		//	未使用
								else		RSortkey[j].key="a"+(99999999-atbl[1]);		//	使用中
						}
					break;
				}
			Apart[j]=new Object();
			Apart[j].Map=num;
			Apart[j].Seq=BTB[i].Num;
			Apart[j].Id=i;
			Apart[j].Name=BTB[i].Name;
			Apart[j].Status=sts;								//	使用状況
			Apart[j].Person=BTB[i].Person;						//	件数
			Apart[j].Kbn=kubun;
			NameKey=BTB[i].Name;
			ApartName[NameKey]=new Object();
			ApartName[NameKey].Map=num;
			ApartName[NameKey].Seq=BTB[i].Num;
			ApartName[NameKey].Id=i;
			ApartName[NameKey].Status=sts;
			ApartName[NameKey].Index=j;
			ApartName[NameKey].Count=BTB[i].Person;				//	件数
			if (sts!="")	atbl=sts.split(",");	//	0=使用者名 1=使用開始日 2=使用終了日 3=使用期限
				else {atbl[0]="";atbl[1]="";atbl[2]="";}
			if ((sts!="")&&(atbl[2]=="")) Apart[j].Using=true;
				else Apart[j].Using=false;
			maxsort++;
			}
		}
	RSortkey.sort(Apartment_sort);

	//	一覧表---------------------------------------------------------------------
	s="<form onsubmit='return false'>";
	s="並び順：<select size=1 onChange='MENU5_Sort_Change(this.selectedIndex)'>";
	if (Menu5_SortKey=="区域番号") s+="<option selected>";else s+="<option>";
	s+="区域番号</option>";
	if (Menu5_SortKey=="未使用日数順") s+="<option selected>";else s+="<option>";
	s+="未使用日数順</option>";
	if (Menu5_SortKey=="使用開始日順") s+="<option selected>";else s+="<option>";
	s+="使用開始日順</option>";
	s+="</select><br>";
	s+="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=100>区分<br>";
	s+="<select size=1 onchange='MENU5_kubun_Change(this.selectedIndex)'>";
	for(i in kbn)
		{
		if (i=="すべて")
			{
			if (Menu5_Filter_kubun=="") s+="<option selected>";else s+="<option>";
			s+="すべて</option>";
			}
		else{
			if (Menu5_Filter_kubun==i) s+="<option selected>";else s+="<option>";
			s+=i+"</option>";
			}
		}
	s+="</select></td>";
	s+="<td align=center class=size2 width=30>区域</td>";
	s+="<td align=center class=size2 width=30>地図</td>";
	s+="<td align=center class=size2 width=220>物件名</td>";
	s+="<td align=center class=size2 width=40>件数</td>";
	s+="<td align=center class=size2 width=150>現在の状態<br>";
	s+="<select size=1 onchange='MENU5_status_Change(this.selectedIndex)'>";
	if (Menu5_Filter_status=="") s+="<option selected>";else s+="<option>";
	s+="すべて</option>";
	if (Menu5_Filter_status=="未使用") s+="<option selected>";else s+="<option>";
	s+="未使用のみ</option>";
	if (Menu5_Filter_status=="使用中") s+="<option selected>";else s+="<option>";
	s+="使用中のみ</oprion>";
	if (Menu5_Filter_status=="使用可能") s+="<option selected>";else s+="<option>";
	s+="使用可能</oprion>";
	s+="</select></td>";
	s+="</tr>";

	//	サマリ情報の収集
	SumCounts=0;SumUsing=0;SumFree=0;SumTotal=0;
	for(j=0;j<maxsort;j++)
		{
		i=RSortkey[j].num;
		if (Menu5_Filter_kubun!="")				//	群れ区分のフィルター
			{
			if (Menu5_Filter_kubun!=Apart[i].Kbn) continue;
			}
		if (!Apart[i].Using)
			{
			if (Menu5_Filter_status=="使用中") continue;
			}
		else{
			if (Menu5_Filter_status=="未使用") continue;
			if (Menu5_Filter_status=="使用可能") continue;
			}
		SumTotal++;
		if (Apart[i].Using) SumUsing++;else SumFree++;
		if ((!isNaN(Apart[i].Person))&&(Apart[i].Person!=""))
			{
			SumCounts+=parseInt(Apart[i].Person,10);
			}
		}
	s+="<tr><td colspan=4 bgcolor='#009900' style='font-size:12px;color:#ffffff;font-weight:bold;'>";
	s+="表示数("+SumTotal+")----使用中("+SumUsing+")/未使用("+SumFree+")</td>";
	s+="<td bgcolor='#009900' align=right style='font-size:12px;color:#ffffff;font-weight:bold;'>"+SumCounts+"</td>";
	s+="<td bgcolor='#009900' align=right style='font-size:12px;color:#ffffff;font-weight:bold;'>";
	s+="　</td></tr>";

	for(j=0;j<maxsort;j++)
		{
		i=RSortkey[j].num;
		asts=Apart[i].Status;
		if (asts!="")	atbl=asts.split(",");	//	0=使用者名 1=使用開始日 2=使用終了日 3=使用期限
			else {atbl[0]="";atbl[1]="";atbl[2]="";}
		if (Menu5_Filter_kubun!="")				//	群れ区分のフィルター
			{
			if (Menu5_Filter_kubun!=Apart[i].Kbn) continue;
			}
		ds="<tr style='cursor:pointer' class=size2>";
		ds+="<td title='この物件の地図を表示します' onClick='ViewApart(\""+Apart[i].Name+"\")'>";
		ds+=Apart[i].Kbn+"</td>";						//	区分
		ds+="<td align=right title='この物件の地図を表示します' onClick='ViewApart(\""+Apart[i].Name+"\")'>";
		ds+=Apart[i].Map+"</td>";						//	区域番号
		ds+="<td align=right title='この物件の地図を表示します' onClick='ViewApart(\""+Apart[i].Name+"\")'>";
		ds+=Apart[i].Seq+"</td>";						//	地図番号
		ds+="<td title='この物件の地図を表示します' onClick='ViewApart(\""+Apart[i].Name+"\")'>";
		ds+=Apart[i].Name+"</td>";						//	物件名
		if (Apart[i].Person=="") Apart[i].Person="???";
		ds+="<td align=right title='この物件の地図を表示します' onClick='ViewApart(\""+Apart[i].Name+"\")'>";
		ds+=Apart[i].Person+"</td>";			//	件数
		ds+="<td nowrap title='この物件の使用状況を表示します' onClick='";
		if (!Apart[i].Using)
			{
			if (Menu5_Filter_status=="使用中") continue;
			xd=CalcDays(atbl[2],"");
			if (xd<ConfigAll.BlankMin)
				{
				if (Menu5_Filter_status=="使用可能") continue;
				bc="#ffaaaa";
				ds+="alert(\"前回使用からの日数が足りません。\")'";
				}
			else{
				bc="#aaffff";
				ds+="MENU5E_Start(\""+Apart[i].Name+"\")'";
				}
			nowstatus="未使用("+xd+"日前)";
			}
		else{
			if (Menu5_Filter_status=="未使用") continue;
			if (Menu5_Filter_status=="使用可能") continue;
			bc="#ffff00";
			ds+="MENU5E_End(\""+Apart[i].Name+"\")'";
			nowstatus="使用中("+atbl[0]+"："+atbl[1].substring(4,6)+"/"+atbl[1].substring(6,8)+"～）";
			}
		ds+=" bgcolor=\""+bc+"\">"+nowstatus+"</td></tr>";
		s+=ds;
		}
	s+="</table></form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}
function Apartment_sort(a, b)
	{
	if (a.key>b.key) return 1;
	if (a.key<b.key) return -1;
	return 0;
	}
function MENU5_status_Change(num)
	{
	if (num==0) Menu5_Filter_status="";
	if (num==1) Menu5_Filter_status="未使用";
	if (num==2) Menu5_Filter_status="使用中";
	if (num==3) Menu5_Filter_status="使用可能";
	MENU5();
	}
function MENU5_kubun_Change(num)
	{
	var i;
	if (num==0) Menu5_Filter_kubun="";
	else{
		for (i in kbn)
			{
			if (kbn[i]==num) break;
			}
		Menu5_Filter_kubun=i;
		}
	MENU5();
	}
function MENU5_Sort_Change(num)
	{
	if (num==0) Menu5_SortKey="区域番号";
	if (num==1) Menu5_SortKey="未使用日数順";
	if (num==2) Menu5_SortKey="使用開始日順";
	MENU5();
	}

function ViewApart(Id)
	{
	var s,i,x,found,file,user;
	var d1,d2,p1,p2;
	var r;
	var overday;
	var scr="";
	var atbl=new Array();
	var num=ApartName[Id].Map;
	var seq=ApartName[Id].Seq;
	var inx=ApartName[Id].Id;
	var asts=ApartName[Id].Status;
	var vml=new Poly();
	var Bmap,sobj;
	var BTB;
	vml.mapsize=1;

	if (asts!="")	atbl=asts.split(",");	//	0=使用者名 1=使用開始日 2=使用終了日 3=使用期限
	else {atbl[0]="";atbl[1]="";atbl[2]="";atbl[3]="";}
	if ((atbl[2]!="")||(atbl[3]=="")) overday=0;else overday=atbl[3];
	user=atbl[0];

	BTB=Cards[num].RTB;
	ABuilding=ReadXMLFile(ApartXML(Id),true);
	SetRefusesToBuilding(1,BTB,num,false);
	r=GetImageInfo(PNGFile(num,seq));
	ClearKey();
	ClearLayer("Stage");
	MapZoom=false;
	file=fso.FileExists(PNGFile(num,seq));
	s=AddKeys(1,"編集","CloseFloatings();EditApart("+num+","+seq+","+inx+")");
	s+=AddKeys(0,"戻る","CloseFloatings();MENU5()");
	FloatingMenu.Title=Id;
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,100);
	Keys[11]="CloseFloatings();MENU5()";
	RefuseExit=Id;

	s="";
	if (file)
		{
		s+="<img src='"+PNGFile(num,seq)+"' onload='ImageMap.Adjust()'>";
		}
	else s+="（画像データがありません）";
	scr=s;
	//	画像サイズの取得
	Imgx=r.x;
	Imgy=r.y;
	vml.width=r.x;
	vml.height=r.y;
	//	特記情報を重ねる
	s="";

		i=inx;
		//	網掛けの合成
		if (BTB[i].Position!="")
			{
			vcmd="CloseFloatings();EditApart("+num+","+seq+","+inx+")";
			vml.AddObject(BTB[i].Position,vcmd,Id,1,1,"");
			}
		if (BTB[i].Writing!="")
			{
			ss=BTB[i].Writing+",,,,";
			rx=ss.split(",");
			wstr=rx[0];
			wsize=parseInt(rx[1],10);
			x1=parseInt(rx[2],10);
			y1=parseInt(rx[3],10);
			s+="<div style='cursor:pointer;position:absolute;z-index:5;font-size:"+wsize+"px;white-space:nowrap;color:#0000ff;";
			s+="left:"+x1+"px;top:"+y1+"px;' ";
			s+="onClick='CloseFloatings();EditApart("+num+","+seq+","+inx+");'>"+wstr+"</div>";
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
	//	ビル情報を重ねる
	Bmap="";
	if (ABuilding!="")
		{
		s+=CreateBuildingImage(num,seq,1,0,"",1,1,0);
		sobj=CreateBuildingImage(num,seq,1,0,"",1,1,4);
		Bmap+="<area shape='poly' nohref onClick='CloseFloatings();EditApart("+num+","+seq+","+inx+")' coords='";
		Bmap+=sobj.x+","+sobj.y+","+(sobj.x+sobj.width)+","+sobj.y+",";
		Bmap+=(sobj.x+sobj.width)+","+(sobj.y+sobj.height)+",";
		Bmap+=sobj.x+","+(sobj.y+sobj.height)+","+sobj.x+","+sobj.y;
		Bmap+="' onmouseover='VMLShape_MouseOver(\"この物件を編集します\")'";
		Bmap+=" onmousemove='VMLShape_MouseOver(\"この物件を編集します\")'";
		Bmap+=" onmouseout='VMLShape_MouseOut()'";
		Bmap+="'>";
		}
	scr+=s;
	ImageMap.Content=SetContent(scr,vml,Imgx,Imgy,Bmap);
	ImageMap.Create("MAP",window["Stage"],document.documentElement.clientWidth,document.documentElement.clientHeight-40);
	window.scrollTo(0,0);
	document.body.focus();
	}
function EditApart(num,seq,inx)
	{
	RRefuse=num;
	RRinx=inx;
	PreEditRefuses(num,inx);
	}
function GetApartmentStatus(id)
	{
	var s,i,j;
	var ary=new Array();
	var alogs=new Array();
	s=ReadFile(ApartFile(id));
	if (s=="") return s;
	ary=s.split(/\r\n/);
	j=ary.length-1;
	while(1==1)
		{
		if (ary[j]!="") break;
		j--;
		if (j==0) break;
		}
	return ary[j];
	}
//------------------------------------------------------------------------------------
//	区域の利用状況更新
//------------------------------------------------------------------------------------
function MENU5E_Start(Id)
	{
	var s,ymd;
	var today=new Date();
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU5()";
	window.scrollTo(0,0);
	s="<div class=size5>「"+Id+"」の使用開始</div>"+hr();
	s+="<div class=size3><form onsubmit='return false'>";
	s+="使用者名："+Field(0,30,true,1)+"<br>";
	s+="貸出日：<input type=text size=12 style='ime-mode:disabled;' onfocus='FLDFocus=1' onChange='CalcOverDay(document.forms[0].elements[1].value,false)'><br>";
	FLDATTR[1]=3;
	s+="<div class=size2 id=OVERRAY>終了期限：-</div><br>";
	s+="<input type=button value='使用開始' onClick='MENU5E_Start_Exec(\""+Id+"\")'>";
	s+="<input type=button value='ロールバック' onClick='MENU5E_Start_RollBack(\""+Id+"\")'>";
	s+="<input type=button value='戻る' onClick='MENU5()'></form>";
	WriteLayer("Stage",s);
	var LimitStartDay=GetAvailableDate(Id);	//	この日以降が使用可能である日付を取得
	s=DrawCalender(false,LimitStartDay);
	WriteLayer("Stage",s);
	s=MakeLogs2(Id);
	WriteLayer("Stage",s);
	ymd=(today.getMonth()+1)+"/"+today.getDate();
	document.forms[0].elements[1].value=ymd;
	s=UserPad2();
	WriteLayer("Stage",s);
	Focus(0);
	}
function MENU5E_Start_Exec(Id)
	{
	var a,b,bcnt,bp,bp2,cmf;
	var ymd,maxlogs,text;
	var stream,text,s;
	var today=new Date();
	var lines=new Array();
	var logline=new Array();
	var lastdata;
	var overday,counts;
	var num,seq,inx;

	a=document.forms[0].elements[0].value;
	b=document.forms[0].elements[1].value;
	if (CheckUser(a)) return;
	ymd=CheckDate("貸出日",b);
	if (ymd==true) return;
	lastdata=0;
	text=GetApartmentStatus(Id);
	if (text!="")
		{
		logline=text.split(",");
		lastdata=logline[2];
		if (ymd<lastdata)
			{
			alert("貸出日が前回の終了日より古い日付は指定できません。");
			return;
			}
		}
	num=ApartName[Id].Map;
	seq=ApartName[Id].Seq;
	inx=ApartName[Id].Id;
	counts=ApartName[Id].Count;
	//	他のユーザーに横取りされなかったか？
	if (!isAvailable("A",num,seq,Id))
		{
		alert("貸出処理中に、他のユーザーによって貸出が実行されました。\n道理にかなった態度を示し、進んで譲りましょう。");
		ClearLayer("Stage");
		MENU5();
		return;
		}

	//	外部プログラムとして呼び出す
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="rentA.wsf "+congnum+":"+a+":"+num+":"+seq+":"+Id;
	var objResult=RunWSF(cmd);
	if (objResult!="ok")
		{
		alert("アパート貸し出し処理中にエラーが発生し、処理が失敗しました。");
		}

	var pdffile=GetMyMap(num,seq,Id,a);
	if (pdffile=="")
		{
		alert("貸し出し地図の印刷に失敗しました。");
		}
	else{
		PrintApart(num,seq,Id,pdffile);
		}
	MENU5();
	}

function MENU5E_End(Id)
	{
	var i,text,maxlogs,seq;
	var sts=new Array();
	text=GetApartmentStatus(Id);
	sts=text.split(",");
	var lastuse=0;
	var lastuser="";
	var nowusing=false;
	var overday="";
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU5()";
	window.scrollTo(0,0);
	s="<div class=size5>「"+Id+"」の使用状況</div>"+hr();
	s+="<div class=size3><form onsubmit='return false'>";
	s+="使用者名："+Field(0,30,true,1)+"<br>";
	s+="貸出日："+Field(1,12,false,2)+"<br>";
	s+="終了期限："+Field(2,12,false,2)+"<br>";
	s+="終了日："+Field(3,12,false,2)+"<br>";
	s+="<input type=button value='更新' onClick='MENU5E_End_Exec(\""+Id+"\")'>";
	s+="<input type=button value='ロールバック' onClick='MENU5E_End_Cancel(\""+Id+"\")'>";
	s+="<input type=button value='戻る' onClick='MENU5()'></form>";
	WriteLayer("Stage",s);
	s=DrawCalender(false,sts[1]);
	WriteLayer("Stage",s);

	s="<div style='position:absolute;top:80px;left:600px;z-index:2;'>";
	s+=MakeLogs2(Id)+"</div>";
	WriteLayer("Stage",s);
	
	document.forms[0].elements[0].value=sts[0];					//	使用者
	document.forms[0].elements[1].value=SplitDate(sts[1]);		//	貸し出し日
	document.forms[0].elements[2].value=SplitDate(sts[3]);		//	終了期限
	document.forms[0].elements[3].value=SplitDate(sts[2]);		//	終了日
	Focus(3);
	}
function MENU5E_End_Exec(Id)
	{
	var a,b,c,cnf,c1,c2,d1,d2,s,ymd,cnf,endcount;
	var i,j,text,maxlogs,seq;
	var lines=new Array();
	var sts=new Array();
	var cmpday1,cmpday2;
	cmpday1=99999999;cmpday2=0;

	a=document.forms[0].elements[0].value;
	b=document.forms[0].elements[1].value;
	c=document.forms[0].elements[2].value;
	if (CheckUser(a)) return;
	ymd=CheckDate("貸出日",b);
	if (ymd==true) return;
	overday="";
	if (c!="")
		{
		overday=CheckDate("終了期限",c);
		if (overday==true) return;
		}
	c1=document.forms[0].elements[3].value;
	c1=c1.trim();
	if (c1=="")	d1="";
	else	{
			d1=CheckDate("終了日("+i+")",c1);
			if (d1==true) return;
			if (d1<ymd)
				{
				alert("終了日が貸出日より前になっています。");
				return;
				}
			}
	text=ReadFile(ApartFile(Id));
	lines=text.split(/\r\n/);
	maxlogs=lines.length;
	var stream = fso.CreateTextFile(ApartFile(Id),true);
	for(i=0;i<maxlogs-1;i++)
		{
		stream.WriteLine(lines[i]);
		}
	s=a+","+ymd+","+d1+","+overday;
	stream.WriteLine(s);
	stream.close();
	CreateSummaryofApartment();
	RemoveMyMap(a,"A",0,0,Id);
	MENU5();
	}
function MENU5E_Start_RollBack(Id)
	{
	var a,b,s,i,j,cnf;
	var i,text,maxlogs,lastdata;
	var lines=new Array();
	var logline=new Array();
	cnf=confirm("「"+Id+"」の状態を、前回の使用完了直前の状態に戻します。よろしいですか？");
	if (!cnf) return;
	lastdata=0;
	text=ReadFile(ApartFile(Id));
	if (text=="")
		{
		alert("これ以上前の状態に戻せません。");
		return;
		}
	lines=text.split(/\r\n/);
	j=lines.length-1;
	if (lines[j]=="") j--;
	logline=lines[j].split(",");
	lines[j]=logline[0]+","+logline[1]+",,"+logline[3];
	maxlogs=lines.length;
	var stream = fso.CreateTextFile(ApartFile(Id),true);
	for(i=0;i<maxlogs;i++)
		{
		if (lines[i]=="") break;
		stream.WriteLine(lines[i]);
		}
	stream.close();
	s="建物名称＝"+Id;
	CreateSummaryofApartment();
	MENU5();
	}

function MENU5E_End_Cancel(Id)
	{
	var cmf,userid,pdffile,ll;
	cmf=confirm("「"+Id+"」の使用中状態を取り消します。よろしいですか？");
	if (!cmf) return;

	//	ユーザー名を取得する
	var text=ReadFile(ApartFile(Id));
	var s=text.split("\r\n");
	var l=s.length;
	ll=s[l-1];
	if (ll=="") ll=s[l-2];
	var tbl=ll.split(",");
	userid=tbl[0];			//	最新使用ユーザー名

	//	PDFファイル名を取得する
	pdffile=GetMyMap("","",Id,userid);
	pdffile=fso.GetFileName(pdffile);

	//	外部プログラムとして呼び出す
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="cancel.wsf "+congnum+" "+userid+" "+pdffile;
	var objResult=RunWSF(cmd);
	if (objResult.indexOf("NO=",0)!=-1)
		{
		alert("アパート返却処理中にエラーが発生し、処理が失敗しました。");
		}
	MENU5();
	}
function MakeLogs2(Id)
	{
	var logs=new Array();
	var lines=new Array();
	var logline=new Array();
	var maxlogs=0;
	var logcnt=0;
	var BFRDAT;
	var BFRUSR;
	var BFRSTR,BFREND;
	var s;
	var text=ReadFile(ApartFile(Id));
	lines = text.split(/\r\n/);
	maxlogs=lines.length;
	for(i=0;i<maxlogs;i++)
		{
		if (lines[i]=="") break;
		logline=lines[i].split(",");
		if (logline[2]=="") continue;
		logcnt++;
		logs[logcnt]=new Object();
		logs[logcnt].USR=logline[0];
		logs[logcnt].STR=logline[1];
		logs[logcnt].END=logline[2];
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
