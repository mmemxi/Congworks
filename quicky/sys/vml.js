function min(ary)
	{
	var mmin,j;
	var i=ary.length;
	if (i==0) return "";
	if (i==1) return ary[0];
	mmin=ary[0];
	for(j=1;j<=i;j++)	if (ary[j]<mmin) mmin=ary[j];
    return mmin;
	}

function max(ary)
	{
	var mmax,j;
	var i=ary.length;
	if (i==0) return "";
	if (i==1) return ary[0];
	mmax=ary[0];
	for(j=1;j<=i;j++)	if (ary[j]>mmax) mmax=ary[j];
    return mmax;
	}

function Poly(layername)
	{
	this.isDrawing=false;
	this.mapsize=1;
	this.width=0;
	this.height=0;

	this.Init=function(layername)
		{
		this.obj=new Array();
		layername+="";
		if (layername=="undefined") layername="";
		this.layer=layername;
		this.objects=0;
		if (layername!="") window[layername].innerHTML="";
		this.isDrawing=false;
		this.mapsize=1;
		this.width=0;
		this.height=0;
		};

	this.AddObject=function(str,cmd,title,zoomx,zoomy,color)
		{
		var i=this.objects;
		var str2,cmd2,title2;
		var j,j1,j2,c1,c2;
		var p1,p2;
		var x1,x2,y1,y2;

		str+="";
		if (str=="undefined") str="";
		cmd+="";
		if (cmd=="undefined") cmd="";
		title+="";
		if (title=="undefined") title="";
		color+="";
		if (color=="undefined") color="";

		this.obj[i]=new Object();
		this.obj[i].x=new Array();
		this.obj[i].y=new Array();
		this.obj[i].closed=false;
		this.obj[i].points=0;
		this.obj[i].src="";
		this.obj[i].click=cmd;
		this.obj[i].title=title;
		this.obj[i].type="";
		this.obj[i].color=color;

		if (str!="")
			{
			if (str.indexOf("vml:",0)==0)
				{
				str2=str.substring(4,str.length);
				c1=str2.split(" ");
				j=0;
				for(j1=0;j1<c1.length;j1++)
					{
					c2=c1[j1].split(",");
					this.obj[i].x[j]=Math.floor(parseInt(c2[0],10)*zoomx);
					this.obj[i].y[j]=Math.floor(parseInt(c2[1],10)*zoomy);
					this.obj[i].points++;
					j++;
					}
				}
			else{
				c1=str.split(",");
				x1=Math.floor(parseInt(c1[0],10)*zoomx);
				y1=Math.floor(parseInt(c1[1],10)*zoomy);
				x2=Math.floor(parseInt(c1[2],10)*zoomx);
				y2=Math.floor(parseInt(c1[3],10)*zoomy);
				this.obj[i].x[0]=x1;
				this.obj[i].y[0]=y1;
				this.obj[i].x[1]=x2;
				this.obj[i].y[1]=y1;
				this.obj[i].x[2]=x2;
				this.obj[i].y[2]=y2;
				this.obj[i].x[3]=x1;
				this.obj[i].y[3]=y2;
				this.obj[i].x[4]=x1;
				this.obj[i].y[4]=y1;
				this.obj[i].points=5;
				}
			this.obj[i].closed=true;
			this.obj[i].type="poly";
			}
		this.objects++;
		return i;
		};

	this.AddImage=function(img,x,y,w,h)
		{
		var i=this.objects;
		this.obj[i]=new Object();
		this.obj[i].x=new Array();
		this.obj[i].y=new Array();
		this.obj[i].src=img;
		this.obj[i].x[0]=x;
		this.obj[i].y[0]=y;
		this.obj[i].x[1]=x+w-1;
		this.obj[i].y[1]=y+h-1;
		this.obj[i].click="";
		this.obj[i].title="";
		this.obj[i].closed=true;
		this.obj[i].points=0;
		this.obj[i].type="image";
		this.obj[i].color="";
		this.objects++;
		return i;
		};

	this.AddArrow=function(str,zoomx,zoomy,mode)
		{
		var i=this.objects;
		var str2;
		var j,j1,j2,c1,c2;
		var p1,p2;
		var x1,x2,y1,y2;

		str+="";
		if (str=="undefined") return;
		this.obj[i]=new Object();
		this.obj[i].x=new Array();
		this.obj[i].y=new Array();
		this.obj[i].closed=false;
		this.obj[i].points=0;
		this.obj[i].src="";
		this.obj[i].click="";
		this.obj[i].title="";
		this.obj[i].color="";
		if (!mode)
			{
			this.obj[i].type="arrow";
			}
		else
			{
			this.obj[i].type="arrowb";
			}
		c1=str.split(" ");
		j=0;
		for(j1=0;j1<c1.length;j1++)
			{
			c2=c1[j1].split(",");
			this.obj[i].x[j]=Math.floor(parseInt(c2[0],10)*zoomx);
			this.obj[i].y[j]=Math.floor(parseInt(c2[1],10)*zoomy);
			this.obj[i].points++;
			j++;
			}
		this.obj[i].closed=true;
		this.objects++;
		};

	this.AddPoint=function(dx,dy)
		{
		var num=this.objects-1;
		var l;
		l=this.obj[num].points;
		this.obj[num].x[l]=dx;
		this.obj[num].y[l]=dy;
		this.obj[num].points++;
		this.isDrawing=true;
		};

	this.DeletePoint=function()
		{
		var num=this.objects-1;
		var i=this.obj[num].points;
		if (i>0)
			{
			this.obj[num].points--;
			if (i==0) this.isDrawing=false;
			}
		};

	this.Closed=function()
		{
		if (this.objects==0) return true;
		var num=this.objects-1;
		return this.obj[num].closed;
		};

	this.Close=function()
		{
		var num=this.objects-1;
		this.obj[num].closed=true;
		this.isDrawing=false;
		};

	this.Draw=function(mode,svg)
		{
		var s="";
		var i,j,a;
		var cl,str,arrow,ev,weight,fillcl;
		var ds,cd;
		var mx1,my1,mx2,my2,w,h,dx;

		if (svg)
			{
			s+="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ";
			s+="version=1.1 width=\"2126\" height=\"2362\" style=\"position:absolute;top:0px;left:0px;z-index:2;\">";
			}

		for(a=0;a<this.objects;a++)
			{
			mx1=min(this.obj[a].x);
			my1=min(this.obj[a].y);
			mx2=max(this.obj[a].x);
			my2=max(this.obj[a].y);
			w=(mx2-mx1)+1;
			h=(my2-my1)+1;

			if (!svg)
				{
				ds="style='position:absolute;z-index:6;left:"+mx1+"px;top:"+my1+"px;width:"+w+"px;height:"+h+"px;";
				if ((!mode)&&(!this.isDrawing)&&(this.obj[a].click!="")) ds+="cursor:pointer;";
				ds+="border:0px;margin:0px;padding:0px;'";
				}
			if (svg)
				{
				ds="style='width:"+w+"px;height:"+h+"px;";
				if (!mode) ds+="opacity:0.4;'";
				if (mode) ds+="opacity:0.35;'";
				}
			cd=" coords=("+w+","+h+")";

			if (this.obj[a].src!="")
				{
				if (!svg)	s+="<v:image src='"+this.obj[a].src+"' "+ds+cd+" />";
				if (svg)	s+="<img src='"+this.obj[a].src+"' "+ds+cd+">";
				continue;
				}
			i=this.obj[a].points;
			weight=1;
			if (this.obj[a].closed)
				{
				cl="#000000";
				fillcl="#ff0000";				//	デフォルト色（赤）
				if (this.obj[a].color!="") fillcl=this.obj[a].color;
				str="solid";
				arrow="";
				}
			else{
				cl="#0000ff";		//	図形として閉じていない
				fillcl="#0000ff";
				str="solid";	//	dash,dashdotなども指定可能
				arrow="endarrow='block'";
				}
			if (this.obj[a].type=="arrow")
				{
				fillcl="#0000ff";
				cl="#0000ff";
				str="solid";	//	dash,dashdotなども指定可能
				arrow="startarrow='block'";
				weight=3;
				}
			if (this.obj[a].type=="arrowb")
				{
				fillcl="#000000";
				cl="#000000";
				str="solid";	//	dash,dashdotなども指定可能
				arrow="startarrow='block'";
				weight=3;
				}
			ev="";
			if ((!mode)&&(!this.isDrawing)&&(this.obj[a].click!="")) ev="onclick='"+this.obj[a].click+"' ";
		
			if (!svg)
				{
				s+="<v:polyline "+ds+cd+" "+ev+" strokecolor='"+cl+"' strokeweight='"+weight+"px' fillcolor='"+fillcl+"' ";
				s+="points='"+(this.obj[a].x[0]-mx1)+","+(this.obj[a].y[0]-my1);
				for(j=1;j<i;j++)	s+=" "+(this.obj[a].x[j]-mx1)+","+(this.obj[a].y[j]-my1);
				s+="'>";
				s+="<v:stroke dashstyle='"+str+"' "+arrow+" />";
				if (!mode) s+="<v:fill opacity='40%' />";	//	表示モードの濃度
				if (mode) s+="<v:fill opacity='35%' />";	//	印刷モードの濃度
				s+="</v:polyline>";
				}
			if (svg)
				{
				s+="<polygon "+ds+cd+" "+ev+" stroke='"+cl+"' stroke-width='"+weight+"' fill='"+fillcl+"' ";
				s+="points='"+(this.obj[a].x[0])+","+(this.obj[a].y[0]);
				for(j=1;j<i;j++)	s+=" "+(this.obj[a].x[j])+","+(this.obj[a].y[j]);
				s+="'/>";
				}
			}

		if (svg)
			{
			s+="</svg>";
			}

		if ((!svg)&&(this.layer!=""))
			{
			window[this.layer].innerHTML=s;
			}
		return s;
		};

	this.Imap=function()
		{
		var s="";
		var i,j,a;
		var cl,str,arrow,ev;
		var ds,cd;
		var mx1,my1,mx2,my2,w,h,dx;

		for(a=0;a<this.objects;a++)
			{
			if ((this.isDrawing)||(this.obj[a].click=="")) continue;

			mx1=min(this.obj[a].x);
			my1=min(this.obj[a].y);
			mx2=max(this.obj[a].x);
			my2=max(this.obj[a].y);
			w=(mx2-mx1)+1;
			h=(my2-my1)+1;
			i=this.obj[a].points;

			s+="<area shape='poly' nohref onclick='"+this.obj[a].click+"' coords='";
			for(j=0;j<i;j++)
				{
				if (j>0) s+=",";
				s+=this.obj[a].x[j]+","+this.obj[a].y[j];
				}
			s+="'";
			if (this.obj[a].title!="")
				{
				s+=" onmouseover='VMLShape_MouseOver(\""+this.obj[a].title+"\")'";
				s+=" onmousemove='VMLShape_MouseOver(\""+this.obj[a].title+"\")'";
				s+=" onmouseout='VMLShape_MouseOut()'";
				}
			s+=">";
			}
		return s;
		};

	this.Finished=function(x,y)
		{
		var num=this.objects-1;
		if (this.obj[num].points<2) return false;
		var absx=Math.abs(this.obj[num].x[0]-x);
		var absy=Math.abs(this.obj[num].y[0]-y);
		if ((absx<9)&&(absy<9)) return true;
		return false;
		}

	this.Finish=function()
		{
		var x,y,l;
		var num=this.objects-1;
		l=this.obj[num].points;
		x=this.obj[num].x[0];
		y=this.obj[num].y[0];
		this.obj[num].x[l]=x;
		this.obj[num].y[l]=y;
		this.obj[num].closed=true;
		this.obj[num].points++;
		this.isDrawing=false;
		if (this.layer!="") this.Draw(false,false);
		}

	this.Init(layername);
	}

