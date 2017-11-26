///////////////////////////////////////////////////////////////
function login_load(){
	document.forms.form_login.usrid.focus();
	if (document.all.JITDSignOcx.object == null) {
		alert("USB KEY control has not installed! Please download the control and refresh the page after installation! ");
		return;
	}
}
////////////////////////////////////////////////////////////////////////////////////
function doDetachSign(DSign_Subject,sign_form,DSign_Content){
	var result = false;
	//DSign_Content="<?xml version=\"1.0\" encoding=\"UTF-8\"?><R xml:lang=\"zh\"><S><V k=\"loginName\"><T>login name£º</T><D>Luo Yang!"+DSign_Content+"</D></V></S></R>";
	//var DSign_Subject="";		
			if(doValidateCer(DSign_Subject)){
				var temp_DSign_Result = JITDSignOcx.DetachSignStr(DSign_Subject, DSign_Content); //DetachSignSTR
				if(JITDSignOcx.GetErrorCode()!=0){
					alert("Error Code"+JITDSignOcx.GetErrorCode()+"¡¡Error Message£º"+JITDSignOcx.GetErrorMessage(JITDSignOcx.GetErrorCode()));	
				 }else{
					if(temp_DSign_Result!="")
					{
						result=true;
						sign_form.value=temp_DSign_Result;
					}
					else{
						alert("USB KEY signature is empty£¡");
					}
					
				 }	
			}
	return result;
}

////////////////////////////////////////////////////////////////////////////////////
function doValidateCer(DSign_Subject){
    var result = true;
    //var strAlg = "SHA256";
    var strAlg = "SHA1";
   	JITDSignOcx.SetAlgorithm(strAlg, "");
    JITDSignOcx.SetCertChooseType(1);
    JITDSignOcx.SetCert("SC", DSign_Subject, "", "", "", "");


	if(JITDSignOcx.GetErrorCode()!=0){
	    alert("Error Code£º"+JITDSignOcx.GetErrorCode()+"¡¡Error Message£º"+JITDSignOcx.GetErrorMessage(JITDSignOcx.GetErrorCode()));
	    result = false;
	}
	return result;
}

////////////////////////////////////////////////////////////////////////////////////
function doValidata(){
	if(doValidateCer(DSign_Subject)){
		alert("Pass");
	}
	else{
		alert("Ukey is not detected!");
	}
}

////////////////////////////////////////////////////////////////////////////////////
function isContentNULL(obj){
	if(obj.value==""){
		return true;
	}else{
		return false;
	}
}

/////////////////////////////////////////////////////////////////////////////////
function sendData(url){
	var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  	xmlhttp.Open("post", url, false);//Submitting requests to JSP
  	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  	xmlhttp.setRequestHeader("Cache-Control","no-cache");
  	xmlhttp.setRequestHeader("If-Modified-Since","0");
  	xmlhttp.Send();
  	var xml=bytes2BSTR(xmlhttp.responseBody);//Getting results fromJSP
  	xml=xml.replace(/[\r\n]/g,"");
  	xml=xml.replace(/^\s+|\s+$/g,"");
	return xml;
  	
}
//////////////////////////////////////////////////////////////////////////////////
function show_detail(id,ifopen){
	if(ifopen =="open"){
		document.getElementById("img_"+id).src="./img/zhedie.gif";
		document.getElementById("img_"+id).onclick=Function("show_detail('"+id+"','close')");
		document.getElementById("detail_"+id).style.display="";
		document.getElementById("img_"+id).title="Click-retrive details of payment information ";
	}
	else{
		document.getElementById("img_"+id).src="./img/zhankai.gif";
		document.getElementById("img_"+id).onclick=Function("show_detail('"+id+"','open')");
		document.getElementById("img_"+id).title="click+view details of payment information ";
		document.getElementById("detail_"+id).style.display="none";
	}
}
//////////////////////////////////////////////////////////////////////////////////
function do_process(id,updstat){

	var table=document.getElementById("list");
	var rowindex=document.getElementById("list_"+id).rowIndex;
	var result=sendData("process.jsp?paybillno="+id+"&updstat="+updstat);
	if(result=="OK"){
		//alert("Payment instruction number: "+id+" is successful audited");
		table.deleteRow(rowindex);
		table.deleteRow(rowindex);
		return true;
	}
	else{
		//alert("Payment instruction number: "+id+" is fail, Please re query the list to be audited");
		return false;
	}
	
}

