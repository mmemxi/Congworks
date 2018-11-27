//-----------------------------------------------------------------------------
function SQliteSetup()
	{
//	CreateCards();			//	�J�[�h���̈ڍs		2018/11/22�V�݁A3.05�Z�b�g�A�b�v���ɕK�v
//	CreateMarkers();		//	�}�[�J�[���̈ڍs		2018/11/25�V�݁A3.05�Z�b�g�A�b�v���ɕK�v
//	CreatePublicLogs();		//	log.xml�̈ڍs			2018/11/16�V��	3.04�Z�b�g�A�b�v���Ɏ��s
//	CreatePublicList();		//	��O�p���ꗗ�̍쐬	2018/10�V��		3.04�Z�b�g�A�b�v���Ɏ��s
//	CreateReportLogs();		//	���|�[�g�쐬���O�̍쐬	2018/10�V��		3.04�Z�b�g�A�b�v���Ɏ��s
//	CreateUsers();			//	���[�U�[���̍쐬		2018/10�V��		3.04�Z�b�g�A�b�v���Ɏ��s
//	CreateSpots();			//	�X�|�b�g���̍쐬		2018/11�V��		3.04�Z�b�g�A�b�v���Ɏ��s
//	CreateConfig();			//	���ݒ�All�̍쐬		2018/11/14�V��	3.04�Z�b�g�A�b�v���Ɏ��s
//	CreateBuildingFormat();	//	2018/11/14�V�ݖ�����
	}
//-----------------------------------------------------------------------------
function CreateCards()
	{
	var dir,folders,fitem,num;
	var obj,cd,i;
	var f,str;
	var arr=new Array();

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from Cards where congnum="+congnum+";");

	//	�S�������[�v����
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	WriteLayer("Stage","Start:CreateCards<br>");
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		if (!fso.FileExists(ConfigXML(num))) continue;
		WriteLayer("Stage","Process:CreateCards("+num+")<br>");
		obj=ReadXMLFile(ConfigXML(num),false);
		cd=new Object();
		cd.congnum=congnum;
		cd.num=num;
		cd.name=obj.name;
		cd.count=obj.count;
		cd.kubun=obj.kubun;
		cd.MapType=obj.MapType;
		cd.HeaderType=obj.HeaderType;
		if ("spanDays" in obj)	cd.spanDays=obj.spanDays;
						else	cd.spanDays=0;
		if (!("AllMapPosition" in obj)) obj.AllMapPosition="";
		cd.AllMapPosition=obj.AllMapPosition;
		if (!("AllMapTitle" in obj)) obj.AllMapTitle="";
		cd.AllMapTitle=obj.AllMapTitle;
		cd.BuildingsCount=obj.Buildings.Count;
		cd.BuildingsHouse=obj.Buildings.House;

		if (!("Clip" in obj))	obj.Clip=new Array();
		str=JSON.stringify(obj.Clip);
		cd.JSON_Clip=str.replace(/\"/g,"'");
		if (!("RTB" in obj))	obj.RTB=new Array();
		str=JSON.stringify(obj.RTB);
		cd.JSON_RTB=str.replace(/\"/g,"'");;
		if (!("Comments" in obj))	obj.Comments=new Array();
		str=JSON.stringify(obj.Comments);
		cd.JSON_Comments=str.replace(/\"/g,"'");;
		if (!("Condominium" in obj))	obj.Condominium=new Array();
		str=JSON.stringify(obj.Condominium);
		cd.JSON_Condominium=str.replace(/\"/g,"'");;
		
		arr.push(cd);
		}
	SQ_Insert("Cards",arr);
	ClearLayer("Stage");
	}
//-----------------------------------------------------------------------------
function CreateMarkers()
	{
	var dir,folders,fitem,num;
	var old,obj,str,i;
	var f,str;
	var arr=new Array();

	WriteLayer("Stage","Start:CreateMarkers<br>");

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from Markers where congnum="+congnum+";");

	//	�S�������[�v����
	dir=fso.GetFolder(DataFolder());
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		if (!fso.FileExists(MarkerFile(num))) continue;

		WriteLayer("Stage","Process:CreateMarkers("+num+")<br>");
		old=LoadMarker_old(num);
		for(i in old.Map)
			{
			obj=new Object();
			obj.congnum=congnum;
			obj.num=num;
			obj.seq=i;
			obj.count=old.Map[i].Points.length;
			obj.user=old.Map[i].User;
			obj.edited=old.Map[i].Edited;
			obj.editor=old.Map[i].Editor;
			str=JSON.stringify(old.Map[i].Points);
			obj.JSON_Points=str.replace(/\"/g,"'");
			arr.push(obj);
			}
		}
	SQ_Insert("Markers",arr);
	ClearLayer("Stage");
	}
//-----------------------------------------------------------------------------
function CreateMarkerHistory()
	{
	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from MarkerHistory where congnum="+congnum+";");
	}
//-----------------------------------------------------------------------------
function CreatePublicLogs()
	{
	var dir,folders,fitem,num;
	var log,obj,i;
	var f;
	var arr=new Array();

	WriteLayer("Stage","Start:CreatePublicLogs<br>");

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

		WriteLayer("Stage","Process:CreatePublicLogs("+num+")<br>");
		log=ReadXMLFile(LogXML(num),false);
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
	ClearLayer("Stage");
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
	var obj,l;
	var carray=new Array();

	WriteLayer("Stage","Start:CreatePublicList<br>");

	//	�ȑO�̒�`���폜����
	SQ_Exec("delete from PublicList where congnum="+congnum+";");

	//	�S�������[�v����i�V����j
	var tbl=SQ_Read("Cards","congnum="+congnum,"num");
	for(l=0;l<tbl.length;l++)
		{
		WriteLayer("Stage","Process:CreatePublicList("+tbl[l].num+")<br>");
		obj=CreatePublicList_One(tbl[l]);
		carray.push(obj);
		}
	SQ_Insert("PublicList",carray);
	ClearLayer("Stage");
	}
//-----------------------------------------------------------------------------
function CreatePublicList_One(obj)
	{
	var card=new Object();
	var num=obj.num;
	var cobj=GetCardInfo(obj);
	card.congnum=congnum;					//	��O�ԍ�
	card.num=cobj.num;						//	���ԍ�
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

	var log=LoadLog(num);
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
