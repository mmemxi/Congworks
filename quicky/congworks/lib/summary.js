//------------------------------------------------------------------------------------
//	サマリー関係のプログラム群
//------------------------------------------------------------------------------------
function CreateSummaryofApartment(congnum)
	{
	var afile=SummaryFolder(congnum)+"apartment.txt";
	var f,f1,s,i,j,k,l;
	var num,BTB,sds,sts,atbl,str,kubun;
	var ary=new Array();
	var alogs=new Array();
	var tbl,obj,num;
	f=fso.CreateTextFile(afile,true);

	//	区域一覧の読込
	var obj=SQ_Read("Cards","congnum="+congnum,"num");
	for(l=0;l<obj.length;l++)
		{
		tbl=GetCardInfo(obj[l]);
		num=parseInt(tbl.num,10);
		kubun=tbl.kubun;					//	群れ分類
		BTB=clone(tbl.RTB);
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
				while(1==1)
					{
					if (ary[j]!="") break;
					j--;
					if (j<1) break;
					}
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
// 個人用サマリ作成（Quickyと違い、常に１つの区域だけを対象とし、戻り値はない）
//------------------------------------------------------------------------------------
function CreateSummaryofPerson(congnum,num)
	{
	var mapnum,mnum,i,j,vhist,s,ss,str,f,tmk,log;
	var card,obj,cobj,mobj,tmk,c;
	var bfile=SummaryFolder(congnum)+"person.txt";
	var ary1=new Array();
	var ary2=new Array();
	s="";ss="";f="";

	//	現行サマリを読み(ary1)、対象区域№の行を除外した新テーブル(ary2)を作る。
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

	//	対象の区域の詳細読込
	obj=SQ_Read("Cards","congnum="+congnum+" and num="+num,"");
	if (obj.length==0)
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
		}
	cobj=GetCardInfo(obj[0]);
	card=new Object();
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

	//	対象の区域が使用中でないか、キャンペーン中であるとき、出力してそれで終わり
	if ((!card.NowUsing)||(isCampeign(card.lastuse)))
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
		}

	//	マーカー情報の読込
	tmk=LoadMarker(congnum,num);
	if (tmk.Count<1)				//	マーカーがない
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
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

	f=fso.CreateTextFile(bfile,true);
	str=ary2.join("\r\n");
	f.Write(str);
	f.close();
	}
