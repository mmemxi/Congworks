//-------------------------------------------------------------------------------------
// フォームボタンの定義および設置
//-------------------------------------------------------------------------------------
function AddKey(Layer,KeyNum,Message,Func)
	{
	var s=AddKeys(KeyNum,Message,Func);
	WriteLayer(Layer,s);
	}

function AddKeys(KeyNum,Message,Func)
	{
	var s="";
	s="<button class=size2 onClick='"+Func+"'><b>（"+KeyNum+"）</b></button><span class=size3";
	s+=" style='cursor:pointer' onClick='"+Func+"'>　"+Message+"</span><br>";
	Keys[KeyNum]=Func;

	s="<div style='position:relative;top:0px;left:0px;cursor:pointer;width:240px;height:32px;' onClick='"+Func+"'>";
	s+="<div style='position:absolute;top:0px;height:0px;z-index:1;'>";
	s+="<img src='"+SysFolder()+"sb"+KeyNum+".png' width=240 height=32></div>";
	s+="<div style='position:relative;top:6px;left:0px;width:190px;height:30px;text-align:center;vertical-align:middle;";
	s+="font-size:14px;font-family:Meiryo UI;-ms-transform: rotate(0.028deg);z-index:2;'>";
	s+=Message+"</div></div>";

	return s;
	}

function AddBKeys(KeyNum,Message,Func)
	{
	var s="";
	s="<div style='position:relative;top:0px;left:0px;cursor:pointer;width:320px;height:67px;' onClick='"+Func+"'>";
	s+="<div style='position:relative;top:0px;height:0px;z-index:1;'>";
	s+=SysImage("sb"+KeyNum+".png")+"</div>";
	s+="<div style='position:absolute;top:20px;left:24px;width:210px;height:40px;text-align:center;vertical-align:middle;";
	s+="font-size:20px;font-family:Meiryo UI;-ms-transform: rotate(0.05deg);z-index:2;'>";
	s+=Message+"</div></div>";
	Keys[KeyNum]=Func;
	return s;
	}

function SetOverflow(mode)
	{
	document.body.style.overflow="hidden";
	switch(mode)
		{
		case "x":
		case "X":
			document.body.style.overflowX="scroll";
			break;
		case "y":
		case "Y":
			document.body.style.overflowY="scroll";
			break;
		case "xy":
		case "XY":
			document.body.style.overflow="scroll";
			break;
		}
	}
