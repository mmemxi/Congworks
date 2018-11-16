//---------------------------------------------------------------------------
// sqlite.js
// Congworks上でSQliteのデータベースを操作するためのプログラム群
//---------------------------------------------------------------------------
// 利用条件
// ①グローバル変数
//     basepath      →   sqliteフォルダが存在する基準パス（末尾スラッシュ無）
// ②コール順序
//   SQ_Init("データベースファイル名");
//                   →   指定したファイル名を対象とする
//                        ※sqliteフォルダに存在すること
//------------------------------------------------------------
// グローバル変数
//------------------------------------------------------------
var SQ_table="";
var SQfso=new ActiveXObject("Scripting.FileSystemObject");
var SQWshShell = new ActiveXObject("WScript.Shell");
//------------------------------------------------------------
// 定数の設定
//------------------------------------------------------------
var adTypeBinary=1;
var adTypeText=2;
//-----------------------------------------------------------------------------
// Boolean SQ_Init("データベースファイル名");
//    SQliteデータベースの使用を宣言し、データベースファイルを指定する
//    戻り値：true=宣言成功   false=宣言失敗（ファイル指定無しor存在しない）
//-----------------------------------------------------------------------------
function SQ_Init(dbname)
	{
	var dir="";
	if ((dbname=="")||(dbname==null))	return false;
	SQ_table=dbname;
	return true;
	}
//-----------------------------------------------------------------------------
// String SQ_Folder()
//     SQlite基準フォルダ名を返す
//-----------------------------------------------------------------------------
function SQ_Folder()
	{
	return SQfso.GetParentFolderName(basepath);
	}
//-----------------------------------------------------------------------------
// String SQ_TempFolder()
//     SQlite用の一時フォルダ名を返す（なければ生成する）
//-----------------------------------------------------------------------------
function SQ_TempFolder()
	{
	var dir="c:\\temp\\quicky\\sqlite";
	if (!SQfso.FolderExists(dir)) SQfso.CreateFolder(dir);
	return dir;
	}
//-----------------------------------------------------------------------------
// Array SQ_Read("テーブル名","WHERE句","ORDER句");
//      指定したテーブルからレコードを読み取り、戻り値の配列として返す
//      戻り値：オブジェクト配列（配列長＝レコード数、要素ごとの属性＝フィールド）
//-----------------------------------------------------------------------------
function SQ_Read(sql_table,sql_where,sql_order)
	{
	var i=0,s,sql,buf;
	var result=new Array();

	//	初期化していなければエラー
	if (SQ_table=="") return result;

	//	入出力ファイル名の準備
	var cd=SQWshShell.CurrentDirectory;
	var now=new Date();
	var filetime=now.getMinutes()*100000+now.getSeconds()*1000+now.getMilliseconds();
	var inpfile=SQ_TempFolder()+"SQLin"+filetime+".txt";
	var outfile=SQ_TempFolder()+"SQLout"+filetime+".txt";
	var outfilex=outfile.replace(/\\/g, '\\\\');

	//	SQLコマンドファイルの準備
	var cmd="cmd.exe /c sqlite3.exe "+SQ_table+" <"+inpfile;
	sql="select * from "+sql_table;
	if (sql_where!="") sql+=" where "+sql_where;
	if (sql_order!="") sql+=" order by "+sql_order;
	sql+=";"
	buf=".headers on\n.mode tab\n.output "+outfilex+"\n"+sql+"\n";
	SQ_WriteUTF8(inpfile,buf);

	//	SQliteの実行
	SQWshShell.CurrentDirectory=SQ_Folder();
	SQWshShell.Run(cmd,0,true);
	SQWshShell.CurrentDirectory=cd;

	//	処理結果の取得
	buf=SQ_ReadUTF8(outfile);
	if (SQfso.FileExists(inpfile)){try{SQfso.DeleteFile(inpfile,true);}catch(e){}};
	if (SQfso.FileExists(outfile)){try{SQfso.DeleteFile(outfile,true);}catch(e){}};

	//	処理結果の分解
	if (buf=="") return result;
	var tbl=buf.split("\n");
	if (tbl.length<=1) return result;
	var line=tbl[0].split("\t");		//	先頭行の分解（タブ）
	var fields=new Array();
	for(i=0;i<line.length;i++)	fields[i]=line[i];		//	先頭行のフィールド一覧取得

	for(i=1;i<buf.length;i++)
		{
		if (tbl[i]=="") break;
		line=tbl[i].split("\t");
		result[i-1]=new Object();
		for(j=0;j<fields.length;j++)
			{
			s=fields[j];
			result[i-1][s]=line[j];
			}
		}
	return result;
	}
