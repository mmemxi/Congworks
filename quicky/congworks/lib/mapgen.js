//----------------------------------------------------------------
function LoadSpots(congnum)
	{
	Spots=ReadJSON(congnum,"spots","");
	}
//----------------------------------------------------------------
function PublishPDF(html,outfilename)
	{
	var s=basepath+qt+"publish.html";
	var adTypeBinary=1;
	var adTypeText=2;
	var bin;
	var PrintForm;
	PrintForm="<html>\n<head>\n<meta http-equiv=\"content-type\" content=\"text/html;charset=UTF-8\">\n</head>\n";
	PrintForm+="<body style='font-family:�l�r �o�S�V�b�N;font-size:12px;'>\nPRINTBODY\n</body>\n</html>";
	html=PrintForm.replace("PRINTBODY",html);
	adodb.Type=adTypeText;
	adodb.Charset='UTF-8';
	adodb.Open();
	adodb.WriteText(html);
	adodb.Position=0;
	adodb.Type=adTypeBinary;
	adodb.Position=3;
	bin=adodb.Read();
	adodb.close();
	adodb.Type=adTypeBinary;
	adodb.Open();
	adodb.Write(bin);
	adodb.SaveToFile(basepath+qt+"qtemp.html",2);
	adodb.Close();
	var cmd="\""+SysFolder()+"webkit"+qt+"wkhtmltopdf\" --quiet --encoding UTF-8 --disable-smart-shrinking qtemp.html \""+outfilename+"\"";
	WshShell.Run(cmd,0,true);
	}
//----------------------------------------------------------------
function LoadCard(congnum,num)
	{
	var obj=SQ_Read("Cards","congnum="+congnum+" and num="+num,"");
	Cards[num]=GetCardInfo(obj[0]);
	/*	���O�Ǎ�------------------------------------------*/
	var log=LoadLog(congnum,num);
	l=log.History.length-1;
	if (l<=0) return "";
	Cards[num].Status=log.Status;				//	���݂̏��
	Cards[num].Rent=log.Latest.Rent;			//	�ŏI�ݏo��
	Cards[num].Limit=log.Latest.Limit;			//	�I������
	if (l<=0)
		{
		Cards[num].BeforeStart="?";
		Cards[num].BeforeEnd="?";
		Cards[num].Nisu1="?";
		Cards[num].Nisu2="?";
		Cards[num].NisuAvr="?";
		}
	else{
		Cards[num].BeforeStart=log.History[l-1].Rent;
		Cards[num].BeforeEnd=log.History[l-1].End;
		Cards[num].Nisu1=CalcDays(log.History[l-1].Rent,log.Latest.Rent);
		Cards[num].Nisu2=CalcDays(log.History[l-1].End,log.Latest.Rent);
		Cards[num].NisuAvr=Math.floor((Cards[num].Nisu1+Cards[num].Nisu2)/2);
		}

	/*	���ۂ̏����X�V------------------------------------*/
	var d,tp,s2,s3;
	var t=clone(Cards[num].RTB);
	var l,nst;
	l=log.History.length-1;

	for(i=0;i<t.length;i++)
		{
		if (t[i].KBN1!="����") continue;
		//	�Ԋu��������ꍇ
		if ("Frequency" in t[i])
			{
			tp=parseInt(t[i].Frequency,10);
			if (tp!=0)
				{
				if (parseInt(t[i].Cycle,10)>=tp)
					{
					t[i].KBN1="�Ԋu";
					continue;
					}
				}
			}
		if ("LastConfirm" in t[i]) d=t[i].LastConfirm+"";else d=t[i].Date+"";
		s2=parseInt(d.substring(0,4),10)*12+parseInt(d.substring(4,6),10);
		s3=parseInt(log.Latest.Rent.substring(0,4),10)*12+parseInt(log.Latest.Rent.substring(4,6),10);
		//�@�Q�N���o�߂��Ă���Ίm�F
		if ((s3-s2)>=24) t[i].KBN1="�m�F";
		}
	Cards[num].RTB=clone(t);

	//	�r�����̓Ǎ� ------------------------------------------
	Building=ReadXMLFile(NumFolder(congnum,num)+"building.xml",true);
	if (Building=="")	Building=new Object();
	if (!("building" in Building))	Building.building=new Array();

	for(i=0;i<Cards[num].Condominium.length;i++)
		{
		j=Cards[num].Condominium[i];
		jc=ReadXMLFile(ApartFolder(congnum,num)+j.Name+".xml",true);
		jc.building[0].left=parseInt(j.x,10);
		jc.building[0].top=parseInt(j.y,10);
		jc.building[0].moved=true;
		jc.building[0].map=parseInt(j.Seq,10);	//	�z�u��̒n�}�ԍ�
		jc.building[0].Condominium=true;
		jc.building[0].SourceNum=jc.Num;
		jc.building[0].SourceSeq=jc.Seq;
		Building.building.push(jc.building[0]);
		}

	//	�}�[�J�[���̓Ǎ�(Markers) ---------------------------------------
	var c;
	obj=ReadXMLFile(NumFolder(congnum,num)+"marker.xml",true);
	if (obj=="")
		{
		obj=new Object();
		obj.Map=new Array();
		}
	if (!("Map" in obj))
		{
		obj.Map=new Array();
		}
	Markers=new Object();
	Markers.Map=new Array();
	c=0;
	for(i in obj.Map)
		{
		if ("Id" in obj.Map[i])
			{
			j=parseInt(obj.Map[i].Id,10);
			Markers.Map[j]=clone(obj.Map[i]);
			if (!("Points" in Markers.Map[j])) Markers.Map[j].Points=new Array();
			c+=Markers.Map[j].Points.length;
			}
		}
	Markers.Count=c;
	}
