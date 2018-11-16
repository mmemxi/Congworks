//-----------------------------------------------------------------------------
function SQliteSetup()
	{
//	CreatePublicList();		//	2018/10�V��
//	CreatePublicLogs();		//	2018/11/16�V��
//	CreateReportLogs();		//	2018/10�V��
//	CreateUsers();			//	2018/10�V��
//	CreateSpots();			//	2018/11�V��
//	CreateConfig();			//	2018/11/14�V��
//	CreateBuildingFormat();	//	2018/11/14�V�ݖ�����
	}
//-----------------------------------------------------------------------------
function CreatePublicLogs()
	{
	var dir,folders,fitem,num;
	var log,obj,i;
	var f;
	var arr=new Array();

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from PublicLogs where congnum="+congnum+";");

	//	�S�������[�v����
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
// ������
//-----------------------------------------------------------------------------
function CreateBuildingFormat()
	{
	var dir,folders,files,fitem,num;
	var fullpath,ext;
	var bobj,obj,cobj,i,n,fn;
	var arr=new Array();

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from BuildingFormat where congnum="+congnum+";");

	//	�S�������[�v����
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
					if (cobj.RTB[i].KBN1!="�W���C���^�[�z��") continue;
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

	//	Apartment�t�H���_�𐸍�����i�l�p�W���Z��ƑS�̏W���Z���j
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

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from PublicList where congnum="+congnum+";");

	//	�S�������[�v����
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
	card.congnum=congnum;					//	��O�ԍ�
	card.num=num;							//	���ԍ�
	card.name=cobj.name;					//	��於
	card.kubun=cobj.kubun;					//	���敪
	card.maps=cobj.count;					//	�n�}����
	if ("RTB" in cobj)	card.refuses=cobj.RTB.length;	//	���L����
				else	card.refuses=0;
	card.buildings=cobj.Buildings.Count;	//	������
	card.persons=cobj.Buildings.House;		//	���ѐ�
	card.inuse=false;						//	�g�p��
	card.userid="unknown";					//	�g�p��
	card.startday=0;						//	�g�p�J�n��
	card.endday=0;							//	�g�p�I����
	card.limitday=0;						//	�I��������

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
		p2=lines[i].indexOf("�`",p1);
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

	//	��O�p���[�U�[�ꗗ
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

	//	�l�p���[�U�[�ꗗ
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
