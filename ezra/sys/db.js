//------------------------------------------------------------------------------------
var DB=new Array();
var dbmax=0;
var DBYear=0;
//------------------------------------------------------------------------------------
function OpenDB(year)
	{
	var lines=new Array();
	var fmt,key;
	var i,j;
	dbmax=0;
	if (DBYear==year) return;
	DB=new Array();
	DBYear=year;
	text=ReadFile(DBFile(year));
	if (text!="")
		{
		lines=text.split(/\r\n/);
		for(i=0;i<lines.length;i++)
			{
			lines[i]+=",,,,,";
			fmt=lines[i].split(",");
			dbmax++;
			key=fmt[0];
			DB[key]=new Object();
			DB[key].�i�ڔԍ�=key;
			DB[key].����=fmt[1];
			DB[key].�i�ږ�=fmt[2];
			DB[key].�W�v��=fmt[3];
			DB[key].�R�[�h���=fmt[4];
			DB[key].�W�v���=fmt[5];
			}
		}
	CopyDB();
	}
function CopyDB()
	{
	j=0;
	DB2=new Array();
	for(i in DB)
		{
		DB2[j]=new Object();
		DB2[j].�i�ڔԍ�=i;
		DB2[j].�i�ږ�=DB[i].�i�ږ�;
		DB2[j].����=DB[i].����;
		DB2[j].�R�[�h���=DB[i].�R�[�h���;
		DB2[j].�W�v���=DB[i].�W�v���;
		j++;
		}
	DB2.sort(DB_Sort2);
	}
function UpdateDB()
	{
	var i,j,s;
	var stream = fso.CreateTextFile(DBFile(DBYear),true);
	j=0;
	for(i in DB)
		{
		j++;
		s=i+","+DB[i].����+","+DB[i].�i�ږ�+","+DB[i].�W�v��;
		s+=","+DB[i].�R�[�h���+","+DB[i].�W�v���;
		stream.WriteLine(s);
		}
	stream.close();
	CopyDB();
	}
function DB_Sort2(a,b)
	{
	var aa,bb;
	aa=a.�i�ڔԍ�;
	bb=b.�i�ڔԍ�;
	if (aa<bb) return -1;
	if (aa>bb) return 1;
	return 0;
	}

function CreateDBList(year)
	{
	var i,s,obj,filename,ext,basename,yearnum;
	var dir=fso.GetFolder(DBFolder());
	var files=new Enumerator(dir.Files);
	var years=new Array();
	var dbyear=-1;
	yearnum=0;
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		ext=fso.GetExtensionName(filename).toLowerCase();
		if (ext!="csv") continue;
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		i=parseInt(basename,10);
		years.push(i);
		yearnum++;
		}
	s="<select size=1 onchange='ChangeDBList(this.value)'>";
	years.sort(CreateDBList_Sort);
	for(i=0;i<yearnum;i++)
		{
		s+="<option value="+years[i];
		if (years[i]==year)
			{
			dbyear=year;
			s+=" selected";
			}
		s+=">"+years[i]+"</option>";
		}
	if (dbyear==-1) dbyear=years[0];
	OpenDB(dbyear);
	s+="</select>�N�x";
	return s;
	}

function CreateDBList_Sort(a,b)
	{
	return b-a;
	}

function ChangeDBList(year)
	{
	Menu1_Year=year;
	MENU1Top=0;
	MENU1();
	}

function CreateNewDB(year)
	{
	var i,j1,j2,j3,exist,r;
	if (fso.FileExists(DBFile(year))) return;
	i=year;
	while(1==1)
		{
		i--;
		if (i<2000) break;
		if (fso.FileExists(DBFile(i)))
			{
			fso.CopyFile(DBFile(i),DBFile(year),true);
			break;
			}
		}
	if (i<2000) return;
	DBYear=-1;
	OpenDB(year);
	r=GetReport(year);
	if (r=="") return;
	for(i in DB)
		{
		if ((DB[i].����=="�N���Ƃ̕i��")||(DB[i].����=="Watchtower Library"))
			{
			if (DB[i].�W�v���!="sum")
				{
				delete DB[i];
				}
			continue;
			}
		exist=false;
		if (DB[i].�W�v���=="sum") continue;	//	�W�v��i�ڂ͂��̂܂�

		/*���|�[�g�Ɏ����̕i��(i)�����݂��邩�ǂ����`�F�b�N*/

		for(j1=0;j1<=1;j1++)
			{
			for(j2 in Report[j1])
				{
				if (Report[j1][j2].�i��==i)
					{
					exist=true;
					break;
					}
				}
			}
		if (DB[i].�W�v��!=i) continue;			//	�W�v�悪�����ȊO�ł�����̂͂��̂܂�

		if (exist)		//	�����̕i�ڂ��V�����\�ɑ���
			{
			DB[i].�W�v��=i;
			continue;
			}

		r=FindAlterCode(i);	//	����̏W�v��������i���̃W�������̏W�v���ځj
		if (r=="") continue;
		DB[i].�W�v��=r;
		}
	UpdateDB();
	}

function FindAlterCode(item)
	{
	var i,exist=0,result=0;
	var group=DB[item].����;
	for (i in DB)
		{
		if ((DB[i].����==group)&&(DB[i].�W�v���=="sum"))
			{
			exist++;
			result=i;
			}
		}
	if (exist==1) return result;
	return "";
	}
