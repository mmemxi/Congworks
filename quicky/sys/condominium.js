//--------------------------------------------------------------------------
var EditClist=new Array();
var InpClist=new Array();
var BoxList=new Array();
var Condominiums=new Array();
//--------------------------------------------------------------------------
function RemoveCondominium(name)
	{
	var rst=new Array();
	var f=ApartXML(name);
	if (!fso.FileExists(f)) return obj;
	var TB=ReadXMLFile(f,true);
	var s1,s2,s3,s4,o1,o2,o3,o4;
	var p,ps,i,j,k,obj;
	for(s1=0;s1<TB.building[0].sequence.length;s1++)
		{
		o1=TB.building[0].sequence[s1];
		for(s2=0;s2<o1.stair.length;s2++)
			{
			o2=o1.stair[s2];
			for(s3=0;s3<o2.floor.length;s3++)
				{
				o3=o2.floor[s3];
				if (!("moved" in o3)) continue;
				p=o3.moved;
				ps=p.split("-");
				ps[0]=parseInt(ps[0],10);
				ps[1]=parseInt(ps[1],10);
				LoadCard(ps[0]);
				if (!("Condominium" in Cards[num])) continue;
				o4=Cards[num].Condominium;
				for(s4=0;s4<o4.length;s4++)
					{
					if (o4[s4].Name==name)
						{
						obj=new Array();
						obj.x=parseInt(o4[s4].x,10);
						obj.y=parseInt(o4[s4].y,10);
						obj.seq=parseInt(o4[s4].Seq,10);
						rst.push(obj);
						o4.splice(s4,1);
						}
					}
				SaveConfig(num);
				}
			}
		}
	return obj;
	}
