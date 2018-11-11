//------------------------------------------------------------------------------------
var WshShell = new ActiveXObject("WScript.Shell");
var fso=new ActiveXObject("Scripting.FileSystemObject");
var adodb=new ActiveXObject("ADODB.Stream");
var basepath=fso.getParentFolderName(WScript.ScriptFullName);
basepath=fso.getParentFolderName(basepath).replace(qt+"congworks","");
//------------------------------------------------------------------------------------
String.prototype.trim = function()
	{
    return this.replace(/^[ ]+|[ ]+$/g, '');
	}
String.prototype.trim2 = function()
	{
    return this.replace(/^[\"]+|[\"]+$/g, '');
	}
//----------------------------------------------------------------
var congnum,num,seq;
var qt="\\";
//----------------------------------------------------------------
function DataFolder(xnum)
	{
	return basepath+qt+"data"+qt+xnum+qt;
	}
function NumFolder(xnum,num)
	{
	return DataFolder(xnum)+num+qt;
	}
function ConfigXML(xnum,num)
	{
	return NumFolder(xnum,num)+"config.xml";
	}
function PersonalFolder(xnum)
	{
	return DataFolder(xnum)+"personal"+qt;
	}
function ApartFolder(xnum)
	{
	return DataFolder(xnum)+"apartment"+qt;
	}
function SummaryFolder(xnum)
	{
	return DataFolder(xnum)+"summary"+qt;
	}
function AllFolder(xnum)
	{
	return DataFolder(xnum)+"all"+qt;
	}
function WSHScript(sname)
	{
	return basepath+qt+"congworks"+qt+sname;
	}
function SysFolder()
	{
	return basepath+qt+"sys"+qt;
	}
function RootFolder()
	{
	return fso.GetParentFolderName(basepath)+qt;
	}
