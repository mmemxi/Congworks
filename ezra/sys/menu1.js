//------------------------------------------------------------------------------------
var kbn=new Array();
var kubunccount=0;
var Menu1_Filter_kubuncount=0;
var Menu1_Filter_kubun="";
var Menu1_Filter_status="";
var Menu1_Year=0;
var MENU1Top=0;
var Sortkey=new Array();
var maxsort;
var pushscreen=new Array();
var pushBack=new Array();
var group=new Array(
"�I�����Ă�������",
"�N���Ƃ̕i��","����","����","���Ё|�啶����","�u���V���A�[�Ə����q",
"�p���t���b�g","�I�[�f�B�I","�r�f�I�^�c�u�c","�p����",
"����","Watchtower Library","������s��");
//------------------------------------------------------------------------------------
function StoreScreen(nextfunc)
	{
	var s=window["Stage"].innerHTML;
	var k=Keys[11];
	pushscreen.push(s);
	pushBack.push(k);
	eval(nextfunc);
	}
function RestoreScreen(num)
	{
	var b,bnum;
	var s=pushscreen.pop();
	Keys[11]=pushBack.pop();
	window["Stage"].innerHTML=s;
	if (num!="")
		{
		b=DB[num].����;
		bnum=BunruiToNum(b);
		document.forms[0].elements[2].selectedIndex=bnum;
		s=ItemList(bnum,num,1);
		LISTS.innerHTML=s;
		}
	}
