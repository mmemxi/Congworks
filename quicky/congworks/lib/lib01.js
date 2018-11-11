//----------------------------------------------------------------
// 地図印刷１：会衆用地図の印刷
//----------------------------------------------------------------
function MapGen_Public(congnum,num,seq,outfilename)
	{
	var html="";
	var i;
	LoadSpots(congnum);
	if (!isCampeign(Cards[num].Rent))	//	キャンペーン中は除外する
		{
		SetMarkersToBuilding(0);	//	ビル情報に会衆用地図のマーカー反映
		}

	if (seq==0)
		{
		for(i=1;i<=Cards[num].count;i++)
			{
			//	表面
			html+="<div style='position:relative;width:210mm;height:250mm;page-break-after:always;'>";
			html+=MapGen_Public_Exec(congnum,num,i);
			html+="</div>";
			//	裏面
			html+="<div style='position:relative;width:210mm;height:250mm;page-break-after:";
			if (i==Cards[num].count) html+="avoid";else html+="always";
			html+=";'>"+CreateRMAP(congnum,num,i,1);
			html+="</div>";
			}
		}
	else{
		//	表面
		html+="\n<div style='position:relative;width:210mm;height:250mm;page-break-after:always;'>";
		html+=MapGen_Public_Exec(congnum,num,seq);
		html+="</div>\n";
		//	裏面
		html+="\n<div style='position:relative;width:210mm;height:250mm;page-break-after:avoid;'>";
		html+=CreateRMAP(congnum,num,seq,1);
		html+="</div>\n";
		}
	PublishPDF(html,outfilename);
	}
