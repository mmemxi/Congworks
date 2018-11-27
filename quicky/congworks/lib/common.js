//------------------------------------------------------------------------------------
function FixValue(num,len)
	{
	var s=num+"";
	if (s.length==len) return s;
	if (s.length>len)
		{
		s=s.substring(s.length-len,s.length);
		return s;
		}
	while(s.length<len)
		{
		s="0"+s;
		}
	return s;
	}
//------------------------------------------------------------------------------------
function ReadFile(filename)
	{
	var stream,text,f,e;
	if (!fso.FileExists(filename)) return "";
	stream=fso.OpenTextFile(filename,1,false,-2);
	try	{
		text=stream.ReadAll();
		}
	catch(e)
		{
		text="";
		}
	stream.Close();
	return text;
	}
//------------------------------------------------------------------------------------
function WriteFile(filename,buf)
	{
	var f=fso.CreateTextFile(filename,true);
	f.write(buf);
	f.close();
	}
//------------------------------------------------------------------------------------
function clone(src)
	{
	var dest,i,prop,sl;
	if (typeof src == 'object')
		{
		if (src instanceof Array)
			{
			dest=new Array();
			sl=src.length;
			for (i=0;i<sl;i++)	dest[i] = clone(src[i]);
			}
		else{
			dest = new Object();
			for (prop in src)
				{
				dest[prop]=clone(src[prop]);
				}
			}
		}
	else{
		dest=src;
		}
	return dest;
	}
//------------------------------------------------------------------------------------
function SplitDate(dat)
	{
	var s;
	dat=dat+"";
	if (dat=="00000000") return "";
	if (dat=="") return "";
	if (dat.indexOf("/",0)!=-1) return dat;
	s=dat.substring(0,4)+"/"+dat.substring(4,6)+"/"+dat.substring(6,8);
	return s;
	}
//------------------------------------------------------------------------------------
function CalcDays(ymd1,ymd2)
	{
	var y1,m1,d1;
	var y2,m2,d2;
	var today=new Date();
	if (ymd1==0) return "-1";
	ymd1=ymd1+"";
	y1=parseInt(ymd1.substring(0,4),10);
	m1=parseInt(ymd1.substring(4,6),10)-1;
	d1=parseInt(ymd1.substring(6,8),10);
	if (ymd2!="")
		{
		ymd2=ymd2+"";
		y2=parseInt(ymd2.substring(0,4),10);
		m2=parseInt(ymd2.substring(4,6),10)-1;
		d2=parseInt(ymd2.substring(6,8),10);
		}
	else{
		y2=today.getFullYear();
		m2=today.getMonth();
		d2=today.getDate();
		}
	var day1=new Date(y1,m1,d1);
	var day2=new Date(y2,m2,d2);
	var days=Math.ceil((day2.getTime()-day1.getTime())/(24*60*60*1000));
	return days;
	}
//------------------------------------------------------------------------------------
function IniXML(congnum,mode)
	{
	var path;
	f="quicky.xml";
	if (mode=="all")
		{
		path=DataFolder(congnum);
		}
	else{
		path=WshShell. ExpandEnvironmentStrings("%APPDATA%")+qt+"Quicky"+qt;
		if (!fso.FolderExists(path)) fso.CreateFolder(path);
		}
	return path+f;
	}
//------------------------------------------------------------------------------------
function AddDays(ymd,adds)
	{
	var s;
	var ty,tm,td;
	var tymd=new Array();
	var ds=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	adds=parseInt(adds,10);

	s=ymd+"";
	if (s.indexOf("/",0)!=-1)
		{
		tymd=s.split("/");
		ty=parseInt(tymd[0],10);
		tm=parseInt(tymd[1],10);
		td=parseInt(tymd[2],10);
		}
	else{
		ty=parseInt(s.substring(0,4),10);
		tm=parseInt(s.substring(4,6),10);
		td=parseInt(s.substring(6,8),10);
		}
	td+=adds;

	if (adds>=0)
		{
		while (1==1)
			{
			if ((ty % 4)==0) ds[1]=29;else ds[1]=28;
			if (td<=ds[tm-1]) break;
			td-=ds[tm-1];
			tm++;
			if (tm>12) {ty++;tm=1;}
			}
		}
	else{
		if (td<1)
			{
			while(1==1)
				{
				tm--;
				if (tm==0) {tm=12;ty--;}
				if ((ty % 4)==0) ds[1]=29;else ds[1]=28;
				td+=ds[tm-1];
				if (td>0) break;
				}
			}
		}

	if (s.indexOf("/",0)!=-1)
		{
		s=ty+"/"+tm+"/"+td;
		}
	else{
		s=ty*10000+tm*100+td;
		}
	s+="";
	return s;
	}
