//---------------------------------------------------------
// getPublicLogs()
// ��O�p���̃��X�g���擾���Ė߂�l�ɕԂ�
// �������ȗ�����ƑS���̔z����A�������w�肷��Ƃ��̋�悾���̃I�u�W�F�N�g��Ԃ��B
// PublicList�e�[�u������擾��������(num,name,kubun,maps,refuses,buildings,persons,inuse,userid,startday,endday,limitday)�ɉ����A
// .Lastuse  �ŏI�g�p���i�g�p���Ȃ�J�n���A���g�p�Ȃ�O��I�����j
// .Blank    �����i�g�p���Ȃ�J�n�����獡���܂ŁA���g�p�Ȃ�O��I�����獡���܂ł̓����j
// .Avail    �g�p�\��(true/false/disable�A�g�p���Ȃ���false�A���g�p�Ȃ�����ɉ����Ďg�p�s��(disable)/�g�p�\(true)�j
// .Status   ��ԕ�����i�g�p���Ȃ炢����J�n���A���g�p�Ȃ牽���O���炩�j
//---------------------------------------------------------
function getPublicLogs(num=0)
	{
	var now=new Date();
	var today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
	var i,cobj,num;
	var robj=new Array();
	var cwhere="congnum="+congnum;
	if (num!=0) cwhere+=" and num="+num;
	var ctbl=SQ_Read("PublicList",cwhere,"num");

	for(i=0;i<ctbl.length;i++)
		{
		cobj=ctbl[i];
		num=cobj.num;
		//	�g�p���̋��-----------------------------------------------
		if (cobj.inuse=="true")
			{
			cobj.Lastuse=cobj.startday;
			cobj.Blank=CalcDays(cobj.startday,"");					//	�g�p����
			cobj.Avail="false";										//	�g�p�\���m��
			cobj.Status="�g�p��("+cobj.userid+"�F"+cobj.startday.substring(4,6)+"/"+cobj.startday.substring(6,8)+"�`�j";
			}
		//	���g�p�̋��-----------------------------------------------
		else{
			cobj.Lastuse=cobj.endday;
			cobj.Blank=CalcDays(cobj.endday,"");					//	�g�p����
			if (isCampeign(today))			//	�L�����y�[����
				{
				if (cobj.Blank<ConfigAll.BlankCampeign) cobj.Avail="disable";else cobj.Avail="true";
				}
			else{
				if (isAfterCampeign(today))	//	����߰݊��Ԍ�30��
					{
					if (cobj.Blank<ConfigAll.BlankAfterCampeign) cobj.Avail="disable";else cobj.Avail="true";
					}
				else{						//	�ʏ�̊���
					if ((cobj.Blank<ConfigAll.BlankMin)&&(cobj.Blank!=-1)) cobj.Avail="disable";else cobj.Avail="true";
					}
				}
			cobj.Status="���g�p("+cobj.Blank+"���O)";
			if (isBeforeCampeign(today))
				{
				cobj.Status="����߰ݏ�������("+cobj.Blank+"���O)";
				cobj.Avail="false";
				}
			}
		robj[num]=clone(ctbl[i]);
		}
	if (num==0) return ctbl[0];
		else	return robj;
	}

