function SaveConfig(congnum,num)
	{
	var obj=new Object();
	var i,j;
	obj.name=Cards[num].name;
	obj.count=Cards[num].count;
	obj.kubun=Cards[num].kubun;
	if ("MapType" in Cards[num]) obj.MapType=Cards[num].MapType;
					else	obj.MapType=0;
	if ("HeaderType" in Cards[num]) obj.HeaderType=Cards[num].HeaderType;
					else	obj.HeaderType=0;
	if ("spanDays" in Cards[num]) obj.spanDays=Cards[num].spanDays;
	if ("AllMapPosition" in Cards[num])	obj.AllMapPosition=Cards[num].AllMapPosition;
	if ("AllMapTitle" in Cards[num])	obj.AllMapTitle=Cards[num].AllMapTitle;
	if ("Buildings" in Cards[num])
		{
		obj.Buildings=new Object();
		obj.Buildings.Count=Cards[num].Buildings.Count;
		obj.Buildings.House=Cards[num].Buildings.House;
		}
	if ("Clip" in Cards[num])
		{
		obj.Clip=new Array();
		j=0;
		for(i in Cards[num].Clip)
			{
			obj.Clip[j]=new Object();
			obj.Clip[j].Seq=i;
			obj.Clip[j].Area=Cards[num].Clip[i].Area;
			if ("Zoom" in Cards[num].Clip[i])
				{
				obj.Clip[j].Zoom=Cards[num].Clip[i].Zoom;
				obj.Clip[j].Top=Cards[num].Clip[i].Top;
				obj.Clip[j].Left=Cards[num].Clip[i].Left;
				}
			j++;
			}
		}
	if ("Condominium" in Cards[num])
		{
		obj.Condominium=clone(Cards[num].Condominium);
		}
	if ("Comments" in Cards[num])
		{
		obj.Comments=clone(Cards[num].Comments);
		}
	obj.RTB=clone(Cards[num].RTB);
	WriteXMLFile(obj,ConfigXML(congnum,num));
	}

