//------------------------------------------------------------
// íËêîÇÃéÊìæ
//------------------------------------------------------------
var adTypeBinary=1;
var adTypeText=2;
//------------------------------------------------------------
function ReadUTF8(filename)
	{
	var ADODB=new ActiveXObject("ADODB.Stream");
	ADODB.Charset="UTF-8";
	try	{
		ADODB.Open();
		ADODB.LoadFromFile(filename);
		var buf=ADODB.ReadText(-2);
		ADODB.Close();
		}
	catch(e){buf="";}
	return buf;
	}
//------------------------------------------------------------
function WriteUTF8(filename,buffer)
	{
	var ADODB=new ActiveXObject("ADODB.Stream");
	ADODB.Type=adTypeText;
	ADODB.Charset='UTF-8';
	ADODB.Open();
	ADODB.WriteText(buffer,0);
	ADODB.Position=0;
	ADODB.Type=adTypeBinary;
	ADODB.Position=3;
	var bin=ADODB.Read();
	ADODB.close();
	ADODB.Type=adTypeBinary;
	try	{
		ADODB.Open();
		ADODB.Write(bin);
		ADODB.SaveToFile(filename,2);
		ADODB.Close();
		}
	catch(e){return false;}
	return true;
	}
//------------------------------------------------------------
function ReadXMLfromUTF8(filename,force)
	{
	var GetObj=new Object();
	var p,p1,stream,xml,e;
	GetObj=new Object();

	if (!fso.FileExists(filename)) return "";
	xml=ReadUTF8(filename);
	if (xml=="") return "";

	xml=xml.replace(/\r/g,"");
	xml=xml.replace(/\n/g,"");
	xml=xml.replace(/<br>/g,"");

	p=xml.indexOf("<?xml",0);
	p1=xml.indexOf("?>",0);
	if ((p!=-1)&&(p1!=-1))
		{
		xml=xml.substring(p1+1,xml.length);
		}
	if (xml.indexOf("<Object",0)==-1)
		{
		xml="<Object>"+xml+"</Object>";
		}
	ExtractXML(filename,GetObj,xml,0,force);
	if (force)
		{
		return GetObj.Object[0];
		}
	return GetObj.Object;
	}
//------------------------------------------------------------
function WriteXMLtoUTF8(PutObj,filename)
	{
	var fc;
	var PutXML="<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	var i,j,obj;
	if (PutObj=="")
		{
		WriteUTF8(filename,"");
		return;
		}
	PutXML+=MergeXML("Object",PutObj,"",false);
	WriteUTF8(filename,PutXML);
	}

