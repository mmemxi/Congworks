//------------------------------------------------------------------------------------
//	裏面表示
//------------------------------------------------------------------------------------
var RMAP_VX=3240,RMAP_VY=8186;
var RMAP_MX=0,RMAP_MY=0;
var RMAP_Dragging=false;
var RMAP_Over=false;
var RMAP_X,RMAP_Y,RMAP_Zoom;
var RMAP_Width=680;
var RMAP_Height=600;
var RMAP_Avr=RMAP_Height/RMAP_Width;
var RMAP_SpotsLoaded=false;
var RMAP_Spots=new Array();
var RMAP_DSPSpots=new Array();
var RMAP_num,RMAP_seq;
var RMH=new Array();
var RMBase;
//------------------------------------------------------------------------------------

function MENU1PRev(num,seq)
	{
	var i,j,k,s,file,r,x,y,z;
	var c0,c1,c2,cx,cy,maxcx,maxcy,mincx,mincy;
	var cwidth,cheight;
	var px,py,pwidth,pheight;
	var zoomrate;
	var s0,s1,s2;
	var AreaExist=0,AreaVML="";
	RMAP_num=num;
	RMAP_seq=seq;
	EnumAreas(num);
	Rvml=new Poly();
	if ("Clip" in Cards[num])
		{
		if (seq in Cards[num].Clip)	//	地図マップは存在
			{
			if ("Area" in Cards[num].Clip[seq])
				{
				AreaExist=2;
				AreaVML=Cards[num].Clip[seq].Area;
				Rvml.AddObject(AreaVML,"","",1,1,"");
				}
			else{
				AreaExist=2;
				AreaVML="";
				}
			}
		}
	if (AreaExist==0)
		{
		if (num in AllMaps)	//	全体マップは存在
			{
			if (AllMaps[num].Position!="")
				{
				AreaExist=1;
				AreaVML=AllMaps[num].Position;
				}
			}
		}
	ClearKey();
	ClearLayer("Stage");	//	地図レイヤー
	ClearLayer("Mask");		//	特記レイヤー
	ClearLayer("Drag");		//	マウス操作レイヤー
	ClearLayer("Terop");
	Keys[11]="";

	Rvml.mapsize=1;
	Rvml.width=RMAP_VX;
	Rvml.height=RMAP_VY;
	
	if (AreaExist!=0)
		{
		c0=AreaVML.replace("vml:","");
		maxcx=-1;maxcy=-1;mincx=99999;mincy=99999;
		c1=c0.split(" ");
		for(j=0;j<c1.length;j++)
			{
			c2=c1[j].split(",");
			cx=parseInt(c2[0],10);
			cy=parseInt(c2[1],10);
			if (cx<mincx) mincx=cx;
			if (cy<mincy) mincy=cy;
			if (cx>maxcx) maxcx=cx;
			if (cy>maxcy) maxcy=cy;
			}
		cwidth=maxcx-mincx;
		cheight=maxcy-mincy;
		zoomrate=0;
		if (AreaExist==2)
			{
			if("Zoom" in Cards[num].Clip[seq])
				{
				zoomrate=parseInt(Cards[num].Clip[seq].Zoom,10);
				pwidth=RMAP_Width/(zoomrate/100);
				pheight=RMAP_Height/(zoomrate/100);
				px=parseInt(Cards[num].Clip[seq].Left,10);
				py=parseInt(Cards[num].Clip[seq].Top,10);
				}
			}
		if (zoomrate==0)
			{
			if (cwidth>cheight)	//	横長の区域
				{
				pwidth=cwidth*3;
				pheight=RMAP_Avr*pwidth;
				}
			else{				//	縦長の区域
				pheight=cheight*3;
				pwidth=pheight/RMAP_Avr;
				}
			zoomrate=Math.floor((RMAP_Width/pwidth)*100);
			px=Math.floor((mincx+maxcx)/2-pwidth/2);
			py=Math.floor((mincy+maxcy)/2-pheight/2);
			px*=zoomrate/100;
			py*=zoomrate/100;
			if (AreaExist==2)
				{
				Cards[num].Clip[seq].Zoom=zoomrate;
				Cards[num].Clip[seq].Left=px;
				Cards[num].Clip[seq].Top=py;
				}
			}
		}
	else{
		px=0;
		py=0;
		zoomrate=100;
		}
	x=parseInt(px,10);
	y=parseInt(py,10);
	z=parseInt(zoomrate,10);
	if ((x<0)&&(y<0)&&(z<0))
		{
		x=0;y=0;z=100;
		}

	s0="<div class=size5 align=center>№"+num+"「"+Cards[num].name+"」"+nums.charAt(seq-1)+"</div>";
	s0+="<div id='RMAP' style='position:relative;z-index:1;width:"+RMAP_Width+"px;height:"+RMAP_Height+"px;border:1px solid black;overflow:hidden;background-color:#aaaaaa;'>";
	s0+="<div style='position:absolute;left:0px;top:0px;z-index:4;width:"+RMAP_Width+"px;height:"+RMAP_Height+"px;'";
	s0+=" onmousedown='RMAP_MouseDown()' onmouseup='RMAP_MouseUp()' onmousemove='RMAP_MouseMove()'";
	s0+=" onmouseover='RMAP_MouseOver()' onmouseout='RMAP_MouseOut()' onmousewheel='RMAP_Wheel();return false;'>";
	s0+="<img src='"+BlankGIF()+"' width="+RMAP_Width+" height="+RMAP_Height+">";
	s0+="</div>";
	s0+="<div id='RMAP2' style='position:absolute;z-index:3;top:0px;left:0px;'></div>";
	s1="<div id='RMAP1' style='zoom:"+z+"%;position:absolute;left:0px;top:0px;z-index:2;width:"+RMAP_VX+"px;height:"+RMAP_VY+"px;'>";
	s1+="<div id='RMAP0' style='position:absolute;top:0px;left:0px;z-index:0;'>";
	s1+="</div>";
	if (AreaExist!=0)
		{
		s1+=Rvml.Draw(false,true);
		}
	s1+="</div>";

	s=s0+s1+"</div><br>";
	s+="<div id='SPOTS' class=size4></div>";
	s+="<div id='NEWSPOT' style='position:absolute;z-index:10;color:#ff0000;font-size:20px;font-family:Wingdings;'></div>";
	WriteLayer("Stage",s);

	s="左クリック＋ドラッグで移動<br>";
	s+="マウスホイールで拡大／縮小<br>";
	s+="右クリックでスポットを追加<br>";
	s+="下部のスポット名をクリックで削除<br><br>";
	s+=AddKeys(1,"範囲情報の編集","RMAP_Close();ClipAllArea("+num+","+seq+")");
	s+=AddKeys(2,"現在の位置を保存","RMAP_SavePosition("+num+","+seq+")");
	s+=AddKeys(0,"戻る","RMAP_Close();MENU1PBig("+num+","+seq+")");
	FloatingMenu.Title="メニュー";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,200);
	Keys[11]="";
	window.scrollTo(0,0);
	RMH=new Array();
	RMBase=document.getElementById("RMAP0");
	RMAP_SetMap(x,y,z);
	RMAP_DrawSpots(0);
	}

