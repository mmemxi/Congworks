//---------------------------------------------------------------------------------------
function AddComment(num)
	{
	MENU1B_Store(num);
	var cm=new Object();
	cm.Text="";
	cm.Top=-1;
	cm.Left=-1;
	cm.Size=24;
	Cards[num].Comments.push(cm);
	MENU1B(num);
	}
//---------------------------------------------------------------------------------------
function RemoveComment(num,inx)
	{
	MENU1B_Store(num);
	var p=confirm("このコメントを削除してもよろしいですか？");
	if (!p) return;
	Cards[num].Comments.splice(inx,1);
	MENU1B(num);
	}
//---------------------------------------------------------------------------------------
function PlaceComment(num,inx)
	{
	var s,found,file,seq=1,cms;
	var rx=new Array();
	var mfile;
	MENU1B_Store(num);
	var cm=Cards[num].Comments[inx];
	cm.Text=cm.Text.trim();
	if (cm.Text=="")
		{
		alert("コメントを入力してください。");
		return;
		}
	if (Cards[num].MapType==0) mfile=PNGFile(num,seq);
	else mfile=BlankPNG();
	cms=cm.Text;
	while(1==1)
		{
		if (cms.indexOf("@br@",0)==-1) break;
		cms=cms.replace("@br@","<br>");
		}
	RDragObj=inx;
	RDComment="";
	var r=GetImageInfo(mfile);
	RDComment=cms;
	RDSize=parseInt(cm.Size,10);
	RDragStartX=parseInt(cm.Left,10);
	RDragStartY=parseInt(cm.Top,10);
	oRDComment=RDComment;
	oRDSize=RDSize;
	RDTitle=document.title;
	RDragging=false;
	ClearKey();
	ClearLayer("Stage");
	ClearLayer("Mask");
	ClearLayer("Terop");
	ClearLayer("Drag");
	document.title="コメントを書き込む場所を指定してください";
	Keys[11]="";

	//	1.地図レイヤー
	s="<img src='"+mfile+"' style='position:absolute;z-index:0;top:0px;left:0px;z-index:0;'>";
	WriteLayer("Stage",s);

	//	2.クリックレイヤー
	s="<img src='"+BlankGIF()+"' width="+r.x+" height="+r.y;
	s+=" style='cursor:default;position:absolute;top:0px;left:0px;z-index:5;'";
	s+=" onmousedown='WriteComment_mousedown();return false;' onmousemove='WriteComment_mousemove()' onmouseup='WriteComment_mouseup();return false;' onmousewheel='WriteComment_Wheel()'>";
	WriteLayer("Drag",s);

	if (RDragStartX==-1)
		{
		wx=0;wy=0;
		}
	else{
		wx=RDragStartX-(document.documentElement.clientWidth/2);
		wy=RDragStartY-(document.documentElement.clientHeight/2);
		if (wx<0) wx=0;
		if (wy<0) wy=0;
		}
	window.scrollTo(wx,wy);
	WriteComment_Draw();

	s="左クリックでコメントを書き込む位置を決定<br>Shift+ホイールで文字サイズ変更<br>";
	s+=AddKeys(1,"決定","EndofPlaceComment("+num+","+inx+",true)");
	s+=AddKeys(0,"戻る","EndofPlaceComment("+num+","+inx+",false)");
	FloatingMenu.Title="コメントの記入";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",wx,wy,10,240,120);
	RscrollX=wx;RscrollY=wy;
	window.onscroll=WriteMap_Scroll;
	}

function WriteComment_mouseup()
	{
	var btn=event.button;
	var x=event.clientX+document.documentElement.scrollLeft;
	var y=event.clientY+document.documentElement.scrollTop;
	if (btn==0)	
		{
		RDragStartX=x;
		RDragStartY=y;
		oRDSize=RDSize;
		oRDComment=RDComment;
		WriteComment_Draw();
		return;
		}
	}

function WriteComment_mousedown()
	{
	var i;
	var btn=event.button;	// 0=left 4=center 2=right
	if (btn!=2) return;
	}

function WriteComment_mousemove()
	{
	var i,j,x,y,s;
	x=event.clientX+document.documentElement.scrollLeft;
	y=event.clientY+document.documentElement.scrollTop;
	RDragEndX=x;
	RDragEndY=y;
	WriteComment_Draw();
	}

function WriteComment_Wheel()	//マウスホイール
	{
	var a;
	if (!ShiftKey) return;
	a=event.wheelDelta;
	if (a==120)
		{
		RDSize+=8;
		}
	if (a==-120)
		{
		RDSize-=8;
		if (RDSize<8) RDSize=8;
		}
	WriteComment_Draw();
	}

function WriteComment_Draw()
	{
	var s,ox,oy;
	var x=RDragEndX;
	var y=RDragEndY;
	ClearLayer("Terop");
	s="<div style='position:absolute;left:"+x+"px;top:"+y+"px;z-index:3;white-space:nowrap;font-size:"+RDSize+"px;color:999999;'>";
	s+=RDComment+"</div>";
	if (RDragStartX!=-1)
		{
		ox=RDragStartX;oy=RDragStartY;
		s+="<div style='position:absolute;left:"+ox+"px;top:"+oy+"px;z-index:4;white-space:nowrap;font-size:"+oRDSize+"px;color:#0000ff;'>";
		s+=oRDComment+"</div>";
		}
	WriteLayer("Terop",s);
	}

function EndofPlaceComment(num,inx,mode)
	{
	var cmd,wx,wy,cm;
	var s,i;
	if ((mode)&&(RDragStartX==-1))
		{
		alert("コメントの位置が決定されていません。");
		return;
		}
	window.onscroll="";
	document.title=RDTitle;
	FloatingMenu.Close();
	ClearLayer("Mask");
	ClearLayer("Drag");
	ClearLayer("Terop");
	window.scrollTo(0,0);
	cm=Cards[num].Comments[inx];
	if (mode)
		{
		cm.Size=RDSize;
		cm.Left=RDragStartX;
		cm.Top=RDragStartY;
		}
	MENU1B(num);
	}
