<?php

//uniqid provides an unique identifier for each uploaded trace file 
$uniqueIdentifier = uniqid();

//creates a directory to store data per session
$dataDirectory = "./traces/Trace_$uniqueIdentifier";
mkdir($dataDirectory);

$originalTraceFileName = $_FILES['file']['name'];

//holds the trace file name to be stored into the server
$traceFileName = $dataDirectory . DIRECTORY_SEPARATOR . "Trace_"
        . $uniqueIdentifier . '_' . basename($originalTraceFileName);

if (move_uploaded_file($_FILES['file']['tmp_name'], $traceFileName)) {

    $traceUploadDate = date('m/d/Y h:i:s a', time());

    //session variables
    $_SESSION['originalTraceFileName'] = $originalTraceFileName;
    $_SESSION['$traceFileName'] = $traceFileName;
    $_SESSION['dataDirectory'] = $dataDirectory;
    $_SESSION['traceUploadDate'] = $traceUploadDate;

    //calls mmt_probe to obtain the processsed trace (csv file) 
    processDataWithMMTProbe();
} else {
    die("Upload failed");
}

function processDataWithMMTProbe() {

    $traceFileName = $_SESSION['$traceFileName'];
    $dataDirectory = $_SESSION['dataDirectory'];
    $originalTraceFileName = $_SESSION['originalTraceFileName'];
    $traceUploadDate = $_SESSION['traceUploadDate'];
    

    //Test script, to be subsituted by real mmt probe
    $mmt_probe = './probe/MMTProbe.py';

    //get the fileName with no extension and append it to .csv
    //  to name the file that mmt_probe will produce
    $statisticsCSVFileName =
            pathinfo($traceFileName, PATHINFO_FILENAME) . "_Result" . '.csv';

    $outputCSVFile = realpath($dataDirectory) . DIRECTORY_SEPARATOR .
            $statisticsCSVFileName;

    //compose the command to execute
    $cmd = realpath($mmt_probe) . " " .
            realpath($traceFileName) . " " .
            $outputCSVFile;

    //$outputCode contains the command output in an Array form   
    exec($cmd, $outputCode, $return);

    if ($return == 0) {

        $csvArray = convertCSVFileToArray($outputCSVFile);
        
        $numberOfEntries = $_SESSION['numberOfEntries'];

        $csvData = array(
            'traceFileName' => $originalTraceFileName,
            'numberOfEntries' => $numberOfEntries,
            'traceuploadDate' => $traceUploadDate,
            'data' => $csvArray
        );
        echo json_encode($csvData);
    } else {
        die("Error Processing Trace: $return.");
    }
}

function convertCSVFileToArray($csvFile) {
    $fileHandler = fopen($csvFile, 'r') or die("File Error");
    $csvArray = array();
    $numberOfEntries = 0;

    while ($line = fgetcsv($fileHandler, 1024, ",")) {
        array_push($csvArray, $line);
        $numberOfEntries++;
    }
    //stores the number of entries in file
    //it is done here not to loop through the file again
    $_SESSION['numberOfEntries'] = $numberOfEntries;

    fclose($fileHandler);

    return $csvArray;
}

?>