function RMAP_SetMap(x,y,z)
	{
	var s;
	var jx,jy,obj,key;
	var ix,iy,px1,px2,py1,py2,i,p;
	RMAP_X=x;RMAP_Y=y;RMAP_Zoom=z;
	RMAP1.style.left=(-RMAP_X)+"px";
	RMAP1.style.top=(-RMAP_Y)+"px";
	RMAP1.style.zoom=RMAP_Zoom/100;
	for(i in RMH) RMH[i].enabled=false;
	for(iy=0;iy<=15;iy++)
		{
		py1=Math.floor(iy*511*(z/100));
		py2=Math.floor(((iy+1)*511-1)*(z/100));
		if ((y>py2)||(y+RMAP_Height<=py1)) continue;
		jy=iy+"";
		if (iy<10) jy="0"+jy;
		for(ix=0;ix<=5;ix++)
			{
			px1=Math.floor(ix*540*(z/100));
			px2=Math.floor(((ix+1)*540-1)*(z/100));
			if ((x>px2)||(x+RMAP_Width<=px1)) continue;
			jx=ix+"";
			if (ix<10) jx="0"+jx;
			key=jx+"-"+jy;
			if (key in RMH)
				{
				RMH[key].enabled=true;
				continue;
				}
			obj=document.createElement("img");
			obj.setAttribute("src",AllFolder()+"monofull"+qt+jx+"-"+jy+".jpg");
			RMH[key]=new Object();
			RMH[key].Obj=RMBase.appendChild(obj);
			RMH[key].Obj.style.position="absolute";
			RMH[key].Obj.style.left=(ix*540)+"px";
			RMH[key].Obj.style.top=(iy*511)+"px";
			RMH[key].enabled=true;
			}
		}
	for(i in RMH)
		{
		if (!RMH[i].enabled)
			{
			RMBase.removeChild(RMH[i].Obj);
			delete RMH[i];
			}
		}
	}

