function LoadMarker(congnum,num)
	{
	var obj,i,j,c;
	var result;
	obj=ReadXMLFile(NumFolder(congnum,num)+"marker.xml",true);
	if (obj=="")
		{
		obj=new Object();
		obj.Map=new Array();
		}
	if (!("Map" in obj))
		{
		obj.Map=new Array();
		}
	result=new Object();
	result.Map=new Array();
	c=0;
	for(i in obj.Map)
		{
		if ("Id" in obj.Map[i])
			{
			j=parseInt(obj.Map[i].Id,10);
			result.Map[j]=clone(obj.Map[i]);
			if (!("Points" in result.Map[j])) result.Map[j].Points=new Array();
			c+=result.Map[j].Points.length;
			}
		}
	result.Count=c;
	return result;
	}

function SaveMarker(congnum,num,mobj)
	{
	var obj,i,j;
	obj=new Object();
	obj.Map=new Array();
	obj.Count=0;
	j=0;
	for(i in mobj.Map)
		{
		mobj.Map[i].Id=i;
		obj.Map[j]=clone(mobj.Map[i]);
		obj.Count+=mobj.Map[i].Points.length;
		j++;
		}
	WriteXMLFile(obj,NumFolder(congnum,num)+"marker.xml");
	}
//-------------------------------------------------------------------------------
// マーカー表示(0:画面表示 1:通常区域印刷 2:ピックアップ表示中 3:個人区域印刷)
//-------------------------------------------------------------------------------
function DrawMarker(mobj,seq,zoomx,zoomy,printmode)
	{
	var s="";
	var i,j,vx,vy,vsize,vchar,vcolor,vh;
	var o;
	if (mobj.Count==0) return s;
	if (!(seq in mobj.Map)) return s;
	vcolor="ff0000";

	for(i=0;i<mobj.Map[seq].Points.length;i++)
		{
		o=mobj.Map[seq].Points[i];
		if (o.x=="building") continue;
		o.x=parseInt(o.x,10);
		o.y=parseInt(o.y,10);
		o.size=parseInt(o.size,10);
		vh=parseInt(o.History,10);
		vsize=Math.floor(o.size*zoomx);
		vx=Math.floor((o.x+o.size/2)*zoomx-vsize/2);
		vy=Math.floor((o.y+o.size/2)*zoomy-vsize/2);
		vchar="";
		switch (printmode)
			{
			case 0:	//	地図詳細表示
				if (vh==0) 	vchar="○";
				if (vh==1) 	vchar="◎";
//				if ((vh>=2)&&(vh<=3)) vchar="★";
				if (vh==2) vchar="★";
				break;
			case 1:	//	通常区域印刷
//				if ((vh>=2)&&(vh<=3)) vchar="★";
				if (vh==2) vchar="★";
				break;
			case 2:	//	個人区域表示
				if (vh==2) vchar="★";
				break;
			case 3:	//	個人区域印刷
				if (vh==2) vchar="★";
				break;
			default:
				break;
			}
		if (vchar=="") continue;
		s+="<div style='position:absolute;z-index:8;left:"+vx+"px;top:"+vy+"px;color:#"+vcolor+";font-size:"+vsize+"px;'>";
		s+=vchar+"</div>";
		}
	return s;
	}

//---------------------------------------------------------
// マーカー情報をビルに反映させる
// mode=0:会衆用  1=個人用(表示)  2=個人用(印刷)
//---------------------------------------------------------
function SetMarkersToBuilding(mode)
	{
	var i,j,k,o,mh,mtbl
	var isequence,istair,ifloor,iroom,iobj;
	for(i in Markers.Map)
		{
		for(j in Markers.Map[i].Points)
			{
			o=Markers.Map[i].Points[j];
			if (o.x!="building") continue;
			mh=parseInt(o.History,10);
			if ((mode==0)&&(mh!=2)) continue;
			if ((mode==1)&&(mh!=2)) continue;
			if ((mode==2)&&(mh!=2)) continue;
			mtbl=o.y.split(",");
			for(k=0;k<=Building.building.length;k++)
				{
				if (Building.building[k].id==mtbl[0])
					{
					isequence=parseInt(mtbl[1],10);
					istair=parseInt(mtbl[2],10);
					ifloor=parseInt(mtbl[3],10);
					iroom=parseInt(mtbl[4],10);
					iobj=Building.building[k].sequence[isequence].stair[istair].floor[ifloor].room[iroom];
					iobj.Mark=new Object();
					if (mode==0) iobj.Mark.char="★";
					if (mode==1) iobj.Mark.char="★*";
					if (mode==2) iobj.Mark.char="★";
					//ff.WriteLine(k+","+isequence+","+istair+","+","+ifloor+","+iroom+","+iobj.Mark.char);	//	debug
					break;
					}
				}
			}
		}
	//ff.close();
	}
