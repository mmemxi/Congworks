//------------------------------------------------------------------------------------
var DB3=new Array();
var DBFix=new Array();
var Menu4_YearMonth;
var Menu4_Page=0;
var Menu4_Newest;
var Report=new Array();
var MENU4Top=0;
Report[0]=new Array();
Report[1]=new Array();
var ReportMax=new Array();
var ReportX=new Array();
var ReportY=new Array();
var ReportRange=new Object();
//	���݂̃^�[�Q�b�g�N(tym)�̎Z�o
var today=new Date();
var ty=today.getFullYear();
var tm=today.getMonth()+1;
var td=today.getDate();
if (td<10)
	{
	tm--;
	if (tm==0) {tm=12;ty--;}
	}
var tym=ty,tymExist=false;
if (tm>=9) tym++;
Menu4_YearMonth=tym;
//------------------------------------------------------------------------------------
function GetReport(yearmonth)
	{
	var result="";
	var filename=ReportFolder()+yearmonth+".csv";
	var data=ReadFile(filename);
	if (data=="") return "";
	var spr,i,j,dtl,yyyymm,code,num,yyyy,mm,seq,nend;
	var pos,page,code,name,l;
	Report[0]=new Array();
	Report[1]=new Array();

	spr=data.split("\r\n");
	for(i in spr)
		{
		spr[i]+=",end,end,end";
		dtl=spr[i].split(",");
		if (dtl[0]=="*")
			{
			page=parseInt(dtl[1],10);
			ReportMax[page]=parseInt(dtl[2],10);
			ReportX[page]=eval(dtl[3]);
			ReportY[page]=eval(dtl[4]);
			continue;
			}
		if (dtl[0]=="end") break;
		if (dtl[1]=="end") break;
		if (dtl[2]=="end") break;
		page=parseInt(dtl[0],10);
		pos=parseInt(dtl[1],10);
		Report[page][pos]=new Object();
		code=dtl[2];
		Report[page][pos].�i��=code;
		Report[page][pos].�G���[=false;
		if (code=="????") Report[page][pos].�G���[=true;
		if (code in DB) name=DB[code].�i�ږ�;
		else	{
				name="???";
				AutoAddMaster(code);
				if (code in DB) name=DB[code].�i�ږ�;
				}
		Report[page][pos].�i�ږ�=name;
		if (name=="???") Report[page][pos].�G���[=true;
		}
	return true;
	}
//------------------------------------------------------------------------------------
function SetReport(yearmonth)
	{
	var s,i,p;
	var folder=ReportFolder();
	var filename=folder+yearmonth+".csv";
	var f=fso.CreateTextFile(filename,true);
	for(p=0;p<=1;p++)
		{
		s="*,"+p+","+ReportMax[p]+","+ReportX[p]+","+ReportY[p];
		f.WriteLine(s);
		for(i=0;i<ReportMax[p];i++)
			{
			if (!(i in Report[p])) continue;
			if (Report[p][i]=="") continue;
			s=p+","+i+","+Report[p][i].�i��;
			f.WriteLine(s);
			}
		}
	f.close();
	}
//------------------------------------------------------------------------------------
function ChangeMenu4(num)
	{
	Menu4_YearMonth=num;
	MENU4();
	}
function ChangeMenu4Page(num)
	{
	Menu4_Page=num;
	MENU4();
	}
function MENU4_YearMonth_Sort(a,b)
	{
	return b-a;
	}
function MENU4_AdSort(a,b)
	{
	return a-b;
	}
//------------------------------------------------------------------------------------
function MENU4()
	{
	var i,j,o,s,ss,file,yearnum,obj,filename,basename,ext;
	var x,y,pos,code,name;
	var yearsExist=false;
	var years=new Array();
	nowmode="MENU4";
	ClearKey();
	ClearLayer("Stage");
	if (fso.FileExists(SysFolder()+"preview.jpg"))
		{
		fso.DeleteFile(SysFolder()+"preview.jpg");
		}
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>���C�����j���[�������Ƃ̕����ړ��\�F");
	yearnum=0;

	//	���|�[�g�t�@�C���̌���
	var folder=ReportFolder();
	if (!fso.FolderExists(folder)) fso.CreateFolder(folder);
	var dir=fso.GetFolder(ReportFolder());
	var files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		ext=fso.GetExtensionName(filename).toLowerCase();
		if (ext!="csv") continue;
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		yearnum++;
		i=parseInt(basename,10);
		if (i==tym) tymExist=true;
		years.push(i);
		}
	if (!tymExist)	{years.push(tym);yearnum++;}

	ss="<select onchange='ChangeMenu4(this.value)'>";
	years.sort(MENU4_YearMonth_Sort);
	for(i=0;i<yearnum;i++)
		{
		ss+="<option value="+years[i];
		if (years[i]==Menu4_YearMonth)
			{
			ss+=" selected";
			yearsExist=true;
			}
		ss+=">"+years[i]+"</option>";
		}
	ss+="</select>�N�x�F";
	if (!yearsExist) Menu4_YearMonth=years[0];
	OpenDB(Menu4_YearMonth);

	ss+="<select onchange='ChangeMenu4Page(this.selectedIndex)'>";
	if (Menu4_Page==0)
		{
		ss+="<option selected>�\��</option>";
		ss+="<option>����</option>";
		}
	else{
		ss+="<option>�\��</option>";
		ss+="<option selected>����</option>";
		}
	ss+="</select></span><br><hr align=left width=80%>";
	WriteLayer("Stage",ss);
	Menu4_Newest=tym;
	var filename=ReportFolder+tym+".csv";
	AddKey("Stage",1,"�����ړ��\(PDF)����荞��","MENU4C()");
	r=GetReport(Menu4_YearMonth);
	if (r!="")
		{
		AddKey("Stage",2,"���̕����ړ��\���������","MENU4B()");
		AddKey("Stage",3,"�����ړ��\��\������","MENU4D()");
		}
	Keys[11]="MainMenu()";
	AddKey("Stage",0,"���C�����j���[�֖߂�","MainMenu()");
	WriteLayer("Stage","<div id='HLIST'></div>");
	if (r!="")
		{
		DrawHList();
		window.scrollTo(0,MENU4Top);
		LoadCanvas(Menu4_YearMonth,Menu4_Page);
		}
	else{
		ClearLayer("HLIST");
		s="<hr width=100%>";
		s+="���̔N�̕����ړ��\�͂܂��쐬����Ă��܂���B<br>";
		s+="�u�P�F�����ړ��\(PDF)����荞�ށv���N���b�N���Ă��������B";
		WriteLayer("HLIST",s);
		MENU4Top=0;
		}
	}
function DrawHList()
	{
	var s,i,code,name;
	ClearLayer("HLIST");
	s="<hr width=100%>";
	s+="<table border=1 cellpadding=2 cellspacing=0>";
	s+="<tr class=HEAD><td width=80 nowrap align=center>�i�ڔԍ�</td><td width=500 align=center>�i�ږ�</td></tr>";
	for(i=0;i<ReportMax[Menu4_Page];i++)
		{
		if (!(i in Report[Menu4_Page]))
			{
			code="�@";
			name="�@";
			}
		else{
			code=Report[Menu4_Page][i].�i��;
			name=Report[Menu4_Page][i].�i�ږ�;
			}
		if ((name=="???")||(code=="????"))
			{
			s+="<tr bgcolor=yellow>";
			}
		else s+="<tr>";
		s+="<td align=center nowrap text='�i�ڔԍ��𒼐ړ��͂��܂�' style='cursor:hand;' onClick='InputReport("+i+")'";
		s+=" onmousedown='pos4down("+i+")' onmouseup='pos4up("+i+")'>";
		s+=code+"</td>";
		if ((name=="???")&&(code!="????"))
			{
			s+="<td nowrap style='cursor:hand;' text='�i�ڂ�o�^���܂�' onClick='AddReport("+code+","+i+")'";
			}
		else{
			s+="<td nowrap style='cursor:hand;' text='�i�ڂ����j���[����I�����܂�' onClick='EditReport("+i+")'";
			}
		s+=" onmousedown='pos4down("+i+")' onmouseup='pos4up("+i+")'>";
		s+=name+"</td></tr>";
		}
	s+="</table>";
	WriteLayer("HLIST",s);
	}

function pos4down(pos)
	{
	MouseDownPos=pos;
	}

function pos4up(pos)
	{
	var a,b;
	MouseUpPos=pos;
	if (MouseUpPos==MouseDownPos) return;
	if (!(MouseDownPos in Report[Menu4_Page])) return;
	if (MouseUpPos in Report[Menu4_Page]) return;
	a=MouseDownPos;
	b=MouseUpPos;
	Report[Menu4_Page][b]=new Object();
	Report[Menu4_Page][b].�i��=Report[Menu4_Page][a].�i��;
	Report[Menu4_Page][b].�i�ږ�=Report[Menu4_Page][a].�i�ږ�;
	delete Report[Menu4_Page][a];
	SetReport(Menu4_YearMonth);
	MENU4Top=document.body.scrollTop;
	DrawHList();
	}

function AddReport(num,pos)
	{
	var s,ymd,i,sel,alter;
	Help=12;
	MENU4Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	s="<div class=size5>�i�ڔԍ�"+num+"�̐V�K�o�^�F</div><hr align=left width=100%>";

	var vx1,vy1,vx2,vy2;
	var file=SysFolder()+"preview.jpg";
	vx1=Matrix.left;
	vy1=Matrix.hline[pos]+2;
	vx2=Matrix.vline[1]-2;
	vy2=Matrix.hline[pos+1]-2;
	IM_cutImage(vx1,vy1,vx2-vx1,vy2-vy1,file);
	s+="<img src='"+SysFolder()+"preview.jpg"+NoCache()+"'><br>";

	s+="<div class=size3><form onsubmit='AddReport_Exec(\""+num+"\");return false;'><table border=1 cellspacing=0 cellpadding=8>";
	s+="<tr><td>�i�ږ��F</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>���ށF</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option>";
		if (i==0)
			{
			s+="���ނ�I�����Ă�������</option>";
			}
		else{
			s+=group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	alter="same";
	s+="<tr><td>�W�v��F</td><td><div id='LISTS'>"+ItemList(sel,alter,0)+"</div></td></tr></table><br>";
	s+="<input type=button value='�X�V' onClick='AddReport_Exec(\""+num+"\")'>";
	s+="<input type=button value='�߂�' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	document.forms[0].elements[0].value="";
	}

function AddReport_Exec(num)
	{
	var s,name,kubun,alter,f;
	name=document.forms[0].elements[0].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("�i�ږ������͂���Ă��܂���B");
		return;
		}
	kubun=document.forms[0].elements[1].selectedIndex;
	kubun=group[kubun];

	alter=document.forms[0].elements[2].selectedIndex;
	if (alter<0)
		{
		alert("�W�v���I�����Ă��������B");
		return;
		}
	alter=document.forms[0].elements[2].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	DB[num]=new Object();
	DB[num].�i�ږ�=name;
	DB[num].����=kubun;
	DB[num].�W�v��=alter;
	UpdateDB();
	MENU4();
	}

function AutoAddMaster(num)
	{
	var s=num+"";
	var n1=s.substring(0,2);
	var n2=s.substring(2,4);
	var nen=2000+parseInt(n2,10);
	var result=false;
	var name,kubun,alter;
	switch(n1)
		{
		case "72":
					name=nen+" �J�����_�[";
					kubun="�N���Ƃ̕i��";
					alter=num;
					result=true;
					break;
		case "69":
					name="�����𒲂ׂ�|"+nen;
					kubun="�N���Ƃ̕i��";
					alter=num;
					result=true;
					break;
		case "57":
					name="�u�ڂ��߂�I�v���{�@"+nen;
					kubun="�N���Ƃ̕i��";
					alter=num;
					result=true;
					break;
		case "56":
					name="�u���݂̂̓��v���{�@"+nen;
					kubun="�N���Ƃ̕i��";
					alter=num;
					result=true;
					break;
		case "59":
					name=nen+" �N��";
					kubun="�N���Ƃ̕i��";
					alter=num;
					result=true;
					break;
		case "25":
					name="Watchtower Library-"+nen;
					kubun="Watchtower Library";
					alter=num;
					result=true;
					break;
		}
	if (result)
		{
		DB[num]=new Object();
		DB[num].�i�ږ�=name;
		DB[num].����=kubun;
		DB[num].�W�v��=alter;
		}
	}

function InputReport(pos)
	{
	var r="";
	MENU4Top=document.body.scrollTop;
	if (pos in Report[Menu4_Page])
		{
		r=Report[Menu4_Page][pos].�i��;
		}
	r=prompt("�i�ڔԍ�����͂��Ă��������B",r);
	if (r==null) return;
	r=r.trim();
	if (r=="")
		{
		delete Report[Menu4_Page][pos];
		SetReport(Menu4_YearMonth);
		DrawHList();
		return;
		}
	if (!(r in DB))
		{
		alert("�i�ڔԍ����������Ȃ����A�o�^����Ă��܂���B");
		return;
		}
	Report[Menu4_Page][pos]=new Object();
	Report[Menu4_Page][pos].�i��=r;
	Report[Menu4_Page][pos].�i�ږ�=DB[r].�i�ږ�;
	SetReport(Menu4_YearMonth);
	DrawHList();
	}

function EditReport(pos)
	{
	var s,ymd,i,j,x,y;
	var y,m,d,ay,am,py,pm,sur,bunrui;
	var today=new Date();
	var Ary=new Array();
	var label=new Array("�\��","����");
	var Exist=false;
	MENU4Top=document.body.scrollTop;
	Help=12;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";

	var vx1,vy1,vx2,vy2;
	var file=SysFolder()+"preview.jpg";
	vx1=Matrix.left;
	vy1=Matrix.hline[pos]+2;
	vx2=Matrix.vline[1]-2;
	vy2=Matrix.hline[pos+1]-2;
	IM_cutImage(vx1,vy1,vx2-vx1,vy2-vy1,file);

	s="<div class=size5>";
	s+=label[Menu4_Page]+"-"+(pos+1)+"�s�ڂ̕i�ڏ��</div>";
	s+="<hr align=left width=100%>";
	s+="<img src='"+SysFolder()+"preview.jpg"+NoCache()+"'><br>";
	s+="<div class=size3><form onsubmit='EditReport_Exec("+pos+");return false;'><table border=1 cellspacing=0 cellpadding=8 width=80%>";
	s+="<tr><td width=100>�i�ځF</td><td>";
	s+="<select size=1 onChange='ChangeItemList(this.selectedIndex)'>";
	if (pos in Report[Menu4_Page]) Exist=true;
	if (Exist)
		{
		i=Report[Menu4_Page][pos].�i��;
		if (i in DB)
			{
			j=DB[i].����;
			bunrui=BunruiToNum(j);
			}
		else bunrui=0;
		}
	else{
		bunrui=0;
		}
	for(i=0;i<group.length;i++)
		{
		s+="<option value="+i;
		if (i==bunrui) s+=" selected";
		s+=">";
		if (i==0) s+="���ׂ�";else s+=group[i];
		s+="</option>";
		}
	s+="</select><input type=button value='�V�����i�ڂ̒ǉ�' onClick='StoreScreen(\"MENU1A(4)\")'><br>";
	s+="<div id='LISTS'>";
	if (!Exist)
		{
		s+=ItemList(bunrui,"",1);
		}
	else{
		s+=ItemList(bunrui,Report[Menu4_Page][pos].�i��,1);
		}
	s+="</div></td></tr></table><br>";
	s+="<input type=button value='�o�^' onClick='EditReport_Exec("+pos+")'>";
	s+="<input type=button value='�}���i���ւ��炷�j' onClick='EditReport_Insert("+pos+")'><br>";
	s+="<input type=button value='����' onClick='EditReport_Del("+pos+")'>";
	s+="<input type=button value='�폜�i�O�֋l�߂�j' onClick='EditReport_Remove("+pos+")'><br>";
	s+="<input type=button value='�߂�' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	}

function EditReport_Exec(pos)
	{
	var code,name;
	code=document.forms[0].elements[2].selectedIndex;
	if (code<0)
		{
		alert("�i�ڂ�I�����Ă��������B");
		return;
		}
	code=document.forms[0].elements[2].value;
	Report[Menu4_Page][pos]=new Object();
	Report[Menu4_Page][pos].�i��=code;
	if (code in DB) name=DB[code].�i�ږ�;else name="???";
	Report[Menu4_Page][pos].�i�ږ�=name;
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Insert(pos)
	{
	var code,name,a,max0;
	code=document.forms[0].elements[2].selectedIndex;
	if (code<0)
		{
		alert("�i�ڂ�I�����Ă��������B");
		return;
		}
	if (Menu4_Page==0)
		{
		max0=ReportMax[0]-1;
		if (max0 in Report[0])
			{
			Report[1].splice(0,0,Report[0][max0]);
			}
		else{
			Report[1].splice(0,0,"");
			}
		}
	code=document.forms[0].elements[2].value;
	Report[Menu4_Page].splice(pos,0,new Object());
	Report[Menu4_Page][pos].�i��=code;
	if (code in DB) name=DB[code].�i�ږ�;else name="???";
	Report[Menu4_Page][pos].�i�ږ�=name;
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Del(pos)
	{
	var a=confirm("���̍s���������Ă���낵���ł����H\n�i�ȍ~�̍s��O�ɋl�߂邱�Ƃ͂��܂���j");
	if (!a) return;
	Report[Menu4_Page][pos]="";
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function EditReport_Remove(pos)
	{
	var a=confirm("���̍s���폜���āA�ȍ~�̍s��O�ɋl�߂Ă���낵���ł����H");
	var i;
	var max0,max1;
	if (!a) return;
	Report[Menu4_Page].splice(pos,1);
	if (Menu4_Page==0)
		{
		max0=ReportMax[0]-1;
		if (0 in Report[1]) Report[0][max0]=Report[1][0];
		Report[1].splice(0,1);
		}
	SetReport(Menu4_YearMonth);
	MENU4();
	}

function MENU4B()
	{
	var s,y,m,d,i,ym,todayy,todaym,todayd;
	var startym,endym;
	var years=new Array();

	j=false;
	for(i in Report[Menu4_Page])
		{
		if (Report[Menu4_Page][i].�G���[) j=true;
		}
	if (j)
		{
		alert("�����ړ��\�̒��ɃG���[������܂��B\n���F�ŕ\������Ă���s���G���[�ł��B\n�G���[���C�����Ă��������Ă��������B");
		return;
		}

	var today=new Date;
	todayy=today.getFullYear();
	todaym=today.getMonth()+1;
	todayd=today.getDate();
	if (todayd<10) {todaym--;if (todaym<1) {todaym=12;todayy--;}}
	MENU4Top=document.body.scrollTop;
	Help=12;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	s="<div class=size5>�����ړ��\�̈���i"+Menu4_YearMonth+"�N�x�F";
	if (Menu4_Page==0) s+="�\��";else s+="����";
	s+="�j</div>";
	s+="<hr align=left width=100%>";
	s+="<div class=size3><form><table border=1 cellspacing=0 cellpadding=8>";
	s+="<tr><td nowrap>����͈́i�P�`�U�����j�F</td>";
	s+="<td><div id='M4PULL'></div>";
	s+="</td></tr></table><br>";
	s+="<input type=button value='���' onClick='MENU4B_Check(true)'>";
	s+="<input type=button value='�߂�' onClick='MENU4()'></form>";
	WriteLayer("Stage",s);
	DrawMENU4BPulldown(0,0);
	}

function DrawMENU4BPulldown(startym,endym)
	{
	var dir,files,obj,filename,basename,fyearmonth,fyear,fmonth;
	var i,j,k,s,firstym;
	var years=new Array();

	dir=fso.GetFolder(RackFolder());
	files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		fyearmonth=parseInt(basename,10);
		years.push(fyearmonth);
		}
	years.sort(MENU4_AdSort);

	if ((startym!=0)&&(endym==0))
		{
		for(i=0;i<years.length;i++)
			{
			if (years[i]==startym) break;
			}
		for(j=i;j<years.length;j++)
			{
			if ((j-i)==5) break;
			}
		if (j==years.length) j=years.length-1;
		endym=years[j];
		}
	if ((startym==0)&&(endym!=0))
		{
		fyear=Math.floor(endym/100);
		fmonth=endym % 100;
		if ((fmonth>=3)&&(fmonth<=8))
			{
			startym=fyear*100+3;
			}
		else{
			if (fmonth<=2)
				{
				startym=(fyear-1)*100+9;
				}
			else{
				startym=fyear*100+9;
				}
			}
		}
	//	�J�n�N���E�I���N���Ƃ��ɂO�i�����ݒ�j
	if ((startym==0)&&(endym==0))
		{
		i=years.length-1;
		fyearmonth=years[i];
		endym=fyearmonth;
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		if ((fmonth>=3)&&(fmonth<=8))
			{
			startym=fyear*100+3;
			}
		else{
			if (fmonth<=2)
				{
				startym=(fyear-1)*100+9;
				}
			else{
				startym=fyear*100+9;
				}
			}
		}
	s="<select size=1 onChange='MENU4B_Change1()'>";
	firstym=0;
	for(i=0;i<years.length;i++)
		{
		fyearmonth=years[i];
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		if ((fmonth!=9)&&(fmonth!=3)) continue;
		if (firstym==0) firstym=fyearmonth;
		s+="<option ";
		if (fyearmonth==startym) s+="selected "
		s+="value="+fyearmonth+">"+fyear+"�N"+fmonth+"��</option>";
		}
	s+="</select>�`<select size=1 onChange='MENU4B_Change2()'>";
	for(i=0;i<years.length;i++)
		{
		fyearmonth=years[i];
		if (fyearmonth<firstym) continue;
		fyear=Math.floor(fyearmonth/100);
		fmonth=fyearmonth % 100;
		s+="<option ";
		if (fyearmonth==endym) s+="selected "
		s+="value="+fyearmonth+">"+fyear+"�N"+fmonth+"��</option>";
		}
	s+="</select>";
	ClearLayer("M4PULL");
	WriteLayer("M4PULL",s);
	}

function MENU4B_Change1()
	{
	var a=document.forms[0].elements[0].value;
	DrawMENU4BPulldown(a,0)
	}

function MENU4B_Change2()
	{
	var a=document.forms[0].elements[1].value;
	DrawMENU4BPulldown(0,a)
	}

function MENU4B_Check(mode)
	{
	var start,end,months;
	var i,j;

	start=document.forms[0].elements[0].value;
	end=document.forms[0].elements[1].value;

	if (start>end)
		{
		alert("����͈͂̎w�肪����������܂���B\n�i�I�������J�n�����O�ɂȂ��Ă��܂��j");
		return;
		}
	months=(Math.floor(end/100)*12+(end % 100))-(Math.floor(start/100)*12+(start % 100));
	if (months>=6)
		{
		alert("����͈͂̎w�肪����������܂���B\n�i�ő�U�������܂łł��j");
		return;
		}

	i=start % 100;
	j=end % 100;
	if ((i>=9)||(i<=2))
		{
		if ((j>2)&&(j<9))
			{
			alert("����͈͂̎w�肪����������܂���B\n�i�㔼���Ɖ������͕ʃy�[�W�ɂȂ�܂��j");
			return;
			}
		}
	ClearKey();
	ClearLayer("Stage");
	if (mode) WriteLayer("Stage","����������ł��c");
	if (!mode) WriteLayer("Stage","�v���r���[�摜�̏������ł��c");
	setTimeout("MENU4B_Exec("+mode+","+start+","+end+")",100);
	}

function MENU4B_Exec(mode,start,end)
	{
	var s,a,side,code;
	var workbook,worksheet;
	var x,y,i,j,k,l,b0,b1y,b1m,ym;
	var width,height;
	var StartColumn,ReportCount;
	var ReportArray;
	var sur1,sur2,sur3;
	var result;
	var jfolder;

	DBFix=new Array();
	i=start % 100;
	j=end % 100;
	if (i>=9)
		{
		StartColumn=i-9;
		if (j>=9)	ReportCount=j-i+1;
			else	ReportCount=(13-i)+j;
		}
	if (i<=2)
		{
		StartColumn=i+4;
		ReportCount=j-i+1;
		}
	if ((i>=3)&&(i<=8))
		{
		StartColumn=i-3;
		ReportCount=j-i+1;
		}
	for(l=0;l<=1;l++)
		{
		ReportArray=new Array();
		LoadCanvas(Menu4_YearMonth,l);
		b0=StartColumn;
		b1y=Math.floor(start/100);
		b1m=start % 100;
		for(k=0;k<ReportCount;k++)
			{
			ReportArray[k]=new Object();
			ReportArray[k].Column=b0;
			ReportArray[k].YearMonth=b1y*100+b1m;
			b0++;
			b1m++;
			if (b1m>12) {b1m=1;b1y++;}
			}
		/*	���ד��e���Z�b�g	*/
		for(i=0;i<ReportCount;i++)
			{
			x=ReportArray[i].Column;
			y=ReportArray[i].YearMonth;
			result=GetAllDetail(y);
			if (!result)
				{
				alert("�݌ɂ�����̂ɁA�W�v�悪�\�ɂȂ��i�ڂ�����܂��B\n�C�����Ă��������Ă��������B");
				MENU4_FixMaster();
				return;
				}
			/*	�����̍s�ł���ꍇ�A�O�����݌ɂ���	*/
			if (x==0)
				{
				for(j=0;j<ReportMax[l];j++)
					{
					if (!(j in Report[l])) continue;
					if (Report[l][j]=="") continue;
					code=Report[l][j].�i��;
					if (!(code in DB3)) continue;
					sur2=DB3[code].�O���݌�;
					if (sur2!=0)
						{
						DrawCanvas(0,j,sur2);
						}
					}
				}
			for(j=0;j<ReportMax[l];j++)
				{
				if (!(j in Report[l])) continue;
				if (Report[l][j]=="") continue;
				code=Report[l][j].�i��;
				if (!(code in DB3)) continue;
				sur1=DB3[code].���א�;
				sur2=DB3[code].�݌ɐ�;
				sur3=DB3[code].�񋟐�;
				if (sur1==0) sur1="";
				if (sur3==0) sur3="";
				if ((sur1=="")&&(sur2==0)&&(sur3=="")) sur2="";
				DrawCanvas(x*3+1,j,sur1);
				DrawCanvas(x*3+2,j,sur2);
				DrawCanvas(x*3+3,j,sur3);
				}
			}
		SaveCanvas(l);
		}
	/*	����o��--------------------------------------	*/
	tfolder=TempFolder();
	WshShell.CurrentDirectory=tfolder;
	cmd="magick printout0.jpg printout1.jpg printout.pdf";
	WshShell.Run(cmd,0,true);
	PDFPrint(tfolder+"printout.pdf");
	WshShell.CurrentDirectory=basepath;
	MENU4();
	}

function GetAllDetail(yearmonth)
	{
	var i,j,sur1,sur2,sur3,init,alter;
	var code,sumto;
	var bRack=new Array();
	var year,month,beforey,beforem,beforeym;
	var result=true;

	DB3=new Array();
	init=0;
	for(i in DB)
		{
		DB3[i]=new Object();
		DB3[i].�O���݌�=init;
		DB3[i].���א�=init;
		DB3[i].�݌ɐ�=init;
		DB3[i].�񋟐�=init;
		DB3[i].�W�v��=DB[i].�W�v��;
		DB3[i].�\=false;
		}

	for(i in Report)
		{
		for(j in Report[i])
			{
			code=Report[i][j].�i��;
			if ((code in DB3)==false) continue;
			DB3[code].�\=true;
			}
		}

	year=Math.floor(yearmonth/100);
	month=yearmonth%100;
	if (month>=9)
		{
		yearp=year+1;
		}
	else{
		yearp=year;
		}
	GetArrival(yearp);		//	�������ׂ̎擾(�N�x�Ȃ̂�2015/9-2016/8��2016.csv�ɓ����Ă���)

	beforey=year;
	beforem=month-1;
	if (beforem==0) {beforem=12;beforey--;}
	beforeym=beforey*100+beforem;
	GetRack(beforeym);		//	�O�����݌ɂ̎擾
//	alert(yearmonth+"\n"+year+"\n"+beforeym);
	for(i in Rack)
		{
		bRack[i]=new Object();
		bRack[i].�i��=Rack[i].�i��;
		bRack[i].����=Rack[i].����;
		}
	GetRack(yearmonth);		//	�����݌�
	/*	���׏����X�V����-------------------------------------------------	*/
	for(j=0;j<maxArrival;j++)
		{
		if (Arrival[j].��!=yearmonth) continue;
		code=Arrival[j].�i��;
		if (!(code in DB)) continue;
		alter=DB[code].�W�v��;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].���א�+=Arrival[j].����;
		}
	/*	�݌ɏ����X�V����-------------------------------------------------	*/
	for(i=0;i<=249;i++)
		{
		if (!(i in Rack)) continue;
		if (Rack[i]=="") continue;
		code=Rack[i].�i��;
		if (!(code in DB)) continue;
		alter=DB[code].�W�v��;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].�݌ɐ�+=Rack[i].����;
		}
	/*	�O�����݌ɂ��X�V����-----------------------------------------------	*/
	for(i=0;i<=249;i++)
		{
		if (!(i in bRack)) continue;
		if (bRack[i]=="") continue;
		code=bRack[i].�i��;
		if (!(code in DB)) continue;
		alter=DB[code].�W�v��;
		if (alter=="DUMMY") continue;
		if (alter!=code) code=alter;
		if (!(code in DB3)) continue;
		DB3[code].�O���݌�+=bRack[i].����;
		}
	/*	�����ړ����̌v�Z----------------------------------------------------*/
	for(i in DB3)
		{
		DB3[i].�񋟐�=(DB3[i].�O���݌�-DB3[i].�݌ɐ�)+DB3[i].���א�;
		//	�����}�C�i�X�ɂȂ��Ă���΁A�ԕi�������͐����Y��̕�����א��ɑ���
		if (DB3[i].�񋟐�<0)
			{
			DB3[i].���א�+=Math.abs(DB3[i].�񋟐�);
			DB3[i].�񋟐�=0;
			}
		}
	/*	�W�v��̂Ȃ��i�ڂ�����H--------------------------------------------*/
	for(i in DB3)
		{
		if ((DB3[i].�񋟐�==0)&&(DB3[i].�O���݌�==0)&&(DB3[i].���א�==0)&&(DB3[i].�݌ɐ�==0)) continue;
		if (DB3[i].�\==false)
			{
			if (!(i in DBFix))	DBFix.push(i);
			result=false;
			}
		}
	return result;
	}

function MENU4_FixMaster()
	{
	var str,i,j,b,bnr,c,il;
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>���C�����j���[�������Ƃ̕����ړ��\��������i�ڏ��̏C��</span><br>");
	Keys[11]="MENU4()";
	s="<hr><form><table border=1 cellspacing=0>";
	s+="<tr class=HEAD><td width=80 nowrap align=center>�i�ڔԍ�</td><td width=300 align=center>�i�ږ�</td>";
	s+="<td width=200 align=center>�W�v��</td></tr>";
	c=0;
	for(i in DBFix)
		{
		j=DBFix[i];
		s+="<tr><td align=center>"+j+"</td>";
		s+="<td>"+DB[j].�i�ږ�+"</td>";
		b=DB[j].����;
		bnr=BunruiToNum(b);
		s+="<td>";
		il=ItemList(bnr,DB[j].�W�v��,2);
		s+=il;
		s+="<input type=button value='�X�V' onClick='MENU4_FixMasterUpdate("+i+","+j+","+c+")'>";
		s+="</td></tr>";
		c+=2;
		}
	s+="</table></form>";
	if (c==0) {MENU4();return;}
	WriteLayer("Stage",s);
	AddKey("Stage",0,"�߂�","MENU4()");
	}

function MENU4_FixMasterUpdate(num,code,elem)
	{
	var e=document.forms[0].elements[elem].value;
	if (e=="none") e="DUMMY";
	if (e=="same") e=code;
	DB[code].�W�v��=e;
	UpdateDB();
	delete DBFix[num];
	MENU4_FixMaster();
	}

function MENU4C()
	{
	MENU4Top=document.body.scrollTop;
	var s="<form><input type=file value=''></form>";
	ClearLayer("Stage");
	WriteLayer("Stage",s);
	setTimeout("MENU4C_Click()",5);
	}

function MENU4C_Click()
	{
	var s,ext;
	document.forms[0].elements[0].click();
	s=document.forms[0].elements[0].value;
	if (s=="") {MENU4();return;}
	if (!fso.FileExists(s)) return;
	ext=fso.GetExtensionName(s).toLowerCase();
	if (ext!="pdf")
		{
		alert("�w�肳�ꂽ�t�@�C����PDF�����ł͂���܂���B");
		MENU4();
		return;
		}
	ImportPDF(s);
	}

function NoCache()
	{
	var d=new Date();
	var t=d.getTime();
	return "?"+t+"";
	}

function MENU4D()
	{
	MENU4Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU4()";
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>���C�����j���[�������Ƃ̕����ړ��\�������ړ��\�̕\����");
	if (Menu4_Page==0)	{WriteLayer("Stage","�\��<br>");AddKey("Stage",1,"���ʂ�","MENU4DChange(1)");}
	if (Menu4_Page==1)	{WriteLayer("Stage","����<br>");AddKey("Stage",1,"�\�ʂ�","MENU4DChange(0)");}
	AddKey("Stage",0,"�߂�","MENU4()");
	var s="<hr><img src='"+ReportFolder()+Menu4_YearMonth;
	if (Menu4_Page==0) s+="P1";else s+="P2";
	s+=".jpg"+NoCache();
	s+="'><hr>";
	WriteLayer("Stage",s);
	}

function MENU4DChange(num)
	{
	Menu4_Page=num;
	MENU4D();
	}