//-----------------------------------------------------------------------------
// Void SQ_Exec("SQL文字列");
//      指定したSQL文をまとめて実行する。
//      渡したのが配列なら連続実行、渡したのが文字列なら単独実行
//-----------------------------------------------------------------------------
function SQ_Exec(sqlArray)
	{
	var i=0,s,o,sql,buf="";

	//	初期化していなければエラー
	if (SQ_table=="") return;

	//	入出力ファイル名の準備
	var cd=SQWshShell.CurrentDirectory;
	var now=new Date();
	var filetime=now.getMinutes()*100000+now.getSeconds()*1000+now.getMilliseconds();
	var inpfile=SQ_TempFolder()+"SQLin"+filetime+".txt";

	//	SQLコマンドファイルの準備
	var cmd="cmd.exe /c sqlite3.exe "+SQ_table+" <"+inpfile;
	if (sqlArray instanceof Array)		//	配列を渡した場合
		{
		for(i=0;i<sqlArray.length;i++)
			{
			buf+=sqlArray[i]+"\n";
			}
		}
	else{								//	単独文字列の場合
		buf+=sqlArray+"\n";
		}
	SQ_WriteUTF8(inpfile,buf);

	//	SQliteの実行
	SQWshShell.CurrentDirectory=SQ_Folder();
	SQWshShell.Run(cmd,0,true);
	SQWshShell.CurrentDirectory=cd;
//	if (SQfso.FileExists(inpfile)){try{SQfso.DeleteFile(inpfile,true);}catch(e){}};
	}
//-----------------------------------------------------------------------------
function SQ_Insert(sql_table,writeObj)
	{
	var i,j,k,s,sql,buf;
	var v1,v2;
	if (writeObj instanceof Array)
		{
		sql=new Array();
		sql.push("BEGIN TRANSACTION;");
		for(i=0;i<writeObj.length;i++)
			{
			v1="";v2="";
			s="INSERT INTO "+sql_table;
			k=0;
			for(j in writeObj[i])
				{
				if (k!=0) {v1+=",";v2+=",";}
				v1+=j;
				v2+="\""+writeObj[i][j]+"\"";
				k++;
				}
			buf=s+"("+v1+") VALUES("+v2+");";
			sql.push(buf);
			}
		sql.push("COMMIT;");
		}
	else{
		sql="";
		v1="";v2="";
		s="INSERT INTO "+sql_table;
		k=0;
		for(j in writeObj)
			{
			if (k!=0) {v1+=",";v2+=",";}
			v1+=j;
			v2+="\""+writeObj[j]+"\"";
			k++;
			}
		sql=s+"("+v1+") VALUES("+v2+");";
		}
	SQ_Exec(sql);
	}
