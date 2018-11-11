var MouseX=0,MouseY=0,MouseDown=false,MouseUp=true,MouseOver=true,MouseOut=false;
var DragObject="";
var clickcount=0;
function Init_DragField()
	{
	document.documentElement.onmousemove=BaseMouseMove;
	document.documentElement.onmousedown=BaseMouseDown;
	document.documentElement.onmouseup=BaseMouseUp;
	}

function BaseMouseMove()
	{
	MouseX=event.clientX+document.documentElement.scrollLeft;
	MouseY=event.clientY+document.documentElement.scrollTop;
	if ((MouseDown)&&(DragObject!=""))
		{
		window[DragObject].style.left=(MouseX-window[DragObject].ClickX)+"px";
		window[DragObject].style.top=(MouseY-window[DragObject].ClickY)+"px";
		}
	}

function BaseMouseDown()
	{
	if (event.button==0)
		{
		MouseDown=true;
		MouseUp=false;
		}
	}
function BaseMouseUp()
	{
	if (event.button==0)
		{
		MouseDown=false;
		MouseUp=true;
		}
	DragObject="";
	}

function DragField(title)
	{
	this.id="";
	this.x=0;
	this.y=0;
	this.z=0;
	this.width=0;
	this.height=0;
	this.element="";
	this.Content="";
	this.Title=title;
	this.Create=function(elementID,x,y,z,width,height)
		{
		var t,t2;
		t=dragfield_MakeElement(elementID,x,y,z,width,height,this.Content,this.Title);
		this.id=elementID;
		this.x=x;
		this.y=y;
		this.z=z;
		this.element=t;
		this.width=width;
		this.height=height;
		try	{
		document.body.appendChild(t);
		}
		catch(e)
			{
			alert("Create error");
			}
//		t.style.height=t.clientHeight;
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
		this.x=x;
		this.y=y;
		this.element.style.left=x+"px";
		this.element.style.top=y+"px";
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
		this.element.innerHTML=dragfield_MakeHTML(this.id,this.Content,this.width,this.height,this.Title);
		};
	this.Close=function()
		{
		try	{
			document.body.removeChild(this.element);
			}
		catch(e)
			{
			}
		};
	}


function dragfield_dummy()
	{
	return false;
	}

function dragfield_MakeElement(elementID,x,y,z,width,height,content,title)
	{
	var t;
	t=document.createElement("div");
	t.id=elementID;
	t.level=0;
	t.width=width;
	t.height=height;
	t.ClickX=0;
	t.ClickY=0;
	t.style.backgroundColor="#ffffcc";
	t.style.border="1px black solid";
	t.style.position="absolute";
	t.style.left=x+"px";
	t.style.top=y+"px";
	t.style.zIndex=z;
	t.style.overflow="hidden";
	t.style.cursor="default";
	t.ondragstart=dragfield_dummy;
	t.innerHTML=dragfield_MakeHTML(elementID,content,width,height,title);
	t.style.width=width;
	t.style.height=height;
	return t;
	}

function dragfield_MakeHTML(elementID,content,width,height,title)
	{
	var s;
	s="<div style='width:"+width+"px;height:16px;background-color:#0000ff;padding:4px;";
	s+="text-align:center;font-size:14px;font-weight:bold;color:#ffffff;' ";	//cursor:move;
	s+="onmousedown='dragfield_mousedown(\""+elementID+"\")'>";
	s+=title+"</div>";
	s+="<div style='width:"+width+"px;height:"+(height-24)+"px;padding:4px;overflow:hidden;'>"+content+"</div>";
	return s;
	}

function dragfield_mousedown(id)
	{
	DragObject=id;
	window[id].ClickX=event.offsetX;
	window[id].ClickY=event.offsetY;
	clickcount++;
	}

