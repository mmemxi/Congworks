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

	this.Draw=function(viewmode)
		{
		var s="";
		var i,j,a;
		var cl,str,arrow,weight,fillcl;
		var ds,cd;
		var mx1,my1,mx2,my2,w,h,dx;
		s+="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ";
		s+="version=1.1 style=\"";	//	position:absolute;z-index:6;";
		if (viewmode) s+="width:2126px;height:2362px;";
		if (!viewmode) s+="width:700px;height:900px;";
		s+="\">";
		s+="<marker id='arrow' viewBox='-5 -5 10 10' orient='auto'>";
		s+="<polygon points='-5,-5 5,0 -5,5' fill='black' stroke='none' /></marker>";
		for(a=0;a<this.objects;a++)
			{
			mx1=min(this.obj[a].x);
			my1=min(this.obj[a].y);
			mx2=max(this.obj[a].x);
			my2=max(this.obj[a].y);
			w=(mx2-mx1)+1;
			h=(my2-my1)+1;

			ds="style='width:"+w+"px;height:"+h+"px;";
			ds+="opacity:0.35;'";
			cd=" coords=("+w+","+h+")";

			//	画像の挿入
			if (this.obj[a].src!="")
				{
				s+="<img src='"+this.obj[a].src+"' "+ds+cd+">";
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
			if (this.obj[a].type=="arrow")	//	矢印の描画
				{
				s+="<line x1="+this.obj[a].x[1]+" y1="+this.obj[a].y[1]+" x2="+this.obj[a].x[0]+" y2="+this.obj[a].y[0];
				s+=" stroke='#0000ff' stroke-width=2 marker-end='url(#arrow)' />";
				continue;
				}
			if (this.obj[a].type=="arrowb")	//	黒矢印の描画
				{
				s+="<line x1="+this.obj[a].x[1]+" y1="+this.obj[a].y[1]+" x2="+this.obj[a].x[0]+" y2="+this.obj[a].y[0];
				s+=" stroke='#000000' stroke-width=2 marker-end='url(#arrow)' />";
				continue;
				}
			s+="<polygon "+ds+cd+" stroke='"+cl+"' stroke-width='"+weight+"' fill='"+fillcl+"' ";
			s+="points='"+(this.obj[a].x[0])+","+(this.obj[a].y[0]);
			for(j=1;j<i;j++)	s+=" "+(this.obj[a].x[j])+","+(this.obj[a].y[j]);
			s+="'/>";
			}

		s+="</svg>";
		return s;
		};

	this.Init(layername);
	}
