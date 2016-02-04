upload_file : function(req, res) {
  var fs = require('fs');
  console.log(req.files);

  fs.readFile(req.files.upload.path, function (err, data) {
    var newPath = 'assets/files/' + req.files.upload.name;
      fs.writeFile(newPath, data, function (err) {
      if (err) res.view({err: err});
        html = "";
        html += "<script type='text/javascript'>";
        html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += "    var url     = \"/files/" + req.files.upload.name + "\";";
        html += "    var message = \"Uploaded file successfully\";";
        html += "";
        html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
        html += "</script>";

        res.send(html);
    });

  });
}