module.exports = function (){
	return function *(next){
		this.jsonResp = jsonResp;
		yield next;
	}
}

jsonResp = function(statusCode, data){
	var ret = {};
	if(statusCode<=202){
		ret.status = "success";
	}else{
		ret.status = "fail";
	}
	ret.data = data;
	this.status = statusCode;
	this.body = ret;
}