//------------------------------------------------------------------
function LoadLog(num)
	{
	var logobj=SQ_Read("PublicLogs","congnum="+congnum+" and num="+num,"");
	var result=new Object();
	if (logobj.length==0) return NewLog();
	var obj=logobj[0];
	result.congnum=congnum;
	result.num=num;
	result.Status=obj.status;
	result.Latest=new Object();
	result.Latest.User=obj.userid;
	result.Latest.Rent=obj.startday;
	result.Latest.End=obj.endday;
	result.Latest.Limit=obj.limitday;
	result.History=JSON.parse(obj.body.replace(/'/g,"\""));
	return result;

/*  SQliteの処理に置換したので廃止
	var f=LogXML(num);
	var obj=ReadXMLFile(f,false);
	if (obj=="")
		{
		obj=NewLog();
		return obj;
		}
	if (!("History" in obj))
		{
		obj.History=new Array();
		}
	return obj;
*/
	}

function SaveLog(log,num)
	{
	var obj=new Object();
	obj.congnum=congnum;
	obj.num=num;
	obj.status=log.Status;
	obj.userid=log.Latest.User;
	obj.startday=log.Latest.Rent;
	obj.endday=log.Latest.End;
	obj.limitday=log.Latest.Limit;
	obj.body=JSON.stringify(log.History).replace(/\"/g,"'");
	SQ_Replace("PublicLogs",obj);

//	WriteXMLFile(obj,LogXML(num));	//	SQliteの処理に置換したので廃止
	var sql="update PublicList set ";
	if (log.Status=="Free")	sql+=" inuse='false',";
					else	sql+=" inuse='true',";
	sql+="userid='"+log.Latest.User+"',";
	sql+="startday="+log.Latest.Rent+",";
	sql+="endday="+log.Latest.End+",";
	sql+="limitday="+log.Latest.Limit;
	sql+=" where congnum="+congnum+" and num="+num+";";
	SQ_Exec(sql);
	}

//------------------------------------------------------------------
function NewLog()
	{
	var obj=new Object();
	obj.Status="Free";
	obj.Latest=new Object();
	obj.Latest.User="";
	obj.Latest.Rent=0;
	obj.Latest.Limit=0;
	obj.Latest.End=0;
	obj.History=new Array();
	return obj;
	}
//------------------------------------------------------------------
function AddLog(obj,num,user,rent,limit)
	{
	var i,l,t;
	l=obj.History.length;
	obj.History[l]=new Object();
	t=obj.History[l];
	t.Status="Using";
	t.User=user;
	t.Rent=rent;
	t.Limit=limit;
	t.End=0;
	t.Map=new Array();
	t.Compress=0;
	for(i=1;i<=Cards[num].count;i++)
		{
		t.Map[i]=new Object();
		t.Map[i].Sequence=i;
		t.Map[i].Start=0;
		t.Map[i].End=0;
		}
	SetLogSummary(obj);
	}

//------------------------------------------------------------------
function FinishLog(obj,num,mode)	//mode=trueなら入力値に、falseなら期限日に
	{
	var i,j,last;
	if (obj.Status!="Using") return;
	l=obj.History.length-1;
	t=obj.History[l];
	last=0;
	for(i in t.Map)
		{
		j=parseInt(t.Map[i].End,10);
		if (j!=0)
			{
			if (j>last) last=j;
			}
		}
	if (!mode)
		{
		if (t.Limit>last) last=t.Limit;
		}
	for(i in t.Map)
		{
		if (t.Map[i].Start==0)	t.Map[i].Start=t.Rent;
		if (t.Map[i].End==0)	t.Map[i].End=last;
		}
	obj.Status="Free";
	t.Status="Finish";
	t.End=last;
	SetLogSummary(obj);
	}
//------------------------------------------------------------------
function RollBackLog(obj,num)
	{
	var i,j,l;
	l=obj.History.length-1;
	if (obj.Status=="Using")	//	現在使用中なら、ログを消すだけでＯＫ
		{
		obj.History.splice(l,1);
		}
	else{						//	現在未使用なら、前回ログの終了情報を消す
		obj.History[l].Status="Using";
		obj.History[l].End=0;
		for(i in obj.History[l].Map)
			{
			obj.History[l].Map[i].Start=0;
			obj.History[l].Map[i].End=0;
			}
	/*	2017/12/11バグ修正：マーカーを進めるのは使用開始時なので、終了→使用中に戻すときはマーカーを戻さなくてよい
		//	マーカーの戻し処理
		Markers=LoadMarker(num);
		if (Markers.Count>0)
			{
			DecMarkerHistory();
			SaveMarker(num,Markers);
			}
	*/
		}
	SetLogSummary(obj);
	}
//------------------------------------------------------------------
function SetLogSummary(obj)
	{
	var i,j,l,c1,c2,last;
	l=obj.History.length;
	if (l==0)
		{
		obj.Status="Free";
		obj.Latest.User="";
		obj.Latest.Rent=0;
		obj.Latest.Limit=0;
		obj.Latest.End=0;
		}
	else{
		l--;
		c1=0;c2=0;	//	c1=未完了 c2=完了
		last=0;
		for(j in obj.History[l].Map)
			{
			if (obj.History[l].Map[j].End!=0)
				{
				c2++;
				if (obj.History[l].Map[j].End>last) last=obj.History[l].Map[j].End;
				}
			else c1++;
			}
		if ((c1==0)&&(c2!=0))
			{
			obj.History[l].Status="Finish";
			obj.History[l].End=last;
			}
		else{
			obj.History[l].Status="Using";
			obj.History[l].End=0;
			}
		if (obj.History[l].Status=="Using")
			{
			obj.Status="Using";
			obj.Latest.User=obj.History[l].User;
			obj.Latest.Rent=obj.History[l].Rent;
			obj.Latest.Limit=obj.History[l].Limit;
			if (l>0) obj.Latest.End=obj.History[l-1].End;
				else obj.Latest.End=0;
			}
		else{
			obj.Status="Free";
			obj.Latest.User=obj.History[l].User;
			obj.Latest.Rent=obj.History[l].Rent;
			obj.Latest.Limit=obj.History[l].Limit;
			obj.Latest.End=obj.History[l].End;
			}
		}
	}

