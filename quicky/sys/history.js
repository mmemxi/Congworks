//--------------------------------------------------------------
var NewHistory=new Object();
NewHistory.Key="";
NewHistory.Filename="";
NewHistory.Marked=false;
//--------------------------------------------------------------
function OpenHistory()
	{
	var fc;
	var date=new Date;
	var yy=date.getFullYear();
	var mm=date.getMonth()+1;
	var dd=date.getDate();
	var h=date.getHours();
	var m=date.getMinutes();
	var s=date.getSeconds();
	if (mm<10) mm="0"+mm;else mm+="";
	if (dd<10) dd="0"+dd;else dd+="";
	if (h<10) h="0"+h;else h+="";
	if (m<10) m="0"+m;else m+="";
	if (s<10) s="0"+s;else s+="";
	NewHistory.Key=yy+mm+dd+h+m+s;
	NewHistory.Filename=HistoryFolder()+NewHistory.Key+".hs0";
	fc=fso.CreateTextFile(NewHistory.Filename,true);
	fc.WriteLine("Quicky "+Version+" 作業履歴：");
	fc.WriteLine("作業日："+yy+"年"+mm+"月"+dd+"日");
	fc.WriteLine("開始時刻："+h+"時"+m+"分"+s+"秒～");
	fc.WriteLine("===============================================================");
	fc.close();
	}

function AddHistory(cmd,str,keycommand)
	{
	var f,s;
	if (NewHistory.Key=="")	OpenHistory();
	if (keycommand)
		{
		cmd="●"+cmd;
		if (!NewHistory.Marked)
			{
			f=fso.GetFile(NewHistory.Filename);
			f.name=NewHistory.Key+".hs1";
			NewHistory.Filename=HistoryFolder()+NewHistory.Key+".hs1";
			NewHistory.Marked=true;
			}
		}
	else{
		cmd="○"+cmd;
		}
	var fc=fso.OpenTextFile(NewHistory.Filename,8,true);
	var date=new Date();
	var h=date.getHours();
	var m=date.getMinutes();
	var s=date.getSeconds();
	if (h<10) h="0"+h;else h+="";
	if (m<10) m="0"+m;else m+="";
	if (s<10) s="0"+s;else s+="";

	cmd+="("+h+"時"+m+"分"+s+"秒)";
	fc.WriteLine(cmd);
	if (str!="") fc.WriteLine("\t"+str);
	fc.close();
	}

function ViewHistoryList()
	{
	var s,i;
	var dir,files,file,basename,ext;
	var dt,tm,lbl,obj;
	var logs=new Array();

	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞メンテナンス＞履歴</span><br>"+hr());
	AddKey("Stage",0,"戻る","MENU3()");
	Keys[11]="MENU3()";

	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=50>作業日</td>";
	s+="<td align=center class=size2 width=50>開始時刻</td></tr>";

	dir=fso.GetFolder(HistoryFolder());
	files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		basename=fso.GetBaseName(file);
		ext=fso.GetExtensionName(file);
		ext=ext.toLowerCase();
		if ((ext!="hs0")&&(ext!="hs1")) continue;
		dt=basename.substring(0,8);
		tm=basename.substring(8,14);
		if ((isNaN(dt))||(isNaN(tm))) continue;

		obj=new Object();
		obj.date=dt.substring(0,4)+"/"+dt.substring(4,6)+"/"+dt.substring(6,8);
		obj.time=tm.substring(0,2)+":"+tm.substring(2,4)+":"+tm.substring(4,6);
		obj.sortkey=basename;
		obj.filename=file;
		if (ext=="hs1") obj.need=true;else obj.need=false;
		logs.push(obj);
		}
	logs.sort(History_sort);
	for(i=0;i<logs.length;i++)
		{
		s+="<tr style='cursor:pointer'";
		if (logs[i].need) s+=" bgcolor='#ffff00'";
		s+=" title='"+logs[i].sortkey+"の履歴の詳細を表示します' onclick='ViewHistory(\""+logs[i].filename+"\")'>";
		s+="<td align=center>"+logs[i].date+"</td>";
		s+="<td align=center>"+logs[i].time+"</td></tr>";
		}
	s+="</table>";
	WriteLayer("Stage",s);
	document.body.focus();
	}

function History_sort(a, b)
	{
	if (a.sortkey>b.sortkey) return -1;
	if (a.sortkey<b.sortkey) return 1;
	return 0;
	}

function ViewHistory(filename)
	{
	var fs=ReadFile(HistoryFolder()+filename);
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Quicky</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞メンテナンス＞履歴＞"+filename+"</span><br>"+hr());
	AddKey("Stage",0,"履歴一覧に戻る","ViewHistoryList()");
	Keys[11]="ViewHistoryList()";
	var s="<form onsubmit='return false'><textarea cols=120 rows=40 style='font-size:10px;'>"+fs+"</textarea></form>";
	WriteLayer("Stage",s);
	document.body.focus();
	}
