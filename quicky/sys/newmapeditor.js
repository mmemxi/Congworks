//----------------------------------------------------------------
// 変数一覧
//----------------------------------------------------------------
var NM_mapnum,NM_mapseq;
var NM_oldmap,NM_newmap;
var NM_NMctr;
var NM_nowCursor=new Object();
var inputxml;
NM_nowCursor.Size=4;
var NM_csize=new Array(20,28,36,44);
var NM_zoom=100;
var NM_mapx=0;
var NM_mapy=0;
var NM_mouse=new Object();
var NM_DispBuildings=new Array();
var NM_zoomx,NM_zoomy;
NM_mouse.x=0;
NM_mouse.y=0;
NM_mouse.downx=0;
NM_mouse.downy=0;
NM_mouse.down=false;
NM_mouse.beforex=0;
NM_mouse.beforey=0;
var NM_HitTable=new Array();
//----------------------------------------------------------------
function StartNewMapEditor(num,seq)
	{
	var i,j,k,name,s,o,t,vh;
	var rmap,bx,by,bimage;
	var to,ttbl,isequence,istair,ifloor,iroom,io;
	var tmk;

	//	前画面消去
	ClearLayer("Stage");
	SetOverflow("");
	ShowLayer("NMAIN");
	ShowLayer("NPANEL");
	NMAIN.style.top="100px";
	SetOverflow("");

	//	項目初期化
	NM_zoom=100;
	NM_nowCursor.Size=4;
	NM_StartMouseEvent();
	NM_zoomx=680/2126;
	NM_zoomy=756/2362;
	NM_zoomx=0.9;
	NM_zoomy=0.9;

	//	マーカー情報の読込
	tmk=LoadMarker(num);
	NM_mapnum=num;
	NM_mapseq=seq;
	NM_oldmap="";
	NM_oldmap=clone(tmk.Map[seq]);
	if (!("Points" in NM_oldmap))
		{
		NM_oldmap.Points=new Array();
		}
	NM_newmap=new Object();
	NM_newmap.Points=new Array();

	//	ビル情報の読込
	Building=ReadXMLFile(BuildingFile(num),true);
	if (Building=="")	Building=new Object();
	if (!("building" in Building))	Building.building=new Array();

	//	ビル内にあるマーカーはビル情報へ、ヒストリー０（今回編集）は新テーブルに移動
	for(i=0;i<NM_oldmap.Points.length;i++)
		{
		vh=parseInt(NM_oldmap.Points[i].History,10);
		if (vh>=2) continue;

		if (NM_oldmap.Points[i].x=="building")
			{
			ttbl=NM_oldmap.Points[i].y.split(",");
			k=-1;
			for(j=0;j<Building.building.length;j++)
				{
				if (Building.building[j].id==ttbl[0]){k=j;break;}
				}
			if (k!=-1)
				{
				isequence=ttbl[1];
				istair=ttbl[2];
				ifloor=ttbl[3];
				iroom=ttbl[4];
				to=Building.building[k].sequence[isequence].stair[istair].floor[ifloor].room[iroom];
				to.Mark=new Object();
				to.Mark.History=vh;
				if (vh==0)	{
							to.Mark.type="NewO";
							}
					else	{
							if (NM_oldmap.Points[i].char=="○") to.Mark.type="oldO";
							else to.Mark.type="oldX";
							}
				}
			NM_oldmap.Points.splice(i,1);
			i--;
			continue;
			}

		if (NM_oldmap.Points[i].History=="0")
			{
			o=clone(NM_oldmap.Points[i]);
			o.deleted=false;
			NM_newmap.Points.push(o);
			NM_oldmap.Points.splice(i,1);
			i--;
			}
		}

	//	描画開始
	s="<div id='NMBG' style='position:absolute;top:0px;left:0px;z-index:0;transform-origin:0 0;'>";
	s+="<img src='"+PNGFile(num,seq)+"'>";
	s+="</div>";
	s+="<div id='NM_oldmarker' style='position:absolute;top:0px;left:0px;z-index:1;transform-origin:0 0;'></div>";
	s+="<div id='NM_newmarker' style='position:absolute;top:0px;left:0px;z-index:2;transform-origin:0 0;'></div>";

	//	ビル情報を重ねる
	NM_DispBuildings=new Array();
	s+="<div id='NM_buildings' style='position:absolute;top:0px;left:0px;z-index:3;transform-origin:0 0;'>";
	for(i in Building.building)
		{
		rmap=parseInt(Building.building[i].map,10);
		if (rmap!=seq) continue;
		s+=CreateBuildingImage(num,seq,0,i,"",1,1,7);
//		s+=CreateBuildingImage(num,seq,0,i,"",NM_zoomx,NM_zoomy,7);
		}
	s+="</div>";
	NMAIN.innerHTML=s;

	//	留守宅マークのヒット判定を追加
	NM_HitTable=new Array();
	
	//	ビルのあたり判定
	for(i=0;i<NM_DispBuildings.length;i++)
		{
		o=new Object();
		t=NM_DispBuildings[i];
		o.x1=t.x;
		o.y1=t.y;
		o.x2=t.x+t.width-1;
		o.y2=t.y+t.height-1;
		o.type=-1;
		o.no=0;
		o.func="";
		NM_HitTable.push(o);
		}

	//	旧マーカー
	for(i=0;i<NM_oldmap.Points.length;i++)
		{
		o=new Object();
		t=NM_oldmap.Points[i];
		if (parseInt(t.History,10)>=2) continue;
		o.x1=parseInt(t.x,10);
		o.y1=parseInt(t.y,10);
		o.x2=o.x1+parseInt(t.size,10)-1;
		o.y2=o.y1+parseInt(t.size,10)-1;
		o.type=0;
		o.no=i;
		o.func="NM_ChangeOldMarker("+i+")";
		NM_HitTable.push(o);
		}

	//	新マーカー
	for(i=0;i<NM_newmap.Points.length;i++)
		{
		o=new Object();
		t=NM_newmap.Points[i];
		o.x1=parseInt(t.x,10);
		o.y1=parseInt(t.y,10);
		o.x2=o.x1+parseInt(t.size,10)-1;
		o.y2=o.y1+parseInt(t.size,10)-1;
		o.type=1;
		o.no=i;
		o.func="NM_DelNewMarker("+i+")";
		NM_HitTable.push(o);
		}

	ClearKey();
	RDTitle=document.title;
	document.title="マーカー編集";

	setTimeout("NM_DrawScreen()",50);
	}
