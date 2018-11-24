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
	PrintForm+="<body style='font-family:ＭＳ Ｐゴシック;font-size:12px;'>\nPRINTBODY\n</body>\n</html>";
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
	/*	ログ読込------------------------------------------*/
	var log=LoadLog(congnum,num);
	l=log.History.length-1;
	if (l<=0) return "";
	Cards[num].Status=log.Status;				//	現在の状態
	Cards[num].Rent=log.Latest.Rent;			//	最終貸出日
	Cards[num].Limit=log.Latest.Limit;			//	終了期限
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

	/*	拒否の情報を更新------------------------------------*/
	var d,tp,s2,s3;
	var t=clone(Cards[num].RTB);
	var l,nst;
	l=log.History.length-1;

	for(i=0;i<t.length;i++)
		{
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
		s3=parseInt(log.Latest.Rent.substring(0,4),10)*12+parseInt(log.Latest.Rent.substring(4,6),10);
		//　２年を経過していれば確認
		if ((s3-s2)>=24) t[i].KBN1="確認";
		}
	Cards[num].RTB=clone(t);

	//	ビル情報の読込 ------------------------------------------
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
		jc.building[0].map=parseInt(j.Seq,10);	//	配置先の地図番号
		jc.building[0].Condominium=true;
		jc.building[0].SourceNum=jc.Num;
		jc.building[0].SourceSeq=jc.Seq;
		Building.building.push(jc.building[0]);
		}

	//	マーカー情報の読込(Markers) ---------------------------------------
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
