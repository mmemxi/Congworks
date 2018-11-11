//-------------------------------------------------------------------------------------
// Quicky XML Parser 1.00
//-------------------------------------------------------------------------------------
function ReadXMLFile(filename,force)
	{
	var GetObj=new Object();	//	この関数の戻り値
	var p,p1,stream,xml,e;
	GetObj=new Object();

	if (!fso.FileExists(filename)) return "";
	stream=fso.OpenTextFile(filename,1,false,-2);
	try	{
		xml=stream.ReadAll();
		}
	catch(e)
		{
		xml="";
		}
	stream.Close();
	if (xml=="") return "";

	xml=xml.replace(/\r/g,"");
	xml=xml.replace(/\n/g,"");
	xml=xml.replace(/<br>/g,"");

	p=xml.indexOf("<?xml",0);
	p1=xml.indexOf("?>",0);
	if ((p!=-1)&&(p1!=-1))
		{
		xml=xml.substring(p1+1,xml.length);
		}
	if (xml.indexOf("<Object",0)==-1)
		{
		xml="<Object>"+xml+"</Object>";
		}
	ExtractXML(filename,GetObj,xml,0,force);
	if (force)
		{
		return GetObj.Object[0];
		}
	return GetObj.Object;
	}

function WriteXMLFile(PutObj,filename)
	{
	var fc;
	var PutXML="<?xml version=\"1.0\" encoding=\"Shift_JIS\"?>";
	var i,j,obj;
	if (PutObj=="")
		{
		fc=fso.CreateTextFile(filename,true,false);
		fc.close();
		return;
		}
	PutXML+=MergeXML("Object",PutObj,"",false);
	try	{
		fc=fso.CreateTextFile(filename,true,false);
		fc.Write(PutXML);
		fc.close();
		}
	catch(e)
		{
		alert("WriteXML Error:("+filename+")");
		}
	}
//-------------------------------------------------------------------------------------
function ExtractXML(filename,retObj,xml,pos,force)
	{
	var i,j,k,isArray;
	var error=false;
	var t1,t2,ch;
	var p,p1,p2,p3,p4;
	var tbl,tag,fld,flds,fieldname,fieldvalue;
	var nowtag="",nowobj;
	var body;
	var childObj;
	var setto;

	if (xml=="")	return 0;
	//開始タグの検索-----------------------------------------------
	p1=xml.indexOf("<",pos);
	if (p1==-1)					//	開始タグが見つからない
		{
		XMLError(filename,"開始タグが見つからない");
		return 0;
		}
	p2=xml.indexOf(">",p1+1);
	if (p2==-1) 				//	開始タグが閉じていない
		{
		XMLError(filename,"開始タグが閉じていない");
		return 0;
		}
	ch=xml.charAt(p1+1);
	if (ch=="/")				//	閉じタグを先に見つけてしまった
		{
		XMLError(filename,"閉じるタグが先行している");
		return 0;
		}
	//	今回取得したタグ----------------------------------------------------
	tag=xml.substring(p1+1,p2);			//	タグ全体
	tag=tag.trim();
	tbl=XML_tagsplit(tag);				//	タグを分割
	nowtag=tbl[0];						//	タグ名
	//	タグ自身のオブジェクトを生成-----------------------------------------
	isArray=false;
	if (force) isArray=true;
	if (tag.indexOf("isArray",0)!=-1) isArray=true;
	if (!(nowtag in retObj))
		{
		if (isArray)
			{
			retObj[nowtag]=new Array();
			retObj[nowtag][0]=new Object();
			setto=retObj[nowtag][0];
			}
		else{
			retObj[nowtag]=new Object();
			setto=retObj[nowtag];
			}
		}
	else{
		if (isArray)
			{
			i=retObj[nowtag].length;
			retObj[nowtag][i]=new Object();
			setto=retObj[nowtag][i];
			}
		else{
			if (retObj[nowtag] instanceof Array)
				{
				i=retObj[nowtag].length;
				retObj[nowtag][i]=new Object();
				setto=retObj[nowtag][i];
				}
			else{
				temp=clone(retObj[nowtag]);
				retObj[nowtag]=new Array();
				retObj[nowtag][0]=clone(temp);
				retObj[nowtag][1]=new Object();
				setto=retObj[nowtag][1];
				}
			}
		}
	setto.Text="";
	//	タグ自身のプロパティ------------------------------------------------
	if (tbl.length>1)
		{
		kl=tbl.length;
		for(k=1;k<kl;k++)
			{
			fld=tbl[k];
			if (fld.indexOf("isArray",0)!=-1) continue;
			if (fld.indexOf("=",0)!=-1)
				{
				flds=fld.split("=");
				fieldname=flds[0].trim();					//	プロパティ名
				fieldvalue=flds[1].trim2();					//	値（前後引用符の除去）
				setto[fieldname]=fieldvalue;
				}
			else{
				setto[fld]=true;
				}
			}
		}
	//終了タグの検索-----------------------------------------------
	pos=p2+1;
	while(1==1)
		{
		p3=xml.indexOf("<",pos);
		if (p3==-1)					//	終了タグが見つからない
			{
			XMLError(filename,"終了タグが見つからない\n"+tag);
			return 0;
			}
		p4=xml.indexOf(">",p3+1);
		if (p2==-1) 				//	終了タグが閉じていない
			{
			XMLError(filename,"終了タグが閉じていない");
			return 0;
			}
		ch=xml.charAt(p3+1);
		if (ch!="/")				//	次の開始タグを見つけてしまった
			{
			body=xml.substring(pos,p3);
			if (body!="") setto.Text+=body;
			pos=ExtractXML(filename,setto,xml,p3,force);
			continue;
			}
		//見つけた終了タグのチェック
		tag=xml.substring(p3+2,p4);
		tag=tag.trim();
		if (tag!=nowtag)		//	閉じタグの順序がおかしい
			{
			XMLError(filename,"終了タグの順序がおかしい\n"+tag+"("+(p3+2)+"-"+(p4-1)+")!="+nowtag);
			retObj.Error=true;
			return 0;
			}
		//終了タグまでの文字列をボディとする
		body=xml.substring(pos,p3);
		if (body!="")	setto.Text+=body;
		pos=p4+1;
		break;
		}
	return pos;
	}

