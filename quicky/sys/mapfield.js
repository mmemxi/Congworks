function MapField()
	{
	this.id="";
	this.width=0;
	this.height=0;
	this.element="";
	this.element2="";
	this.Content="";
	this.target="";
	this.enabled=false;
	this.CreateFloat=function(elementID,left,top,width,height,zindex)
		{
		var t,t2;
		t=mapfield_MakeElement1(elementID,left,top,width,height,zindex);
		this.element=t;
		this.width=width;
		this.height=height;
		this.target=document.body;
		document.body.appendChild(t);
		t2=mapfield_MakeElement2(elementID,this.Content);
		t.appendChild(t2);
		this.element2=t2;
		this.enabled=true;
		};
	this.Create=function(elementID,target,width,height)
		{
		var t,t2;
		t=mapfield_MakeElement3(elementID,target,width,height);
		this.element=t;
		this.width=width;
		this.height=height;
		this.target=target;
		target.appendChild(t);
		t2=mapfield_MakeElement2(elementID,this.Content);
		t.appendChild(t2);
		this.element2=t2;
		this.enabled=true;
		};
	this.Hide=function()
		{
		this.element.style.visibility="hidden";
		};
	this.Show=function()
		{
		this.element.style.visibility="visible";
		};
	this.moveTo=function(x,y)
		{
		this.element.style.left=x+"px";			//	20180319
		this.element.style.top=y+"px";			//	20180319
		};
	this.resizeTo=function(width,height)
		{
		this.width=width;
		this.height=height;
		this.element.style.width=width;
		this.element.style.height=height;
		this.element.width=width;
		this.element.heifht=height;
		};
	this.Draw=function()
		{
		this.element2.innerHTML=this.Content;
		};
	this.Clear=function()
		{
		this.element2.innerHTML="";
		};
	this.ReDraw=function()
		{
		this.element2.innerHTML=this.Content;
		};
	this.Adjust=function()
		{
		var ax=this.width;
		var ay=this.height;
		var wx=this.element2.clientWidth;
		var wy=this.element2.clientHeight;
		var zx,zy,zoom;
		if (ax>=wx) zx=1;
			else	zx=ax/wx;
		if (ay>wy)	zy=1;
			else	zy=ay/wy;
		if (zx>zy) zoom=zy;else zoom=zx;
		this.element2.zoom=Math.floor(zoom*100);
		zoom=this.element2.zoom/100;
		wx*=zoom;
		wy*=zoom;
		this.element2.x=(ax-wx)/2;
		this.element2.y=(ay-wy)/2;
		this.element2.style.left=this.element2.x+"px";		//	20180319
		this.element2.style.top=this.element2.y+"px";		//	20180319
		this.element2.style.zoom=zoom;
		};
	this.Close=function()
		{
		window[this.target.id].removeChild(this.element);
		this.enabled=false;
		};
	}

function mapfield_dummy()
	{
	return false;
	}

function GetEventObject()
	{
	var base,obj;
	var tag=event.srcElement.parentNode.tagName;
	if (tag=="BODY")
		{
		base=event.srcElement.firstChild.id;
		obj=window[base];
		obj.mousex=event.offsetX;
		obj.mousey=event.offsetY;
		}
	else{
		base=event.srcElement;
		while(1==1)
			{
			if (base.tagName=="DIV")
				{
				try{
					level=window[base.id].level;
					}
				catch(e) {level=-1;}
				if (level==0) {base=base.firstChild.id;break;}
				if (level==1) {base=base.id;break;}
				}
			base=base.parentNode;
			}
		base="MAPContent";
		obj=window[base];
		obj.mousex=event.x;
		obj.mousey=event.y;
		}
	return obj;
	}

function mapfield_MakeElement1(elementID,left,top,width,height,zindex)
	{
	var t;
	t=document.createElement("div");
	t.id=elementID;
	t.level=0;
	t.width=width;
	t.height=height;
	t.style.backgroundColor="#bbbbbb";
	t.style.border="1px black solid";
	t.style.position="absolute";
	t.style.left=left+"px";
	t.style.top=top+"px";
	t.style.width=width;
	t.style.height=height;
	t.style.zIndex=zindex;
	t.style.overflow="hidden";
	t.onmousedown=mapfield_mousedown;
	t.onmouseup=mapfield_mouseup;
	t.onselectstart=mapfield_dummy;
	t.ondragstart=mapfield_dummy;
	t.onmouseout=mapfield_mouseout;
	t.onmousemove=mapfield_mousemove;
	t.onmousewheel=mapfield_wheel;
	t.ondblclick=mapfield_adjust;
	return t;
	}

function mapfield_MakeElement2(elementID,content)
	{
	t2=document.createElement("div");
	t2.id=elementID+"Content";
	t2.level=1;
	t2.x=0;
	t2.y=0;
	t2.style.whiteSpace="nowrap";
	t2.innerHTML=content;
	t2.style.position="absolute";
	t2.style.left="0px";
	t2.style.top="0px";
	t2.style.zIndex=2;
	t2.style.overflow="hidden";
	t2.style.visibility="visible";
	t2.DragStartX=0;
	t2.DragEndX=0;
	t2.DragStartY=0;
	t2.DragEndY=0;
	t2.Dragging=false;
	t2.zoom=100;
	return t2;
	}

