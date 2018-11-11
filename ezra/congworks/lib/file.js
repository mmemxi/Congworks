var fso=new ActiveXObject("Scripting.FileSystemObject");

function ConfigFile(num)
	{
	return basepath+"\\data\\"+num+"\\config.txt";
	}

function IniFile()
	{
	return SysFolder()+"ezra.ini";
	}

function DBFile(year)
	{
	return basepath+"\\data\\db\\"+year+".csv";
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

function ReportFolder()
	{
	return basepath+"\\data\\report\\";
	}

function SysFolder()
	{
	return basepath+"\\sys\\";
	}

function TessFolder()
	{
	return basepath+"\\sys\\Tesseract\\";
	}

function DBFolder()
	{
	return basepath+"\\data\\db\\";
	}

function RackFolder()
	{
	return basepath+"\\data\\rack\\";
	}

function RackFile(yearmonth)
	{
	return RackFolder()+yearmonth+".csv";
	}

function RackExists(yearmonth)
	{
	return fso.FileExists(RackFile(yearmonth));
	}
