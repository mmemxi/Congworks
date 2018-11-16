var AllMaps=new Array();
var AllMapSwitch=new Array();
var AllMapBody="";
var AllMapX,AllMapY;
var ClipTitle=new Object();
ClipTitle.title="";
ClipTitle.x=0;
ClipTitle.y=0;
ClipExist=false;

function All(mode)
	{
	var s,i,x,found,file,p;
	var d1,d2;
	var r;
	var scr="";
	PickFrom="All";
	r=GetImageInfo(AllFile(mode,"small"));
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("");
	MapZoom=false;
	s="<div class=size5 align=center>奉仕区域全体図</div>";
	WriteLayer("Stage",s);
	EnumAreas("");
	//	区分一覧の表示
	s="<form onsubmit='return false()'>";
	for(i in kbn)
		{
		if (i=="すべて") continue;
		s+="<input type=checkbox checked onClick='AllMapSwitching(\""+i+"\")'>"+i+"<br>";
		AllMapSwitch[i]=true;
		}
	s+="</form>";
	s+=AddKeys(0,"戻る","CloseFloatings();MENU1()");
	FloatingMenu.Title="メニュー";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,220);
	Keys[11]="CloseFloatings();MENU1()";

	AllMapBody="<img src='"+AllFile(mode,"small")+NoCache()+"' onload='ImageMap.Adjust()'>";
	AllMapX=r.x;
	AllMapY=r.y;
	SetAllMap();
	ImageMap.Create("MAP",window["Stage"],MaxWidth-40,MaxHeight-50);
	window.scrollTo(0,0);
	}

function SetAllMap()
	{
	var i,j,num;
	var layer="";
	var vml=new Poly();
	var k,kp,cl,charcl;
	var al,ct1,ct2,ct3;

	//	使用状況テーブルの取得
	var cobj=getPublicLogs();

	vml.mapsize=1;
	vml.width=AllMapX;
	vml.height=AllMapY;

	for(i in AllMaps)
		{
		k=AllMaps[i].Group;
		if (!AllMapSwitch[k]) continue;
		if (AllMaps[i].Position!="")
			{
			vcmd="CloseFloatings();ClearLayer(\"Popup\");MENU1E("+i+");";
			vtitle=AllMaps[i].Name;
			cl="";
			if (cobj[i].Available=="true")	{cl="#00ffff";charcl="#0000ff";}
			if (cobj[i].Available=="false")	{cl="#ffff00";charcl="#000000";}
			if (cobj[i].Available=="disable")
				{
				cl="#ff0000";charcl="#ff0000";
				vcmd='a=0;';
				}
			vtitle+="<br>"+cobj[i].Status;
			al=i+"<br>";
			if (cobj[i].Available=="true")
				{
				ct1=cobj[i].Blank;
				ct2=Math.floor(ct1/28);
				ct3=ct1%28;
				ct3=Math.floor(ct3/7);
				if (ct2>0)
					{
					for(j=1;j<=ct2;j++) al+=Star(true);
					}
				if (ct3>0)
					{
					for(j=1;j<=ct3;j++) al+=Star(false);
					}
				}
			vml.AddObject(AllMaps[i].Position,vcmd,vtitle,0.5,0.5,cl);
			layer+=VMLAreaLabel(i,al,0.5,0.5,charcl,vtitle);
			}
		}
	ImageMap.Content=SetContent(AllMapBody+layer,vml,AllMapX,AllMapY,"");
	}

function AllMapSwitching(sw)
	{
	if (AllMapSwitch[sw]) AllMapSwitch[sw]=false;else AllMapSwitch[sw]=true;
	SetAllMap();
	ImageMap.ReDraw();
	}
