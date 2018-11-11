//-------------------------------------------------
//	S-28用紙の解析処理 for Ezra
//-------------------------------------------------
var fc1,fc2;
var MatrixA,MatrixB,Matrix;
var resultYear="unknown";

function ImportPDF(filename)
	{
	resultYear="unknown";
	try	{
		fso.CopyFile(filename,ReportFolder()+"unknown.pdf",true);
		}
	catch(e)
		{
		alert("指定されたPDF文書をコピーできませんでした。");
		return;
		}
	ClearLayer("Stage");
	WriteLayer("Stage","(Step 1/7)文書移動表(PDF)を画像に変換しています…<br>");
	setTimeout("ImportPDF_Wait1()",5);
	}
//---------------------------------------------
// (1)PDFをJpegに変換する(PDFtoImage)
//---------------------------------------------
function ImportPDF_Wait1()
	{
	WshShell.CurrentDirectory=SysFolder()+"pdftojpg";
	cmd="PDFtoImage.exe -i \""+ReportFolder()+"unknown.pdf\" -imgtype 1 -dpi 400 -o \""+ReportFolder()+"\"";
	WshShell.Run(cmd,0,true);
	WshShell.CurrentDirectory=basepath;
	setTimeout("ImportPDF_Wait2()",5);
	}

//---------------------------------------------
// (2)PDFtoImageの処理終了を待つ
//---------------------------------------------
function ImportPDF_Wait2()
	{
	var f1,f2,f3,e1,e2,e3;
	var f=ReportFolder()+"unknown";
	f1=f+"1.jpg";
	f2=f+"2.jpg";
	f3=f+"temp.jpg";
	e1=fso.FileExists(f1);
	e2=fso.FileExists(f2);
	e3=fso.FileExists(f3);
	if ((e1)&&(e2)&&(!e3))
		{
		fso.DeleteFile(ReportFolder()+"unknown.pdf",true);
		WriteLayer("Stage","(Step 2/7)表面の内容を解析しています…<br>");
		setTimeout("ImportPDF_Wait3()",10);
		return;
		}
	else{
		setTimeout("ImportPDF_Wait2()",50);
		}
	}
//---------------------------------------------
// (3)表面の罫線内容を解析する
//---------------------------------------------
function ImportPDF_Wait3()
	{
	fc1=fso.CreateTextFile(ReportFolder()+"unknown.fmt",true);
	fc2=fso.CreateTextFile(ReportFolder()+"unknown.csv",true);
	MatrixA=GetPDFMatrix(1,3);
	WriteLayer("Stage","(Step 3/7)表面の余白を検出しています…<br>");
	setTimeout("ImportPDF_Wait4()",10);
	}
//---------------------------------------------
// (4)表面の余白を解析する
//---------------------------------------------
function ImportPDF_Wait4()
	{
	MatrixA=GetBlank(MatrixA);
	fc1.Write(MatrixA.csv);
	fc2.Write(MatrixA.report);
	WriteLayer("Stage","(Step 4/7)裏面の内容を解析しています…<br>");
	setTimeout("ImportPDF_Wait5()",10);
	}
//---------------------------------------------
// (5)裏面の罫線内容を解析する
//---------------------------------------------
function ImportPDF_Wait5()
	{
	MatrixB=GetPDFMatrix(2,2);
	WriteLayer("Stage","(Step 5/7)裏面の余白を検出しています…<br>");
	setTimeout("ImportPDF_Wait6()",10);
	}
//---------------------------------------------
// (6)裏面の余白を解析する
//---------------------------------------------
function ImportPDF_Wait6()
	{
	MatrixB=GetBlank(MatrixB);
	fc1.Write(MatrixB.csv);
	fc2.Write(MatrixB.report);
	fc1.close();
	fc2.close();
	WriteLayer("Stage","(Step 6/7)表面のプレビューイメージを作成しています…<br>");
	setTimeout("ImportPDF_Wait7()",10);
	}
//---------------------------------------------
// (7)表面のプレビューイメージを作成する
//---------------------------------------------
function ImportPDF_Wait7()
	{
	var wx=800;
	var wy=Math.floor(MatrixA.y/MatrixA.x*800);
	IM_resizeImage(ReportFolder()+"unknown1.jpg",wx,wy,ReportFolder()+"unknownP1.jpg");
	WriteLayer("Stage","(Step 7/7)裏面のプレビューイメージを作成しています…<br>");
	setTimeout("ImportPDF_Wait8()",10);
	}
