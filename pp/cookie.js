//---------------------------------------------------------------------
// Cookieを操作する関数群
//---------------------------------------------------------------------
var Cookies=new Array();
var c_all=document.cookie;
if(c_all!="")
	{
	var c_tbl=c_all.split( '; ' );
	for(ci=0;ci<c_tbl.length;ci++)
		{
		var c_sp=c_tbl[ci].split("=");
		Cookies[c_sp[0]]=decodeURIComponent(c_sp[1]);
		}
	}
//---------------------------------------------------------------------
function setCookie(key,value)
	{
	var expire_date = new Date();
	expire_date.setTime(expire_date.getTime() + 100*24*60*60*1000);
	var cookie_name=key;
	var cookie_value=value;
	cookie_name=encodeURIComponent(cookie_name);
	cookie_value=encodeURIComponent(cookie_value);
	document.cookie=cookie_name+"="+cookie_value + ";expires="+expire_date.toGMTString();
	}
//---------------------------------------------------------------------