//----------------------------------------------------------------
function NM_StartMouseEvent()
	{
//	window.attachEvent("onmousedown",NM_mousedown);
//	window.attachEvent("onmousemove",NM_mousemove);
//	window.attachEvent("onmouseup",  NM_mouseup);
//	window.attachEvent("onmouseout", NM_mouseout);
//	window.attachEvent("onmousewheel",NM_wheel);
//	window.addEventListner("resize",NM_DrawScreen,false);
	}
function NM_EndMouseEvent()
	{
//	window.detachEvent("onmousedown",NM_mousedown);
//	window.detachEvent("onmousemove",NM_mousemove);
//	window.detachEvent("onmouseup",  NM_mouseup);
//	window.detachEvent("onmouseout", NM_mouseout);
//	window.detachEvent("onmousewheel",NM_wheel);
//	window.removeEventListner("resize",NM_DrawScreen,false);
	}
//----------------------------------------------------------------
function NM_mousedown()
	{
	NM_mouse.downx=NM_mouse.x;
	NM_mouse.downy=NM_mouse.y;
	NM_mouse.down=true;
	}

function NM_mousemove()
	{
	var x,y,dx,dy,wx,wy;
	x=event.clientX;
	y=event.clientY;
	NM_mouse.beforex=NM_mouse.x;
	NM_mouse.beforey=NM_mouse.y;
	wx=document.documentElement.clientWidth;
	wy=document.documentElement.clientHeight;
	if (NM_mouse.down)
		{
		dx=Math.floor((x-NM_mouse.beforex)*(100/NM_zoom));
		dy=Math.floor((y-NM_mouse.beforey)*(100/NM_zoom));
		NM_mapx+=dx;NM_mapy+=dy;
		NM_MoveScreen();
		}
	NM_mouse.x=x;NM_mouse.y=y;
	}

