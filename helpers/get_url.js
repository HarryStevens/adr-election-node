module.exports.candidates = function(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=candidates_analyzed&sort=candidate#summary"
}
module.exports.itr = function(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=filed_itr&sort=candidate#summary"
}
module.exports.no_pan = function(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=without_pan&sort=candidate#summary"
}
module.exports.recontest = function(id){
	return "http://myneta.info/" + id + "/index.php?action=recontestAssetsComparison"
}
module.exports.serious_cases = function(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=serious_crime&sort=candidate#summary"
}
module.exports.women = function(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=women_candidate&sort=candidate#summary"
}