//---------------------------------------------
// (8)裏面のプレビューイメージを作成する
//---------------------------------------------
function ImportPDF_Wait8()
	{
	var wx=800;
	var wy=Math.floor(MatrixA.y/MatrixA.x*800);
	IM_resizeImage(ReportFolder()+"unknown2.jpg",wx,wy,ReportFolder()+"unknownP2.jpg");
	var inpYear;
	if (resultYear=="unknown")
		{
		while(1==1)
			{
			inpYear=prompt("この文書移動表の年度（西暦４桁）を入力してください","");
			if (inpYear==false) break;
			if (inpYear=="") break;
			if ((isNaN(inpYear))||(inpYear.length!=4)) continue;
			resultYear=inpYear;
			break;
			}
		}
	if (resultYear=="unknown")
		{
		MENU4();
		alert("取り込んだPDFが解析できませんでした。");
		}
	else{
		WshShell.CurrentDirectory=ReportFolder();
		ChangeFileName("unknown1.jpg",resultYear+"1.jpg");
		ChangeFileName("unknown2.jpg",resultYear+"2.jpg");
		ChangeFileName("unknownP1.jpg",resultYear+"P1.jpg");
		ChangeFileName("unknownP2.jpg",resultYear+"P2.jpg");
		ChangeFileName("unknown.fmt",resultYear+".fmt");
		ChangeFileName("unknown.csv",resultYear+".csv");
		WshShell.CurrentDirectory=basepath;
		CreateNewDB(resultYear);	//	前年のＤＢから移行
		Menu4_YearMonth=resultYear;
		Menu4_Page=0;
		MENU4();
		alert(resultYear+"年度の文書移動表(PDF)を取り込みました。");
		}
	}

function ChangeFileName(name1,name2)
	{
	if (fso.FileExists(name2)) fso.DeleteFile(name2);
	var f=fso.GetFile(name1);
	f.Name=name2;
	}
//--------------------------------------------------------
//	GetPDFMatrix:表のマス目を検出する（セルの上線）
//  side     = 1:表   2:裏
//  addIndex = その本数までの横線は無視する(表は3本、裏2本）
//--------------------------------------------------------
function GetPDFMatrix(side,addIndex)
	{
	var x,y,hx,hy,p,lc,cc,HL,VL;
	var i,j,str,fc,skipindex=addIndex;
	var obj,fld;
	var nx1,nx2,ny1,ny2,bmp;
	var cmd1,cmd2;
	var fr,frr,fs,maxline,bside=side-1;

	str=new Object();
	str.csv="";
	str.report="*,"+bside+",";
	str.side=bside;
	
	str.hline=new Array();
	str.vline=new Array();
	str.hcell=new Array();

	var gfile=ReportFolder()+"unknown"+side+".jpg";
	str.File=gfile;
	HL=0;
	VL=0;
	if (!fso.FileExists(gfile))	{alert("画像ファイルが見つかりません\n"+gfile);return "";}
	//	バッファに画像を取得する
	IM_getCanvas(gfile);
	x=IM_Canvas[0].length;
	y=IM_Canvas.length;
	str.x=x;str.y=y;

	//水平ラインの検出 -------------------------------------------------------------
	hx=Math.floor(x/2)-15;
	for(hy=0;hy<=y-1;hy++)
		{
		p=IM_getPixel(hx,hy);
		if (p==1) continue;
		lc=IM_isFilled(hx,hy,30,1,"0");
		if (!lc) continue;
		if (skipindex!=0)	//	飛ばす本数が消化されていなければ飛ばす
			{
			skipindex--;
			hy+=11;
			continue;
			}
		str.hline[HL]=hy;	//	横線テーブルに格納
		HL++;
		hy+=11;
		}

	//垂直ラインの検出 -------------------------------------------------------------
	hy=Math.floor(y/2)-15;
	for(hx=0;hx<=x-1;hx++)
		{
		p=IM_getPixel(hx,hy);
		if (p==1) continue;
		lc=IM_isFilled(hx,hy,1,30,"0");
		if (!lc) continue;
		str.vline[VL]=hx;
		VL++;
		hx+=22;
		}
	return str;
	}

