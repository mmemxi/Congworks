//---------------------------------------------------------
// getPublicLogs()
// 会衆用区域のリストを取得して戻り値に返す
// 引数を省略すると全区域の配列を、引数を指定するとその区域だけのオブジェクトを返す。
// PublicListテーブルから取得した項目(num,name,kubun,maps,refuses,buildings,persons,inuse,userid,startday,endday,limitday)に加え、
// .Lastuse  最終使用日（使用中なら開始日、未使用なら前回終了日）
// .Blank    日数（使用中なら開始日から今日まで、未使用なら前回終了から今日までの日数）
// .Avail    使用可能か(true/false/disable、使用中なら常にfalse、未使用なら日数に応じて使用不可(disable)/使用可能(true)）
// .Status   状態文字列（使用中ならいつから開始か、未使用なら何日前からか）
//---------------------------------------------------------
function getPublicLogs(num=0)
	{
	var now=new Date();
	var today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
	var i,cobj,num;
	var robj=new Array();
	var cwhere="congnum="+congnum;
	if (num!=0) cwhere+=" and num="+num;
	var ctbl=SQ_Read("PublicList",cwhere,"num");

	for(i=0;i<ctbl.length;i++)
		{
		cobj=ctbl[i];
		num=cobj.num;
		//	使用中の区域-----------------------------------------------
		if (cobj.inuse=="true")
			{
			cobj.Lastuse=cobj.startday;
			cobj.Blank=CalcDays(cobj.startday,"");					//	使用日数
			cobj.Avail="false";										//	使用可能＝Ｎｏ
			cobj.Status="使用中("+cobj.userid+"："+cobj.startday.substring(4,6)+"/"+cobj.startday.substring(6,8)+"～）";
			}
		//	未使用の区域-----------------------------------------------
		else{
			cobj.Lastuse=cobj.endday;
			cobj.Blank=CalcDays(cobj.endday,"");					//	使用日数
			if (isCampeign(today))			//	キャンペーン中
				{
				if (cobj.Blank<ConfigAll.BlankCampeign) cobj.Avail="disable";else cobj.Avail="true";
				}
			else{
				if (isAfterCampeign(today))	//	ｷｬﾝﾍﾟｰﾝ期間後30日
					{
					if (cobj.Blank<ConfigAll.BlankAfterCampeign) cobj.Avail="disable";else cobj.Avail="true";
					}
				else{						//	通常の期間
					if ((cobj.Blank<ConfigAll.BlankMin)&&(cobj.Blank!=-1)) cobj.Avail="disable";else cobj.Avail="true";
					}
				}
			cobj.Status="未使用("+cobj.Blank+"日前)";
			if (isBeforeCampeign(today))
				{
				cobj.Status="ｷｬﾝﾍﾟｰﾝ準備期間("+cobj.Blank+"日前)";
				cobj.Avail="false";
				}
			}
		robj[num]=clone(ctbl[i]);
		}
	if (num==0) return ctbl[0];
		else	return robj;
	}