function process_one(id,DSign_Subject,updstat){
	if(!doValidateCer(DSign_Subject)){
		return false;
	}
	if(do_process(id,updstat)){
		alert("Payment instruction number: "+id+" is successful");
	}
	else{
		alert("Payment instruction number: "+id+" is fail, Please re query the list to be audited");
	}
	
}
/////////////////////////////////////////////////////////////////
function process_batch(DSign_Subject,updstat){
	
	if(confirm("Confirm payment instructions selected by batch audit£¿")){
	}
	else{
		return false;
	}

	if(!doValidateCer(DSign_Subject)){
		return false;
	}
	//openload();
	var num=0;
	var seclist="";
	var faillist="";
	var retmsg=""
	var elem=document.getElementsByTagName("input");
	for(var i=0; i<elem.length; i++) 
	{
		if(elem[i].checked && elem[i].id != "checkbox_all" && elem[i].type=="checkbox"){
			num=num+1;
			var proid=elem[i].id.replace("checkbox_","");
			var result=do_process(proid,updstat);
			if(result){
				seclist=seclist+proid+" ";
				i--;
			}
			else{
				faillist=faillist+proid+" ";
			}
		}
	}
	
	if(num==0){
		alert("You haven't chosen any payment instructions yet£¡");
	}
	else{
		if(seclist!=""){
			retmsg="Payment instructions£º"+seclist+" are sucessful audited£¡\n";
		}
		if(faillist!=""){
			retmsg=retmsg+"Payment instructions£º"+faillist+" are failed£¡";
		}
		alert(retmsg);
	}
	//closeload();
	
}
////////////////////////////////////////////
function login(){
	var DN=sendData("getUid.jsp?usrid="+document.form_login.usrid.value);
	if(DN.substr(0,3) == "Err")
	{
		alert(DN.substr(3));
		return false;
	}
	else{
		var result=eval(DN);
		//var sign_content="<?xml version=\"1.0\" encoding=\"UTF-8\"?><R xml:lang=\"zh\"><S><V k=\"loginName\"><T>Login Name£º</T><D>"+result[0].CUSNAM+"</D></V></S></R>";
		var sign_content=result[0].signorg;
		document.form_login.signorg.value=sign_content;
		if(doDetachSign(result[0].DN,document.form_login.signData,sign_content))
			return true;
		else
			return false;
	}
}
//////////////////////////////////////////////////////////////////////
function resetall(formObj){
	var formEl = formObj.elements; 
    for (var i=0; i<formEl.length; i++) 
    { 
        var element = formEl[i]; 
        if (element.type == "text") { element.value = ""; }
        else if (element.type == "select-one"){
        	element.options[0].selected=true;
        }
    } 
    return false;

}
///////////////////////////////////////////////////////////////
function selectall(sel){
	var elem =document.getElementsByTagName("input");
	for(var i=0; i<elem.length; i++) 
	{
		if(elem[i].type=="checkbox")
		{
			elem[i].checked=sel;
		}
	}

}
///////////////////////////////////////////////////////////
function docheck(sel){
	if(!sel)
		document.getElementById("checkbox_all").checked=false;
}