// 全図選択のポリゴン選択-------------------------------------------------------------
function ClipAllArea(num,seq)
	{
	var i,k,s,found,file,r,tbl,cl;
	var rx=new Array();
	EnumAreas("");
	RDTitle=document.title;
	Rvml=new Poly();
	RDragObj=num;
	r=GetImageInfo(AllFile(false,"full"));
	ClearLayer("Terop");
	ClipTitle.title=num+"";
	ClipTitle.x=0;
	ClipTitle.y=0;

	for(i in AllMaps)
		{
		if (i==num) continue;
		if (AllMaps[i].Position!="")
			{
			vtitle=AllMaps[i].Name;
			cl="#ffff00";
			Rvml.AddObject(AllMaps[i].Position,"","",1,1,cl);
			}
		}
	if (seq==0)
		{
		if (num in AllMaps)
			{
			ClipExist=true;
			if (AllMaps[num].Position!="")
				{
				Rvml.AddObject(AllMaps[num].Position,"","",1,1,"");
				}
			if (AllMaps[num].Title!="")
				{
				tbl=AllMaps[num].Title.split(",");
				ClipTitle.title=num;
				ClipTitle.x=parseInt(tbl[1],10);
				ClipTitle.y=parseInt(tbl[2],10);
				s="<div style='position:absolute;left:"+ClipTitle.x+"px;top:"+ClipTitle.y+"px;z-index:5;font-family:Arial Black;font-size:60px;color:0000ff;'";
				s+=" onmousedown='ClipMap_mousedown()' onmousemove='PostMap_mousemove()' onmouseup='ClipMap_mouseup()'>";
				s+=num+"</div>";
				WriteLayer("Terop",s);
				}
			else{
				ClipTitle.title=num+"";
				ClipTitle.x=0;
				ClipTitle.y=0;
				}
			}
		else ClipExist=false;
		}
	else{
		ClipExist=false;
		if ("Clip" in Cards[num])
			{
			if (seq in Cards[num].Clip)
				{
				ClipExist=true;
				Rvml.AddObject(Cards[num].Clip[seq].Area,"","",1,1,"");
				ClipTitle.title=seq+"";
				ClipTitle.x=0;
				ClipTitle.y=0;
				}
			}
		else{
			Cards[num].Clip=new Array();
			}
		}
	ClearKey();
	ClearLayer("Stage");	//　地図レイヤー
	ClearLayer("Mask");		//	特記レイヤー
	ClearLayer("Drag");		//	マウス操作レイヤー

	document.title="全体図の中から、区域の場所をクリックして選択してください。";
	Keys[11]="";
	Rvml.mapsize=1;
	Rvml.width=r.x;
	Rvml.height=r.y;
	
	//	1.地図レイヤー
	s="<img src='"+AllFile(false,"full")+"' style='position:absolute;z-index:0;top:0px;left:0px;'>";
	WriteLayer("Stage",s);

	//	2.クリックレイヤー
	s="<img src='"+BlankGIF()+"' width="+r.x+" height="+r.y;
	s+=" style='cursor:default;position:absolute;top:0px;left:0px;z-index:5;'";
	s+=" onmousedown='ClipMap_mousedown()' onmousemove='PostMap_mousemove()' onmouseup='ClipMap_mouseup()'>";
	WriteLayer("Drag",s);

	//	3.特記情報レイヤー
	s="<div id='REFLAYER' style='position:absolute;top:0px;left:0px;z-index:3;width:"+r.x+"px;height:"+r.y+";'>";
	s+=Rvml.Draw(false,true);
	s+="</div>";
	WriteLayer("Mask",s);

	if (Rvml.objects==0)
		{
		window.scrollTo(0,0);
		wx=0;wy=0;
		}
	else{
		if (ClipExist)
			{
			p=Rvml.objects-1;
			wx=(min(Rvml.obj[p].x)+max(Rvml.obj[p].x))/2-(document.documentElement.clientWidth/2);
			wy=(min(Rvml.obj[p].y)+max(Rvml.obj[p].y))/2-(document.documentElement.clientHeight/2);
			if (wx<0) wx=0;
			if (wy<0) wy=0;
			}
		else{
			if (!(num in AllMaps)) AllMaps[num]=new Object();
			if (!("Position" in AllMaps[num])) AllMaps[num].Position="";
			if (AllMaps[num].Position!="")
				{
				var c0=AllMaps[num].Position.replace("vml:","");
				var maxcx=-1;var maxcy=-1;var mincx=99999;var mincy=99999;
				var c1=c0.split(" ");
				for(j=0;j<c1.length;j++)
					{
					var c2=c1[j].split(",");
					var cx=parseInt(c2[0],10);
					var cy=parseInt(c2[1],10);
					if (cx<mincx) mincx=cx;
					if (cy<mincy) mincy=cy;
					if (cx>maxcx) maxcx=cx;
					if (cy>maxcy) maxcy=cy;
					}
				wx=document.documentElement.clientWidth;
				wy=document.documentElement.clientHeight;
				wx=mincx-(wx-(maxcx-mincx))/2;
				wy=mincy-(wy-(maxcy-mincy))/2;
				}
			else{
				wx=0;wy=0;
				}
			}
		window.scrollTo(wx,wy);
		}

	s="左クリックで図形作成<br>右クリックで番号位置指定<br>";
	s+=AddKeys(1,"確定","EndofClipAllMap("+num+","+seq+",true)");
	s+=AddKeys(2,"図形の消去","EraseClip()");
	s+=AddKeys(0,"戻る","EndofClipAllMap("+num+","+seq+",false)");
	FloatingMenu.Title="区域全図への記入";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",wx,wy,10,240,150);
	RscrollX=wx;RscrollY=wy;
	document.documentElement.onscroll=WriteMap_Scroll;
	}

function EraseClip()
	{
	if (ClipExist)
		{
		ClipExist=false;
		Rvml.objects--;
		Rvml.isDrawing=false;
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		}
	}


