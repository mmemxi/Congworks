//----------------------------------------------------------------
// 地図印刷３：個人用集中インターホン地図の印刷
//----------------------------------------------------------------
function MapGen_Apart(congnum,num,seq,id,outfilename)
	{
	var html="";
	var i;
	LoadSpots(congnum);
	//	表面
	html+="\n<div style='position:relative;width:210mm;height:250mm;page-break-after:always;'>";
	html+=MapGen_Apart_Exec(congnum,num,seq,id);
	html+="</div>\n";
	//	裏面
	html+="\n<div style='position:relative;width:210mm;height:250mm;page-break-after:avoid;'>";
	html+=CreateRMAP(congnum,num,seq,2);
	html+="</div>\n";
	PublishPDF(html,outfilename);
	}
//----------------------------------------------------------------
function MapGen_Apart_Exec(congnum,num,seq,bid)
	{
	var cmd;
	var r,p1,p2,text,name,id,s,i,j,overday;
	var x1,y1,x2,y2,wx,wy,zoomx,zoomy,resx,resy,cmd,ix,iy;
	var rx=new Array();
	var base,BTB;
	var myDate=new Date();
	var ytbl=new Array("日","月","火","水","木","金","土");
	var yobi="";
	var mapsize=0;
	var vml=new Poly();
	var mapimage;
	var ifile;
	var html="";

	if (Cards[num].MapType==0)	mapimage="./data/"+congnum+"/"+num+"/"+seq+".png";
					else		mapimage="./sys/blank.png";

	BTB=Cards[num].RTB;
	id=0;
	for(i=0;i<BTB.length;i++)
		{
		if (BTB[i].Name==bid){id=i;break;}
		}
	ABuilding=ReadXMLFile(ApartFolder(congnum)+bid+".xml",true);
	name=Cards[num].name;

	//	終了期限の取得
	var ary=new Array();
	var atbl=new Array();
	pfile=ApartFolder(congnum)+bid+".txt";
	s=ReadFile(pfile);
	if (s=="") overday="";
	else{
		ary=s.split(/\r\n/);
		j=ary.length-1;
		if (ary[j]=="") j--;
		atbl=ary[j].split(",");
		overday=atbl[3];	//	終了期限
		}

	//	終了期限から曜日を取得
	s=overday;
	myDate.setFullYear(s.substring(0,4));
	myDate.setMonth(parseInt(s.substring(4,6),10)-1);
	myDate.setDate(s.substring(6,8));
	yobi=ytbl[myDate.getDay()];

	html="<div style='position:absolute;top:0px;left:0px;z-index:0;'>";
	marginx=38;		//	10mm;
	marginy=113;	//	30mm;
	html+="<div style='position:absolute;top:30mm;left:10mm;z-index:1;'>";
	html+="<img src='"+mapimage+"' style='width:180mm;height:200mm;'>";		//	680x756px
	html+="</div>";
	html+="</div>";

	vml.mapsize=1;
	vml.width=2126;
	vml.height=2362;


	html+="<div style='position:absolute;top:15mm;left:1cm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;font-size:32px;'>";
	html+=BTB[id].Name;
	html+="<span style='font-size:20px;'>";
	if (BTB[id].Person!="") html+="（"+BTB[id].Person+"件）";else html+="（???件）";
	html+="</span></div>";

	html+="<div style='position:absolute;top:0mm;left:0cm;z-index:2;font-family:Arial Black;font-size:26px;'>";
	html+="有効期限："+SplitDate(overday)+"("+yobi+")まで</div>";

	html+="<div style='position:absolute;top:230mm;left:10mm;z-index:2;' align=left>";
	html+="<hr style='border-width:1px 0px 0px 0px;height:1px;border-color:black;border-style:dashed;width:175mm;'></div>";
	html+="<div style='position:absolute;top:235mm;left:1cm;width:175mm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;font-size:16px;'>";
	html+="訪問についての情報：（追加事項があれば記入してください）<br>"+BTB[id].Reason+"</div>";

	html+="<div style='position:absolute;top:260mm;left:1cm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;font-size:24px;'>";
	html+="№"+num+"-"+nums.charAt(seq-1)+"　"+name+"<br>";
	html+="<hr style='border-width:1px 0px 0px 0px;height:1px;border-color:black;border-style:dashed;width:175mm;'></div>";

	//	画像サイズの取得
	Imgx=680;
	Imgy=756;
	zoomx=Imgx/2126;
	zoomy=Imgy/2362;

	//	特記情報を重ねる
	i=id;
	s="";
		//	網掛けの合成
		if (BTB[i].Position!="")
			{
			vml.AddObject(BTB[i].Position,"","",zoomx,zoomy,"#88ff88");
			}
		if (BTB[i].Writing!="")
			{
			ss=BTB[i].Writing+",,,";
			rx=ss.split(",");
			wstr=rx[0];
			wsize=Math.ceil(parseInt(rx[1],10)*zoomx);
			x1=parseInt(rx[2],10);
			y1=parseInt(rx[3],10);
			
			tts="<span style='font-size:"+wsize+"px;white-space:nowrap;'>"+wstr+"</span>";
			//	未コーディング
			/*
			TEST.innerHTML=tts;
			tx=TEST.offsetWidth;
			ty=TEST.offsetHeight;
			*/
			tx=100;ty=100;	//暫定
			if (tx>ty) tw=tx;else tw=ty;
			ix=Math.round(x1*zoomx)+marginx;
			iy=Math.round(y1*zoomy)+marginy;
			
			s+="<div style='position:absolute;z-index:5;font-size:"+wsize+"px;white-space:nowrap;width:"+tw+"px;height:"+tw+"px;";
			s+="left:"+ix+"px;top:"+iy+"px;";
			s+="'>"+wstr+"</div>";
			if (rx[4]!="")
				{
				ss=rx[4];
				while(1==1)
					{
					if (ss.indexOf("&",0)==-1) break;
					ss=ss.replace("&",",");
					}
				vml.AddArrow(ss,zoomx,zoomy,true);
				}
			}
	html+=s;

	//	ビル情報を重ねる
	if (ABuilding!="")
		{
		html+="<div style='position:absolute;top:30mm;left:10mm;z-index:3;'>";
		html+=CreateBuildingImage(ABuilding.building[0],congnum,num,seq,zoomx,zoomy);
		html+="</div>";
		}
	v="<div id='VMLOBJ' style='position:absolute;top:30mm;left:10mm;z-index:5;'>";
	v+=vml.Draw(false)+"</div>";	//	Webkit
	html+=v;
	return html;
	}