//--------------------------------------------------------
//	GetBlank:表の上下左右の空白部分を検出する
//--------------------------------------------------------
function GetBlank(str)
	{
	var x,y,hx,hy,p,lc,cc,HL,VL;
	var i,str,fc,found;
	var nx1,nx2,ny1,ny2,bmp;
	var cmd1,cmd2;
	var fr,frr,fs,maxline;
	var fld;
	var wx,wy;
	var gfile=str.File;
	x=str.x;
	y=str.y;
	HL=str.hline.length;
	VL=str.vline.length;

	//	画像左端点の検出
	str.left=-1;
	for(hx=0;hx<str.vline[0]-1;hx++)
		{
		fc=IM_isFilled(hx,0,1,y,"1");	//	全ピクセルが白？
		if (fc) continue;
		str.left=hx;
		break;
		}

	//	画像右端点の検出
	str.right=-1;
	for(hx=x-1;hx>str.vline[VL-1];hx--)
		{
		fc=IM_isFilled(hx,0,1,y,"1");	//	全ピクセルが白？
		if (fc) continue;
		str.right=hx;
		break;
		}

	//	画像上端点の検出
	str.top=-1;
	for(hy=0;hy<str.hline[0]-1;hy++)
		{
		fc=IM_isFilled(0,hy,x,1,"1");	//	全ピクセルが白？
		if (fc) continue;
		str.top=hy;
		break;
		}

	//	画像下端点の検出
	str.bottom=-1;
	for(hy=y-1;hy>str.hline[VL-1];hy--)
		{
		fc=IM_isFilled(0,hy,x,1,"1");	//	全ピクセルが白？
		if (fc) continue;
		str.bottom=hy;
		break;
		}

	str.csv=str.left+","+str.right+","+str.top+","+str.bottom+"\n";
	//	水平ラインの出力
	for(i=0;i<HL;i++)
		{
		if (i>0) str.csv+=",";
		str.csv+=str.hline[i];
		}
	str.csv+="\n";

	//	垂直ラインの出力
	for(i=0;i<VL;i++)
		{
		if (i>0) str.csv+=",";
		str.csv+=str.vline[i];
		}
	str.csv+="\n";

	//	品目エリアの抽出＆カットアウト
	nx1=str.left;ny1=str.hline[0]+2;
	nx2=str.vline[0]-2;ny2=str.hline[HL-1]-2;

	//	数値を抜き出す
	objEnv=WshShell.Environment("Process");
	objEnv.Item("TESSDATA_PREFIX")=TessFolder();
	IM_NowImage=gfile;
	IM_cutImage(nx1,ny1,(nx2-nx1-1),(ny2-ny1-1),TessFolder()+"numeric.bmp");
	IM_Binarization(TessFolder()+"numeric.bmp",TessFolder()+"numeric.png");
	cmd2="tesseract.exe numeric.png numeric digits.txt";
	WshShell.CurrentDirectory=TessFolder();
	WshShell.Run(cmd2,0,true);
	WshShell.CurrentDirectory=basepath;

	//	OCR結果の出力
	fr=ReadFile(TessFolder()+"numeric.txt");
	frr=fr.split("\r\n");
	for(i=0;i<frr.length;i++)
		{
		if (frr[i]=="") continue;
		if (isNaN(frr[i])) {frr[i]="????";continue;}
		if (frr[i].length!=4) {frr[i]="????";continue;}
		if (str.side==0)
			{
			fs=frr[i].substring(0,2);
			if (resultYear=="unknown")
				{
				if ((fs=="72")||(fs=="69")||(fs=="59"))
					{
					fs=frr[i].substring(2,4);
					resultYear=2000+parseInt(fs,10);
					}
				}
			}
		}
	str.report+=(HL-1)+",99,99\r\n";

	//空白行を検出、空白でない行には読み取った数値を割り振る（左端の垂直線より左に黒があるかどうか）
	fc=0;
	for(i=0;i<HL-1;i++)
		{
		cc=0;
		hy=str.hline[i]+Math.floor((str.hline[i+1]-str.hline[i])/2);	//	水平線の中間
		if (!IM_isFilled(0,hy,str.vline[0]-10,1,"1"))					//	真っ白でない
			{
			str.report+=str.side+","+i+","+frr[fc]+"\r\n";
			str.hcell[i]=frr[fc];
			fc++;
			}
		else	str.hcell[i]="";
		}
	WshShell.CurrentDirectory=basepath;
	return str;
	}