//------------------------------------------------------------------------------------
function MENU1()
	{
	var logline=new Array();
	var today=new Date();
	var i,o,alter,s;
	nowmode="MENU1()";
	Help=11;
	ClearKey();
	ClearLayer("Stage");
	WriteLayer("Stage","<span class=size5><font color=blue>Ezra</font></span><span class=size2>Ver"+Version+"</span><br>");
	WriteLayer("Stage","<span class=size3>���C�����j���[���i�ڃ��X�g��");
	s=CreateDBList(Menu1_Year);
	WriteLayer("Stage",s);
	WriteLayer("Stage","</span><br><hr align=left width=80%>");
	AddKey("Stage",1,"�V�����i�ڂ̒ǉ�","MENU1A(1)");
	AddKey("Stage",0,"���C�����j���[�֖߂�","MainMenu()");
	Keys[11]="MainMenu()";
	for(i in kbn) delete kbn[i];
	kbn["���ׂ�"]=0;
	kubuncount=1;
	Menu1_Filter_kubuncount=0;
	
	for(i in DB)
		{
		o=DB[i];
		if (!(o.���� in kbn))
			{
			Menu1_Filter_kubuncount++;
			kbn[o.����]=Menu1_Filter_kubuncount;
			}
		//	�t�B���^�[�ɂ��\������-----------------------------------------------------------------
		DB[i].visible=true;
		if ((Menu1_Filter_kubun!="")&&(DB[i].����!=Menu1_Filter_kubun)) 
			{
			DB[i].visible=false;
			}
		}
	//	�ꗗ�\---------------------------------------------------------------------
	s="<table border=1 cellpadding=5 cellspacing=0><tr class=HEAD>";
	s+="<td align=center class=size2 width=120>����<br>";
	s+="<select size=1 onChange='MENU1_kubun_Change(this.selectedIndex)'>";
	for(i in kbn)
		{
		if (i=="���ׂ�")
			{
			if (Menu1_Filter_kubun=="") s+="<option selected>";else s+="<option>";
			s+="���ׂ�</option>";
			}
		else{
			if (Menu1_Filter_kubun==i) s+="<option selected>";else s+="<option>";
			s+=i+"</option>";
			}
		}
	s+="</select></td>";
	s+="<td align=center class=size2 width=50>�i�ڔԍ�</td>";
	s+="<td align=center class=size2 width=350>�i�ږ�<br>";
	s+="<td align=center class=size2 width=80>�W�v��</td>";
	s+="</tr>";
	//�\�[�g�L�[�̍쐬------------------------------------------------------------ 
	maxsort=0;
	for(i in Sortkey) delete Sortkey[i];
	for(i in DB)
		{
		if (!DB[i].visible) continue;
		Sortkey[maxsort]=new Object();
		Sortkey[maxsort].����=DB[i].����;
		Sortkey[maxsort].�i��=i;
		maxsort++;
		}
	Sortkey.sort(cmp_sort);
	for(j=0;j<maxsort;j++)
		{
		i=Sortkey[j].�i��;
		switch (DB[i].�R�[�h���)
			{
			case "old":
						s+="<tr bgcolor='#cccccc'>";
						break;
			case "new":
						s+="<tr bgcolor='#ffff99'>";
						break;
			default:
					if (DB[i].�W�v���=="sum") s+="<tr bgcolor='#ffccff'>";
					else s+="<tr>";
					break;
			}

		s+="<td class=size2 style='cursor:hand' title='�i�ڏ���������܂�' onClick='MENU1B(\""+i+"\")'>"+DB[i].����+"</td>";
		s+="<td class=size2 style='cursor:hand' title='�i�ڏ���������܂�' onClick='MENU1B(\""+i+"\")'>"+i+"</td>";
		s+="<td class=size2 style='cursor:hand' title='�i�ڏ���������܂�' onClick='MENU1B(\""+i+"\")'>"+DB[i].�i�ږ�+"</td>";
		vs=DB[i].�W�v��;
		if (vs==i) {vs="-";alter="�i�ڔԍ��Ɠ���";}
		else
			{
			if (vs=="DUMMY")
				{
				vs="(�W�v���Ȃ�)";
				alter="�W�v���Ȃ�";
				}
			else{
				try	{
					alter=DB[vs].�i�ږ�;
					}
				catch(e)
					{
					alert(vs+"\n�̕i�ږ����擾�ł��܂���B");
					alter="";
					}
				}
			}
		s+="<td class=size2 align=center style='cursor:hand' title='"+alter+"' onClick='MENU1B(\""+i+"\")'>"+vs+"</td>";
		s+="</tr>";
		}
	s+="</table>";
	WriteLayer("Stage",s);
	window.scrollTo(0,MENU1Top);
	}
function BunruiToNum(bnr)
	{
	var r,i;
	r=99;
	for(i in group)
		{
		if (group[i]==bnr)
			{
			r=i;
			break;
			}
		}
	return r;
	}
function cmp_sort(a, b)
	{
	var aa,bb;
	aa=BunruiToNum(a.����);
	bb=BunruiToNum(b.����);
	if (aa!=bb) return aa-bb;
	if (a.�i��>b.�i��) return 1;
	if (a.�i��<b.�i��) return -1;
	return 0;
	}
 
// ---------------------------------------------------------------------------------------
function MENU1_kubun_Change(num)
	{
	var i;
	if (num==0) Menu1_Filter_kubun="";
	else{
		for (i in kbn)
			{
			if (kbn[i]==num) break;
			}
		Menu1_Filter_kubun=i;
		}
	MENU1();
	}
//------------------------------------------------------------------------------------
//	���̒ǉ�
//------------------------------------------------------------------------------------
function Field(size,imemode,intval)
	{
	var s;
	s="<input type=text size="+size+" style='ime-mode:";
	if (imemode) s+="active;'";else s+="disabled;'";
	if (intval!="") s+="value='"+intval+"'";
	s+=">";
	return s;
	}
function MENU1A(backto)
	{
	var s,ymd,i,alter;
	Help=12;
	if (backto==1) MENU1Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	s="<div class=size5>�V�����i�ڂ̒ǉ�</div><hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='MENU1A_Exec("+backto+");return false;'><table border=1 cellspacing=0 cellpadding=4>";
	s+="<tr><td>�i�ڔԍ��F</td><td>"+Field(8,false,'')+"</td></tr>";
	s+="<tr><td>�i�ږ��F</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>���ށF</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option";
		if (i==0)
			{
			s+=" selected>���ނ�I�����Ă�������</option>";
			}
		else{
			s+=">"+group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	s+="<tr><td>�W�v��F</td><td><div id='LISTS'>���ނ�I�����Ă�������</div></td></tr>";

	s+="<tr><td>�i�ڔԍ��^�C�v�F</td><td><input type='radio' name='codetype' value='normal' checked>�ʏ�i�����ȕi�ڔԍ��j<br>";
	s+="<input type='radio' name='codetype' value='old'>���i�ځi�����ȕi�ڔԍ���������Ȃ��A�ߋ��̕i�ځj<br>";
	s+="<input type='radio' name='codetype' value='new'>�V�i�ځi�����ȕi�ڔԍ���������Ȃ��A�V�����i�ځj<br>";
	s+="</td></tr>";
	s+="<tr><td>�W�v��^�C�v�F</td><td><input type='radio' name='sumtype' value='normal' checked>�ʏ�̕i��<br>";
	s+="<input type='radio' name='sumtype' value='sum' onclick='MENU1A_SumSelect()'>���̑��̕i�ځi�W�v��Ƃ��Ă̂ݎg����i�ځj<br>";
	s+="</td></tr>";

	s+="</table><br>";
	s+="<input type=button value='�o�^' onClick='MENU1A_Exec("+backto+")'>";
	switch(backto)
		{
		case 1:		s+="<input type=button value='�߂�' onClick='MENU1()'></form>";
					Keys[11]="MENU1()";
					break;
		default:	s+="<input type=button value='�߂�' onClick='RestoreScreen(\"\")'></form>";
					Keys[11]="RestoreScreen(\"\")";
					break;
		}
	WriteLayer("Stage",s);
	setTimeout("Focus(0)",20);
	}

function MENU1A_SumSelect()
	{
	var s,i;
	i=document.forms[0].elements[2].selectedIndex;
	if (i==0)
		{
		LISTS.innerHTML="���ނ�I�����Ă�������";
		return;
		}
	s=ItemList(i,"same",0);
	LISTS.innerHTML=s;
	}

function MENU1A_Exec(backto)
	{
	var s,num,name,kubun,alter,f;
	var codetype,sumtype;
	num=document.forms[0].elements[0].value+"";
	num=num.trim();
	if (num=="")
		{
		alert("�i�ڔԍ�����͂��Ă��������B");
		return;
		}
	if (num in DB)
		{
		alert("���̕i�ڔԍ��͂��łɑ��݂��܂��B�ǉ��ł��܂���B");
		return;
		}

	name=document.forms[0].elements[1].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("�i�ږ������͂���Ă��܂���B");
		return;
		}

	kubun=document.forms[0].elements[2].selectedIndex;
	if (kubun==0)
		{
		alert("���ނ�I�����Ă��������B");
		return;
		}
	kubun=group[kubun];

	alter=document.forms[0].elements[3].selectedIndex;
	if (alter<0)
		{
		alert("�W�v���I�����Ă��������B");
		return;
		}
	alter=document.forms[0].elements[3].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	for(i=4;i<=6;i++)
		{
		if (document.forms[0].elements[i].checked) codetype=document.forms[0].elements[i].value;
		}
	for(i=7;i<=8;i++)
		{
		if (document.forms[0].elements[i].checked) sumtype=document.forms[0].elements[i].value;
		}
	DB[num]=new Object();
	DB[num].�i�ږ�=name;
	DB[num].����=kubun;
	DB[num].�W�v��=alter;
	DB[num].�R�[�h���=codetype;
	DB[num].�W�v���=sumtype;
	UpdateDB();
	if (backto==1) MENU1();
	else RestoreScreen(num);
	}

//------------------------------------------------------------------------------------
//	�i�ڂ̏C��
//------------------------------------------------------------------------------------
function MENU1B(num)
	{
	var s,ymd,i,j,k,sel,alter,neighbor;
	Help=12;
	MENU1Top=document.body.scrollTop;
	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU1()";
	s="<div class=size5>�i�ڔԍ�"+num+"�̒����F</div><hr align=left width=100%>";
	s+="<div class=size3><form onsubmit='MENU1B_Exec(\""+num+"\");return false;'><table border=1 cellspacing=0 cellpadding=4>";
	s+="<tr><td size=100>�i�ڔԍ��F</td><td size=400>"+Field(8,false,'')+"</td></tr>";
	s+="<tr><td>�i�ږ��F</td><td>"+Field(40,true,'')+"</td></tr>";
	s+="<tr><td>���ށF</td><td><select onChange='ChangeItemListA(this.selectedIndex)'>";
	for(i=0;i<group.length;i++)
		{
		s+="<option";
		if (group[i]==DB[num].����)
			{
			sel=i;
			s+=" selected>";
			}
		else{
			s+=">";
			}
		if (i==0)
			{
			s+="���ނ�I�����Ă�������</option>";
			}
		else{
			s+=group[i]+"</option>";
			}
		}
	s+="</select></td></tr>";
	alter=DB[num].�W�v��;
	if (alter==num) alter="same";
	if (alter=="DUMMY") alter="none";
	s+="<tr><td>�W�v��F</td><td><div id='LISTS'>"+ItemList(sel,alter,0)+"</div></td></tr>";

	var codetype=new Array("","","");
	switch(DB[num].�R�[�h���)
		{
		case "old":
					codetype[1]=" checked";
					break;
		case "new":
					codetype[2]=" checked";
					break;
		default:	
					codetype[0]=" checked";
					break;
		}
	s+="<tr><td>�i�ڔԍ��^�C�v�F</td><td><input type='radio' name='codetype' value='normal'"+codetype[0]+">�ʏ�i�����ȕi�ڔԍ��j<br>";
	s+="<input type='radio' name='codetype' value='old'"+codetype[1]+">���i�ځi�����ȕi�ڔԍ���������Ȃ��A�ߋ��̕i�ځj<br>";
	s+="<input type='radio' name='codetype' value='new'"+codetype[2]+">�V�i�ځi�����ȕi�ڔԍ���������Ȃ��A�V�����i�ځj<br>";
	s+="</td></tr>";

	var sumtype=new Array("","");
	switch(DB[num].�W�v���)
		{
		case "sum":
					sumtype[1]=" checked";
					break;
		default:	
					sumtype[0]=" checked";
					break;
		}
	s+="<tr><td>�W�v��^�C�v�F</td><td><input type='radio' name='sumtype' value='normal'"+sumtype[0]+">�ʏ�̕i��<br>";
	s+="<input type='radio' name='sumtype' value='sum'"+sumtype[1]+">���̑��̕i�ځi�W�v��Ƃ��Ă̂ݎg����i�ځj<br>";
	s+="</td></tr>";

	neighbor="";
	for(i in DB)
		{
		if (i==num) continue;
		if (DB[i].�W�v��==num)
			{
			if (neighbor!="") neighbor+="/";
			neighbor+="<a style='cursor:hand;' onClick='MENU1B("+i+")' title='�i�ڔԍ��F"+i+"'>"+DB[i].�i�ږ�+"</a>";
			}
		}
	if (neighbor!="")
		{
		s+="<tr><td>�������鑼�i�ځF</td><td width=400>"+neighbor;
		s+="</td></tr>";
		}
	s+="</table><br>";
	s+="<input type=button value='�X�V' onClick='MENU1B_Exec(\""+num+"\")'>";
	s+="<input type=button value='�폜' onClick='MENU1B_Delete(\""+num+"\")'>";
	s+="<input type=button value='�߂�' onClick='MENU1()'></form>";
	WriteLayer("Stage",s);
	document.forms[0].elements[0].value=num;
	document.forms[0].elements[1].value=DB[num].�i�ږ�;
	}

function ChangeItemListA(num)
	{
	var s,l;
	if (num==0)
		{
		LISTS.innerHTML="���ނ�I�����Ă�������";
		return;
		}
	s=ItemList(num,"",0);
	LISTS.innerHTML=s;
	}

function MENU1B_Exec(num)
	{
	var a,s,name,kubun,alter,f,i,j,k,cmpa,cmpb;
	var code,codetype,sumtype,numx;
	var montbl=new Array(9,10,11,12,101,102,103,104,105,106,107,108);
	numx=num+"";
	name=document.forms[0].elements[1].value;
	name=name.trim();
	if ((name=="")||(name==null))
		{
		alert("�i�ږ������͂���Ă��܂���B");
		return;
		}
	kubun=document.forms[0].elements[2].selectedIndex;
	kubun=group[kubun];

	alter=document.forms[0].elements[3].selectedIndex;
	if (alter<0)
		{
		alert("�W�v���I�����Ă��������B");
		return;
		}
	alter=document.forms[0].elements[3].value;
	if (alter=="same") alter=num;
	if (alter=="none") alter="DUMMY";

	for(i=4;i<=6;i++)
		{
		if (document.forms[0].elements[i].checked) codetype=document.forms[0].elements[i].value;
		}
	for(i=7;i<=8;i++)
		{
		if (document.forms[0].elements[i].checked) sumtype=document.forms[0].elements[i].value;
		}
	code=document.forms[0].elements[0].value+"";
	if (code!=numx)
		{
		if (code in DB)
			{
			alert("�i�ڔԍ�"+code+"�͂��łɑ��݂��܂��B\n�i�ڔԍ��̕ύX�͂ł��܂���B");
			document.forms[0].elements[0].value=numx;
			return;
			}
		a=confirm("�i�ڔԍ���"+numx+"��"+code+"\n�ɕύX���܂��B��낵���ł����H");
		if (!a) return;
		GetArrival(Menu1_Year);
		for(i in Arrival)
			{
			if (Arrival[i].�i��==numx) Arrival[i].�i��=code;
			}
		SetArrival(Menu1_Year);
		for(i=0;i<=11;i++)
			{
			j=Menu1_Year*100+montbl[i];
			GetRack(j);
			for(k in Rack)
				{
				if (Rack[k].�i��==numx) Rack[k].�i��=code;
				}
			SetRack(j);
			}
		if (numx==alter) alter=code;
		delete DB[num];
		num=code;
		DB[num]=new Object();
		}
	DB[num].�i�ږ�=name;
	DB[num].����=kubun;
	DB[num].�W�v��=alter;
	DB[num].�R�[�h���=codetype;
	DB[num].�W�v���=sumtype;
	UpdateDB();
	MENU1();
	}

function MENU1B_Delete(num)
	{
	var a,b;
	b=document.forms[0].elements[0].value;
	b=parseInt(b,10);
	if (b!=num)
		{
		alert("�i�ڔԍ���ύX���Ă���̂ŁA�폜�ł��܂���B");
		return;
		}
	a=confirm(num+"�u"+DB[num].�i�ږ�+"�v���폜���Ă���낵���ł����H");
	if (!a) return;
	delete DB[num];
	UpdateDB();
	MENU1();
	}