//---------------------------------------------------------
function IncMarkerHistory()
	{
	var i,j,v;
	for(i in Markers.Map)
		{
		for(j=0;j<Markers.Map[i].Points.length;j++)
			{
			v=parseInt(Markers.Map[i].Points[j].History,10);
			if ((v==1)&&(Markers.Map[i].Edited!="True")) continue;	//	ヒストリー1から2へは編集無しでは進まない
			v++;
			Markers.Map[i].Points[j].History=v;
			}
		Markers.Map[i].Edited="False";
		Markers.Map[i].Editor="";
		Markers.Map[i].User="";
		}
	}
function DecMarkerHistory()
	{
	var i,j,k,v;
	var copy=new Object();
	copy.Points=new Array();
	k=0;
	for(i in Markers.Map)
		{
		for(j in Markers.Map[i].Points)
			{
			v=parseInt(Markers.Map[i].Points[j].History,10);
			if ((v==1)&&(Markers.Map[i].Edited!="True")) continue;	//	ヒストリー1から2へは編集無しでは進まない
			v--;
			if (v<0) {delete Markers.Map[i].Points[j];continue;}
			Markers.Map[i].Points[j].History=v;
			}
		}
	}
//---------------------------------------------------------
function PushMarkerHistory(congnum,num)
	{
	var f,ln,s,i,fc;
	f=ReadFile(NumFolder(congnum,num)+"marker.xml");
	if (f=="") return;
	ln=f.split("\r\n");
	s="<split>\r\n";
	for(i=0;i<ln.length;i++)
		{
		if (ln[i].indexOf("<Map",0)!=0) continue;
		s+=ln[i]+"\r\n";
		}
	fc=fso.OpenTextFile(NumFolder(congnum,num)+"markerhistory.xml",8,true);
	fc.write(s);
	fc.close();
	}
//---------------------------------------------------------
function PopMarkerHistory(congnum,num)
	{
	var f,f1,f2,ln,s,p1,p2,i,j,fc;
	var bodyo,bodyn,tbl;
	var TBL1=new Array();
	var TBL2=new Array();
	//	マーカー履歴読込
	f1=ReadFile(NumFolder(congnum,num)+"markerhistory.xml");
	if (f1=="") return "no markerhistory";
	p=f1.lastIndexOf("<split>");
	if (p==-1) return "no split";
	p2=f1.indexOf("<Map",p);
	if (p2==-1) return "no maptag";
	//	現行マーカーファイル読込
	f2=ReadFile(NumFolder(congnum,num)+"marker.xml");
	if (f2=="") return "no marker";
	//	マーカー履歴から最新分を削って出力
	bodyo=f1.substring(0,p);
	bodyn=f1.substring(p2,f1.length);
	fc=fso.CreateTextFile(NumFolder(congnum,num)+"markerhistory.xml",true);
	fc.Write(bodyo);
	fc.close();
	//	マーカー履歴を地図ID別に保存
	tbl=bodyn.split("\r\n");
	for(i=0;i<tbl.length;i++)
		{
		p1=tbl[i].indexOf("Id=",0);
		if (p1==-1) continue;
		p2=tbl[i].indexOf("\"",p1+4);
		if (p2==-1) continue;
		s=tbl[i].substring(p1+4,p2);
		TBL1[s]=tbl[i];
		}
	//	マーカーファイルを地図ID別に置換していく
	tbl=f2.split("\r\n");
	for(i=0;i<tbl.length;i++)
		{
		p=tbl[i].indexOf("<Map",0);
		if (p!=0) continue;
		p1=tbl[i].indexOf("Id=",p);
		if (p1==-1) continue;
		p2=tbl[i].indexOf("\"",p1+4);
		if (p2==-1) continue;
		s=tbl[i].substring(p1+4,p2);
		tbl[i]=TBL1[s];
		}
	//	マーカー最新版ファイルを出力
	s=tbl.join("\r\n");
	fc=fso.CreateTextFile(NumFolder(congnum,num)+"marker.xml",true);
	fc.Write(s);
	fc.close();
	return "Done";
	}
