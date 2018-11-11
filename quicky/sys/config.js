//------------------------------------------------------------------------------------
// 全クライアント共通の設定
//------------------------------------------------------------------------------------
var ConfigAll=new Object();
ConfigAll.CongName="";
ConfigAll.AutoEndDefault=60;
ConfigAll.AutoEndApart=30;
ConfigAll.BlankMin=21;
ConfigAll.Campeigns=new Array();
ConfigAll.Remote=new Object();
ConfigAll.Remote.Host="";
ConfigAll.Remote.User="";
ConfigAll.Remote.Password="";
ConfigAll.Remote.Directory="";
//------------------------------------------------------------------------------------
// クライアント別の設定
//------------------------------------------------------------------------------------
var ConfigLocal=new Object();
ConfigLocal.MapEditor="";
//------------------------------------------------------------------------------------
function OpenConfig()
	{
	var s=ReadXMLFile(IniXML("all"),false);
	var tmpobj=new Object();
	var token1,token2,t1,t2;

	if (s!="") ConfigAll=clone(s);
	if (!("Campeigns" in ConfigAll))
		{
		ConfigAll.Campeigns=new Array();
		}
	if (!("Remote" in ConfigAll))
		{
		ConfigAll.Remote=new Object();
		ConfigAll.Remote.Host="";
		ConfigAll.Remote.User="";
		ConfigAll.Remote.Password="";
		ConfigAll.Remote.Directory="";
		}
	s=ReadXMLFile(IniXML("local"),false);
	if (s!="") ConfigLocal=clone(s);

	//	トークンがなければ生成する
	if (!("TokenID" in ConfigLocal))
		{
		while(1==1)
			{
			token1=SQ_Read("CWTokens","","");
			SQ_Exec("update CWTokens set TokenNo=TokenNo+1;");
			token2=SQ_Read("CWTokens","","");
			t1=parseInt(token1[0].TokenNo,10);
			t2=parseInt(token2[0].TokenNo,10);
			if (t1+1==t2) break;
			}
		ConfigLocal.TokenID=FixValue(token2[0].TokenNo,8);
		WriteXMLFile(ConfigLocal,IniXML("local"));
		}
	}
function CloseConfig()
	{
	WriteXMLFile(ConfigAll,IniXML("all"));
	WriteXMLFile(ConfigLocal,IniXML("local"));
	}
