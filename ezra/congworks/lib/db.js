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
			DB[key].品目番号=key;
			DB[key].分類=fmt[1];
			DB[key].品目名=fmt[2];
			DB[key].集計先=fmt[3];
			DB[key].コード種別=fmt[4];
			DB[key].集計種別=fmt[5];
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
		DB2[j].品目番号=i;
		DB2[j].品目名=DB[i].品目名;
		DB2[j].分類=DB[i].分類;
		DB2[j].コード種別=DB[i].コード種別;
		DB2[j].集計種別=DB[i].集計種別;
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
		s=i+","+DB[i].分類+","+DB[i].品目名+","+DB[i].集計先;
		s+=","+DB[i].コード種別+","+DB[i].集計種別;
		stream.WriteLine(s);
		}
	stream.close();
	CopyDB();
	}
function DB_Sort2(a,b)
	{
	var aa,bb;
	aa=a.品目番号;
	bb=b.品目番号;
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
	s+="</select>年度";
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
		if ((DB[i].分類=="年ごとの品目")||(DB[i].分類=="Watchtower Library"))
			{
			if (DB[i].集計種別!="sum")
				{
				delete DB[i];
				}
			continue;
			}
		exist=false;
		if (DB[i].集計種別=="sum") continue;	//	集計先品目はそのまま

		/*レポートに自分の品目(i)が存在するかどうかチェック*/

		for(j1=0;j1<=1;j1++)
			{
			for(j2 in Report[j1])
				{
				if (Report[j1][j2].品目==i)
					{
					exist=true;
					break;
					}
				}
			}
		if (DB[i].集計先!=i) continue;			//	集計先が自分以外であるものはそのまま

		if (exist)		//	自分の品目が新しい表に存在
			{
			DB[i].集計先=i;
			continue;
			}

		r=FindAlterCode(i);	//	代わりの集計先を検索（そのジャンルの集計項目）
		if (r=="") continue;
		DB[i].集計先=r;
		}
	UpdateDB();
	}

function FindAlterCode(item)
	{
	var i,exist=0,result=0;
	var group=DB[item].分類;
	for (i in DB)
		{
		if ((DB[i].分類==group)&&(DB[i].集計種別=="sum"))
			{
			exist++;
			result=i;
			}
		}
	if (exist==1) return result;
	return "";
	}
