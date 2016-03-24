<?php
$filename=$_REQUEST['csv_file_name'];
header("Content-type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"".$filename."\"");
$data=stripcslashes($_REQUEST['csv_text']);
echo $data; 
?>