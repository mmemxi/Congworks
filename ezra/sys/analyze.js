//-------------------------------------------------
//	S-28�p���̉�͏��� for Ezra
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
		alert("�w�肳�ꂽPDF�������R�s�[�ł��܂���ł����B");
		return;
		}
	ClearLayer("Stage");
	WriteLayer("Stage","(Step 1/7)�����ړ��\(PDF)���摜�ɕϊ����Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait1()",5);
	}
//---------------------------------------------
// (1)PDF��Jpeg�ɕϊ�����(PDFtoImage)
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
// (2)PDFtoImage�̏����I����҂�
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
		WriteLayer("Stage","(Step 2/7)�\�ʂ̓��e����͂��Ă��܂��c<br>");
		setTimeout("ImportPDF_Wait3()",10);
		return;
		}
	else{
		setTimeout("ImportPDF_Wait2()",50);
		}
	}
//---------------------------------------------
// (3)�\�ʂ̌r�����e����͂���
//---------------------------------------------
function ImportPDF_Wait3()
	{
	fc1=fso.CreateTextFile(ReportFolder()+"unknown.fmt",true);
	fc2=fso.CreateTextFile(ReportFolder()+"unknown.csv",true);
	MatrixA=GetPDFMatrix(1,3);
	WriteLayer("Stage","(Step 3/7)�\�ʂ̗]�������o���Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait4()",10);
	}
//---------------------------------------------
// (4)�\�ʂ̗]������͂���
//---------------------------------------------
function ImportPDF_Wait4()
	{
	MatrixA=GetBlank(MatrixA);
	fc1.Write(MatrixA.csv);
	fc2.Write(MatrixA.report);
	WriteLayer("Stage","(Step 4/7)���ʂ̓��e����͂��Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait5()",10);
	}
//---------------------------------------------
// (5)���ʂ̌r�����e����͂���
//---------------------------------------------
function ImportPDF_Wait5()
	{
	MatrixB=GetPDFMatrix(2,2);
	WriteLayer("Stage","(Step 5/7)���ʂ̗]�������o���Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait6()",10);
	}
//---------------------------------------------
// (6)���ʂ̗]������͂���
//---------------------------------------------
function ImportPDF_Wait6()
	{
	MatrixB=GetBlank(MatrixB);
	fc1.Write(MatrixB.csv);
	fc2.Write(MatrixB.report);
	fc1.close();
	fc2.close();
	WriteLayer("Stage","(Step 6/7)�\�ʂ̃v���r���[�C���[�W���쐬���Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait7()",10);
	}
//---------------------------------------------
// (7)�\�ʂ̃v���r���[�C���[�W���쐬����
//---------------------------------------------
function ImportPDF_Wait7()
	{
	var wx=800;
	var wy=Math.floor(MatrixA.y/MatrixA.x*800);
	IM_resizeImage(ReportFolder()+"unknown1.jpg",wx,wy,ReportFolder()+"unknownP1.jpg");
	WriteLayer("Stage","(Step 7/7)���ʂ̃v���r���[�C���[�W���쐬���Ă��܂��c<br>");
	setTimeout("ImportPDF_Wait8()",10);
	}
//---------------------------------------------
// (8)���ʂ̃v���r���[�C���[�W���쐬����
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
			inpYear=prompt("���̕����ړ��\�̔N�x�i����S���j����͂��Ă�������","");
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
		alert("��荞��PDF����͂ł��܂���ł����B");
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
		CreateNewDB(resultYear);	//	�O�N�̂c�a����ڍs
		Menu4_YearMonth=resultYear;
		Menu4_Page=0;
		MENU4();
		alert(resultYear+"�N�x�̕����ړ��\(PDF)����荞�݂܂����B");
		}
	}

function ChangeFileName(name1,name2)
	{
	if (fso.FileExists(name2)) fso.DeleteFile(name2);
	var f=fso.GetFile(name1);
	f.Name=name2;
	}
