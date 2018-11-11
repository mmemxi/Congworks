//------------------------------------------------------------------------------------
//	報告書作成メニュー
//------------------------------------------------------------------------------------
var ReportBody=new Array();
var ReportHTML="";
var ReportPage=0;
var ReportMax=0;
var ReportRayout=new Array();
//------------------------------------------------------------------------------------
function MENU2()
	{
	HideLayer("BG");
	var today=new Date();
	var ty,tm,td,tymd;
	var s;
	var r=new Object();
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MainMenu()";

	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞報告書作成</span><br>"+hr());
	
	s="<form onsubmit='MENU2Exec();return false;'>報告書を作成する日付範囲を指定してください：<br>";
	s+=Field(0,12,false,2)+"～"+Field(1,12,false,2);
	s+="<input type=button value='報告書の作成' onClick='MENU2Exec()'>";
	s+="<br>"+hr();
	WriteLayer("Stage",s);
	s="<input type=button value='区域割り当ての記録用紙(S-13)を印刷する' onClick='PrintS13()' style='width:300px'><br>";
	s+="<input type=button value='メインメニューへ戻る' onClick='MainMenu()' style='width:300px'></form>";
	WriteLayer("Stage",s);

	ty=today.getFullYear();
	tm=today.getMonth()+1;
	td=today.getDate();
	tymd=parseInt(ty,10)*10000+parseInt(tm,10)*100+parseInt(td,10);
	r=ReportLogView();
	WriteLayer("Stage",r.HTML);
	document.forms[0].elements[0].value=SplitDate(r.Last);
	document.forms[0].elements[1].value=SplitDate(tymd+"");
	Focus(0);
	}
function PrintS13()
	{
	ClearKey();
	ClearLayer("Stage");
	var s="区域割り当ての記録用紙(S-13)を印刷しています…";
	WriteLayer("Stage",s);
	setTimeout("PrintS13_Exec()",10);
	}
//------------------------------------------------------------------------------------
//	報告書の作成処理本番
//------------------------------------------------------------------------------------
function MENU2Exec()
	{
	var today=new Date();
	var d1=document.forms[0].elements[0].value;
	var d2=document.forms[0].elements[1].value;
	var c1,c2;
	var s;
	var tymd=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();

	//	入力内容のチェック
	c1=CheckDate("開始日",d1);
	if (c1==true) return;
	c2=CheckDate("終了日",d2);
	if (c2==true) return;
	if (c1>c2)
		{
		alert("開始日が終了日より後になっています。");
		return;
		}

	//	レポート作成ログに追記
	var insobj=new Object();
	insobj.congnum=congnum;
	insobj.execdate=tymd;
	insobj.range_start=c1;
	insobj.range_end=c2;
	SQ_Insert("ReportLogs",insobj);

	//	レポートの作成開始
	LoadAllCards();
	var y=0;
	var x=0;
	var yy=0;
	i=0;ReportRayout=new Array();
	for(y=0;y<Cards.length;y++)
		{
		if (!(y in Cards)) continue;
		ReportRayout[i]=y;
		i++;
		}

	for(y=0;y<ReportRayout.length;y+=5)
		{
		s="<div style='position:absolute;width:900px;z-index:5;top:8px;left:1600px;";
		s+="text-align:right;font-size:40px'>";
		s+=SplitDate(tymd)+"作成("+SplitDate(c1)+"～"+SplitDate(c2)+")</div>";
		s+="<div style='position:absolute;z-index:2;top:0px;left:0px;'>";
		for(x=0;x<=4;x++)
			{
			if (y+x>=ReportRayout.length) break;
			i=ReportRayout[y+x];
			ssx=Cards[i].name;
			if (ssx.length>8) ssx=ssx.substring(0,8);
			s+=WriteReportCell(x,0,3,i+":"+ssx);
			s+=GetReportDetail(i,c1,c2,x);
			}
		ReportBody[yy]=s;
		yy++;
		}
	ReportPage=0;ReportMax=yy-1;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU2End()";
	s="";
	s+=AddKeys(1,"すべて印刷する","PrintReport(-1)");
	s+=AddKeys(2,"このページを印刷する","PrintReport(0)");
	s+=AddKeys(3,"前のページ","MENU2Prev()");
	s+=AddKeys(4,"次のページ","MENU2Next()");
	s+=AddKeys(0,"戻る","MENU2End()");
	FloatingMenu.Title="報告書メニュー";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,190);
	window.scrollTo(0,0);
	RscrollX=0;RscrollY=0;
	window.onscroll=WriteMap_Scroll;
	MENU2Disp();
	}