//--------------------------------------------------------------------------
function EditCondominium(num,seq)
	{
	var s,i,j,k,id;
	var dir,files,file,ext,fullpath;
	var tmp,inx,sel,myinx,inpo;
	var p1,p2,p3,p4;
	var o1,o2,o3,o4;
	var c,c0,c1,c2,c3,c4,cn1,cn2,cn3;
	var cobj;

	ClearKey();
	ClearLayer("Stage");
	Keys[11]="MENU1PBig("+num+","+seq+")";
	EditClist=new Array();		//	選択肢の文字列
	InpClist=new Array();		//	
	BoxList=new Array();
	for(i in Cards)
		{
		if (Cards[i].MapType!=1) continue;	//	集合住宅区域のみ
		c1="№"+i+"-";
		for(j=1;j<=Cards[i].count;j++)
			{
			inx=i+"-"+j;
			c=c1+nums.charAt(j-1)+"："+Cards[i].name;
			EditClist[inx]=c;
			}
		}
	myinx=num+"-"+seq;
	s="<font size=5>集合住宅の割当編集："+num+"-"+nums.charAt(seq-1)+"："+Cards[num].name+"</font><br><form>";
	WriteLayer("Stage",s);
	AddKey("Stage",1,"編集の実行","EditCondominium_Exec("+num+","+seq+")");
	AddKey("Stage",0,"戻る","MENU1PBig("+num+","+seq+")");
	s=hr()+"<table border=1 cellpadding=3 cellspacing=0><tr>";
	s+="<td style='width:250px;color:#ffffff;background-color:#000000;text-align:center;'>集合住宅名</td>";
	s+="<td style='width:500px;color:#ffffff;background-color:#000000;text-align:center;'>割当地図番号</td></tr>";
	c0=0;
	dir=fso.GetFolder(ApartFolder());
	files=new Enumerator(dir.Files);

	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		fullpath=ApartFolder()+file;
		ext=fso.GetExtensionName(file).toLowerCase();
		if (ext!="xml") continue;
		tmp=ReadXMLFile(fullpath,false);
		if (tmp=="") continue;
		try	{
			if (!("Type" in tmp)) continue;		//	集合住宅の定義がない（旧フォーマット）
			}
		catch(e)
			{
			continue;
			}
		c=parseInt(tmp.Type,10);
		if (c!=2) continue;			//	集合住宅でない
		//	集合住宅を発見。以下は配置処理-----------------------------------------------
		id=tmp.building[0].id;
		BoxList[id]=CreateBuildingImage(0,0,tmp,0,"",1,1,4);
		c0++;
		i=0;
		cobj="";
		cobj+="<tr><td";
		cobj+=" valign=middle style='width:250px;'>"+tmp.building[0].id;		//	集合住宅名
		cobj+="<img src='./sys/reverse.gif' width=32 height=16 style=' ;' onclick='SwitchShowHide(\""+c0+"\")'>";
		cobj+="<br><span style='color:#0000ff;cursor:pointer;text-decoration:underline;' ";
		cobj+="onclick='PopupBuildingPlace("+tmp.Num+","+tmp.Seq+",\""+tmp.building[0].id+"\");return false;'>参照";
		cobj+="</span></td>";
		cobj+="<td valign=middle style='width:500px;'>";
		cobj+="<table id='SW"+c0+"' style='display:$1$;' border=0 cellpadding=0 cellspacing=0>";
		cobj+="<tr><td>";
		//	ループ開始
		o1=tmp.building[0].sequence;
		c1=0;cn1=0;cn2=0;cn3=0;
		for(p1 in o1)	//	棟ループ
			{
			c2=0;
			o2=o1[p1].stair;
			for(p2 in o2)	//	階段ループ
				{
				c3=0;
				o3=o2[p2].floor;
				for(p3 in o3)	//	階ループ
					{
					c1++;c2++;c3++;
					o4=o3[p3];
					cobj+="<span style='width:100px;text-align:right;font-size:16px;font-weight:bold;'>";
					if ("id" in o1[p1])	cobj+=o1[p1].id+"-";	//	棟名
					if ("id" in o2[p2])	cobj+=o2[p2].id+"-";	//	階段名
					if ("id" in o3[p3]) cobj+=o3[p3].id;		//	フロア名
					cobj+="("+o4.rooms+"世帯)：";					//	世帯数
					cobj+="</span>";
					cobj+="<select id='target"+i+"' size=1 style='width:300px;'>";
					cobj+="<option value='' style='color:#ff0000;'>未割当</option>";
					inpo=new Object();
					inpo.id=tmp.building[0].id;
					inpo.sequence=p1;
					inpo.stair=p2;
					inpo.floor=p3;
					inpo.rooms=parseInt(o4.rooms,10);
					sel="";
					if (("moved" in o4)) sel=o4.moved;
					inpo.key=sel;
					InpClist.push(inpo);
					cn1++;
					for(p4 in EditClist)
						{
						cobj+="<option value='"+p4+"'";		//	80-1など
						if (p4==sel) {cobj+=" selected";cn2++;}
						if (p4==myinx) cobj+=" style='background-color:#ffff00;'";
						if ((p4==sel)&&(p4==myinx)) cn3++;
						cobj+=">"+EditClist[p4]+"</option>";
						}
					cobj+="</select><br>";
					i++;
					}
				cobj+="</td></tr></table>";
				cobj+="<table id='DW"+c0+"' border=0 cellpadding=2 cellspacing=0 style='display:$2$; ;'";
				cobj+=" title='この集合住宅の詳細を展開します'";
				cobj+=" onclick='SwitchShowHide(\""+c0+"\")'>";
				cobj+="<tr><td id='MW"+c0+"' style='width:500px;'>";
				cobj+="<img src='./sys/plus.gif' width=16 height=16>";
				cobj+="</td></tr></table>";
				}
			}
		cobj+="</td></tr>";
		if ((cn1==cn2)&&(cn3==0))
			{
			cobj=cobj.replace("$2$","block");
			cobj=cobj.replace("$1$","none");
			}
		else{
			cobj=cobj.replace("$1$","block");
			cobj=cobj.replace("$2$","none");
			}
		s+=cobj;
		}
	s+="</table></form>";
	WriteLayer("Stage",s);
	window.scrollTo(0,0);
	}
//-------------------------------------------------------------------------------------
function SwitchShowHide(id)
	{
	var obj;
	obj=document.getElementById("SW"+id);
    obj.style.display =(obj.style.display == 'none') ? 'block' : 'none';
	obj=document.getElementById("DW"+id);
    obj.style.display =(obj.style.display == 'none') ? 'block' : 'none';
	}