//------------------------------------------------------------------------------------
function RMAP_Close()
	{
	FloatingMenu.Close();
	ClearLayer("Popup");
	}

function RMAP_SavePosition(num,seq)
	{
	if (!(seq in Cards[num].Clip)) Cards[num].Clip[seq]=new Object();
	Cards[num].Clip[seq].Zoom=RMAP_Zoom;
	Cards[num].Clip[seq].Left=RMAP_X;
	Cards[num].Clip[seq].Top=RMAP_Y;
	SaveConfig(num);
	alert("現在の表示内容を保存しました。");
	}

function RMAP_Wheel()
	{
	var x=event.offsetX;
	var y=event.offsetY;
	var a=event.wheelDelta;
	var px1,px2,py1,py2;
	var rx=parseInt(RMAP_X,10);
	var ry=parseInt(RMAP_Y,10);
	var rz=parseInt(RMAP_Zoom,10);
	px1=(rx+x)/(rz/100);	//	画像上のＸ位置
	py1=(ry+y)/(rz/100);	//	画像上のＹ位置
	if (a==120)
		{
		rz+=5;
		if (rz>250) rz=250;
		}
	if (a==-120)
		{
		rz-=5;
		if (rz<70) rz=70;
		}
	px2=px1*(rz/100)-x;
	py2=py1*(rz/100)-y;
	RMAP_SetMap(px2,py2,rz);
	RMAP_DrawSpots(0);
	}

function RMAP_MouseDown()
	{
	var btn=event.button;
	if (btn!=0) return;
	RMAP_Dragging=true;
	RMAP_MX=event.offsetX;
	RMAP_MY=event.offsetY;
	}

function RMAP_MouseUp()
	{
	var btn=event.button;
	var x=event.offsetX;
	var y=event.offsetY;
	if (btn==2)
		{
		RMAP_AddSpots(x,y);
		return;
		}
	if (btn!=0) return;
	RMAP_Dragging=false;
	}

function RMAP_MouseOut()
	{
	RMAP_Dragging=false;
	RMAP_Over=false;
	}
function RMAP_MouseOver()
	{
	RMAP_Over=true;
	}
