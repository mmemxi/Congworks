var d$=function(id){return document.getElementById(id)};
var IME=true;
var wx,wy,ww,wh;
//------------------------------------------------------------------------------------------
function splitCml(cml)
	{
	var res, reg, mat;
	reg = /"([^"]+)"|([^ ]+)/g;
	res = [];
	while (mat = reg.exec(cml))
		res[res.length] = mat[1] || mat[2];
	return res.slice(1);
	}
//------------------------------------------------------------------------------------------
function WriteLayer(Layer,str)
	{
	var l=document.getElementById(Layer);
	l.innerHTML=str;
	}

function ClearLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.innerHTML="";
	l.style.top="0px";
	l.style.left="0px";
	}

function HideLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.style.visibility="hidden";
	}

function ShowLayer(Layer)
	{
	var l=document.getElementById(Layer);
	l.style.visibility="visible";
	}
//------------------------------------------------------------------------------------------
function my_alert(msg,nextfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	ShowLayer("MASK");
	nextfunc="my_dialog_close();"+nextfunc;
	s="<div class=dialog><br><br>";
	s+=msg+"<br><br><div width=100% align=center>";
	s+=my_button("OK",nextfunc);
	s+="</div></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<500) dx=500;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	}
//------------------------------------------------------------------------------------------
function my_confirm(msg,okfunc,ngfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	var okfunc,ngfunc;
	ShowLayer("MASK");
	okfunc="my_dialog_close();"+okfunc;
	ngfunc="my_dialog_close();"+ngfunc;
	s="<div class=dialog><br><br>";
	s+=msg+"<br><br><table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td width=50% align=center>"+my_button("OK",okfunc)+"</td>";
	s+="<td width=50% align=center>"+my_button("Cancel",ngfunc)+"</td>";
	s+="</tr></table></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<300) dx=400;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	}
//------------------------------------------------------------------------------------------
function my_prompt(msg,val,nextfunc)
	{
	var s,dx,dy;
	var wx=window.innerWidth;
	var wy=window.innerHeight;
	var okfunc,ngfunc;
	ShowLayer("MASK");
	okfunc="my_prompt_exec(\""+nextfunc+"\")";
	ngfunc="my_dialog_close()";
	s="<div class=dialog><br>";
	s+="<div align=left>"+msg+"<br><br>";
	s+="<form onsubmit='return false'><input type=number class=tbox style='width:200px;' value=\""+val+"\" onfocus='this.select()'>";
	s+="<input type=text style='display:none;'></form></div>";
	s+="<br><table border=0 cellspacing=0 cellpadding=0 width=100%><tr>";
	s+="<td align=right><table border=0 cellspacing=0 cellpadding=0><tr><td>"+my_button("OK",okfunc)+"</td>";
	s+="<td><img src='./img/blank.gif' width=8></td><td>"+my_button("Cancel",ngfunc)+"</td></tr></table></td>";
	s+="</table></div><br><br>";
	WriteLayer("DIALOG",s);
	dx=DIALOG.offsetWidth;
	dy=DIALOG.offsetHeight;
	if (dx<300) dx=400;
	if (dy<120) dy=120;

	DIALOG.style.width=dx+"px";
	DIALOG.style.height=dy+"px";
	DIALOG.style.left=((wx-dx)/2)+"px";
	DIALOG.style.top=((wy-dy)/2)+"px";
	ShowLayer("DIALOG");
	document.forms[0].elements[0].select();
	}
function my_prompt_exec(nextfunc)
	{
	var r;
	my_dialog_close();
	r=document.forms[0].elements[0].value;
	eval(nextfunc+"(\""+r+"\")");
	}
//------------------------------------------------------------------------------------------
function my_button(msg,nextfunc)
	{
	var s;
	s="<div class=button>";
	s+=msg+"</div>";
	TEST.innerHTML=s;
	dx=TEST.offsetWidth;
	dy=TEST.offsetHeight;
	if (dx<80) dx=80;
	if (dy<30) dy=30;
	s="<div class=button style='width:"+dx+"px;height:"+dy+"px;' onclick='"+nextfunc+"'>";
	s+="<table border=0 cellpadding=0 cellspacing=0><tr><td width="+dx+" height="+dy+" valign=middle>"+msg+"</td></tr></table></div>";
	return s;
	}
function my_dummybutton(msg)
	{
	var s;
	s="<div class=button>";
	s+=msg+"</div>";
	TEST.innerHTML=s;
	dx=TEST.offsetWidth;
	dy=TEST.offsetHeight;
	if (dx<80) dx=80;
	if (dy<30) dy=30;
	s="<div class=buttondisabled style='width:"+dx+"px;height:"+dy+"px;'>";
	s+="<table border=0 cellpadding=0 cellspacing=0><tr><td width="+dx+" height="+dy+" valign=middle>"+msg+"</td></tr></table></div>";
	return s;
	}
//------------------------------------------------------------------------------------------
function my_dialog_close()
	{
	HideLayer("MASK");
	HideLayer("DIALOG");
	nowmode="";
	}