//-------------------------------------------------------------------------------------
function EditCondominium_Exec(num,seq)
	{
	var a1,a2,a3;
	var i,j,k,tmp,inpo,v,vkey,updated,obj;
	var id,p1,p2,p3,p4,p5,frm,vkr,vk1,vk2;
	var beforeid="";
	var file="";
	var OldCard=new Array();
	var NewCard=new Array();
	var Boxes=new Array();
	var Reloads=new Array();

	//	1:OldCardの作成
	for(i in Cards)
		{
		OldCard[i]=new Object();
		OldCard[i].Id=new Array();
		for(j=0;j<Cards[i].Condominium.length;j++)
			{
			a1=Cards[i].Condominium[j].Name;
			a2=Cards[i].Condominium[j].Seq;
			a3=parseInt(Cards[i].Condominium[j].Rooms,10);
			if (!(a1 in OldCard[i].Id))
				{
				OldCard[i].Id[a1]=new Object();
				OldCard[i].Id[a1].Seq=new Array();
				}
			if (!(a2 in OldCard[i].Id[a1].Seq))
				{
				OldCard[i].Id[a1].Seq[a2]=0;
				}
			OldCard[i].Id[a1].Seq[a2]+=a3;
			}
		}
	//	2:NewCardの作成
	for(i=0;i<InpClist.length;i++)
		{
		inpo=InpClist[i];
		inpo.key=document.forms[0].elements[2+i].value;
		if (inpo.key=="") continue;
		vkr=inpo.key.split("-");
		vk1=vkr[0]+"";
		vk2=vkr[1]+"";
		if (!(vk1 in NewCard))
			{
			NewCard[vk1]=new Object();
			NewCard[vk1].Id=new Array();
			}
		id=inpo.id;
		if (!(id in NewCard[vk1].Id))
			{
			NewCard[vk1].Id[id]=new Object();
			NewCard[vk1].Id[id].Seq=new Array();
			}
		if (!(vk2 in NewCard[vk1].Id[id].Seq))
			{
			NewCard[vk1].Id[id].Seq[vk2]=0;
			}
		NewCard[vk1].Id[id].Seq[vk2]+=inpo.rooms;
		}

	//	3:アパートXMLへの更新
	updated=false;
	for(i=0;i<InpClist.length;i++)
		{
		inpo=InpClist[i];
		inpo.key=document.forms[0].elements[2+i].value;
		id=inpo.id;

		if (id!=beforeid)
			{
			if ((beforeid!="")&&(updated))	WriteXMLFile(tmp,file);
			beforeid=id;
			file=ApartXML(id);
			tmp=ReadXMLFile(file,true);
			updated=false;
			}

		p1=inpo.sequence;
		p2=inpo.stair;
		p3=inpo.floor;
		try	{
			v=tmp.building[0].sequence[p1].stair[p2].floor[p3];
			}
		catch(e){continue;}
		if (!("moved" in v)) vkey="";else vkey=v.moved;
		if (vkey==inpo.key) continue;	//	vkey=変更前設定　inpo.key=変更後設定
		if (inpo.key!="")		v.moved=inpo.key;
						else	delete v.moved;
		updated=true;
		}
	if ((beforeid!="")&&(updated))	WriteXMLFile(tmp,file);

	//	4:OldCardにあってNewCardにないカードを更新
	for(i in OldCard)
		{
		if (!(i in NewCard))
			{
			if (Cards[i].Condominium.length>0)
				{
				Cards[i].Condominium=new Array();
				SaveConfig(i);
				Reloads[i]=true;
				}
			continue;
			}
		updated=false;
		for(j=0;j<Cards[i].Condominium.length;j++)
			{
			id=Cards[i].Condominium[j].Name;
			if (!(id in NewCard[i].Id))
				{
				updated=true;
				Cards[i].Condominium.splice(j,1);
				j--;
				continue;
				}
			k=Cards[i].Condominium[j].Seq+"";
			if (!(k in NewCard[i].Id[id].Seq))
				{
				updated=true;
				Cards[i].Condominium.splice(j,1);
				j--;
				continue;
				}
			}
		if (updated)
			{
			SaveConfig(i);
			Reloads[i]=true;
			}
		}
	//	5:NewCardにあってOldCardにないカードを更新
	for(i in NewCard)
		{
		update=false;
		if (!(i in OldCard))
			{
			Cards[i].Condominium=new Array();
			update=true;
			}
		for(j in NewCard[i].Id)
			{
			for(k in NewCard[i].Id[j].Seq)
				{
				a1=false;
				if (j in OldCard[i].Id)
					{
					if (k in OldCard[i].Id[j].Seq)
						{
						a1=true;
						}
					}
				if (!a1)	//	新しい集合住宅を追加
					{
					obj=new Object();
					obj.Name=j;	//	集合住宅名
					obj.Seq=k;	//	地図番号
					obj.x=0;
					obj.y=0;
					Cards[i].Condominium.push(obj);
					update=true;
					}
				}
			}
		if (update)
			{
			SaveConfig(i);
			Reloads[i]=true;
			}
		}
	ReadBuilding(num);
	CountCondominiums();	//	カウントしなおす
	for(i in Reloads)
		{
		LoadCard(i);
		}
	MENU1PBig(num,seq);
	}