function mapfield_MakeElement3(elementID,target,width,height)
	{
	var t;
	t=document.createElement("div");
	t.id=elementID;
	t.level=0;
	t.width=width;
	t.height=height;
	t.style.backgroundColor="#bbbbbb";
	t.style.border="1px black solid";
	t.style.position="relative";
	t.style.left="0px";
	t.style.top="0px";
	t.style.width=width+"px";
	t.style.height=height+"px";
	t.style.overflow="hidden";
	t.innerHTML="<img src='"+BlankGIF()+"' width="+width+" height="+height+">";	//	20180319
	t.onmousedown=mapfield_mousedown;
	t.onmouseup=mapfield_mouseup;
	t.onselectstart=mapfield_dummy;
	t.ondragstart=mapfield_dummy;
	t.onmouseout=mapfield_mouseup;
	t.onmousemove=mapfield_mousemove;
	t.onmousewheel=mapfield_wheel;
	t.ondblclick=mapfield_adjust;
	return t;
	}


function mapfield_mousedown()
	{
	if (ShiftKey) return;
	if (event.button!=0) return;
	var obj=GetEventObject();
	obj=document.getElementById("MAPContent");	//	20180319
	obj.DragStartX=event.clientX;
	obj.DragStartY=event.clientY;
	obj.DragEndX=this.DragStartX;
	obj.DragEndY=this.DragStartY;
	obj.Dragging=true;
	obj.px=obj.x;
	obj.py=obj.y;
	}

function mapfield_mouseup()
	{
	if (ShiftKey) return;
	if (event.button!=0) return;
	var dx,dy;
	var nx,ny;
	var obj=GetEventObject();
	obj=document.getElementById("MAPContent");	//	20180319
	if (!obj.Dragging) return;
	obj.Dragging=false;
	obj.x=obj.px;
	obj.y=obj.py;
	}
function mapfield_mouseout()
	{
	var dx,dy;
	var nx,ny;
	var obj=GetEventObject();
	obj=document.getElementById("MAPContent");	//	20180319
	if (!obj.Dragging) return;
	obj.Dragging=false;
	obj.x=obj.px;
	obj.y=obj.py;
	}

function mapfield_mousemove()
	{
	if (ShiftKey) return;
	if (event.button!=0) return;
	var dx,dy;
	var nx,ny;
	var obj=GetEventObject();
	obj=document.getElementById("MAPContent");	//	20180319
	if (!obj.Dragging) return;
	var parentobj=obj.parentNode;
	var ax=parentobj.clientWidth;
	var ay=parentobj.clientHeight;
	var wx=obj.clientWidth*(obj.zoom/100);
	var wy=obj.clientHeight*(obj.zoom/100);

	dx=event.clientX;
	dy=event.clientY;
	nx=dx-obj.DragStartX;
	ny=dy-obj.DragStartY;
	obj.px=obj.x+nx;
	obj.py=obj.y+ny;

//	if (obj.px+wx<ax) obj.px=ax-wx;
//	if (obj.py>0) obj.py=0;
//	if (obj.px>0) obj.px=0;
//	if (obj.py+wy<ay) obj.py=ay-wy;
//	if (ax>wx) obj.px=(ax-wx)/2;
//	if (ay>wy) obj.py=(ay-wy)/2;

	obj.style.left=obj.px+"px";
	obj.style.top=obj.py+"px";
	}

function mapfield_wheel()
	{
	var a,nx,ny;
	var dx,dy;
	var absx,absy,objx,objy;
	var obj=GetEventObject();
	obj=document.getElementById("MAPContent");	//	20180319
	obj2=document.getElementById("MAPMask");	//	20180319
	var parentobj=obj.parentNode;
	var ax=parentobj.clientWidth;
	var ay=parentobj.clientHeight;

	if (ShiftKey) return;
	dx=event.clientX;						//	20180319
	dy=event.clientY;						//	20180319
	absx=(dx-obj.x)/(obj.zoom/100);
	absy=(dy-obj.y)/(obj.zoom/100);
	a=event.wheelDelta;
	if (a==120)
		{
		if (obj.zoom<100) obj.zoom+=6;
		else obj.zoom+=12;
		if (obj.zoom>200) obj.zoom=200;
		}
	if (a==-120)
		{
		if (obj.zoom<100) obj.zoom-=6;
		else obj.zoom-=12;
		if (obj.zoom<10) obj.zoom=10;
		}
	objx=dx-(obj.zoom/100)*absx;
	objy=dy-(obj.zoom/100)*absy;
	obj.x=Math.floor(objx);
	obj.y=Math.floor(objy);

	var wx=obj.clientWidth*(obj.zoom/100);
	var wy=obj.clientHeight*(obj.zoom/100);

	if (obj.x+wx<ax) obj.x=ax-wx;
	if (obj.y>0) obj.y=0;
	if (obj.x>0) obj.x=0;
	if (obj.y+wy<ay) obj.y=ay-wy;
	if (ax>wx) obj.x=(ax-wx)/2;
	if (ay>wy) obj.y=(ay-wy)/2;

	obj.style.left=obj.x+"px";		//	20180319
	obj.style.top=obj.y+"px";		//	20180319
	obj.style.zoom=obj.zoom/100;
	return false;
	}

function mapfield_adjust()
	{
	var a,nx,ny;
	var dx,dy;
	var absx,absy,objx,objy;
	var childobj=GetEventObject();
	var obj=childobj.parentNode;
	var ax=obj.width;
	var ay=obj.height;
	var wx=childobj.clientWidth;
	var wy=childobj.clientHeight;
	var zx,zy,zoom;
	if (ax>=wx) zx=1;
		else	zx=ax/wx;
	if (ay>wy)	zy=1;
		else	zy=ay/wy;
	if (zx>zy) zoom=zy;else zoom=zx;
	childobj.zoom=Math.floor(zoom*100);
	wx*=zoom;
	wy*=zoom;
	childobj.x=(ax-wx)/2;
	childobj.y=(ay-wy)/2;
	childobj.style.left=childobj.x+"px";	//	20180319
	childobj.style.top=childobj.y+"px";		//	20180319
	childobj.style.zoom=zoom;
	}
