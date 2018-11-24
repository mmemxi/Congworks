//------------------------------------------------------------------
function LoadLog(congnum,num)
	{
	var logobj=SQ_Read("PublicLogs","congnum="+congnum+" and num="+num,"");
	var result=new Object();
	if (logobj.length==0)	return NewLog();
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
	}
function SaveLog(log,congnum,num)
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
	}
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
function AddLog(obj,congnum,num,user,rent,limit)
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
function RollBackLog(obj,congnum,num)
	{
	var l;
	l=obj.History.length-1;
	obj.History.splice(l,1);
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
		c1=0;c2=0;	//	c1=–¢Š®—¹ c2=Š®—¹
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