function VMLAreaLabel(num,lbl,zoomx,zoomy,color,title)
	{
	var vcmd=AllMaps[num].Position;
	var str=vcmd.substring(4,vcmd.length);
	var j1,c1,c2,s,tbl;
	var j=0;
	var mx1,mx2,my1,my2,ax,ay;
	var obj=new Object();
	obj.x=new Array();
	obj.y=new Array();
	c1=str.split(" ");
	for(j1=0;j1<c1.length;j1++)
		{
		c2=c1[j1].split(",");
		obj.x[j]=Math.floor(parseInt(c2[0],10));
		obj.y[j]=Math.floor(parseInt(c2[1],10));
		j++;
		}
	mx1=min(obj.x);
	my1=min(obj.y);
	mx2=max(obj.x);
	my2=max(obj.y);
	ax=(Math.floor((mx2-mx1)/2)+mx1)*zoomx-30;
	ay=(Math.floor((my2-my1)/2)+my1)*zoomy-30;
	if (AllMaps[num].Title!="")
		{
		tbl=AllMaps[num].Title.split(",");
		ax=Math.floor(parseInt(tbl[1],10)*zoomx);
		ay=Math.floor(parseInt(tbl[2],10)*zoomy);
		}
	s="<div align=center style='position:absolute;z-index:10;line-height:16px;height:80px;";
	s+="left:"+ax+"px;top:"+ay+"px;vertical-align:text-top;font-family:Arial Black;color:"+color+";font-size:30px;'";
	if (title!="")
		{
		s+=" onmouseover='VMLShape_MouseOver(\""+title+"\")'";
		s+=" onmousemove='VMLShape_MouseOver(\""+title+"\")'";
		s+=" onmouseout='VMLShape_MouseOut()'";
		}
	s+=">";
	s+=lbl+"</div>";
	return s;
	}
function VMLShape_MouseOver(str)
	{
	var wx,wy;
	var px,py;
	var x=event.clientX+document.documentElement.scrollLeft;
	var y=event.clientY+document.documentElement.scrollTop;
	var s="<div id=AML style='position:absolute;z-index:10;left:0px;top:0px;";	//left:"+x+"px;top:"+y+"px;";
	s+="border:1px solid black;padding:2px;";
	s+="background-color:#ffffcc;font-size:12px;color:#000000;'>";
	s+=str+"</div>";
	ClearLayer("Popup");
	WriteLayer("Popup",s);
	wx=AML.clientWidth;
	wy=AML.clientHeight;
	px=x+8;
	py=y+8;
	if ((x+wx)>document.documentElement.clientWidth-40) px=x-wx-8;
	if ((y+wy)>document.documentElement.clientHeight-40) py=y-wy-8;
	AML.style.left=px+"px";
	AML.style.top=py+"px";
	}

function VMLShape_MouseOut()
	{
	ClearLayer("Popup");
	}

