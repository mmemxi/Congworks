var JSON;
var html = new ActiveXObject('htmlfile');
html.write('<meta http-equiv="x-ua-compatible" content="IE=11" />');
JSON = html.parentWindow.JSON;
html.close();