function NM_mouseup()
	{
	var r;
	NM_mouse.down=false;
	if ((NM_mouse.x==NM_mouse.downx)&&(NM_mouse.y==NM_mouse.downy)&&(NM_mouse.y>=100))
		{
		NM_HitCheck();
		}
	}

function NM_mouseout()
	{
	NM_mouse.down=false;
	}

function NM_wheel()
	{
	var x,y;
	x=event.clientX;y=event.clientY;
	NM_mouse.x=x;NM_mouse.y=y;

	var bx=Math.floor((NM_mouse.x-8)*(100/NM_zoom))-NM_mapx;
	var by=Math.floor((NM_mouse.y-108)*(100/NM_zoom))-NM_mapy;

	var delta = event.wheelDelta;
	if (delta < 0)
		{
		NM_zoom-=6;
		}
	else if (delta > 0){
		NM_zoom+=6;
		}

	if (NM_zoom>100) NM_zoom=100;
	if (NM_zoom<25) NM_zoom=25;

	NM_mapx=Math.floor(NM_mouse.x*(100/NM_zoom)-bx);
	NM_mapy=Math.floor((NM_mouse.y-108)*(100/NM_zoom)-by);

	var jx=Math.floor(NM_mouse.x*(100/NM_zoom))-NM_mapx;
	var jy=Math.floor((NM_mouse.y-108)*(100/NM_zoom))-NM_mapy;

	NM_DrawScreen();
	}
//----------------------------------------------------------------
function NM_ZoomButton(delta)
	{
	var x,y;
	var wx=document.documentElement.clientWidth;
	var wy=document.documentElement.clientHeight;
	x=Math.floor(wx/2);
	y=Math.floor((wy-100)/2);
	var bx=Math.floor(x*(100/NM_zoom))-NM_mapx;
	var by=Math.floor(y*(100/NM_zoom))-NM_mapy;
	NM_zoom+=delta;
	if (NM_zoom>100) NM_zoom=100;
	if (NM_zoom<25) NM_zoom=25;
	NM_mapx=Math.floor(x*(100/NM_zoom)-bx);
	NM_mapy=Math.floor(y*(100/NM_zoom)-by);
	NM_DrawScreen();
	}
//----------------------------------------------------------------
function NM_HitCheck()
	{
	var i,t,s,mx,my,msize;
	var x,y,x1,x2,y1,y2,px,py,obj,oelm,elm,o;
	var hit=false;

	x=Math.floor((NM_mouse.x-8)*(100/NM_zoom));
	y=Math.floor((NM_mouse.y-108)*(100/NM_zoom));
	px=x-NM_mapx;
	py=y-NM_mapy;
	
	for(i=0;i<NM_HitTable.length;i++)
		{
		t=NM_HitTable[i];
		x1=t.x1;x2=t.x2;y1=t.y1;y2=t.y2;
		if ((px>=x1)&&(px<=x2)&&(py>=y1)&&(py<=y2))
			{
			if (t.func!="") eval(t.func);
			hit=true;
			break;
			}
		}

	if (!hit)
		{
		mx=Math.floor((NM_mouse.x-8)*(100/NM_zoom)-NM_mapx);
		my=Math.floor((NM_mouse.y-108)*(100/NM_zoom)-NM_mapy);
		if ((mx<0)||(mx>2126)||(my<0)||(my>2362)) return;
		msize=NM_csize[NM_nowCursor.Size-1];
		obj=new Object();
		obj.x=mx-Math.floor(msize/2);			//	20180322
		obj.y=my-Math.floor(msize/2);			//	20180322
		obj.size=msize;
		obj.char="○";
		obj.History=0;
		obj.deleted=false;
		NM_newmap.Points.push(obj);

		oelm=NM_newmarker.innerHTML;
		elm="<div id=NM"+NM_NMctr+" style=\"position:absolute;z-index:8;left:"+obj.x+"px;top:"+obj.y+"px;cursor:pointer;\">";
		elm+="<img src='./sys/marks/round-red.png' width="+obj.size+" height="+obj.size+"></div>";
		NM_newmarker.innerHTML=oelm+elm;

		o=new Object();
		o.x1=obj.x;
		o.y1=obj.y;
		o.x2=o.x1+obj.size-1;
		o.y2=o.y1+obj.size-1;
		o.type=1;
		o.no=NM_NMctr;
		o.func="NM_DelNewMarker("+NM_NMctr+")";
		NM_HitTable.push(o);
		NM_NMctr++;
		}
	}