//--------------------------------------------------------------------
//　集合住宅の中にある、対象地図番号の階一覧を取得
//--------------------------------------------------------------------
function SearchCondominium(bobj,num,seq)
	{
	var result=new Object();
	result.floors=new Array();
	result.rooms=0;
	var i1,i2,i3,i4,i5;
	var o1,o2,o3,o4,o5;
	var tgt=num+"-"+seq;
	for(i1 in bobj.sequence)
		{
		o1=bobj.sequence[i1];
		for(i2 in o1.stair)
			{
			o2=o1.stair[i2];
			for(i3 in o2.floor)
				{
				o3=o2.floor[i3];
				if (!("moved" in o3)) continue;
				if (o3.moved!=tgt) continue;
				result.floors.push(o3.id);
				result.rooms+=parseInt(o3.rooms,10);
				}
			}
		}
	return result;
	}

//--------------------------------------------------------------------
//　対象地図(num)の集合住宅軒数をカウントする
//--------------------------------------------------------------------
function CountCondominiums()
	{
	var i,j,k;
	var c,dir,files,file,fullpath,ext,tmp;
	var o1,o2,o3,o4;
	var c1,c2,c3,c4;
	var p1,p2,p3,p4;
	var mvc,flg;

	Condominiums=new Array();
	dir=fso.GetFolder(ApartFolder());
	files=new Enumerator(dir.Files);

	for(; !files.atEnd(); files.moveNext())
		{
		file=files.item().Name+"";
		fullpath=ApartFolder()+file;
		ext=fso.GetExtensionName(file).toLowerCase();
		if (ext!="xml") continue;
		tmp=ReadXMLFile(fullpath,false);
		if (tmp=="") continue;
		try	{
			if (!("Type" in tmp)) continue;		//	集合住宅の定義がない（旧フォーマット）
			}
		catch(e)
			{
			continue;
			}
		c=parseInt(tmp.Type,10);
		if (c!=2) continue;			//	集合住宅でない

		o1=tmp.building[0].sequence;
		flg=new Array();
		for(p1 in o1)	//	棟ループ
			{
			o2=o1[p1].stair;
			for(p2 in o2)	//	階段ループ
				{
				o3=o2[p2].floor;
				for(p3 in o3)	//	階ループ
					{
					o4=o3[p3];
					if (!("moved" in o4)) continue;
					mvc=o4.moved.split("-");
					i=parseInt(mvc[0],10);
					j=parseInt(mvc[1],10);
					k=parseInt(o4.rooms,10);
					if (!(i in Condominiums))
						{
						Condominiums[i]=new Object();
						Condominiums[i].Buildings=0;
						Condominiums[i].Rooms=0;
						Condominiums[i].Seq=new Array();
						}
					if (!(j in Condominiums[i].Seq))
						{
						Condominiums[i].Seq[j]=0;
						}
					Condominiums[i].Rooms+=k;
					Condominiums[i].Seq[j]+=k;
					if (!(i in flg))
						{
						flg[i]=true;
						Condominiums[i].Buildings++;
						}
					}
				}
			}
		}
	}
