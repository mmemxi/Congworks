//------------------------------------------------------------------------------------
//	�T�}���[�֌W�̃v���O�����Q
//------------------------------------------------------------------------------------
function CreateSummaryofApartment(congnum)
	{
	var afile=SummaryFolder(congnum)+"apartment.txt";
	var f,f1,s,i,j,k,l;
	var num,BTB,sds,sts,atbl,str,kubun;
	var ary=new Array();
	var alogs=new Array();
	var tbl,obj,num;
	f=fso.CreateTextFile(afile,true);

	//	���ꗗ�̓Ǎ�
	var obj=SQ_Read("Cards","congnum="+congnum,"num");
	for(l=0;l<obj.length;i++)
		{
		tbl=GetCardInfo(obj[l]);
		num=parseInt(tbl.num,10);
		kubun=tbl.kubun;					//	�Q�ꕪ��
		BTB=clone(tbl.RTB);
		for(i in BTB)
			{
			if (BTB[i].KBN1!="�W���C���^�[�z��") continue;
			sds=ApartFolder(congnum)+BTB[i].Name+".txt";		//	sds=�A�p�[�g�̃��O�t�@�C��
			if (!fso.FileExists(sds))	//	�܂����O�t�@�C�����Ȃ��Ȃ�쐬����
				{
				f1=fso.CreateTextFile(sds,true);
				f1.close();
				}
			s=ReadFile(sds);
			if (s=="") sts="";
			else{
				ary=s.split(/\r\n/);
				j=ary.length-1;
				if (ary[j]=="") j--;
				sts=ary[j];
				}
			if (sts=="")	sts=",,,,";
			//	���ԍ�,�n�}�ԍ�,������,�����ԍ�,����,�Q��敪,�g�p�Җ�,�g�p�J�n��,�g�p�I����,�g�p����
			str=num+","+BTB[i].Num+","+BTB[i].Name+","+i+","+BTB[i].Person+","+kubun;
			str+=","+sts;
			f.WriteLine(str);
			}
		}
	f.close();
	}
//------------------------------------------------------------------------------------
// �l�p�T�}���쐬�iQuicky�ƈႢ�A��ɂP�̋�悾����ΏۂƂ��A�߂�l�͂Ȃ��j
//------------------------------------------------------------------------------------
function CreateSummaryofPerson(congnum,num)
	{
	var mapnum,mnum,i,j,vhist,s,ss,str,f,tmk,log;
	var card,obj,cobj,mobj,tmk,c;
	var bfile=SummaryFolder(congnum)+"person.txt";
	var ary1=new Array();
	var ary2=new Array();
	s="";ss="";f="";

	//	���s�T�}����ǂ�(ary1)�A�Ώۋ�懂�̍s�����O�����V�e�[�u��(ary2)�����B
	s=ReadFile(bfile);
	ary1=s.split("\r\n");
	j=0;
	for(i=0;i<ary1.length;i++)
		{
		if ((ary1[i].indexOf(num+",",0)!=0)&&(ary1[i]!=""))
			{
			ary2[j]=ary1[i];
			j++;
			}
		}
	j--;

	//	�Ώۂ̋��̏ڍדǍ�
	obj=SQ_Read("Cards","congnum="+congnum+" and num="+num,"");
	if (obj.length==0)
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
		}
	cobj=GetCardInfo(obj[0]);
	card=new Object();
	card.count=cobj.count;	//	�n�}����
	card.name=cobj.name;	//	��於
	card.kubun=cobj.kubun;	//	���敪

	//	�Ώۂ̋��̃��O�Ǎ�
	log=LoadLog(congnum,num);
	if (log=="")
		{
		card.NowUsing=false;
		card.lastuse="00000000";
		}
	else{
		if (!("Status" in log))
			{
			card.NowUsing=false;
			card.lastuse="00000000";
			}
		else{
			if (log.Status=="Using")
				{
				card.NowUsing=true;
				card.Limit=log.Latest.Limit;
				card.lastuse=log.Latest.Rent;
				}
			else{
				card.NowUsing=false;
				card.lastuse=log.Latest.Rent;
				}
			}
		}

	//	�Ώۂ̋�悪�g�p���łȂ����A�L�����y�[�����ł���Ƃ��A�o�͂��Ă���ŏI���
	if ((!card.NowUsing)||(isCampeign(card.lastuse)))
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
		}

	//	�}�[�J�[���̓Ǎ�
	mobj=ReadXMLFile(NumFolder(congnum,num)+"marker.xml",true);
	if (mobj=="")
		{
		mobj=new Object();
		mobj.Map=new Array();
		}
	if (!("Map" in mobj))
		{
		mobj.Map=new Array();
		}
	tmk=new Object();
	tmk.Map=new Array();
	c=0;
	for(i in mobj.Map)
		{
		if ("Id" in mobj.Map[i])
			{
			j=parseInt(mobj.Map[i].Id,10);
			tmk.Map[j]=clone(mobj.Map[i]);
			if (!("Points" in tmk.Map[j])) tmk.Map[j].Points=new Array();
			c+=tmk.Map[j].Points.length;
			}
		}
	tmk.Count=c;

	//	�Ώۂ̃}�[�J�[���O�̂Ƃ��A�I��
	if (tmk.Count<1)
		{
		f=fso.CreateTextFile(bfile,true);
		str=ary2.join("\r\n");
		f.Write(str);
		f.close();
		return;
		}

	//	�n�}���ƂɗL���}�[�J�[���𐔂���
	mapnum=parseInt(card.count,10);
	mmap=new Array();
	for(i=1;i<=mapnum;i++)
		{
		mmap[i]=new Object();
		mmap[i].Count=0;
		mmap[i].Using=false;
		mmap[i].User="";
		}
	for(i in tmk.Map)
		{
		for(j=0;j<tmk.Map[i].Points.length;j++)
			{
			vhist=parseInt(tmk.Map[i].Points[j].History,10);
			if (vhist!=2) continue;
			mmap[i].Count++;
			if (tmk.Map[i].User!="")
				{
				mmap[i].Using=true;
				mmap[i].User=tmk.Map[i].User;
				}
			}
		}

	for(j=1;j<=mapnum;j++)
		{
		if (mmap[j].Count==0) continue;
		s=num+","+j+","+card.name+","+card.kubun+","+mmap[j].Count+","+card.Limit+","+mmap[j].User;
		ary2.push(s);
		}

	f=fso.CreateTextFile(bfile,true);
	str=ary2.join("\r\n");
	f.Write(str);
	f.close();
	}