//----------------------------------------------------------------
function MapGen_Public_Exec(congnum,num,seq)
	{
	var cmd;
	var r,s,s2,s3;
	var x1,y1,x2,y2,wx,wy,zoomx,zoomy,resx,resy,cmd,ix,iy;
	var rx=new Array();
	var base,BTB;
	var myDate=new Date();
	var toDate=new Date();
	var ytbl=new Array("日","月","火","水","木","金","土");
	var yobi="";
	var vml=new Poly();
	var s="",vs;
	var mapimage,headerimage;
	var html="";
	
	if (Cards[num].MapType==0)	mapimage="./data/"+congnum+"/"+num+"/"+seq+".png";
					else		mapimage="./sys/blank.png";
	switch(Cards[num].HeaderType)
		{
		case 1:
			headerimage="./sys/prop/prop01.png";
			break;
		case 2:
			headerimage="./sys/prop/prop02.png";
			break;
		default:
			headerimage="";
			break;
		}

	//	終了期限から曜日を取得
	s=Cards[num].Limit+"";
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
	html+="<div style='position:absolute;top:15mm;left:0mm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;font-size:30px;white-space:nowrap;'>";
	html+="№"+num+"-"+nums.charAt(seq-1)+"　"+Cards[num].name+"</div>";

	if (headerimage!="")
		{
		html+="<div style='position:absolute;top:8mm;left:12cm;z-index:2;'>";
		html+="<img src='"+headerimage+"' style='width:60mm;height:24mm;'></div>";
		}

	html+="<div style='position:absolute;top:230mm;left:10mm;z-index:2;' align=left>";
	html+="<hr style='border-width:1px 0px 0px 0px;height:1px;border-color:black;border-style:dashed;width:175mm;'></div>";
	html+="<div style='position:absolute;top:235mm;left:1cm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;width:20cm;'>";
	html+="<span style='font-size:20px;'>区域変更情報（№"+num+"-"+nums.charAt(seq-1)+"　"+Cards[num].name+"）</span><br>";
	html+="<span style='font-size:12px;'>地図の修正点・訪問拒否の追加変更などがあれば、この部分に記入してください。</span>";
	html+="</div>";
	html+="</div>";

	vml.mapsize=1;
	vml.width=2126;
	vml.height=2362;

	html+="<div style='position:absolute;top:0mm;left:0cm;z-index:2;font-family:Arial Black;font-size:26px;'>";
	html+="有効期限："+SplitDate(Cards[num].Limit)+"("+yobi+")まで</div>";
	html+="<div style='position:absolute;width:180mm;top:265mm;left:0mm;text-align:right;z-index:5;'>";
	html+="<span style='font-size:16px;'>地図返却先：</span>";
	html+="<span style='font-size:28px;'>"+Cards[num].kubun+"</span>";
	html+="</span><span style='font-size:16px;'>フォルダ</span></div>";

	//	前回使用情報
	html+="<div style='position:absolute;z-index:10;top:265mm;left:10mm;z-index:5;'>";
	html+="<span style='font-size:12px;'>";
	html+="今回貸出日："+SplitDate(Cards[num].Rent)+"<br>";
	html+="前回使用："+SplitDate(Cards[num].BeforeStart)+"～"+SplitDate(Cards[num].BeforeEnd);
	html+="("+Cards[num].Nisu2+"～"+Cards[num].Nisu1+"日前/平均"+Cards[num].NisuAvr+"日)";
	html+="</span></div>";

	//	色サンプルの設置
	html+="<div style='position:absolute;top:224mm;left:4mm;z-index:5;font-size:14px;border:2px solid black;padding:4px;background-color:#ff6666;'>拒否</div>";
	html+="<div style='position:absolute;top:224mm;left:18mm;z-index:5;font-size:14px;border:2px solid black;padding:4px;background-color:#ffff66;'>要確認</div>";
	html+="<div style='position:absolute;top:224mm;left:35mm;z-index:5;font-size:14px;border:2px solid black;padding:4px;background-color:#88ffff;'>今回訪問</div>";

	//	ベース部分の配置
	base=html;

	//	画像サイズの取得
	Imgx=680;
	Imgy=756;
	zoomx=Imgx/2126;
	zoomy=Imgy/2362;

	//	特記情報を重ねる
	s="";
	BTB=Cards[num].RTB;
	SetRefusesToBuilding(0,BTB,congnum,num);	//	一般アパート用

	for(i in BTB)
		{
		if (BTB[i].Num!=seq) continue;
		//	網掛けの合成
		if (BTB[i].Position!="")
			{
			switch (BTB[i].KBN1)
				{
				case "拒否":
					vml.AddObject(BTB[i].Position,"","",zoomx,zoomy,"#ff0000");
					break;
				case "確認":
					vml.AddObject(BTB[i].Position,"","",zoomx,zoomy,"#ffff00");
					break;
				case "間隔":
					vml.AddObject(BTB[i].Position,"","",zoomx,zoomy,"#00ffff");
					break;
				default:
					vml.AddObject(BTB[i].Position,"","",zoomx,zoomy,"#88ff88");
					break;
				}
			}
		if (BTB[i].Writing!="")
			{
			ss=BTB[i].Writing+",,,,";
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
		}
	html=base+s;

	//	ビル情報を重ねる
	if (Building!="")
		{
		sb="<div style='position:absolute;top:30mm;left:10mm;z-index:3;'>";
		for(i in Building.building)
			{
			rmap=parseInt(Building.building[i].map,10);
			if (rmap!=seq) continue;
			sb+=CreateBuildingImage(Building.building[i],congnum,num,seq,zoomx,zoomy);
			}
		sb+="</div>";
		html+=sb;
		}

	v="<div style='position:absolute;top:30mm;left:10mm;z-index:5;'>";
	v+=vml.Draw(false)+"</div>";		//	Webkit
	html+=v;

	//	マーカー情報の合成
	if (!isCampeign(Cards[num].Rent))	//	キャンペーン中は除外する
		{
		v="<div style='position:absolute;top:30mm;left:10mm;z-index:5;'>";
		vs=DrawMarker(Markers,seq,zoomx,zoomy,1);
		v+=vs+"</div>";
		if (vs!="")
			{
			html+="<div style='position:absolute;top:226mm;left:6cm;z-index:2;font-family:HG丸ｺﾞｼｯｸM-PRO;'>";
			html+="<span style='font-size:16px;'>★のついた家は訪問しないでください</span></div>";
			}
		html+=v;
		}

	//	コメント情報の合成
	bufs="<div style='position:absolute;top:30mm;left:10mm;z-index:5;'>";
	for(cp=0;cp<Cards[num].Comments.length;cp++)
		{
		cm=Cards[num].Comments[cp];
		cmx=Math.floor(parseInt(cm.Left,10)*zoomx);
		cmy=Math.floor(parseInt(cm.Top,10)*zoomy);
		cmz=Math.floor(parseInt(cm.Size,10)*zoomy);
		if (cmy==-1) continue;
		bufs+="<div style='position:absolute;z-index:5;white-space:nowrap;font-size:"+cmz+"px;color:#0000ff;";
		bufs+="left:"+cmx+"px;top:"+cmy+"px;";
		bufs+="'>";
		cms=cm.Text;
		while(1==1)
			{
			if (cms.indexOf("@br@",0)==-1) break;
			cms=cms.replace("@br@","<br>");
			}
		bufs+=cms+"</div>";
		}
	bufs+="</div>";
	html+=bufs;
	return html;
	}

