//------------------------------------------------------------------------------------
//	特記事項の追加・変更
//------------------------------------------------------------------------------------
var RTB=new Array();
var RSTR=new Array();
var RSortkey=new Array();
var yy,mm,dd;
var RRefuse=0;
var RRinx=0;
var RDragging=false;
var RDragStartX=0;
var RDragStartY=0;
var RDragEndX=0;
var RDragEndY=0;
var RDragObj;
var RDTitle="";
var RDComment="";
var RDSize=50;
var oRDComment="";
var oRDSize=50;
var RefuseExit;
var Rvml=new Poly("");
var RscrollX,RscrollY;
var RBuild=new Object();
var TempXMLFile="";

function Maint_Refuses(num)
	{
	var BTB=Cards[num].RTB;
	RRefuse=num;
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	RefuseExit="";
	s="<form>"+SysImage("cwministry.png")+"<br>";
	s+="<span class=size3>メインメニュー＞区域一覧＞特記情報</span><br>";
	s+="<div class=size5>№"+num+"「"+Cards[num].name+"」の特記情報一覧：</div>"+hr();
	WriteLayer("Stage",s);
	AddKey("Stage",1,"特記情報の追加","AddRefuses("+num+",0)");
	AddKey("Stage",0,"区域一覧へ戻る","MENU1()");
	Keys[11]="MENU1()";
	ReadBuilding(num);
	SetRefusesToBuilding(0,BTB,num,false);
	//	一覧表---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=30>地図</td>";
	s+="<td align=center class=size2 width=80>区分１</td>";
	s+="<td align=center class=size2 width=100>区分２</td>";
	s+="<td align=center class=size2 width=150>名前</td>";
	s+="<td align=center class=size2 width=100>立場</td>";
	s+="<td align=center class=size2 width=70>登録日</td>";
	s+="<td align=center class=size2 width=70>確認日</td>";
	s+="</tr>";
	//ソートキーの作成------------------------------------------------------------ 
	maxsort=0;
	for(i in RSortkey) delete RSortkey[i];
	for(i in BTB)
		{
		RSortkey[maxsort]=new Object();
		RSortkey[maxsort].num=i;
		RSortkey[maxsort].key=(100+BTB[i].Num)+BTB[i].KBN1+BTB[i].Date;
		maxsort++;
		}
	RSortkey.sort(Refuse_sort);
	for(j=0;j<maxsort;j++)
		{
		i=RSortkey[j].num;
		s+="<tr style='cursor:pointer' title='この特記情報を修正します' onClick='PreEditRefuses("+num+","+i+")' class=size2>";
		s+="<td align=right>"+BTB[i].Num+"</td>";				//	地図番号
		s+="<td align=center";
		if (BTB[i].KBN1=="拒否") s+=" bgcolor='#ff6666'";
		s+=">"+BTB[i].KBN1+"</td>";				//	区分１
		s+="<td align=center>"+BTB[i].KBN2+"</td>";				//	区分２
		s+="<td>"+BTB[i].Name+"</td>";							//	名前
		s+="<td>"+BTB[i].Person+"　</td>";						//	立場
		if (BTB[i].Date=="") s+="<td align=center>-</td>";
		else s+="<td align=right>"+SplitDate(BTB[i].Date)+"</td>";				//	登録日
		if (!("LastConfirm" in BTB[i])) s+="<td align=center>-</td>";
		else
			{
			if (BTB[i].LastConfirm==0) s+="<td align=center>-</td>";
			else s+="<td align=right>"+SplitDate(BTB[i].LastConfirm)+"</td>";				//	確認日
			}
		s+="</tr>";
		}
	s+="</table>";
	if (BTB.length==0) s+="<span class=size3>特記情報はありません。</span>";
	s+="</form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
//	document.forms[0].elements[0].focus();
	}
function Refuse_sort(a, b)
	{
	if (a.key>b.key) return 1;
	if (a.key<b.key) return -1;
	return 0;
	}
// 特記情報の追加----------------------------------------------------------------
function AddRefuses(num,seq)
	{
	var BTB=Cards[num].RTB;
	var i=BTB.length;
	BTB[i]=new Object();
	if (seq==0) BTB[i].Num=1;else BTB[i].Num=seq;
	BTB[i].KBN1="拒否";
	BTB[i].KBN2="戸建";
	if (Cards[num].MapType!=0) BTB[i].KBN2="集合住宅（単独）";
	BTB[i].Name="";				//	物件名
	BTB[i].Person="";			//	立場（集中の場合、合計件数）
	BTB[i].Reason="";			//	特記理由（集中の場合コメント）
	BTB[i].Date="20111101";		//	特記追加日（集中の場合網羅開始日）
	BTB[i].Servant="";			//	報告奉仕者名（集中の場合使用者名）
	BTB[i].Confirm="";			//	確認状況（集中の場合網羅終了日）
	BTB[i].Position="";			//	位置情報
	BTB[i].Writing="";			//	記入情報
	BTB[i].Clip="";				//	クリップファイル名
	BTB[i].LastConfirm=0;		//	最終確認日
	BTB[i].Frequency=0;			//	間隔周期
	BTB[i].Cycle=0;				//	サイクル
	BTB[i].Add=true;
	PreEditRefuses(num,i);
	}

function PreEditRefuses(num,inx)
	{
	TempXMLFile="";
	EditRefuses(num,inx);
	}
