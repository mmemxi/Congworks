var Markers;
var TempMarker=new Object();
var MarkerSize=40;
var MarkerCursorX=0;
var MarkerCursorY=0;
var MarkerType=0;
var MarkerTable=new Array("○","●","×","◎","？","！","☆","★");
var MarkerEditor;
//---------------------------------------------------------
function LoadMarker_old(num)
	{
	var obj,i,j,c;
	var result;
	obj=ReadXMLFile(MarkerFile(num),true);
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

//---------------------------------------------------------
function LoadMarker(num)
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
//---------------------------------------------------------
function LoadMarkers()
	{
	var i,c,num,seq,str;
	var obj=SQ_Read("Markers","congnum="+congnum,"num,seq");
	var result=new Array();
	for(i=0;i<obj.length;i++)
		{
		num=parseInt(obj[i].num,10);
		seq=parseInt(obj[i].seq,10);
		if (!(num in result))
			{
			result[num]=new Object();
			result[num].Count=0;
			result[num].Map=new Array();
			}
		result[num].Map[seq]=new Object();
		result[num].Map[seq].User=obj[i].user;
		result[num].Map[seq].Edited=obj[i].edited;
		result[num].Map[seq].Editor=obj[i].editor;
		str=obj[i].JSON_Points.replace(/'/g,"\"");
		result[num].Map[seq].Points=JSON.parse(str);
		c=result[num].Map[seq].Points.length;
		result[num].Count+=c;
		}
	return result;
	}
//---------------------------------------------------------
function SaveMarker(num,mobj)
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
// マーカー表示(0:会衆用地図表示 1:会衆用地図印刷 2:個人用地図表示 3:個人用地図印刷)
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
			case 0:	//	会衆用地図表示
				if (vh==0) 	vchar="○";
				if (vh==1) 	vchar="◎";
//				if ((vh>=2)&&(vh<=3)) vchar="★";
				if (vh==2) vchar="★";
				break;
			case 1:	//	会衆用地図印刷
//				if ((vh>=2)&&(vh<=3)) vchar="★";
				if (vh==2) vchar="★";
				break;
			case 2:	//	個人地図表示
				if (vh==2) vchar="★";
				break;
			case 3:	//	個人地図印刷
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
// マーカー情報をビルに反映   mode=0:会衆用  mode=1:個人用
//---------------------------------------------------------
var debugname="";
//---------------------------------------------------------
function SetMarkersToBuilding(Bobj,mobj,mode)
	{
	var ABobj=GetBobj(Bobj);
	var i,j,k,o,mh,mtbl
	var isequence,istair,ifloor,iroom,iobj;
	for(i in mobj.Map)
		{
		for(j in mobj.Map[i].Points)
			{
			o=mobj.Map[i].Points[j];
			if (o.x!="building") continue;
			mh=parseInt(o.History,10);
			if ((mode==0)&&(mh>2)) continue;	//	会衆用（表示）
			if ((mode==1)&&(mh!=2)) continue;	//	個人用（表示）
			mtbl=o.y.split(",");
			for(k=0;k<=ABobj.building.length;k++)
				{
				try{
					if (ABobj.building[k].id==mtbl[0])
						{
						isequence=parseInt(mtbl[1],10);
						istair=parseInt(mtbl[2],10);
						ifloor=parseInt(mtbl[3],10);
						iroom=parseInt(mtbl[4],10);
						iobj=ABobj.building[k].sequence[isequence].stair[istair].floor[ifloor].room[iroom];
						iobj.Mark=new Object();
						if (mh==0) 	iobj.Mark.type="NewO";
						if (mh==1) 	iobj.Mark.type="oldOO";
						if (mh==2)	iobj.Mark.type="star";
						break;
						}
					}
				catch(e)
					{
					if (mtbl[0]!=debugname)
						{
						debugname=mtbl[0];
						alert("マーカー情報が異常です。\n物件名:"+mtbl[0]+"\n棟番号:"+isequence+"\n階段番号:"+istair+"\n階:"+ifloor+"部屋番号:"+iroom);
						}
					}
				}
			}
		}
	}
//---------------------------------------------------------
function DrawEditMarker()
	{
	var s="";
	var i,vx,vy,vsize,vchar;
	for(i=0;i<TempMarker.Points.length;i++)
		{
		vx=TempMarker.Points[i].x;
		vy=TempMarker.Points[i].y;
		vsize=TempMarker.Points[i].size;
		vh=parseInt(TempMarker.Points[i].History,10);
		//	vhの値　0:付けたばかり 1:１回目経過　2:★化 3:継続 4:なし
		if (vh>2) continue;
		vchar="";
		switch(vh)
			{
			case 0:	vchar="○";
					break;
			case 1:	vchar="◎";
					break;
			case 2:	vchar="★";
					break;
			default:
					break;
			}
		s+="<div style='position:absolute;z-index:8;left:"+vx+"px;top:"+vy+"px;color:#ff0000;font-size:"+vsize+"px;cursor:pointer;' ";
		s+="onclick='EditMarker_MarkOff("+i+")'>"+vchar+"</div>";
		}
	ClearLayer("Drag");
	WriteLayer("Drag",s);
	ShowLayer("Drag");
	}
//---------------------------------------------------------
function EditMarker(num,seq,Editor)
	{
	var c;
	if (Editor!="MasterClient") CloseFloatings();
	MarkerEditor=Editor;
	MarkerType=0;
	Markers=LoadMarker(num);
	var i,j,k,s,found,file,r,tbl,cl;
	var BG="";
	var rx=new Array();
	RDTitle=document.title;
	RDragObj=num;
	r=GetImageInfo(PNGFile(num,seq));
	ClearKey();
	ClearLayer("Stage");	//　地図レイヤー
	ClearLayer("Terop");
	ClearLayer("Mask");		//	特記レイヤー
	ClearLayer("Drag");		//	マウス操作レイヤー

	if (seq in Markers.Map)
		{
		TempMarker=clone(Markers.Map[seq]);
		}
	else{
		TempMarker.Points=new Array();
		}
	document.title="マークの編集";
	Keys[11]="";
	
	//	1.地図レイヤー
	s="<img src='"+PNGFile(num,seq)+"' style='position:absolute;z-index:0;top:0px;left:0px;'>";
	WriteLayer("Stage",s);

	//	2.マウスカーソルレイヤー

	//	3.当たり判定レイヤー
	s="<img src='"+BlankGIF()+"' width="+r.x+" height="+r.y+" style='position:absolute;z-index:6;top:0px;left:0px;' ";
	s+="onclick='EditMarker_MarkOn("+seq+")' onmousewheel='EditMarker_Wheel();return false;' onmousemove='EditMarker_Mousemove()' ";
	s+="onmouseout='EditMarker_MarkOut()'>";
	ShowLayer("Mask");
	WriteLayer("Mask",s);

	//	4.設置済みマーカー
	DrawEditMarker();
	window.scrollTo(0,0);

	s="左クリック：１回目留守宅マーク記入／消去<br>";
	s+="Shift+左クリック：２回目留守宅マーク記入<br>";
	s+="ホイール：拡大／縮小<br>";
	s+=AddKeys(1,"確定","EndofEditMarker("+num+","+seq+",true)");
	s+=AddKeys(2,"強制送り","SendAll()");
	s+=AddKeys(0,"戻る","EndofEditMarker("+num+","+seq+",false)");
	FloatingMenu.Title="マーカー編集";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",50,50,10,250,140);
	RscrollX=50;RscrollY=50;
	window.onscroll=WriteMap_Scroll;
	document.body.focus();
//	document.body.onmousewheel=EditMarker_Wheel;
	}

function SendAll()
	{
	var i,vh;
	var c=confirm("全てのマーカーを１段階進めてもいいですか？");
	if (!c) return;
	for(i=0;i<TempMarker.Points.length;i++)
		{
		vh=parseInt(TempMarker.Points[i].History,10);
		TempMarker.Points[i].History=vh+1;
		}
	DrawEditMarker();
	}

function SetMarker(num)
	{
	MarkerType=num;
	DrawEditCursor();
	}

function ChangeMarker()
	{
	MarkerType++;
	if (MarkerType>=MarkerTable.length) MarkerType=0;
	DrawEditCursor();
	}

function EditMarker_MarkOut()
	{
	ClearLayer("Terop");
	}

function EditMarker_Mousemove()
	{
	var mx,my;
	mx=event.offsetX;
	my=event.offsetY;
	MarkerCursorX=mx-Math.floor(MarkerSize/2);
	MarkerCursorY=my-Math.floor(MarkerSize/2);
	DrawEditCursor();
	}

function DrawEditCursor()
	{
	var s;
	var c="○";
	if (ShiftKey) c="◎";
	s="<div style='position:absolute;left:"+MarkerCursorX+"px;top:"+MarkerCursorY+"px;z-index:5;color:#77aa77;font-size:"+MarkerSize+"px;'>";
	s+=c+"</div>";
	ClearLayer("Terop");
	WriteLayer("Terop",s);
	}

function EditMarker_MarkOn(seq)
	{
	var mx,my,i;
	var o,c;
	mx=event.offsetX;
	my=event.offsetY;
	i=TempMarker.Points.length;
	TempMarker.Points[i]=new Object();
	o=TempMarker.Points[i];
	o.x=mx-Math.floor(MarkerSize/2);
	o.y=my-Math.floor(MarkerSize/2);
	o.size=MarkerSize;
	o.char="○";
	if (ShiftKey) o.History=1;else o.History=0;
	DrawEditMarker();
	}

function EditMarker_MarkOff(num)
	{
	TempMarker.Points.splice(num,1);
	DrawEditMarker();
	}

function EditMarker_Wheel()
	{
	var a;
	var mx,my;
	mx=event.offsetX;
	my=event.offsetY;
	a=event.wheelDelta;
	if (a==120)
		{
		MarkerSize+=4;
		}
	if (a==-120)
		{
		MarkerSize-=4;
		if (MarkerSize<8) MarkerSize=8;
		}
	MarkerCursorX=mx-Math.floor(MarkerSize/2);
	MarkerCursorY=my-Math.floor(MarkerSize/2);
	DrawEditCursor();
	}

//-------------------------------------------------------------------------------
function EndofEditMarker(num,seq,mode)
	{
	var i,j,v;
	var copy=new Array();
	if (!mode)
		{
		v=confirm("編集結果を保存せずに終了しますか？");
		if (!v) return;
		}

	var cobj=getPublicLogs(num);

	document.title=RDTitle;
	window.onscroll="";
	FloatingMenu.Close();
	ClearLayer("Terop");
	ClearLayer("Mask");
	ClearLayer("Drag");
	if (mode)
		{
		if (!(seq in Markers.Map))
			{
			Markers.Map[seq]=new Object();
			Markers.Map[seq].User="";
			Markers.Map[seq].Edited="False";
			Markers.Map[seq].Editor="";
			Markers.Map[seq].Points=new Array();
			}
		if (cobj.Status.indexOf("使用中",0)==-1)	Markers.Map[seq].Edited="True";
											else	Markers.Map[seq].Edited="False";
		Markers.Map[seq].Editor=MarkerEditor;
		Markers.Map[seq].Points=clone(TempMarker.Points);
		if (Markers.Map[seq].Points.length==0)
			{
			delete Markers.Map[seq];
			}
		SaveMarker(num,Markers);
		}
	if (MarkerEditor=="MasterClient")
		{
		MENU6B();
		}
	else{
		MENU1PBig(num,seq);
		}
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
