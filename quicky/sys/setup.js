//-----------------------------------------------------------------------------
function SQliteSetup()
	{
//	CreatePublicList();		//	2018/10新設
//	CreatePublicLogs();		//	2018/11/16新設
//	CreateReportLogs();		//	2018/10新設
//	CreateUsers();			//	2018/10新設
//	CreateSpots();			//	2018/11新設
//	CreateConfig();			//	2018/11/14新設
//	CreateBuildingFormat();	//	2018/11/14新設未完成
	}
//-----------------------------------------------------------------------------
function CreatePublicLogs()
	{
	var dir,folders,fitem,num;
	var log,obj,i;
	var f;
	var arr=new Array();

	//	以前の定義を削除する
	SQ_Exec("delete from PublicLogs where congnum="+congnum+";");

	//	全区域をループする
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);

		f=LogXML(num);
		log=ReadXMLFile(f,false);
		if (log=="")
			{
			log=NewLog();
			}
		else{
			if (!("History" in log))
				{
				log.History=new Array();
				}
			}
		obj=new Object();
		obj.congnum=congnum;
		obj.num=num;
		obj.status=log.Status;
		obj.userid=log.Latest.User;
		obj.startday=log.Latest.Rent;
		obj.endday=log.Latest.End;
		obj.limitday=log.Latest.Limit;
		obj.body=JSON.stringify(log.History).replace(/\"/g,"'");
		arr.push(obj);
		}
	SQ_Insert("PublicLogs",arr);
	}
//-----------------------------------------------------------------------------
// 未完成
//-----------------------------------------------------------------------------
function CreateBuildingFormat()
	{
	var dir,folders,files,fitem,num;
	var fullpath,ext;
	var bobj,obj,cobj,i,n,fn;
	var arr=new Array();

	//	以前の定義を削除する
	SQ_Exec("delete from BuildingFormat where congnum="+congnum+";");

	//	全区域をループする
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		if (fso.FileExists(BuildingFile(num)))
			{
			bobj=ReadXMLFile(BuildingFile(num),true);
			for(i=0;i<bobj.building.length;i++)
				{
				n=bobj.building[i].id;
				obj=new Object();
				obj.congnum=congnum;
				obj.type=1;
				obj.num=num;
				obj.seq=bobj.building[i].map;
				obj.name=n;
				obj.body=JSON.stringify(bobj.building[i]).replace(/\"/g,"'");
				arr.push(obj);
				}
			}
		if (fso.FileExists(ConfigXML(num)))
			{
			cobj=ReadXMLFile(ConfigXML(num),false);
			if ("RTB" in cobj)
				{
				for(i=0;i<cobj.RTB.length;i++)
					{
					if (cobj.RTB[i].KBN1!="集中インターホン") continue;
					fullpath=ApartFolder()+cobj.RTB[i].Name+".xml";
					if (!fso.FileExists(fullpath)) continue;
					bobj=ReadXMLFile(fullpath,false);
					obj=new Object();
					obj.congnum=congnum;
					obj.type=2;
					obj.num=num;
					obj.seq=cobj.RTB[i].Num;
					obj.name=cobj.RTB[i].Name;
					obj.body=JSON.stringify(bobj).replace(/\"/g,"'");
					arr.push(obj);
					}
				}
			}
		}

	//	Apartmentフォルダを精査する（個人用集合住宅と全体集合住宅から）
	dir=fso.GetFolder(ApartFolder());
	files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		fitem=files.item().Name+"";
		fullpath=ApartFolder()+fitem;
		ext=fso.GetExtensionName(fitem).toLowerCase();
		if (ext!="xml") continue;
		n=fso.GetBaseName(fitem);
		bobj=ReadXMLFile(fullpath,false);
		if (!("Type" in bobj)) continue;
		obj=new Object();
		obj.congnum=congnum;
		obj.type=3;
		obj.num=bobj.Num;
		obj.seq=bobj.Seq;
		obj.name=n;
		obj.body=JSON.stringify(bobj).replace(/\"/g,"'");
		arr.push(obj);
		}
	SQ_Insert("BuildingFormat",arr);
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
function CreateSpots()
	{
	var i;
	var s=ReadXMLFile(AllFolder()+"spots.xml",true);
	if (s=="")
		{
		Spots=new Array();
		}
	else
		{
		Spots=clone(s.Spots);
		for(i=0;i<Spots.length;i++) Spots[i].active=false;
		}
	WriteJSON(congnum,"spots","",Spots);
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
	WriteJSON(congnum,"config","all",ConfigAll);
	}