// 日付入力フォームの作成-----------------------------------------------------------
function CreateDateForm(date,head)
	{
	var s,y,m,d,i;
	if (date==0) date="20111101";
	if (date==undefined) date="20111101";
	s="<select id='"+head+"_DATEYY'>";
	y=parseInt(date.substring(0,4),10);
	m=parseInt(date.substring(4,6),10);
	d=parseInt(date.substring(6,8),10);
	for(i=1995;i<=2030;i++)
		{
		s+="<option value="+i;
		if (i==y) s+=" selected";
		s+=">"+i+"</option>";
		}
	s+="</select>年";
	s+="<select id='"+head+"_DATEMM'>";
	for(i=1;i<=12;i++)
		{
		s+="<option value="+i;
		if (i==m) s+=" selected";
		s+=">"+i+"</option>";
		}
	s+="</select>月";
	s+="<select id='"+head+"_DATEDD'>";
	for(i=1;i<=31;i++)
		{
		s+="<option value="+i;
		if (i==d) s+=" selected";
		s+=">"+i+"</option>";
		}
	s+="</select>日";
	return s;
	}
// 特記情報の編集 --------------------------------------------------------------
function EditRefuses(num,inx)
	{
	var BTB=Cards[num].RTB;
	var s;
	var thistype=BTB[inx].KBN1;
	var kbn1=new Array("拒否","再訪問/研究","外国語/手話","集中インターホン","集合住宅");
	var kbn2=new Array("戸建","集合住宅(単独)","集合住宅(全体)","集中インターホン");
	var mode;
	var bldobj;
	RRefuse=num;
	RRinx=inx;
	ReturntoBuildingFrom="EditRefuses";
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	//	未定義項目のフォロー
	if (!("LastConfirm" in BTB[inx])) BTB[inx].LastConfirm=BTB[inx].Date;
	if (!("Frequency" in BTB[inx])) BTB[inx].Frequency=0;
	if (!("Cycle" in BTB[inx])) BTB[inx].Cycle=0;
	//	フォーム作成
	s="<form>"+SysImage("cwministry.png")+"<br>";
	if ("Add" in BTB[inx])
		{
		mode=0;
		s+="<div class=size5>№"+num+"「"+Cards[num].name+"」の特記情報の追加：</div>"+hr();
		}
	else{
		mode=1;
		if (!(isNaN(RefuseExit)))
			{
			s+="<div class=size5>№"+num+"「"+Cards[num].name+"」の特記情報の修正：</div>"+hr();
			}
		else{
			s+="<div class=size5>「"+RefuseExit+"」の修正：</div>"+hr();
			}
		}
	s+="<div class=size3><form onsubmit='return false'>";
	//	（１）地図番号 ---------------------------------------------------------------
	s+="地図番号：<select id='ER_SEQ' onChange='ChangeRefuseNum("+inx+")'>";
	for(i=1;i<=Cards[num].count;i++)
		{
		s+="<option value="+i;
		if (BTB[inx].Num==i) s+=" selected";
		s+=">"+i+"</option>";
		}
	s+="</select><br>";
	//	（２）区分１ -----------------------------------------------------------------
	s+="区分１：<select id='ER_KBN1' onChange='ChangeRefuseKBN1("+mode+","+inx+")'";
	if (mode==1)
		{
		if ((BTB[inx].KBN1!="集中インターホン")&&(BTB[inx].KBN1!="集合住宅")) s+=" disabled";
		}
	s+=">";
	for(i=0;i<kbn1.length;i++)
		{
		s+="<option";
		if (BTB[inx].KBN1==kbn1[i]) s+=" selected";
		if (mode==1)
			{
			if ((BTB[inx].KBN1=="集中インターホン")||(BTB[inx].KBN1=="集合住宅"))
				{
				if (i<3) s+=" disabled";
				}
			}
		s+=">"+kbn1[i];
		s+="</option>";
		}
	s+="</select><br>";
	//	（３）区分２ -----------------------------------------------------------------
	if ((mode==0)&&(BTB[inx].KBN1!="集中インターホン")&&(BTB[inx].KBN1!="集合住宅"))
		{
		s+="区分２：<select id='ER_KBN2' onChange='ChangeRefuseKBN2("+inx+")'>";
		}
	else{
		s+="区分２：<select id='ER_KBN2' onChange='ChangeRefuseKBN2("+inx+")' disabled>";
		}
	for(i in kbn2)
		{
		s+="<option";
		if (BTB[inx].KBN2==kbn2[i]) s+=" selected";
		s+=">"+kbn2[i];
		s+="</option>";
		}
	s+="</select><br>";

	//	（４）名前～ -----------------------------------------------------------------
	if ((thistype!="集中インターホン")&&(thistype!="集合住宅"))
		{
		s+="名前：<input id='ER_NAME' type=text size=50 style='ime-mode:active;' value='"+BTB[inx].Name+"'><br>";
		s+="立場：<input id='ER_PERSON' type=text size=10 style='ime-mode:active;' value='"+BTB[inx].Person+"'><br>";
		s+="理由：<input id='ER_REASON' type=text size=50 style='ime-mode:active;' value='"+BTB[inx].Reason+"'><br>";
		s+="登録日：";
		s+=CreateDateForm(BTB[inx].Date,"ER")+"<br>";
		s+="奉仕者：<input id='ER_SERVANT' type=text size=20 style='ime-mode:active;' value='"+BTB[inx].Servant+"'><br>";
		s+="確認情報：<input id='ER_CONFIRM' type=text size=50 style='ime-mode:active;' value='"+BTB[inx].Confirm+"'><br>";
		s+="最終確認日："+CreateDateForm(BTB[inx].LastConfirm,"ERC")+"<br>";
		s+="訪問頻度：<select id='ER_FREQUENCY'>";
		s+="<option value=0";if (BTB[inx].Frequency==0) s+=" selected";s+=">訪問しない</option>";
		s+="<option value=2";if (BTB[inx].Frequency==2) s+=" selected";s+=">２回に１回</option>";
		s+="<option value=3";if (BTB[inx].Frequency==3) s+=" selected";s+=">３回に１回</option>";
		s+="<option value=4";if (BTB[inx].Frequency==4) s+=" selected";s+=">４回に１回</option>";
		s+="</select><br>";
		s+="サイクル：<input id='ER_CYCLE' type=text size=5 style='ime-mode:disabled;' value='"+BTB[inx].Cycle+"'><br>";
		}
	else{
		s+="物件名：<input id='ER_NAME' type=text size=50 style='ime-mode:active;' value='"+BTB[inx].Name+"'";
		if ((!("Add" in BTB[inx]))||(fso.FileExists(ApartXML(BTB[inx].Name))))
			{
			s+=" disabled";
			}
		s+="><br>";
		s+="合計軒数：<input id='ER_PERSON' type=text size=10 style='ime-mode:disabled;' value='"+BTB[inx].Person+"'><br>";
		s+="補足説明：<input id='ER_REASON' type=text size=50 style='ime-mode:active;' value='"+BTB[inx].Reason+"'><br>";
		}
	switch (BTB[inx].KBN2)
		{
		case "集合住宅(単独)":
			s+=hr()+"集合住宅の詳細：<br>";
			s+="<select id='ER_BUILDING' size=5 onchange='ChangeRefuseBuilding(0,"+inx+")'>";
			bldobj=GetBLDString(BTB[inx].Position);
			bldsel=-1;
			if (Building=="")	s+="（不明）";
			else{
				for(i in Building.building)
					{
					if (parseInt(Building.building[i].map,10)!=BTB[inx].Num) continue;
					s+="<option value='"+i+"'";
					if (bldobj.id==Building.building[i].id) {s+=" selected";bldsel=parseInt(i,10);}
					s+=">"+Building.building[i].id+"</option>";
					}
				}
			s+="</select><br>";
			if (bldsel!=-1)
				{
				SetRefusesToBuilding(0,BTB,num,false);
				s+=CreateBuildingImage(num,0,0,bldsel,"",0.5,0.5,5);
				Building.building[bldsel].Temp=new Object();
				Building.building[bldsel].Temp.Refuse=inx;
				}
			s+=hr();
			break;
		case "集中インターホン":
			s+=hr()+"集中インターホンの詳細：<br>";
			s+="<select id='ER_BUILDING' size=5 onchange='ChangeRefuseBuilding(1,"+inx+")'>";
			bldobj=GetBLDString(BTB[inx].Position);
			bldsel=-1;
			for(i in BTB)
				{
				if (BTB[i].Num!=BTB[inx].Num) continue;
				if (BTB[i].KBN1!="集中インターホン") continue;
				s+="<option value='"+BTB[i].Name+"'";
				if (bldobj.id==BTB[i].Name) {s+=" selected";bldsel=parseInt(i,10);}
				s+=">"+BTB[i].Name+"</option>";
				}
			s+="</select><br>";
			if (bldsel!=-1)
				{
				if (TempXMLFile!=ApartXML(bldobj.id))
					{
					TempXMLFile=ApartXML(bldobj.id);
					ABuilding=ReadXMLFile(TempXMLFile,true);
					}
				if (ABuilding!="")
					{
 					SetRefusesToBuilding(1,BTB,num,false);
					s+=CreateBuildingImage(num,0,1,0,"",0.5,0.5,5);
					ABuilding.building[0].Temp=new Object();
					ABuilding.building[0].Temp.Refuse=inx;
					}
				else s+="（この物件は詳細が作成されていません）";
				}
			s+=hr();
			break;
		case "集合住宅":
			s+=hr()+"集合住宅の詳細：<br>";
			s+="<select id='ER_BUILDING' size=5 onchange='ChangeRefuseBuilding(1,"+inx+")'>";
			bldobj=GetBLDString(BTB[inx].Position);
			bldsel=-1;
			for(i in BTB)
				{
				if (BTB[i].Num!=BTB[inx].Num) continue;
				if (BTB[i].KBN1!="集合住宅") continue;
				s+="<option value='"+BTB[i].Name+"'";
				if (bldobj.id==BTB[i].Name) {s+=" selected";bldsel=parseInt(i,10);}
				s+=">"+BTB[i].Name+"</option>";
				}
			s+="</select><br>";
			if (bldsel!=-1)
				{
				if (TempXMLFile!=ApartXML(bldobj.id))
					{
					TempXMLFile=ApartXML(bldobj.id);
					ABuilding=ReadXMLFile(TempXMLFile,true);
					}
				if (ABuilding!="")
					{
					SetRefusesToBuilding(1,BTB,num,false);
					s+=CreateBuildingImage(num,0,1,0,"",0.5,0.5,5);
					ABuilding.building[0].Temp=new Object();
					ABuilding.building[0].Temp.Refuse=inx;
					}
				else s+="（この物件は詳細が作成されていません）";
				}
			s+=hr();
			break;
		default:
			s+="<input type=button value='位置情報の指定";
			if (BTB[inx].Position=="") s+="(指定されていません)";else s+="(指定済)";
			s+="' onClick='PostMapPosition("+num+","+inx+")'><br>";
		break;
		}
	s+="<input type=button value='記入情報の指定";
	if (BTB[inx].Writing=="") s+="(指定されていません)";else s+="(指定済)";
	s+="' onClick='WriteMapComment("+num+","+inx+")'><br>";
	if ((thistype=="集中インターホン")||(thistype=="集合住宅"))
		{
		BuildingNum=num;
		BuildingSeq=BTB[inx].Num;
		if (BTB[inx].Name!="")
			{
			if (TempXMLFile!=ApartXML(BTB[inx].Name))
				{
				TempXMLFile=ApartXML(BTB[inx].Name);
				ABuilding=ReadXMLFile(TempXMLFile,true);
				SetRefusesToBuilding(1,BTB,num,true);
				}
			}
		else ABuilding="";
		if (ABuilding=="")
			{
			s+="<input type=button value='建物イメージの作成' onClick='EditRefuses_CreateBuilding(1,"+num+","+inx+")'>";
			}
		else{
			s+="<input type=button value='建物イメージの位置指定";
			if ("top" in ABuilding.building[0]) s+="(指定済)";else s+="(指定されていません)";
			s+="' onClick='PlaceBuilding(1,0)'><br>";
			s+=CreateBuildingImage(num,0,1,0,"",0.5,0.5,1);
			}
		}

	s+=hr();
	if ("Add" in BTB[inx])
		{
		s+="<input type=button value='登録' onClick='EditRefuses_Exec("+num+","+inx+",0)'>";
		}
	else{
		s+="<input type=button value='更新' onClick='EditRefuses_Exec("+num+","+inx+",1)'>";
		s+="<input type=button value='削除' onClick='DeleteRefuses("+num+","+inx+")'>";
		}
	s+="<input type=button value='戻る' onClick='";
	Keys[11]="";
	if ("Add" in BTB[inx])
		{
		Keys[11]+="Cards["+num+"].RTB.splice("+inx+",1);";
		}
	if (RefuseExit=="")
		{
		Keys[11]+="Maint_Refuses("+num+")";
		}
	else{
		if (!(isNaN(RefuseExit)))	{Keys[11]+="MENU1PBig("+num+","+RefuseExit+")";}
		else Keys[11]+="ViewApart(\""+RefuseExit+"\")";
		}
	s+=Keys[11]+"'></form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	}

function EditRefuses_CreateBuilding(Bobj,num,inx)
	{
	var BTB=Cards[num].RTB;
	Bobj=GetBobj(Bobj);
	StoreRefuses(num,inx);
	if (BTB[inx].Name=="")
		{
		alert("名前が入力されていません。");
		return;
		}
	Bobj=ReadXMLFile(SysFolder()+"building.xml",true);
	Bobj.building[0].id=BTB[inx].Name;
	WriteXMLFile(Bobj,ApartXML(BTB[inx].Name));
	TempXMLFile="";
	EditRefuses(num,inx);
	}

function ChangeRefuseBuilding(Bobj,inx)
	{
	var BTB=Cards[RRefuse].RTB;
	var i;
	var ABobj=GetBobj(Bobj);
	StoreRefuses(RRefuse,inx);
	if (Bobj==0)
		{
		i=parseInt(d$("ER_BUILDING").value,10);
		if (ABobj!="")
			{
			if (i in ABobj.building)
				{
				BTB[inx].Position="bld:"+ABobj.building[i].id+",0,0,0,0";
				}
			}
		}
	else{
		i=d$("ER_BUILDING").value;
		BTB[inx].Position="bld:"+i+",0,0,0,0";
		}
	EditRefuses(RRefuse,inx);
	}

function PickRefuseRoom(Bobj,num,seq,ist,ifl,iro)
	{
	var BTB=Cards[RRefuse].RTB;
	var ABobj=GetBobj(Bobj);
	EraseTempProperty(ABobj.building[num]);
	StoreRefuses(num,RRinx);
	var ref=ABobj.building[num].Temp.Refuse;
	BTB[ref].Position=SetBLDString(Bobj,num,seq,ist,ifl,iro);
	SetRefusesToBuilding(Bobj,BTB,RRefuse,false);
	ABobj.building[num].sequence[seq].stair[ist].floor[ifl].room[iro].Temp=ref;
	EditRefuses(RRefuse,ref);
	}

function ChangeRefuseNum(inx)
	{
	var BTB=Cards[RRefuse].RTB;
	var obj=d$("ER_SEQ");
	var a1=obj.value;
	BTB[inx].Num=a1;
	BTB[inx].Position="";
	BTB[inx].Writing="";
	EditRefuses(RRefuse,inx);
	}

function ChangeRefuseKBN1(mode,inx)
	{
	var BTB=Cards[RRefuse].RTB;
	var obj1=document.forms[0].elements[1];
	var obj2=document.forms[0].elements[2];
	var a1=obj1.selectedIndex;
	var a2=obj1.options[a1].text;
	var a3=obj2.selectedIndex;
	if ((a1==3)||(a1==4))	//	集中インターホンor集合住宅
		{
		BTB[inx].KBN2="集合住宅(全体)";
		BTB[inx].Date="";					//	網羅開始日
		if (mode==0)
			{
			BTB[inx].Position="";
			BTB[inx].Writing="";
			}
		}
	else{
		BTB[inx].Date="20111101";			//	特記追加日
		BTB[inx].Position="";
		BTB[inx].Writing="";
		}
	BTB[inx].Servant="";				//	使用者名
	BTB[inx].Confirm="";				//	網羅終了日
	BTB[inx].KBN1=a2;
	EditRefuses(RRefuse,inx);
	}

function ChangeRefuseKBN2(inx)
	{
	var BTB=Cards[RRefuse].RTB;
	var obj1=document.forms[0].elements[1];
	var obj2=document.forms[0].elements[2];
	var a1=obj2.selectedIndex;
	var a2=obj2.options[a1].text;
	var a3=obj1.selectedIndex;
	if ((a3==3)&&(a1!=2)) {obj2.selectedIndex=2;return;}
	BTB[inx].KBN2=a2;
	BTB[inx].Position="";
	BTB[inx].Writing="";
	EditRefuses(RRefuse,inx);
	}

function DeleteRefuses(num,inx)
	{
	var BTB=Cards[num].RTB;
	var s;
	s=confirm("この特記情報を削除します。よろしいですか？");
	if (!s) return;
	if ((BTB[inx].KBN1=="集中インターホン")||(BTB[inx].KBN1=="集合住宅"))
		{
		RemoveCondominium(BTB[inx].Name);	//	区域カードに含まれているその住宅名を除去
		if (fso.FileExists(ApartFile(BTB[inx].Name))) fso.DeleteFile(ApartFile(BTB[inx].Name));	//	ログファイル削除
		if (fso.FileExists(ApartXML(BTB[inx].Name))) fso.DeleteFile(ApartXML(BTB[inx].Name));	//	ＸＭＬファイル削除
		}
	BTB.splice(inx,1);
	SaveConfig(num);
	LoadCard(num);
	if (RefuseExit=="")	Maint_Refuses(num);
				else	{
						if (!(isNaN(RefuseExit))) MENU1PBig(num,RefuseExit);
						else MENU5();
						}
	}

function StoreRefuses(num,inx)
	{
	var BTB=Cards[RRefuse].RTB;
	var thistype=BTB[inx].KBN1;
	var y,m,d;
	var today=new Date();
	BTB[inx].Num=d$("ER_SEQ").value;										//地図番号
	BTB[inx].Name=d$("ER_NAME").value.replace(/[#]/g, "＃");				//名前
	BTB[inx].Person=d$("ER_PERSON").value.replace(/[#]/g, "＃");			//立場
	BTB[inx].Reason=d$("ER_REASON").value.replace(/[#]/g, "＃");			//理由
	if ((thistype!="集中インターホン")&&(thistype!="集合住宅"))
		{
		y=d$("ER_DATEYY").value;
		m=d$("ER_DATEMM").value;
		d=d$("ER_DATEDD").value;
		if (m<10) m="0"+m;
		if (d<10) d="0"+d;
		BTB[inx].Date=y+""+m+""+d;
		BTB[inx].Servant=d$("ER_SERVANT").value.replace(/[#]/g, "＃");	//	奉仕者
		BTB[inx].Confirm=d$("ER_CONFIRM").value.replace(/[#]/g, "＃");	//	確認情報
		y=d$("ERC_DATEYY").value;
		m=d$("ERC_DATEMM").value;
		d=d$("ERC_DATEDD").value;
		if (m<10) m="0"+m;
		if (d<10) d="0"+d;
		BTB[inx].LastConfirm=y+""+m+""+d;
		if (BTB[inx].Date>BTB[inx].LastConfirm) BTB[inx].LastConfirm=BTB[inx].Date;
		BTB[inx].Frequency=d$("ER_FREQUENCY").value;	//	訪問頻度
		BTB[inx].Cycle=d$("ER_CYCLE").value;			//	サイクル
		}
	else{
		BTB[inx].Date=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
		BTB[inx].Servant="";
		BTB[inx].Confirm="";
		BTB[inx].LastConfirm=0;
		BTB[inx].Frequency=0;
		BTB[inx].Cycle=0;
		}
	}
// 特記情報の追加・更新の実行---------------------------------------------------------------
function EditRefuses_Exec(num,inx,addmode)
	{
	var BTB=Cards[num].RTB;
	var a1,a2,a3,a4,a5,rooms;
	StoreRefuses(num,inx);
	if (addmode==0)
		{
		if (BTB[inx].Name=="")
			{
			alert("名前が入力されていません。");
			return;
			}
		if (fso.FileExists(ApartFile(BTB[inx].Name)))
			{
			alert("同名の物件がすでに存在します。");
			return;
			}
		}
	if ((BTB[inx].KBN1=="集中インターホン")||(BTB[inx].KBN1=="集合住宅"))
		{
		if (!fso.FileExists(ApartFile(BTB[inx].Name))) fso.CreateTextFile(ApartFile(BTB[inx].Name),true);
		if (ABuilding!="")
			{
			ABuilding.Type=0;
			if (BTB[inx].KBN1=="集中インターホン") ABuilding.Type=1;
			if (BTB[inx].KBN1=="集合住宅") ABuilding.Type=2;
			ABuilding.Num=num;
			ABuilding.Seq=BTB[inx].Num;
			WriteXMLFile(ABuilding,ApartXML(BTB[inx].Name));
//			AddCondominium(BTB[inx].Name);
			rooms=0;
			for(a1 in ABuilding.building[0].sequence)
				{
				for(a2 in ABuilding.building[0].sequence[a1].stair)
					{
					for(a3 in ABuilding.building[0].sequence[a1].stair[a2].floor)
						{
						rooms+=parseInt(ABuilding.building[0].sequence[a1].stair[a2].floor[a3].rooms,10);
						}
					}
				}
			BTB[inx].Person=rooms;
			}
		}
	if ("Add" in BTB[inx]) delete BTB[inx].Add;
	SaveConfig(num);
	LoadCard(num);
	if (RefuseExit=="") Maint_Refuses(num);
	else	{
			if (!(isNaN(RefuseExit))) MENU1PBig(num,RefuseExit);
				else	ViewApart(RefuseExit);
			}
	}

function WriteMapComment(num,inx)
	{
	var BTB=Cards[num].RTB;
	var s,found,file;
	var seq=BTB[inx].Num;
	var rx=new Array();
	var mfile;
	if (Cards[num].MapType==0) mfile=PNGFile(num,seq);
	else mfile=BlankPNG();
	Rvml=new Poly();
	StoreRefuses(num,inx);
	file=fso.FileExists(mfile);
	if (!file)
		{
		alert("地図データがないので、コメントの記入はできません。");
		BTB[inx].Position="";
		BTB[inx].Writing="";
		return;
		}
	RDragObj=inx;
	RDComment="";

	var r=GetImageInfo(mfile);
	if (r.x>r.y)
		{
		alert("このサイズの地図には、特記情報の記入はできません。\n地図データに直接書き込んでください。");
		return;
		}

	if (BTB[inx].Writing!="")
		{
		s=BTB[inx].Writing+",,,,,,";
		rx=s.split(",");
		RDComment=rx[0];
		RDSize=parseInt(rx[1],10);
		RDragStartX=parseInt(rx[2],10);
		RDragStartY=parseInt(rx[3],10);
		oRDComment=RDComment;
		oRDSize=RDSize;
		if (rx[4]!="")
			{
			s=rx[4];
			while(1==1)
				{
				if (s.indexOf("&",0)==-1) break;
				s=s.replace("&",",");
				}
			Rvml.AddArrow(s,1,1,false);
			}
		}
	else{
		RDragStartX=-1;
		RDragStartY=0;
		RDSize=50;
		oRDComment="";
		oRDSize=RDSize;
		}
	RDComment=prompt("地図に書き込むコメントを入力してください。",RDComment);
	if (RDComment==null) return;
	RDComment=RDComment.trim();
	if (RDComment=="")
		{
		BTB[inx].Writing="";
		EditRefuses(num,inx);
		return;
		}
	RDComment=RDComment.replace(/[,]/g, "，");
	RDComment=RDComment.replace(/[#]/g, "＃");

	RDTitle=document.title;
	RDragging=false;
	ClearKey();
	ClearLayer("Stage");
	ClearLayer("Mask");
	ClearLayer("Terop");
	ClearLayer("Drag");
	SetOverflow("xy");

	document.title="コメントを書き込む場所を指定してください";
	Keys[11]="";

	//	1.地図レイヤー
	s="<img src='"+mfile+"' style='position:absolute;z-index:0;top:0px;left:0px;z-index:0;'>";
	if (Building!="")
		{
		for(i in Building.building)
			{
			rmap=parseInt(Building.building[i].map,10);
			if (rmap!=seq)	continue;
			s+=CreateBuildingImage(num,0,0,i,"",1,1,0);
			}
		}
	WriteLayer("Stage",s);

	//	2.クリックレイヤー
	s="<img src='"+BlankGIF()+"' width="+r.x+" height="+r.y;
	s+=" style='cursor:default;position:absolute;top:0px;left:0px;z-index:5;'";
	s+=" onmousedown='WriteMap_mousedown();return false;' onmousemove='WriteMap_mousemove()' onmouseup='WriteMap_mouseup();return false;' onmousewheel='WriteMap_Wheel()'>";
	WriteLayer("Drag",s);

	//	3.特記情報レイヤー
	s="<div id='REFLAYER' style='position:absolute;top:0px;left:0px;z-index:3;width:"+r.x+"px;height:"+r.y+";'>";
	s+=Rvml.Draw(false,true);
	s+="</div>";
	WriteLayer("Mask",s);

	if (RDragStartX==-1)
		{
		wx=0;wy=0;
		}
	else{
		wx=RDragStartX-(document.documentElement.clientWidth/2);
		wy=RDragStartY-(document.documentElement.clientHeight/2);
		if (wx<0) wx=0;
		if (wy<0) wy=0;
		}
	window.scrollTo(wx,wy);
	WriteMap_Draw();

	s="左クリックでコメントを書き込む位置を決定<br>右クリックのドラッグで矢印作成<br>Shift+ホイールで文字サイズ変更<br>";
	s+=AddKeys(1,"決定","EndofWriteMap(true)");
	s+=AddKeys(2,"矢印の消去","EraseArrow()");
	s+=AddKeys(0,"戻る","EndofWriteMap(false)");
	FloatingMenu.Title="特記情報の記入";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",wx,wy,10,240,170);
	RscrollX=wx;RscrollY=wy;
	window.onscroll=WriteMap_Scroll;
	}

function EraseArrow()
	{
	if (Rvml.objects==1)
		{
		Rvml.objects--;
		RDragging=false;
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		}
	}

function WriteMap_Scroll()
	{
	var x=FloatingMenu.x-RscrollX;
	var y=FloatingMenu.y-RscrollY;
	var wx=x+document.documentElement.scrollLeft;
	var wy=y+document.documentElement.scrollTop;
	FloatingMenu.moveTo(wx,wy);
	RscrollX=document.documentElement.scrollLeft;
	RscrollY=document.documentElement.scrollTop;
	}

function WriteMap_mouseup()
	{
	var btn=event.button;
	var x=event.clientX+document.documentElement.scrollLeft-8;
	var y=event.clientY+document.documentElement.scrollTop-8;
	if (btn==0)	
		{
		RDragStartX=x;
		RDragStartY=y;
		oRDSize=RDSize;
		oRDComment=RDComment;
		WriteMap_Draw();
		return;
		}
	if (btn==2)
		{
		RDragging=false;
		}
	}

function WriteMap_mousedown()
	{
	var i;
	var btn=event.button;	// 0=left 4=center 2=right
	if (btn!=2) return;
	RDragging=true;
	var s;
	var x=event.clientX+document.documentElement.scrollLeft-8;
	var y=event.clientY+document.documentElement.scrollTop-8;
	s=x+","+y+" "+x+","+y;
	if (Rvml.objects==0)
		{
		Rvml.AddArrow(s,1,1,false);
		return;
		}
	Rvml.objects--;
	REFLAYER.innerHTML=Rvml.Draw(false,true);
	Rvml.AddArrow(s,1,1,false);
	}

function WriteMap_mousemove()
	{
	var i,j,x,y,s;
	x=event.clientX+document.documentElement.scrollLeft-8;
	y=event.clientY+document.documentElement.scrollTop-8;
	RDragEndX=x;
	RDragEndY=y;
	if (Rvml.objects==0)
		{
		WriteMap_Draw();
		return;
		}
	if (RDragging)
		{
		Rvml.obj[0].x[1]=x;
		Rvml.obj[0].y[1]=y;
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		}
	WriteMap_Draw();
	}

function WriteMap_Wheel()	//マウスホイール
	{
	var a;
	if (!ShiftKey) return;
	a=event.wheelDelta;
	if (a==120)
		{
		RDSize+=8;
		}
	if (a==-120)
		{
		RDSize-=8;
		if (RDSize<8) RDSize=8;
		}
	WriteMap_Draw();
	}

function WriteMap_DecidePosition()
	{
	var BTB=Cards[RRefuse].RTB;
	RDragEndX=document.documentElement.scrollLeft+event.clientX-8;
	RDragEndY=document.documentElement.scrollTop+event.clientY-8;
	BTB[RDragObj].Writing=RDComment+","+RDSize+","+RDragEndX+","+RDragEndY;
	EndofPostMap();
	}

function WriteMap_Draw()
	{
	var s,ox,oy;
	var x=RDragEndX;
	var y=RDragEndY;
	ClearLayer("Terop");
	s="<div style='position:absolute;left:"+x+"px;top:"+y+"px;z-index:3;white-space:nowrap;font-size:"+RDSize+"px;color:999999;'>";
	s+=RDComment+"</div>";
	if (RDragStartX!=-1)
		{
		ox=RDragStartX;oy=RDragStartY;
		s+="<div style='position:absolute;left:"+ox+"px;top:"+oy+"px;z-index:4;white-space:nowrap;font-size:"+oRDSize+"px;color:#0000ff;'>";
		s+=oRDComment+"</div>";
		}
	WriteLayer("Terop",s);
	}

function EndofWriteMap(mode)
	{
	var BTB=Cards[RRefuse].RTB;
	var cmd,wx,wy;
	var s,i;
	if ((mode)&&(RDragStartX==-1))
		{
		alert("記入情報の位置が決定されていません。");
		return;
		}
	window.onscroll="";
	document.title=RDTitle;
	FloatingMenu.Close();
	ClearLayer("Mask");
	ClearLayer("Drag");
	ClearLayer("Terop");
	window.scrollTo(0,0);
	if (mode)
		{
		s=RDComment+","+RDSize+","+RDragStartX+","+RDragStartY;
		if (Rvml.objects!=0)
			{
			s+=","+Rvml.obj[0].x[0]+"&"+Rvml.obj[0].y[0]+" ";
			s+=Rvml.obj[0].x[1]+"&"+Rvml.obj[0].y[1];
			}
		BTB[RDragObj].Writing=s;
		}
	EditRefuses(RRefuse,RDragObj);
	}

// 特記情報のポリゴン選択-------------------------------------------------------------
function PostMapPosition(num,inx)
	{
	var BTB=Cards[num].RTB;
	var s,found,file,r;
	var seq=BTB[inx].Num;
	var rx=new Array();
	RDTitle=document.title;
	StoreRefuses(num,inx);
	Rvml=new Poly();
	file=fso.FileExists(PNGFile(num,seq));

	if (!file)
		{
		alert("地図データがないので、場所指定はできません。");
		BTB[inx].Position="";
		BTB[inx].Writing="";
		return;
		}

	RDragObj=inx;
	r=GetImageInfo(PNGFile(num,seq));

	if (r.x>r.y)
		{
		alert("このサイズの地図には、特記情報の記入はできません。\n地図データに直接書き込んでください。");
		EndofPostMap(false);
		return;
		}
	if (BTB[inx].Position!="")
		{
		Rvml.AddObject(BTB[inx].Position,"","",1,1,"");
		}
	ClearKey();
	ClearLayer("Stage");	//　地図レイヤー
	ClearLayer("Mask");		//	特記レイヤー
	ClearLayer("Drag");		//	マウス操作レイヤー

	document.title="特記情報の場所をクリックして選択してください。";
	Keys[11]="";
	Rvml.mapsize=1;
	Rvml.width=r.x;
	Rvml.height=r.y;
	
	//	1.地図レイヤー
	s="<img src='"+PNGFile(num,seq)+"' style='position:absolute;z-index:0;top:0px;left:0px;'>";
	if (Building!="")
		{
		for(i in Building.building)
			{
			rmap=parseInt(Building.building[i].map,10);
			if (rmap!=seq)	continue;
			s+=CreateBuildingImage(num,0,0,i,"",1,1,0);
			}
		}
	WriteLayer("Stage",s);
	SetOverflow("xy");

	//	2.クリックレイヤー
	s="<img src='"+BlankGIF()+"' width="+r.x+" height="+r.y;
	s+=" style='cursor:default;position:absolute;top:0px;left:0px;z-index:5;'";
	s+=" onmousedown='PostMap_mousedown()' onmousemove='PostMap_mousemove()' onmouseup='PostMap_mouseup()'>";
	WriteLayer("Drag",s);

	//	3.特記情報レイヤー
	s="<div id='REFLAYER' style='position:absolute;top:0px;left:0px;z-index:3;width:"+r.x+"px;height:"+r.y+";'>";
	s+=Rvml.Draw(false,true);
	s+="</div>";
	WriteLayer("Mask",s);

	if (Rvml.objects==0)
		{
		window.scrollTo(0,0);
		wx=0;wy=0;
		}
	else{
		wx=(min(Rvml.obj[0].x)+max(Rvml.obj[0].x))/2-(document.documentElement.clientWidth/2);
		wy=(min(Rvml.obj[0].y)+max(Rvml.obj[0].y))/2-(document.documentElement.clientHeight/2);
		if (wx<0) wx=0;
		if (wy<0) wy=0;
		window.scrollTo(wx,wy);
		}

	s="左クリックで図形作成<br>右クリックで中断<br>";
	s+=AddKeys(1,"確定","EndofPostMap(true)");
	s+=AddKeys(2,"図形の消去","EraseObj()");
	s+=AddKeys(0,"戻る","EndofPostMap(false)");
	FloatingMenu.Title="特記情報の記入";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",wx,wy,10,240,150);
	RscrollX=wx;RscrollY=wy;
	window.onscroll=WriteMap_Scroll;
	}

function EraseObj()
	{
	if (Rvml.objects==1)
		{
		Rvml.objects--;
		Rvml.isDrawing=false;
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		}
	}

function EndofPostMap(mode)
	{
	var BTB=Cards[RRefuse].RTB;
	var cmd,wx,wy;
	var s,i;
	if (mode)
		{
		if (!Rvml.Closed())
			{
			alert("記入情報の位置が決定されていません。");
			return;
			}
		}
	document.title=RDTitle;
	window.onscroll="";
	FloatingMenu.Close();
	ClearLayer("Mask");
	ClearLayer("Drag");
	if (mode)
		{
		if (Rvml.objects==0)
			{
			s="";
			}
		else{
			s="vml:";
			for(i=0;i<Rvml.obj[0].points;i++)
				{
				if (i>0) s+=" ";
				s+=Rvml.obj[0].x[i]+","+Rvml.obj[0].y[i];
				}
			}
		BTB[RDragObj].Position=s;
		}
	EditRefuses(RRefuse,RDragObj);
	}

function PostMap_mousedown()
	{
	var i;
	var btn=event.button;	// 0=left 4=center 2=right
	if (btn!=0) return;
	var s;
	var x=event.clientX+document.documentElement.scrollLeft-8;
	var y=event.clientY+document.documentElement.scrollTop-8;
	if (Rvml.objects==0)
		{
		Rvml.AddObject();
		return;
		}
	if (!Rvml.Closed()) return;
	Rvml.objects--;
	Rvml.AddObject();
	REFLAYER.innerHTML=Rvml.Draw(false,true);
	}

function PostMap_mousemove()
	{
	if (Rvml.objects==0) return;
	if (Rvml.Closed()) return;
	var i,j,x,y,s;
	var base;
	x=event.clientX+document.documentElement.scrollLeft-8;
	y=event.clientY+document.documentElement.scrollTop-8;
	Rvml.DeletePoint();
	Rvml.AddPoint(x,y);
	REFLAYER.innerHTML=Rvml.Draw(false,true);
	}

function PostMap_mouseup()
	{
	var i,j,x,y;
	var absx,absy;
	var btn=event.button;	// 0=left 4=center 2=right

	if (btn==2)	//	右クリック
		{
		if (Rvml.objects==0)
			{
			return;
			}
		if (Rvml.Closed())
			{
			return;
			}
		Rvml.objects--;
		Rvml.AddObject();
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		return;
		}
	if (btn!=0) return;

	x=event.clientX+document.documentElement.scrollLeft-8;
	y=event.clientY+document.documentElement.scrollTop-8;

	if (!Rvml.isDrawing)		//	初回
		{
		Rvml.AddPoint(x,y);
		Rvml.AddPoint(x,y);
		return;
		}

	if (Rvml.Finished(x,y))
		{
		Rvml.Finish();
		REFLAYER.innerHTML=Rvml.Draw(false,true);
		return;
		}
	Rvml.AddPoint(x,y);
	}
//-----------------------------------------------------------
// 拒否から要確認情報に変換する（間隔＝２年）
//-----------------------------------------------------------
function CheckRefusesStatus(num,seq,BTB)
	{
	var i,j,d,tp;
	var s2,s3;
	var t=clone(BTB);

	//	今回の開始日を取得
	var obj,l,nst;
	obj=LoadLog(num);
	l=obj.History.length-1;
	if (l<=0) return t;
	else nst=obj.Latest.Rent+"";

	for(i=0;i<t.length;i++)
		{
		if (t[i].Num!=seq) continue;
		if (t[i].KBN1!="拒否") continue;
		//	間隔をあける場合
		if ("Frequency" in t[i])
			{
			tp=parseInt(t[i].Frequency,10);
			if (tp!=0)
				{
				if (parseInt(t[i].Cycle,10)>=tp)
					{
					t[i].KBN1="間隔";
					continue;
					}
				}
			}
		if ("LastConfirm" in t[i]) d=t[i].LastConfirm+"";else d=t[i].Date+"";
		s2=parseInt(d.substring(0,4),10)*12+parseInt(d.substring(4,6),10);
		s3=parseInt(nst.substring(0,4),10)*12+parseInt(nst.substring(4,6),10);
		//　２年を経過していれば確認
		if ((s3-s2)>=24) t[i].KBN1="確認";
		}
	return t;
	}