//-----------------------------------------------------------------------------
function SQ_Replace(sql_table,writeObj)
	{
	var i,j,k,s,sql,buf;
	var v1,v2;
	if (writeObj instanceof Array)
		{
		sql=new Array();
		sql.push("BEGIN TRANSACTION;");
		for(i=0;i<writeObj.length;i++)
			{
			v1="";v2="";
			s="REPLACE INTO "+sql_table;
			k=0;
			for(j in writeObj[i])
				{
				if (k!=0) {v1+=",";v2+=",";}
				v1+=j;
				v2+="\""+writeObj[i][j]+"\"";
				k++;
				}
			buf=s+"("+v1+") VALUES("+v2+");";
			sql.push(buf);
			}
		sql.push("COMMIT;");
		}
	else{
		sql="";
		v1="";v2="";
		s="REPLACE INTO "+sql_table;
		k=0;
		for(j in writeObj)
			{
			if (k!=0) {v1+=",";v2+=",";}
			v1+=j;
			v2+="\""+writeObj[j]+"\"";
			k++;
			}
		sql=s+"("+v1+") VALUES("+v2+");";
		}
	SQ_Exec(sql);
	}
//-----------------------------------------------------------------------------
function SQ_Update(sql_table,writeObj,wherestr)
	{
	var i,j,k,s,sql;
	var v1,v2;
	if (writeObj instanceof Array)
		{
		sql=new Array();
		sql.push("BEGIN TRANSACTION;");
		for(i=0;i<writeObj.length;i++)
			{
			s="UPDATE "+sql_table+"SET ";
			k=0;
			for(j in writeObj[i])
				{
				if (k!=0) s+=",";
				s+=j+"=\""+writeObj[i][j]+"\"";
				k++;
				}
			if (wherestr!="") s+=" WHERE "+wherestr;
			sql.push(s);
			}
		sql.push("COMMIT;");
		}
	else{
		sql="";
		s="UPDATE "+sql_table+"SET ";
		k=0;
		for(j in writeObj)
			{
			if (k!=0) s+=",";
			s+=j+"=\""+writeObj[j]+"\"";
			k++;
			}
		if (wherestr!="") s+=" WHERE "+wherestr;
		sql=s;
		}
	SQ_Exec(sql);
	}
//-----------------------------------------------------------------------------
function SQ_Delete(sql_table,sql_where)
	{
	var sql="DELETE FROM "+sql_table;
	if (sql_where!="") sql+=" WHERE "+sql_where;
	sql+=";"
	SQ_Exec(sql);
	}
//------------------------------------------------------------
function SQ_ReadUTF8(filename)
	{
	var buf;
	var ADODB=new ActiveXObject("ADODB.Stream");
	ADODB.Charset="UTF-8";
	try	{
		ADODB.Open();
		ADODB.LoadFromFile(filename);
		buf=ADODB.ReadText(-2);
		ADODB.Close();
		}
	catch(e){buf="";}
	return buf;
	}
//------------------------------------------------------------
function SQ_WriteUTF8(filename,buffer)
	{
	var ADODB=new ActiveXObject("ADODB.Stream");
	ADODB.Type=adTypeText;
	ADODB.Charset='UTF-8';
	ADODB.Open();
	ADODB.WriteText(buffer,0);
	ADODB.Position=0;
	ADODB.Type=adTypeBinary;
	ADODB.Position=3;
	var bin=ADODB.Read();
	ADODB.close();
	ADODB.Type=adTypeBinary;
	try	{
		ADODB.Open();
		ADODB.Write(bin);
		ADODB.SaveToFile(filename);
		ADODB.Close();
		}
	catch(e){return false;}
	return true;
	}
//---------------------------------------------------------------------------
function ReadJSON(key1,key2,key3)
	{
	var cwhere="";
	var v,i,s;
	var jstr;
	var result=new Array();
	i=0;
	cwhere="key1='"+key1+"' and key2='"+key2+"' and key3='"+key3+"'";
	jstr=SQ_Read("JSON",cwhere,"");
	if (jstr.length==0) return "";
	s=jstr[0].body.replace(/'/g, '\"');
	result=JSON.parse(s);
	return result;
	}
//---------------------------------------------------------------------------
function WriteJSON(key1,key2,key3,obj)
	{
	var wobj=new Object();
	wobj.key1=key1;
	wobj.key2=key2;
	wobj.key3=key3;
	wobj.body=JSON.stringify(obj).replace(/\"/g,"'");
	SQ_Replace("JSON",wobj);
	}
