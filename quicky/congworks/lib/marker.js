//---------------------------------------------------------
function LoadMarker(congnum,num)
	{
	var i,seq,str,ctr;
	var obj=SQ_Read("Markers","congnum="+congnum+" and num="+num,"seq");
	var result=new Object();
	result.Map=new Array();
	ctr=0;
	for(i=0;i<obj.length;i++)
		{
		seq=parseInt(obj[i].seq,10);
		result.Map[seq]=new Object();
		result.Map[seq].User=obj[i].user;
		result.Map[seq].Edited=obj[i].edited;
		result.Map[seq].Editor=obj[i].editor;
		str=obj[i].JSON_Points.replace(/'/g,"\"");
		result.Map[seq].Points=JSON.parse(str);
		ctr+=result.Map[seq].Points.length;
		}
	result.Count=ctr;
	return result;
	}

function SaveMarker(congnum,num,mobj)
	{
	var old,obj,str,i;
	var f,str;
	var arr=new Array();

	for(i in mobj.Map)
		{
		obj=new Object();
		obj.congnum=congnum;
		obj.num=num;
		obj.seq=i;
		obj.count=mobj.Map[i].Points.length;
		obj.user=mobj.Map[i].User;
		obj.edited=mobj.Map[i].Edited;
		obj.editor=mobj.Map[i].Editor;
		str=JSON.stringify(mobj.Map[i].Points);
		obj.JSON_Points=str.replace(/\"/g,"'");
		arr.push(obj);
		}
	SQ_Replace("Markers",arr);
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
function PushMarkerHistory(congnum,num,startday)
	{
	var i,j,mobj,obj;
	mobj=LoadMarker(congnum,num);
	if (mobj.Count==0) return;
	var arr=new Array();

	for(i in mobj.Map)
		{
		obj=new Object();
		obj.congnum=congnum;
		obj.num=num;
		obj.seq=i;
		obj.history=startday;
		obj.user=mobj.Map[i].User;
		obj.edited=mobj.Map[i].Edited;
		obj.editor=mobj.Map[i].Editor;
		arr.push(obj);
		}
	SQ_Replace("MarkerHistory",arr);
	}
//---------------------------------------------------------
function PopMarkerHistory(congnum,num,startday)
	{
	var i,seq,str,sql;
	var mhobj=SQ_Read("MarkerHistory","congnum="+congnum+" and num="+num+" and history="+startday,"seq");
	if (mhobj.length==0) return "no markerhistory";

	//	マーカー読込
	var mobj=LoadMarker(congnum,num);

	//	マーカー履歴の最新レコードを削除
	SQ_Delete("MarkerHistory","congnum="+congnum+" and num="+num+" and history="+startday);

	//	マーカー情報を履歴に基づいて更新
	for(i=0;i<mhobj.length;i++)
		{
		seq=parseInt(mhobj[i].seq);
		mobj.Map[seq].User=mhobj[i].user;
		mobj.Map[seq].Edited=mhobj[i].edited;
		mobj.Map[seq].Editor=mhobj[i].editor;
		}

	//	マーカー保存
	SaveMarker(congnum,num,mobj)

	return "Done";
	}
