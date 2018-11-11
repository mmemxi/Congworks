<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" lang="ja" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ja" > <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta property="og:locale" content="ja_JP" />
<meta name = "viewport" content = "width=device-width, initial-scale=1">
<title>Congworks for Public Preaching-使用開始に失敗</title>
</head>
<body>
<div style="width:100%;margin:0 auto;text-align:center;">
<br>申し訳ありません。<br>処理中に、他の人によってその区域の貸出が実施されました。<br>
道理にかなった態度を示し、進んで譲ることで<br>会衆の一致に貢献してくださって感謝いたします。<br><br>
<a href="javascript:BacktoMenu()"><img src="../img/buttons/back.png"></a><br>
</div>
<div id="MASK" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:10;opacity:0.7;"></div>
<div id="TEROP" style="position:absolute;visibility:hidden;top:0px;left:0px;z-index:11;"></div>
<script type="text/JavaScript">
var preload=false;
//-------------------------------------------------------------------------
function BacktoMenu()
	{
	if (preload) return;
	preload=true;
	PleaseWait();
	location.replace("newlist.php");
	}
//-------------------------------------------------------------------------
function PleaseWait()
	{
	var x=document.body.clientWidth;
	var y=window.innerHeight;
	var s;
	var ty=document.body.scrollTop;
	s="<img src='../img/black.gif' width="+x+" height="+y+">";
	document.getElementById("MASK").style.visibility="visible";
	document.getElementById("MASK").style.top=ty+"px";
	document.getElementById("MASK").innerHTML=s;
	s="<table border=0 cellpadding=0 cellspacing=0>";
	s+="<tr><td><img src='../img/blank.gif' width=1 height="+y+"></td>";
	s+="<td width="+(x-1)+" align=center valign=middle style='color:#ffffff;font-size:24px;font-weight:bold;'>";
	s+="処理中です。しばらくお待ちください。";
	s+="</td></tr></table>";
	document.getElementById("TEROP").style.visibility="visible";
	document.getElementById("TEROP").style.top=ty+"px";
	document.getElementById("TEROP").innerHTML=s;
	}

</script>
</body>
</html>

