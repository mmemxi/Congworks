//------------------------------------------------------------------------------------
// 2018/01/19修正：isBeforeCampeignとisOverCampeignを追加。他はいじっていない
// 2018/05/08修正：複数キャンペーンに対応
//------------------------------------------------------------------------------------
//	サマリー関係のプログラム群
//------------------------------------------------------------------------------------
function CreateSummaryofApartment()
	{
	var afile=SummaryFolder()+"apartment.txt";
	var f,s,i,j,k;
	var num,BTB,sds,sts,atbl,str,kubun;
	f=fso.CreateTextFile(afile,true);
	for(num in Cards)
		{
		kubun=Cards[num].kubun;
		BTB=Cards[num].RTB;
		for(i in BTB)
			{
			if (BTB[i].KBN1!="集中インターホン") continue;
			sds=ApartFile(BTB[i].Name);	//	sds=アパートのログファイル
			if (!fso.FileExists(sds))	//	まだログファイルがないなら作成する
				{
				fso.CreateTextFile(sds,true);
				}
			sts=GetApartmentStatus(BTB[i].Name);	//	物件の使用状況を取得
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
function CreateSummaryofAllPerson()
	{
	var f,s,i,j,k,num;
	var bfile=SummaryFolder()+"person.txt";
	f=fso.CreateTextFile(bfile,true);
	for(num in Cards)
		{
		s=CreateSummaryofPerson(num,false);
		if (s!="") f.WriteLine(s);
		}
	f.close();
	}

function CreateSummaryofPerson(num,mode)
	{
	var mapnum,mnum,i,j,vhist,s,ss,str,f,result,tmk;
	var bfile=SummaryFolder()+"person.txt";
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

	//	対象の区域が使用中でないか、キャンペーン中であるとき
	if ((!Cards[num].NowUsing)||(isCampeign(Cards[num].lastuse)))
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

	tmk=LoadMarker(num);

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

	mapnum=parseInt(Cards[num].count,10);
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
		s=num+","+j+","+Cards[num].name+","+Cards[num].kubun+","+mmap[j].Count+","+GetOverDay(num)+","+mmap[j].User;
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
//------------------------------------------------------------------------------------
function CloseSummary()
	{
	var afile=SummaryFolder()+"apartment.txt";
	var bfile=SummaryFolder()+"person.txt";
	if (fso.FileExists(afile))
		{
		try	{fso.DeleteFile(afile,true);}
		catch(e){}
		}
	if (fso.FileExists(bfile))
		{
		try	{fso.DeleteFile(bfile,true);}
		catch(e){}
		}
	}
//------------------------------------------------------------------------------------
function ClearTemporaryFolder()
	{
	var dir,files,f,ext;

	if (!fso.FolderExists(SummaryFolder()))
		{
		fso.CreateFolder(SummaryFolder());
		}

	dir=fso.GetFolder(LocalFolder());
	files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		f=files.item();
		ext=fso.GetExtensionName(f.Name).toLowerCase();
		if ((ext!="txt")&&(ext!="xml"))
			{
			fso.DeleteFile(dir+qt+f.Name,true);
			}
		}
	}
//------------------------------------------------------------------------------------
function isCampeign(day)
	{
	var i,r=false;
	if (ConfigAll.Campeigns.length==0) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if ((ConfigAll.Campeigns[i].Start<=day)&&(ConfigAll.Campeigns[i].End>=day)) {r=true;break;}
		}
	return r;

	//2018/5/8	単一キャンペーン定義を廃止し複数に置き換えたので、以下の文と置換
	/*
	if (!("Campeign" in ConfigAll)) return false;
	if ((ConfigAll.Campeign.Start<=day)&&(ConfigAll.Campeign.End>=day)) return true;
	return false;
	*/
	}
//------------------------------------------------------------------------------------
//	キャンペーン２週間前かどうかの判定
//------------------------------------------------------------------------------------
function isBeforeCampeign(today)
	{
	var i,r=false,nisu;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (today>=ConfigAll.Campeigns[i].Start) continue;
		nisu=CalcDays(today,ConfigAll.Campeigns[i].Start);
		if ((nisu>0)&&(nisu<=14)) {r=true;break;}
		}
	return r;

	//2018/5/8	単一キャンペーン定義を廃止し複数に置き換えたので、以下の文と置換
	/*
	if (!("Campeign" in ConfigAll)) return false;
	if (today >= ConfigAll.Campeign.Start) return false;
	nisu=CalcDays(today,ConfigAll.Campeign.Start);
	if ((nisu>0)&&(nisu<=14)) return true;
	return false;
	*/
	}
//------------------------------------------------------------------------------------
//	区域終了がキャンペーン開始日をまたがるかどうかの判定
// 戻り値：
//  -1 →  キャンペーン期間前の1-14日である（新規開始禁止期間）
//  0  →  キャンペーン期間未定義か、開始日・終了日ともにキャンペーン期間に無関係か、すでにキャンペーン期間中
//  0より大きい→ 開始日＜キャンペーン開始日＜終了予定日＜キャンペーン終了日（キャンペーン前日の日付を返す）
//------------------------------------------------------------------------------------
function isOverCampeign(startday,endday)
	{
	var i,s,r=0,rr=0,tymd,ty,tm,td;
	var cd;
	if (ConfigAll.Campeigns.length<1) return r;
	s=startday+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		startday=ty*10000+tm*100+td;
		}
	s=endday+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		endday=ty*10000+tm*100+td;
		}
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (startday>=ConfigAll.Campeigns[i].Start) continue;	//	キャンペーン開始後は除く
		cd=CalcDays(startday,ConfigAll.Campeigns[i].Start);
		if (cd<15){r=-1;break;}
		if (endday>=ConfigAll.Campeigns[i].Start)
			{
			r=AddDays(ConfigAll.Campeigns[i].Start,-1);
			break;
			}
		}
	return r;

/* 2018/5/8  複数キャンペーンに対応したので以下の文と置換
	var i,s,r=0,tymd,ty,tm,td;
	var cd;
	if (!("Campeign" in ConfigAll)) return 0;
	s=startday+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		startday=ty*10000+tm*100+td;
		}
	s=endday+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		endday=ty*10000+tm*100+td;
		}

	if (startday>=ConfigAll.Campeign.Start) return 0;	//	キャンペーン開始後は除く
	cd=CalcDays(startday,ConfigAll.Campeign.Start);
	if (cd<15) return -1;								//	キャンペーン期間中の新規開始禁止時期
	if (endday>=ConfigAll.Campeign.Start)
		{
		r=AddDays(ConfigAll.Campeign.Start,-1);			//	キャンペーン前日に終了する
		return r;
		}
	return 0;

*/
	}
//------------------------------------------------------------------------------------
//	キャンペーン後30日かどうかの判定
//------------------------------------------------------------------------------------
function isAfterCampeign(today)
	{
	var i,r=false,nisu;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (today<=ConfigAll.Campeigns[i].End) continue;
		nisu=CalcDays(ConfigAll.Campeigns[i].End,today);
		if ((nisu>0)&&(nisu<=30)) {r=true;break;}
		}
	return r;
	}
