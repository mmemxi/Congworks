//------------------------------------------------------------------------------------
//	サマリー関係のプログラム群
//------------------------------------------------------------------------------------
function CreateSummaryofApartment(congnum)
	{
	var afile=SummaryFolder(congnum)+"apartment.txt";
	var f,f1,s,i,j,k;
	var num,BTB,sds,sts,atbl,str,kubun;
	var ary=new Array();
	var alogs=new Array();
	var dir,folders,fitem,obj,num;
	dir=fso.GetFolder(DataFolder(congnum));
	folders=new Enumerator(dir.SubFolders);
	f=fso.CreateTextFile(afile,true);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		obj=ReadXMLFile(ConfigXML(congnum,num),false)
		if (!("RTB" in obj))
			{
			continue;		//	特記情報がない
			}
		kubun=obj.kubun;					//	群れ分類
		BTB=clone(obj.RTB);
		for(i in BTB)
			{
			if (BTB[i].KBN1!="集中インターホン") continue;
			sds=ApartFolder(congnum)+BTB[i].Name+".txt";		//	sds=アパートのログファイル
			if (!fso.FileExists(sds))	//	まだログファイルがないなら作成する
				{
				f1=fso.CreateTextFile(sds,true);
				f1.close();
				}
			s=ReadFile(sds);
			if (s=="") sts="";
			else{
				ary=s.split(/\r\n/);
				j=ary.length-1;
				if (ary[j]=="") j--;
				sts=ary[j];
				}
			if (sts=="")	sts=",,,,";
			//	区域番号,地図番号,建物名,物件番号,件数,群れ区分,使用者名,使用開始日,使用終了日,使用期限
			str=num+","+BTB[i].Num+","+BTB[i].Name+","+i+","+BTB[i].Person+","+kubun;
			str+=","+sts;
			f.WriteLine(str);
			}
		}
	f.close();
	}
//------------------------------------------------------------------------------------
function CreateSummaryofAllPerson(congnum)
	{
	var f,s,i,j,k,num;
	var dir,folders,fitem,obj;
	var bfile=SummaryFolder(congnum)+"person.txt";
	f=fso.CreateTextFile(bfile,true);

	dir=fso.GetFolder(DataFolder(congnum));
	folders=new Enumerator(dir.SubFolders);
	for(; !folders.atEnd(); folders.moveNext())
		{
		fitem=folders.item();
		if (isNaN(fitem.Name)) continue;
		num=fso.GetBaseName(fitem.Name);
		num=parseInt(num,10);
		s=CreateSummaryofPerson(congnum,num,false);
		if (s!="") f.WriteLine(s);
		}
	f.close();
	}
//------------------------------------------------------------------------------------
function CreateSummaryofPerson(congnum,num,mode)
	{
	var mapnum,mnum,i,j,vhist,s,ss,str,f,result,tmk,log;
	var card,cobj,mobj,tmk,c;
	var bfile=SummaryFolder(congnum)+"person.txt";
	var ary1=new Array();
	var ary2=new Array();
	s="";ss="";f="";
	result="";

	if (mode)	//	一つの区域だけを対象にする
		{
		s=ReadFile(bfile);
		ary1=s.split("\r\n");
		j=0;
		for(i=0;i<ary1.length;i++)
			{
			if ((ary1[i].indexOf(num+",",0)!=0)&&(ary1[i]!=""))
				{
				ary2[j]=ary1[i];
				j++;
				}
			}
		j--;
		}
	else		//	すべての区域を対象にする
		{
		ary2=new Array();
		}

	//	対象の区域の詳細読込
	card=new Object();
	cobj=ReadXMLFile(ConfigXML(congnum,num),false);
	if (cobj=="")
		{
		if (mode)
			{
			f=fso.CreateTextFile(bfile,true);
			str=ary2.join("\r\n");
			f.Write(str);
			f.close();
			}
		return "";
		}
	card.count=cobj.count;	//	地図枚数
	card.name=cobj.name;	//	区域名
	card.kubun=cobj.kubun;	//	区域区分

	//	対象の区域のログ読込
	log=LoadLog(congnum,num);
	if (log=="")
		{
		card.NowUsing=false;
		card.lastuse="00000000";
		}
	else{
		if (!("Status" in log))
			{
			card.NowUsing=false;
			card.lastuse="00000000";
			}
		else{
			if (log.Status=="Using")
				{
				card.NowUsing=true;
				card.Limit=log.Latest.Limit;
				card.lastuse=log.Latest.Rent;
				}
			else{
				card.NowUsing=false;
				card.lastuse=log.Latest.Rent;
				}
			}
		}

	//	対象の区域が使用中でないか、キャンペーン中であるとき
	if ((!card.NowUsing)||(isCampeign(card.lastuse)))
		{
		if (mode)	//	一つの区域のみ処理するモードなら、出力してそれで終わり
			{
			f=fso.CreateTextFile(bfile,true);
			str=ary2.join("\r\n");
			f.Write(str);
			f.close();
			}
		return "";
		}

	//	マーカー情報の読込
	mobj=ReadXMLFile(NumFolder(congnum,num)+"marker.xml",true);
	if (mobj=="")
		{
		mobj=new Object();
		mobj.Map=new Array();
		}
	if (!("Map" in mobj))
		{
		mobj.Map=new Array();
		}
	tmk=new Object();
	tmk.Map=new Array();
	c=0;
	for(i in mobj.Map)
		{
		if ("Id" in mobj.Map[i])
			{
			j=parseInt(mobj.Map[i].Id,10);
			tmk.Map[j]=clone(mobj.Map[i]);
			if (!("Points" in tmk.Map[j])) tmk.Map[j].Points=new Array();
			c+=tmk.Map[j].Points.length;
			}
		}
	tmk.Count=c;

	//	対象のマーカーが０個のとき
	if (tmk.Count<1)
		{
		if (mode)
			{
			f=fso.CreateTextFile(bfile,true);
			str=ary2.join("\r\n");
			f.Write(str);
			f.close();
			}
		return "";
		}

	//	地図ごとに有効マーカー数を数える
	mapnum=parseInt(card.count,10);
	mmap=new Array();
	for(i=1;i<=mapnum;i++)
		{
		mmap[i]=new Object();
		mmap[i].Count=0;
		mmap[i].Using=false;
		mmap[i].User="";
		}
	for(i in tmk.Map)
		{
		for(j=0;j<tmk.Map[i].Points.length;j++)
			{
			vhist=parseInt(tmk.Map[i].Points[j].History,10);
			if (vhist!=2) continue;
			mmap[i].Count++;
			if (tmk.Map[i].User!="")
				{
				mmap[i].Using=true;
				mmap[i].User=tmk.Map[i].User;
				}
			}
		}

	for(j=1;j<=mapnum;j++)
		{
		if (mmap[j].Count==0) continue;
		s=num+","+j+","+card.name+","+card.kubun+","+mmap[j].Count+","+card.Limit+","+mmap[j].User;
		ary2.push(s);
		}
	if (mode)
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return "";
		}
	else{
		str=ary2.join("\r\n");
		return str;
		}
	}