//----------------------------------------------------------------
function NM_DrawPanel()
	{
	var wx=document.documentElement.clientWidth;
	var wy=document.documentElement.clientHeight;
	var wx0=Math.floor((wx-(100*6))/2);
	s="<table border=0 cellpadding=0 cellspacing=8 style='width:"+wx+"px;height:40px;'><tr>";
	s+="<td><div class=SetButton_Off style='width:"+wx0+"px;' onclick='NM_CancelIt()'>";
	s+="<div style='position:relative;top:-2px;left:0px;font-size:28px;'>中止</div></div></td>";

	s+="<td><div class=SetButton_";
	if (NM_nowCursor.Size==1) s+="On";else s+="Off";
	s+=" style='width:36px;' onclick='NM_ChangeCursor(1)'>";
	s+="<div style='position:relative;top:8px;left:0px;'>";
	s+="<img src='./sys/marks/round-red.png' width=20 height=20>";
	s+="</div></div></td>";

	s+="<td><div class=SetButton_";
	if (NM_nowCursor.Size==2) s+="On";else s+="Off";
	s+=" style='width:36px;' onclick='NM_ChangeCursor(2)'>";
	s+="<div style='position:relative;top:3px;left:0px;'>";
	s+="<img src='./sys/marks/round-red.png' width=28 height=28>";
	s+="</div></div></td>";

	s+="<td><div class=SetButton_";
	if (NM_nowCursor.Size==3) s+="On";else s+="Off";
	s+=" style='width:36px;' onclick='NM_ChangeCursor(3)'>";
	s+="<div style='position:relative;top:-1px;left:0px;'>";
	s+="<img src='./sys/marks/round-red.png' width=36 height=36>";
	s+="</div></div></td>";

	s+="<td><div class=SetButton_";
	if (NM_nowCursor.Size==4) s+="On";else s+="Off";
	s+=" style='width:36px;' onclick='NM_ChangeCursor(4)'>";
	s+="<div style='position:relative;top:-5px;left:-4px;'>";
	s+="<img src='./sys/marks/round-red.png' width=44 height=44>";
	s+="</div></div></td>";

	s+="<td><div class=SetButton_Off style='width:36px;' onclick='NM_ZoomButton(6)'>";
	s+="<div style='position:relative;top:-5px;left:-4px;'>";
	s+="<img src='./sys/marks/big.png' width=44 height=44></div></div></td>";

	s+="<td><div class=SetButton_Off style='width:36px;' onclick='NM_ZoomButton(-6)'>";
	s+="<div style='position:relative;top:-5px;left:-4px;'>";
	s+="<img src='./sys/marks/small.png' width=44 height=44></div></div></td>";

	s+="<td><div class=SetButton_Off style='width:"+wx0+"px;' onclick='NM_EndofJob()'>";
	s+="<div style='position:relative;top:-2px;left:0px;font-size:28px;'>完了</div></div></td>";
	s+="</tr></table>";
	NPANEL.innerHTML=s;
	}

