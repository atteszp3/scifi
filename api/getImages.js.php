<?php
header('Content-Type: application/javascript; charset=utf-8');

$dir = __DIR__ . "/../images/";

if (!is_dir($dir)) {
    echo "console.error('Images folder missing');";
    exit;
}

$allowed = ['png','jpg','jpeg','webp','gif'];
$files = scandir($dir);

$list = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (in_array($ext, $allowed, true)) {
        $list[] = $file;
    }
}

echo "let images={};let loaded=0;let total=" . count($list) . ";\n\n";

foreach ($list as $file) {

    $name = pathinfo($file, PATHINFO_FILENAME);
    $path = "/images/" . $file;

    echo "images['$name']=new Image();\n";
    echo "images['$name'].src='$path';\n";

    echo "images['$name'].onload=function(){loaded++;if(loaded===total){if(window.onImagesReady)onImagesReady(images);}};\n\n";
}

echo "window.images=images;";