function EndofClipAllMap(num,seq,mode)
	{
	var cmd,wx,wy;
	var s,i,p;
	if (mode)
		{
		if (!Rvml.Closed())
			{
			alert("記入情報の位置が決定されていません。");
			return;
			}
		}
	document.title=RDTitle;
	window.onscroll="";
	FloatingMenu.Close();
	ClearLayer("Terop");
	ClearLayer("Mask");
	ClearLayer("Drag");
	if (seq==0)
		{
		AllMaps[num]=new Object();
		if (mode)
			{
			AllMaps[num].Position="";
			AllMaps[num].Title=num+","+ClipTitle.x+","+ClipTitle.y;
			if (!ClipExist)
				{
				s="";
				}
			else{
				s="vml:";
				p=Rvml.objects-1;
				for(i=0;i<Rvml.obj[p].points;i++)
					{
					if (i>0) s+=" ";
					s+=Rvml.obj[p].x[i]+","+Rvml.obj[p].y[i];
					}
				}
			AllMaps[num].Position=s;
			WriteAreas(num);
			}
		MENU1P(num);
		}
	else{
		if (mode)
			{
			if (!ClipExist)
				{
				s="";
				}
			else{
				s="vml:";
				p=Rvml.objects-1;
				for(i=0;i<Rvml.obj[p].points;i++)
					{
					if (i>0) s+=" ";
					s+=Rvml.obj[p].x[i]+","+Rvml.obj[p].y[i];
					}
				}
			Cards[num].Clip[seq]=new Object();
			Cards[num].Clip[seq].Area=s;
			SaveConfig(num);
			}
		MENU1PRev(num,seq);
		}
	}

function EnumAreas(num)
	{
	var f,stream,text,lines,i,j,p;
	var dir,folders;
	if (num=="")
		{
		AllMaps=new Array();
		for(i in Cards)
			{
			num=parseInt(i,10);
			if (!("AllMapPosition" in Cards[num]))	continue;
			AllMaps[num]=new Object();
			AllMaps[num].Position=Cards[num].AllMapPosition;
			if ("AllMapTitle" in Cards[num]) AllMaps[num].Title=Cards[num].AllMapTitle;
			AllMaps[num].Group=Cards[num].kubun;
			AllMaps[num].Name=Cards[num].name;
			}
		}
	else{
		if ("AllMapPosition" in Cards[num])
			{
			AllMaps[num]=new Object();
			AllMaps[num].Position=Cards[num].AllMapPosition;
			if ("AllMapTitle" in Cards[num]) AllMaps[num].Title=Cards[num].AllMapTitle;
			AllMaps[num].Group=Cards[num].kubun;
			AllMaps[num].Name=Cards[num].name;
			}
		else{
			AllMaps[num]=new Object();
			AllMaps[num].Position="";
			AllMaps[num].Title="";
			AllMaps[num].Group=Cards[num].kubun;
			AllMaps[num].Name=Cards[num].name;
			}
		}
	}

function WriteAreas(num)
	{
	var s,ss="";
	Cards[num].AllMapPosition=AllMaps[num].Position;
	if (AllMaps[num].Title!="")
		{
		Cards[num].AllMapTitle=AllMaps[num].Title;
		}
	else Cards[num].AllMapTitle="";
	SaveConfig(num);
	}

function ClipMap_mousedown()
	{
	var i;
	var btn=event.button;	// 0=left 4=center 2=right
	if (btn!=0) return;
	var s;
	var x=event.clientX+document.documentElement.scrollLeft;
	var y=event.clientY+document.documentElement.scrollTop;
	if (!ClipExist)
		{
		Rvml.AddObject();
		ClipExist=true;
		return;
		}
	if (!Rvml.Closed()) return;
	if (ClipExist) Rvml.objects--;
	Rvml.AddObject();
	REFLAYER.innerHTML=Rvml.Draw(false,true);
	}

function ClipMap_mouseup()
	{
	var i,j,x,y;
	var absx,absy;
	var btn=event.button;	// 1=left 4=center 2=right
	x=event.clientX+document.documentElement.scrollLeft;
	y=event.clientY+document.documentElement.scrollTop;

	if (btn==2)	//	右クリック
		{
		if (Rvml.objects==0)
			{
			return;
			}
		if (Rvml.Closed())
			{
			ClipTitle.x=x-30;
			ClipTitle.y=y-30;
			ClearLayer("Terop");
			s="<div style='position:absolute;left:"+ClipTitle.x+"px;top:"+ClipTitle.y+"px;";
			s+="z-index:5;font-family:Arial Black;font-size:60px;color:0000ff;'";
			s+=" onmousedown='ClipMap_mousedown()' onmousemove='PostMap_mousemove()' onmouseup='ClipMap_mouseup()'>";
			s+=ClipTitle.title+"</div>";
			WriteLayer("Terop",s);
			return;
			}
		ClipExist=false;
		Rvml.objects--;
		Rvml.AddObject();
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		return;
		}
	if (btn!=0) return;

	if (!Rvml.isDrawing)		//	初回
		{
		Rvml.AddPoint(x,y);
		Rvml.AddPoint(x,y);
		return;
		}
	if (Rvml.Finished(x,y))
		{
		Rvml.Finish();
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		ClipExist=true;
		return;
		}
	Rvml.AddPoint(x,y);
	}