function NM_DrawScreen()
	{
	var i,vd,vx,vy,vsize,vchar;
	var wx=document.documentElement.clientWidth;
	var wy=document.documentElement.clientHeight;
	var wx0=Math.floor((wx-(48*4))/2);
	var s;

	NM_DrawPanel();
	NMAIN.style.width=(wx-16)+"px";
	NMAIN.style.height=(wy-124)+"px";
	if (NM_mapx-wx<-2126) NM_mapx=-2126+wx;
	if (NM_mapy-wy<-2362) NM_mapy=-2362+wy;
	NM_MoveScreen();

	//	旧マーカー描画
	s="";
	for(i=0;i<NM_oldmap.Points.length;i++)
		{
		vh=parseInt(NM_oldmap.Points[i].History,10);
		if (vh>=2) continue;
		vx=NM_oldmap.Points[i].x;
		vy=NM_oldmap.Points[i].y;
		vsize=NM_oldmap.Points[i].size;
		vchar=NM_oldmap.Points[i].char;
		s+="<div id=OM"+i+" style='position:absolute;z-index:8;left:"+vx+"px;top:"+vy+"px;cursor:pointer;'>";
		s+="<img src='./sys/marks/";
		if (vchar=="○") s+="round-blue.png"; else s+="cross-blue.png";
		s+="' width="+vsize+" height="+vsize+"></div>";
		}
	NM_oldmarker.innerHTML=s;

	//	新マーカー描画
	s="";
	NM_NMctr=0;
	for(i=0;i<NM_newmap.Points.length;i++)
		{
		NM_NMctr++;
		vd=NM_newmap.Points[i].deleted;
		if (vd) continue;
		vx=NM_newmap.Points[i].x;
		vy=NM_newmap.Points[i].y;
		vsize=NM_newmap.Points[i].size;
		s+="<div id=NM"+i+" style='position:absolute;z-index:8;left:"+vx+"px;top:"+vy+"px;cursor:pointer;'>";
		s+="<img src='./sys/marks/round-red.png' width="+vsize+" height="+vsize+"></div>";
		}
	NM_newmarker.innerHTML=s;
	}
//---------------------------------------------------------
function NM_MoveScreen()
	{
	var sx,sy;
	var sz;
	sx=Math.floor(NM_mapx/(100/NM_zoom));
	sy=Math.floor(NM_mapy/(100/NM_zoom));

	NMBG.style.left=sx+"px";
	NMBG.style.top=sy+"px";
	NM_oldmarker.style.left=sx+"px";
	NM_oldmarker.style.top=sy+"px";
	NM_newmarker.style.left=sx+"px";
	NM_newmarker.style.top=sy+"px";
	NM_buildings.style.left=sx+"px";
	NM_buildings.style.top=sy+"px";

	NMBG.style.zoom=NM_zoom+"%";
	NM_oldmarker.style.zoom=NM_zoom+"%";
	NM_newmarker.style.zoom=NM_zoom+"%";
	NM_buildings.style.zoom=NM_zoom+"%";
	}
//---------------------------------------------------------
function NM_ChangeCursor(cursortype)
	{
	NM_nowCursor.Size=cursortype;
	NM_DrawPanel();
	}
//---------------------------------------------------------
function NM_ChangeOldMarker(markerno)
	{
	var s;
	var vsize=NM_oldmap.Points[markerno].size;
	var vchar=NM_oldmap.Points[markerno].char;
	if (vchar=="○") vchar="×";else vchar="○";
	NM_oldmap.Points[markerno].char=vchar;
	s="<img src='./sys/marks/";
	if (vchar=="○") s+="round-blue.png"; else s+="cross-blue.png";
	s+="' width="+vsize+" height="+vsize+">";
	window["OM"+markerno].innerHTML=s;
	}
//---------------------------------------------------------
function NM_DelNewMarker(markerno)
	{
	var i;
	var elm=document.getElementById("NM"+markerno);
	NM_newmap.Points[markerno].deleted=true;
	document.getElementById("NM_newmarker").removeChild(elm);
	for(i=0;i<NM_HitTable.length;i++)
		{
		if ((NM_HitTable[i].type==1)&&(NM_HitTable[i].no==markerno))
			{
			NM_HitTable.splice(i,1);
			break;
			}
		}
	}