/////////////////////////////////////////////////////////////
function openload() {
    var iWidth =Math.max(document.documentElement.clientWidth,document.body.clientWidth);
    var iHeight = Math.max(document.documentElement.clientHeight,document.documentElement.scrollHeight);

    var bgObj = document.createElement("div");
    bgObj.id = "bgdiv";
    bgObj.style.cssText = "position:absolute;left:0px;top:0px;width:" + iWidth + "px;height:" + iHeight + "px;filter:Alpha(Opacity=5);opacity:0.3;background-color:#000000;z-index:1001;";
    document.body.appendChild(bgObj);
    
    var loadObj = document.createElement("div");
    loadObj.id = "loaddiv";
    loadObj.style.cssText = "position:absolute;z-index:1002;left:" + (iWidth/2-100) +"px;top:"+(iHeight+document.documentElement.scrollTop)/2+"px;";
    document.body.appendChild(loadObj);
    document.getElementById("loaddiv").innerHTML="<img src=\"./img/loadingAnimation.gif\"></img>";
    //document.getElementById("load").style.left=iWidth/2-100+"px";
    //document.getElementById("load").style.top=(iHeight+document.documentElement.scrollTop)/2+"px";
    //document.getElementById("load").style.display = "";

    //alert("aa");
    //closeload();
}
function closeload() {
    document.body.removeChild(document.getElementById("bgdiv"));
    document.body.removeChild(document.getElementById("loaddiv"));
}
///////////////////////////////////////////////////////////
function processAccount(account,usrid,action){
	var result=sendData("processAccount.jsp?account="+account+"&usrid="+usrid+"&action="+action);
	if(result=="OK"){
		alert("Successful£¡");
		return true;
	}
	else{
		alert("Failed£¡Error Reason:"+result);
		return false;
	}
}
///////////////////////////////////////////////////////////////
function DeleteUser(usrid,action){
	if(usrid=="admin"){
		alert("Cannot delete the system operator£¡");
		return false;
	}
	if(!confirm("After the operator is deleted, the binding relationship with the account will also be deleted £¡Sure£¿")){
		return false;
	}
	var result=sendData("processManager.jsp?usrid="+usrid+"&action="+action);
	if(result=="OK"){
		alert("Successful£¡");
		return true;
	}
	else{
		alert("Failed£¡Error reason:"+result);
		return false;
	}
}
///////////////////////////////////////////////////////////
function DeleteAccount(account){
	if(!confirm("When the account is deleted, its binding relationship with the operator will also be deleted £¡Sure£¿")){
		return false;
	}
	var result=sendData("processManager.jsp?account="+account+"&action=del_account");
	if(result=="OK"){
		alert("Successful£¡");
		return true;
	}
	else{
		alert("Failed£¡Error reason:"+result);
		return false;
	}
}
////////////////////////////////////////////////////////////////
function custyp_chg(value){
	if(value==1||value==2||value==5||value==6){
		document.getElementById("passtyp_add").disabled="";
		document.getElementById("passno_add").readOnly="";
		document.getElementById("kid_add").readOnly="";
	}
	else{
		document.getElementById("passtyp_add").value="";
		document.getElementById("passtyp_add").disabled="true";
		document.getElementById("passno_add").value="";
		document.getElementById("passno_add").readOnly="readonly";
		document.getElementById("kid_add").value="";
		document.getElementById("kid_add").readOnly="readonly";
	}
}
////////////////////////////////////////////////////////////////////////
function AddUser(){
	var cusidt_add=document.getElementById("cusidt_add").value;
	var usrid_add=document.getElementById("usrid_add").value;
	var cusnam_add=document.getElementById("cusnam_add").value;
	var custyp_add=document.getElementById("custyp_add").value;
	var passtyp_add=document.getElementById("passtyp_add").value;
	var passno_add=document.getElementById("passno_add").value;
	var kid_add=document.getElementById("kid_add").value;
	if(cusidt_add==""||usrid_add==""||cusnam_add==""||custyp_add==""){
		alert("£¡");
		return false;
	}
	if(custyp_add=="1"||custyp_add=="2"){
		if(passtyp_add==""||passno_add==""||kid_add==""){
			alert("Incomplete information£¡");
			return false;
		}
	}
	var result=sendData("processManager.jsp?usrid="+usrid_add+"&cusidt="+cusidt_add+"&cusnam="+cusnam_add+"&custyp="+custyp_add+"&passtyp="+passtyp_add+"&passno="+passno_add+"&kid="+kid_add+"&action=add_user");
	if(result=="OK"){
		alert("Successful£¡");
		return true;
	}
	else{
		alert("Failed£¡Error reason:"+result);
		return false;
	}
}
/////////////////////////////////////////////////////////////////
function AddAccount(){
	var account_add=document.getElementById("account_add").value;
	var curcde_add=document.getElementById("curcde_add").value;
	var cusidt_add_acc=document.getElementById("cusidt_add_acc").value;
	var accnam_add=document.getElementById("accnam_add").value;
	var orgnam_add=document.getElementById("orgnam_add").value;
	if(account_add==""||accnam_add==""||orgnam_add==""||cusidt_add_acc==""){
		alert("Incomplete information£¡");
		return false;
	}

	var result=sendData("processManager.jsp?account="+account_add+"&curcde="+curcde_add+"&cusidt="+cusidt_add_acc+"&accnam="+accnam_add+"&orgnam="+orgnam_add+"&action=add_account");
	if(result=="OK"){
		alert("Successful£¡");
		return true;
	}
	else{
		alert("Failed£¡Error reason:"+result);
		return false;
	}
}

