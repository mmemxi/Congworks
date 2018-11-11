//------------------------------------------------------------------------------------
// 2018/01/19作成　複数キャンペーンと複数会衆にまだ対応していないバージョン
// 2018/05/08修正　複数キャンペーンに対応
//------------------------------------------------------------------------------------
//	キャンペーン期間中かどうかの判定
//------------------------------------------------------------------------------------
function isCampeign(day)
	{
	var i,r=false;
	if (!("Campeigns" in ConfigAll)) return false;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if ((ConfigAll.Campeigns[i].Start<=day)&&(ConfigAll.Campeigns[i].End>=day)){r=true;break;}
		}
	return r;
	}
//------------------------------------------------------------------------------------
//	キャンペーン２週間前かどうかの判定
//------------------------------------------------------------------------------------
function isBeforeCampeign(today)
	{
	var i,r=false,nisu;
	if (!("Campeigns" in ConfigAll)) return false;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (today>=ConfigAll.Campeigns[i].Start) continue;
		nisu=CalcDays(today,ConfigAll.Campeigns[i].Start);
		if ((nisu>0)&&(nisu<=14)) {r=true;break;}
		}
	return r;
	}
//------------------------------------------------------------------------------------
//	区域終了がキャンペーン開始日をまたがるかどうかの判定
//------------------------------------------------------------------------------------
function isOverCampeign(startday,endday)
	{
	var i,s,r=0,tymd,ty,tm,td;
	var cd;
	if (!("Campeigns" in ConfigAll)) return false;
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
	}

//------------------------------------------------------------------------------------
//	キャンペーン後30日かどうかの判定
//------------------------------------------------------------------------------------
function isAfterCampeign(today)
	{
	var i,r=false,nisu;
	if (!("Campeigns" in ConfigAll)) return false;
	if (ConfigAll.Campeigns.length<1) return false;
	for(i=0;i<ConfigAll.Campeigns.length;i++)
		{
		if (today<=ConfigAll.Campeigns[i].End) continue;
		nisu=CalcDays(ConfigAll.Campeigns[i].End,today);
		if ((nisu>0)&&(nisu<=30)) {r=true;break;}
		}
	return r;
	}

//-------------------------------------------------------------------------
// 2018/5/25追加　指定された区域の最短使用可能日を取得
//-------------------------------------------------------------------
function GetAvailableDate(congnum,num)
	{
	var str,sts,atbl,d,i;
	var d0,nisu;

	//	その区域の使用状況を取得
	var card=new Object();
	var log=ReadXMLFile(NumFolder(congnum,num)+"log.xml",false);
	if (log!="")
		{
		if ("Status" in log)
			{
			if (log.Status=="Using")
				{
				card.NowUsing=true;
				card.lastuse=log.Latest.Rent;
				}
			else{
				card.NowUsing=false;
				card.lastuse=log.Latest.End;
				}
			}
		}
	else{
		card.NowUsing=false;
		card.lastuse="20000101";
		}

	d=card.lastuse;					//	最終使用日
	if (card.NowUsing) return d;	//	使用中の場合は開始日を返す
	d0=d;
	nisu=0;
	while(1==1)
		{
		d0=AddDays(d0,1);
		nisu++;
		if (isBeforeCampeign(d0)) continue;
		if (isCampeign(d0))
			{
			if (nisu>=ConfigAll.BlankCampeign) break;
			continue;
			}
		if (isAfterCampeign(d0))
			{
			if (nisu>=ConfigAll.BlankAfterCampeign) break;
			continue;
			}
		if (nisu>=ConfigAll.BlankMin) break;
		}
	return d0;
	}

