//------------------------------------------------------------------
var fso=new ActiveXObject("Scripting.FileSystemObject");
var qt="\\";
//------------------------------------------------------------------
// 基本フォルダ
//------------------------------------------------------------------
function DataFolder()
	{
	return basepath+qt+"data"+qt+congnum+qt;
	}
function SysFolder()
	{
	return basepath+qt+"sys"+qt;
	}
function NumFolder(num)
	{
	return NumFolderPath(num)+qt;
	}
function NumFolderPath(num)
	{
	return DataFolder()+num;
	}
function HistoryFolder()
	{
	return DataFolder()+"history"+qt;
	}
function ApartFolder()
	{
	return DataFolder()+"apartment"+qt;
	}
function GetXamppFolder()
	{
	return "c:"+qt+"xampp"+qt+"htdocs"+qt+"congworks"+qt;
	}
function LocalFolder()
	{
	var path=WshShell. ExpandEnvironmentStrings("%APPDATA%")+qt+"Quicky"+qt;
	if (!fso.FolderExists(path)) fso.CreateFolder(path);
	return path;
	}
function AllFolder()
	{
	return DataFolder()+"all"+qt;
	}
function SummaryFolder()
	{
	return DataFolder()+"summary"+qt;
	}
function PersonalFolder()
	{
	return DataFolder()+"personal"+qt;
	}
function CWFolder()
	{
	return basepath+qt+"congworks"+qt;
	}

function QueFolder()	//	PDF自動出力キューのフォルダ
	{
	return "c:"+qt+"temp"+qt+"quicky"+qt+"pdfque"+qt;
	}

function PDFXCFolder()	//	PDF-XChangerのインストール先フォルダ
	{
	return "c:"+qt+"Program Files"+qt+"Tracker Software"+qt+"PDF Viewer"+qt;
	}
//------------------------------------------------------------------
// 画像ファイル
//------------------------------------------------------------------
function BlankGIF()
	{
	return SysFolder()+"blank.gif";
	}
function BlankPNG()
	{
	return SysFolder()+"blank.png";
	}
function PNGFile(num,seq)
	{
	return NumFolder(num)+seq+".png";
	}
function ThumbFile(num,seq)
	{
	return NumFolder(num)+"thumb"+seq+".jpg";
	}
function Star(mode)
	{
	var f="<img src='"+SysFolder()+"star";
	if (!mode) f+="2";
	f+=".gif'>";
	return f;
	}
function SysImage(file)
	{
	return "<span style='cursor:pointer;' onclick='MainMenu()'><img src='"+SysFolder()+file+"'></span>";
	}
function hr()
	{
	return SysImage("line.png")+"<br>";
	}
//------------------------------------------------------------------
// その他ファイル
//------------------------------------------------------------------
function LogXML(num)
	{
	return NumFolder(num)+"log.xml";
	}
function ApartFile(name)
	{
	var s;
	s=ApartFolder();
	if (!fso.FolderExists(s)) fso.CreateFolder(s);
	s+=name+".txt";
	return s;
	}
function ConfigXML(num)
	{
	return NumFolder(num)+"config.xml";
	}
function IniXML(mode)
	{
	var path;
	f="quicky.xml";
	if (mode=="all")	path=DataFolder();
	else				path=LocalFolder();
	return path+f;
	}
function InfFile()
	{
	return LocalFolder()+"imageinf.txt";
	}
function AllFile(mode,size)
	{
	if (mode)
		{
		if (size=="full") return AllFolder()+"colorfull.jpg";
		return AllFolder()+"color.jpg";
		}
	if (size=="full") return AllFolder()+"monofull.jpg";
	return AllFolder()+"mono.jpg";
	}
function BuildingFile(num)
	{
	return NumFolder(num)+"building.xml";
	}
function BuildingDefault()
	{
	return SysFolder()+"building.xml";
	}
function ApartXML(id)
	{
	return ApartFolder()+id+".xml";
	}
function TempXML()
	{
	return SysFolder()+"temp.xml";
	}
function MarkerFile(num)
	{
	return NumFolder(num)+"marker.xml";
	}
//------------------------------------------------------------------
// ファイルアクセス
//------------------------------------------------------------------
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

function WriteFile(filename,buf)
	{
	var f=fso.CreateTextFile(filename,true);
	f.write(buf);
	f.close();
	}
//------------------------------------------------------------------
// ファイルシステム
//------------------------------------------------------------------
function GetDriveSerialNumber(drvno)
	{
	var serial=fso.GetDrive(drvno).SerialNumber;
	return serial;
	}

function CreateFolders(foldername)
	{
	var parentfolder;
	parentfolder=fso.GetParentFolderName(foldername);
	if (fso.FolderExists(parentfolder))
		{
		if (!fso.FolderExists(foldername))
			{
			fso.CreateFolder(foldername);
			}
		}
	else{
		CreateFolders(parentfolder);
		fso.CreateFolder(foldername);
		}
	}
//------------------------------------------------------------------
// 共通プログラム起動
//------------------------------------------------------------------
function RunWSF(cmd)
	{
	var cmd="\""+basepath+"\\congworks\\RunWSF.bat\" "+ConfigLocal.TokenID+" \""+cmd+"\"";
	WshShell.Run(cmd,0,true);
	result=ReadFile("c:\\temp\\quicky\\"+ConfigLocal.TokenID+".txt");
	return result;
	}

