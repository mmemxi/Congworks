//------------------------------------------------------------------------------------
var Menu3_YearMonth;
var Rack=new Array();
var MouseDownPos=0;
var MouseUpPos=0;
var Menu3_Zoom=100;
//------------------------------------------------------------------------------------
function GetRack(yearmonth)
	{
	var data=ReadFile(RackFile(yearmonth));
	var spr,i,j,dtl,yyyymm,code,num,yyyy,mm,seq,nend;
	var pos,code,name,l;
	var year=Math.floor(yearmonth/100);
	var month=yearmonth % 100;
	if (month>=9) year++;
	OpenDB(year);

	Rack=new Array();
	l=0;
	if (data!="")
		{
		spr=data.split("\r\n");
		for(i in spr)
			{
			spr[i]+=",end,end,end";
			dtl=spr[i].split(",");
			if (dtl[0]=="end") break;
			if (dtl[1]=="end") break;
			if (dtl[2]=="end") break;
			pos=parseInt(dtl[0],10);
			Rack[pos]=new Object();
			Rack[pos].�i��=dtl[1];
			code=dtl[1];
			if (code in DB) name=DB[code].�i�ږ�;else name="???";
			Rack[pos].�i�ږ�=name;
			Rack[pos].����=parseInt(dtl[2],10);
			l++;
			}
		}
	if (data=="") return false;else return true;
	}
function SetRack(yearmonth)
	{
	var s,i;
	var filename=RackFile(yearmonth);
	var f=fso.CreateTextFile(filename,true);
	for(i=0;i<=299;i++)
		{
		if (!(i in Rack)) continue;
		if (Rack[i]=="") continue;
		s=i+","+Rack[i].�i��+","+Rack[i].����;
		f.WriteLine(s);
		}
	f.close();
	}

function ChangeMenu3(num)
	{
	Menu3_YearMonth=num;
	MENU3();
	}
function MENU3_YearMonth_Sort(a,b)
	{
	return b-a;
	}
function MENU3_ZoomOut()
	{
	Menu3_Zoom-=25;
	if (Menu3_Zoom<25) Menu3_Zoom=25;
	TABLE.style.zoom=Menu3_Zoom+"%";
	}
function MENU3_ZoomIn()
	{
	Menu3_Zoom+=25;
	if (Menu3_Zoom>200) Menu3_Zoom=200;
	TABLE.style.zoom=Menu3_Zoom+"%";
	}
