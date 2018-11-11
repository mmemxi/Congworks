// -----------------------------------------------------------
function Irfan(cmd)
	{
	WshShell.CurrentDirectory=basepath+qt+"irfan";
	WshShell.Run("i_view32.exe "+cmd,0,true);
	}
// -----------------------------------------------------------
function GetImageInfo(file)
	{
	var r=new Object();
	Irfan(file+" /info="+InfFile());
	r=ImageInfo();
	return r;
	}
function ImageInfo()
	{
	var r=new Object();
	var lines=new Array();
	var ltb=new Array();
	var i;
	r.x=0;
	r.y=0;
	var text=ReadFile(InfFile());
	lines=text.split(/\r\n/);
	for(i=0;i<lines.length;i++)
		{
		if (lines[i].indexOf("Image dimensions",0)==-1) continue;
		ltb=lines[i].split(" ");
		r.x=parseInt(ltb[3],10);
		r.y=parseInt(ltb[5],10);
		break;
		}
	return r;
	}
// -----------------------------------------------------------
function CheckImageSet(num,seq)
	{
	var d1,d2;
	if (fso.FileExists(PNGFile(num,seq)))
		{
		d1=GetUpdate(PNGFile(num,seq));
		d2=GetUpdate(ThumbFile(num,seq));
		if (d2<d1)
			{
			ConvertToThumb(num,seq);
			}
		return;
		}
	}
// -----------------------------------------------------------
function ConvertToThumb(num,seq)
	{
	var buf=new Image();
	var cmd,r;
	if (fso.FileExists(ThumbFile(num,seq)))	fso.DeleteFile(ThumbFile(num,seq));
	r=GetImageInfo(PNGFile(num,seq));
	if ((r.x==2126)&&(r.y==2362))
		{
		Irfan(PNGFile(num,seq)+" /resize=(320,200) /jpgq=90 /resample /convert="+ThumbFile(num,seq));
		return;
		}
	if (r.x>r.y)
		{
		Irfan(PNGFile(num,seq)+" /resize=(320,200) /jpgq=90 /resample /convert="+ThumbFile(num,seq));
		}
	else{
		Irfan(PNGFile(num,seq)+" /rotate_l /resize=(320,200) /jpgq=90 /resample /convert="+ThumbFile(num,seq));
		}
	}
//----------------------------------------------------------
// 画像を地図データとしてインポートする
//----------------------------------------------------------
function ImportImage(num,seq)
	{
	FloatingMenu.Close();
	ClearKey();
	ClearLayer("Stage");
	var s="<form><input type=file value=''>";
	s+="<input type=hidden value='"+num+"'>";
	s+="<input type=hidden value='"+seq+"'>";
	s+="</form>";
	WriteLayer("Stage",s);
	setTimeout("ImportImage_Click()",5);
	}

function ImportImage_Click()
	{
	var s,ext,num,seq;
	document.forms[0].elements[0].click();
	s=document.forms[0].elements[0].value;
	num=document.forms[0].elements[1].value;
	seq=document.forms[0].elements[2].value;
	if (s=="") {MENU1PBig(num,seq);return;}
	if (!fso.FileExists(s)) {MENU1PBig(num,seq);return;}
	ext=fso.GetExtensionName(s).toLowerCase();
	if ((ext!="psd")&&(ext!="jpg")&&(ext!="jpeg")&&(ext!="bmp")&&(ext!="png"))
		{
		alert("指定されたファイルは取り込めません。");
		MENU1PBig();
		return;
		}
	ClearLayer("Stage");
	WriteLayer("Stage","取り込み中です…");
	setTimeout("ImportImage_Exec("+num+","+seq+",\""+escape(s)+"\")",5);
	}

function ImportImage_Exec(num,seq,file)
	{
	file=unescape(file);
	Irfan(file+" /resize=(2126,2362) /resample /gray /convert="+PNGFile(num,seq));
	CheckImageSet(num,seq);
	MENU1PBig(num,seq);
	}
