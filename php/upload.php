<?php
//Base code ripped from example at https://www.w3schools.com/php/php_file_upload.asp, then modified to fit needs

$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$fileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if file already exists
if (file_exists($target_file)) {
  echo "Sorry, that name is taken.";
  $uploadOk = 0;
}

// Check file size
if ($_FILES["fileToUpload"]["size"] > 1000000000) {
  echo "Sorry, your file is too large. Reduce it below 1GB to upload.";
  $uploadOk = 0;
}

// Allow certain file formats
if($fileType != "mp4" ) {
  echo "Sorry, only mp4 files are allowed.";
  $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  echo "Your file was not uploaded because of invalid input.";
// if everything is ok, try to upload file
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    echo "The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). " has been uploaded.";
  } else {
    echo "There was an error uploading your file.";
  }
}
?>