////////////////////////////////////////////////////////////////////
function chgpwd() {
	var pwd1=document.getElementById("pwd1").value;
	var pwd2=document.getElementById("pwd2").value;
	if(pwd1 != pwd2){
		alert("Entered passwords differ£¡");
		return false;
	}
	if(pwd1 == ""){
		alert("Password cannot be empty£¡");
		return false;
	}
	var result=sendData("chgpwd.jsp?password="+pwd1+"&password1="+pwd2);
	if(result=="OK"){
		alert("Password modification succeeded£¡");
		return true;
	}
	else{
		alert("Password modification failed! The landing may be invalid. Please login again!");
		return false;
	}

}
///////////////////////////////////////////////////////////////////
function changepayres(id){
	var payresult=document.getElementById("payresult_"+id);
	var faildesc=document.getElementById("faildesc_"+id);
	if(payresult.value =="01"){
		faildesc.value="";
		faildesc.readOnly="readonly";
	}
	else if(payresult.value =="02"){
		faildesc.readOnly="";
	}
}
////////////////////////////////////////////////////////////////////////
function process_pay(id){

	var payresult=document.getElementById("payresult_"+id).value;
	var paydat=document.getElementById("paydat_"+id).value;
	var faildesc=document.getElementById("faildesc_"+id).value;
	
	if(paydat=="")
	{
		alert("Please enter payment time!");
		return false;
	}
	var result=sendData("processpay.jsp?paybillno="+id+"&payresult="+payresult+"&paydat="+paydat+"&faildesc="+faildesc);
	if(result=="OK"){
		alert("Payment instruction number: "+id+" Update successful!");
		query_form.submit();
		return true;
	}
	else{
		alert("Payment instruction number: "+id+" Update failed!");
		return false;
	}
	
}
/////////////////////////////////////////////////////////////////////////////

function printComm(id_str){
	var sdata=document.all.item("detail_"+id_str);
	
	window.showModalDialog("PrintDetail.jsp",sdata,"dialogWidth:"+850+"px;dialogHeight:"+500+"px;center:yes;help:no;status:no;");

}
function loadprint(){
	var obj = window.dialogArguments
	window.document.body.innerHTML=obj.innerHTML;
	
	var table=document.getElementById("detail_table");
	var tr=document.getElementById("processpay");
	if(tr!=null){
		var rowindex=document.getElementById("processpay").rowIndex;
		table.deleteRow(rowindex);
		table.deleteRow(rowindex);
	}
	document.getElementById("close_bt").style.display="";
	document.getElementById("print_bt").onclick=Function("window.print();");
}
/////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////////////////
