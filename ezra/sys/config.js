//------------------------------------------------------------------------------------
var Config=new Object();
Config.PrintZoom=100;
Config.PrintBlankX=0;
Config.PrintBlankY=0;
//------------------------------------------------------------------------------------
function OpenConfig()
	{
	var lines=new Array();
	text=ReadFile(IniFile());
	if (text!="")
		{
		lines=text.split(/\r\n/);
		for(i=0;i<lines.length;i++)
			{
			s=lines[i].replace(/[]/g, "\\\\");
			eval(s);
			}
		}
	}
function CloseConfig()
	{
	var stream = fso.OpenTextFile(IniFile(),2,true,-2);
	var i,s,s1,s2;
	for(i in Config)
		{
		s1="Config."+i+"=";
		s2=Config[i];
		if (isNaN(s2))
			{
			s2="\""+s2+"\"";
			s2=s2.replace(/[\\]/g, "");
			}
		s=s1+s2+";";
		stream.WriteLine(s);
		}
	stream.close();
	}