//------------------------------------------------------------------------------------
function MENU3()
	{
	var i,j,o,s,ss,file,yearnum,obj,filename,basename;
	var x,y,pos;
	var yearsExist=false;
	var years=new Array();
	nowmode="MENU3";
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>���C�����j���[���݌ɒ����p���F");
	yearnum=0;
	var folder=RackFolder();
	if (!fso.FolderExists(folder)) fso.CreateFolder(folder);
	var dir=fso.GetFolder(RackFolder());
	var files=new Enumerator(dir.Files);
	for(; !files.atEnd(); files.moveNext())
		{
		obj=files.item();
		filename=obj.Name+"";
		basename=fso.GetBaseName(filename);
		if (isNaN(basename)) continue;
		yearnum++;
		i=parseInt(basename,10);
		years.push(i);
		}
	if (yearnum==0) ss="";
	else{
		ss="<select onchange='ChangeMenu3(this.value)'>";
		years.sort(MENU3_YearMonth_Sort);
		for(i=0;i<yearnum;i++)
			{
			ss+="<option value="+years[i];
			if (years[i]==Menu3_YearMonth)
				{
				ss+=" selected";
				yearsExist=true;
				}
			ss+=">"+years[i]+"</option>";
			}
		ss+="</select>";
		if (!yearsExist) Menu3_YearMonth=years[0];
		}
	s=ss;
	s+="</span>";
	s+="<input type=button value='�k��' onClick='MENU3_ZoomOut()'>";
	s+="<input type=button value='�g��' onClick='MENU3_ZoomIn()'>";
	s+="<br><hr align=left width=80%>";
	WriteLayer("Stage",s);
	var today=new Date();
	var ty=today.getFullYear();
	var tm=today.getMonth()+1;
	var td=today.getDate();
	if (td<10)
		{
		tm--;
		if (tm==0) {tm=12;ty--;}
		}
	var tym=ty*100+tm;
	var filename=RackFile(tym);
	if (!fso.FileExists(filename))
		{
		AddKey("Stage",1,"�ŐV�̍݌ɒ����p�����쐬����","MENU3A("+tym+")");
		}
	if (yearnum!=0) AddKey("Stage",2,"���̍݌ɒ����p�����������","MENU3B()");
	AddKey("Stage",0,"���C�����j���[�֖߂�","MainMenu()");
	Keys[11]="MainMenu()";
	if (yearnum==0)
		{
		WriteLayer("Stage","<br><span class=size3>�ߋ��̍݌ɒ����p���͂���܂���B</span>");
		return;
		}
	GetRack(Menu3_YearMonth);
	WriteLayer("Stage","<div id='RACK'></div>");
	DrawRack();
	if (!fso.FileExists(filename)) alert("�������̍݌ɒ����p���͂܂��쐬����Ă��܂���B\n���̂܂܍�Ƃ���ƁA�O���̍݌ɒ����p���������Ă��܂��܂��B\n�������̍݌ɒ����p�������ɂ́A�u�ŐV�̍݌ɒ����p�����쐬����v�����s���Ă��������B");
	}
function DrawRack()
	{
	var i,s,y,x,pos;
	ClearLayer("RACK");
	s="<div id='TABLE' style='zoom:"+Menu3_Zoom+"%'><table border=1 cellpadding=2 cellspacing=0>";
	s+="<tr class=HEAD><td width=50>�@</td>";
	for(i=0;i<=24;i++)
		{
		s+="<td>"+(i+1)+"</td>";
		}
	s+="</tr>";
	for(y=0;y<=11;y++)
		{
		s+="<tr style='height:80px;'><td bgcolor=black class=size2 align=center valign=middle width=50 nowrap rowspan=2><span style='color:#ffffff;'>";
		if (y<=7)
			{
			s+=(y+1)+"�i��";
			}
		if (y==8) s+="�����i";
		if (y==9) s+="����i";
		if (y==10) s+="���̑�";
		if (y==11) s+="�O����";
		s+="</span></td>";
		for(x=0;x<=24;x++)
			{
			pos=y*25+x;
			s+="<td class=size2 style='cursor=hand;width:100px;border-bottom:none;' nowrap onClick='EditRack("+pos+")'";
			s+=" onmousedown='posdown("+pos+")' onmouseup='posup("+pos+")'>";
			if ((pos in Rack)&&(Rack[pos]!=""))
				{
				s+=Rack[pos].�i�ږ�;
				}
			else s+="�@";
			s+="</td>";
			}
		s+="</tr><tr height=20>";
		for(x=0;x<=24;x++)
			{
			pos=y*25+x;
			s+="<td class=size2 style='cursor=hand;width:100px;border-top:none;' nowrap onClick='EditSuryo("+pos+")'";
			s+=" onmousedown='posdown("+pos+")' onmouseup='posup("+pos+")' bgcolor='#bbffff' align=center>";
			if ((pos in Rack)&&(Rack[pos]!=""))
				{
				s+=Rack[pos].����;
				}
			else s+="�@";
			s+="</td>";
			}
		s+="</tr>";
		}
	s+="</table></div>";
	WriteLayer("RACK",s);
	}
function posdown(pos)
	{
	MouseDownPos=pos;
	}

function posup(pos)
	{
	var a,b;
	MouseUpPos=pos;
	if (MouseUpPos==MouseDownPos) return;
	if (!(MouseDownPos in Rack)) return;
	if (MouseUpPos in Rack) return;
	a=MouseDownPos;
	b=MouseUpPos;
	Rack[b]=new Object();
	Rack[b].�i��=Rack[a].�i��;
	Rack[b].�i�ږ�=Rack[a].�i�ږ�;
	Rack[b].����=Rack[a].����;
	delete Rack[a];
	SetRack(Menu3_YearMonth);
	DrawRack();
	}
function EditSuryo(pos)
	{
	var name,suryo;
	suryo=Rack[pos].����;
	name=Rack[pos].�i�ږ�;
	suryo=prompt(name+"�̍݌ɐ�����͂��Ă��������B",suryo);
	if (suryo==null) return;
	suryo=suryo.trim();
	if (suryo=="")
		{
		delete Rack[pos];
		SetRack(Menu3_YearMonth);
		DrawRack();
		return;
		}
	if (isNaN(suryo))
		{
		alert("���͂��ꂽ���ʂ�����������܂���B");
		return;
		}
	suryo=parseInt(suryo,10);
	if (suryo<=0)
		{
		alert("���͂��ꂽ���ʂ�����������܂���B");
		return;
		}
	Rack[pos].����=parseInt(suryo,10);
	SetRack(Menu3_YearMonth);
	DrawRack();
	}
function EditRack(pos)
	{
	var s,ymd,i,j,x,y;
	var y,m,d,ay,am,py,pm,sur,bunrui;
	var today=new Date();
	var Ary=new Array();
	var label=new Array("�P�i��","�Q�i��","�R�i��","�S�i��","�T�i��","�U�i��","�V�i��","�W�i��","�����i","����i","���̑�","�O����");
	var RackExist=false;
	if (pos in Rack) RackExist=true;
	Help=12;
	ClearKey();
	ClearLayer("Stage");
	y=Math.floor(pos/25);
	x=(pos % 25);
	Keys[11]="MENU3()";
	s="<div class=size5>";
	s+=label[y]+"-"+(x+1)+"�Ԗڂ̍݌ɏ��</div>";
	s+="<hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='Edit_Exec("+pos+");return false;'><table border=1 cellspacing=0 cellpadding=8 width=80%>";
	s+="<tr><td width=100>�i�ځF</td><td>";
	s+="<select size=1 onChange='ChangeItemList(this.selectedIndex)'>";
	if (RackExist)
		{
		i=Rack[pos].�i��;
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
	s+="</select><input type=button value='�V�����i�ڂ̒ǉ�' onClick='StoreScreen(\"MENU1A(3)\")'><br>";
	s+="<div id='LISTS'>";
	if (!RackExist)
		{
		s+=ItemList(bunrui,"",1);
		}
	else{
		s+=ItemList(bunrui,Rack[pos].�i��,1);
		}
	s+="</div></td></tr>";
	if (!RackExist) sur="";else sur=Rack[pos].����;
	s+="<tr><td>�݌ɐ��ʁF</td><td>"+Field(8,false,sur)+"</td></tr></table><br>";
	s+="<input type=button value='�o�^' onClick='Edit_Exec("+pos+")'>";
	if (RackExist)	s+="<input type=button value='�폜' onClick='Edit_Del("+pos+")'>";
	s+="<input type=button value='�߂�' onClick='MENU3()'></form>";
	WriteLayer("Stage",s);
	if (RackExist)	setTimeout("Focus(3)",10);
	}
function Focus(num)
	{
	document.forms[0].elements[num].select();
	}
function Edit_Exec(pos)
	{
	var code,suryo,name;
	code=document.forms[0].elements[2].selectedIndex;
	if (code<0)
		{
		alert("�i�ڂ�I�����Ă��������B");
		return;
		}
	code=document.forms[0].elements[2].value;
	suryo=document.forms[0].elements[3].value;
	suryo=suryo.trim();
	if ((suryo=="")||(isNaN(suryo)))
		{
		alert("���ʂ𐳂������͂��Ă��������B");
		return;
		}
	Rack[pos]=new Object();
	Rack[pos].�i��=code;
	if (code in DB) name=DB[code].�i�ږ�;else name="???";
	Rack[pos].�i�ږ�=name;
	Rack[pos].����=parseInt(suryo,10);
	SetRack(Menu3_YearMonth);
	MENU3();
	}

function Edit_Del(pos)
	{
	var a=confirm("���̍݌ɏ����폜���Ă���낵���ł����H");
	if (!a) return;
	Rack[pos]="";
	SetRack(Menu3_YearMonth);
	MENU3();
	}

function MENU3A(ym)
	{
	var by,bm,bym,ay,am,aym;
	var y=Math.floor(ym/100);
	var m=ym % 100;
	var ty=y;
	if (m>=9) ty++;
	if (!fso.FileExists(DBFile(ty)))
		{
		CreateNewDB(ty);
		}
	//	�ŐV�̍݌ɏ�����������
	by=y;bm=m;
	while(1==1)
		{
		bm--;
		if (bm==0) {bm=12;by--;}
		bym=by*100+bm;
		if (RackExists(bym)) break;
		}
	//	�ŐV���猻�݂܂ł����
	ay=by;am=bm;
	while(1==1)
		{
		am++;
		if (am==13) {am=1;ay++;}
		aym=ay*100+am;
		if (RackExists(aym)) break;
		GetRack(bym);
		SetRack(aym);
		if (aym==ym) break;
		bm++;
		if (bm==13) {bm=1;by++;}
		bym=by*100+bm;
		}
	Menu3_YearMonth=ym;
	MENU3();
	}

function MENU3B()
	{
	var workbook,worksheet;
	var x,y,i;
	var name,suryo;
	workbook = excel.Workbooks.Open(SysFolder()+"�݌ɒ����p��.xls",0,true);
	worksheet = workbook.Worksheets(1);
	worksheet.Cells(1,5).value=Menu3_YearMonth+"��";
	for(y=0;y<=11;y++)
		{
		for(x=0;x<=24;x++)
			{
			i=y*25+x;
			if (!(i in Rack)) continue;
			name=Rack[i].�i�ږ�;
			suryo=Rack[i].����;
			worksheet.Cells((y*2)+4,x+2).value=name;
			worksheet.Cells((y*2)+5,x+2).value=suryo;
			}
		}
	worksheet.PrintOut();
	workbook.Close();
	}