//--------------------------------------------------------
//	GetPDFMatrix:�\�̃}�X�ڂ����o����i�Z���̏���j
//  side     = 1:�\   2:��
//  addIndex = ���̖{���܂ł̉����͖�������(�\��3�{�A��2�{�j
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
	if (!fso.FileExists(gfile))	{alert("�摜�t�@�C����������܂���\n"+gfile);return "";}
	//	�o�b�t�@�ɉ摜���擾����
	IM_getCanvas(gfile);
	x=IM_Canvas[0].length;
	y=IM_Canvas.length;
	str.x=x;str.y=y;

	//�������C���̌��o -------------------------------------------------------------
	hx=Math.floor(x/2)-15;
	for(hy=0;hy<=y-1;hy++)
		{
		p=IM_getPixel(hx,hy);
		if (p==1) continue;
		lc=IM_isFilled(hx,hy,30,1,"0");
		if (!lc) continue;
		if (skipindex!=0)	//	��΂��{������������Ă��Ȃ���Δ�΂�
			{
			skipindex--;
			hy+=11;
			continue;
			}
		str.hline[HL]=hy;	//	�����e�[�u���Ɋi�[
		HL++;
		hy+=11;
		}

	//�������C���̌��o -------------------------------------------------------------
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
//	GetBlank:�\�̏㉺���E�̋󔒕��������o����
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

	//	�摜���[�_�̌��o
	str.left=-1;
	for(hx=0;hx<str.vline[0]-1;hx++)
		{
		fc=IM_isFilled(hx,0,1,y,"1");	//	�S�s�N�Z�������H
		if (fc) continue;
		str.left=hx;
		break;
		}

	//	�摜�E�[�_�̌��o
	str.right=-1;
	for(hx=x-1;hx>str.vline[VL-1];hx--)
		{
		fc=IM_isFilled(hx,0,1,y,"1");	//	�S�s�N�Z�������H
		if (fc) continue;
		str.right=hx;
		break;
		}

	//	�摜��[�_�̌��o
	str.top=-1;
	for(hy=0;hy<str.hline[0]-1;hy++)
		{
		fc=IM_isFilled(0,hy,x,1,"1");	//	�S�s�N�Z�������H
		if (fc) continue;
		str.top=hy;
		break;
		}

	//	�摜���[�_�̌��o
	str.bottom=-1;
	for(hy=y-1;hy>str.hline[VL-1];hy--)
		{
		fc=IM_isFilled(0,hy,x,1,"1");	//	�S�s�N�Z�������H
		if (fc) continue;
		str.bottom=hy;
		break;
		}

	str.csv=str.left+","+str.right+","+str.top+","+str.bottom+"\n";
	//	�������C���̏o��
	for(i=0;i<HL;i++)
		{
		if (i>0) str.csv+=",";
		str.csv+=str.hline[i];
		}
	str.csv+="\n";

	//	�������C���̏o��
	for(i=0;i<VL;i++)
		{
		if (i>0) str.csv+=",";
		str.csv+=str.vline[i];
		}
	str.csv+="\n";

	//	�i�ڃG���A�̒��o���J�b�g�A�E�g
	nx1=str.left;ny1=str.hline[0]+2;
	nx2=str.vline[0]-2;ny2=str.hline[HL-1]-2;

	//	���l�𔲂��o��
	objEnv=WshShell.Environment("Process");
	objEnv.Item("TESSDATA_PREFIX")=TessFolder();
	IM_NowImage=gfile;
	IM_cutImage(nx1,ny1,(nx2-nx1-1),(ny2-ny1-1),TessFolder()+"numeric.bmp");
	IM_Binarization(TessFolder()+"numeric.bmp",TessFolder()+"numeric.png");
	cmd2="tesseract.exe numeric.png numeric digits.txt";
	WshShell.CurrentDirectory=TessFolder();
	WshShell.Run(cmd2,0,true);
	WshShell.CurrentDirectory=basepath;

	//	OCR���ʂ̏o��
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

	//�󔒍s�����o�A�󔒂łȂ��s�ɂ͓ǂݎ�������l������U��i���[�̐�������荶�ɍ������邩�ǂ����j
	fc=0;
	for(i=0;i<HL-1;i++)
		{
		cc=0;
		hy=str.hline[i]+Math.floor((str.hline[i+1]-str.hline[i])/2);	//	�������̒���
		if (!IM_isFilled(0,hy,str.vline[0]-10,1,"1"))					//	�^�����łȂ�
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