function RMAP_MouseMove()
	{
	var i,j,obj,redraw;
	var x1,x2,y1,y2,rx,ry;
	var x=event.offsetX;
	var y=event.offsetY;
	var dx=x-RMAP_MX;
	var dy=y-RMAP_MY;
	if (!RMAP_Dragging)
		{
		redraw=false;
		for(i=0;i<DSPSpots.length;i++)
			{
			obj=DSPSpots[i];
			x1=obj.x1;
			x2=obj.x2;
			y1=obj.y1;
			y2=obj.y2;
			j=obj.source;
			if ((x<x1)||(x>x2)||(y<y1)||(y>y2))
				{
				if (obj.active)
					{
					obj.active=false;
					RMAP_Spots[j].active=false;
					redraw=true;
					}
				continue;
				}
			if (!obj.active)
				{
				obj.active=true;
				RMAP_Spots[j].active=true;
				redraw=true;
				}
			}
		if (redraw) RMAP_DrawSpots(0);
		return;
		}
	if ((dx!=0)||(dy!=0))
		{
		rx=RMAP_X-dx;ry=RMAP_Y-dy;
		RMAP_SetMap(rx,ry,RMAP_Zoom);
		}
	RMAP_MX=x;
	RMAP_MY=y;
	RMAP_DrawSpots(0);
	}

function RMAP_LoadSpots()
	{
	var i;
	RMAP_SpotsLoaded=true;
	var s=ReadXMLFile(AllFolder()+"spots.xml",true);
	if (s=="")
		{
		RMAP_Spots=new Array();
		}
	else
		{
		RMAP_Spots=clone(s.Spots);
		for(i=0;i<RMAP_Spots.length;i++) RMAP_Spots[i].active=false;
		}
	}

function RMAP_SaveSpots()
	{
	var s=new Object();
	s.Spots=clone(RMAP_Spots);
	WriteXMLFile(s,AllFolder()+"spots.xml");
	}

function RMAP_DrawSpots(mode)
	{
	var i,j,s,v;
	var x,y,x1,x2,y1,y2;
	var ctype=Cards[RMAP_num].MapType;	//	ctype=0:通常地図 1:集合住宅
	var cspot,cs,cnum,cseq,cname,ctemp;
	var ctable=new Array();
	var obj=new Array();
	if (!RMAP_SpotsLoaded) RMAP_LoadSpots();
	for(i in Cards[RMAP_num].Condominium)
		{
		if (Cards[RMAP_num].Condominium[i].Seq!=RMAP_seq) continue;
		s=Cards[RMAP_num].Condominium[i].Name;
		cname=ApartXML(s);
		if (!fso.FileExists(cname)) continue;
		ctemp=ReadXMLFile(cname,true);
		ctable[s]=new Object();
		ctable[s].num=parseInt(ctemp.Num,10);
		ctable[s].seq=parseInt(ctemp.Seq,10);
		}
	s="";v="";
	x1=Math.floor(RMAP_X/(RMAP_Zoom/100));
	x2=Math.floor((RMAP_X+RMAP_Width)/(RMAP_Zoom/100));
	y1=Math.floor(RMAP_Y/(RMAP_Zoom/100));
	y2=Math.floor((RMAP_Y+RMAP_Height)/(RMAP_Zoom/100));
 	j=0;DSPSpots=new Array();
	for(i=0;i<RMAP_Spots.length;i++)
		{
		x=RMAP_Spots[i].x;
		y=RMAP_Spots[i].y;
		cs=RMAP_Spots[i].name;
		if (fso.FileExists(ApartXML(cs))) cspot=true;else cspot=false;	//	集合住宅のスポットである
		if (ctype==1)	//	集合住宅地図
			{
			if (!cspot) continue;
			if (cs in ctable)
				{
				delete ctable[cs];
				}
			else continue;
			}
		else{			//	そうでない
			if (cspot) continue;
			}
		if ((x<x1)||(x>x2)||(y<y1)||(y>y2)) continue;
		obj[j]=new Object();
		obj[j].seq=i;
		obj[j].x=Math.floor((RMAP_Spots[i].x-x1)*(RMAP_Zoom/100))-10;
		obj[j].y=Math.floor((RMAP_Spots[i].y-y1)*(RMAP_Zoom/100))-6;
		obj[j].name=RMAP_Spots[i].name;
		obj[j].active=RMAP_Spots[i].active;
		DSPSpots[j]=new Object();
		DSPSpots[j].x1=obj[j].x;
		DSPSpots[j].x2=obj[j].x+20;
		DSPSpots[j].y1=obj[j].y;
		DSPSpots[j].y2=obj[j].y+20;
		DSPSpots[j].active=obj[j].active;
		DSPSpots[j].source=i;
		j++;
		}
	obj.sort(RMAP_SortSpots);
	for(i=0;i<obj.length;i++)
		{
		j=obj[i].seq;
		s+="<div title='クリックで削除します' style='cursor:pointer;font-size:20px;color:#";
		if (obj[i].active) s+="ff0000;font-weight:bold;'";else s+="000000;' ";
		s+=" onclick='RMAP_DeleteSpot("+j+")'";
		s+=" onmouseover='this.style.fontWeight=\"bold\";this.style.color=\"#ff0000\";RMAP_SpotOn("+j+")'";
		s+=" onmouseout='this.style.fontWeight=\"normal\";this.style.color=\"#000000\";RMAP_SpotOff("+j+")'>";
		s+="<span style='font-weight:bold;font-size:20px;'>";
		if (i<20) s+=nums.charAt(i);else s+=(i+1)+"";
		s+=":</span>"+obj[i].name+"</div>";
		v+="<div style='position:absolute;left:"+obj[i].x+"px;top:"+obj[i].y+"px;";
		v+="margin:0px;padding:0px;border:0px;font-size:20px;font-weight:bold;color:#";
		if (obj[i].active) v+="ff0000";else v+="0000ff";
		v+=";'>";
		if (i<20) v+=nums.charAt(i);else v+=(i+1)+"";
		v+="</div>";
		}
	if (ctype==1)
		{
		for(i in ctable)
			{
			s+="<div title='クリックで地図を参照します' style='cursor:pointer;font-size:20px;color:#0000ff;'";
			s+=" onclick='PopupBuildingPlace("+ctable[i].num+","+ctable[i].seq+",\""+i+"\")'>";
			s+="???:"+i+"</div>";
			}
		}

	if (mode==0) SPOTS.innerHTML=s;
	RMAP2.innerHTML=v;
	}

