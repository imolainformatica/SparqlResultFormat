<?php
$filename=$_REQUEST['png_file_name'];
$base64strImg=$_POST['png_string']; 
$data = explode(',', $base64strImg);
header("Content-Disposition: attachment; filename=\"".$filename."\"");
header('Content-Type: application/force-download'); 
echo base64_decode($data[1]);
?>