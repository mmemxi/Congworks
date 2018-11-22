//-----------------------------------------------------------------
function GetCardInfo(obj)
	{
	var i,j;
	var str,tbl;
	var num=parseInt(obj.num,10);
	var dst=new Object();
	dst.name=obj.name;
	dst.count=obj.count;
	dst.kubun=obj.kubun;
	dst.MapType=parseInt(obj.MapType,10);
	dst.HeaderType=parseInt(obj.HeaderType,10);
	if (obj.spanDays!=0) dst.spanDays=parseInt(obj.spanDays,10);
	if (obj.AllMapPosition!="") dst.AllMapPosition=obj.AllMapPosition;
	if (obj.AllMapTitle!="") dst.AllMapTitle=obj.AllMapTitle;
	dst.RTB=JSON.parse(obj.JSON_RTB.replace(/'/g,"\""));
	dst.Buildings=new Object();
	dst.Buildings.Count=parseInt(obj.BuildingsCount,10);
	dst.Buildings.House=parseInt(obj.BuildingsHouse,10);
	dst.Clip=new Array();
	tbl=JSON.parse(obj.JSON_Clip.replace(/'/g,"\""));
	for(i=0;i<tbl.length;i++)
		{
		j=parseInt(tbl[i].Seq,10);
		dst.Clip[j]=new Object();
		dst.Clip[j].Area=tbl[i].Area;
		if ("Zoom" in tbl[i])
			{
			dst.Clip[j].Zoom=tbl[i].Zoom;
			dst.Clip[j].Top=tbl[i].Top;
			dst.Clip[j].Left=tbl[i].Left;
			}
		}

	dst.Condominium=JSON.parse(obj.JSON_Condominium.replace(/'/g,"\""));
	dst.Comments=JSON.parse(obj.JSON_Comments.replace(/'/g,"\""));
	return dst;
	}
//-----------------------------------------------------------------
function SetCardInfo(num)
	{
	var i,j,src,str,tbl;
	var obj=new Object();
	src=Cards[num];

	obj.congnum=congnum;
	obj.num=num;
	obj.name=src.name;
	obj.count=src.count;
	obj.kubun=src.kubun;

	if ("MapType" in src)			obj.MapType=src.MapType;
					else			obj.MapType=0;
	if ("HeaderType" in src)		obj.HeaderType=src.HeaderType;
					else			obj.HeaderType=0;
	if ("spanDays" in src)			obj.spanDays=src.spanDays;
					else			obj.spanDays=0;
	if ("AllMapPosition" in src)	obj.AllMapPosition=src.AllMapPosition;
							else	obj.AllMapPosition="";
	if ("AllMapTitle" in src)		obj.AllMapTitle=src.AllMapTitle;
							else	obj.AllMapTitle="";
	if ("Buildings" in src)
		{
		obj.BuildingsCount=src.Buildings.Count;
		obj.BuildingsHouse=src.Buildings.House;
		}
	else{
		obj.BuildingsCount=0;
		obj.BuildingsHouse=0;
		}

	str=JSON.stringify(src.RTB);
	obj.JSON_RTB=str.replace(/\"/g,"'");

	if (!("Condominium" in src)) src.Condominium=new Array();
	str=JSON.stringify(src.Condominium);
	obj.JSON_Condominium=str.replace(/\"/g,"'");

	if (!("Comments" in src)) src.Comments=new Array();
	str=JSON.stringify(src.Comments);
	obj.JSON_Comments=str.replace(/\"/g,"'");

	if ("Clip" in src)
		{
		tbl=new Array();
		j=0;
		for(i in src.Clip)
			{
			tbl[j]=new Object();
			tbl[j].Seq=i;
			tbl[j].Area=src.Clip[i].Area;
			if ("Zoom" in src.Clip[i])
				{
				tbl[j].Zoom=src.Clip[i].Zoom;
				tbl[j].Top=src.Clip[i].Top;
				tbl[j].Left=src.Clip[i].Left;
				}
			j++;
			}
		}
	str=JSON.stringify(tbl);
	obj.JSON_Clip=str.replace(/\"/g,"'");

	return obj;
	}
