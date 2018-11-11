//------------------------------------------------------
var WshShell = new ActiveXObject("WScript.Shell");
var Shell = new ActiveXObject("Shell.Application");
var Keys=new Array();
var HTMLs=new Array();
var nowmode="";
var basepath;
//------------------------------------------------------
String.prototype.trim = function()
	{
    return this.replace(/^[ ]+|[ ]+$/g, '');
	}
//------------------------------------------------------
basepath=WScript.ScriptFullName.replace(WScript.ScriptName,"");
basepath=basepath.replace("\\congworks\\lib\\","");
basepath=basepath.replace("\\congworks\\","");
//------------------------------------------------------
function WriteLayer(Layer,str)
	{
	var s;
	if (Layer in HTMLs) s=HTMLs[Layer];
	else	{
			ClearLayer(Layer);
			s="";
			}
	s+=str;
	window[Layer].innerHTML=s;
	HTMLs[Layer]=s;
	}
function ClearLayer(Layer)
	{
	HTMLs[Layer]="";
	window[Layer].innerHTML="";
	window[Layer].style.top=0;
	window[Layer].style.left=0;
	}
//------------------------------------------------------