function MENU2Disp()
	{
	var s,i,Bmap="";
	var vml=new Poly();
	var r=GetImageInfo(SysFolder()+"s13a.jpg");
	var Imgx=r.x;
	var Imgy=r.y;
	vml.width=r.x;
	vml.height=r.y;
	vml.mapsize=1;
	ClearLayer("Stage");
	s="<img src=\""+SysFolder()+"s13a.jpg\" onload='ImageMap.Adjust()'>";
	s+=ReportBody[ReportPage];
	ImageMap.Content=SetContent(s,vml,Imgx,Imgy,Bmap);
	ImageMap.Create("MAP",window["Stage"],document.documentElement.clientWidth,document.documentElement.clientHeight-40);
	}

function MENU2Prev()
	{
	if (ReportPage>0)
		{
		ReportPage--;
		MENU2Disp();
		}
	}

function MENU2Next()
	{
	if (ReportPage<ReportMax)
		{
		ReportPage++;
		MENU2Disp();
		}
	}

function MENU2End()
	{
	CloseFloatings();
	window.onscroll="";
	MainMenu();
	}
//------------------------------------------------------------------------------------
//	報告書作成履歴表示の作成
//  戻り値：オブジェクト
//      result.HTML=表示するHTML
//      result.Last=最終作成日＋１
//      
//------------------------------------------------------------------------------------
function ReportLogView()
	{
	var s;
	var result=new Object();
	var buf=SQ_Read("ReportLogs","congnum="+congnum,"execdate desc");

	s="<div style='width:400px;height:120px;background-color:#ffaaff;overflow-y:scroll;border:ridge 2px black;padding:4px;'>";
	s+="<font color=blue><b>報告書作成履歴：</b></font><br><span style='font-size:14px'>";

	result.Last="";

	if (buf.length>0)
		{
		for(i=0;i<buf.length;i++)
			{
			if (i==0)
				{
				result.Last=AddDays(buf[i].range_end,1);
				}
			s+=SplitDate(buf[i].execdate)+"("+SplitDate(buf[i].range_start)+"～"+SplitDate(buf[i].range_end)+")<br>";
			}
		}
	else{
		s+="履歴がありません。";
		}
	s+="</div>";
	result.HTML=s;
	return result;
	}

function GetReportDetail(num,date1,date2,x)
	{
	var logs=new Array();
	var lines=new Array();
	var logline=new Array();
	var maxlogs=0;
	var logcnt=0;
	var BFRDAT;
	var BFRUSR;
	var BFRSTR,BFREND;
	var s,sb;
	var obj,l;

	obj=LoadLog(num);
	l=obj.History.length;
	if (l==0) return "";
	for(i in obj.History)
		{
		if (obj.History[i].Status=="Using") continue;
		if ((obj.History[i].End<date1)||(obj.History[i].End>date2)) continue;
		logs[logcnt]=new Object();
		logs[logcnt].USR=obj.History[i].User;
		logs[logcnt].STR=obj.History[i].Rent;
		logs[logcnt].END=obj.History[i].End;
		logcnt++;
		}
	if (logcnt>25) logcnt=25;	//	２５明細までしか印字できない。
	s="";
	for(i=0;i<logcnt;i++)
		{
		s+=WriteReportCell(x,i,0,logs[i].USR);
		s+=WriteReportCell(x,i,1,SplitDate4(logs[i].STR));
		s+=WriteReportCell(x,i,2,SplitDate4(logs[i].END));
		}
	return s;
	}
function SplitDate4(dat)
	{
	var s,y,m,d;
	dat=dat+"";
	if (dat=="0000") return "";
	y=dat.substring(2,4);
	m=dat.substring(4,6);
	d=dat.substring(6,8);
	s=y+"/"+m+"/"+d;
	return s;
	}

function WriteReportCell(x,y,pos,str)
	{
	var vx,vy,s,fsize;
	s="<div style='position:absolute;z-index:3;vertical-align:bottom;white-space:nowrap;";
	switch(pos)
		{
		case 0:
			s+="width:446px;height:50px;text-align:center;";
			vx=212+(Math.floor(x*454.25));
			vy=356+(Math.floor(y*112.85));
			fsize=50;
			break;
		case 1:
			s+="width:222px;height:53px;text-align:center;";
			vx=212+(Math.floor(x*454.25));
			vy=416+(Math.floor(y*112.85));
			fsize=44;
			break;
		case 2:
			s+="width:222px;height:53px;text-align:center;";
			vx=437+(Math.floor(x*454.25));
			vy=416+(Math.floor(y*112.85));
			fsize=44;
			break;
		case 3:
			s+="width:300px;height:60px;";
			vx=330+(x*455);
			vy=290;
			fsize=36;
			break;
		default:
			break;
		}
	s+="left:"+vx+"px;top:"+vy+"px;";
	s+="font-size:"+fsize+"px;";
	s+="'>"+str+"</div>";
	return s;
	}
