//-----------------------------------------------------------------------------
function SQliteSetup()
	{
//	CreatePublicList();
//	CreateReportLogs();
//	CreateUsers();
//	CreateConfig();
//	LogSetUp();
	}
//-----------------------------------------------------------------------------
function CreatePublicList()
	{
	var obj;
	var carray=new Array();

	//	以前の定義を削除する
	SQ_Exec("delete from PublicList where congnum="+congnum+";");

	//	全区域をループする
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		obj=CreatePublicList_One(num);
		carray.push(obj);
		}
	SQ_Insert("PublicList",carray);
	}
//-----------------------------------------------------------------------------
function CreatePublicList_One(num)
	{
	var card=new Object();
	var cobj=ReadXMLFile(ConfigXML(num),false);
	card.congnum=congnum;					//	会衆番号
	card.num=num;							//	区域番号
	card.name=cobj.name;					//	区域名
	card.kubun=cobj.kubun;					//	区域区分
	card.maps=cobj.count;					//	地図枚数
	if ("RTB" in cobj)	card.refuses=cobj.RTB.length;	//	特記軒数
				else	card.refuses=0;
	card.buildings=cobj.Buildings.Count;	//	物件数
	card.persons=cobj.Buildings.House;		//	世帯数
	card.inuse=false;						//	使用中
	card.userid="unknown";					//	使用者
	card.startday=0;						//	使用開始日
	card.endday=0;							//	使用終了日
	card.limitday=0;						//	終了期限日

	var log=ReadXMLFile(NumFolder(num)+"log.xml",false);
	if (log!="")
		{
		if ("Status" in log)
			{
			card.userid=log.Latest.User;
			card.startday=log.Latest.Rent;
			card.limitday=log.Latest.Limit;
			if (log.Status=="Using")
				{
				card.inuse=true;
				card.endday=0;
				}
			else{
				card.inuse=false;
				card.endday=log.Latest.End;
				}
			}
		}
	else{
		card.endday="20000101";
		}
	return card;
	}
//-----------------------------------------------------------------------------
function SQGetDate(str)
	{
	var tbl=str.split("/");
	var yyyy=parseInt(tbl[0],10);
	var mm=parseInt(tbl[1],10);
	var dd=parseInt(tbl[2],10);
	var result=yyyy*10000+mm*100+dd;
	return result;
	}
//-----------------------------------------------------------------------------
// CreateReportLogs()
//-----------------------------------------------------------------------------
function CreateReportLogs()
	{
	var i,j;
	var p1,p2,p3;
	var obj=new Array();

	SQ_Exec("drop table ReportLogs;");
	SQ_Exec("create table ReportLogs (congnum integer,execdate integer,range_start integer,range_end integer);");

	var text=ReadFile(ReportLog());
	var lines = text.split(/\r\n/);
	j=0;
	for(i=0;i<lines.length;i++)
		{
		p1=lines[i].indexOf("(",0);
		if (p1==-1) break;
		p2=lines[i].indexOf("～",p1);
		p3=lines[i].indexOf(")",p2);
		obj[j]=new Object();
		obj[j].congnum="34173";
		obj[j].execdate=SQGetDate(lines[i].substring(0,p1));
		obj[j].range_start=SQGetDate(lines[i].substring(p1+1,p2));
		obj[j].range_end=SQGetDate(lines[i].substring(p2+1,p3));
		j++;
		}
	SQ_Insert("ReportLogs",obj);
	}
//-----------------------------------------------------------------------------
//	CreateUsers
//-----------------------------------------------------------------------------
function CreateUsers()
	{
	SQ_Exec("drop table CWUsers;");
	SQ_Exec("create table CWUsers(congnum integer,userid text,authority text,primary key(congnum,authority,userid));");
	var f=ReadFile(DataFolder()+"users.txt");
	var tbl1=f.split("\r\n");
	f=ReadFile(DataFolder()+"users2.txt");
	var tbl2=f.split("\r\n");
	var out=new Array();
	var obj;

	//	会衆用ユーザー一覧
	for(i=0;i<tbl1.length;i++)
		{
		s=tbl1[i];
		if (s=="") continue;
		obj=new Object();
		obj.congnum=congnum;
		obj.userid=s;
		obj.authority="publicservice";
		out.push(obj);
		}

	//	個人用ユーザー一覧
	for(i=0;i<tbl2.length;i++)
		{
		s=tbl2[i];
		if (s=="") continue;
		obj=new Object();
		obj.congnum=congnum;
		obj.userid=s;
		obj.authority="personalservice";
		out.push(obj);
		}
	SQ_Insert("CWUsers",out);
	}
//-----------------------------------------------------------------------------
// CreateConfig
//-----------------------------------------------------------------------------
function CreateConfig()
	{
	var cfg=new Object();
	ExecSQlite("DELETE FROM CWConfig;");
	cfg.congnum=34173;
	cfg.AutoEndDefault=60;
	cfg.AutoEndApart=60;
	cfg.BlankMin=28;
	cfg.ChiefClient=-2009870003;
	cfg.RemoteHost="ftp.congworks.890m.com";
	cfg.RemoteUser="u616822746";
	cfg.RemotePassword="jw34173";
	cfg.RemoteDirectory="/public_html";
	InsertSQlite("CWConfig",cfg);
	}
//-----------------------------------------------------------------------------
// LogSetUp()
//-----------------------------------------------------------------------------
function LogSetUp()
	{
	var i,j,k=0;
	var obj=new Array();
	var log;
	alert("LogSetup:Start");
	ExecSQlite("DELETE FROM Preaching_PublicLog;");
	for(i in Cards)
		{
		log=LoadLog(i);
		if (log.History.length==0) continue;
		for(j=0;j<log.History.length;j++)
			{
			obj[k]=new Object();
			obj[k].congnum=congnum;
			obj[k].num=i;
			obj[k].user=log.History[j].User;
			obj[k].start=log.History[j].Rent;
			obj[k].end=log.History[j].End;
			obj[k].endlmt=log.History[j].Limit;
			k++;
			}
		}
	InsertSQlite("Preaching_PublicLog",obj);
	alert("LogSetup:End");
	}