function RMAP_SpotOn(num)
	{
	RMAP_Spots[num].active=true;
	RMAP_DrawSpots(1);
	}

function RMAP_SpotOff(num)
	{
	RMAP_Spots[num].active=false;
	RMAP_DrawSpots(1);
	}

function RMAP_DeleteSpot(num)
	{
	var a=confirm("スポット「"+RMAP_Spots[num].name+"」を削除してもよろしいですか？");
	if (!a) return;
	RMAP_Spots.splice(num,1);
	RMAP_SaveSpots();
	RMAP_DrawSpots(0);
	}

function RMAP_SortSpots(a,b)
	{
	if (a.y<b.y) return -1;
	if (a.y>b.y) return 1;
	if (a.x<b.x) return -1;
	if (a.x>b.x) return 1;
	return 0;
	}

function RMAP_AddSpots(x,y)
	{
	var px1,px2,py1,py2;
	px1=(RMAP_X+x)/(RMAP_Zoom/100);	//	画像上のＸ位置
	py1=(RMAP_Y+y)/(RMAP_Zoom/100);	//	画像上のＹ位置
	px1=Math.floor(px1);
	py1=Math.floor(py1);
	NEWSPOT.style.left=x+"px";
	NEWSPOT.style.top=(y+12)+"px";
	NEWSPOT.innerHTML="!";

	var s=prompt("スポットの名前を入力してください。","");
	NEWSPOT.innerHTML="";
	if ((s=="")||(s==null)) return;
	s=s.trim();
	if (s=="") return;
	var i;
	i=RMAP_Spots.length;
	RMAP_Spots[i]=new Object();
	RMAP_Spots[i].x=Math.floor(px1);
	RMAP_Spots[i].y=Math.floor(py1);
	RMAP_Spots[i].name=s.trim();
	RMAP_Spots[i].active=false;
	RMAP_SaveSpots();
	RMAP_DrawSpots(0);
	}