//---------------------------------------------------------
function NM_CancelIt()
	{
	var r=confirm("この作業を中止しますか？\n（ここまでの作業結果は破棄されます）");
	if  (!r) {NM_DrawPanel();return;}

	//	イベントの終了
	NM_EndMouseEvent();

	//	画面戻す
	document.title=RDTitle;
	ClearLayer("NMAIN");
	ClearLayer("NPANEL");
	HideLayer("NMAIN");
	HideLayer("NPANEL");

	MENU6B();
	}
//---------------------------------------------------------
function NM_EndofJob()
	{
	var r=confirm("これで作業を完了してもよろしいですか？");
	if  (!r) {NM_DrawPanel();return;}

	var i,j,tmk,p;
	var r1,r2,rc,obj;
	var to,isequence,istair,ifloor,iroom,io,vchar;
	var outmap=new Object();
	outmap.Points=new Array();

	//	イベントの終了
	NM_EndMouseEvent();

	//	画面戻す
	document.title=RDTitle;
	ClearLayer("NMAIN");
	ClearLayer("NPANEL");
	HideLayer("NMAIN");
	HideLayer("NPANEL");

	//	マーカーオブジェクトの読み直し
	tmk=LoadMarker(NM_mapnum);

	//	旧マークの処理結果整理
	for(i=0;i<NM_oldmap.Points.length;i++)
		{
		if (NM_oldmap.Points[i].char=="×") continue;	//	×にしたものは除外
		outmap.Points.push(NM_oldmap.Points[i]);
		}

	//	新マークの処理結果整理
	for(i=0;i<NM_newmap.Points.length;i++)
		{
		if (NM_newmap.Points[i].deleted) continue;	//	削除済は除外
		outmap.Points.push(NM_newmap.Points[i]);
		}

	//	集合住宅上のマークの処理結果出力
	for(i in Building.building)
		{
		j=parseInt(Building.building[i].map,10);
		if (j!=NM_mapseq) continue;
		to=Building.building[i]
		for (isequence in to.sequence)
			{
			for (istair in to.sequence[isequence].stair)
				{
				for (ifloor in to.sequence[isequence].stair[istair].floor)
					{
					for (iroom in to.sequence[isequence].stair[istair].floor[ifloor].room)
						{
						io=to.sequence[isequence].stair[istair].floor[ifloor].room[iroom];
						if ("Mark" in io)
							{
							if (io.Mark.type=="oldX") vchar="×";else vchar="○";
							if (vchar=="×") continue;	//	×にしたものは除外
							obj=new Object();
							obj.x="building";
							obj.y=to.id+","+isequence+","+istair+","+ifloor+","+iroom;
							obj.size=0;
							obj.char=vchar;
							obj.History=io.Mark.History;
							outmap.Points.push(obj);
							}
						}
					}
				}
			}
		}

	//	マーカー情報を置換
	tmk.Map[NM_mapseq].Points=clone(outmap.Points);

	//	作業情報をセット
	tmk.Map[NM_mapseq].Edited="True";
	tmk.Map[NM_mapseq].Editor="MasterClient";

	//	マーカー情報を保存
	SaveMarker(NM_mapnum,tmk);

	MENU6B();
	}

//------------------------------------------------------------------------------------
function RoomMarker(objnum,seq,stair,floor,room)
	{
	var i,rmap,s;
	var t=Building.building[objnum].sequence[seq].stair[stair].floor[floor].room[room];
	if ("Mark" in t)
		{
		var to=t.Mark;
		switch (to.type)
			{
			case "oldO":
				to.type="oldX";
				break;
			case "oldX":
				to.type="oldO";
				break;
			case "NewO":
				delete t.Mark;
				break;
			}
		}
	else{
		t.Mark=new Object();
		t.Mark.type="NewO";
		t.Mark.History=0;
		}
	s=CreateBuildingImage(NM_mapnum,NM_mapseq,0,objnum,"",1,1,8);
	window["BLD"+objnum].innerHTML=s;
	}

