//---------------------------------------------------------------
function PDFPrint(pdffile)
	{
	var now=new Date();
	var sfile,dfile,pfile;
	var PDFPrintSys=fso.FileExists(QueFolder()+"waiting.txt");
	if (pdffile=="")
		{
		sfile=LocalFolder()+"que.pdf";
		dfile=LocalFolder()+"que"+(now.getMinutes()*100000+now.getSeconds()*1000+now.getMilliseconds())+".pdf";
		fso.CopyFile(sfile,dfile,true);
		}
	else dfile=pdffile;

	if (fso.FolderExists(PDFXCFolder()))
		{
		if (PDFPrintSys)
			{
			pfile=QueFolder();
			fso.CopyFile(dfile,pfile,true);
			}
		else{
			WshShell.CurrentDirectory=PDFXCFolder();
			cmd="PDFXCview.exe /print \""+dfile+"\"";
			WshShell.Run(cmd,0,false);
			}
		}
	else{
		cmd="\""+dfile+"\"";
		WshShell.Run(cmd,0,false);
		}
	WshShell.CurrentDirectory=basepath;
	}