//-------------------------------------------------------------------------------------
function MergeXML(parenttag,obj,objName,isArray)
	{
	var xml="";
	var i,j,tagbody="",inobj=false;
	/* チェックしない項目 */
	if (objName=="Temp") return "";

	/* 配列項目 */
	if (obj instanceof Array)
		{
		for(i in obj)
			{
			xml+=MergeXML(parenttag,obj[i],"",true);
			}
		return xml;
		}

	/* 単独項目 */
	if (!(obj instanceof Object))
		{
		if (parenttag=="")
			{
			xml+=obj;
			return xml;
			}
		xml="\r\n<"+parenttag;
		if (isArray) xml+=" isArray=\"True\"";
		if ((objName=="")||(objName=="Text"))	xml+=">"+obj;
		else				xml+=" "+objName+"=\""+obj+"\">";
		if (parenttag!="") xml+="</"+parenttag+">";
		return xml;
		}

	/* 複数項目 */
	if (parenttag!="") xml+="\r\n<"+parenttag;
	if (isArray) xml+=" isArray=\"True\"";
	for(i in obj)
		{
		if (obj[i] instanceof Object) continue;
		if (i=="Text") {tagbody+=obj[i];continue;}
		xml+=" "+i+"=\""+obj[i]+"\"";
		}
	if (parenttag!="") xml+=">";
	for(i in obj)
		{
		if (!(obj[i] instanceof Object)) continue;
		xml+=MergeXML(i,obj[i],i,false);
		}
	xml+=tagbody;
	if (parenttag!="") xml+="\r\n</"+parenttag+">";
	return xml;
	}
//-------------------------------------------------------------------------------------
function XMLError(filename,message)
	{
	alert("XML.JS:XML解析エラー発生：\nファイル名："+filename+"\n"+message);
	}

function XML_tagsplit(s)
	{
	var r=new Array();
	var i,c,a,tagflg,quoteflg,p;
	var sl;
	tagflg=false;quoteflg=false;p=0;
	sl=s.length;
	for(i=0;i<sl;i++)
		{
		c=s.charAt(i);
		if (!tagflg)
			{
			if (c==" ") continue;
			tagflg=true;
			quoteflg=false;
			r[p]=c;
			continue;
			}
		else{
			if (c==" ")
				{
				if (!quoteflg)
					{
					tagflg=false;	//	タグ終了
					p++;
					continue;
					}
				r[p]+=c;
				continue;
				}
			r[p]+=c;
			if (c=="\"")
				{
				if (quoteflg) quoteflg=false;else quoteflg=true;
				}
			}
		}
	return r;
	}

function clone(src)
	{
	var dest,i,prop,sl;
	if (typeof src == 'object')
		{
		if (src instanceof Array)
			{
			dest=new Array();
			sl=src.length;
			for (i=0;i<sl;i++)	dest[i] = clone(src[i]);
			}
		else{
			dest = new Object();
			for (prop in src)
				{
				dest[prop]=clone(src[prop]);
				}
			}
		}
	else{
		dest=src;
		}
	return dest;
	}
