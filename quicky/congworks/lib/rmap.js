// =======================================================
function CreateRMAP(congnum,num,seq,rmode)
	{
	var s,x,y,z,i,j,v,lbl;
	var ax,ay,x1,x2,y1,y2;
	var ix,iy,ixf,py1,py2,px1,px2;
	var sp1="",sp2="";
	var obj=new Array();
	var Rvml=new Poly();
	var novml=false;

	if (!("Clip" in Cards[num]))
		{
		return "";
		}
	if (!(seq in Cards[num].Clip))
		{
		return "";
		}
	if (!("Area" in Cards[num].Clip[seq]))
		{
		return "";
		}
	var vml=Cards[num].Clip[seq].Area;		//	地図の範囲表示
	var ContainCondominium=new Array();
	var BTB;								//	特記情報
	var rck="";								//	要確認欄の内容
	var wx1,wx2,wy1,wy2;					//	表示ウィンドゥの四隅のグローバル座標
	var vt,vr,vx,vy,vz;

	Rvml.mapsize=1;
	Rvml.width=RMAP_VX;
	Rvml.height=RMAP_VY;

	//	表示ウィンドゥの位置（登録値）
	x=parseInt(Cards[num].Clip[seq].Left,10);
	y=parseInt(Cards[num].Clip[seq].Top,10);
	z=parseInt(Cards[num].Clip[seq].Zoom,10);
	vz=z/100;

	//	表示ウィンドゥの表示範囲（グローバル座標）
	wx1=Math.floor(x/vz);
	wx2=wx1+Math.floor(RMAP_Width/vz)-1;
	wy1=Math.floor(y/vz);
	wy2=wy1+Math.floor(RMAP_Height/vz)-1;

	//	地図上のエリア表示（座標を変換）
	if (vml.indexOf("vml:",0)==-1) novml=true;
	else
		{
		s=vml.replace("vml:","");
		vt=s.split(" ");
		for(i=0;i<vt.length;i++)
			{
			vr=vt[i].split(",");
			vx=parseInt(vr[0],10);
			vy=parseInt(vr[1],10);
			vx-=wx1;vx=Math.floor(vx*vz*0.7);
			vy-=wy1;vy=Math.floor(vy*vz*0.7);
			vt[i]=vx+","+vy;
			}
		vml="vml:"+vt.join(" ");
		Rvml.AddObject(vml,"","",1,1,"");
		}

	//	これが集合住宅の区域であれば、そこに含まれている集合住宅名を保持しておく
	if (Cards[num].MapType==1)
		{
		for(i=0;i<Cards[num].Condominium.length;i++)
			{
			if (Cards[num].Condominium[i].Seq!=seq) continue;
			s=Cards[num].Condominium[i].Name;
			ContainCondominium[s]=true;
			}
		}

	//	スポット文字列の作成(sp1=説明表示 sp2=スポット数字)
 	j=0;
	for(i=0;i<Spots.length;i++)
		{
		s=Spots[i].name;
		if (fso.FileExists(ApartFolder(congnum)+s+".xml"))				//	スポット名は集合住宅名である
			{
			if (Cards[num].MapType!=1) continue;		//	通常地図には集合住宅名を表記しない
			if (!(s in ContainCondominium)) continue;	//	この地図には含まれない集合住宅は飛ばす
			}
		else{
			if (Cards[num].MapType==1) continue;		//	集合住宅地図には通常スポットを印字しない
			}
		ax=Spots[i].x;
		ay=Spots[i].y;
		if ((ax<wx1)||(ax>wx2)||(ay<wy1)||(ay>wy2)) continue;
		obj[j]=new Object();
		obj[j].seq=i;
		obj[j].x=Math.floor((ax-wx1)*(z/100))-10;
		obj[j].y=Math.floor((ay-wy1)*(z/100))-6;
		obj[j].name=Spots[i].name;
		j++;
		}
	obj.sort(SortSpots);
	sp1="<table border=0 cellpadding=2 cellspacing=0>";
	for(i=0;i<obj.length;i++)
		{
		if (i>15) break;	//	スポットは１５個まで
		j=obj[i].seq;
		lbl=obj[i].name;
		sp1+="<tr><td style='width:58mm;font-size:14px;'>";
		if (i<20) sp1+=nums.charAt(i);else sp1+=(i+1)+"";
		sp1+=":</span>"+lbl+"</td></tr>";
		if (((i+1) % 15)==0) sp1+="</table></td>";
		sp2+="<div style='position:absolute;left:"+obj[i].x+"px;top:"+obj[i].y+"px;";
		if (lbl in ContainCondominium)
			{
			sp2+="font-weight:bold;";
			sp2+="color:#ff0000;";
			}
		sp2+="margin:0px;padding:0px;border:0px;font-size:20px;filter:glow(color=#ffffff,strength=3);'>";
		if (i<20) sp2+=nums.charAt(i);else sp2+=(i+1)+"";
		sp2+="</div>";
		}
	sp1+="</table>";

	//	裏面タイトル
	s="\n<div style='font-size:26px;font-family:HG丸ｺﾞｼｯｸM-PRO;width:180mm;' align=center>№"+num+"「"+Cards[num].name+"」"+nums.charAt(seq-1)+"の周辺地図</div>\n\n";

	//	裏面地図の枠
	s+="<div style='position:absolute;z-index:1;top:10mm;left:0mm;";
	s+="width:"+RMAP_Width+"px;height:"+RMAP_Height+"px;border:5px ridge black;";
	s+="overflow:hidden;background-color:#aaaaaa;zoom:70%;'>\n\n";

	//	スポット項目
	s+="<div id='SPOT' style='position:absolute;z-index:3;top:0px;left:0px;'>";
	s+=sp2+"</div>\n\n";

	//	マップを構築
	s+="<div id='FRAME' style='zoom:"+z+"%;position:absolute;left:0px;top:0px;z-index:2;width:"+RMAP_VX+"px;height:"+RMAP_VY+"px;'>\n";
	for(iy=0;iy<=15;iy++)
		{
		py1=iy*511;py2=(iy+1)*511-1;
		if ((py1>wy2)||(py2<wy1)) continue;
		for(ix=0;ix<=05;ix++)
			{
			px1=ix*540;px2=(ix+1)*540-1;
			if ((px1>wx2)||(px2<wx1)) continue;
			s+="<img src='./data/"+congnum+"/all/monofull/"+FixValue(ix,2)+"-"+FixValue(iy,2)+".jpg'";
			s+=" style='position:absolute;left:"+(px1-wx1)+"px;top:"+(py1-wy1)+"px;'>\n";
			}
		}
	s+="</div>\n</div>\n\n";

	//	マップエリアＳＶＧを表示
	if (!novml)
		{
		s+="<div style='position:absolute;z-index:6;top:8mm;left:1mm;border:0px;";
		s+="width:"+RMAP_Width+"px;height:"+RMAP_Height+"px;overflow:hidden;'>\n";
		s+="<div style='position:absolute;top:0px;left:0px;'>\n";
		s+=Rvml.Draw(false);
		s+="\n</div>\n</div>\n";
		}

	//	スポット説明文を追加
	s+="<div style='position:absolute;z-index:4;top:10mm;left:128mm;'>";
	s+=sp1+"</div>\n\n";

	//	要確認情報欄(rmode:0=印字しない 1=要確認 2=メモ欄)
	s+="<div style='position:absolute;z-index:4;top:128mm;left:0mm;border:3px black dashed;'>\n";
	s+="<img src='sys/blank.gif' style='width:186mm;height:130mm;'></div>\n";
	if (rmode==1)
		{
		s+="<div style='position:absolute;z-index:4;top:131mm;left:3mm;font-size:20px;font-family:HG丸ｺﾞｼｯｸM-PRO;'>要確認の詳細：</div>\n";
		}
	if (rmode==2)
		{
		s+="<div style='position:absolute;z-index:4;top:131mm;left:3mm;font-size:20px;font-family:HG丸ｺﾞｼｯｸM-PRO;'>メモ：</div>\n";
		}
	//	要確認情報を追加
	if (rmode==1)
		{
		rchk="<div style='position:absolute;z-index:5;top:138mm;left:3mm;font-size:14px;width:160mm;'>";
		BTB=Cards[num].RTB;
		for(i=0;i<BTB.length;i++)
			{
			if (BTB[i].Num!=seq) continue;
			if ((BTB[i].KBN1!="確認")&&(BTB[i].KBN1!="間隔")) continue;
			rchk+="●"+BTB[i].Name;
			if (BTB[i].Person!="") rchk+="[立場："+BTB[i].Person+"]";
			rchk+="(最終確認：";
			if ("LastConfirm" in BTB[i])
				{
				if (BTB[i].LastConfirm<BTB[i].Date) rchk+=SplitDate(BTB[i].Date);
				else rchk+=SplitDate(BTB[i].LastConfirm);
				}
			else 	{
					if (BTB[i].Date!="20100101") rchk+=SplitDate(BTB[i].Date);
					else rchk+="不明";
					}
			rchk+=")";
			if ("Frequency" in BTB[i])
				{
				if (BTB[i].Frequency!=0)
					{
					rchk+="訪問頻度："+BTB[i].Frequency+"回に1回";
					}
				}
			rchk+="<br>";
			rchk+=BTB[i].Reason+"<br>";
			if (BTB[i].Confirm!="") rchk+="追記："+BTB[i].Confirm+"<br>";
			rchk+="<br>";
			}
		rchk+="</div>\n";
		s+=rchk;
		}
	return s;
	
	}

function SortSpots(a,b)
	{
	if (a.y<b.y) return -1;
	if (a.y>b.y) return 1;
	if (a.x<b.x) return -1;
	if (a.x>b.x) return 1;
	return 0;
	}
