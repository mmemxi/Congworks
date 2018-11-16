//------------------------------------------------------------------------------------
//	長期留守宅メニュー
//------------------------------------------------------------------------------------
var Menu6_Filter_kubun="";
var Menu6_Filter_kubuncount=0;
var Menu6_Filter_status=0;	//	0=すべて 1=未使用 2=使用中
var Menu6_Filter_Edited="";
var Menu6_SelectedUser;
var Menu6_SelectedClass;
var Menu6_SelectedDrive;
var Menu6_SelectedSerial;
//------------------------------------------------------------------------------------
function MENU6()
	{
	if (ConfigAll.Remote.Host!="") 
		{
		ClearKey();
		ClearLayer("Stage");
		SetOverflow("y");
		Keys[11]="MainMenu()";
		WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
		WriteLayer("Stage","<span class=size3>メインメニュー＞マーカー管理</span><br>"+hr());
		AddKey("Stage",1,"マーカーの作業依頼","MENU6C_Output()");
		AddKey("Stage",2,"リモート作業結果取得","MENU6C_Remote()");
		AddKey("Stage",3,"マーカーの編集","MENU6B()");
		AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");
		window.scrollTo(0,0);
		document.body.focus();
		}
	else{
		MENU6B();
		}
	}
//------------------------------------------------------------------------------------
function MENU6A()
	{
	var s,obj,i,j,cells,l,num,seq,trfunc;
	var kubun,mmap,mapnum,m,vhist,vchar,dchar;
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MainMenu()";
	for(i in kbn) delete kbn[i];
	kbn["すべて"]=0;
	kubuncount=1;
	Menu6_Filter_kubuncount=0;
	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞長期留守宅</span><br>"+hr());
	AddKey("Stage",0,"メインメニューへ戻る","MainMenu()");

	for(num in Cards)
		{
		kubun=Cards[num].kubun;
		if (!(kubun in kbn))
			{
			Menu6_Filter_kubuncount++;
			kbn[kubun]=Menu6_Filter_kubuncount;
			}
		}
	var cobj=getPublicLogs();

	//	見出し---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=50>区域番号</td>";
	s+="<td align=center class=size2 width=200>区域名</td>";
	s+="<td align=center class=size2 width=100>区分<br>";
	s+="<select size=1 onChange='MENU6_kubun_Change(this.selectedIndex);MENU6A()'>";
	for(i in kbn)
		{
		if (i=="すべて")
			{
			if (Menu6_Filter_kubun=="") s+="<option selected>";else s+="<option>";
			s+="すべて</option>";
			}
		else{
			if (Menu6_Filter_kubun==i) s+="<option selected>";else s+="<option>";
			s+=i+"</option>";
			}
		}
	s+="</select></td>";
	s+="<td align=center class=size2 width=50>地図番号</td>";
	s+="<td align=center class=size2 width=50>件数</td>";
	s+="<td align=center class=size2 width=100>終了期限</td>";
	s+="<td align=center class=size2 width=200>使用状況<br>";
	s+="<select size=1 onChange='MENU6_status_Change(this.selectedIndex);MENU6A()'>";

	if (Menu6_Filter_status==0) s+="<option selected>";else s+="<option>";
	s+="すべて</option>";
	if (Menu6_Filter_status==1) s+="<option selected>";else s+="<option>";
	s+="未使用のみ</option>";
	if (Menu6_Filter_status==2) s+="<option selected>";else s+="<option>";
	s+="使用中のみ</option>";
	s+="</select></td>";
	s+="</tr>";
	//	一覧表---------------------------------------------------------------------
	for(num in Cards)
		{
		if (cobj[num].inuse!="true") continue;				//	使用中でない区域は除く
		if (isCampeign(cobj[num].Lastuse)) continue;		//	キャンペーン中に開始した区域は対象外
		if ((Menu6_Filter_kubun!="")&&(Cards[num].kubun!=Menu6_Filter_kubun)) continue;
		Markers=LoadMarker(num);
		if (Markers.Count<1) continue;
		mapnum=parseInt(Cards[num].count,10);
		mmap=new Array();
		for(i=1;i<=mapnum;i++)
			{
			mmap[i]=new Object();
			mmap[i].Count=0;
			mmap[i].Using=false;
			mmap[i].User="";
			}
		for(i in Markers.Map)
			{
			for(j=0;j<Markers.Map[i].Points.length;j++)
				{
				vhist=parseInt(Markers.Map[i].Points[j].History,10);
				if (vhist!=2) continue;
				mmap[i].Count++;
				if (Markers.Map[i].User!="")
					{
					mmap[i].Using=true;
					mmap[i].User=Markers.Map[i].User;
					}
				}
			}
		for(j=1;j<=mapnum;j++)
			{
			if (mmap[j].Count==0) continue;
			if ((Menu6_Filter_status==1)&&(mmap[j].Using)) continue;
			if ((Menu6_Filter_status==2)&&(!mmap[j].Using)) continue;
			trfunc="";
			if (!mmap[j].Using)
				{
				trfunc=" style='cursor:pointer;' onclick='MENU6Big("+num+","+j+")' title='この地図を貸出します'";
				}
			else{
				trfunc=" style='cursor:pointer;' onclick='MENU6Return("+num+","+j+",\""+mmap[j].User+"\")' title='この地図の貸出を取り消します'";
				}
			s+="<tr>";
			s+="<td align=right"+trfunc+">"+num+"</td>";				//	区域番号
			s+="<td"+trfunc+">"+Cards[num].name+"</td>";				//	区域名
			s+="<td"+trfunc+">"+Cards[num].kubun+"</td>";				//	区分名
			s+="<td align=right"+trfunc+">"+j+"</td>";				//	地図番号
			s+="<td align=right"+trfunc+">"+mmap[j].Count+"</td>";	//	留守宅件数
			s+="<td align=center"+trfunc+">"+SplitDate(GetOverDay(num))+"</td>";
			if (mmap[j].Using)
				{
				s+="<td"+trfunc+" bgcolor='#ffff00'>使用中（"+mmap[j].User+"）</td>";
				}
			else{
				s+="<td"+trfunc+" bgcolor='#00ffff'>未使用</td>";
				}
			s+="</tr>";
			}
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}

function MENU6_kubun_Change(num)
	{
	var i;
	if (num==0) Menu6_Filter_kubun="";
	else{
		for (i in kbn)
			{
			if (kbn[i]==num) break;
			}
		Menu6_Filter_kubun=i;
		}
	}

function MENU6_status_Change(num)
	{
	Menu6_Filter_status=num;
	}

function MENU6Big(num,seq)
	{
	var s,i,x,found,file;
	var d1,d2;
	var r,rmap,Bmap="",sb,sobj;
	var scr="";
	var vml=new Poly();
	var BTB;
	vml.mapsize=1;

	r=GetImageInfo(PNGFile(num,seq));
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("");
	MapZoom=false;

	file=fso.FileExists(PNGFile(num,seq));
	s="<div class=size5 align=center>№"+num+"「"+Cards[num].name+"」"+nums.charAt(seq-1)+"</div>";
	WriteLayer("Stage",s);

	s="";
	s+=AddKeys(1,"この地図を貸し出す","MENU6_Start("+num+","+seq+")");
	s+=AddKeys(0,"戻る","CloseFloatings();MENU6A()");
	FloatingMenu.Title="メニュー";
	FloatingMenu.Content=s;
	FloatingMenu.Create("MENU",20,20,3,240,100);
	Keys[11]="CloseFloatings();MENU6A()";
	s="";
	if (file)
		{
		s+="<img src='"+PNGFile(num,seq)+NoCache()+"' onload='ImageMap.Adjust()'>";
		}
	else s+="（画像データがありません）";

	//	ビル情報の読込
	ReadBuilding(num);

	//	マーカー情報の合成
	Markers=LoadMarker(num);
	SetMarkersToBuilding(0,Markers,1);		//	ビル情報にマーカーを反映させる
	s+=DrawMarker(Markers,seq,1,1,2);

	//	ビル情報を重ねる
	if (Building!="")
		{
		for(i in Building.building)
			{
			rmap=parseInt(Building.building[i].map,10);
			if (rmap!=seq) continue;
			s+=CreateBuildingImage(num,seq,0,i,"",1,1,0);
			}
		}
	ImageMap.Content=s;
	ImageMap.Create("MAP",window["Stage"],MaxWidth-40,MaxHeight-100);
	window.scrollTo(0,0);
	document.body.focus();
	}
//---------------------------------------------------------------------------
function MENU6_Start(num,seq)
	{
	var s;
	CloseFloatings();
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MENU6Big("+num+","+seq+")";
	window.scrollTo(0,0);
	s="<div class=size5>（長期留守宅）№"+num+"「"+Cards[num].name+"」－"+nums.charAt(seq-1)+"の貸出</div>"+hr();
	s+="<div class=size3><form onsubmit='MENU6_Start_Exec("+num+","+seq+");return false;'>";
	s+="使用者名："+Field(0,30,true,1)+"<br>";
	s+="<input type=button value='使用開始' onClick='MENU6_Start_Exec("+num+","+seq+")'>";
	s+="<input type=button value='戻る' onClick='MENU6Big("+num+","+seq+")'></form>";
	WriteLayer("Stage",s);
	s=UserPad2();
	WriteLayer("Stage",s);
	Focus(0);
	}
//---------------------------------------------------------------------------
function MENU6_Start_Exec(num,seq)
	{
	var a,b,bcnt,bp,bp2,cmf;
	var ymd,maxlogs,text;
	var stream,text,s;
	var today=new Date();
	var lines=new Array();
	var logline=new Array();
	var lastdata;
	var overday,counts;
	var num,seq,inx;
	var i,j,vhist;

	a=document.forms[0].elements[0].value;
	if (CheckUser(a)) return;

	if (!isAvailable("B",num,seq,a))
		{
		alert("貸出処理中に、他のユーザーによって貸出が実行されました。\n道理にかなった態度を示し、進んで譲りましょう。");
		ClearLayer("Stage");
		MENU6A();
		return;
		}

	//	外部プログラムとして呼び出す
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="rentB.wsf "+congnum+":"+a+":"+num+":"+seq;
	var objResult=RunWSF(cmd);
	if (objResult!="ok")
		{
		alert("長期留守宅貸し出し処理中にエラーが発生し、処理が失敗しました。");
		}

	var pdffile=GetMyMap(num,seq,"",a);
	if (pdffile=="")
		{
		alert("貸し出し地図の印刷に失敗しました。");
		}
	else{
		PrintMarkerMap(num,seq,pdffile);
		}
	MENU6A();
	}

function MENU6Return(num,seq,userid)
	{
	var cmf,userid,pdffile;
	cmf=confirm("№"+num+"「"+Cards[num].name+"」－"+nums.charAt(seq-1)+"の貸出を取り消しますか？");
	if (!cmf) return;

	//	PDFファイル名を取得する
	pdffile=GetMyMap(num,seq,"",userid);
	pdffile=fso.GetFileName(pdffile);

	//	外部プログラムとして呼び出す
	ClearLayer("Stage");
	WriteLayer("Stage","処理中です…");
	cmd="cancel.wsf "+congnum+" "+userid+" "+pdffile;
	var objResult=RunWSF(cmd);
	if (objResult.indexOf("NO=",0)!=-1)
		{
		alert("長期留守宅返却処理中にエラーが発生し、処理が失敗しました。");
		}
	MENU6A();
	}
//------------------------------------------------------------------------------------
function MENU6B()
	{
	var s,obj,i,j,cells,l,num,seq,trfunc,ctr,edited;
	var kubun,mmap,mapnum,m,vhist,vchar,dchar;
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MENU6()";
	for(i in kbn) delete kbn[i];
	kbn["すべて"]=0;
	kubuncount=1;
	Menu6_Filter_kubuncount=0;
	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞マーカー管理＞マーカーの編集</span><br>"+hr());
	AddKey("Stage",0,"戻る","MENU6()");

	for(num in Cards)
		{
		kubun=Cards[num].kubun;
		if (!(kubun in kbn))
			{
			Menu6_Filter_kubuncount++;
			kbn[kubun]=Menu6_Filter_kubuncount;
			}
		}
	var cobj=getPublicLogs();
	//	見出し---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=50>区域番号</td>";
	s+="<td align=center class=size2 width=200>区域名</td>";
	s+="<td align=center class=size2 width=100>区分<br>";
	s+="<select size=1 onChange='MENU6_kubun_Change(this.selectedIndex);MENU6B()'>";
	for(i in kbn)
		{
		if (i=="すべて")
			{
			if (Menu6_Filter_kubun=="") s+="<option selected>";else s+="<option>";
			s+="すべて</option>";
			}
		else{
			if (Menu6_Filter_kubun==i) s+="<option selected>";else s+="<option>";
			s+=i+"</option>";
			}
		}
	s+="</select></td>";
	s+="<td align=center class=size2 width=50>地図番号</td>";
	s+="<td align=center class=size2 width=50>件数</td>";
	s+="<td align=center class=size2 width=200>記入状況";
	s+="<select size=1 onChange='MENU6_Edited_Change(this.selectedIndex);MENU6B()'>";
	s+="<option";if (Menu6_Filter_Edited=="") s+=" selected";
	s+=">すべて</option>";
	s+="<option";if (Menu6_Filter_Edited=="未編集") s+=" selected";
	s+=">未編集</option>";
	s+="<option";if (Menu6_Filter_Edited=="作業依頼中") s+=" selected";
	s+=">作業依頼中</option>";
	s+="<option";if (Menu6_Filter_Edited=="編集済") s+=" selected";
	s+=">編集済</option>";
	s+="</select></td></tr>";
	//	一覧表---------------------------------------------------------------------
	for(num in Cards)
		{
		if ((Menu6_Filter_kubun!="")&&(Cards[num].kubun!=Menu6_Filter_kubun)) continue;
		if (cobj[num].Status.indexOf("使用中",0)!=-1) continue;
		mapnum=parseInt(Cards[num].count,10);
		Markers=LoadMarker(num);
		for(j=1;j<=mapnum;j++)
			{
			edited=0;
			if (j in Markers.Map)
				{
				if (Markers.Map[j].Edited=="Working")
					{
					edited=1;
					}
				if (Markers.Map[j].Edited=="True")
					{
					edited=2;
					}
				}
			if (Menu6_Filter_Edited!="")
				{
				if ((edited==0)&&(Menu6_Filter_Edited!="未編集")) continue;
				if ((edited==1)&&(Menu6_Filter_Edited!="作業依頼中")) continue;
				if ((edited==2)&&(Menu6_Filter_Edited!="編集済")) continue;
				}
			trfunc=" style='cursor:pointer;' onclick='MENU6B_Edit("+num+","+j+")' title='この地図のマーカーを編集します'";
			if (edited==1)
				{
				trfunc=" style='cursor:pointer;' onclick='MENU6B_WorkingCancel("+num+","+j+")' title='この地図の作業依頼をキャンセルします'";
				}
			s+="<tr>";
			s+="<td align=right"+trfunc+">"+num+"</td>";				//	区域番号
			s+="<td"+trfunc+">"+Cards[num].name+"</td>";				//	区域名
			s+="<td"+trfunc+">"+Cards[num].kubun+"</td>";				//	区分名
			s+="<td align=right"+trfunc+">"+j+"</td>";					//	地図番号
			ctr=0;
			if (j in Markers.Map)
				{
				ctr=Markers.Map[j].Points.length;
				}
			s+="<td align=right"+trfunc+">"+ctr+"</td>";				//	留守宅件数
			if (j in Markers.Map)
				{
				if (Markers.Map[j].Edited=="True")
					{
					s+="<td"+trfunc+" bgcolor='#ffff00'>編集済（"+Markers.Map[j].Editor+"）</td></tr>";
					continue;
					}
				if (Markers.Map[j].Edited=="Working")
					{
					s+="<td"+trfunc+" bgcolor='#ff66bb'>作業依頼中（"+Markers.Map[j].Editor+"）</td></tr>";
					continue;
					}
				}
			s+="<td"+trfunc+" bgcolor='#00ffff'>未編集</td></tr>";
			}
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}

function MENU6B_WorkingCancel(num,seq)
	{
	var remote=false;
	var a=confirm("この地図の作業依頼を取り消しますか？");
	if (!a) return;
	Markers=LoadMarker(num);
	if (seq in Markers.Map)
		{
		if (Markers.Map[seq].Editor=="リモートユーザー") remote=true;
		Markers.Map[seq].Editor="";
		Markers.Map[seq].Edited="False";
		SaveMarker(num,Markers);
		}
	//	リモートユーザーの作業取消
	if (remote)
		{
		var remotedir1=ConfigAll.Remote.Directory+"/mapeditor/input";
		var ftpsrc=fso.CreateTextFile(LocalFolder()+"ftp.src",true);
		ftpsrc.WriteLine("open "+ConfigAll.Remote.Host);
		ftpsrc.WriteLine(ConfigAll.Remote.User);
		ftpsrc.WriteLine(ConfigAll.Remote.Password);
		ftpsrc.WriteLine("cd "+remotedir1);
		ftpsrc.WriteLine("delete "+num+"-"+seq+".xml");
		ftpsrc.WriteLine("bye");
		ftpsrc.close();
		WshShell.CurrentDirectory=LocalFolder();
		var cmd="ftp -s:ftp.src";
		WshShell.Run(cmd,0,false);
		WshShell.CurrentDirectory=basepath;
		}
	MENU6B();
	}

function MENU6_Edited_Change(num)
	{
	var i;
	if (num==0) Menu6_Filter_Edited="";
	if (num==1) Menu6_Filter_Edited="未編集";
	if (num==2) Menu6_Filter_Edited="作業依頼中";
	if (num==3) Menu6_Filter_Edited="編集済";
	}

function MENU6B_Edit(num,seq)
	{
	StartNewMapEditor(num,seq);
//	EditMarker(num,seq,"MasterClient");
	}
//------------------------------------------------------------------------------------
var ClientUsers;
var SelectedClientUser;
//------------------------------------------------------------------------------------
var TaskList;
function MENU6C_Output()
	{
	var s,obj,i,j,cells,l,num,seq,trfunc,ctr,edited;
	var kubun,mmap,mapnum,m,vhist,vchar,dchar;

	var cobj=getPublicLogs();

	TaskList=new Array();
	ClearKey();
	ClearLayer("Stage");
	SetOverflow("y");
	Keys[11]="MENU6()";
	WriteLayer("Stage",SysImage("cwministry.png")+"<br>");
	WriteLayer("Stage","<span class=size3>メインメニュー＞長期留守宅＞マーカーの作業依頼</span><br>"+hr());
	AddKey("Stage",1,"作業を依頼する","MENU6C_Publish()");
	AddKey("Stage",0,"戻る","MENU6()");
	//	見出し---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=50>依頼</td>";
	s+="<td align=center class=size2 width=50>区域番号</td>";
	s+="<td align=center class=size2 width=240>区域名</td>";
	s+="<td align=center class=size2 width=100>区分</td></tr>";
	//	一覧表---------------------------------------------------------------------
	ctr=0;
	for(num in Cards)
		{
		if (cobj[num].Status.indexOf("使用中",0)!=-1) continue;
		mapnum=parseInt(Cards[num].count,10);
		Markers=LoadMarker(num);
		for(j=1;j<=mapnum;j++)
			{
			edited=0;
			if (j in Markers.Map)
				{
				if (Markers.Map[j].Edited=="Working")
					{
					edited=1;
					}
				if (Markers.Map[j].Edited=="True")
					{
					edited=2;
					}
				}
			if (edited!=0) continue;
			s+="<tr><td bgcolor='#ffffcc' align=center><input type=checkbox style='width:26px;height:26px;' onclick='AddTaskList("+num+","+j+")'>";
			s+="<td align=right>"+num+"-"+j+"</td>";		//	区域番号
			s+="<td>"+Cards[num].name+"</td>";				//	区域名
			s+="<td>"+Cards[num].kubun+"</td></tr>";		//	区分名
			ctr++;
			}
		}
	if (ctr==0)
		{
		s+="<tr><td colspan=4 align=center class=size3>依頼できる作業がありません。</td></tr>";
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	document.body.focus();
	}

function AddTaskList(num,seq)
	{
	var key=num+"-"+seq;
	if (key in TaskList)
		{
		delete TaskList[key];
		return;
		}
	TaskList[key]=new Object();
	TaskList[key].num=num;
	TaskList[key].seq=seq;
	}
//---------------------------------------------------------------------
function MENU6C_Publish()
	{
	var i,j,num,seq,p,r,cmd;
	var c=0;
	var obj,taskinp;
	var InputFolder;

	//	処理対象地図枚数のカウント
	for(i in TaskList) c++;
	if (c==0)
		{
		alert("作業依頼する地図に最低１つチェックを入れてください。");
		return;
		}

	//	日付の作成
	var date=new Date();
	var yy=date.getFullYear();
	var mm=date.getMonth()+1;
	var dd=date.getDate();
	var h=date.getHours();
	var m=date.getMinutes();
	var s=date.getSeconds();
	var ymd=yy+"/"+mm+"/"+dd;
	if (mm<10) mm="0"+mm;else mm+="";
	if (dd<10) dd="0"+dd;else dd+="";
	if (h<10) h="0"+h;else h+="";
	if (m<10) m="0"+m;else m+="";
	if (s<10) s="0"+s;else s+="";
	var ymd1="job"+yy+mm+dd+"-"+h+m+s;

	//	リモートユーザーの処理 --------------------------------
	r=confirm("リモートユーザー用サーバーに作業依頼データを送信します。\nよろしいですか？");
	if (!r) return;
	//	FTPソースの作成
	var localdir1=LocalFolder()+"mapinput";
	var localdir2=LocalFolder()+"mapimage";
	var remotedir1=ConfigAll.Remote.Directory+"/mapeditor/input";
	var remotedir2=ConfigAll.Remote.Directory+"/mapeditor/image";
	var ftpsrc=fso.CreateTextFile(LocalFolder()+"ftp.src",true);
	if (fso.FolderExists(localdir1)) fso.DeleteFolder(localdir1);
	if (fso.FolderExists(localdir2)) fso.DeleteFolder(localdir2);
	fso.CreateFolder(localdir1);
	fso.CreateFolder(localdir2);
	ftpsrc.WriteLine("open "+ConfigAll.Remote.Host);
	ftpsrc.WriteLine(ConfigAll.Remote.User);
	ftpsrc.WriteLine(ConfigAll.Remote.Password);
	ftpsrc.WriteLine("prompt");
	ftpsrc.WriteLine("binary");
	ftpsrc.WriteLine("lcd "+localdir1);
	ftpsrc.WriteLine("cd "+remotedir1);
	ftpsrc.WriteLine("mput *.xml");
	ftpsrc.WriteLine("lcd "+localdir2);
	ftpsrc.WriteLine("cd "+remotedir2);
	ftpsrc.WriteLine("mput *.jpg");
	ftpsrc.WriteLine("bye");
	ftpsrc.close();

	//	入力XMLの作成
	for(i in TaskList)
		{
		num=TaskList[i].num;
		seq=TaskList[i].seq;
		r=GetImageInfo(PNGFile(num,seq));
		Markers=LoadMarker(num);
		if (!(seq in Markers.Map))
			{
			Markers.Map[seq]=new Object();
			Markers.Map[seq].User="";
			Markers.Map[seq].Points=new Array();
			}
		Markers.Map[seq].Editor="リモートユーザー";
		Markers.Map[seq].Edited="Working";
		SaveMarker(num,Markers);
		if (fso.FileExists(PNGFile(num,seq)))
			{
			try	{
				Irfan(PNGFile(num,seq)+" /gray /jpgq=50 /convert="+localdir2+qt+num+"-"+seq+".jpg");
				fso.CopyFile(ThumbFile(num,seq),localdir2+qt+"thumb"+num+"-"+seq+".jpg",true);
				}
			catch(e){}
			}
		taskinp=new Object();
		taskinp.Job=new Array();
		taskinp.Job[0]=new Object();
		taskinp.Job[0].Num=num;
		taskinp.Job[0].Seq=seq;
		taskinp.Job[0].Name=Cards[num].name;
		taskinp.Job[0].StartDate=ymd;
		taskinp.Job[0].LimitDate=AddDays(ymd,14);
		taskinp.Job[0].JobDate="";
		taskinp.Job[0].Editor="";
		taskinp.Job[0].width=r.x;
		taskinp.Job[0].height=r.y;
		taskinp.Job[0].Points=new Array();
		taskinp.Job[0].Points=clone(Markers.Map[seq].Points);
		WriteXMLtoUTF8(taskinp,localdir1+qt+num+"-"+seq+".xml");
		if (!fso.FileExists(localdir1+qt+"build"+num+".xml"))
			{
			var bbody=ReadXMLFile(BuildingFile(num),true);
			WriteXMLtoUTF8(bbody,localdir1+qt+"build"+num+".xml");
			}
		}
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","作業依頼をリモートユーザー用サーバーに転送しています。しばらくお待ちください。");
	setTimeout("RemoteFTP_Send()",50);
	}

function RemoteFTP_Send()
	{
	WshShell.CurrentDirectory=LocalFolder();
	cmd="ftp -s:ftp.src";
	WshShell.Run(cmd,1,true);
	WshShell.CurrentDirectory=basepath;
	alert("作業依頼をリモートユーザー用サーバーに転送しました。");
	MENU6C_Output();
	}

//	作業結果の受取り(リモート）----------------------------------------------------------
function MENU6C_Remote()
	{
	var r=confirm("リモートユーザー用サーバーに接続し、作業結果を取り込みます。\nよろしいですか？");
	if (!r) return;
	setTimeout("RemoteFTP_Receive()",50);
	MENU6();
	}

function RemoteFTP_Receive()
	{
	var success=new Array();
	var result;
	var i,j;

	//	FTPソースの作成
	var localdir=LocalFolder()+"mapoutput";
	var remotedir=ConfigAll.Remote.Directory+"/mapeditor/output";
	var ftpsrc=fso.CreateTextFile(LocalFolder()+"ftp.src",true);
	if (fso.FolderExists(localdir)) fso.DeleteFolder(localdir);
	fso.CreateFolder(localdir);
	ftpsrc.WriteLine("open "+ConfigAll.Remote.Host);
	ftpsrc.WriteLine(ConfigAll.Remote.User);
	ftpsrc.WriteLine(ConfigAll.Remote.Password);
	ftpsrc.WriteLine("prompt");
	ftpsrc.WriteLine("binary");
	ftpsrc.WriteLine("lcd "+localdir);
	ftpsrc.WriteLine("cd "+remotedir);
	ftpsrc.WriteLine("mget *.xml");
	ftpsrc.WriteLine("bye");
	ftpsrc.close();

	//	FTPの実行
	WshShell.CurrentDirectory=LocalFolder();
	cmd="ftp -s:ftp.src";
	WshShell.Run(cmd,0,true);
	WshShell.CurrentDirectory=basepath;

	//	ファイル一覧の取得
	var dir,files,obj,file;
	dir=fso.GetFolder(localdir);
	files=new Enumerator(dir.Files);
	for(; !files.atEnd();files.moveNext())
		{
		obj=files.item();
		file=obj.Name;
		if (file.indexOf(".xml",0)==-1) continue;
		result=GetRemoteWorks(localdir+qt+file);
		if (result)
			{
			success.push(file);
			}
		}

	if (success.length==0)
		{
		alert("リモートユーザーからの作業結果はありませんでした。");
		return;
		}

	//	成功した作業結果は、処理済ディレクトリから削除する
	ftpsrc=fso.CreateTextFile(LocalFolder()+"ftp.src",true);
	ftpsrc.WriteLine("open "+ConfigAll.Remote.Host);
	ftpsrc.WriteLine(ConfigAll.Remote.User);
	ftpsrc.WriteLine(ConfigAll.Remote.Password);
	ftpsrc.WriteLine("prompt");
	ftpsrc.WriteLine("cd "+remotedir);
	for(i=0;i<success.length;i++)
		{
		ftpsrc.WriteLine("delete "+success[i]);
		}
	ftpsrc.WriteLine("bye");
	ftpsrc.close();
	WshShell.CurrentDirectory=LocalFolder();
	cmd="ftp -s:ftp.src";
	WshShell.Run(cmd,0,true);
	WshShell.CurrentDirectory=basepath;

	alert("リモートユーザーからの"+success.length+"件の作業結果を受け付けました。");
	}

function GetRemoteWorks(filename)
	{
	var res,i,j,s;
	var num,seq,f;

	var cobj=getPublicLogs();

	res=ReadXMLfromUTF8(filename,true);
	if (res=="") return false;
	if (!("Job" in res)) return false;

	for(i in res.Job)
		{
		num=parseInt(res.Job[i].Num,10);
		seq=parseInt(res.Job[i].Seq,10);
		if (!(num in Cards)) continue;								//	存在しない地図は無視
		if (cobj[num].Status.indexOf("使用中",0)!=-1) continue;	//	もう奉仕開始した
		Markers=LoadMarker(num);
		if (!(seq in Markers.Map)) continue;				//	地図マーカーが無い
		if (Markers.Map[seq].Edited!="Working")	continue;	//	編集中でない
		//	作業受付ＯＫ
		Markers.Map[seq].Edited="True";						//	編集済みに
		if ("Points" in res.Job[i])
			{
			for(j=0;j<res.Job[i].Points.length;j++)
				{
				if (res.Job[i].Points[j].char!="○")
					{
					res.Job[i].Points.splice(j,1);
					j--;
					}
				}
			Markers.Map[seq].Points=clone(res.Job[i].Points);	//	編集点をコピー
			}
		else{
			Markers.Map[seq].Points=new Array();
			}
		SaveMarker(num,Markers);
		}
	return true;
	}

