// =================================================
// ImageMagick���ȒP�Ɏg���郉�C�u���� im.js
// =================================================
// IM_getPixels(���͉摜�t�@�C����,X���W,Y���W,����,�c��,�t�B���^���[�h)
//			�w�肵���摜����s�N�Z�������擾���A�񎟌��z��ɕԂ�(result[x][y]�̌`)
//			�t�B���^���[�h=true�Ƃ���ƁA�擾�����摜���Q�l������(0��1�ŕԂ�)
// IM_setBitmap(�o�͉摜�t�@�C����,���H������z��)
//			�ꎞ�t�H���_�ɂ���base.jpg�ɑ΂��A���H������z��ɂ�����H���{���A�o�̓t�@�C���ɏo�͂���B
//			���H������͔z��ŕ����w��\�B�ȉ��̃t�H�[�}�b�g�œn���B
//			x [tab] y [tab] ������i�X�y�[�X���܂�ł��j
// IM_setFormatString(X���W,Y���W,������,�t�H�[�}�b�g)
//			IM_setBitmap�ɃZ�b�g����t�H�[�}�b�g�������Ԃ��t�����g�G���h�B
//			�t�H�[�}�b�g�ɂ�X,Z,9�̂����ꂩ�̂݋������B����ȊO�̕����͖��������B
//			Z��9�ŁA���l���}�C�i�X�ł���΁A�󔒂łȂ����̂P�����O�Ƀ}�C�i�X�������t�^�����B
//--------------------------------------------------------------------------
// *.fmt�̃t�H�[�}�b�g
//�@�P�s�ځF�y�[�W�S�̂̍��[,�E�[,��[,���[
//�@�Q�s�ځF�������C���̏c�ʒu�̈ꗗ�i�i�ڂ̂P�s�ڂ̒����̃��C�����P�{�ڂƂ���j
//�@�R�s�ځF�������C���̉��ʒu�̈ꗗ�i�i�ڔԍ��̒���̃��C�����P�{�ڂƂ���j
//--------------------------------------------------------------------------
var IM_NowImage="";
var IM_Canvas;
var IM_DrawObjects=new Array();
if (!String.prototype.repeat) { /* String.repeat ����`����Ă��Ȃ���΁c */
   String.prototype.repeat = function(count) {/* �c��`����B */
      return Array(count*1+1).join(this);
   };
}
//--------------------------------------------------------------------------
function IM_setBitmap(outFile,strArray)
	{
	var i,j,tbl,c,px,py;
	var str;
	var TempFileName=TempFolder()+"im_setbitmap.txt";
	var f=fso.CreateTextFile(TempFileName,true);
	f.WriteLine("base.jpg");
	f.WriteLine("-gravity northwest");
	for(i=0;i<strArray.length;i++)
		{
		tbl=strArray[i].split("\t");
		if (tbl.length!=3) continue;
		px=parseInt(tbl[0],10);
		py=parseInt(tbl[1],10);
		for(j=0;j<tbl[2].length;j++)
			{
			c=tbl[2].charAt(j);
			if (c!=" ")
				{
				str="-draw \"image over "+px+","+py+",0,0 '"+c+".png'\"";
				f.WriteLine(str);
				}
			px+=22;
			}
		}
	f.WriteLine("-write "+outFile);
	f.close();
	WshShell.CurrentDirectory=TempFolder();
	var cmd="magick -script "+TempFileName;
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
function IM_cutImage(Xpos,Ypos,Width,Height,OutputFile)
	{
	var cmd;
	cmd="magick \""+IM_NowImage+"\" -crop "+Width+"x"+Height+"+"+Xpos+"+"+Ypos+" \""+OutputFile+"\"";
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
//	�摜���l������IM_Canvas�Ɏ擾����
//--------------------------------------------------------------------------
function IM_getCanvas(ImageFile)
	{
	var cmd,buf,str,i;
	var TempFileName=TempFolder()+"im_getcanvas.xpm";
	WshShell.CurrentDirectory=basepath;
	cmd="magick \""+ImageFile+"\" -threshold 50% \""+TempFileName+"\"";
	WshShell.Run(cmd,0,true);
	buf=ReadFile(TempFileName);
	tbl=buf.split("\n");
	i=0;
	for(i=0;i<tbl.length;i++)
		{
		if (tbl[i].indexOf("pixels",0)!=-1) break;
		}
	tbl.splice(tbl.length-2,2);	//	�����̍s�͍폜
	tbl.splice(0,i+1);			//	���̕������폜
	buf=tbl.join("");
	buf=buf.replace(/ /g,'0');
	buf=buf.replace(/\./g,'1');
	buf="IM_Canvas=new Array("+buf+");";
	eval(buf);
	}
// --------------------------------------------------
// �w�肳�ꂽ�s�N�Z���̒l���擾
// --------------------------------------------------
function IM_getPixel(x,y)
	{
	return IM_Canvas[y].charAt(x);
	}
// --------------------------------------------------
// �w�肳�ꂽ�G���A��A��������ŕԂ�
// --------------------------------------------------
function IM_getPixelArea(x,y,width,height)
	{
	var ax,ay,s,r="";
	for(ay=y;ay<y+height;ay++)
		{
		r+=IM_Canvas[ay].substring(x,x+width);
		}
	return r;
	}
// --------------------------------------------------
// �w�肳�ꂽ�G���A��val�l�Ńt�B������Ă����true,�����łȂ����false
// --------------------------------------------------
function IM_isFilled(x,y,width,height,val)
	{
	var r=IM_getPixelArea(x,y,width,height);
	var l=r.length;
	if (r==val.repeat(l)) return true;
	return false;
	}
//--------------------------------------------------------------------------
function IM_getPixels(ImageFile,Xpos,Ypos,Width,Height,Filter)
	{
	var cmd;
	var TempFileName=TempFolder()+"im_getpixels.txt";
	WshShell.CurrentDirectory=basepath;
	cmd="magick \""+ImageFile+"\" -crop "+Width+"x"+Height+"+"+Xpos+"+"+Ypos+" \""+TempFileName+"\"";
	WshShell.Run(cmd,0,true);
	var result=IM_getTextToArray(TempFileName,Filter);
	return result;
	}
//--------------------------------------------------------------------------
function IM_getTextToArray(TextFileName,FilterMode)
	{
	var buf=ReadFile(TextFileName);
	if (buf=="") return "";
	var result=new Array();
	var tbl=buf.split("\r\n");
	var i,j,p1,p2,s1,s2,tbl2,x,y,sv;
	for(i=0;i<tbl.length;i++)
		{
		if (tbl[i].charAt(0)=="#") continue;
		p1=tbl[i].indexOf(":",0);
		if (p1==-1) continue;
		s1=tbl[i].substring(0,p1);
		tbl2=s1.split(",");
		if (tbl2.length!=2) continue;
		x=parseInt(tbl2[0],10);
		y=parseInt(tbl2[1],10);
		p1=tbl[i].indexOf("#",0);
		if (p1==-1) continue;
		p2=tbl[i].indexOf(" ",p1);
		if (p2==-1) continue;
		s2=tbl[i].substring(p1+1,p2);
		if (!(x in result)) result[x]=new Array();
		if (FilterMode)
			{
			sv=parseInt(s2,16);
			if (sv>=0x808080) s2=1;else s2=0;
			}
		result[x][y]=s2;
		}
	return result;
	}
//--------------------------------------------------------------------------
function IM_setFormatString(x,y,str,format)
	{
	var result="";
	var buf=str+"";
	format=format+"";
	var pos=0;
	var t=format.charAt(0);
	var l=format.length;
	var i,j,v,c,flag,ss,p1,p2;

	switch(t)
		{
		case "X":
			if (buf.length>=l)	//	�����񂪃t�H�[�}�b�g��蒷��
				{
				result=x+"\t"+y+"\t"+buf.substring(0,l);
				}
			else{				//	�����񂪃t�H�[�}�b�g���Z��
				result=x+"\t"+y+"\t"+str;
				j=l-str.length;
				for(i=0;i<j;i++) result+=" ";
				}
			break;

		case "9":
			flag=false;
			if (!isNaN(buf))
				{
				v=parseInt(buf,10);
				if (v<0)
					{
					x-=22;
					flag=true;
					buf=(v*-1)+"";	//	���̒l�ɕϊ�
					}
				}
			result=x+"\t"+y+"\t";
			if (flag) result+="-";
			ss="";
			p1=0;
			for(i=buf.length-1;i>=0;i--)
				{
				p1++;
				c=buf.charAt(i);
				if (p1>l) continue;	//	�t�H�[�}�b�g��蒷�����͍��J�b�g
				ss=c+ss;
				}
			if (p1<l)
				{
				for(j=p1;j<l;j++)
					{
					ss="0"+ss;
					}
				}
			result+=ss;
			break;

		case "Z":
			flag=false;
			if (!isNaN(buf))
				{
				v=parseInt(buf,10);
				if (v<0)
					{
					flag=true;
					buf=(v*-1)+"";	//	���̒l�ɕϊ�
					}
				}
			ss="";
			p1=0;
			for(i=buf.length-1;i>=0;i--)
				{
				p1++;
				c=buf.charAt(i);
				if (p1>l) continue;	//	�t�H�[�}�b�g��蒷�����͍��J�b�g
				ss=c+ss;
				}
			if (p1>=l)	//	�t�H�[�}�b�g�����ς��������ꍇ
				{
				if (flag)
					{
					x-=22;
					ss="-"+ss;
					}
				result=x+"\t"+y+"\t"+ss;
				}
			else{		//	�t�H�[�}�b�g���Z���ꍇ
				for(j=p1;j<l;j++)
					{
					if ((j==p1)&&(flag))	ss="-"+ss;
					else ss=" "+ss;
					}
				result=x+"\t"+y+"\t"+ss;
				}
			break;

		default:
			result="";
			break;
		}
	return result;
	}
//--------------------------------------------------------------------------
function LoadCanvas(year,side)
	{
	var i,fmt,fmt1,box;
	var rpdir=ReportFolder();
	var s,imgfile;
	fmt=ReadFile(rpdir+year+".fmt");
	fmt1=fmt.split("\n");
	Matrix=new Object();
	if (side==0)
		{
		s="1";
		box=fmt1[0].split(",");
		Matrix.left=parseInt(box[0],10);
		Matrix.right=parseInt(box[1],10);
		Matrix.top=parseInt(box[2],10);
		Matrix.bottom=parseInt(box[3],10);
		Matrix.hline=fmt1[1].split(",");
		Matrix.vline=fmt1[2].split(",");
		}
	else{
		s="2";
		box=fmt1[3].split(",");
		Matrix.left=parseInt(box[0],10);
		Matrix.right=parseInt(box[1],10);
		Matrix.top=parseInt(box[2],10);
		Matrix.bottom=parseInt(box[3],10);
		Matrix.hline=fmt1[4].split(",");
		Matrix.vline=fmt1[5].split(",");
		}
	for(i in Matrix.hline) Matrix.hline[i]=parseInt(Matrix.hline[i],10);
	for(i in Matrix.vline) Matrix.vline[i]=parseInt(Matrix.vline[i],10);

	imgfile=rpdir+year+s+".jpg";
	if (IM_NowImage!=imgfile)
		{
		IM_NowImage=imgfile;
		}
	IM_DrawObjects=new Array();
	}
//--------------------------------------------------------------------------
// �摜�̃��T�C�Y���s�Ȃ�
//--------------------------------------------------------------------------
function IM_resizeImage(inputFile,sizex,sizey,outputFile)
	{
	var cmd="magick \""+inputFile+"\" -resize "+sizex+"x"+sizey+"! \""+outputFile+"\"";
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
// �摜�̂Q�l��
//--------------------------------------------------------------------------
function IM_Binarization(inputFile,outputFile)
	{
	var cmd="magick \""+inputFile+"\" -threshold 50% \""+outputFile+"\"";
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
// �摜�T�C�Y
//--------------------------------------------------------------------------
function IM_getImageSize(inputFile)
	{
	var result=new Object();
	try	{
		WshShell.CurrentDirectory=TempFolder();
		var cmd="magick \""+inputFile+"\" -format \"%w,&h\" info: >imgsize.txt";
		WshShell.Run(cmd,0,true);
		var txt=ReadFile(TempFolder()+"imgsize.txt");
		var s=txt.split(",");
		result.x=parseInt(s[0],10);
		result.y=parseInt(s[1],10);
		}
	catch(e)
		{
		result.x=0;
		result.y=0;
		}
	return result;
	}
//--------------------------------------------------------------------------
// �K�v�ȃp�[�c���R�s�[����
//--------------------------------------------------------------------------
function IM_setupImages()
	{
	fso.CopyFile(SysFolder()+"0.png",TempFolder()+"0.png",true);
	fso.CopyFile(SysFolder()+"1.png",TempFolder()+"1.png",true);
	fso.CopyFile(SysFolder()+"2.png",TempFolder()+"2.png",true);
	fso.CopyFile(SysFolder()+"3.png",TempFolder()+"3.png",true);
	fso.CopyFile(SysFolder()+"4.png",TempFolder()+"4.png",true);
	fso.CopyFile(SysFolder()+"5.png",TempFolder()+"5.png",true);
	fso.CopyFile(SysFolder()+"6.png",TempFolder()+"6.png",true);
	fso.CopyFile(SysFolder()+"7.png",TempFolder()+"7.png",true);
	fso.CopyFile(SysFolder()+"8.png",TempFolder()+"8.png",true);
	fso.CopyFile(SysFolder()+"9.png",TempFolder()+"9.png",true);
	fso.CopyFile(SysFolder()+"-.png",TempFolder()+"-.png",true);
	fso.CopyFile(IM_NowImage,TempFolder()+"base.jpg",true);
	}
//--------------------------------------------------------------------------
function SaveCanvas(page)
	{
	var outfile="printout"+page+".jpg";
	IM_setupImages();
	IM_setBitmap(outfile,IM_DrawObjects);
	IM_DrawObjects=new Array();
	}

function DrawCanvas(cx,cy,dval)
	{
	var x,y,obj;
	if (dval=="") return;
	if (isNaN(dval)) return;
	if (dval<0) return;
	x=Matrix.vline[cx+1]+22;
	y=Matrix.hline[cy]+Math.floor(((Matrix.hline[cy+1]-Matrix.hline[cy])-50)/2)+1;
	obj=IM_setFormatString(x,y,dval,"ZZZZ");
	IM_DrawObjects.push(obj);
	}
