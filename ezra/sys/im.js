// =================================================
// ImageMagickを簡単に使えるライブラリ im.js
// =================================================
// IM_getPixels(入力画像ファイル名,X座標,Y座標,横幅,縦幅,フィルタモード)
//			指定した画像からピクセル情報を取得し、二次元配列に返す(result[x][y]の形)
//			フィルタモード=trueとすると、取得した画像を２値化する(0か1で返す)
// IM_setBitmap(出力画像ファイル名,加工文字列配列)
//			一時フォルダにあるbase.jpgに対し、加工文字列配列にある加工を施し、出力ファイルに出力する。
//			加工文字列は配列で複数指定可能。以下のフォーマットで渡す。
//			x [tab] y [tab] 文字列（スペースを含んでも可）
// IM_setFormatString(X座標,Y座標,文字列,フォーマット)
//			IM_setBitmapにセットするフォーマット文字列を返すフロントエンド。
//			フォーマットにはX,Z,9のいずれかのみ許される。それ以外の文字は無視される。
//			Zか9で、かつ値がマイナスであれば、空白でない桁の１文字前にマイナス符号が付与される。
//--------------------------------------------------------------------------
// *.fmtのフォーマット
//　１行目：ページ全体の左端,右端,上端,下端
//　２行目：水平ラインの縦位置の一覧（品目の１行目の直是のラインを１本目とする）
//　３行目：垂直ラインの横位置の一覧（品目番号の直後のラインを１本目とする）
//--------------------------------------------------------------------------
var IM_NowImage="";
var IM_Canvas;
var IM_DrawObjects=new Array();
if (!String.prototype.repeat) { /* String.repeat が定義されていなければ… */
   String.prototype.repeat = function(count) {/* …定義する。 */
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
//	画像を二値化してIM_Canvasに取得する
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
	tbl.splice(tbl.length-2,2);	//	末尾の行は削除
	tbl.splice(0,i+1);			//	頭の部分を削除
	buf=tbl.join("");
	buf=buf.replace(/ /g,'0');
	buf=buf.replace(/\./g,'1');
	buf="IM_Canvas=new Array("+buf+");";
	eval(buf);
	}
// --------------------------------------------------
// 指定されたピクセルの値を取得
// --------------------------------------------------
function IM_getPixel(x,y)
	{
	return IM_Canvas[y].charAt(x);
	}
// --------------------------------------------------
// 指定されたエリアを連続文字列で返す
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
// 指定されたエリアがval値でフィルされていればtrue,そうでなければfalse
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
			if (buf.length>=l)	//	文字列がフォーマットより長い
				{
				result=x+"\t"+y+"\t"+buf.substring(0,l);
				}
			else{				//	文字列がフォーマットより短い
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
					buf=(v*-1)+"";	//	正の値に変換
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
				if (p1>l) continue;	//	フォーマットより長い分は左カット
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
					buf=(v*-1)+"";	//	正の値に変換
					}
				}
			ss="";
			p1=0;
			for(i=buf.length-1;i>=0;i--)
				{
				p1++;
				c=buf.charAt(i);
				if (p1>l) continue;	//	フォーマットより長い分は左カット
				ss=c+ss;
				}
			if (p1>=l)	//	フォーマットいっぱいか長い場合
				{
				if (flag)
					{
					x-=22;
					ss="-"+ss;
					}
				result=x+"\t"+y+"\t"+ss;
				}
			else{		//	フォーマットより短い場合
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
// 画像のリサイズを行なう
//--------------------------------------------------------------------------
function IM_resizeImage(inputFile,sizex,sizey,outputFile)
	{
	var cmd="magick \""+inputFile+"\" -resize "+sizex+"x"+sizey+"! \""+outputFile+"\"";
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
// 画像の２値化
//--------------------------------------------------------------------------
function IM_Binarization(inputFile,outputFile)
	{
	var cmd="magick \""+inputFile+"\" -threshold 50% \""+outputFile+"\"";
	WshShell.Run(cmd,0,true);
	}
//--------------------------------------------------------------------------
// 画像サイズ
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
// 必要なパーツをコピーする
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
