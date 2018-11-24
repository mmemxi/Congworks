//----------------------------------------------------------------
// 個人の区域関係の関数
//----------------------------------------------------------------
function AddMyMap(userid,kbn,congnum,num,seq,id,counts,finish)
	{
	var obj,bak,i,j,k,p,result;
	var BTB=Cards[num].RTB;
	var personalpath=PersonalFolder(congnum);
	var mypath=personalpath+userid;
	var mybook=mypath+qt+"mybook.xml";
	var today=new Date();
	var today8=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();

	if (!fso.FolderExists(personalpath)) fso.CreateFolder(personalpath);
	if (!fso.FolderExists(mypath)) fso.CreateFolder(mypath);
	if (fso.FileExists(mybook))
		{
		obj=ReadXMLFile(mybook);
		if (!("Map" in obj)) obj.Map=new Array();
		bak=new Object();
		bak.Counter=obj.Counter;
		bak.Map=new Array();
		k=0;
		for(j=0;j<obj.Map.length;j++)
			{
			if (obj.Map[j].finish>=today8)
				{
				bak.Map[k]=clone(obj.Map[j]);
				k++;
				}
			else{
				if (fso.FileExists(mypath+qt+obj.Map[j].pdf)) fso.DeleteFile(mypath+qt+obj.Map[j].pdf);
				}
			}
		obj.Map=clone(bak.Map);
		}
	else{
		obj=new Object();
		obj.Counter=0;
		obj.Map=new Array();
		}
	i=parseInt(obj.Counter,10);
	p=obj.Map.length;
	obj.Map[p]=new Object();
	obj.Map[p].kbn=kbn;						//	A=集中インターホン B:長期留守宅
	obj.Map[p].num=num;						//	区域番号
	obj.Map[p].seq=seq;						//	地図番号
	obj.Map[p].id=id;						//	A:物件番号 B:ゼロ固定
	if (kbn=="A")
		{
		obj.Map[p].name=BTB[id].Name;		//	A:物件名
		}
	else{
		obj.Map[p].name=Cards[num].name;	//	B:区域名
		}
	obj.Map[p].counts=counts;				//	件数
	obj.Map[p].finish=finish;				//	終了日（西暦８桁）
	obj.Map[p].pdf=FixValue(i,6)+".pdf";	//	PDFファイル名
	result=mypath+qt+obj.Map[p].pdf;
	i++;
	obj.Counter=i;
	WriteXMLFile(obj,mybook);
	return result;
	}

//----------------------------------------------------------------
function RemoveMyMap(userid,kbn,congnum,num,seq,name)
	{
	var obj,i,j,k,s,result;
	var personalpath=PersonalFolder(congnum);
	var mypath=personalpath+userid;
	var mybook=mypath+qt+"mybook.xml";

	if (!fso.FolderExists(personalpath)) fso.CreateFolder(personalpath);
	if (!fso.FolderExists(mypath)) fso.CreateFolder(mypath);
	if (!fso.FileExists(mybook)) return;

	obj=ReadXMLFile(mybook);

	for(j=0;j<obj.Map.length;j++)
		{
		if (kbn=="A")
			{
			if (obj.Map[j].name!=name) continue;
			}
		else{
			if (obj.Map[j].num!=num) continue;
			if (obj.Map[j].seq!=seq) continue;
			}
		if (fso.FileExists(mypath+qt+obj.Map[j].pdf)) fso.DeleteFile(mypath+qt+obj.Map[j].pdf);
		obj.Map.splice(j,1);
		break;
		}
	WriteXMLFile(obj,mybook);
	}
//----------------------------------------------------------------
// 指定された区域が使用可能かどうかを返すisAvailable
// kbn=A:集中インターホン B:長期留守宅
// num,seq=区域番号、地図番号
// id=集中インターホンの場合、物件名
//----------------------------------------------------------------
function isAvailable(kbn,congnum,num,seq,id)
	{
	var sts,tbl,tmk;
	if (kbn=="A")
		{
		id=id.replace("_"," ");
		sts=GetApartmentStatus(id);
		if (sts=="") return true;
		tbl=sts.split(",");
		if (tbl[2]=="") return false;
		return true;
		}
	if (kbn=="B")
		{
		tmk=LoadMarker(congnum,num);
		if (tmk.Count==0) return false;
		if ((tmk.Map[seq].User!="")&&(tmk.Map[seq].User!=id)) return false;
		return true;
		}
	return false;
	}
//----------------------------------------------------------------
// 指定したアパートの使用状況を返す
//----------------------------------------------------------------
function GetApartmentStatus(id)
	{
	var s,i,j;
	var ary=new Array();
	var alogs=new Array();
	s=ReadFile(ApartFolder(congnum)+id+".txt");
	if (s=="") return s;
	ary=s.split(/\r\n/);
	j=ary.length-1;
	if (ary[j]=="") j--;
	return ary[j];
	}
