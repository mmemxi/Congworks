var fso=new ActiveXObject("Scripting.FileSystemObject");
var qt="\\";

function ConfigFile(num)
	{
	return DataFolder()+num+qt+"config.txt";
	}

function IniFile()
	{
	return SysFolder()+"ezra.ini";
	}

function DBFile(year)
	{
	return DBFolder()+year+".csv";
	}

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

function DataFolder()
	{
	return basepath+qt+"data"+qt;
	}

function ReportFolder()
	{
	return DataFolder()+"report"+qt;
	}

function SysFolder()
	{
	return basepath+qt+"sys"+qt;
	}

function TessFolder()
	{
	return SysFolder()+"Tesseract"+qt;
	}

function DBFolder()
	{
	return DataFolder()+"db"+qt;
	}

function RackFolder()
	{
	return DataFolder()+"rack"+qt;
	}

function RackFile(yearmonth)
	{
	return RackFolder()+yearmonth+".csv";
	}

function RackExists(yearmonth)
	{
	return fso.FileExists(RackFile(yearmonth));
	}

function TempFolder()
	{
	var path=WshShell. ExpandEnvironmentStrings("%APPDATA%")+qt+"ezra"+qt;
	if (!fso.FolderExists(path)) fso.CreateFolder(path);
	return path;
	}

function QueFolder()	//	PDF自動出力キューのフォルダ
	{
	return "c:"+qt+"temp"+qt+"quicky"+qt+"pdfque"+qt;
	}

function PDFXCFolder()	//	PDF-XChangerのインストール先フォルダ
	{
	return "c:"+qt+"Program Files"+qt+"Tracker Software"+qt+"PDF Viewer"+qt;
	}
